import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/** Verifica se o backend responde; enquanto estiver fora, tenta de novo a cada 3s. */
export function useApiHealth() {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<{ status: string }>('/health', { timeout: 3000 })).data,
    retry: false,
    refetchInterval: (q) => (q.state.status === 'error' ? 3000 : false),
  });
  return { online: query.isSuccess, offline: query.isError, checking: query.isPending };
}
