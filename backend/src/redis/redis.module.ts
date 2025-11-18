import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * RedisModule: Makes caching available everywhere
 *
 * What @Global() means:
 * - Makes RedisService available in all modules without importing RedisModule
 * - Same pattern as PrismaModule
 *
 * Why global:
 * - Caching is a cross-cutting concern (used in multiple modules)
 * - Avoids repetitive imports in every feature module
 * - Single Redis connection shared across app
 *
 * Usage in other services:
 * ```typescript
 * constructor(private redis: RedisService) {}
 *
 * async getRetailers() {
 *   const cached = await this.redis.get('key');
 *   if (cached) return JSON.parse(cached);
 *   // ... fetch from database
 * }
 * ```
 */
@Global() // Makes this module available everywhere
@Module({
  providers: [RedisService],
  exports: [RedisService], // Other modules can inject RedisService
})
export class RedisModule {}
