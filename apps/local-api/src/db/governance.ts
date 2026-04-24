import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

type IndexSpec = {
  id: string;
  indexName: string;
  tableName: string;
  createSql: string;
  reason: string;
};

type GovernanceAction = {
  id: string;
  index_name: string;
  table_name: string;
  reason: string;
  status: 'applied' | 'exists' | 'table_missing' | 'failed';
  error?: string;
};

const CORE_INDEX_SPECS: IndexSpec[] = [
  {
    id: 'core_idx_runs_executor_status_updated_v1',
    indexName: 'idx_runs_executor_status_updated',
    tableName: 'runs',
    createSql:
      "CREATE INDEX IF NOT EXISTS idx_runs_executor_status_updated ON runs(executor_type, status, datetime(updated_at) DESC)",
    reason: '加速执行层状态看板与队列统计查询',
  },
  {
    id: 'core_idx_runs_executor_updated_v1',
    indexName: 'idx_runs_executor_updated',
    tableName: 'runs',
    createSql:
      "CREATE INDEX IF NOT EXISTS idx_runs_executor_updated ON runs(executor_type, datetime(updated_at) DESC)",
    reason: '加速执行层最近动作/最近错误查询',
  },
  {
    id: 'core_idx_audit_logs_category_action_created_v1',
    indexName: 'idx_audit_logs_category_action_created',
    tableName: 'audit_logs',
    createSql:
      "CREATE INDEX IF NOT EXISTS idx_audit_logs_category_action_created ON audit_logs(category, action, datetime(created_at) DESC)",
    reason: '加速健康巡检中的 regression 审计检索',
  },
  {
    id: 'core_idx_gate_checks_status_checked_v1',
    indexName: 'idx_gate_checks_status_checked',
    tableName: 'gate_checks',
    createSql:
      "CREATE INDEX IF NOT EXISTS idx_gate_checks_status_checked ON gate_checks(status, datetime(checked_at) DESC)",
    reason: '加速 gate 趋势统计查询',
  },
  {
    id: 'core_idx_recovery_logs_type_performed_v1',
    indexName: 'idx_recovery_logs_type_performed',
    tableName: 'recovery_logs',
    createSql:
      "CREATE INDEX IF NOT EXISTS idx_recovery_logs_type_performed ON recovery_logs(recovery_type, datetime(performed_at) DESC)",
    reason: '加速 recovery drill 最近记录查询',
  },
  {
    id: 'core_idx_workflow_jobs_status_updated_v1',
    indexName: 'idx_workflow_jobs_status_updated',
    tableName: 'workflow_jobs',
    createSql:
      "CREATE INDEX IF NOT EXISTS idx_workflow_jobs_status_updated ON workflow_jobs(status, datetime(updated_at) DESC)",
    reason: '加速失败任务趋势统计',
  },
  {
    id: 'core_idx_plugin_audit_logs_plugin_created_v1',
    indexName: 'idx_plugin_audit_logs_plugin_created',
    tableName: 'plugin_audit_logs',
    createSql:
      "CREATE INDEX IF NOT EXISTS idx_plugin_audit_logs_plugin_created ON plugin_audit_logs(plugin_id, datetime(created_at) DESC)",
    reason: '加速插件池/插件健康查询',
  },
];

function nowIso() {
  return new Date().toISOString();
}

function firstValue(row: Record<string, unknown> | undefined | null): unknown {
  if (!row) return undefined;
  const keys = Object.keys(row);
  if (keys.length === 0) return undefined;
  return row[keys[0]];
}

function tableExists(db: DatabaseSync, tableName: string): boolean {
  const row = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
    )
    .get(tableName) as Record<string, unknown> | undefined;
  return !!row?.name;
}

function indexExists(db: DatabaseSync, indexName: string): boolean {
  const row = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1",
    )
    .get(indexName) as Record<string, unknown> | undefined;
  return !!row?.name;
}

