import { IsOptional, IsInt, Min, IsString } from 'class-validator';

/**
 * UpdateRetailerDto: Validates fields that SRs can update
 *
 * Security consideration:
 * SRs can ONLY update these 3 fields:
 * - points (reward points)
 * - routes (delivery routes)
 * - notes (visit notes)
 *
 * They CANNOT update:
 * - name, phone, UID (business data)
 * - region, area, territory (location data)
 * - assignments (who owns this retailer)
 *
 * How this enforces security:
 * 1. Only these fields are in DTO
 * 2. ValidationPipe with whitelist:true strips other fields
 * 3. Service only updates fields from this DTO
 *
 * Example request:
 * PATCH /retailers/RET-DHA-001
 * {
 *   "points": 150,
 *   "routes": "Route A, Route B",
 *   "notes": "Prefers morning delivery"
 * }
 *
 * Malicious request (will be blocked):
 * PATCH /retailers/RET-DHA-001
 * {
 *   "points": 150,
 *   "name": "Hacked Store",  // ❌ Ignored by whitelist
 *   "phone": "999"            // ❌ Ignored by whitelist
 * }
 * Result: Only points updated, name and phone ignored
 */
export class UpdateRetailerDto {
  /**
   * Reward points for retailer
   * Example: 150 points = bought 150 products
   * Must be non-negative (can't have negative points)
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  /**
   * Delivery routes (free-form text)
   * Example: "Route A, Route B" or "Main Road → Market Street"
   * Could be JSON in future: { primary: "A", backup: "B" }
   */
  @IsOptional()
  @IsString()
  routes?: string;

  /**
   * SR's notes about this retailer
   * Example: "Prefers morning delivery", "Cash only", etc.
   * Free-form text for SR's reference
   */
  @IsOptional()
  @IsString()
  notes?: string;
}
