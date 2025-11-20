import { PartialType } from '@nestjs/mapped-types';
import { CreateRegionDto } from './create-region.dto';

/**
 * Update region DTO using PartialType
 *
 * Makes all CreateRegionDto fields optional while preserving validation rules
 * Perfect for PATCH endpoints - allows partial updates with same validations
 */
export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
