import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { invalidateFinancialData, queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import type { Category, CategoryInput } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });
}

const invalidate = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
    invalidateFinancialData(),
  ]);

export function useSaveCategory() {
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: CategoryInput }) =>
      id
        ? (await api.put<Category>(`/categories/${id}`, { name: input.name, color: input.color }))
            .data
        : (await api.post<Category>('/categories', input)).data,
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: invalidate,
  });
}
