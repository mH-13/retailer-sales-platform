import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type {
  Region,
  Area,
  Territory,
  Distributor,
  SalesRep,
  CreateRegionRequest,
  CreateAreaRequest,
  CreateTerritoryRequest,
  CreateDistributorRequest,
  BulkAssignmentRequest,
  ImportCSVResponse,
  DashboardStats,
} from '../types';

/**
 * Admin Hooks
 *
 * Custom hooks for admin reference data management using TanStack Query
 * Handles CRUD operations for regions, areas, territories, and distributors
 */

// ============================================
// REGIONS HOOKS
// ============================================

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response = await api.get<Region[]>('/admin/regions');
      return response.data;
    },
  });
};

export const useRegion = (id: number) => {
  return useQuery({
    queryKey: ['region', id],
    queryFn: async () => {
      const response = await api.get<Region>(`/admin/regions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRegionRequest) => {
      const response = await api.post<Region>('/admin/regions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

export const useUpdateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateRegionRequest> }) => {
      const response = await api.put<Region>(`/admin/regions/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.setQueryData(['region', data.id], data);
    },
  });
};

export const useDeleteRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/regions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

// ============================================
// AREAS HOOKS
// ============================================

export const useAreas = () => {
  return useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await api.get<Area[]>('/admin/areas');
      return response.data;
    },
  });
};

export const useArea = (id: number) => {
  return useQuery({
    queryKey: ['area', id],
    queryFn: async () => {
      const response = await api.get<Area>(`/admin/areas/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAreaRequest) => {
      const response = await api.post<Area>('/admin/areas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });
};

export const useUpdateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateAreaRequest> }) => {
      const response = await api.put<Area>(`/admin/areas/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      queryClient.setQueryData(['area', data.id], data);
    },
  });
};

export const useDeleteArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/areas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });
};

// ============================================
// TERRITORIES HOOKS
// ============================================

export const useTerritories = () => {
  return useQuery({
    queryKey: ['territories'],
    queryFn: async () => {
      const response = await api.get<Territory[]>('/admin/territories');
      return response.data;
    },
  });
};

export const useTerritory = (id: number) => {
  return useQuery({
    queryKey: ['territory', id],
    queryFn: async () => {
      const response = await api.get<Territory>(`/admin/territories/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTerritory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTerritoryRequest) => {
      const response = await api.post<Territory>('/admin/territories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
};

export const useUpdateTerritory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateTerritoryRequest> }) => {
      const response = await api.put<Territory>(`/admin/territories/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      queryClient.setQueryData(['territory', data.id], data);
    },
  });
};

export const useDeleteTerritory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/territories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
};

// ============================================
// DISTRIBUTORS HOOKS
// ============================================

export const useDistributors = () => {
  return useQuery({
    queryKey: ['distributors'],
    queryFn: async () => {
      const response = await api.get<Distributor[]>('/admin/distributors');
      return response.data;
    },
  });
};

export const useDistributor = (id: number) => {
  return useQuery({
    queryKey: ['distributor', id],
    queryFn: async () => {
      const response = await api.get<Distributor>(`/admin/distributors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDistributorRequest) => {
      const response = await api.post<Distributor>('/admin/distributors', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    },
  });
};

export const useUpdateDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateDistributorRequest> }) => {
      const response = await api.put<Distributor>(`/admin/distributors/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      queryClient.setQueryData(['distributor', data.id], data);
    },
  });
};

export const useDeleteDistributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/distributors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    },
  });
};

// ============================================
// BULK OPERATIONS HOOKS
// ============================================

export const useBulkAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkAssignmentRequest) => {
      const response = await api.post('/admin/assignments/bulk', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailers'] });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: number) => {
      const response = await api.delete(`/admin/assignments/${assignmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailers'] });
    },
  });
};

export const useImportRetailers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ImportCSVResponse>(
        '/admin/retailers/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailers'] });
    },
  });
};


// ============================================
// SALES REPS HOOKS
// ============================================

export const useSalesReps = () => {
  return useQuery({
    queryKey: ['salesreps'],
    queryFn: async () => {
      const response = await api.get<SalesRep[]>('/admin/salesreps');
      return response.data;
    },
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/retailers/stats/dashboard');
      return response.data;
    },
  });
};
