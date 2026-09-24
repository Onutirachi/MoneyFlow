import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

/** Movimentos afetam saldo das contas e o dashboard: invalida tudo que depende deles. */
export const invalidateFinancialData = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.movements() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
    queryClient.invalidateQueries({ queryKey: queryKeys.recurring }),
  ]);
