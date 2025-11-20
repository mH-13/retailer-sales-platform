import { PartialType } from '@nestjs/mapped-types';
import { CreateAreaDto } from './create-area.dto';

/**
 * Update area DTO using PartialType (makes all fields optional)
 */
export class UpdateAreaDto extends PartialType(CreateAreaDto) {}
