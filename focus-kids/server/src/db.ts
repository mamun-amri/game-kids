import pg from 'pg';
import { config } from './config.js';

const dbUrl = new URL(config.databaseUrl);

export const pool = new pg.Pool({
  user: dbUrl.username,
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  database: dbUrl.pathname.slice(1),
  password: '',
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (q: (text: string, params?: unknown[]) => Promise<pg.QueryResult>) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn((text, params) => client.query(text, params));
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
