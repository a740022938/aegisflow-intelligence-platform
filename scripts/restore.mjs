#!/usr/bin/env node
/**
 * AGI Model Factory — Restore Script v2.6.0
 * Usage: node scripts/restore.mjs <backup.zip> [--dry-run]
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
if (!args[0]) { console.error('Usage: node scripts/restore.mjs <backup.zip> [--dry-run]'); process.exit(1); }

const zipPath = path.resolve(args[0]);
const dryRun  = args.includes('--dry-run');
if (!fs.existsSync(zipPath)) { console.error('File not found: ' + zipPath); process.exit(1); }

console.log('Restore: ' + zipPath + ' [' + (dryRun ? 'DRY RUN' : 'LIVE') + ']');

const DB_DIR    = path.join(REPO_ROOT, 'packages', 'db');
const SRC_DIR   = path.join(REPO_ROOT, 'apps', 'local-api', 'src');
const AUDIT_DIR = path.join(REPO_ROOT, '..', 'audit');

// Extract via Python zipfile
const tempDir = path.join(tmpdir(), 'agi_factory_restore_' + Date.now());
fs.mkdirSync(tempDir, { recursive: true });
try {
  const ze = zipPath.replace(/'/g, "''");
  const te = tempDir.replace(/'/g, "''");
  execSync('python -c "import zipfile; zipfile.ZipFile(r\'' + ze + '\',\'r\').extractall(r\'' + te + '\')"', {
    stdio: ['pipe', 'pipe', 'pipe'], timeout: 30000,
  });
} catch (e) { console.error('Extract failed: ' + e.message); process.exit(1); }

const extracted = [];
for (const e of fs.readdirSync(tempDir, { recursive: true })) {
  const fp = path.join(tempDir, e);
  try { if (fs.statSync(fp).isFile()) extracted.push(e); } catch {}
}
console.log('Extracted ' + extracted.length + ' files');

if (dryRun) {
  console.log('\nDRY RUN — would restore:');
  extracted.forEach(f => console.log('  ' + f));
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('\nDry run done.'); process.exit(0);
}

let restoredCount = 0, skipped = 0;
const restoredList = [];

function safeCopy(src, dst) {
  try {
    if (fs.existsSync(dst)) fs.copyFileSync(dst, dst + '.pre-restore-' + Date.now());
    fs.copyFileSync(src, dst);
    return true;
  } catch (e) {
    if (['UNKNOWN', 'EBUSY', 'EPERM', 'EACCES'].includes(e.code)) {
      console.log('  [SKIP locked] ' + path.basename(dst) + ' (' + e.code + ')');
      skipped++; return false;
    }
    throw e;
  }
}

for (const f of extracted.filter(f => f.match(/\.db(-shm|-wal|-bak)?$/))) {
  const src = path.join(tempDir, f);
  const dst = path.join(DB_DIR, path.basename(f));
  if (!fs.existsSync(src)) continue;
  if (safeCopy(src, dst)) { restoredCount++; restoredList.push({ from: f, to: dst }); }
}
for (const f of extracted.filter(f => f.endsWith('schema.sql'))) {
  if (safeCopy(path.join(tempDir, f), path.join(DB_DIR, path.basename(f)))) { restoredCount++; }
}
for (const f of extracted.filter(f => f.includes('local-api') && f.includes('src') && (f.endsWith('.ts') || f.endsWith('.js')))) {
  const src = path.join(tempDir, f);
  const rel = f.split('src' + path.sep).pop();
  if (!rel) continue;
  const dst = path.join(SRC_DIR, rel);
  const d = path.dirname(dst);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  if (!fs.existsSync(src)) continue;
  if (safeCopy(src, dst)) { restoredCount++; restoredList.push({ from: f, to: dst }); }
}
for (const f of extracted.filter(f => f.endsWith('.md') || f.endsWith('.zip'))) {
  const dst = path.join(AUDIT_DIR, path.basename(f));
  if (safeCopy(path.join(tempDir, f), dst)) { restoredCount++; }
}

console.log('\nRestored ' + restoredCount + ' files, skipped ' + skipped + ' (locked)');
restoredList.slice(0, 10).forEach(r => console.log('  ' + r.from));
if (restoredList.length > 10) console.log('  ... and ' + (restoredList.length - 10) + ' more');

const dbFile = path.join(DB_DIR, 'agi_factory.db');
let dbSha = 'no-db';
try { if (fs.existsSync(dbFile)) dbSha = crypto.createHash('sha256').update(fs.readFileSync(dbFile)).digest('hex').slice(0, 16); } catch {}

// Audit via Python
const auditId = crypto.randomUUID();
const detail  = JSON.stringify({
  restore_source: zipPath, files_restored: restoredCount, skipped_locked: skipped,
  restored_files: restoredList.map(r => r.to), db_sha256_prefix: dbSha,
});
const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
try {
  const tmpPy = path.join(tmpdir(), 'audit_restore_' + Date.now() + '.py');
  const py = [
    'import sqlite3',
    'conn = sqlite3.connect(r"' + dbFile.replace(/"/g, '\\"') + '")',
    'conn.execute("PRAGMA journal_mode=WAL")',
    'conn.execute("""INSERT INTO audit_logs (id,category,action,target,result,detail_json,created_at) VALUES (?,?,?,?,?,?,?)""",',
    '  ("""' + auditId.replace(/"/g, '\\"') + '""", "system", "restore_completed", """' + zipPath.replace(/"/g, '\\"') + '""", "success", """' + detail.replace(/"/g, '\\"') + '""", """' + nowStr + '"""))',
    'conn.commit(); conn.close(); print("OK")',
  ];
  fs.writeFileSync(tmpPy, py.join('\n'), 'utf-8');
  const out = execSync('python "' + tmpPy + '"', { encoding: 'utf-8', timeout: 10000 });
  fs.rmSync(tmpPy, { force: true });
  if (out.includes('OK')) console.log('Audit: ' + auditId);
} catch (e) { console.warn('Audit skipped: ' + e.message); }

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('\nRestore complete.');
