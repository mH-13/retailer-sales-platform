import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 * AuthController: Handles authentication endpoints
 *
 * What @Controller('auth') means:
 * - All routes in this controller start with /auth
 * - Example: @Post('login') becomes POST /auth/login
 *
 * Why @HttpCode(HttpStatus.OK)?
 * - By default, @Post returns 201 Created
 * - Login should return 200 OK (standard practice)
 * - HttpStatus.OK is more readable than magic number 200
 *
 * Request/Response flow:
 * 1. Client: POST /auth/login { username, password }
 * 2. NestJS: Validates LoginDto (class-validator)
 * 3. Controller: Passes to AuthService
 * 4. AuthService: Validates credentials, generates JWT
 * 5. Controller: Returns { access_token, user }
 * 6. Client: Stores token, uses in future requests
 *
 * Swagger Decorators:
 * - @ApiTags('Authentication'): Groups all auth endpoints under "Authentication" in Swagger UI
 * - @ApiOperation(): Describes what each endpoint does
 * - @ApiResponse(): Documents possible HTTP responses (success and errors)
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Login endpoint
   *
   * POST /auth/login
   * Body: { "username": "karim_sr", "password": "password123" }
   *
   * Success Response (200 OK):
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": {
   *     "id": 1,
   *     "username": "karim_sr",
   *     "name": "Karim Ahmed",
   *     "role": "SR"
   *   }
   * }
   *
   * Error Response (401 Unauthorized):
   * {
   *   "statusCode": 401,
   *   "message": "Invalid credentials"
   * }
   *
   * Swagger Decorators:
   * - @ApiOperation(): Shows "Login to get JWT token" in Swagger UI
   * - @ApiResponse() 200: Documents successful login response
   * - @ApiResponse() 401: Documents authentication failure
   * - @ApiResponse() 400: Documents validation errors (from LoginDto)
   *
   * @param loginDto - Validated login credentials
   * @returns JWT token and user info
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Return 200 instead of 201
  @ApiOperation({
    summary: 'Login to get JWT token',
    description: 'Authenticate with username and password to receive a JWT access token',
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
