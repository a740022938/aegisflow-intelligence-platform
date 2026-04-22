#!/usr/bin/env node
/**
 * AGI Model Factory — Backup Script v2.6.0
 * Usage: node scripts/backup.mjs [--tag <tag>] [--outdir <dir>]
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
let tag = '', outdir = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tag' && args[i + 1]) tag = args[++i];
  if (args[i] === '--outdir' && args[i + 1]) outdir = args[++i];
}

const AUDIT_DIR  = path.join(REPO_ROOT, '..', 'audit');
const BACKUP_DIR = outdir || AUDIT_DIR;
const DB_DIR     = path.join(REPO_ROOT, 'packages', 'db');
const SRC_DIR    = path.join(REPO_ROOT, 'apps', 'local-api', 'src');
const SCHEMA_FILE = path.join(DB_DIR, 'schema.sql');

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const tagSuffix = tag ? '_' + tag : '';
const zipName = 'AGI_Model_Factory_v2.6.0_backup' + tagSuffix + '_' + ts.slice(0, 10) + '.zip';
const zipPath  = path.join(BACKUP_DIR, zipName);

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
console.log('Backup: ' + zipPath);

function collectFiles(dir, exts) {
  const r = [];
  if (!fs.existsSync(dir)) return r;
  for (const e of fs.readdirSync(dir, { recursive: true })) {
    const fp = path.join(dir, e);
    try { if (fs.statSync(fp).isFile() && exts.some(x => String(e).endsWith(x))) r.push(fp); } catch {}
  }
  return r;
}

const files = [
  ...collectFiles(DB_DIR,  ['.db', '.db-shm', '.db-wal', '.db.bak', '.sql']),
  ...collectFiles(SRC_DIR, ['.ts', '.js', '.json', '.mjs']),
  ...(fs.existsSync(SCHEMA_FILE) ? [SCHEMA_FILE] : []),
  ...collectFiles(AUDIT_DIR, ['.md', '.zip']),
];
console.log('Files: ' + files.length);

const dbFile = path.join(DB_DIR, 'agi_factory.db');
let dbSha = 'no-db';

// v4.8.1: WAL checkpoint before backup to ensure consistency
if (fs.existsSync(dbFile)) {
  try {
    const tmpPy = path.join(tmpdir(), 'wal_checkpoint_' + Date.now() + '.py');
    const py = [
      'import sqlite3',
      'conn = sqlite3.connect(r"' + dbFile.replace(/"/g, '\\"') + '")',
      'cur = conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")',
      'print("WAL checkpoint:", cur.fetchone())',
      'conn.close()',
    ];
    fs.writeFileSync(tmpPy, py.join('\n'), 'utf-8');
    const out = execSync('python "' + tmpPy + '"', { encoding: 'utf-8', timeout: 10000 });
    fs.rmSync(tmpPy, { force: true });
    console.log('WAL: ' + out.trim());
  } catch (e) {
    console.warn('WAL checkpoint failed (non-fatal): ' + e.message);
  }
}

if (fs.existsSync(dbFile)) {
  const raw = fs.readFileSync(dbFile);
  dbSha = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
  console.log('DB: ' + (raw.length / 1024).toFixed(1) + ' KB, SHA=' + dbSha);
}

const tmpMirror = path.join(tmpdir(), 'agi_backup_mirror_' + Date.now());
fs.mkdirSync(tmpMirror, { recursive: true });
try {
  for (const f of files) {
    const rel = path.relative(REPO_ROOT, f);
    const dst = path.join(tmpMirror, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(f, dst);
  }
  const ze = zipPath.replace(/'/g, "''");
  const me = tmpMirror.replace(/'/g, "''");
  execSync('powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory(\'' + me + '\',\'' + ze + '\')"', {
    stdio: ['pipe', 'pipe', 'pipe'], timeout: 30000,
  });
} catch (e) {
  console.error('Zip failed: ' + e.message);
  process.exit(1);
} finally {
  fs.rmSync(tmpMirror, { recursive: true, force: true });
}

const zipSize = fs.statSync(zipPath).size;
console.log('Zip: ' + zipPath + ' (' + (zipSize / 1024).toFixed(1) + ' KB)');

// Audit log via Python (write file, exec, delete)
const auditId = crypto.randomUUID();
const detail  = JSON.stringify({
  backup_file: zipPath, backup_size: zipSize, files_count: files.length,
  db_sha256_prefix: dbSha, tag: tag || null,
});
const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

try {
  const tmpPy = path.join(tmpdir(), 'audit_backup_' + Date.now() + '.py');
  // Use triple-quoted SQL to avoid ALL escaping issues
  const py = [
    'import sqlite3',
    'conn = sqlite3.connect(r"' + dbFile.replace(/"/g, '\\"') + '")',
    'conn.execute("PRAGMA journal_mode=WAL")',
    'conn.execute("""INSERT INTO audit_logs (id,category,action,target,result,detail_json,created_at) VALUES (?,?,?,?,?,?,?)""",',
    '  ("""' + auditId.replace(/"/g, '\\"') + '""", "system", "backup_created", """' + zipPath.replace(/"/g, '\\"') + '""", "success", """' + detail.replace(/"/g, '\\"') + '""", """' + nowStr + '"""))',
    'conn.commit(); conn.close(); print("OK")',
  ];
  fs.writeFileSync(tmpPy, py.join('\n'), 'utf-8');
  const out = execSync('python "' + tmpPy + '"', { encoding: 'utf-8', timeout: 10000 });
  fs.rmSync(tmpPy, { force: true });
  if (out.includes('OK')) console.log('Audit: ' + auditId);
} catch (e) {
  console.warn('Audit skipped: ' + e.message);
}

// Summary JSON
const summary = {
  timestamp: new Date().toISOString(), version: '2.6.0', backup_file: zipPath,
  backup_size: zipSize, files_count: files.length, db_sha256_prefix: dbSha,
  tag: tag || null, audit_id: auditId,
};
const summaryPath = path.join(BACKUP_DIR, 'backup_summary_' + ts.slice(0, 10) + tagSuffix + '.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log('Summary: ' + summaryPath);
