import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard: Protects routes requiring authentication
 *
 * What is a Guard?
 * - Guards determine if a request should be handled or rejected
 * - Execute before route handler (controller method)
 * - Return true: request proceeds
 * - Return false/throw error: request blocked with 401 Unauthorized
 *
 * How this works:
 * 1. @UseGuards(JwtAuthGuard) on a route
 * 2. AuthGuard('jwt') calls JwtStrategy automatically
 * 3. JwtStrategy validates token and returns user
 * 4. If successful, request.user is populated
 * 5. Route handler can access user via @CurrentUser()
 *
 * Usage example:
 * ```typescript
 * @Get('/retailers')
 * @UseGuards(JwtAuthGuard)
 * async getRetailers(@CurrentUser() user) {
 *   // Only authenticated users reach here
 *   // user object available
 * }
 * ```
 *
 * Why extend AuthGuard('jwt')?
 * - AuthGuard is from @nestjs/passport
 * - 'jwt' tells it to use JwtStrategy
 * - This is NestJS pattern for Passport integration
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
