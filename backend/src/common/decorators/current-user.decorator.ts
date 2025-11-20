import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator to extract authenticated user from request
 *
 * Usage: @CurrentUser() user or @CurrentUser('id') userId
 * Requires JwtAuthGuard to populate request.user
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard

    // Return specific field if requested, otherwise return entire user
    return data ? user?.[data] : user;
  },
);
