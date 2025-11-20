import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters validation for retailers listing endpoint
 *
 * Supports pagination, search, and filtering by region/area/distributor/territory
 * Query params are converted from strings to appropriate types using @Type()
 */
export class QueryRetailersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Prevent performance issues
  limit?: number = 20;

  // Search query (searches name, phone, UID)
  @IsOptional()
  @IsString()
  search?: string;

  // Filter by region ID
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  region?: number;

  // Filter by area ID
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  area?: number;

  // Filter by distributor ID
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  distributor?: number;

  // Filter by territory ID
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  territory?: number;
}
