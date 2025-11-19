import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/**
 * AdminModule
 *
 * What does this module provide?
 * - Admin-only endpoints for managing reference data
 * - 20 CRUD endpoints total (5 per entity × 4 entities)
 * - 1 bulk assignment endpoint
 * - Total: 21 endpoints, all ADMIN-only
 *
 * Module Structure:
 * - Controllers: [AdminController] - HTTP layer
 * - Providers: [AdminService] - Business logic layer
 * - Imports: None needed (PrismaModule is @Global)
 *
 * Why no imports?
 * - AdminService uses PrismaService
 * - PrismaModule is marked as @Global() in prisma.module.ts
 * - Global modules are automatically available everywhere
 * - No need to import PrismaModule here
 *
 * Interview Q: "What if PrismaModule wasn't global?"
 * A: "We'd need to add: imports: [PrismaModule]
 *     Every module that uses PrismaService would need this import.
 *     Making it global reduces boilerplate and ensures consistency."
 *
 * Endpoints Provided:
 *
 * Regions (5 endpoints):
 * - GET    /admin/regions
 * - GET    /admin/regions/:id
 * - POST   /admin/regions
 * - PUT    /admin/regions/:id
 * - DELETE /admin/regions/:id
 *
 * Areas (5 endpoints):
 * - GET    /admin/areas
 * - GET    /admin/areas/:id
 * - POST   /admin/areas
 * - PUT    /admin/areas/:id
 * - DELETE /admin/areas/:id
 *
 * Territories (5 endpoints):
 * - GET    /admin/territories
 * - GET    /admin/territories/:id
 * - POST   /admin/territories
 * - PUT    /admin/territories/:id
 * - DELETE /admin/territories/:id
 *
 * Distributors (5 endpoints):
 * - GET    /admin/distributors
 * - GET    /admin/distributors/:id
 * - POST   /admin/distributors
 * - PUT    /admin/distributors/:id
 * - DELETE /admin/distributors/:id
 *
 * Bulk Operations (1 endpoint):
 * - POST /admin/assignments/bulk
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
