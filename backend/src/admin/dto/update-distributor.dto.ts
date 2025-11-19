import { PartialType } from '@nestjs/mapped-types';
import { CreateDistributorDto } from './create-distributor.dto';

/**
 * UpdateDistributorDto
 * See UpdateRegionDto for detailed PartialType explanation
 */
export class UpdateDistributorDto extends PartialType(CreateDistributorDto) {}
