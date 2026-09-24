import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '@/types';

const TOKEN_KEY = 'financas.token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  // padrão: mesmo endereço do front; o proxy do Vite repassa /api ao backend (vite.config.ts)
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Chamado quando a API responde 401 numa rota autenticada (registrado pelo AuthContext). */
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) onUnauthorized?.();
    return Promise.reject(error);
  },
);

/** Mensagem amigável a partir de um erro da API. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) {
      const detail = body.error.details?.[0];
      return detail ? `${body.error.message}: ${detail.message}` : body.error.message;
    }
    // sem resposta, ou 5xx sem o formato da API = o proxy do Vite não alcançou o backend
    if (!error.response || error.response.status >= 500) {
      return 'Backend fora do ar. Abra a pasta backend e rode "npm run dev" (ou use iniciar.cmd).';
    }
    return `Erro ${error.response.status} ao chamar a API`;
  }
  return 'Erro inesperado';
}
