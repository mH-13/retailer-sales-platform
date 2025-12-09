import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { BulkAssignmentDto } from './dto/bulk-assignment.dto';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

/**
 * Admin service for reference data CRUD and bulk operations
 *
 * Handles: regions, areas, territories, distributors, bulk assignments, CSV import
 * Pattern: Generic CRUD methods with duplicate checking and foreign key validation
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // REGIONS CRUD
  // ========================================

  /**
   * Get all regions (no pagination - reference data is small)
   */
  async findAllRegions() {
    return this.prisma.region.findMany({
      orderBy: { name: 'asc' }, // Alphabetical order for dropdowns
    });
  }

  /**
   * Get single region by ID
   */
  async findOneRegion(id: number) {
    const region = await this.prisma.region.findUnique({
      where: { id },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  /**
   * Create new region with duplicate name check
   */
  async createRegion(createRegionDto: CreateRegionDto) {
    // Check for duplicate region name
    const existing = await this.prisma.region.findFirst({
      where: { name: createRegionDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Region with name "${createRegionDto.name}" already exists`,
      );
    }

    return this.prisma.region.create({
      data: createRegionDto,
    });
  }

  /**
   * Update existing region with duplicate name check
   */
  async updateRegion(id: number, updateRegionDto: UpdateRegionDto) {
    // Verify region exists
    await this.findOneRegion(id);

    // Check for duplicate name (if name is being updated)
    if (updateRegionDto.name) {
      const existing = await this.prisma.region.findFirst({
        where: {
          name: updateRegionDto.name,
          NOT: { id }, // Exclude current region from search
        },
      });

      if (existing) {
        throw new ConflictException(
          `Region with name "${updateRegionDto.name}" already exists`,
        );
      }
    }

    return this.prisma.region.update({
      where: { id },
      data: updateRegionDto,
    });
  }

  /**
   * Delete region (fails if retailers reference it due to foreign key constraint)
   */
  async removeRegion(id: number) {
    await this.findOneRegion(id);

    // Try to delete - will fail if retailers reference this region
    try {
      await this.prisma.region.delete({
        where: { id },
      });

      return { message: `Region with ID ${id} deleted successfully` };
    } catch (error) {
      // Handle foreign key constraint error with user-friendly message
      if (error.code === 'P2003') {
        throw new BadRequestException(
          `Cannot delete region because it is referenced by existing retailers`,
        );
      }
      throw error;
    }
  }

  // ========================================
  // AREAS CRUD
  // ========================================

  async findAllAreas() {
    return this.prisma.area.findMany({
      include: {
        region: true, // Include related region data
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneArea(id: number) {
    const area = await this.prisma.area.findUnique({ where: { id } });
    if (!area) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }
    return area;
  }

  async createArea(createAreaDto: CreateAreaDto) {
    // Check for duplicate area name within same region (schema constraint: @@unique([name, regionId]))
    const existing = await this.prisma.area.findFirst({
      where: {
        name: createAreaDto.name,
        regionId: createAreaDto.regionId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Area with name "${createAreaDto.name}" already exists in this region`,
      );
    }

    return this.prisma.area.create({
      data: createAreaDto,
    });
  }

  async updateArea(id: number, updateAreaDto: UpdateAreaDto) {
    const currentArea = await this.findOneArea(id);

    // Check for duplicate area name in target region (handles name/regionId updates)
    if (updateAreaDto.name || updateAreaDto.regionId) {
      const nameToCheck = updateAreaDto.name || currentArea.name;
      const regionIdToCheck = updateAreaDto.regionId || currentArea.regionId;

      const existing = await this.prisma.area.findFirst({
        where: {
          name: nameToCheck,
          regionId: regionIdToCheck,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Area with name "${nameToCheck}" already exists in this region`,
        );
      }
    }

    return this.prisma.area.update({
      where: { id },
      data: updateAreaDto,
    });
  }

  async removeArea(id: number) {
    await this.findOneArea(id);

    try {
      await this.prisma.area.delete({ where: { id } });
      return { message: `Area with ID ${id} deleted successfully` };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          `Cannot delete area because it is referenced by existing retailers`,
        );
      }
      throw error;
    }
  }

  // ========================================
  // TERRITORIES CRUD
  // ========================================

  async findAllTerritories() {
    return this.prisma.territory.findMany({
      include: {
        area: {
          include: {
            region: true, // Include region through area
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneTerritory(id: number) {
    const territory = await this.prisma.territory.findUnique({ where: { id } });
    if (!territory) {
      throw new NotFoundException(`Territory with ID ${id} not found`);
    }
    return territory;
  }

  async createTerritory(createTerritoryDto: CreateTerritoryDto) {
    // Check for duplicate territory name within same area (schema constraint: @@unique([name, areaId]))
    const existing = await this.prisma.territory.findFirst({
      where: {
        name: createTerritoryDto.name,
        areaId: createTerritoryDto.areaId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Territory with name "${createTerritoryDto.name}" already exists in this area`,
      );
    }

    return this.prisma.territory.create({
      data: createTerritoryDto,
    });
  }

  async updateTerritory(id: number, updateTerritoryDto: UpdateTerritoryDto) {
    const currentTerritory = await this.findOneTerritory(id);

    // Check for duplicate territory name in target area (handles name/areaId updates)
    if (updateTerritoryDto.name || updateTerritoryDto.areaId) {
      const nameToCheck = updateTerritoryDto.name || currentTerritory.name;
      const areaIdToCheck =
        updateTerritoryDto.areaId || currentTerritory.areaId;

      const existing = await this.prisma.territory.findFirst({
        where: {
          name: nameToCheck,
          areaId: areaIdToCheck,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Territory with name "${nameToCheck}" already exists in this area`,
        );
      }
    }

    return this.prisma.territory.update({
      where: { id },
      data: updateTerritoryDto,
    });
  }

  async removeTerritory(id: number) {
    await this.findOneTerritory(id);

    try {
      await this.prisma.territory.delete({ where: { id } });
      return { message: `Territory with ID ${id} deleted successfully` };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          `Cannot delete territory because it is referenced by existing retailers`,
        );
      }
      throw error;
    }
  }

  // ========================================
  // DISTRIBUTORS CRUD
  // ========================================

  async findAllDistributors() {
    return this.prisma.distributor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOneDistributor(id: number) {
    const distributor = await this.prisma.distributor.findUnique({
      where: { id },
    });
    if (!distributor) {
      throw new NotFoundException(`Distributor with ID ${id} not found`);
    }
    return distributor;
  }

  async createDistributor(createDistributorDto: CreateDistributorDto) {
    const existing = await this.prisma.distributor.findFirst({
      where: { name: createDistributorDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Distributor with name "${createDistributorDto.name}" already exists`,
      );
    }

    return this.prisma.distributor.create({
      data: createDistributorDto,
    });
  }

  async updateDistributor(
    id: number,
    updateDistributorDto: UpdateDistributorDto,
  ) {
    await this.findOneDistributor(id);

    if (updateDistributorDto.name) {
      const existing = await this.prisma.distributor.findFirst({
        where: {
          name: updateDistributorDto.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Distributor with name "${updateDistributorDto.name}" already exists`,
        );
      }
    }

    return this.prisma.distributor.update({
      where: { id },
      data: updateDistributorDto,
    });
  }

  async removeDistributor(id: number) {
    await this.findOneDistributor(id);

    try {
      await this.prisma.distributor.delete({ where: { id } });
      return { message: `Distributor with ID ${id} deleted successfully` };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          `Cannot delete distributor because it is referenced by existing retailers`,
        );
      }
      throw error;
    }
  }

  // ========================================
  // BULK ASSIGNMENT
  // ========================================

  /**
   * Bulk assign retailers to sales reps in a single transaction
   *
   * Takes SR → Retailers mappings and creates all assignments atomically
   * Example: { assignments: [{ salesRepId: 2, retailerIds: [1,2,3] }] }
   */
  async bulkAssignRetailers(bulkAssignmentDto: BulkAssignmentDto) {
    // Step 1: Validate all Sales Reps exist and have SR role
    const salesRepIds = bulkAssignmentDto.assignments.map((a) => a.salesRepId);
    const uniqueSalesRepIds = [...new Set(salesRepIds)];

    const salesReps = await this.prisma.salesRep.findMany({
      where: {
        id: { in: uniqueSalesRepIds },
        role: 'SR',
      },
    });

    // Validate all requested SRs exist
    if (salesReps.length !== uniqueSalesRepIds.length) {
      const foundIds = salesReps.map((sr) => sr.id);
      const missingIds = uniqueSalesRepIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new BadRequestException(
        `Sales Rep IDs ${missingIds.join(', ')} not found or not Sales Rep role`,
      );
    }

    // Step 2: Validate all Retailers exist
    const allRetailerIds = bulkAssignmentDto.assignments.flatMap(
      (a) => a.retailerIds,
    );
    const uniqueRetailerIds = [...new Set(allRetailerIds)];

    const retailers = await this.prisma.retailer.findMany({
      where: { id: { in: uniqueRetailerIds } },
    });

    if (retailers.length !== uniqueRetailerIds.length) {
      const foundIds = retailers.map((r) => r.id);
      const missingIds = uniqueRetailerIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new BadRequestException(
        `Retailer IDs ${missingIds.join(', ')} not found`,
      );
    }

    // Step 3: Transform assignments into individual records
    const assignmentRecords: { salesRepId: number; retailerId: number }[] = [];
    for (const assignment of bulkAssignmentDto.assignments) {
      for (const retailerId of assignment.retailerIds) {
        assignmentRecords.push({
          salesRepId: assignment.salesRepId,
          retailerId: retailerId,
        });
      }
    }

    // Step 4: Insert all assignments in a transaction (all succeed or all fail)
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        return tx.salesRepRetailer.createMany({
          data: assignmentRecords,
          skipDuplicates: true, // Ignore existing assignments (idempotent)
        });
      });

      // Return summary (result.count = new assignments, excludes skipped duplicates)
      return {
        message: `Successfully created ${result.count} retailer assignments`,
        created: result.count,
        total: assignmentRecords.length,
        skipped: assignmentRecords.length - result.count,
      };
    } catch (error) {
      // All errors cause automatic transaction rollback
      throw new BadRequestException(
        `Failed to create assignments: ${error.message}`,
      );
    }
  }

  /**
   * Delete a retailer assignment
   * Removes a sales rep assignment from a retailer
   */
  async deleteAssignment(id: number) {
    // Check if assignment exists
    const assignment = await this.prisma.salesRepRetailer.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    // Delete the assignment
    await this.prisma.salesRepRetailer.delete({
      where: { id },
    });

    return {
      message: 'Assignment deleted successfully',
    };
  }

  // ========================================
  // SALES REPS
  // ========================================

  /**
   * Get all sales representatives
   * Returns list of all sales reps without password hash
   */
  async getAllSalesReps() {
    const salesReps = await this.prisma.salesRep.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      },
      orderBy: {
        name: 'asc',
      },
    });

    return salesReps;
  }

  /**
   * Get dashboard statistics
   * Returns key metrics for admin dashboard
   */
  async getDashboardStats() {
    // Calculate date for "this week" (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Run all queries in parallel for performance
    const [totalRetailers, totalSalesReps, activeRetailersThisWeek, totalPointsResult] =
      await Promise.all([
        // Count total retailers
        this.prisma.retailer.count(),

        // Count sales reps (excluding admin role)
        this.prisma.salesRep.count({
          where: {
            role: 'SR',
          },
        }),

        // Count retailers updated in the last 7 days
        this.prisma.retailer.count({
          where: {
            updatedAt: {
              gte: oneWeekAgo,
            },
          },
        }),

        // Sum total points across all retailers
        this.prisma.retailer.aggregate({
          _sum: {
            points: true,
          },
        }),
      ]);

    return {
      totalRetailers,
      totalSalesReps,
      activeRetailersThisWeek,
      totalPoints: totalPointsResult._sum.points || 0,
    };
  }

  // ========================================
  // CSV IMPORT
  // ========================================

  /**
   * Import retailers from CSV file with validation and bulk insert
   *
   * Expected format: uid,name,phone,regionId,areaId,distributorId,territoryId,points,routes,notes
   * Required fields: uid, name, phone
   * Returns summary with success/error counts
   */
  async importRetailersFromCsv(fileBuffer: Buffer): Promise<{
    success: boolean;
    created: number;
    failed: number;
    errors: Array<{ row: number; uid: string; error: string }>;
  }> {
    // Step 1: Parse CSV file using streams (memory efficient for large files)
    const rows: any[] = [];
    const stream = Readable.from(fileBuffer.toString());

    // Parse CSV with Promise wrapper to handle async stream processing
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row: any) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error: any) => {
          reject(
            new BadRequestException(`CSV parsing error: ${error.message}`),
          );
        });
    });

    // Step 2: Validate and transform rows
    const validRetailers: any[] = [];
    const errors: Array<{ row: number; uid: string; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is headers

      // Validate required fields (uid, name, phone are NOT NULL in schema)
      if (!row.uid || !row.name || !row.phone) {
        errors.push({
          row: rowNumber,
          uid: row.uid || 'MISSING',
          error: 'Missing required fields: uid, name, or phone',
        });
        continue;
      }

      // Convert string IDs to numbers (CSV values are strings, DB expects numbers)
      const regionId = parseInt(row.regionId) || null;
      const areaId = parseInt(row.areaId) || null;
      const distributorId = parseInt(row.distributorId) || null;
      const territoryId = parseInt(row.territoryId) || null;
      const points = parseInt(row.points) || 0;

      // Build retailer object matching Prisma schema
      validRetailers.push({
        uid: row.uid.trim(),
        name: row.name.trim(),
        phone: row.phone.trim(),
        regionId,
        areaId,
        distributorId,
        territoryId,
        points,
        routes: row.routes || null,
        notes: row.notes || null,
      });
    }

    // Step 3: Validate foreign keys exist (batch validation for better performance)

    // Collect all unique foreign key IDs that were provided
    const regionIds = [
      ...new Set(
        validRetailers.map((r) => r.regionId).filter((id) => id !== null),
      ),
    ];
    const areaIds = [
      ...new Set(
        validRetailers.map((r) => r.areaId).filter((id) => id !== null),
      ),
    ];
    const distributorIds = [
      ...new Set(
        validRetailers.map((r) => r.distributorId).filter((id) => id !== null),
      ),
    ];
    const territoryIds = [
      ...new Set(
        validRetailers.map((r) => r.territoryId).filter((id) => id !== null),
      ),
    ];

    // Batch validate foreign keys with parallel queries
    try {
      const [regions, areas, distributors, territories] = await Promise.all([
        regionIds.length > 0
          ? this.prisma.region.findMany({
              where: { id: { in: regionIds } },
            })
          : [],
        areaIds.length > 0
          ? this.prisma.area.findMany({ where: { id: { in: areaIds } } })
          : [],
        distributorIds.length > 0
          ? this.prisma.distributor.findMany({
              where: { id: { in: distributorIds } },
            })
          : [],
        territoryIds.length > 0
          ? this.prisma.territory.findMany({
              where: { id: { in: territoryIds } },
            })
          : [],
      ]);

      // Check for missing foreign keys
      const foundRegionIds = regions.map((r) => r.id);
      const foundAreaIds = areas.map((a) => a.id);
      const foundDistributorIds = distributors.map((d) => d.id);
      const foundTerritoryIds = territories.map((t) => t.id);

      const missingRegionIds = regionIds.filter(
        (id) => !foundRegionIds.includes(id),
      );
      const missingAreaIds = areaIds.filter((id) => !foundAreaIds.includes(id));
      const missingDistributorIds = distributorIds.filter(
        (id) => !foundDistributorIds.includes(id),
      );
      const missingTerritoryIds = territoryIds.filter(
        (id) => !foundTerritoryIds.includes(id),
      );

      // Add errors for retailers with invalid foreign keys and remove from valid list
      validRetailers.forEach((retailer, index) => {
        if (retailer.regionId && missingRegionIds.includes(retailer.regionId)) {
          errors.push({
            row: index + 2,
            uid: retailer.uid,
            error: `Region ID ${retailer.regionId} not found`,
          });
          validRetailers.splice(index, 1);
        }
        if (retailer.areaId && missingAreaIds.includes(retailer.areaId)) {
          errors.push({
            row: index + 2,
            uid: retailer.uid,
            error: `Area ID ${retailer.areaId} not found`,
          });
          validRetailers.splice(index, 1);
        }
        if (
          retailer.distributorId &&
          missingDistributorIds.includes(retailer.distributorId)
        ) {
          errors.push({
            row: index + 2,
            uid: retailer.uid,
            error: `Distributor ID ${retailer.distributorId} not found`,
          });
          validRetailers.splice(index, 1);
        }
        if (
          retailer.territoryId &&
          missingTerritoryIds.includes(retailer.territoryId)
        ) {
          errors.push({
            row: index + 2,
            uid: retailer.uid,
            error: `Territory ID ${retailer.territoryId} not found`,
          });
          validRetailers.splice(index, 1);
        }
      });
    } catch (error) {
      throw new BadRequestException(
        `Foreign key validation failed: ${error.message}`,
      );
    }

    // Step 4: Bulk insert valid retailers with transaction and duplicate handling
    let createdCount = 0;

    if (validRetailers.length > 0) {
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          return tx.retailer.createMany({
            data: validRetailers,
            skipDuplicates: true, // Skip existing UIDs for better UX
          });
        });

        createdCount = result.count;

        // Track skipped duplicates
        const skippedCount = validRetailers.length - result.count;
        if (skippedCount > 0) {
          // Add info about skipped duplicates
          errors.push({
            row: 0,
            uid: 'MULTIPLE',
            error: `${skippedCount} retailers skipped (duplicate UIDs)`,
          });
        }
      } catch (error) {
        // Handle database errors during import
        throw new BadRequestException(
          `Failed to import retailers: ${error.message}`,
        );
      }
    }

    // Step 5: Return summary with success/error counts
    return {
      success: createdCount > 0,
      created: createdCount,
      failed: errors.length,
      errors,
    };
  }
}
