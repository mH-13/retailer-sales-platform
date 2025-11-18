import { Module } from '@nestjs/common';
import { RetailersController } from './retailers.controller';
import { RetailersService } from './retailers.service';

/**
 * RetailersModule: Retailers feature module
 *
 * What this module provides:
 * - 3 HTTP endpoints (list, detail, update)
 * - Business logic for retailer operations
 * - Integration with Prisma (database) and Redis (cache)
 *
 * Module structure:
 * - controllers: [RetailersController] - HTTP layer
 * - providers: [RetailersService] - Business logic
 * - No imports needed! PrismaModule and RedisModule are @Global()
 *
 * Why no imports?
 * - PrismaModule is @Global() (imported once in AppModule)
 * - RedisModule is @Global() (imported once in AppModule)
 * - JwtAuthGuard uses JwtStrategy from AuthModule (also global)
 *
 * This is the beauty of global modules:
 * - No need to import dependencies in every feature module
 * - Just inject what you need in constructor
 * - Clean, DRY code
 *
 * Dependency injection in this module:
 * RetailersController → depends on → RetailersService
 * RetailersService → depends on → PrismaService, RedisService
 *
 * NestJS IoC container automatically:
 * 1. Creates PrismaService instance (from global module)
 * 2. Creates RedisService instance (from global module)
 * 3. Injects them into RetailersService constructor
 * 4. Creates RetailersService instance
 * 5. Injects it into RetailersController constructor
 * 6. Creates RetailersController instance
 * 7. Registers routes with Express
 *
 * All happens automatically! We just declare dependencies.
 */
@Module({
  controllers: [RetailersController],  // Handles HTTP requests
  providers: [RetailersService],       // Business logic
})
export class RetailersModule {}
