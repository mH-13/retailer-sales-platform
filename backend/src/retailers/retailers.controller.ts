import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RetailersService } from './retailers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QueryRetailersDto } from './dto/query-retailers.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';

/**
 * Retailers controller with authentication required
 *
 * Provides list, detail, and update endpoints for retailers
 * Authorization handled in service layer (SRs see only assigned retailers)
 * Uses PATCH for partial updates (points, routes, notes only)
 */
@ApiTags('Retailers')
@ApiBearerAuth()
@Controller('retailers')
@UseGuards(JwtAuthGuard) // All routes require JWT authentication
export class RetailersController {
  constructor(private readonly retailersService: RetailersService) {}

  /**
   * GET /retailers - List retailers with pagination, search, and filters
   *
   * SRs see only assigned retailers, Admins see all
   */
  @Get()
  @ApiOperation({
    summary: 'List all retailers (with pagination, search, filters)',
    description:
      'Get paginated list of retailers. Sales Reps see only assigned retailers, Admins see all.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, phone, or UID',
  })
  @ApiQuery({
    name: 'region',
    required: false,
    type: Number,
    description: 'Filter by region ID',
  })
  @ApiQuery({
    name: 'area',
    required: false,
    type: Number,
    description: 'Filter by area ID',
  })
  @ApiQuery({
    name: 'distributor',
    required: false,
    type: Number,
    description: 'Filter by distributor ID',
  })
  @ApiQuery({
    name: 'territory',
    required: false,
    type: Number,
    description: 'Filter by territory ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved retailers',
    schema: {
      example: {
        data: [
          {
            id: 1,
            uid: 'RET-DHA-001',
            name: 'Rahman Store',
            phone: '01711111111',
            points: 100,
            routes: 'Route A',
            notes: 'Good customer',
            region: { id: 1, name: 'Dhaka' },
            area: { id: 1, name: 'Gulshan' },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 70,
          totalPages: 4,
          hasNext: true,
          hasPrev: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(@Query() query: QueryRetailersDto, @CurrentUser() user: any) {
    return this.retailersService.findAll(user.id, user.role, query);
  }

  /**
   * GET /retailers/:uid - Get single retailer by UID with relations
   *
   * Returns 403 if SR tries to access unassigned retailer
   */
  @Get(':uid')
  @ApiOperation({
    summary: 'Get single retailer by UID',
    description:
      'Retrieve detailed information about a specific retailer. Includes all relations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved retailer',
    schema: {
      example: {
        id: 1,
        uid: 'RET-DHA-001',
        name: 'Rahman Store',
        phone: '01711111111',
        points: 100,
        routes: 'Route A',
        notes: 'Good customer',
        region: { id: 1, name: 'Dhaka' },
        area: { id: 1, name: 'Gulshan' },
        distributor: { id: 1, name: 'Dist A' },
        territory: { id: 1, name: 'Territory 1' },
        assignments: [
          {
            salesRep: {
              id: 2,
              username: 'karim_sr',
              name: 'Karim Ahmed',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Retailer not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Sales Rep trying to access unassigned retailer',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findOne(@Param('uid') uid: string, @CurrentUser() user: any) {
    return this.retailersService.findOne(uid, user.id, user.role);
  }

  /**
   * PATCH /retailers/:uid - Update retailer (points, routes, notes only)
   *
   * Partial update with cache invalidation. DTO enforces field restrictions.
   */
  @Patch(':uid')
  @ApiOperation({
    summary: 'Update retailer (points, routes, notes)',
    description:
      'Partially update a retailer. Only points, routes, and notes can be updated. All fields optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated retailer',
    schema: {
      example: {
        id: 1,
        uid: 'RET-DHA-001',
        name: 'Rahman Store',
        phone: '01711111111',
        points: 150,
        routes: 'Route A, Route B',
        notes: 'Prefers morning delivery',
        region: { id: 1, name: 'Dhaka' },
        area: { id: 1, name: 'Gulshan' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Retailer not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Sales Rep trying to update unassigned retailer',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid data (e.g., negative points)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async update(
    @Param('uid') uid: string,
    @Body() updateData: UpdateRetailerDto,
    @CurrentUser() user: any,
  ) {
    return this.retailersService.update(uid, user.id, user.role, updateData);
  }

  /**
   * GET /retailers/stats/dashboard - Get dashboard statistics
   *
   * Returns stats based on user role:
   * - Admin: All retailers stats
   * - SR: Only assigned retailers stats
   */
  @Get('stats/dashboard')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description:
      'Returns dashboard statistics. Admins see all retailers, SRs see only their assigned retailers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved statistics',
    schema: {
      example: {
        totalRetailers: 210,
        activeRetailersThisWeek: 45,
        totalSalesReps: 3,
        totalPoints: 125000,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getDashboardStats(@CurrentUser() user: any) {
    return this.retailersService.getDashboardStats(user.id, user.role);
  }
}
