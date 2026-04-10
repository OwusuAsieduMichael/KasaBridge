import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool) {
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl:
        process.env.PGSSLMODE === 'require'
          ? { rejectUnauthorized: process.env.PG_REJECT_UNAUTHORIZED !== 'false' }
          : false,
    });
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

export async function healthCheckDb() {
  if (!config.databaseUrl) {
    return { ok: false, error: 'DATABASE_URL not configured' };
  }
  try {
    const p = getPool();
    await p.query('SELECT 1');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
