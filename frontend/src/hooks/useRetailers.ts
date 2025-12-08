import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Retailer, PaginatedResponse } from '../types';

/**
 * Retailers Hooks
 *
 * Custom hooks for fetching and managing retailers using TanStack Query
 */

interface GetRetailersParams {
  page?: number;
  limit?: number;
  search?: string;
  regionId?: number;
  areaId?: number;
  territoryId?: number;
  distributorId?: number;
}

interface UpdateRetailerData {
  points?: number;
  routes?: string;
  notes?: string;
}

/**
 * useRetailers Hook
 *
 * Fetches paginated list of retailers with optional filters
 *
 * Usage:
 *   const { data, isLoading, error } = useRetailers({ page: 1, search: 'acme' });
 */
export const useRetailers = (params: GetRetailersParams = {}) => {
  return useQuery({
    queryKey: ['retailers', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Retailer>>('/retailers', {
        params,
      });
      return response.data;
    },
  });
};

/**
 * useRetailer Hook
 *
 * Fetches a single retailer by UID
 *
 * Usage:
 *   const { data: retailer } = useRetailer('RET001');
 */
export const useRetailer = (uid: string) => {
  return useQuery({
    queryKey: ['retailer', uid],
    queryFn: async () => {
      const response = await api.get<Retailer>(`/retailers/${uid}`);
      return response.data;
    },
    enabled: !!uid, // Only run if UID is provided
  });
};

/**
 * useUpdateRetailer Hook
 *
 * Updates retailer information (points, routes, notes)
 *
 * Usage:
 *   const { mutate: updateRetailer } = useUpdateRetailer();
 *   updateRetailer({ uid: 'RET001', data: { points: 100 } });
 */
export const useUpdateRetailer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, data }: { uid: string; data: UpdateRetailerData }) => {
      const response = await api.patch<Retailer>(`/retailers/${uid}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch retailers list
      queryClient.invalidateQueries({ queryKey: ['retailers'] });
      // Update the specific retailer in cache
      queryClient.setQueryData(['retailer', data.uid], data);
    },
  });
};
