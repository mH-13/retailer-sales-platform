import { SetMetadata } from '@nestjs/common';

/**
 * @Roles() decorator: Set required roles for a route
 *
 * What is SetMetadata?
 * - Sets custom metadata on a route/controller
 * - Metadata can be read by guards, interceptors, etc.
 * - This is how RolesGuard knows which roles are required
 *
 * How it works:
 * 1. @Roles('ADMIN') sets metadata: { roles: ['ADMIN'] }
 * 2. RolesGuard reads this metadata using Reflector
 * 3. RolesGuard compares user.role with required roles
 * 4. If match: allow access, else: 403 Forbidden
 *
 * Usage examples:
 * ```typescript
 * // Single role
 * @Roles('ADMIN')
 * @Post('/regions')
 * async createRegion() { }
 *
 * // Multiple roles (user needs at least one)
 * @Roles('ADMIN', 'SR')
 * @Get('/retailers')
 * async getRetailers() { }
 *
 * // On entire controller (all routes require ADMIN)
 * @Controller('admin')
 * @Roles('ADMIN')
 * export class AdminController { }
 * ```
 *
 * Must be used with guards:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)  // Order: auth first, then roles
 * @Roles('ADMIN')
 * ```
 *
 * Why separate decorator?
 * - Declarative: Clear what role is required
 * - Reusable: Same pattern across all routes
 * - Flexible: Can require different roles per route
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
