import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

type MigrationFile = {
  id: string;
  fullPath: string;
};

export type SqlMigrationItemResult = {
  id: string;
  status: 'applied' | 'skipped';
  duration_ms: number;
};

export type SqlMigrationReport = {
  directory: string;
  total_files: number;
  applied: number;
  skipped: number;
  items: SqlMigrationItemResult[];
};

export type SqlMigrationStateItem = {
  id: string;
  expected_checksum: string;
  applied: boolean;
  applied_at: string | null;
  applied_checksum: string | null;
  status: 'pending' | 'applied' | 'checksum_mismatch';
};

export type SqlMigrationStateReport = {
  directory: string;
  total_files: number;
  applied: number;
  pending: number;
  checksum_mismatches: number;
  retired_applied: Array<{
    id: string;
    applied_at: string | null;
    checksum: string;
  }>;
  orphaned_applied: Array<{
    id: string;
    applied_at: string | null;
    checksum: string;
  }>;
  files: SqlMigrationStateItem[];
};

function nowIso() {
  return new Date().toISOString();
}

function hasColumn(db: DatabaseSync, tableName: string, columnName: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name?: string;
  }>;
  return rows.some(row => String(row.name || '') === columnName);
}

function ensureSchemaMigrationsTable(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      migration_type TEXT NOT NULL DEFAULT 'index',
      target_name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      checksum TEXT NOT NULL DEFAULT '',
      applied_at TEXT NOT NULL
    )
  `);
  if (!hasColumn(db, 'schema_migrations', 'checksum')) {
    db.exec("ALTER TABLE schema_migrations ADD COLUMN checksum TEXT NOT NULL DEFAULT ''");
  }
}

function listMigrationFiles(directory: string): MigrationFile[] {
  if (!fs.existsSync(directory)) return [];
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.sql'))
    .map(entry => ({
      id: entry.name,
      fullPath: path.join(directory, entry.name),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return entries;
}

function listArchivedMigrationIds(directory: string): Set<string> {
  const archiveDir = path.join(directory, 'archive');
  if (!fs.existsSync(archiveDir)) return new Set();

  const queue = [archiveDir];
  const ids = new Set<string>();
  while (queue.length > 0) {
    const current = queue.shift() as string;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(full);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.sql')) {
        ids.add(entry.name);
      }
    }
  }
  return ids;
}

function getAppliedMigration(
  db: DatabaseSync,
  id: string,
): { id: string; checksum: string; applied_at: string | null } | null {
  const row = db
    .prepare('SELECT id, checksum, applied_at FROM schema_migrations WHERE id = ? LIMIT 1')
    .get(id) as Record<string, unknown> | undefined;
  if (!row?.id) return null;
  return {
    id: String(row.id),
    checksum: String(row.checksum || ''),
    applied_at: row.applied_at ? String(row.applied_at) : null,
  };
}

function checksumOf(text: string) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function applyMigration(db: DatabaseSync, item: MigrationFile): SqlMigrationItemResult {
  const started = Date.now();
  const sql = fs.readFileSync(item.fullPath, 'utf8');
  const checksum = checksumOf(sql);
  const applied = getAppliedMigration(db, item.id);
  if (applied) {
    if (applied.checksum && applied.checksum !== checksum) {
      throw new Error(
        `Migration checksum mismatch (${item.id}): expected ${applied.checksum}, got ${checksum}`,
      );
    }
    return {
      id: item.id,
      status: 'skipped',
      duration_ms: Date.now() - started,
    };
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(sql);
    db.prepare(
      `
        INSERT INTO schema_migrations (id, migration_type, target_name, description, checksum, applied_at)
        VALUES (?, 'sql_file', ?, ?, ?, ?)
      `,
    ).run(item.id, item.id, `SQL migration file: ${item.id}`, checksum, nowIso());
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw new Error(
      `Migration failed (${item.id}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return {
    id: item.id,
    status: 'applied',
    duration_ms: Date.now() - started,
  };
}

export function resolveCoreMigrationDirectory() {
  if (process.env.AIP_DB_MIGRATIONS_DIR) {
    return path.resolve(process.env.AIP_DB_MIGRATIONS_DIR);
  }
  return path.resolve(__dirname, '../../../../packages/db/migrations-core');
}

export function runSqlMigrations(db: DatabaseSync): SqlMigrationReport {
  ensureSchemaMigrationsTable(db);
  const directory = resolveCoreMigrationDirectory();
  const files = listMigrationFiles(directory);

  const items = files.map(file => applyMigration(db, file));
  return {
    directory,
    total_files: files.length,
    applied: items.filter(item => item.status === 'applied').length,
    skipped: items.filter(item => item.status === 'skipped').length,
    items,
  };
}

export function collectSqlMigrationState(db: DatabaseSync): SqlMigrationStateReport {
  ensureSchemaMigrationsTable(db);
  const directory = resolveCoreMigrationDirectory();
  const files = listMigrationFiles(directory);
  const retiredIds = listArchivedMigrationIds(directory);

  const appliedRows = db.prepare(
    `
      SELECT id, checksum, applied_at
      FROM schema_migrations
      WHERE migration_type = 'sql_file'
      ORDER BY id
    `,
  ).all() as Array<Record<string, unknown>>;
  const appliedById = new Map(
    appliedRows.map(row => [
      String(row.id || ''),
      {
        id: String(row.id || ''),
        checksum: String(row.checksum || ''),
        applied_at: row.applied_at ? String(row.applied_at) : null,
      },
    ]),
  );

  const filesState: SqlMigrationStateItem[] = files.map(file => {
    const sql = fs.readFileSync(file.fullPath, 'utf8');
    const expectedChecksum = checksumOf(sql);
    const applied = appliedById.get(file.id);
    if (!applied) {
      return {
        id: file.id,
        expected_checksum: expectedChecksum,
        applied: false,
        applied_at: null,
        applied_checksum: null,
        status: 'pending',
      };
    }

    const checksumMatches =
      !applied.checksum || String(applied.checksum) === expectedChecksum;
    return {
      id: file.id,
      expected_checksum: expectedChecksum,
      applied: true,
      applied_at: applied.applied_at,
      applied_checksum: applied.checksum || null,
      status: checksumMatches ? 'applied' : 'checksum_mismatch',
    };
  });

  const fileIdSet = new Set(files.map(file => file.id));
  const retiredApplied = appliedRows
    .filter(row => retiredIds.has(String(row.id || '')))
    .map(row => ({
      id: String(row.id || ''),
      applied_at: row.applied_at ? String(row.applied_at) : null,
      checksum: String(row.checksum || ''),
    }));

  const orphanedApplied = appliedRows
    .filter(row => {
      const id = String(row.id || '');
      return !fileIdSet.has(id) && !retiredIds.has(id);
    })
    .map(row => ({
      id: String(row.id || ''),
      applied_at: row.applied_at ? String(row.applied_at) : null,
      checksum: String(row.checksum || ''),
    }));

  return {
    directory,
    total_files: files.length,
    applied: filesState.filter(item => item.status === 'applied').length,
    pending: filesState.filter(item => item.status === 'pending').length,
    checksum_mismatches: filesState.filter(item => item.status === 'checksum_mismatch')
      .length,
    retired_applied: retiredApplied,
    orphaned_applied: orphanedApplied,
    files: filesState,
  };
}
