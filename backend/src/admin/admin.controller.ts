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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
 * Admin controller for reference data management
 *
 * Security: All endpoints require JWT + ADMIN role (class-level guards)
 * Provides: CRUD for regions/areas/territories/distributors, bulk operations, CSV import
 */
@ApiTags('Admin')
@ApiBearerAuth() // All routes require JWT
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Both guards required
@Roles('ADMIN') // Only ADMIN role allowed
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========================================
  // REGIONS ENDPOINTS
  // ========================================

  // GET /admin/regions - List all regions
  @Get('regions')
  @ApiOperation({
    summary: 'List all regions',
    description: 'Get all regions in the system',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved regions' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can access',
  })
  async findAllRegions() {
    return this.adminService.findAllRegions();
  }

  // GET /admin/regions/:id - ParseIntPipe converts string ID to number and validates
  @Get('regions/:id')
  async findOneRegion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneRegion(id);
  }

  // POST /admin/regions - Create new region with validation
  @Post('regions')
  @ApiOperation({
    summary: 'Create new region',
    description: 'Add a new region to the system',
  })
  @ApiResponse({ status: 201, description: 'Region created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or duplicate name',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can access',
  })
  async createRegion(@Body() createRegionDto: CreateRegionDto) {
    return this.adminService.createRegion(createRegionDto);
  }

  // PUT /admin/regions/:id - Update region (could be PATCH since using optional fields)
  @Put('regions/:id')
  async updateRegion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto,
  ) {
    return this.adminService.updateRegion(id, updateRegionDto);
  }

  // DELETE /admin/regions/:id - Delete region (fails if retailers reference it)
  @Delete('regions/:id')
  async removeRegion(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeRegion(id);
  }

  // ========================================
  // AREAS ENDPOINTS
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
  // TERRITORIES ENDPOINTS
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
  // DISTRIBUTORS ENDPOINTS
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
   * Bulk assign retailers to sales reps in a single transaction
   *
   * Skips existing assignments and returns summary with created/skipped counts
   */
  @Post('assignments/bulk')
  @ApiOperation({
    summary: 'Bulk assign retailers to sales reps',
    description:
      'Create multiple retailer-to-sales-rep assignments in one operation. Skips duplicates.',
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
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid sales rep/retailer IDs',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can access',
  })
  async bulkAssignRetailers(@Body() bulkAssignmentDto: BulkAssignmentDto) {
    return this.adminService.bulkAssignRetailers(bulkAssignmentDto);
  }

  // ========================================
  // CSV IMPORT
  // ========================================

  /**
   * POST /admin/retailers/import
   * Import retailers from CSV file with validation and error reporting
   *
   * Uses FileInterceptor for multipart/form-data handling
   * Validates file type, size (max 10MB), and processes with detailed error reporting
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
          description:
            'CSV file with columns: uid,name,phone,regionId,areaId,distributorId,territoryId,points,routes,notes',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Import retailers from CSV file',
    description:
      'Bulk import retailers from CSV. Validates each row and reports errors. Max file size: 10MB.',
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
  @ApiResponse({
    status: 400,
    description:
      'No file uploaded, invalid file type, or file too large (>10MB)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can access',
  })
  async importRetailers(@UploadedFile() file: Express.Multer.File): Promise<{
    success: boolean;
    created: number;
    failed: number;
    errors: Array<{ row: number; uid: string; error: string }>;
  }> {
    // Validate file was uploaded
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type (CSV only) - checks both mimetype and extension for security
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

    // Validate file size (max 10MB to prevent memory exhaustion)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size is 10MB (uploaded: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }

    // Process CSV file buffer (in-memory processing for files up to 10MB)
    return this.adminService.importRetailersFromCsv(file.buffer);
  }
}
