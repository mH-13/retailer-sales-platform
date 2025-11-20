import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma database service with connection lifecycle management
 *
 * Extends PrismaClient and handles connect/disconnect on module init/destroy
 * Provides singleton database instance for dependency injection
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Connect to database on module initialization
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  /**
   * Gracefully disconnect from database on app shutdown
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }
}
