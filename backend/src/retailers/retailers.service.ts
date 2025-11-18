import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { QueryRetailersDto } from './dto/query-retailers.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';

/**
 * RetailersService: Business logic for retailer operations
 *
 * What this service does:
 * 1. List retailers (with pagination, search, filters, caching)
 * 2. Get single retailer details
 * 3. Update retailer (with authorization and cache invalidation)
 *
 * Key patterns used:
 * - Cache-aside pattern for performance
 * - Authorization checks (SR can only access assigned retailers)
 * - N+1 prevention with Prisma includes
 * - Offset pagination (simple and effective)
 *
 * Security rules:
 * - Admin can see all retailers
 * - SR can only see assigned retailers
 * - SR can only update assigned retailers
 */
@Injectable()
export class RetailersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * List retailers for a user (SR or Admin)
   *
   * Flow:
   * 1. Build cache key based on user and query params
   * 2. Try to get from cache (fast path)
   * 3. If cache miss, query database
   * 4. Apply filters (region, area, search, etc.)
   * 5. Pagination (offset = (page-1) * limit)
   * 6. Include relations to avoid N+1 queries
   * 7. Cache result for 5 minutes
   * 8. Return data with pagination metadata
   *
   * @param userId - User ID from JWT token
   * @param userRole - User role ('ADMIN' or 'SR')
   * @param query - Query parameters (page, limit, search, filters)
   * @returns Paginated list of retailers
   */
  async findAll(userId: number, userRole: string, query: QueryRetailersDto) {
    const { page = 1, limit = 20, search, region, area, distributor, territory } = query;

    // Calculate offset for pagination
    // page=1 → offset=0 (skip 0 items)
    // page=2 → offset=20 (skip 20 items)
    // page=3 → offset=40 (skip 40 items)
    const skip = (page - 1) * limit;

    // Build cache key (unique per user and query)
    const cacheKey = `retailers:user:${userId}:page:${page}:limit:${limit}:search:${search || ''}:region:${region || ''}:area:${area || ''}:dist:${distributor || ''}:terr:${territory || ''}`;

    // Try cache first (fast path: 1-2ms)
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - query database (slow path: 20-50ms)

    // Build where clause based on role and filters
    const where: any = {};

    // Authorization: SRs only see assigned retailers
    if (userRole === 'SR') {
      where.assignments = {
        some: { salesRepId: userId },
      };
    }
    // Admins see all retailers (no assignment filter)

    // Apply search filter (searches name, phone, UID)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },      // Case-insensitive name search
        { phone: { contains: search } },                           // Phone search
        { uid: { contains: search, mode: 'insensitive' } },       // UID search
      ];
    }

    // Apply geographic filters
    if (region) where.regionId = region;
    if (area) where.areaId = area;
    if (distributor) where.distributorId = distributor;
    if (territory) where.territoryId = territory;

    // Execute query with pagination
    // Use Promise.all to run count and data queries in parallel (faster!)
    const [total, data] = await Promise.all([
      // Count total matching retailers (for pagination metadata)
      this.prisma.retailer.count({ where }),

      // Fetch paginated data
      this.prisma.retailer.findMany({
        where,
        skip,
        take: limit,
        include: {
          // Include relations to avoid N+1 queries
          // Without this: 1 query for retailers + N queries for regions = N+1 problem
          // With this: 1 query with JOINs = efficient
          region: true,
          area: true,
          distributor: true,
          territory: true,
        },
        orderBy: [
          { updatedAt: 'desc' },  // Most recently updated first
          { id: 'asc' },          // Stable sort (same updatedAt uses id)
        ],
      }),
    ]);

    // Build response with pagination metadata
    const result = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    // Cache result for 5 minutes (300 seconds)
    await this.redis.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  /**
   * Get single retailer by UID
   *
   * Flow:
   * 1. Try cache first
   * 2. If cache miss, query database
   * 3. Check authorization (SR can only see assigned retailers)
   * 4. Cache result
   * 5. Return retailer
   *
   * @param uid - Retailer UID (e.g., 'RET-DHA-001')
   * @param userId - User ID from JWT
   * @param userRole - User role
   * @returns Single retailer with relations
   */
  async findOne(uid: string, userId: number, userRole: string) {
    // Cache key for single retailer
    const cacheKey = `retailer:${uid}:user:${userId}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query database
    const retailer = await this.prisma.retailer.findUnique({
      where: { uid },
      include: {
        region: true,
        area: true,
        distributor: true,
        territory: true,
        assignments: {
          include: {
            salesRep: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Check if retailer exists
    if (!retailer) {
      throw new NotFoundException(`Retailer with UID ${uid} not found`);
    }

    // Authorization: SR can only see assigned retailers
    if (userRole === 'SR') {
      const isAssigned = retailer.assignments.some(
        (assignment) => assignment.salesRepId === userId,
      );

      if (!isAssigned) {
        throw new ForbiddenException('You do not have access to this retailer');
      }
    }

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(retailer), 300);

    return retailer;
  }

  /**
   * Update retailer (points, routes, notes only)
   *
   * Flow:
   * 1. Verify retailer exists and user has access
   * 2. Update allowed fields only
   * 3. Invalidate all related caches
   * 4. Return updated retailer
   *
   * @param uid - Retailer UID
   * @param userId - User ID from JWT
   * @param userRole - User role
   * @param updateData - Fields to update (points, routes, notes)
   * @returns Updated retailer
   */
  async update(
    uid: string,
    userId: number,
    userRole: string,
    updateData: UpdateRetailerDto,
  ) {
    // First, verify retailer exists and user has access
    // This throws NotFoundException or ForbiddenException if issues
    await this.findOne(uid, userId, userRole);

    // Update retailer (only allowed fields from DTO)
    const updated = await this.prisma.retailer.update({
      where: { uid },
      data: updateData,
      include: {
        region: true,
        area: true,
        distributor: true,
        territory: true,
      },
    });

    // Invalidate caches
    // 1. Single retailer cache
    await this.redis.del(`retailer:${uid}:user:${userId}`);

    // 2. All list caches for this user (lazy approach)
    // Pattern: retailers:user:123:* matches all list queries for user 123
    await this.redis.delPattern(`retailers:user:${userId}:*`);

    // Note: This is simple but invalidates all pages
    // Advanced: Track which pages have this retailer and invalidate only those
    // Trade-off: Simplicity vs precision (we chose simplicity)

    return updated;
  }
}
