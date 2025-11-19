import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { BulkAssignmentDto } from './dto/bulk-assignment.dto';

/**
 * AdminController
 *
 * What does this controller provide?
 * - All admin-only endpoints for managing reference data
 * - CRUD operations for regions, areas, territories, distributors
 * - Bulk assignment of retailers to sales reps
 *
 * Security:
 * - @UseGuards(JwtAuthGuard, RolesGuard): EVERY endpoint requires valid JWT
 * - @Roles('ADMIN'): EVERY endpoint requires ADMIN role
 * - Sales Reps (SR role) get 403 Forbidden if they try to access
 *
 * Why class-level guards?
 * - Applied to ALL methods in this controller
 * - DRY: Write once, applies everywhere
 * - Can't accidentally forget to add guard to a method
 *
 * Interview Q: "What happens if SR tries POST /admin/regions?"
 * A: "1. JwtAuthGuard validates their token (succeeds)
 *     2. RolesGuard checks their role is 'ADMIN' (fails, they're 'SR')
 *     3. Returns 403 Forbidden
 *     4. Service method never executes (guarded at controller layer)"
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Both guards required
@Roles('ADMIN') // Only ADMIN role allowed
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========================================
  // REGIONS ENDPOINTS
  // ========================================

  /**
   * GET /admin/regions
   * List all regions
   *
   * Example Response:
   * [
   *   { "id": 1, "name": "Dhaka", "createdAt": "...", "updatedAt": "..." },
   *   { "id": 2, "name": "Chittagong", "createdAt": "...", "updatedAt": "..." }
   * ]
   */
  @Get('regions')
  async findAllRegions() {
    return this.adminService.findAllRegions();
  }

  /**
   * GET /admin/regions/:id
   * Get single region by ID
   *
   * @Param('id', ParseIntPipe)
   * - Extracts :id from URL path
   * - ParseIntPipe converts string to number
   * - If conversion fails (e.g., /admin/regions/abc), returns 400 Bad Request
   *
   * Why ParseIntPipe?
   * - URL params are always strings: "/admin/regions/1" → id = "1"
   * - Service expects number: findOneRegion(id: number)
   * - ParseIntPipe: "1" → 1 (number)
   * - Validates it's a valid integer: "abc" → 400 error
   *
   * Example:
   * GET /admin/regions/1  →  id = 1 (number) ✅
   * GET /admin/regions/abc →  400 Bad Request ❌
   */
  @Get('regions/:id')
  async findOneRegion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneRegion(id);
  }

  /**
   * POST /admin/regions
   * Create new region
   *
   * @Body() createRegionDto: CreateRegionDto
   * - Extracts request body JSON
   * - Validates using CreateRegionDto rules
   * - If validation fails, returns 400 with error details
   *
   * Example Request:
   * POST /admin/regions
   * Content-Type: application/json
   * { "name": "Sylhet" }
   *
   * Example Response:
   * { "id": 3, "name": "Sylhet", "createdAt": "...", "updatedAt": "..." }
   */
  @Post('regions')
  async createRegion(@Body() createRegionDto: CreateRegionDto) {
    return this.adminService.createRegion(createRegionDto);
  }

  /**
   * PUT /admin/regions/:id
   * Update existing region
   *
   * Why PUT instead of PATCH?
   * - Doesn't matter much here (only 1 field)
   * - Could use either
   * - PUT traditionally means "full replacement"
   * - PATCH means "partial update"
   * - Since we use UpdateRegionDto (optional fields), it's more like PATCH
   *
   * Note: Could change to @Patch if you prefer semantic correctness
   */
  @Put('regions/:id')
  async updateRegion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto,
  ) {
    return this.adminService.updateRegion(id, updateRegionDto);
  }

  /**
   * DELETE /admin/regions/:id
   * Delete region
   *
   * Example Response:
   * { "message": "Region with ID 1 deleted successfully" }
   *
   * Error if retailers exist:
   * 400 Bad Request
   * { "message": "Cannot delete region because it is referenced by existing retailers" }
   */
  @Delete('regions/:id')
  async removeRegion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeRegion(id);
  }

  // ========================================
  // AREAS ENDPOINTS (Same pattern as Regions)
  // ========================================

  @Get('areas')
  async findAllAreas() {
    return this.adminService.findAllAreas();
  }

  @Get('areas/:id')
  async findOneArea(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneArea(id);
  }

  @Post('areas')
  async createArea(@Body() createAreaDto: CreateAreaDto) {
    return this.adminService.createArea(createAreaDto);
  }

  @Put('areas/:id')
  async updateArea(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAreaDto: UpdateAreaDto,
  ) {
    return this.adminService.updateArea(id, updateAreaDto);
  }

  @Delete('areas/:id')
  async removeArea(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeArea(id);
  }

  // ========================================
  // TERRITORIES ENDPOINTS (Same pattern)
  // ========================================

  @Get('territories')
  async findAllTerritories() {
    return this.adminService.findAllTerritories();
  }

  @Get('territories/:id')
  async findOneTerritory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneTerritory(id);
  }

  @Post('territories')
  async createTerritory(@Body() createTerritoryDto: CreateTerritoryDto) {
    return this.adminService.createTerritory(createTerritoryDto);
  }

  @Put('territories/:id')
  async updateTerritory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTerritoryDto: UpdateTerritoryDto,
  ) {
    return this.adminService.updateTerritory(id, updateTerritoryDto);
  }

  @Delete('territories/:id')
  async removeTerritory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeTerritory(id);
  }

  // ========================================
  // DISTRIBUTORS ENDPOINTS (Same pattern)
  // ========================================

  @Get('distributors')
  async findAllDistributors() {
    return this.adminService.findAllDistributors();
  }

  @Get('distributors/:id')
  async findOneDistributor(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneDistributor(id);
  }

  @Post('distributors')
  async createDistributor(@Body() createDistributorDto: CreateDistributorDto) {
    return this.adminService.createDistributor(createDistributorDto);
  }

  @Put('distributors/:id')
  async updateDistributor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistributorDto: UpdateDistributorDto,
  ) {
    return this.adminService.updateDistributor(id, updateDistributorDto);
  }

  @Delete('distributors/:id')
  async removeDistributor(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeDistributor(id);
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * POST /admin/assignments/bulk
   * Bulk assign retailers to sales reps
   *
   * Example Request:
   * POST /admin/assignments/bulk
   * Content-Type: application/json
   * {
   *   "assignments": [
   *     { "salesRepId": 2, "retailerIds": [1, 2, 3] },
   *     { "salesRepId": 3, "retailerIds": [4, 5, 6, 7] }
   *   ]
   * }
   *
   * Example Response:
   * {
   *   "message": "Successfully created 7 retailer assignments",
   *   "created": 7,
   *   "total": 7,
   *   "skipped": 0
   * }
   *
   * If some assignments already exist:
   * {
   *   "message": "Successfully created 5 retailer assignments",
   *   "created": 5,
   *   "total": 7,
   *   "skipped": 2  ← These assignments already existed
   * }
   *
   * Why separate endpoint instead of POST /assignments?
   * - Bulk operations are admin-only (SRs shouldn't assign retailers)
   * - Groups all admin operations under /admin prefix
   * - Clear intent: this is a bulk operation, not single assignment
   */
  @Post('assignments/bulk')
  async bulkAssignRetailers(@Body() bulkAssignmentDto: BulkAssignmentDto) {
    return this.adminService.bulkAssignRetailers(bulkAssignmentDto);
  }
}
