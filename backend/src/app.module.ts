import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { RetailersModule } from './retailers/retailers.module';
import { AdminModule } from './admin/admin.module';

/**
 * Root application module
 *
 * Imports global modules (Config, Prisma, Redis) and feature modules (Auth, Retailers, Admin)
 * ConfigModule.forRoot() loads .env variables globally
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
    PrismaModule, // Database (global)
    RedisModule, // Caching (global)
    AuthModule, // Authentication
    RetailersModule, // Retailer management
    AdminModule, // Admin CRUD operations
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
