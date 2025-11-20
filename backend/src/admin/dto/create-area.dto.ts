import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Create area DTO with hierarchical relationship
 *
 * Areas belong to regions (foreign key relationship)
 * Example: "Gulshan" area in "Dhaka" region
 */
export class CreateAreaDto {
  @ApiProperty({
    description: 'Area name (3-100 characters)',
    example: 'Gulshan',
  })
  @IsNotEmpty({ message: 'Area name is required' })
  @IsString({ message: 'Area name must be a string' })
  @MinLength(3, { message: 'Area name must be at least 3 characters' })
  @MaxLength(100, { message: 'Area name must not exceed 100 characters' })
  name: string;

  // Region ID - required foreign key (every area must belong to a region)
  @ApiProperty({
    description: 'ID of the region this area belongs to',
    example: 1,
    type: 'integer',
  })
  @IsNotEmpty({ message: 'Region ID is required' })
  @IsInt({ message: 'Region ID must be an integer' })
  regionId: number;
}
