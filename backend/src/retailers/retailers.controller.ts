import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RetailersService } from './retailers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QueryRetailersDto } from './dto/query-retailers.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';

/**
 * RetailersController: HTTP endpoints for retailer operations
 *
 * All routes in this controller:
 * - Require authentication (@UseGuards(JwtAuthGuard))
 * - Are accessible to both SRs and Admins
 * - Authorization is handled in service layer (SRs see only assigned retailers)
 *
 * Endpoints:
 * - GET /retailers - List retailers (paginated, filtered, searched)
 * - GET /retailers/:uid - Get single retailer
 * - PATCH /retailers/:uid - Update retailer (points, routes, notes)
 *
 * Why PATCH instead of PUT?
 * - PATCH = partial update (send only fields you want to change)
 * - PUT = full replacement (must send all fields)
 * - We use PATCH because SRs update only specific fields
 *
 * Example requests in LEARNING_GUIDE.md
 */
@Controller('retailers')
@UseGuards(JwtAuthGuard)  // All routes require JWT authentication
export class RetailersController {
  constructor(private readonly retailersService: RetailersService) {}

  /**
   * List retailers with pagination, search, and filters
   *
   * GET /retailers
   * GET /retailers?page=2&limit=10
   * GET /retailers?search=rahman
   * GET /retailers?region=1&area=2
   * GET /retailers?page=1&search=rahman&region=1
   *
   * Query parameters (all optional):
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 20, max: 100)
   * - search: Search term (searches name, phone, UID)
   * - region: Filter by region ID
   * - area: Filter by area ID
   * - distributor: Filter by distributor ID
   * - territory: Filter by territory ID
   *
   * Response format:
   * {
   *   "data": [
   *     {
   *       "id": 1,
   *       "uid": "RET-DHA-001",
   *       "name": "Rahman Store",
   *       "phone": "01711111111",
   *       "points": 100,
   *       "routes": "Route A",
   *       "notes": "Good customer",
   *       "region": { "id": 1, "name": "Dhaka" },
   *       "area": { "id": 1, "name": "Gulshan" },
   *       ...
   *     }
   *   ],
   *   "pagination": {
   *     "page": 1,
   *     "limit": 20,
   *     "total": 70,
   *     "totalPages": 4,
   *     "hasNext": true,
   *     "hasPrev": false
   *   }
   * }
   *
   * Authorization:
   * - SRs see only their 70 assigned retailers
   * - Admins see all retailers
   * - Handled in service layer, not here
   *
   * @param query - Query parameters (validated by QueryRetailersDto)
   * @param user - Current user (extracted from JWT by @CurrentUser())
   * @returns Paginated list of retailers
   */
  @Get()
  async findAll(
    @Query() query: QueryRetailersDto,
    @CurrentUser() user: any,
  ) {
    return this.retailersService.findAll(user.id, user.role, query);
  }

  /**
   * Get single retailer by UID
   *
   * GET /retailers/RET-DHA-001
   *
   * Response format:
   * {
   *   "id": 1,
   *   "uid": "RET-DHA-001",
   *   "name": "Rahman Store",
   *   "phone": "01711111111",
   *   "points": 100,
   *   "routes": "Route A",
   *   "notes": "Good customer",
   *   "region": { "id": 1, "name": "Dhaka" },
   *   "area": { "id": 1, "name": "Gulshan" },
   *   "distributor": { "id": 1, "name": "Dist A" },
   *   "territory": { "id": 1, "name": "Territory 1" },
   *   "assignments": [
   *     {
   *       "salesRep": {
   *         "id": 2,
   *         "username": "karim_sr",
   *         "name": "Karim Ahmed"
   *       }
   *     }
   *   ]
   * }
   *
   * Errors:
   * - 404 Not Found: Retailer doesn't exist
   * - 403 Forbidden: SR trying to access retailer not assigned to them
   * - 401 Unauthorized: No JWT token or invalid token
   *
   * @param uid - Retailer UID (from URL path)
   * @param user - Current user
   * @returns Single retailer with relations
   */
  @Get(':uid')
  async findOne(
    @Param('uid') uid: string,
    @CurrentUser() user: any,
  ) {
    return this.retailersService.findOne(uid, user.id, user.role);
  }

  /**
   * Update retailer (points, routes, notes only)
   *
   * PATCH /retailers/RET-DHA-001
   * Content-Type: application/json
   * {
   *   "points": 150,
   *   "routes": "Route A, Route B",
   *   "notes": "Prefers morning delivery"
   * }
   *
   * All fields are optional (partial update):
   * - Update only points: { "points": 150 }
   * - Update only routes: { "routes": "Route A" }
   * - Update multiple: { "points": 150, "notes": "Updated" }
   *
   * Security enforcement:
   * 1. DTO only allows points, routes, notes (other fields ignored)
   * 2. Service verifies user has access to this retailer
   * 3. Service updates only allowed fields
   *
   * Response: Updated retailer object (same format as GET)
   *
   * Errors:
   * - 404 Not Found: Retailer doesn't exist
   * - 403 Forbidden: SR trying to update retailer not assigned to them
   * - 400 Bad Request: Invalid data (e.g., points = -1)
   * - 401 Unauthorized: No JWT token
   *
   * Side effects:
   * - Invalidates Redis cache for this retailer
   * - Invalidates all list caches for this user
   *
   * @param uid - Retailer UID
   * @param updateData - Fields to update (validated by UpdateRetailerDto)
   * @param user - Current user
   * @returns Updated retailer
   */
  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() updateData: UpdateRetailerDto,
    @CurrentUser() user: any,
  ) {
    return this.retailersService.update(uid, user.id, user.role, updateData);
  }
}
