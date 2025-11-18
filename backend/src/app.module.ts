import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

/**
 * AppModule: Root module of the application
 *
 * What happens here:
 * - ConfigModule.forRoot(): Loads .env file variables (DATABASE_URL, JWT_SECRET, etc.)
 * - PrismaModule: Provides database access to entire app (@Global module)
 * - RedisModule: Provides caching to entire app (@Global module)
 *
 * Why ConfigModule.forRoot({ isGlobal: true })?
 * - Makes environment variables available everywhere
 * - No need to import ConfigModule in every feature module
 *
 * Module loading order:
 * 1. ConfigModule (loads .env first)
 * 2. PrismaModule (needs DATABASE_URL from config)
 * 3. RedisModule (needs REDIS_HOST, REDIS_PORT from config)
 */
@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
    // Database connection (global module)
    PrismaModule,
    // Redis caching (global module)
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
