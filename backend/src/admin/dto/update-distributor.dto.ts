import { PartialType } from '@nestjs/mapped-types';
import { CreateDistributorDto } from './create-distributor.dto';

/**
 * Update distributor DTO using PartialType (makes all fields optional)
 */
export class UpdateDistributorDto extends PartialType(CreateDistributorDto) {}
