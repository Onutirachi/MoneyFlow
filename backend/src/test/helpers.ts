import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import pg from 'pg';
import { createApp } from '../app.js';
import { migrate } from '../db/migrate.js';
import { pool } from '../db/pool.js';

export interface TestApi {
  url: string;
  close: () => Promise<void>;
  request: <T = unknown>(
    method: string,
    path: string,
    options?: { body?: unknown; token?: string },
  ) => Promise<{ status: number; body: T }>;
}

/** Cria o banco de testes se não existir. */
async function ensureTestDatabase(): Promise<void> {
  const url = new URL(process.env.DATABASE_URL!);
  const name = url.pathname.slice(1);
  url.pathname = '/postgres';
  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
    if (!exists.rowCount) await admin.query(`CREATE DATABASE "${name}"`);
  } catch (err) {
    // outro processo criou ao mesmo tempo
    const code = (err as { code?: string }).code;
    if (code !== '42P04' && code !== '23505') throw err;
  } finally {
    await admin.end();
  }
}

export async function startTestApi(): Promise<TestApi> {
  await ensureTestDatabase();
  await migrate();
  // banco limpo por arquivo de teste (os arquivos rodam em sequência: --test-concurrency=1)
  await pool.query('TRUNCATE users CASCADE');
  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${port}/api`;

  return {
    url,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await pool.end();
    },
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
