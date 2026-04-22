#!/usr/bin/env node
/**
 * AGI Model Factory — Smoke Test v2.6.0
 * node scripts/smoke-v260.js [--api <url>]
 */
const http  = require('http');
const https = require('https');
const path  = require('path');
const fs    = require('fs');
const { execSync } = require('child_process');
const { tmpdir }   = require('os');

const BASE = (() => {
  const i = process.argv.indexOf('--api');
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : 'http://127.0.0.1:8787';
})();

let pass = 0, fail = 0;
const failures = [];

const T = (n, cond, detail) => {
  if (cond) { pass++; console.log('  [PASS] ' + n); }
  else { fail++; failures.push({ name: n, detail }); console.log('  [FAIL] ' + n + (detail ? ' -- ' + detail.slice(0, 80) : '')); }
};

const get = (p) => new Promise(res => {
  const u = new URL(BASE + p);
  const m = u.protocol === 'https:' ? https : http;
  const r = m.get(u, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => { try { res({ s: r.statusCode, d: JSON.parse(b) }); } catch { res({ s: r.statusCode, d: { raw: b.slice(0, 200) } }); } }); });
  r.on('error', e => res({ s: 0, d: { error: e.message } }));
  r.setTimeout(5000, () => { r.destroy(); res({ s: 0, d: { error: 'timeout' } }); });
});

const post = (p, body) => new Promise(res => {
  const u = new URL(BASE + p);
  const m = u.protocol === 'https:' ? https : http;
  const d = JSON.stringify(body || {});
  const r = m.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) } }, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => { try { res({ s: r.statusCode, d: JSON.parse(b) }); } catch { res({ s: r.statusCode, d: { raw: b.slice(0, 200) } }); } }); });
  r.on('error', e => res({ s: 0, d: { error: e.message } }));
  r.setTimeout(5000, () => { r.destroy(); res({ s: 0, d: { error: 'timeout' } }); });
  r.write(d); r.end();
});

const sh = (cmd) => { try { return { out: execSync(cmd, { encoding: 'utf-8', timeout: 30000 }), code: 0 }; } catch (e) { return { out: e.message, code: e.status || 1 }; } };

const wait = ms => new Promise(r => setTimeout(r, ms));

async function test_health() {
  console.log('\n[Health]');
  const h = await get('/api/health');
  T('200', h.s === 200); T('ok', h.d && h.d.ok === true);
  T('version', typeof h.d && typeof h.d.version === 'string');
  T('database', typeof h.d && typeof h.d.database === 'string');
  T('workflows', typeof h.d && typeof h.d.workflows === 'object');
  T('approvals', typeof h.d && typeof h.d.approvals === 'object');
  T('incidents', typeof h.d && typeof h.d.incidents === 'object');
  T('v2.5+', typeof h.d && parseFloat(h.d.version) >= 2.5);
}

async function test_ops() {
  console.log('\n[Ops Summary]');
  const s = await get('/api/ops/summary');
  T('200', s.s === 200); T('ok', s.d && s.d.ok === true);
  T('workflows.allTime', s.d && typeof s.d.data && typeof s.d.data.workflows && typeof s.d.data.workflows.allTime === 'object');
  T('workflows.last24h', s.d && s.d.data && s.d.data.workflows && typeof s.d.data.workflows.last24h === 'object');
  T('approvals.allTime', s.d && s.d.data && s.d.data.approvals && typeof s.d.data.approvals.allTime === 'object');
  T('timestamp', s.d && s.d.data && !!s.d.data.timestamp);
  T('v>=2.5', s.d && s.d.data && parseFloat(s.d.data.version) >= 2.5);
}

