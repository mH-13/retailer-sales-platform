import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * LoginDto: Validates login request body
 *
 * What is a DTO?
 * - Data Transfer Object: Defines shape of data coming from client
 * - Uses class-validator decorators for automatic validation
 * - NestJS automatically validates this before reaching controller
 *
 * Validation decorators:
 * - @IsString(): Must be a string type
 * - @IsNotEmpty(): Cannot be empty/null/undefined
 * - @MinLength(3): Minimum 3 characters
 *
 * Example request:
 * POST /auth/login
 * {
 *   "username": "karim_sr",
 *   "password": "password123"
 * }
 *
 * If validation fails, NestJS automatically returns 400 Bad Request
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
