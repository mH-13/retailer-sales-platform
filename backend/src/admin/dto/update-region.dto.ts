import { PartialType } from '@nestjs/mapped-types';
import { CreateRegionDto } from './create-region.dto';

/**
 * UpdateRegionDto
 *
 * What is PartialType?
 * - A NestJS utility that makes ALL fields from CreateRegionDto OPTIONAL
 * - Automatically copies all validation rules from CreateRegionDto
 * - Perfect for PATCH endpoints (partial updates)
 *
 * How it works:
 * - CreateRegionDto has: name (required)
 * - UpdateRegionDto has: name? (optional)
 * - If name is provided, it uses the same validations (@MinLength, @MaxLength, etc.)
 *
 * Example valid requests:
 * PATCH /admin/regions/1
 * { "name": "Dhaka Division" }  ✅ Update name
 * { }                            ✅ No changes (empty object)
 *
 * Example invalid requests:
 * { "name": "AB" }  ❌ Too short (fails @MinLength from CreateRegionDto)
 * { "name": 123 }   ❌ Not a string (fails @IsString from CreateRegionDto)
 *
 * Why PartialType instead of copying fields manually?
 * - DRY (Don't Repeat Yourself): Single source of truth for validations
 * - If we add fields to CreateRegionDto, UpdateRegionDto auto-updates
 * - Less code, fewer bugs
 *
 * PUT vs PATCH:
 * - PUT: Full replacement (all fields required) → use CreateRegionDto
 * - PATCH: Partial update (all fields optional) → use UpdateRegionDto
 * - We're using PATCH pattern here (more flexible)
 *
 * Interview Q: "Why not make all fields optional manually?"
 * A: "PartialType ensures consistency. If I add a new field to CreateRegionDto,
 *     UpdateRegionDto automatically includes it as optional without code changes.
 *     It reduces duplication and potential for bugs."
 */
export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
