import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

/**
 * AppModule: Root module of the application
 *
 * What happens here:
 * - ConfigModule.forRoot(): Loads .env file variables (DATABASE_URL, JWT_SECRET, etc.)
 * - PrismaModule: Provides database access to entire app (@Global module)
 *
 * Why ConfigModule.forRoot({ isGlobal: true })?
 * - Makes environment variables available everywhere
 * - No need to import ConfigModule in every feature module
 */
@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
    // Database connection (global module)
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
