import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { collectDbDiagnostics, runDbGovernance } from './governance.js';
import type { DbGovernanceReport } from './governance.js';
import {
  collectSqlMigrationState,
  resolveCoreMigrationDirectory,
  runSqlMigrations,
} from './migration-runner.js';
import type { SqlMigrationReport, SqlMigrationStateReport } from './migration-runner.js';
import { reconcileSchemaColumns } from './schema-reconciler.js';
import type { SchemaReconcileReport } from './schema-reconciler.js';

function getDbPath(): string {
  if (process.env.SQLITE_DB_PATH) {
    return path.resolve(process.env.SQLITE_DB_PATH);
  }
  return path.resolve(__dirname, '../../../../packages/db/agi_factory.db');
}

const dbPath = getDbPath();
let dbInstance: DatabaseSync | null = null;
let lastDbGovernanceReport: DbGovernanceReport | null = null;
let lastSqlMigrationReport: SqlMigrationReport | null = null;
let lastSchemaReconcileReport: SchemaReconcileReport | null = null;

function bootstrapDatabase() {
  if (dbInstance) return;

  console.log(`📊 连接数据库: ${dbPath}`);
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  dbInstance = new DatabaseSync(dbPath, { readOnly: false });

  try {
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  } catch {
    // 忽略旧环境不支持 WAL 的异常
  }
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  lastSqlMigrationReport = runSqlMigrations(dbInstance);
  if (lastSqlMigrationReport.applied > 0) {
    console.log(
      `✅ SQL Migrations 已应用 ${lastSqlMigrationReport.applied}/${lastSqlMigrationReport.total_files}`,
    );
  }

  const migrationDir = resolveCoreMigrationDirectory();
  lastSchemaReconcileReport = reconcileSchemaColumns(dbInstance, migrationDir);
  if (lastSchemaReconcileReport.applied > 0) {
    console.log(`✅ Schema Reconcile 已补齐 ${lastSchemaReconcileReport.applied} 个缺失列`);
  }

  lastDbGovernanceReport = runDbGovernance(dbInstance);
  if (lastDbGovernanceReport.failed > 0) {
    console.warn(
      `⚠️ DB Governance 部分失败: ${lastDbGovernanceReport.failed}/${lastDbGovernanceReport.total_specs}`,
    );
  } else if (lastDbGovernanceReport.applied > 0) {
    console.log(`✅ DB Governance 已应用 ${lastDbGovernanceReport.applied} 条核心索引迁移`);
  }

  console.log('✅ 数据库连接成功 (migration-first)');
}

export function getDatabasePath() {
  return dbPath;
}

export function getDatabase(): DatabaseSync {
  bootstrapDatabase();
  return dbInstance as DatabaseSync;
}

export function getLastDbGovernanceReport() {
  return lastDbGovernanceReport;
}

export function getLastSqlMigrationReport() {
  return lastSqlMigrationReport;
}

export function getSqlMigrationState(): SqlMigrationStateReport {
  const db = getDatabase();
  return collectSqlMigrationState(db);
}

export function getLastSchemaReconcileReport() {
  return lastSchemaReconcileReport;
}

export function getDbDiagnostics() {
  const db = getDatabase();
  return {
    ...collectDbDiagnostics(db, dbPath),
    sql_migrations: lastSqlMigrationReport,
    sql_migration_state: getSqlMigrationState(),
    schema_reconcile: lastSchemaReconcileReport,
  };
}

export function testConnection(): {
  ok: boolean;
  db: string;
  connected: boolean;
  tables?: string[];
  error?: string;
} {
  try {
    const db = getDatabase();
    const tablesResult = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all();
    const tables = tablesResult.map((row: any) => row.name);

    return {
      ok: true,
      db: 'sqlite',
      connected: true,
      tables,
    };
  } catch (error) {
    return {
      ok: false,
      db: 'sqlite',
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function query(sql: string, params: any[] = []): any[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return params.length > 0 ? stmt.all(...params) : stmt.all();
}

export function run(
  sql: string,
  params: any[] = [],
): { changes: number; lastInsertRowid: number } {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  const result = params.length > 0 ? stmt.run(...params) : stmt.run();
  return {
    changes: Number(result.changes),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('🔒 数据库连接已关闭');
  }
}

export default {
  getDatabase,
  getDatabasePath,
  getDbDiagnostics,
  getLastDbGovernanceReport,
  getLastSqlMigrationReport,
  getSqlMigrationState,
  getLastSchemaReconcileReport,
  testConnection,
  query,
  run,
  closeDatabase,
};
