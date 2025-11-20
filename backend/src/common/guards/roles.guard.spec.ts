import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    // No @Roles() decorator on the route
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const mockContext = createMockContext({ role: 'SR' });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    // @Roles('ADMIN') decorator
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const mockContext = createMockContext({ role: 'ADMIN' });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    // @Roles('ADMIN') decorator
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    // User is SR, but route requires ADMIN
    const mockContext = createMockContext({ role: 'SR' });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it('should allow access when user has one of multiple required roles', () => {
    // @Roles('ADMIN', 'MANAGER') decorator
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'MANAGER']);

    // User is ADMIN (one of the required roles)
    const mockContext = createMockContext({ role: 'ADMIN' });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  // Helper function to create mock execution context
  function createMockContext(user: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  }
});
