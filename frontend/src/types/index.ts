/**
 * TypeScript Types - Matching Backend DTOs
 *
 * These types mirror the NestJS backend models and DTOs
 * Ensures type safety when calling APIs and handling data
 */

// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'ADMIN' | 'SR';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface SalesRep {
  id: number;
  username: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REFERENCE DATA TYPES
// ============================================

export interface Region {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Area {
  id: number;
  name: string;
  regionId: number;
  region?: Region;
  createdAt?: string;
  updatedAt?: string;
}

export interface Territory {
  id: number;
  name: string;
  areaId: number;
  area?: Area;
  createdAt?: string;
  updatedAt?: string;
}

export interface Distributor {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// RETAILER TYPES
// ============================================

export interface RetailerAssignment {
  id: number;
  salesRepId: number;
  retailerId: number;
  salesRep: {
    id: number;
    name: string;
    username: string;
  };
  createdAt: string;
}

export interface Retailer {
  id: number;
  uid: string;
  name: string;
  phone: string;
  points: number;
  routes: string | null;
  notes: string | null;

  // Relations
  regionId: number | null;
  areaId: number | null;
  distributorId: number | null;
  territoryId: number | null;

  region?: Region;
  area?: Area;
  distributor?: Distributor;
  territory?: Territory;
  assignments?: RetailerAssignment[];

  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateRetailerRequest {
  points?: number;
  routes?: string;
  notes?: string;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ============================================
// QUERY PARAMS TYPES
// ============================================

export interface RetailersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: number;
  area?: number;
  distributor?: number;
  territory?: number;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface CreateRegionRequest {
  name: string;
}

export interface CreateAreaRequest {
  name: string;
  regionId: number;
}

export interface CreateTerritoryRequest {
  name: string;
  areaId: number;
}

export interface CreateDistributorRequest {
  name: string;
}

export interface BulkAssignmentRequest {
  assignments: Array<{
    salesRepId: number;
    retailerId: number;
  }>;
}

export interface DashboardStats {
  totalRetailers: number;
  totalSalesReps: number;
  activeRetailersThisWeek: number;
  totalPoints: number;
}

export interface ImportCSVResponse {
  success: boolean;
  created: number;
  failed: number;
  errors: Array<{
    row: number;
    uid: string;
    error: string;
  }>;
}
