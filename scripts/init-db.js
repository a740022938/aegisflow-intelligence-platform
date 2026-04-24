#!/usr/bin/env node
/**
 * Initialize SQLite via migration-first flow.
 *
 * Run:
 *   node scripts/init-db.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.join(ROOT, 'packages', 'db', 'agi_factory.db');
const MIGRATIONS_DIR = process.env.AIP_DB_MIGRATIONS_DIR
  ? path.resolve(process.env.AIP_DB_MIGRATIONS_DIR)
  : path.join(ROOT, 'packages', 'db', 'migrations-core');

const major = parseInt(process.versions.node.split('.')[0], 10);
if (major < 22) {
  console.error('❌ 需要 Node.js v22+ (node:sqlite)');
  console.error(`   当前版本: v${process.versions.node}`);
  process.exit(1);
}

function ensureMigrationTable(db) {
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

function migrationExists(db, id) {
  const row = db
    .prepare('SELECT id FROM schema_migrations WHERE id = ? LIMIT 1')
    .get(id);
  return !!(row && row.id);
}

function getMigrationChecksum(db, id) {
  const row = db
    .prepare('SELECT checksum FROM schema_migrations WHERE id = ? LIMIT 1')
    .get(id);
  return String(row?.checksum || '');
}

function checksumOf(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

async function main() {
  console.log('🗄️  初始化数据库 (migration-first)...');
  console.log(`   DB: ${DB_PATH}`);
  console.log(`   Migrations: ${MIGRATIONS_DIR}`);

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '');

  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(DB_PATH);

  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch {}
  db.exec('PRAGMA foreign_keys = ON;');

  ensureMigrationTable(db);
  const files = listMigrationFiles(MIGRATIONS_DIR);

  let applied = 0;
  let skipped = 0;
  for (const file of files) {
    if (migrationExists(db, file.id)) {
      const sql = fs.readFileSync(file.path, 'utf8');
      const nextChecksum = checksumOf(sql);
      const currentChecksum = getMigrationChecksum(db, file.id);
      if (currentChecksum && currentChecksum !== nextChecksum) {
        throw new Error(
          `Migration checksum mismatch (${file.id}): expected ${currentChecksum}, got ${nextChecksum}`,
        );
      }
      skipped += 1;
      continue;
    }

    const sql = fs.readFileSync(file.path, 'utf8');
    const checksum = checksumOf(sql);
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(sql);
      db.prepare(
        `
          INSERT INTO schema_migrations (id, migration_type, target_name, description, checksum, applied_at)
          VALUES (?, 'sql_file', ?, ?, ?, datetime('now'))
        `,
      ).run(file.id, file.id, `SQL migration file: ${file.id}`, checksum);
      db.exec('COMMIT');
      applied += 1;
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error(
        `Migration failed (${file.id}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  db.exec('PRAGMA optimize');

  const tableCount = db
    .prepare("SELECT COUNT(*) AS c FROM sqlite_master WHERE type='table'")
    .get().c;
  const indexCount = db
    .prepare("SELECT COUNT(*) AS c FROM sqlite_master WHERE type='index'")
    .get().c;

  console.log('✅ 数据库初始化完成');
  console.log(`   迁移文件: ${files.length}`);
  console.log(`   应用: ${applied}`);
  console.log(`   跳过: ${skipped}`);
  console.log(`   表: ${tableCount}`);
  console.log(`   索引: ${indexCount}`);

  db.close();
}

main().catch(error => {
  console.error('❌ 初始化失败:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
