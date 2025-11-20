import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT authentication guard
 *
 * Protects routes by validating JWT tokens via JwtStrategy
 * Populates request.user on successful authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
