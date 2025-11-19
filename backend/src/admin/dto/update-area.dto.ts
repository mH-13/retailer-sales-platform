import { PartialType } from '@nestjs/mapped-types';
import { CreateAreaDto } from './create-area.dto';

/**
 * UpdateAreaDto
 * See UpdateRegionDto for detailed PartialType explanation
 */
export class UpdateAreaDto extends PartialType(CreateAreaDto) {}