async function test_wf_stats() {
  console.log('\n[Workflow Stats]');
  const ws = await get('/api/workflow-jobs/stats');
  T('200', ws.s === 200); T('ok', ws.d && ws.d.ok === true);
  T('byStatus', ws.d && typeof ws.d.data && typeof ws.d.data.byStatus === 'object');
  T('recentFailures', ws.d && Array.isArray(ws.d.data && ws.d.data.recentFailures));
  T('retryLimitExceeded', ws.d && typeof ws.d.data && typeof ws.d.data.retryLimitExceeded === 'number');
  T('staleReconciled', ws.d && typeof ws.d.data && typeof ws.d.data.staleReconciled === 'number');
  const ws24 = await get('/api/workflow-jobs/stats?hours=24');
  T('hours=24', ws24.d && ws24.d.ok === true);
  T('window=last24h', ws24.d && ws24.d.window === 'last 24h');
}

async function test_appr() {
  console.log('\n[Approvals Stats]');
  const a = await get('/api/approvals/stats');
  T('200', a.s === 200); T('ok', a.d && a.d.ok === true);
  T('byStatus', a.d && typeof a.d.data && typeof a.d.data.byStatus === 'object');
  T('byPolicy', a.d && typeof a.d.data && typeof a.d.data.byPolicy === 'object');
  T('recentAll', a.d && Array.isArray(a.d.data && a.d.data.recentAll));
}

async function test_audit() {
  console.log('\n[Audit Recent]');
  const ar = await get('/api/audit/recent?limit=10');
  T('200', ar.s === 200); T('ok', ar.d && ar.d.ok === true);
  const arr = ar.d && ar.d.data;
  T('data[]', arr && Array.isArray(arr) && arr.length > 0, 'len=' + (arr ? arr.length : 0));
  T('sorted', !arr || arr.length < 2 || arr[0].created_at >= arr[arr.length - 1].created_at);
  T('has detail', arr && arr[0] && 'detail' in arr[0]);
  const arF = await get('/api/audit/recent?action=workflow_retry_limit_exceeded&limit=5');
  T('filter by action', arF.d && arF.d.ok === true);
}

async function test_crud() {
  console.log('\n[Workflow CRUD]');
  const name = 'smoke_' + Date.now();
  const j = await post('/api/workflow-jobs', { name: name, steps: [{ step_key: 'x', step_name: 'X', step_order: 1 }], input: { pkg: 'test' } });
  T('create ok', j.d && j.d.ok === true, j.d && j.d.error ? j.d.error.slice(0, 60) : '');
  const id = j.d && j.d.job && j.d.job.id;
  T('id returned', typeof id === 'string', id || '');

  const st = await post('/api/workflow-jobs/' + id + '/start', {});
  T('start ok', st.d && st.d.ok === true, st.d && st.d.error ? st.d.error.slice(0, 60) : '');
  await wait(200);

  const g = await get('/api/workflow-jobs/' + id);
  T('get ok', g.d && g.d.ok === true);
  const status = g.d && g.d.job && g.d.job.status;
  T('valid status', ['running','completed','failed','paused','cancelled'].includes(status), status || 'none');

  const r = await post('/api/workflow-jobs/' + id + '/retry', { retried_by: 'smoke' });
  T('retry ok', r.d && r.d.ok === true, r.d && r.d.error ? r.d.error.slice(0, 60) : '');

  const j2 = await post('/api/workflow-jobs', { name: 'gate_' + Date.now(), steps: [{ step_key: 'g', step_name: 'Gate', step_order: 1, require_approval: true }], input: { pkg: 'test2' } });
  await post('/api/workflow-jobs/' + (j2.d && j2.d.job && j2.d.job.id) + '/start', {});
  await wait(300);
  const g2 = await get('/api/workflow-jobs/' + (j2.d && j2.d.job && j2.d.job.id));
  const g2status = g2.d && g2.d.job && g2.d.job.status;
  T('approval gate pauses', g2status === 'paused', g2status || 'none');
  const pen = await get('/api/approvals/pending');
  T('pending>0', pen.d && pen.d.approvals && pen.d.approvals.length > 0);
}

