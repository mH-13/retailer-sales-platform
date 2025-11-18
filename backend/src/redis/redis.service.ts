import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

/**
 * RedisService: Simple caching service
 *
 * What it does:
 * - Provides simple get/set/delete operations for caching
 * - Uses cache-aside pattern (manual caching)
 * - Automatically connects using environment variables
 *
 * Why we need this:
 * - Speed: Redis is in-memory (1-2ms) vs PostgreSQL (20-50ms)
 * - Reduce load: Avoid repeated database queries for same data
 * - Scalability: Can handle millions of requests with caching
 *
 * Cache-Aside Pattern:
 * 1. Try to get from cache
 * 2. If not found (cache miss): query database, store in cache, return
 * 3. If found (cache hit): return immediately
 *
 * Example usage:
 * ```typescript
 * // Store data
 * await this.redis.set('retailers:sr:1', JSON.stringify(data), 300); // 5 min TTL
 *
 * // Retrieve data
 * const cached = await this.redis.get('retailers:sr:1');
 * if (cached) return JSON.parse(cached);
 *
 * // Delete (invalidate cache)
 * await this.redis.del('retailers:sr:1');
 * ```
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {
    // Connect to Redis using environment variables
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      retryStrategy: (times) => {
        // Retry connection every 3 seconds (max 10 attempts)
        if (times > 10) {
          console.error('❌ Redis connection failed after 10 attempts');
          return null; // Stop retrying
        }
        return 3000; // Wait 3 seconds before retry
      },
    });

    // Log connection events
    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Store value in cache with TTL (Time To Live)
   * @param key - Cache key
   * @param value - Value to cache (usually JSON.stringify())
   * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set(key: string, value: string, ttl: number = 300): Promise<void> {
    await this.client.setex(key, ttl, value);
  }

  /**
   * Delete value from cache (cache invalidation)
   * @param key - Cache key to delete
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
   * @param key - Cache key
   * @returns true if exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * OnModuleDestroy: Gracefully disconnect from Redis on app shutdown
   */
  async onModuleDestroy() {
    await this.client.quit();
    console.log('👋 Redis disconnected');
  }
}
