import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Login request validation DTO
 *
 * Validates username (min 3 chars) and password (min 6 chars)
 * Uses class-validator decorators for automatic validation
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
