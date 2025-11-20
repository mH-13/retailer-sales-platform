import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Create region DTO with validation
 *
 * Validates region name: required, string, 3-100 characters
 * Example: { "name": "Sylhet" }
 */
export class CreateRegionDto {
  // Region name: 3-100 characters, prevents empty names and database overflow
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
