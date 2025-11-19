import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * CreateDistributorDto
 *
 * Same structure as CreateRegionDto (all reference entities have just a "name" field)
 * See CreateRegionDto for detailed validation explanations
 */
export class CreateDistributorDto {
  @IsNotEmpty({ message: 'Distributor name is required' })
  @IsString({ message: 'Distributor name must be a string' })
  @MinLength(3, { message: 'Distributor name must be at least 3 characters' })
  @MaxLength(100, { message: 'Distributor name must not exceed 100 characters' })
  name: string;
}
