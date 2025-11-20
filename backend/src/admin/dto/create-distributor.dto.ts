import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * Create distributor DTO with name validation (3-100 characters)
 */
export class CreateDistributorDto {
  @IsNotEmpty({ message: 'Distributor name is required' })
  @IsString({ message: 'Distributor name must be a string' })
  @MinLength(3, { message: 'Distributor name must be at least 3 characters' })
  @MaxLength(100, {
    message: 'Distributor name must not exceed 100 characters',
  })
  name: string;
}
