import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService: Database Connection Manager
 *
 * What it does:
 * - Extends PrismaClient to get all database query methods
 * - Manages connection lifecycle (connect on init, disconnect on destroy)
 * - Provides singleton instance throughout the application
 *
 * Why we need this:
 * - NestJS Dependency Injection: Can inject this service anywhere
 * - Connection pooling: One client, multiple queries
 * - Graceful shutdown: Properly closes connections on app shutdown
 *
 * Usage example:
 * ```typescript
 * constructor(private prisma: PrismaService) {}
 *
 * async findUser() {
 *   return this.prisma.salesRep.findUnique({ where: { id: 1 } });
 * }
 * ```
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * OnModuleInit: Called when NestJS initializes this module
   * We connect to the database here
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  /**
   * OnModuleDestroy: Called when app shuts down
   * We gracefully close database connections here
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }
}
