import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Global Redis module for caching
 *
 * @Global makes RedisService available everywhere without repeated imports
 * Single Redis connection shared across the application
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
