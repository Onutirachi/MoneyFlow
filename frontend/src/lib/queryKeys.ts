import type { MovementFilters } from '@/types';

/** Chaves centralizadas do TanStack Query. */
export const queryKeys = {
  me: ['me'] as const,
  accounts: ['accounts'] as const,
  categories: ['categories'] as const,
  movements: (filters?: MovementFilters) =>
    filters ? (['movements', filters] as const) : (['movements'] as const),
  recurring: ['recurring'] as const,
  dashboard: (month?: string, accountId?: string) =>
    month ? (['dashboard', month, accountId ?? 'all'] as const) : (['dashboard'] as const),
};
