import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

/**
 * AuthService: Handles authentication business logic
 *
 * What this service does:
 * - Validates user credentials (username + password)
 * - Generates JWT tokens for valid users
 * - Handles password comparison using bcrypt
 *
 * Why bcrypt?
 * - Passwords are hashed in database (never store plain text!)
 * - bcrypt.compare() safely compares input with hash
 * - One-way function: can't reverse hash to get password
 *
 * JWT Token contains:
 * - sub (subject): user ID
 * - username: user's username
 * - role: 'ADMIN' or 'SR'
 * - iat (issued at): timestamp
 * - exp (expires): timestamp (7 days from .env)
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
   * Flow:
   * 1. Find user by username
   * 2. Check if user exists and is active
   * 3. Compare password with hashed password
   * 4. If valid, generate JWT token
   * 5. Return token + user info
   *
   * @param loginDto - { username, password }
   * @returns { access_token, user: { id, username, name, role } }
   * @throws UnauthorizedException if credentials invalid
   */
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Step 1: Find user in database
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

    // Step 2: Check if user exists
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Step 3: Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Step 4: Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Step 5: Generate JWT token
    const payload = {
      sub: user.id,         // Standard JWT claim (subject = user ID)
      username: user.username,
      role: user.role,      // 'ADMIN' or 'SR'
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
   * This is called automatically when a protected route is accessed
   * JWT Strategy decodes the token and passes payload here
   *
   * @param payload - Decoded JWT payload { sub, username, role }
   * @returns User info to attach to request object
   */
  async validateUser(payload: any) {
    // Get fresh user data from database
    // This ensures user still exists and is active
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
}