function ensureGovernanceTables(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      migration_type TEXT NOT NULL DEFAULT 'index',
      target_name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      applied_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS db_governance_runs (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      summary_json TEXT NOT NULL DEFAULT '{}'
    )
  `);
}

function applyCoreIndexes(db: DatabaseSync): GovernanceAction[] {
  const actions: GovernanceAction[] = [];

  for (const spec of CORE_INDEX_SPECS) {
    if (!tableExists(db, spec.tableName)) {
      actions.push({
        id: spec.id,
        index_name: spec.indexName,
        table_name: spec.tableName,
        reason: spec.reason,
        status: 'table_missing',
      });
      continue;
    }

    if (indexExists(db, spec.indexName)) {
      actions.push({
        id: spec.id,
        index_name: spec.indexName,
        table_name: spec.tableName,
        reason: spec.reason,
        status: 'exists',
      });
      continue;
    }

    try {
      db.exec(spec.createSql);
      db.prepare(
        `
          INSERT OR IGNORE INTO schema_migrations (id, migration_type, target_name, description, applied_at)
          VALUES (?, 'index', ?, ?, ?)
        `,
      ).run(spec.id, spec.indexName, spec.reason, nowIso());
      actions.push({
        id: spec.id,
        index_name: spec.indexName,
        table_name: spec.tableName,
        reason: spec.reason,
        status: 'applied',
      });
    } catch (error) {
      actions.push({
        id: spec.id,
        index_name: spec.indexName,
        table_name: spec.tableName,
        reason: spec.reason,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return actions;
}

export type DbGovernanceReport = {
  started_at: string;
  finished_at: string;
  total_specs: number;
  applied: number;
  exists: number;
  table_missing: number;
  failed: number;
  actions: GovernanceAction[];
};

export function runDbGovernance(db: DatabaseSync): DbGovernanceReport {
  const startedAt = nowIso();
  ensureGovernanceTables(db);
  const actions = applyCoreIndexes(db);
  const finishedAt = nowIso();

  const report: DbGovernanceReport = {
    started_at: startedAt,
    finished_at: finishedAt,
    total_specs: CORE_INDEX_SPECS.length,
    applied: actions.filter(a => a.status === 'applied').length,
    exists: actions.filter(a => a.status === 'exists').length,
    table_missing: actions.filter(a => a.status === 'table_missing').length,
    failed: actions.filter(a => a.status === 'failed').length,
    actions,
  };

  try {
    db.prepare(
      `
        INSERT INTO db_governance_runs (id, started_at, finished_at, summary_json)
        VALUES (?, ?, ?, ?)
      `,
    ).run(
      `db_governance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      startedAt,
      finishedAt,
      JSON.stringify({
        total_specs: report.total_specs,
        applied: report.applied,
        exists: report.exists,
        table_missing: report.table_missing,
        failed: report.failed,
      }),
    );
  } catch {
    // 不阻塞服务启动
  }

  return report;
}

export function collectDbDiagnostics(db: DatabaseSync, dbPath: string) {
  ensureGovernanceTables(db);

  const tableCountRow = db
    .prepare("SELECT COUNT(*) AS c FROM sqlite_master WHERE type = 'table'")
    .get() as Record<string, unknown> | undefined;
  const indexCountRow = db
    .prepare("SELECT COUNT(*) AS c FROM sqlite_master WHERE type = 'index'")
    .get() as Record<string, unknown> | undefined;
  const migrationCountRow = db
    .prepare("SELECT COUNT(*) AS c FROM schema_migrations")
    .get() as Record<string, unknown> | undefined;

  const quickCheckRow = db
    .prepare('PRAGMA quick_check')
    .get() as Record<string, unknown> | undefined;
  const foreignKeyIssueRows = db
    .prepare('PRAGMA foreign_key_check')
    .all() as Record<string, unknown>[];
  const journalModeRow = db
    .prepare('PRAGMA journal_mode')
    .get() as Record<string, unknown> | undefined;

  const recentRunRow = db
    .prepare(
      `
        SELECT id, started_at, finished_at, summary_json
        FROM db_governance_runs
        ORDER BY datetime(finished_at) DESC
        LIMIT 1
      `,
    )
    .get() as Record<string, unknown> | undefined;

  const missingIndexes = CORE_INDEX_SPECS.filter(spec => {
    if (!tableExists(db, spec.tableName)) return false;
    return !indexExists(db, spec.indexName);
  }).map(spec => ({
    id: spec.id,
    index_name: spec.indexName,
    table_name: spec.tableName,
    reason: spec.reason,
  }));

  const dbFileStats = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null;
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;
  const walStats = fs.existsSync(walPath) ? fs.statSync(walPath) : null;
  const shmStats = fs.existsSync(shmPath) ? fs.statSync(shmPath) : null;

  return {
    db_path: dbPath,
    file_size_bytes: dbFileStats?.size ?? 0,
    wal_size_bytes: walStats?.size ?? 0,
    shm_size_bytes: shmStats?.size ?? 0,
    table_count: Number(firstValue(tableCountRow) || 0),
    index_count: Number(firstValue(indexCountRow) || 0),
    migration_count: Number(firstValue(migrationCountRow) || 0),
    quick_check: String(firstValue(quickCheckRow) || 'unknown'),
    foreign_key_issue_count: foreignKeyIssueRows.length,
    journal_mode: String(firstValue(journalModeRow) || 'unknown'),
    missing_indexes: missingIndexes,
    recent_governance_run: recentRunRow
      ? {
          id: String(recentRunRow.id || ''),
          started_at: String(recentRunRow.started_at || ''),
          finished_at: String(recentRunRow.finished_at || ''),
          summary: (() => {
            try {
              return JSON.parse(String(recentRunRow.summary_json || '{}'));
            } catch {
              return {};
            }
          })(),
        }
      : null,
  };
}

export function runDbMaintenance(
  db: DatabaseSync,
  mode: 'checkpoint' | 'optimize' | 'full',
) {
  if (mode === 'checkpoint' || mode === 'full') {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  }

  if (mode === 'optimize' || mode === 'full') {
    db.exec('PRAGMA optimize');
    db.exec('ANALYZE');
  }

  return {
    ok: true,
    mode,
    executed_at: nowIso(),
  };
}

export function listCoreIndexSpecs() {
  return CORE_INDEX_SPECS.map(spec => ({
    id: spec.id,
    index_name: spec.indexName,
    table_name: spec.tableName,
    reason: spec.reason,
  }));
}
