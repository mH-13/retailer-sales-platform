import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * JWT authentication strategy using Passport
 *
 * Validates JWT tokens from Authorization header and populates request.user
 * Flow: Extract token → Verify signature → Call validate() → Attach user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
    });
  }

  /**
   * Validate JWT payload and return user object
   *
   * Called after token signature verification - gets fresh user data from DB
   * @param payload - Decoded JWT payload { sub, username, role, iat, exp }
   * @returns User object attached to request.user
   */
  async validate(payload: any) {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user; // Available as request.user in controllers
  }
}
