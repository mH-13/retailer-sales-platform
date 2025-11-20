import { Module } from '@nestjs/common';
import { RetailersController } from './retailers.controller';
import { RetailersService } from './retailers.service';

/**
 * Retailers feature module
 *
 * Provides 3 HTTP endpoints (list, detail, update) with business logic
 * No imports needed - uses global PrismaModule and RedisModule
 */
@Module({
  controllers: [RetailersController],
  providers: [RetailersService],
})
export class RetailersModule {}
