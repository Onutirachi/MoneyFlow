import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { invalidateFinancialData } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import type { RecurringCost, RecurringInput } from '@/types';

export function useRecurring() {
  return useQuery({
    queryKey: queryKeys.recurring,
    queryFn: async () => (await api.get<RecurringCost[]>('/recurring')).data,
  });
}

export function useSaveRecurring() {
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: RecurringInput }) =>
      id
        ? (await api.put<RecurringCost>(`/recurring/${id}`, input)).data
        : (await api.post<RecurringCost>('/recurring', input)).data,
    onSuccess: invalidateFinancialData,
  });
}

export function useDeleteRecurring() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/recurring/${id}`),
    onSuccess: invalidateFinancialData,
  });
}