async function test_backup() {
  console.log('\n[Backup]');
  const tag = 'smoke_' + Date.now();
  const scriptPath = 'E:\\AGI_Factory\\repo\\scripts\\backup.mjs';
  const { out, code } = sh('node "' + scriptPath + '" --tag ' + tag);
  T('exit 0', code === 0, code > 0 ? out.slice(0, 80) : '');
  if (code !== 0) return;

  // Find summary JSON path from output
  const sumLines = out.split('\n');
  let sumPath = '';
  for (const line of sumLines) {
    if (line.startsWith('Summary:')) {
      sumPath = line.replace('Summary:', '').trim();
      break;
    }
  }
  T('summary path', sumPath.length > 0, sumPath);
  let zipPath = '', zipSize = 0, filesCount = 0;
  if (sumPath && fs.existsSync(sumPath)) {
    try {
      const s = JSON.parse(fs.readFileSync(sumPath, 'utf-8'));
      zipPath = s.backup_file || '';
      zipSize = s.backup_size || 0;
      filesCount = s.files_count || 0;
      T('v=2.6.0', s.version === '2.6.0');
      T('files>0', filesCount > 0, String(filesCount));
      T('zip path', zipPath.length > 0, zipPath);
      T('zip exists', zipPath.length > 0 && fs.existsSync(zipPath), zipPath);
      T('zip>1KB', zipSize > 1024, String(zipSize) + 'B');
    } catch (e) { T('summary parse', false, e.message); }
  } else {
    T('summary readable', false, 'file not found: ' + sumPath);
  }

  await wait(300);
  const ar = await get('/api/audit/recent?action=backup_created&limit=3');
  const arr = ar.d && ar.d.data;
  T('audit log', arr && arr.length > 0, 'len=' + (arr ? arr.length : 0));

  return zipPath;
}

async function test_restore(zipPath) {
  console.log('\n[Restore]');
  if (!zipPath || !fs.existsSync(zipPath)) { console.log('  [SKIP no zip]'); return; }
  const scriptPath = 'E:\\AGI_Factory\\repo\\scripts\\restore.mjs';

  const dOut = sh('node "' + scriptPath + '" "' + zipPath + '" --dry-run');
  T('dry-run exit 0', dOut.code === 0, dOut.code > 0 ? dOut.out.slice(0, 80) : '');
  T('dry-run lists files', dOut.out.includes('DRY RUN'));

  const rOut = sh('node "' + scriptPath + '" "' + zipPath + '"');
  T('live exit 0', rOut.code === 0, rOut.code > 0 ? rOut.out.slice(0, 80) : '');
  T('live shows count', rOut.out.includes('Restored ') || rOut.out.includes('Restore complete'), rOut.out.slice(0, 60));

  await wait(500);
  const ar = await get('/api/audit/recent?action=restore_completed&limit=3');
  const arr = ar.d && ar.d.data;
  T('restore audit log', arr && arr.length > 0, 'len=' + (arr ? arr.length : 0));

  const h = await get('/api/health');
  T('server healthy', h.d && h.d.ok === true, h.d && h.d.error ? h.d.error.slice(0, 60) : '');
}

(async () => {
  console.log('=== AGI Model Factory Smoke v2.6.0 ===');
  console.log('API: ' + BASE);

  await test_health();
  await test_ops();
  await test_wf_stats();
  await test_appr();
  await test_audit();
  await test_crud();
  const zp = await test_backup();
  await test_restore(zp);

  console.log('\n=== RESULT: ' + pass + ' passed, ' + fail + ' failed ===');
  if (fail > 0) {
    failures.forEach(f => console.log('FAIL: ' + f.name + (f.detail ? ' -- ' + f.detail : '')));
    process.exit(1);
  } else {
    console.log('ALL PASSED -- v2.6.0 OK');
  }
})().catch(e => { console.error(e); process.exit(1); });
