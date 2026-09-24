import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, setUnauthorizedHandler, tokenStorage } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { AuthResponse, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  /** true enquanto valida o token salvo ao abrir o app */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!tokenStorage.get());

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Restaura a sessão a partir do token salvo
  useEffect(() => {
    if (!tokenStorage.get()) return;
    api
      .get<{ user: User }>('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback((data: AuthResponse) => {
    queryClient.clear();
    tokenStorage.set(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      handleAuth((await api.post<AuthResponse>('/auth/login', { email, password })).data);
    },
    [handleAuth],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      handleAuth((await api.post<AuthResponse>('/auth/register', { name, email, password })).data);
    },
    [handleAuth],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
