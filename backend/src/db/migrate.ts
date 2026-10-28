import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';

/** Chave arbitrária do advisory lock: serializa migrações de processos simultâneos (testes, réplicas). */
const MIGRATION_LOCK = 4_242_001;

/** Aplica db/schema.sql (idempotente). */
export async function migrate(): Promise<void> {
  const sql = await readFile(new URL('../../db/schema.sql', import.meta.url), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK]);
    await client.query(sql);
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK]).catch(() => {});
    client.release();
  }
}

const entry = process.argv[1] ?? '';
if (entry.endsWith('migrate.ts') || entry.endsWith('migrate.js')) {
  await migrate();
  console.log('Banco migrado com sucesso.');
  await pool.end();
}
