import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
 */
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
   * @param loginDto - Validated login credentials
   * @returns JWT token and user info
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Return 200 instead of 201
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
