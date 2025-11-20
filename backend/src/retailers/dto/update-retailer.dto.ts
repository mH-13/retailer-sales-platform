import { IsOptional, IsInt, Min, IsString } from 'class-validator';

/**
 * Update retailer DTO - only allows SR-updatable fields
 *
 * Security: SRs can only update points, routes, notes
 * ValidationPipe whitelist prevents updating business/location data
 */
export class UpdateRetailerDto {
  // Reward points (non-negative)
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  // Delivery routes (free-form text)
  @IsOptional()
  @IsString()
  routes?: string;

  // SR's notes about retailer
  @IsOptional()
  @IsString()
  notes?: string;
}
