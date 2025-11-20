import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

/**
 * Redis caching service with cache-aside pattern implementation
 *
 * Provides get/set/delete operations with TTL support
 * Performance: Redis (1-2ms) vs PostgreSQL (20-50ms)
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      retryStrategy: (times) => {
        if (times > 10) {
          console.error('❌ Redis connection failed after 10 attempts');
          return null;
        }
        return 3000; // Retry every 3 seconds
      },
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Store value in cache with TTL
   * @param ttl - Time to live in seconds (default: 300)
   */
  async set(key: string, value: string, ttl: number = 300): Promise<void> {
    await this.client.setex(key, ttl, value);
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Delete multiple keys matching a pattern
   * Example: delPattern('retailers:sr:*') deletes all SR caches
   * @param pattern - Key pattern (supports * wildcard)
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Gracefully disconnect from Redis on app shutdown
   */
  async onModuleDestroy() {
    await this.client.quit();
    console.log('👋 Redis disconnected');
  }
}
