import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/**
 * Admin module for reference data management
 *
 * Provides 21 ADMIN-only endpoints:
 * - CRUD for regions, areas, territories, distributors (20 endpoints)
 * - Bulk assignment endpoint (1 endpoint)
 *
 * No imports needed - PrismaModule is @Global
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
