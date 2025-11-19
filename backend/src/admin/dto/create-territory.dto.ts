import { IsNotEmpty, IsString, MinLength, MaxLength, IsInt } from 'class-validator';

/**
 * CreateTerritoryDto
 *
 * What is a Territory?
 * - A territory belongs to an area (hierarchical relationship)
 * - Hierarchy: Region → Area → Territory
 * - Example: "Gulshan-1" territory belongs to "Gulshan" area
 *
 * Why areaId?
 * - Database schema: Territory has foreign key to Area
 * - Can't create territory without specifying which area it belongs to
 * - Enforces proper hierarchy in data
 *
 * Example Request:
 * POST /admin/territories
 * {
 *   "name": "Gulshan-1",
 *   "areaId": 1  // Gulshan area
 * }
 */
export class CreateTerritoryDto {
  @IsNotEmpty({ message: 'Territory name is required' })
  @IsString({ message: 'Territory name must be a string' })
  @MinLength(3, { message: 'Territory name must be at least 3 characters' })
  @MaxLength(100, { message: 'Territory name must not exceed 100 characters' })
  name: string;

  /**
   * Area ID (which area does this territory belong to?)
   *
   * Why required?
   * - Database enforces this (non-null foreign key)
   * - Business rule: Every territory must be in an area
   */
  @IsNotEmpty({ message: 'Area ID is required' })
  @IsInt({ message: 'Area ID must be an integer' })
  areaId: number;
}
