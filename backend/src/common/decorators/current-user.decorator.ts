import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() decorator: Extract user from request
 *
 * What is a parameter decorator?
 * - Custom decorator for controller method parameters
 * - Extracts specific data from request
 * - Makes code cleaner and more readable
 *
 * How it works:
 * 1. JwtAuthGuard validates token and sets request.user
 * 2. @CurrentUser() extracts request.user
 * 3. Controller receives user object directly
 *
 * Usage example:
 * ```typescript
 * // Without decorator (verbose):
 * async getRetailers(@Request() req) {
 *   const user = req.user;
 *   return this.service.getRetailers(user.id);
 * }
 *
 * // With decorator (clean):
 * async getRetailers(@CurrentUser() user) {
 *   return this.service.getRetailers(user.id);
 * }
 * ```
 *
 * You can also extract specific fields:
 * ```typescript
 * @CurrentUser('id') userId: number
 * @CurrentUser('role') userRole: string
 * ```
 *
 * Why this is better:
 * - Cleaner code
 * - Type-safe (user object has proper types from Prisma)
 * - Consistent across all controllers
 * - Easy to test (can mock user object)
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Get HTTP request from execution context
    const request = ctx.switchToHttp().getRequest();

    // Get user object (set by JwtAuthGuard via JwtStrategy)
    const user = request.user;

    // If data provided, return specific field
    // Example: @CurrentUser('id') returns user.id
    if (data) {
      return user?.[data];
    }

    // Otherwise return entire user object
    return user;
  },
);
