import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Dashboard } from '@/types';

export function useDashboard(month: string, accountId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(month, accountId),
    queryFn: async () =>
      (await api.get<Dashboard>('/dashboard', { params: { month, accountId } })).data,
    placeholderData: keepPreviousData,
  });
}
