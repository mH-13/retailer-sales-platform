import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

/**
 * Authentication service
 * Handles user login, password validation with bcrypt, and JWT token generation
 *
 * JWT Token contains: sub (user ID), username, role, iat, exp
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials and return JWT token
   *
   * Flow: Find user → Check active → Compare password → Generate token
   * @param loginDto - { username, password }
   * @returns { access_token, user: { id, username, name, role } }
   * @throws UnauthorizedException if credentials invalid
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find user by username
    const user = await this.prisma.salesRep.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    // Check if user exists
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Compare password with hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token payload
    const payload = {
      sub: user.id, // Standard JWT claim (subject = user ID)
      username: user.username,
      role: user.role, // 'ADMIN' or 'SR'
    };

    const access_token = this.jwtService.sign(payload);

    // Return token and safe user info (no password!)
    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Validate JWT payload (called by JWT Strategy)
   *
   * Called automatically when protected route is accessed
   * @param payload - Decoded JWT payload { sub, username, role }
   * @returns User info to attach to request object
   */
  async validateUser(payload: any) {
    // Get fresh user data from database to ensure user still exists and is active
    const user = await this.prisma.salesRep.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user; // This gets attached to request.user
  }

  /**
   * Get user profile by ID
   * Used for validating tokens and fetching fresh user data
   * @param userId - User ID from JWT token
   * @returns User profile without password
   */
  async getProfile(userId: number) {
    const user = await this.prisma.salesRep.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }
}
