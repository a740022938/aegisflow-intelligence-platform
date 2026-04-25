/**
 * PostgreSQL 适配层 — SQLite → PostgreSQL 无缝切换
 *
 * 用法:
 *   import { getDatabase } from '../db/pg-adapter.js';
 *   当 DATABASE_URL 环境变量存在时自动使用 PostgreSQL，否则回退到 SQLite
 *
 * 环境变量:
 *   DATABASE_URL=postgresql://user:pass@localhost:5432/agi_factory
 *   PG_POOL_MIN=2
 *   PG_POOL_MAX=10
 */

import { getDatabase as getSQLiteDb } from '../apps/local-api/src/db/builtin-sqlite.js';

let pgPool: any = null;
let pgMode = false;

async function initPg() {
  const url = process.env.DATABASE_URL || '';
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) return;

  try {
    const { Pool } = await import('pg');
    pgPool = new Pool({
      connectionString: url,
      min: parseInt(process.env.PG_POOL_MIN || '2', 10),
      max: parseInt(process.env.PG_POOL_MAX || '10', 10),
      idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
    });
    pgMode = true;
    console.log('[db] PostgreSQL mode enabled');
  } catch (err) {
    console.warn('[db] PostgreSQL not available, falling back to SQLite:', err);
    pgMode = false;
  }
}

export function isPostgresMode(): boolean {
  return pgMode;
}

export async function getDatabasePg(): Promise<any> {
  if (!pgPool) await initPg();
  if (!pgPool) return getSQLiteDb();
  return pgPool;
}

export async function queryPg(text: string, params: any[] = []): Promise<any[]> {
  if (!pgMode) {
    const sqlite = getSQLiteDb();
    return sqlite.query(text, params);
  }
  const { rows } = await pgPool.query(text, params);
  return rows;
}

export async function closePg(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
    pgMode = false;
  }
}

export default { getDatabase: getDatabasePg, query: queryPg, isPostgresMode, close: closePg };
