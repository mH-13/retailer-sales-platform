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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
 * - CSV import for bulk retailer creation
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
 * Swagger Decorators:
 * - @ApiTags('Admin'): Groups all admin endpoints under "Admin" section
 * - @ApiBearerAuth(): Requires JWT token (shows lock icon)
 * - @ApiOperation(): Describes each endpoint
 * - @ApiResponse(): Documents responses (success and errors)
 *
 * Interview Q: "What happens if SR tries POST /admin/regions?"
 * A: "1. JwtAuthGuard validates their token (succeeds)
 *     2. RolesGuard checks their role is 'ADMIN' (fails, they're 'SR')
 *     3. Returns 403 Forbidden
 *     4. Service method never executes (guarded at controller layer)"
 */
@ApiTags('Admin')
@ApiBearerAuth()  // All routes require JWT
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
  @ApiOperation({ summary: 'List all regions', description: 'Get all regions in the system' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved regions' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can access' })
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
  @ApiOperation({ summary: 'Create new region', description: 'Add a new region to the system' })
  @ApiResponse({ status: 201, description: 'Region created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate name' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can access' })
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
  @ApiOperation({
    summary: 'Bulk assign retailers to sales reps',
    description: 'Create multiple retailer-to-sales-rep assignments in one operation. Skips duplicates.',
  })
  @ApiResponse({
    status: 201,
    description: 'Assignments created successfully',
    schema: {
      example: {
        message: 'Successfully created 7 retailer assignments',
        created: 7,
        total: 7,
        skipped: 0,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error or invalid sales rep/retailer IDs' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can access' })
  async bulkAssignRetailers(@Body() bulkAssignmentDto: BulkAssignmentDto) {
    return this.adminService.bulkAssignRetailers(bulkAssignmentDto);
  }

  // ========================================
  // CSV IMPORT
  // ========================================

  /**
   * POST /admin/retailers/import
   * Import retailers from CSV file
   *
   * What is @UseInterceptors(FileInterceptor('file'))?
   * - FileInterceptor is from @nestjs/platform-express
   * - It uses Multer under the hood to handle multipart/form-data
   * - 'file' is the field name in the form data
   * - Multer parses the uploaded file and makes it available via @UploadedFile()
   *
   * What is @UploadedFile()?
   * - A decorator that extracts the uploaded file from the request
   * - Returns an Express.Multer.File object with properties:
   *   - buffer: Buffer (the file contents in memory)
   *   - originalname: string (e.g., "retailers.csv")
   *   - mimetype: string (e.g., "text/csv")
   *   - size: number (file size in bytes)
   *
   * Example Request (using curl):
   * curl -X POST http://localhost:3000/admin/retailers/import \
   *   -H "Authorization: Bearer <jwt_token>" \
   *   -F "file=@retailers.csv"
   *
   * Example Request (using Postman):
   * 1. Select POST method
   * 2. URL: http://localhost:3000/admin/retailers/import
   * 3. Headers: Authorization: Bearer <jwt_token>
   * 4. Body: form-data
   * 5. Key: file (type: File)
   * 6. Value: Select retailers.csv file
   *
   * Example Response (Success):
   * {
   *   "success": true,
   *   "created": 95,
   *   "failed": 5,
   *   "errors": [
   *     { "row": 3, "uid": "RET-001", "error": "Region ID 99 not found" },
   *     { "row": 5, "uid": "RET-003", "error": "Missing required fields" }
   *   ]
   * }
   *
   * Example Response (No file uploaded):
   * 400 Bad Request
   * { "message": "No file uploaded" }
   *
   * Why validate file type?
   * - Security: Prevent uploading of malicious files
   * - Data integrity: Ensure we're processing correct format
   * - Better error messages: Tell user immediately if wrong file type
   */
  @Post('retailers/import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file containing retailers data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file with columns: uid,name,phone,regionId,areaId,distributorId,territoryId,points,routes,notes',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Import retailers from CSV file',
    description: 'Bulk import retailers from CSV. Validates each row and reports errors. Max file size: 10MB.',
  })
  @ApiResponse({
    status: 201,
    description: 'CSV processed successfully (may include partial failures)',
    schema: {
      example: {
        success: true,
        created: 95,
        failed: 5,
        errors: [
          { row: 3, uid: 'RET-001', error: 'Region ID 99 not found' },
          { row: 5, uid: 'RET-003', error: 'Missing required fields' },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No file uploaded, invalid file type, or file too large (>10MB)' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can access' })
  async importRetailers(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    success: boolean;
    created: number;
    failed: number;
    errors: Array<{ row: number; uid: string; error: string }>;
  }> {
    /**
     * Validate file was uploaded
     *
     * Why this check?
     * - If user forgets to attach file, file will be undefined
     * - Better to return clear error than let it fail in service
     */
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    /**
     * Validate file type
     *
     * Why check mimetype?
     * - Ensures uploaded file is actually a CSV
     * - Prevents users from uploading .exe, .jpg, etc.
     *
     * Why also check file extension?
     * - Some systems don't set correct mimetype
     * - Double-check using filename
     *
     * Accepted mimetypes:
     * - text/csv (standard CSV)
     * - application/vnd.ms-excel (Excel CSV)
     * - text/plain (sometimes CSVs are sent as plain text)
     */
    const validMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'text/plain',
    ];
    const isValidMimeType = validMimeTypes.includes(file.mimetype);
    const isValidExtension = file.originalname.endsWith('.csv');

    if (!isValidMimeType && !isValidExtension) {
      throw new BadRequestException(
        'Invalid file type. Please upload a CSV file',
      );
    }

    /**
     * Validate file size
     *
     * Why limit file size?
     * - Prevent memory exhaustion (very large files)
     * - 10MB limit = ~200,000 rows (reasonable for manual imports)
     * - For larger imports, use streaming or batch API
     *
     * 10MB in bytes: 10 * 1024 * 1024 = 10485760
     */
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is 10MB (uploaded: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }

    /**
     * Call service to process CSV
     *
     * file.buffer contains the entire file contents in memory
     * This is OK for files up to 10MB
     * For larger files, we'd use streams
     */
    return this.adminService.importRetailersFromCsv(file.buffer);
  }
}
