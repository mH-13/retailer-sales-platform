import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * JwtStrategy: Validates JWT tokens on protected routes
 *
 * What is Passport?
 * - Authentication middleware for Node.js
 * - Supports many strategies (JWT, OAuth, Local, etc.)
 * - NestJS integrates with it via @nestjs/passport
 *
 * How JWT Strategy works:
 * 1. Client sends request with header: Authorization: Bearer <token>
 * 2. ExtractJwt extracts token from header
 * 3. passport-jwt verifies token signature using JWT_SECRET
 * 4. If valid, calls validate() method with decoded payload
 * 5. validate() returns user object
 * 6. User object is attached to request (accessible via @CurrentUser())
 *
 * Why extend PassportStrategy(Strategy)?
 * - PassportStrategy is NestJS wrapper around passport
 * - Strategy is from 'passport-jwt' package
 * - This makes JWT validation work automatically
 *
 * Protected route example:
 * ```typescript
 * @Get('/retailers')
 * @UseGuards(JwtAuthGuard)  // This triggers JWT validation
 * async getRetailers(@CurrentUser() user) {
 *   // user object comes from validate() method below
 * }
 * ```
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      // Where to extract JWT from request
      // This looks for: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // If true, expired tokens are accepted (not recommended!)
      // If false, expired tokens throw error (secure, recommended)
      ignoreExpiration: false,

      // Secret key to verify token signature
      // Must match the key used to sign token in AuthService
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
    });
  }

  /**
   * Validate JWT payload
   *
   * This method is called AFTER passport-jwt verifies the token signature
   * Payload is the decoded JWT (contains: sub, username, role, iat, exp)
   *
   * What we do here:
   * - Call authService.validateUser() to get fresh user data from DB
   * - This ensures user still exists and is active
   * - Return value is attached to request.user
   *
   * @param payload - Decoded JWT payload { sub, username, role, iat, exp }
   * @returns User object that will be available in request.user
   */
  async validate(payload: any) {
    // Get fresh user data from database
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // This object will be available as request.user in controllers
    return user;
  }
}
