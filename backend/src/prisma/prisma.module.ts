import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule: Makes database access available everywhere
 *
 * What @Global() means:
 * - Without @Global(): Every module that needs Prisma must import PrismaModule
 * - With @Global(): Import once in AppModule, available everywhere
 *
 * What exports does:
 * - Makes PrismaService available to other modules
 * - Other modules can now inject PrismaService in their constructors
 *
 * Why this pattern:
 * - Single database connection shared across entire app
 * - No need to import PrismaModule in every feature module
 * - Clean, DRY (Don't Repeat Yourself) code
 *
 * Example:
 * ```typescript
 * // In app.module.ts
 * imports: [PrismaModule, AuthModule, RetailersModule]
 *
 * // In retailers.service.ts (no need to import PrismaModule again!)
 * constructor(private prisma: PrismaService) {}
 * ```
 */
@Global() // Makes this module available everywhere without repeated imports
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Other modules can use PrismaService
})
export class PrismaModule {}
