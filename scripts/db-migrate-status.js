#!/usr/bin/env node
/**
 * Print migration state summary.
 *
 * Usage:
 *   node scripts/db-migrate-status.js
 *   pnpm run db:migrate:status
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.join(root, 'packages', 'db', 'agi_factory.db');
const migrationsDir = process.env.AIP_DB_MIGRATIONS_DIR
  ? path.resolve(process.env.AIP_DB_MIGRATIONS_DIR)
  : path.join(root, 'packages', 'db', 'migrations-core');

function listMigrationFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.sql'))
    .map(entry => ({ id: entry.name, path: path.join(dir, entry.name) }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function listArchivedIds(dir) {
  const archiveDir = path.join(dir, 'archive');
  if (!fs.existsSync(archiveDir)) return new Set();
  const ids = new Set();
  const queue = [archiveDir];
  while (queue.length) {
    const current = queue.shift();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.sql')) ids.add(entry.name);
    }
  }
  return ids;
}

function checksumOf(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

async function main() {
  if (Number(process.versions.node.split('.')[0]) < 22) {
    console.error(`❌ 需要 Node.js >= 22，当前 ${process.version}`);
    process.exit(1);
  }

  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(dbPath, { readOnly: false });
  try {
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

    const cols = db.prepare('PRAGMA table_info(schema_migrations)').all();
    const hasChecksum = cols.some(col => String(col.name || '') === 'checksum');
    if (!hasChecksum) {
      db.exec("ALTER TABLE schema_migrations ADD COLUMN checksum TEXT NOT NULL DEFAULT ''");
    }

    const files = listMigrationFiles(migrationsDir);
    const archived = listArchivedIds(migrationsDir);
    const appliedRows = db.prepare(`
      SELECT id, checksum, applied_at
      FROM schema_migrations
      WHERE migration_type = 'sql_file'
      ORDER BY id
    `).all();
    const appliedById = new Map(appliedRows.map(r => [String(r.id || ''), r]));

    let applied = 0;
    let pending = 0;
    let checksumMismatches = 0;
    for (const file of files) {
      const row = appliedById.get(file.id);
      if (!row) {
        pending += 1;
        continue;
      }
      const expected = checksumOf(fs.readFileSync(file.path, 'utf8'));
      const actual = String(row.checksum || '');
      if (actual && actual !== expected) checksumMismatches += 1;
      else applied += 1;
    }

    const activeIds = new Set(files.map(f => f.id));
    const retiredApplied = appliedRows.filter(r => archived.has(String(r.id || ''))).length;
    const orphaned = appliedRows.filter(r => {
      const id = String(r.id || '');
      return !activeIds.has(id) && !archived.has(id);
    }).length;

    console.log('=== Migration State ===');
    console.log(`db_path: ${dbPath}`);
    console.log(`migrations_dir: ${migrationsDir}`);
    console.log(`total_files: ${files.length}`);
    console.log(`applied: ${applied}`);
    console.log(`pending: ${pending}`);
    console.log(`checksum_mismatches: ${checksumMismatches}`);
    console.log(`retired_applied: ${retiredApplied}`);
    console.log(`orphaned_applied: ${orphaned}`);
  } finally {
    db.close();
  }
}

main().catch(err => {
  console.error('❌ migration status failed:', err?.message || String(err));
  process.exit(1);
});

