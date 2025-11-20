import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 * Authentication controller
 *
 * Handles login endpoint with JWT token generation
 * Returns 200 OK for login (not 201 Created) following REST conventions
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/login - Authenticate and receive JWT token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Return 200 OK instead of 201 Created
  @ApiOperation({
    summary: 'Login to get JWT token',
    description:
      'Authenticate with username and password to receive a JWT access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - returns JWT token and user details',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          username: 'karim_sr',
          name: 'Karim Ahmed',
          role: 'SR',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - username or password missing/invalid',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
