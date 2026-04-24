#!/usr/bin/env node
/**
 * Lightweight DB doctor for local SQLite.
 *
 * Usage:
 *   node scripts/db-doctor.js
 *   node scripts/db-doctor.js --strict
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const strict = process.argv.includes('--strict');
const root = path.resolve(__dirname, '..');
const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.join(root, 'packages', 'db', 'agi_factory.db');
const migrationsDir = process.env.AIP_DB_MIGRATIONS_DIR
  ? path.resolve(process.env.AIP_DB_MIGRATIONS_DIR)
  : path.join(root, 'packages', 'db', 'migrations-core');

const expectedIndexes = [
  { table: 'runs', index: 'idx_runs_executor_status_updated' },
  { table: 'runs', index: 'idx_runs_executor_updated' },
  { table: 'audit_logs', index: 'idx_audit_logs_category_action_created' },
  { table: 'gate_checks', index: 'idx_gate_checks_status_checked' },
  { table: 'recovery_logs', index: 'idx_recovery_logs_type_performed' },
  { table: 'workflow_jobs', index: 'idx_workflow_jobs_status_updated' },
  { table: 'plugin_audit_logs', index: 'idx_plugin_audit_logs_plugin_created' },
];

function firstValue(row) {
  if (!row || typeof row !== 'object') return undefined;
  const keys = Object.keys(row);
  if (keys.length === 0) return undefined;
  return row[keys[0]];
}

function listMigrationFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.sql'))
    .map(entry => ({
      id: entry.name,
      path: path.join(dir, entry.name),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function checksumOf(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function normalizeIdentifier(raw) {
  let name = String(raw || '').trim();
  if (
    (name.startsWith('"') && name.endsWith('"')) ||
    (name.startsWith("'") && name.endsWith("'")) ||
    (name.startsWith('`') && name.endsWith('`')) ||
    (name.startsWith('[') && name.endsWith(']'))
  ) {
    name = name.slice(1, -1);
  }
  return name;
}

function splitTopLevelByComma(input) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  return parts.map(part => part.trim()).filter(Boolean);
}

function stripSqlComments(input) {
  return String(input || '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ');
}

function parseCreateTables(sql) {
  const results = [];
  const marker = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+/gi;
  let match;
  while ((match = marker.exec(sql)) !== null) {
    let i = marker.lastIndex;
    while (i < sql.length && /\s/.test(sql[i])) i += 1;
    const nameStart = i;
    while (i < sql.length && !/\s|\(/.test(sql[i])) i += 1;
    const tableName = normalizeIdentifier(sql.slice(nameStart, i));
    while (i < sql.length && sql[i] !== '(') i += 1;
    if (i >= sql.length) continue;
    let depth = 1;
    const bodyStart = i + 1;
    i += 1;
    while (i < sql.length && depth > 0) {
      if (sql[i] === '(') depth += 1;
      else if (sql[i] === ')') depth -= 1;
      i += 1;
    }
    if (depth !== 0) continue;
    const body = stripSqlComments(sql.slice(bodyStart, i - 1));
    const columns = splitTopLevelByComma(body)
      .filter(part => {
        const upper = part.toUpperCase();
        return !(
          upper.startsWith('PRIMARY KEY') ||
          upper.startsWith('FOREIGN KEY') ||
          upper.startsWith('UNIQUE') ||
          upper.startsWith('CONSTRAINT') ||
          upper.startsWith('CHECK')
        );
      })
      .map(part => normalizeIdentifier((part.split(/\s+/)[0] || '').trim()))
      .filter(Boolean);
    results.push({ tableName, columns });
  }
  return results;
}

async function main() {
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ 数据库不存在: ${dbPath}`);
    process.exit(1);
  }

  if (Number(process.versions.node.split('.')[0]) < 22) {
    console.error(`❌ 需要 Node.js >= 22，当前 ${process.version}`);
    process.exit(1);
  }

  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(dbPath, { readOnly: false });

  try {
    const quickCheckRow = db.prepare('PRAGMA quick_check').get();
    const quickCheck = String(firstValue(quickCheckRow) || 'unknown');
    const fkIssues = db.prepare('PRAGMA foreign_key_check').all();
    const tableCount = Number(
      firstValue(db.prepare("SELECT COUNT(*) AS c FROM sqlite_master WHERE type='table'").get()) || 0,
    );
    const indexCount = Number(
      firstValue(db.prepare("SELECT COUNT(*) AS c FROM sqlite_master WHERE type='index'").get()) || 0,
    );

    const missing = [];
    const skipped = [];

    for (const item of expectedIndexes) {
      const hasTable = !!db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1")
        .get(item.table);
      if (!hasTable) {
        skipped.push({ ...item, reason: 'table_missing' });
        continue;
      }

      const hasIndex = !!db
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name=? LIMIT 1")
        .get(item.index);
      if (!hasIndex) {
        missing.push(item);
      }
    }

    const dbSize = fs.statSync(dbPath).size;
    const walPath = `${dbPath}-wal`;
    const walSize = fs.existsSync(walPath) ? fs.statSync(walPath).size : 0;

    const migrationFiles = listMigrationFiles(migrationsDir);
    const hasSchemaMigrationTable = !!db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations' LIMIT 1")
      .get();
    const schemaMigrationCols = hasSchemaMigrationTable
      ? db.prepare('PRAGMA table_info(schema_migrations)').all()
      : [];
    const hasChecksumCol = schemaMigrationCols.some(col => String(col.name || '') === 'checksum');
    const missingMigrations = [];
    const checksumMismatches = [];
    const missingColumns = [];

    if (migrationFiles.length > 0) {
      const expectedTableColumns = new Map();
      for (const file of migrationFiles) {
        const content = fs.readFileSync(file.path, 'utf8');
        const tables = parseCreateTables(content);
        for (const t of tables) expectedTableColumns.set(t.tableName, t.columns);
      }

      for (const [tableName, columns] of expectedTableColumns.entries()) {
        const hasTable = !!db
          .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1")
          .get(tableName);
        if (!hasTable) continue;
        const existingCols = new Set(
          db
            .prepare(`PRAGMA table_info(\"${String(tableName).replace(/\"/g, '\"\"')}\")`)
            .all()
            .map(row => String(row.name || '')),
        );
        for (const col of columns) {
          if (!existingCols.has(col)) {
            missingColumns.push({ table: tableName, column: col });
          }
        }
      }

      for (const file of migrationFiles) {
        const row = hasSchemaMigrationTable
          ? db
              .prepare('SELECT id, checksum FROM schema_migrations WHERE id = ? LIMIT 1')
              .get(file.id)
          : null;
        if (!row || !row.id) {
          missingMigrations.push(file.id);
          continue;
        }

        if (hasChecksumCol) {
          const fileChecksum = checksumOf(fs.readFileSync(file.path, 'utf8'));
          const appliedChecksum = String(row.checksum || '');
          if (appliedChecksum && appliedChecksum !== fileChecksum) {
            checksumMismatches.push({
              id: file.id,
              expected: appliedChecksum,
              actual: fileChecksum,
            });
          }
        }
      }
    }

    console.log('=== DB Doctor ===');
    console.log(`db_path: ${dbPath}`);
    console.log(`migrations_dir: ${migrationsDir}`);
    console.log(`table_count: ${tableCount}`);
    console.log(`index_count: ${indexCount}`);
    console.log(`quick_check: ${quickCheck}`);
    console.log(`foreign_key_issues: ${fkIssues.length}`);
    console.log(`db_size_bytes: ${dbSize}`);
    console.log(`wal_size_bytes: ${walSize}`);
    console.log(`missing_indexes: ${missing.length}`);
    console.log(`missing_migrations: ${missingMigrations.length}`);
    console.log(`migration_checksum_mismatches: ${checksumMismatches.length}`);
    console.log(`missing_columns: ${missingColumns.length}`);
    if (missing.length > 0) {
      for (const item of missing) {
        console.log(`  - ${item.index} (table: ${item.table})`);
      }
    }
    if (missingMigrations.length > 0) {
      for (const id of missingMigrations) {
        console.log(`  - missing migration: ${id}`);
      }
    }
    if (checksumMismatches.length > 0) {
      for (const item of checksumMismatches) {
        console.log(`  - checksum mismatch: ${item.id}`);
      }
    }
    if (missingColumns.length > 0) {
      for (const item of missingColumns.slice(0, 50)) {
        console.log(`  - missing column: ${item.table}.${item.column}`);
      }
      if (missingColumns.length > 50) {
        console.log(`  ... ${missingColumns.length - 50} more`);
      }
    }
    if (skipped.length > 0) {
      console.log(`skipped_checks: ${skipped.length} (table not present in current schema)`);
    }

    const strictIssues =
      missing.length > 0 ||
      missingMigrations.length > 0 ||
      checksumMismatches.length > 0 ||
      missingColumns.length > 0;
    const unhealthy = quickCheck !== 'ok' || fkIssues.length > 0 || (strict && strictIssues);
    if (unhealthy) {
      console.error('❌ DB doctor found issues');
      process.exit(2);
    }

    console.log('✅ DB doctor passed');
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error('❌ DB doctor failed:', error?.message || String(error));
  process.exit(1);
});
