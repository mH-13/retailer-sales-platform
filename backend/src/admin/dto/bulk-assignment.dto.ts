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
 * Single assignment item: One SR → Multiple Retailers
 */
export class AssignmentItemDto {
  // Sales Rep ID who will manage these retailers
  @ApiProperty({
    description: 'ID of the sales representative',
    example: 2,
    type: 'integer',
  })
  @IsNotEmpty({ message: 'Sales Rep ID is required' })
  @IsInt({ message: 'Sales Rep ID must be an integer' })
  salesRepId: number;

  // Array of retailer IDs to assign (validates each element is integer)
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
 * Bulk assignment DTO for assigning multiple retailers to multiple SRs
 *
 * Performs all assignments in a single transaction for atomicity
 * Example: [{ salesRepId: 2, retailerIds: [1,2,3] }]
 */
export class BulkAssignmentDto {
  // Array of assignment items (validates nested objects with @ValidateNested)
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
