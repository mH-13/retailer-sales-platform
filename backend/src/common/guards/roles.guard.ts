import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Role-based authorization guard
 *
 * Checks if authenticated user has required role(s) set by @Roles() decorator
 * Uses Reflector to read metadata and compare with user.role
 * Must be used after JwtAuthGuard (requires request.user)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determine if user has required role
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(), // Method level
      context.getClass(), // Class level
    ]);

    if (!requiredRoles) {
      return true; // No role restriction
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by JwtAuthGuard

    return requiredRoles.some((role) => user?.role === role);
  }
}
