import { PartialType } from '@nestjs/mapped-types';
import { CreateTerritoryDto } from './create-territory.dto';

/**
 * Update territory DTO using PartialType (makes all fields optional)
 */
export class UpdateTerritoryDto extends PartialType(CreateTerritoryDto) {}
