import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { QueryRetailersDto } from './dto/query-retailers.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';

/**
 * Retailers service - handles retailer operations with caching and authorization
 *
 * Key patterns: Cache-aside, authorization checks, N+1 prevention, offset pagination
 * Security: Admin sees all retailers, SR only sees assigned retailers
 */
@Injectable()
export class RetailersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * List retailers for a user with pagination, search, filters, and caching
   *
   * Flow: Build cache key → Try cache → Query DB → Apply filters → Cache result
   * @param userId - User ID from JWT token
   * @param userRole - User role ('ADMIN' or 'SR')
   * @param query - Query parameters (page, limit, search, filters)
   * @returns Paginated list of retailers with metadata
   */
  async findAll(userId: number, userRole: string, query: QueryRetailersDto) {
    const {
      page = 1,
      limit = 20,
      search,
      region,
      area,
      distributor,
      territory,
    } = query;

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
        { name: { contains: search, mode: 'insensitive' } }, // Case-insensitive name search
        { phone: { contains: search } }, // Phone search
        { uid: { contains: search, mode: 'insensitive' } }, // UID search
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
          { updatedAt: 'desc' }, // Most recently updated first
          { id: 'asc' }, // Stable sort (same updatedAt uses id)
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
   * Get single retailer by UID with authorization check
   *
   * Flow: Try cache → Query DB → Check authorization → Cache result
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
   * Update retailer (points, routes, notes only) with cache invalidation
   *
   * Flow: Verify access → Update fields → Invalidate caches → Return updated
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

    // Simple approach: invalidates all pages for this user
    // Trade-off: Simplicity vs precision

    return updated;
  }

  /**
   * Get dashboard statistics based on user role
   *
   * Admin: All retailers stats
   * SR: Only assigned retailers stats
   *
   * @param userId - User ID from JWT
   * @param userRole - User role ('ADMIN' or 'SR')
   * @returns Dashboard statistics
   */
  async getDashboardStats(userId: number, userRole: string) {
    // Calculate date for "this week" (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Build where clause based on role
    const where: any = {};

    // Authorization: SRs only see assigned retailers
    if (userRole === 'SR') {
      where.assignments = {
        some: { salesRepId: userId },
      };
    }
    // Admins see all retailers (no filter)

    // Run all queries in parallel for performance
    const [totalRetailers, activeRetailersThisWeek, totalPointsResult] =
      await Promise.all([
        // Count total retailers (filtered by role)
        this.prisma.retailer.count({ where }),

        // Count active retailers this week (updated in last 7 days)
        this.prisma.retailer.count({
          where: {
            ...where,
            updatedAt: { gte: oneWeekAgo },
          },
        }),

        // Sum total points
        this.prisma.retailer.aggregate({
          where,
          _sum: { points: true },
        }),
      ]);

    // For admins, also count total sales reps
    let totalSalesReps = 0;
    if (userRole === 'ADMIN') {
      totalSalesReps = await this.prisma.salesRep.count({
        where: { role: 'SR' },
      });
    }

    return {
      totalRetailers,
      activeRetailersThisWeek,
      totalSalesReps,
      totalPoints: totalPointsResult._sum.points || 0,
    };
  }
}
