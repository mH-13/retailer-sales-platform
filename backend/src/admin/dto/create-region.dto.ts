import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * CreateRegionDto
 *
 * What is this?
 * - A Data Transfer Object (DTO) that validates incoming data when creating a region
 * - Ensures admins provide valid data before we touch the database
 *
 * Why do we need this?
 * - Prevents empty or invalid region names from being created
 * - Provides clear error messages to the client
 * - Security: Validates input before database operations
 *
 * Example valid request:
 * POST /admin/regions
 * { "name": "Sylhet" }  ✅
 *
 * Example invalid requests:
 * { "name": "" }        ❌ Empty string (fails @IsNotEmpty)
 * { "name": "AB" }      ❌ Too short (fails @MinLength(3))
 * { "name": 123 }       ❌ Not a string (fails @IsString)
 * { }                   ❌ Missing name (fails @IsNotEmpty)
 */
export class CreateRegionDto {
  /**
   * Region name (required)
   *
   * Validation Rules:
   * - @IsNotEmpty(): Cannot be empty string or null/undefined
   * - @IsString(): Must be a string type
   * - @MinLength(3): Minimum 3 characters (prevents "AB", "X")
   * - @MaxLength(100): Maximum 100 characters (prevents abuse)
   *
   * Why these rules?
   * - MinLength(3): Most region names are at least 3 chars ("Cox" is edge case)
   * - MaxLength(100): Reasonable limit, prevents database overflow attacks
   *
   * Swagger @ApiProperty:
   * - Shows example value in Swagger UI
   * - Describes the field for API documentation
   * - Makes it easy for users to test the API
   *
   * Interview Q: "What happens if validation fails?"
   * A: "NestJS's ValidationPipe automatically returns 400 Bad Request with
   *     detailed error messages showing which validations failed"
   */
  @ApiProperty({
    description: 'Region name (3-100 characters)',
    example: 'Rajshahi',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Region name is required' })
  @IsString({ message: 'Region name must be a string' })
  @MinLength(3, { message: 'Region name must be at least 3 characters' })
  @MaxLength(100, { message: 'Region name must not exceed 100 characters' })
  name: string;
}
