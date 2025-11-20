import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsInt,
} from 'class-validator';

/**
 * Create territory DTO with hierarchical relationship
 *
 * Hierarchy: Region → Area → Territory
 * Example: "Gulshan-1" territory belongs to "Gulshan" area
 */
export class CreateTerritoryDto {
  @IsNotEmpty({ message: 'Territory name is required' })
  @IsString({ message: 'Territory name must be a string' })
  @MinLength(3, { message: 'Territory name must be at least 3 characters' })
  @MaxLength(100, { message: 'Territory name must not exceed 100 characters' })
  name: string;

  // Area ID - required foreign key (every territory must belong to an area)
  @IsNotEmpty({ message: 'Area ID is required' })
  @IsInt({ message: 'Area ID must be an integer' })
  areaId: number;
}
