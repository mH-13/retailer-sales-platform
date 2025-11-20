import { SetMetadata } from '@nestjs/common';

/**
 * Role-based authorization decorator
 *
 * Sets metadata for RolesGuard to check user permissions
 * Usage: @Roles('ADMIN') or @Roles('ADMIN', 'SR')
 * Must be used with JwtAuthGuard and RolesGuard
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
