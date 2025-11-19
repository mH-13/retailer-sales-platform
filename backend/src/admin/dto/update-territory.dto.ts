import { PartialType } from '@nestjs/mapped-types';
import { CreateTerritoryDto } from './create-territory.dto';

/**
 * UpdateTerritoryDto
 * See UpdateRegionDto for detailed PartialType explanation
 */
export class UpdateTerritoryDto extends PartialType(CreateTerritoryDto) {}
