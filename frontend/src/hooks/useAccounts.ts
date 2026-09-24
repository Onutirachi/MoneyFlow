import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { invalidateFinancialData } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import type { Account, AccountInput } from '@/types';

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => (await api.get<Account[]>('/accounts')).data,
  });
}

export function useSaveAccount() {
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: AccountInput }) =>
      id
        ? (await api.put<Account>(`/accounts/${id}`, input)).data
        : (await api.post<Account>('/accounts', input)).data,
    onSuccess: invalidateFinancialData,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: invalidateFinancialData,
  });
}
