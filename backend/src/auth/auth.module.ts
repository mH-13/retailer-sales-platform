import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Authentication module with JWT configuration
 *
 * Provides login endpoint, JWT generation/validation, and Passport integration
 * Uses registerAsync to load JWT config from environment variables
 */
@Module({
  imports: [
    PassportModule, // Required for passport strategies

    // JWT configuration with async environment loading
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        // Token expiration (default 7 days)
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ||
            '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, // Business logic
    JwtStrategy, // Token validation
  ],
  exports: [JwtStrategy], // Available for guards
})
export class AuthModule {}
