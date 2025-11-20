import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global Prisma module for database access
 *
 * @Global makes PrismaService available everywhere without repeated imports
 * Exports PrismaService for dependency injection across the application
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Other modules can use PrismaService
})
export class PrismaModule {}
