import {
  IsArray,
  IsInt,
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * AssignmentItemDto
 *
 * Represents a single assignment: One SR → Multiple Retailers
 *
 * Example:
 * {
 *   "salesRepId": 2,
 *   "retailerIds": [1, 2, 3, 4, 5]
 * }
 *
 * Means: Assign retailers 1,2,3,4,5 to sales rep #2
 */
export class AssignmentItemDto {
  /**
   * Sales Rep ID (the SR who will manage these retailers)
   *
   * Validation:
   * - @IsNotEmpty(): Must be provided
   * - @IsInt(): Must be a whole number (not 2.5 or "2")
   *
   * Why validate?
   * - Prevents assigning to non-existent users
   * - Database foreign key will also validate, but this gives better error messages
   */
  @ApiProperty({
    description: 'ID of the sales representative',
    example: 2,
    type: 'integer',
  })
  @IsNotEmpty({ message: 'Sales Rep ID is required' })
  @IsInt({ message: 'Sales Rep ID must be an integer' })
  salesRepId: number;

  /**
   * Array of Retailer IDs to assign to this SR
   *
   * Validation:
   * - @IsArray(): Must be an array (not a single number)
   * - @ArrayMinSize(1): Cannot be empty array (must assign at least 1 retailer)
   * - @IsInt({ each: true }): Every item in array must be an integer
   *
   * Why @IsInt({ each: true })?
   * - The "each: true" option validates EVERY element in the array
   * - Without it, only validates that it's an array, not the contents
   *
   * Example valid:
   * [1, 2, 3]  ✅
   *
   * Example invalid:
   * []         ❌ Empty array (fails @ArrayMinSize)
   * [1, "2"]   ❌ String in array (fails @IsInt({ each: true }))
   * [1.5, 2]   ❌ Decimal number (fails @IsInt({ each: true }))
   * 123        ❌ Not an array (fails @IsArray)
   */
  @ApiProperty({
    description: 'Array of retailer IDs to assign to this sales rep',
    example: [1, 2, 3, 4, 5],
    type: [Number],
    isArray: true,
  })
  @IsArray({ message: 'Retailer IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one retailer ID is required' })
  @IsInt({ each: true, message: 'All retailer IDs must be integers' })
  retailerIds: number[];
}

/**
 * BulkAssignmentDto
 *
 * The main DTO for bulk assignment endpoint
 *
 * What is this for?
 * - Admin wants to assign multiple retailers to multiple SRs in one request
 * - Instead of calling POST /assignments 100 times, call it once with all data
 *
 * Example Request Body:
 * {
 *   "assignments": [
 *     { "salesRepId": 2, "retailerIds": [1, 2, 3] },
 *     { "salesRepId": 3, "retailerIds": [4, 5, 6] },
 *     { "salesRepId": 4, "retailerIds": [7, 8, 9] }
 *   ]
 * }
 *
 * This creates 9 assignments total (3+3+3) in one database transaction
 *
 * Why use bulk assignment?
 * - Performance: 1 HTTP request instead of N requests
 * - Atomicity: All assignments succeed or all fail (transaction)
 * - Better UX: Admin doesn't wait for N sequential API calls
 */
export class BulkAssignmentDto {
  /**
   * Array of assignment items
   *
   * Validation:
   * - @IsArray(): Must be an array
   * - @ArrayMinSize(1): Cannot be empty (must have at least 1 assignment)
   * - @ValidateNested(): Validates EACH item using AssignmentItemDto rules
   * - @Type(() => AssignmentItemDto): Tells class-transformer to convert
   *   plain objects to AssignmentItemDto instances
   *
   * Why @ValidateNested?
   * - Nested validation: Validates the array AND each object inside
   * - Without it, only validates it's an array, not the structure of items
   *
   * Why @Type(() => AssignmentItemDto)?
   * - HTTP requests send plain JSON objects
   * - @Type converts: { salesRepId: 2, ... } → new AssignmentItemDto()
   * - This allows validation decorators inside AssignmentItemDto to work
   *
   * Interview Q: "What's the difference between @IsArray and @ValidateNested?"
   * A: "@IsArray validates that it IS an array. @ValidateNested validates
   *     each ITEM inside the array using the nested class's validation rules.
   *     You need both: IsArray for the container, ValidateNested for contents."
   */
  @ApiProperty({
    description: 'Array of assignments (sales rep to retailers mappings)',
    type: [AssignmentItemDto],
    example: [
      { salesRepId: 2, retailerIds: [1, 2, 3] },
      { salesRepId: 3, retailerIds: [4, 5, 6, 7] },
    ],
  })
  @IsArray({ message: 'Assignments must be an array' })
  @ArrayMinSize(1, { message: 'At least one assignment is required' })
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  assignments: AssignmentItemDto[];
}
