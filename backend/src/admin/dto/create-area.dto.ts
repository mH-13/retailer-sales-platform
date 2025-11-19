import { IsNotEmpty, IsString, MinLength, MaxLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * CreateAreaDto
 *
 * What is an Area?
 * - An area belongs to a region (hierarchical relationship)
 * - Example: "Gulshan" area belongs to "Dhaka" region
 *
 * Why regionId?
 * - Database schema: Area has foreign key to Region
 * - Can't create area without specifying which region it belongs to
 * - Enforces proper hierarchy in data
 *
 * Example Request:
 * POST /admin/areas
 * {
 *   "name": "Gulshan",
 *   "regionId": 1  // Dhaka region
 * }
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

  /**
   * Region ID (which region does this area belong to?)
   *
   * Why required?
   * - Database enforces this (non-null foreign key)
   * - Business rule: Every area must be in a region
   */
  @ApiProperty({
    description: 'ID of the region this area belongs to',
    example: 1,
    type: 'integer',
  })
  @IsNotEmpty({ message: 'Region ID is required' })
  @IsInt({ message: 'Region ID must be an integer' })
  regionId: number;
}
