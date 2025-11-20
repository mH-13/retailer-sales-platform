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
 * AdminService
 *
 * What does this service do?
 * - CRUD operations for reference data (regions, areas, territories, distributors)
 * - Bulk assignment of retailers to sales reps
 * - All operations are ADMIN-only (enforced at controller level)
 *
 * Why separate service from controller?
 * - Controller: HTTP concerns (routing, guards, decorators)
 * - Service: Business logic (database operations, validations)
 * - This allows testing business logic without HTTP layer
 * - Follows Single Responsibility Principle
 *
 * Pattern Used: Generic CRUD Methods
 * - Instead of writing findAllRegions, findAllAreas, findAllTerritories...
 * - We write ONE generic method that works for all entities
 * - Less code duplication, easier maintenance
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // REGIONS CRUD
  // ========================================

  /**
   * Get all regions
   *
   * Why no pagination here?
   * - Reference data is small (~10-20 regions max)
   * - Front-end needs all regions for dropdown menus
   * - Caching at client side makes this efficient
   *
   * Interview Q: "What if there were 10,000 regions?"
   * A: "Then I'd add pagination similar to retailers endpoint.
   *     But for reference data, keeping it simple is better since
   *     these lists are typically small and rarely change."
   */
  async findAllRegions() {
    return this.prisma.region.findMany({
      orderBy: { name: 'asc' }, // Alphabetical order for dropdowns
    });
  }

  /**
   * Get single region by ID
   *
   * Why findUnique instead of findFirst?
   * - findUnique: Optimized for unique fields (id, @@unique)
   * - findFirst: Scans table until it finds first match
   * - findUnique is faster and communicates intent better
   */
  async findOneRegion(id: number) {
    const region = await this.prisma.region.findUnique({
      where: { id },
    });

    /**
     * Why throw NotFoundException?
     * - NestJS best practice for RESTful APIs
     * - Automatically returns 404 HTTP status
     * - Client gets clear error message
     *
     * What happens without this check?
     * - Controller would return null
     * - Client gets 200 OK with null body (confusing!)
     * - Not RESTful (404 is correct status for missing resource)
     */
    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  /**
   * Create new region
   *
   * Why async/await?
   * - Prisma returns Promises (database operations are asynchronous)
   * - await waits for database to complete before continuing
   * - Without await, we'd return a Promise instead of actual data
   */
  async createRegion(createRegionDto: CreateRegionDto) {
    /**
     * Duplicate check
     *
     * Why check for duplicates?
     * - Business rule: Region names should be unique
     * - Better UX: Clear error message vs cryptic database error
     * - Database has no unique constraint on name (we could add one)
     *
     * Why ConflictException?
     * - Returns 409 HTTP status (standard for duplicates)
     * - Different from 400 Bad Request (which is for validation errors)
     */
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
   * Update existing region
   *
   * Pattern:
   * 1. Check if exists (throw 404 if not)
   * 2. Check for duplicate name (throw 409 if conflict)
   * 3. Update in database
   * 4. Return updated entity
   */
  async updateRegion(id: number, updateRegionDto: UpdateRegionDto) {
    // Step 1: Verify exists
    await this.findOneRegion(id); // Throws NotFoundException if not found

    // Step 2: Check for duplicate name (if name is being updated)
    if (updateRegionDto.name) {
      const existing = await this.prisma.region.findFirst({
        where: {
          name: updateRegionDto.name,
          NOT: { id }, // Exclude current region from search
        },
      });

      /**
       * Why "NOT: { id }"?
       * - Updating "Dhaka" to "Dhaka" should be allowed (no change)
       * - Without NOT, it would find itself and throw conflict error
       * - With NOT, it only finds OTHER regions with same name
       */
      if (existing) {
        throw new ConflictException(
          `Region with name "${updateRegionDto.name}" already exists`,
        );
      }
    }

    // Step 3: Update
    return this.prisma.region.update({
      where: { id },
      data: updateRegionDto,
    });
  }

  /**
   * Delete region
   *
   * What happens to retailers in this region?
   * - Database has foreign key: retailer.regionId → region.id
   * - Default: CASCADE (deleting region deletes all retailers) ❌ DANGEROUS
   * - Our schema: RESTRICT (prevents deletion if retailers exist) ✅ SAFE
   *
   * Interview Q: "What if admin really wants to delete a region with retailers?"
   * A: "They'd need to first reassign all retailers to a different region,
   *     then delete the empty region. This prevents accidental data loss.
   *     For a 'force delete' feature, I'd add a confirmation step and
   *     cascade delete in a transaction with audit logging."
   */
  async removeRegion(id: number) {
    // Verify exists first
    await this.findOneRegion(id);

    /**
     * Try to delete
     *
     * What if retailers reference this region?
     * - Prisma throws error: "Foreign key constraint failed"
     * - We catch it and return better error message
     */
    try {
      await this.prisma.region.delete({
        where: { id },
      });

      /**
       * Why return message instead of deleted entity?
       * - Deleted entity no longer exists (nothing to return)
       * - Message confirms success
       * - Standard pattern for DELETE endpoints
       */
      return { message: `Region with ID ${id} deleted successfully` };
    } catch (error) {
      /**
       * Why catch database errors?
       * - Database error messages are technical (not user-friendly)
       * - "P2003: Foreign key constraint failed on the field: `regionId`"
       * - Better: "Cannot delete region because it has associated retailers"
       */
      if (error.code === 'P2003') {
        throw new BadRequestException(
          `Cannot delete region because it is referenced by existing retailers`,
        );
      }
      throw error; // Re-throw unexpected errors
    }
  }

  // ========================================
  // AREAS CRUD (Same pattern as Regions)
  // ========================================

  async findAllAreas() {
    return this.prisma.area.findMany({
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
    /**
     * Duplicate check for Area
     *
     * Why check name + regionId?
     * - Schema has: @@unique([name, regionId])
     * - Same area name can exist in different regions
     * - Example: "Downtown" area in both Dhaka and Chittagong (OK)
     * - But can't have two "Downtown" areas in same region (NOT OK)
     */
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

    /**
     * Duplicate check for Area update
     *
     * Why check both name AND regionId?
     * - If updating name: Check new name doesn't exist in SAME region
     * - If updating regionId: Check current name doesn't exist in NEW region
     * - If updating both: Check new name doesn't exist in new region
     *
     * Schema constraint: @@unique([name, regionId])
     */
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
  // TERRITORIES CRUD (Same pattern)
  // ========================================

  async findAllTerritories() {
    return this.prisma.territory.findMany({
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
    /**
     * Duplicate check for Territory
     *
     * Why check name + areaId?
     * - Schema has: @@unique([name, areaId]) (line 73)
     * - Same territory name can exist in different areas
     * - Example: "Block A" in both Gulshan and Banani (OK)
     * - But can't have two "Block A" territories in same area (NOT OK)
     */
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

    /**
     * Duplicate check for Territory update
     *
     * Why check both name AND areaId?
     * - If updating name: Check new name doesn't exist in SAME area
     * - If updating areaId: Check current name doesn't exist in NEW area
     * - If updating both: Check new name doesn't exist in new area
     *
     * Schema constraint: @@unique([name, areaId])
     */
    if (updateTerritoryDto.name || updateTerritoryDto.areaId) {
      const nameToCheck = updateTerritoryDto.name || currentTerritory.name;
      const areaIdToCheck = updateTerritoryDto.areaId || currentTerritory.areaId;

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
  // DISTRIBUTORS CRUD (Same pattern)
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
   * Bulk assign retailers to sales reps
   *
   * What does this do?
   * - Takes multiple SR → Retailers mappings
   * - Creates all assignments in one database transaction
   * - All succeed or all fail (atomicity)
   *
   * Example Input:
   * {
   *   "assignments": [
   *     { "salesRepId": 2, "retailerIds": [1, 2, 3] },
   *     { "salesRepId": 3, "retailerIds": [4, 5, 6] }
   *   ]
   * }
   *
   * Creates 6 rows in sales_rep_retailers table
   */
  async bulkAssignRetailers(bulkAssignmentDto: BulkAssignmentDto) {
    /**
     * Step 1: Validate all Sales Reps exist
     *
     * Why validate first?
     * - Better error messages (which SR is missing?)
     * - Fail fast (don't start transaction if data is invalid)
     * - Prevents partial failures
     */
    const salesRepIds = bulkAssignmentDto.assignments.map(
      (a) => a.salesRepId,
    );
    const uniqueSalesRepIds = [...new Set(salesRepIds)]; // Remove duplicates

    const salesReps = await this.prisma.salesRep.findMany({
      where: {
        id: { in: uniqueSalesRepIds },
        role: 'SR', // Must be Sales Rep role
      },
    });

    /**
     * Check if all requested SRs exist
     *
     * Why this check?
     * - User might send invalid SR IDs (typo, deleted user, etc.)
     * - Database foreign key would catch it, but error is cryptic
     * - This gives clear error: "Sales Rep IDs 99, 100 not found"
     */
    if (salesReps.length !== uniqueSalesRepIds.length) {
      const foundIds = salesReps.map((sr) => sr.id);
      const missingIds = uniqueSalesRepIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new BadRequestException(
        `Sales Rep IDs ${missingIds.join(', ')} not found or not Sales Rep role`,
      );
    }

    /**
     * Step 2: Validate all Retailers exist
     *
     * Same logic as SRs - validate before transaction
     */
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

    /**
     * Step 3: Build assignment records
     *
     * Transform:
     * { salesRepId: 2, retailerIds: [1, 2, 3] }
     *
     * Into:
     * [
     *   { salesRepId: 2, retailerId: 1 },
     *   { salesRepId: 2, retailerId: 2 },
     *   { salesRepId: 2, retailerId: 3 }
     * ]
     */
    const assignmentRecords: { salesRepId: number; retailerId: number }[] = [];
    for (const assignment of bulkAssignmentDto.assignments) {
      for (const retailerId of assignment.retailerIds) {
        assignmentRecords.push({
          salesRepId: assignment.salesRepId,
          retailerId: retailerId,
        });
      }
    }

    /**
     * Step 4: Insert all assignments in a transaction
     *
     * What is a transaction?
     * - A group of database operations that all succeed or all fail
     * - If ANY operation fails, ALL changes are rolled back
     * - Database returns to state before transaction started
     *
     * Why use transaction here?
     * - Atomicity: Either all 100 assignments succeed or none do
     * - Without transaction: 50 might succeed, 51st fails → partial data!
     * - With transaction: All succeed together or database reverts all
     *
     * How does it work?
     * 1. await prisma.$transaction() starts transaction
     * 2. All operations inside use same database connection
     * 3. If exception occurs, automatic ROLLBACK
     * 4. If function completes, automatic COMMIT
     *
     * Interview Q: "When would you NOT use a transaction?"
     * A: "For independent operations where partial success is acceptable.
     *     For example, sending emails - if 5 out of 10 succeed, that's
     *     better than all-or-nothing. But for data consistency like
     *     financial transactions or assignments, atomicity is critical."
     */
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        /**
         * Why skipDuplicates?
         * - If assignment already exists (SR 2 → Retailer 1), skip it
         * - Without this: throws error "Unique constraint violation"
         * - With this: Silently ignores duplicates, continues
         *
         * Trade-off:
         * - Pro: Idempotent (can call multiple times safely)
         * - Con: Hides potential bugs (admin might not know it was duplicate)
         *
         * Alternative: Could return list of skipped duplicates in response
         */
        return tx.salesRepRetailer.createMany({
          data: assignmentRecords,
          skipDuplicates: true, // Ignore if assignment already exists
        });
      });

      /**
       * Return summary
       *
       * result.count = number of NEW assignments created
       * (doesn't count skipped duplicates)
       */
      return {
        message: `Successfully created ${result.count} retailer assignments`,
        created: result.count,
        total: assignmentRecords.length,
        skipped: assignmentRecords.length - result.count,
      };
    } catch (error) {
      /**
       * What errors can occur?
       * - Database connection lost during transaction
       * - Unique constraint (if skipDuplicates fails somehow)
       * - Disk full, permissions, etc.
       *
       * All errors cause automatic ROLLBACK
       */
      throw new BadRequestException(
        `Failed to create assignments: ${error.message}`,
      );
    }
  }

  // ========================================
  // CSV IMPORT
  // ========================================

  /**
   * Import retailers from CSV file
   *
   * What does this do?
   * - Accepts uploaded CSV file
   * - Parses CSV rows into retailer objects
   * - Validates each row (required fields, data types, foreign keys)
   * - Bulk inserts valid retailers into database
   * - Returns summary with success/error counts
   *
   * CSV Format Expected:
   * uid,name,phone,regionId,areaId,distributorId,territoryId,points,routes,notes
   * RET-001,Store Name,01711111111,1,2,3,4,100,"Route A","Good location"
   *
   * Required Fields: uid, name, phone
   * Optional Fields: regionId, areaId, distributorId, territoryId, points, routes, notes
   */
  async importRetailersFromCsv(fileBuffer: Buffer): Promise<{
    success: boolean;
    created: number;
    failed: number;
    errors: Array<{ row: number; uid: string; error: string }>;
  }> {
    /**
     * Step 1: Parse CSV file
     *
     * Why use streams?
     * - Memory efficient (handles large files without loading all into RAM)
     * - Processes rows one by one
     * - Node.js Readable.from() converts Buffer → Stream
     *
     * How csv-parser works:
     * - Reads CSV headers from first row
     * - Converts each row into JavaScript object
     * - Example: "uid,name,phone" → { uid: "RET-001", name: "Store", phone: "..." }
     */
    const rows: any[] = [];
    const stream = Readable.from(fileBuffer.toString());

    /**
     * Parse CSV using Promise wrapper
     *
     * Why Promise wrapper?
     * - csv-parser is stream-based (async)
     * - We need to wait for ALL rows to be parsed
     * - Promise allows us to use async/await
     */
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row: any) => {
          /**
           * 'data' event fires for each CSV row
           * row = { uid: "RET-001", name: "Store", phone: "...", ... }
           */
          rows.push(row);
        })
        .on('end', () => {
          /**
           * 'end' event fires when entire file is parsed
           * All rows are now in rows[] array
           */
          resolve();
        })
        .on('error', (error: any) => {
          /**
           * 'error' event fires if CSV is malformed
           * Example: Invalid encoding, corrupted file
           */
          reject(
            new BadRequestException(`CSV parsing error: ${error.message}`),
          );
        });
    });

    /**
     * Step 2: Validate and transform rows
     *
     * What we're doing:
     * - Check each row has required fields (uid, name, phone)
     * - Convert string numbers to actual numbers (regionId, points, etc.)
     * - Handle empty/null values
     * - Collect validation errors
     */
    const validRetailers: any[] = [];
    const errors: Array<{ row: number; uid: string; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because: row 1 is headers, row 2 is first data row

      /**
       * Validate required fields
       *
       * Why these three?
       * - Schema shows: uid, name, phone are NOT NULL
       * - All other fields are nullable (Int?, String?)
       */
      if (!row.uid || !row.name || !row.phone) {
        errors.push({
          row: rowNumber,
          uid: row.uid || 'MISSING',
          error: 'Missing required fields: uid, name, or phone',
        });
        continue; // Skip this row, move to next
      }

      /**
       * Convert and validate foreign keys
       *
       * Why parseInt?
       * - CSV values are always strings: "1" not 1
       * - Database expects numbers: regionId Int?
       * - parseInt("1") → 1 (number)
       * - parseInt("") → NaN (not a number)
       * - parseInt(undefined) → NaN
       *
       * Why || null?
       * - If field is empty/NaN, set to null (database accepts null for Int?)
       */
      const regionId = parseInt(row.regionId) || null;
      const areaId = parseInt(row.areaId) || null;
      const distributorId = parseInt(row.distributorId) || null;
      const territoryId = parseInt(row.territoryId) || null;
      const points = parseInt(row.points) || 0; // Default to 0 if not provided

      /**
       * Build retailer object for database
       *
       * Structure matches Prisma schema:
       * - uid: String (required)
       * - name: String (required)
       * - phone: String (required)
       * - regionId: Int? (optional, null OK)
       * - areaId: Int? (optional, null OK)
       * - distributorId: Int? (optional, null OK)
       * - territoryId: Int? (optional, null OK)
       * - points: Int (defaults to 0)
       * - routes: String? (optional, null OK)
       * - notes: String? (optional, null OK)
       */
      validRetailers.push({
        uid: row.uid.trim(), // trim() removes whitespace
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

    /**
     * Step 3: Validate foreign keys exist (if provided)
     *
     * Why validate?
     * - Database foreign key constraints will fail if IDs don't exist
     * - Better to give clear error message BEFORE database operation
     * - Batch validation (check all IDs in one query per table)
     */

    // Collect all unique IDs that were provided (not null)
    const regionIds = [
      ...new Set(
        validRetailers
          .map((r) => r.regionId)
          .filter((id) => id !== null),
      ),
    ];
    const areaIds = [
      ...new Set(
        validRetailers
          .map((r) => r.areaId)
          .filter((id) => id !== null),
      ),
    ];
    const distributorIds = [
      ...new Set(
        validRetailers
          .map((r) => r.distributorId)
          .filter((id) => id !== null),
      ),
    ];
    const territoryIds = [
      ...new Set(
        validRetailers
          .map((r) => r.territoryId)
          .filter((id) => id !== null),
      ),
    ];

    /**
     * Batch validate foreign keys
     *
     * Why parallel queries?
     * - All 4 queries are independent
     * - Promise.all runs them simultaneously
     * - Faster than sequential (4 queries in parallel vs 4 in series)
     */
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

      /**
       * Check for missing foreign keys
       *
       * Logic:
       * - foundIds = IDs that exist in database
       * - missingIds = IDs in CSV but NOT in database
       */
      const foundRegionIds = regions.map((r) => r.id);
      const foundAreaIds = areas.map((a) => a.id);
      const foundDistributorIds = distributors.map((d) => d.id);
      const foundTerritoryIds = territories.map((t) => t.id);

      const missingRegionIds = regionIds.filter(
        (id) => !foundRegionIds.includes(id),
      );
      const missingAreaIds = areaIds.filter(
        (id) => !foundAreaIds.includes(id),
      );
      const missingDistributorIds = distributorIds.filter(
        (id) => !foundDistributorIds.includes(id),
      );
      const missingTerritoryIds = territoryIds.filter(
        (id) => !foundTerritoryIds.includes(id),
      );

      /**
       * Add errors for retailers with invalid foreign keys
       *
       * For each retailer, check if it uses a missing ID
       * If yes, add to errors array and remove from validRetailers
       */
      validRetailers.forEach((retailer, index) => {
        if (
          retailer.regionId &&
          missingRegionIds.includes(retailer.regionId)
        ) {
          errors.push({
            row: index + 2,
            uid: retailer.uid,
            error: `Region ID ${retailer.regionId} not found`,
          });
          validRetailers.splice(index, 1); // Remove from valid list
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

    /**
     * Step 4: Bulk insert valid retailers
     *
     * Why transaction?
     * - All retailers succeed or all fail (atomicity)
     * - If one fails (e.g., duplicate UID), entire import rolls back
     * - Database returns to state before import
     *
     * Why skipDuplicates?
     * - uid is UNIQUE in schema
     * - If UID already exists, skip that record
     * - Continue inserting other valid records
     *
     * Trade-off decision:
     * - WITHOUT skipDuplicates: One duplicate fails entire import
     * - WITH skipDuplicates: Duplicates are silently skipped
     * - We chose skipDuplicates for better UX (partial success OK)
     */
    let createdCount = 0;

    if (validRetailers.length > 0) {
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          return tx.retailer.createMany({
            data: validRetailers,
            skipDuplicates: true, // Skip if UID already exists
          });
        });

        createdCount = result.count; // Number of records actually inserted

        /**
         * Track skipped duplicates
         *
         * If validRetailers.length = 100 but result.count = 95
         * → 5 retailers were skipped (duplicate UIDs)
         */
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
        /**
         * What errors can occur here?
         * - Database connection lost
         * - Validation constraint failed (shouldn't happen, we pre-validated)
         * - Transaction timeout
         */
        throw new BadRequestException(
          `Failed to import retailers: ${error.message}`,
        );
      }
    }

    /**
     * Step 5: Return summary
     *
     * Response format:
     * {
     *   "success": true,
     *   "created": 95,
     *   "failed": 5,
     *   "errors": [
     *     { "row": 3, "uid": "RET-001", "error": "Region ID 99 not found" },
     *     { "row": 7, "uid": "RET-005", "error": "Missing required fields" }
     *   ]
     * }
     */
    return {
      success: createdCount > 0,
      created: createdCount,
      failed: errors.length,
      errors,
    };
  }
}
