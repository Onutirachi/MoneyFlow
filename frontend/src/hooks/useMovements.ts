import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { invalidateFinancialData } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import type {
  Movement,
  MovementFilters,
  MovementInput,
  MovementScope,
  MovementUpdateInput,
} from '@/types';

export function useMovements(filters: MovementFilters) {
  return useQuery({
    queryKey: queryKeys.movements(filters),
    queryFn: async () => (await api.get<Movement[]>('/movements', { params: filters })).data,
    placeholderData: keepPreviousData,
  });
}

export function useCreateMovement() {
  return useMutation({
    mutationFn: async (input: MovementInput) =>
      (await api.post<Movement[]>('/movements', input)).data,
    onSuccess: invalidateFinancialData,
  });
}

export function useUpdateMovement() {
  return useMutation({
    mutationFn: async ({
      id,
      input,
      scope,
    }: {
      id: string;
      input: MovementUpdateInput;
      scope: MovementScope;
    }) => (await api.put<Movement[]>(`/movements/${id}`, input, { params: { scope } })).data,
    onSuccess: invalidateFinancialData,
  });
}

export function useDeleteMovement() {
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope: MovementScope }) =>
      api.delete(`/movements/${id}`, { params: { scope } }),
    onSuccess: invalidateFinancialData,
  });
}
