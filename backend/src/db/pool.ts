import pg from 'pg';
import { config } from '../config.js';

// BIGINT (centavos) -> number; DATE -> string 'YYYY-MM-DD' (sem fuso)
pg.types.setTypeParser(20, (v) => Number(v));
pg.types.setTypeParser(1082, (v) => v);

export const pool = new pg.Pool({ connectionString: config.DATABASE_URL });

/** Pool ou client de transação. */
export interface Db {
  query<T extends pg.QueryResultRow>(sql: string, params?: unknown[]): Promise<pg.QueryResult<T>>;
}

export async function query<T extends pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  db: Db = pool,
): Promise<T[]> {
  const result = await db.query<T>(sql, params);
  return result.rows;
}

export async function execute(sql: string, params: unknown[] = [], db: Db = pool): Promise<number> {
  const result = await db.query(sql, params);
  return result.rowCount ?? 0;
}

export function one<T>(rows: T[]): T | undefined {
  return rows[0];
}

export function must<T>(rows: T[]): T {
  const row = rows[0];
  if (row === undefined) throw new Error('A consulta não retornou resultado.');
  return row;
}

export async function withTx<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
