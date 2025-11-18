import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * AuthModule: Authentication module configuration
 *
 * What this module provides:
 * - Login endpoint (POST /auth/login)
 * - JWT token generation
 * - JWT token validation via JwtStrategy
 * - Passport integration for protected routes
 *
 * Module structure:
 * - imports: Other modules we depend on
 * - controllers: HTTP endpoints (AuthController)
 * - providers: Services and strategies (AuthService, JwtStrategy)
 * - exports: What we make available to other modules (JwtStrategy)
 *
 * Why export JwtStrategy?
 * - Other modules need it for @UseGuards(JwtAuthGuard)
 * - Guards use JwtStrategy to validate tokens
 *
 * JwtModule.registerAsync() explanation:
 * - registerAsync: Loads config asynchronously
 * - useFactory: Factory function to create JWT config
 * - inject: Dependencies needed by factory (ConfigService)
 * - This pattern allows us to use .env values
 */
@Module({
  imports: [
    // PassportModule: Required for passport strategies
    PassportModule,

    // JwtModule: Configure JWT token generation
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // Secret key for signing tokens (from .env)
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',

        // Token expiration time (from .env, default 7 days)
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController], // POST /auth/login
  providers: [
    AuthService,   // Business logic
    JwtStrategy,   // Token validation
  ],
  exports: [JwtStrategy], // Make strategy available for guards
})
export class AuthModule {}
