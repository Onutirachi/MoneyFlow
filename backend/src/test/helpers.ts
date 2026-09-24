import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../app.js';

export interface TestApi {
  url: string;
  close: () => Promise<void>;
  request: <T = unknown>(
    method: string,
    path: string,
    options?: { body?: unknown; token?: string },
  ) => Promise<{ status: number; body: T }>;
}

export async function startTestApi(): Promise<TestApi> {
  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${port}/api`;

  return {
    url,
    close: () => new Promise((resolve) => server.close(() => resolve())),
    async request(method, path, { body, token } = {}) {
      const res = await fetch(url + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      return { status: res.status, body: text ? JSON.parse(text) : null };
    },
  };
}

let counter = 0;

/** Cria um usuário novo e devolve o token. */
export async function registerUser(api: TestApi): Promise<string> {
  counter += 1;
  const { body } = await api.request<{ token: string }>('POST', '/auth/register', {
    body: { name: 'Teste', email: `user${counter}-${Date.now()}@test.com`, password: '123456' },
  });
  return body.token;
}
