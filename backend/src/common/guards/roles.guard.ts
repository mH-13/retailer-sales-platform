import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RolesGuard: Checks if user has required role
 *
 * What this guard does:
 * - Checks if user's role matches required role(s)
 * - Used after JwtAuthGuard (needs request.user to exist)
 * - Works with @Roles() decorator
 *
 * How it works:
 * 1. @Roles('ADMIN') decorator sets metadata on route
 * 2. This guard reads that metadata using Reflector
 * 3. Compares user's role with required roles
 * 4. If match: return true (allow access)
 * 5. If no match: return false (403 Forbidden)
 *
 * Usage example:
 * ```typescript
 * @Post('/admin/regions')
 * @UseGuards(JwtAuthGuard, RolesGuard)  // Order matters!
 * @Roles('ADMIN')  // Only admins allowed
 * async createRegion() {
 *   // Only ADMINs reach here
 * }
 * ```
 *
 * Guard execution order:
 * 1. JwtAuthGuard: Validates token, populates request.user
 * 2. RolesGuard: Checks request.user.role matches @Roles()
 *
 * Why Reflector?
 * - Reflector reads metadata set by decorators
 * - @Roles('ADMIN') sets metadata: { roles: ['ADMIN'] }
 * - This guard reads that metadata to check permissions
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determine if user has required role
   *
   * @param context - Execution context (contains request, handler, etc.)
   * @returns true if user has role, false otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    // 'roles' is the metadata key set by @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),  // Method level: @Roles() on specific route
      context.getClass(),    // Class level: @Roles() on entire controller
    ]);

    // If no @Roles() decorator, allow access (no role restriction)
    if (!requiredRoles) {
      return true;
    }

    // Get user from request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and has one of the required roles
    // Example: requiredRoles = ['ADMIN'], user.role = 'ADMIN' → true
    // Example: requiredRoles = ['ADMIN'], user.role = 'SR' → false
    return requiredRoles.some((role) => user?.role === role);
  }
}
