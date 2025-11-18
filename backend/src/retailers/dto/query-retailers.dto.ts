import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * QueryRetailersDto: Validates query parameters for listing retailers
 *
 * What are query parameters?
 * URL: /retailers?page=1&limit=20&search=rahman&region=1
 * These become: { page: 1, limit: 20, search: 'rahman', region: 1 }
 *
 * Why @Type() decorator?
 * Query params come as strings: "?page=1" → page is string "1"
 * @Type() converts to number: page becomes number 1
 * Without it, validation fails (string "1" is not a number)
 *
 * Validation decorators explained:
 * - @IsOptional() - Field is not required (can be undefined)
 * - @IsInt() - Must be integer (not 1.5)
 * - @Min(1) - Minimum value is 1
 * - @Max(100) - Maximum value is 100
 * - @IsString() - Must be string type
 *
 * Example valid requests:
 * - /retailers → Uses defaults (page=1, limit=20)
 * - /retailers?page=2 → page=2, limit=20 (default)
 * - /retailers?search=rahman → Searches for "rahman"
 * - /retailers?region=1&area=2 → Multi-filter
 *
 * Example invalid requests:
 * - /retailers?page=0 → Error: Min(1)
 * - /retailers?limit=200 → Error: Max(100)
 * - /retailers?page=abc → Error: IsInt()
 */
export class QueryRetailersDto {
  /**
   * Page number for pagination (1-based)
   * Example: page=1 gives first 20 items, page=2 gives next 20
   */
  @IsOptional()
  @Type(() => Number)  // Convert string to number
  @IsInt()
  @Min(1)
  page?: number = 1;  // Default: page 1

  /**
   * Number of items per page
   * Limited to 100 to prevent performance issues
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;  // Default: 20 items

  /**
   * Search query (searches name, phone, UID)
   * Example: search=rahman → finds "Rahman Store", "01711-rahman", etc.
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Filter by region ID
   * Example: region=1 → only retailers in region 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  region?: number;

  /**
   * Filter by area ID
   * Example: area=2 → only retailers in area 2
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  area?: number;

  /**
   * Filter by distributor ID
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  distributor?: number;

  /**
   * Filter by territory ID
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  territory?: number;
}
