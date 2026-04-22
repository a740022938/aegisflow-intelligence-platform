#!/usr/bin/env node
/**
 * AGI Model Factory — Smoke Test v2.7.0
 * Dataset / Experiment / Model Lineage Closure
 * node scripts/smoke-v270.js
 */
const http  = require('http');
const path  = require('path');
const fs    = require('fs');
const { execSync } = require('child_process');

const BASE = 'http://127.0.0.1:8787';
let pass = 0, fail = 0;
const failures = [];

const T = (n, cond, detail) => {
  if (cond) { pass++; console.log('  [PASS] ' + n); }
  else { fail++; failures.push({ name: n, detail }); console.log('  [FAIL] ' + n + (detail ? ' -- ' + detail.slice(0, 80) : '')); }
};

const get = (p) => new Promise(res => {
  http.get(BASE + p, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => { try { res({ s: r.statusCode, d: JSON.parse(b) }); } catch { res({ s: r.statusCode, d: { raw: b.slice(0, 200) } }); } }); })
    .on('error', e => res({ s: 0, d: { error: e.message } }))
    .setTimeout(8000, function() { this.destroy(); res({ s: 0, d: { error: 'timeout' } }); });
});

const put = (p, body) => new Promise(res => {
  const d = JSON.stringify(body || {});
  const r = http.request({ hostname: '127.0.0.1', port: 8787, path: p, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) } }, rs => { let b = ''; rs.on('data', c => b += c); rs.on('end', () => { try { res({ s: rs.statusCode, d: JSON.parse(b) }); } catch { res({ s: rs.statusCode, d: { raw: b.slice(0, 200) } }); } }); });
  r.on('error', e => res({ s: 0, d: { error: e.message } }));
  r.setTimeout(8000, function() { this.destroy(); res({ s: 0, d: { error: 'timeout' } }); });
  r.write(d); r.end();
});

const post = (p, body) => new Promise(res => {
  const d = JSON.stringify(body || {});
  const r = http.request({ hostname: '127.0.0.1', port: 8787, path: p, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) } }, rs => { let b = ''; rs.on('data', c => b += c); rs.on('end', () => { try { res({ s: rs.statusCode, d: JSON.parse(b) }); } catch { res({ s: rs.statusCode, d: { raw: b.slice(0, 200) } }); } }); });
  r.on('error', e => res({ s: 0, d: { error: e.message } }));
  r.setTimeout(8000, function() { this.destroy(); res({ s: 0, d: { error: 'timeout' } }); });
  r.write(d); r.end();
});

const wait = ms => new Promise(r => setTimeout(r, ms));

// ── P0: Experiment CRUD + Source Snapshot ─────────────────────────────────────
async function test_experiment_crud() {
  console.log('\n[Experiment CRUD]');

  // 1. Create experiment with full sources
  const exp = await post('/api/experiments', {
    experiment_code: 'smoke_exp_' + Date.now(),
    name: 'Smoke Test Experiment',
    dataset_id:       'ds_smoke_train',
    dataset_code:     'smoke_train',
    dataset_version:  'v1',
    template_id:     'tpl_train_eval',
    template_code:   'train_eval_basic',
    params_snapshot_json: { learning_rate: 0.001, batch_size: 32, epochs: 10 },
  });
  T('create ok',    exp.d && exp.d.ok === true,    exp.d && exp.d.error ? exp.d.error.slice(0, 60) : '');
  const eid = exp.d && exp.d.experiment && exp.d.experiment.id;
  T('id returned',  typeof eid === 'string',       eid || '');
  if (!eid) return;

  // 2. Get experiment - check source fields
  const ge = await get('/api/experiments/' + eid);
  T('get ok',         ge.d && ge.d.ok === true);
  const dataset_v    = ge.d && ge.d.experiment && ge.d.experiment.dataset_version;
  const template_v  = ge.d && ge.d.experiment && ge.d.experiment.template_version;
  T('dataset_version', dataset_v === 'v1',        dataset_v || '');
  T('template_version', typeof template_v === 'string' && template_v.length > 0, template_v || '');
  const snap = ge.d && ge.d.experiment && ge.d.experiment.params_snapshot_json;
  T('params_snapshot', typeof snap === 'string' && snap.length > 2, snap || '');
  const dataset_obj = ge.d && ge.d.dataset;
  T('dataset loaded', dataset_obj && !!dataset_obj.id,    dataset_obj ? dataset_obj.dataset_code : 'null');
  const tmpl_obj   = ge.d && ge.d.template;
  T('template loaded', tmpl_obj && !!tmpl_obj.id,        tmpl_obj ? tmpl_obj.code : 'null');

  // 3. Update experiment
  const up = await put('/api/experiments/' + eid, { status: 'running' });
  T('update ok',    up.d && up.d.ok === true);

  // 4. List experiments
  const ls = await get('/api/experiments');
  T('list ok',      ls.d && ls.d.ok === true);
  T('list has exp', ls.d && ls.d.experiments && ls.d.experiments.length > 0, String(ls.d.experiments ? ls.d.experiments.length : 0));

  return eid;
}

// ── P0: Model CRUD + Promote ─────────────────────────────────────────────────
async function test_model_crud() {
  console.log('\n[Model CRUD]');

  // 1. Create model
  const m = await post('/api/models', {
    name:                   'Smoke Test Model',
    version:                '0.1.0',
    source_experiment_id:   '',
    source_dataset_version: 'v1',
    source_template_version: '1.0.0',
  });
  T('create ok',       m.d && m.d.ok === true,     m.d && m.d.error ? m.d.error.slice(0, 60) : '');
  const mid = m.d && m.d.model && m.d.model.model_id;
  T('id returned',     typeof mid === 'string',      mid || '');
  if (!mid) return;

  // 2. Get model
  const gm = await get('/api/models/' + mid);
  T('get ok',          gm.d && gm.d.ok === true);
  T('status draft',    gm.d && gm.d.model && gm.d.model.status === 'draft', gm.d.model ? gm.d.model.status : '');

  // 3. Promote: draft -> candidate
  const p1 = await post('/api/models/' + mid + '/promote', { promoted_by: 'smoke', note: 'v2.7 smoke test' });
  T('promote ok',       p1.d && p1.d.ok === true,     p1.d && p1.d.error ? p1.d.error.slice(0, 60) : '');
  T('promoted to candidate', p1.d && p1.d.new_status === 'candidate', p1.d ? p1.d.new_status : '');

  // 4. Promote: candidate -> approved
  const p2 = await post('/api/models/' + mid + '/promote', { promoted_by: 'smoke', note: 'v2.7 smoke test 2' });
  T('promote2 ok',      p2.d && p2.d.ok === true,     p2.d && p2.d.error ? p2.d.error.slice(0, 60) : '');
  T('promoted to approved', p2.d && p2.d.new_status === 'approved', p2.d ? p2.d.new_status : '');

  // 5. Promote: approved -> released
  const p3 = await post('/api/models/' + mid + '/promote', { promoted_by: 'smoke' });
  T('promote3 ok',      p3.d && p3.d.ok === true,     p3.d && p3.d.error ? p3.d.error.slice(0, 60) : '');
  T('promoted to released', p3.d && p3.d.new_status === 'released', p3.d ? p3.d.new_status : '');

  // 6. Cannot promote already released
  const p4 = await post('/api/models/' + mid + '/promote', {});
  T('cannot promote released', !(p4.d && p4.d.ok), p4.d && p4.d.error ? p4.d.error.slice(0, 60) : 'no error');

  // 7. List models
  const ls = await get('/api/models');
  T('list ok',       ls.d && ls.d.ok === true);
  T('list has model', ls.d && ls.d.models && ls.d.models.length > 0, String(ls.d.models ? ls.d.models.length : 0));

  return mid;
}

// ── P0: Release Readiness ─────────────────────────────────────────────────────
async function test_release_readiness(eid, mid) {
  console.log('\n[Release Readiness]');

  const rr = await get('/api/models/' + mid + '/release-readiness');
  T('get ok',      rr.d && rr.d.ok === true,    rr.d && rr.d.error ? rr.d.error.slice(0, 60) : '');
  T('has checks',  rr.d && Array.isArray(rr.d.checks) && rr.d.checks.length >= 4, String(rr.d.checks ? rr.d.checks.length : 0));
  T('passed_checks', rr.d && rr.d.total_checks > 0, String(rr.d.total_checks));
  const chkNames = rr.d && rr.d.checks ? rr.d.checks.map(c => c.id) : [];
  T('has_experiment check', chkNames.includes('has_experiment'));
  T('has_evaluation check', chkNames.includes('has_evaluation'));
  T('workflow_valid check', chkNames.includes('workflow_valid'));
}

// ── P0: Lineage ──────────────────────────────────────────────────────────────
async function test_lineage(eid, mid) {
  console.log('\n[Lineage]');

  // Model lineage
  const ml = await get('/api/models/' + mid + '/lineage');
  T('model lineage ok', ml.d && ml.d.ok === true, ml.d && ml.d.error ? ml.d.error.slice(0, 60) : '');
  T('has model',         ml.d && ml.d.model && !!ml.d.model.model_id, ml.d.model ? ml.d.model.name : 'none');
  T('has lineage obj',   ml.d && ml.d.lineage && typeof ml.d.lineage === 'object');
  T('has upstream',      ml.d && ml.d.lineage && ml.d.lineage.upstream !== undefined);

  // Experiment lineage
  if (eid) {
    const el = await get('/api/experiments/' + eid + '/lineage');
    T('experiment lineage ok', el.d && el.d.ok === true, el.d && el.d.error ? el.d.error.slice(0, 60) : '');
    T('experiment upstream',   el.d && el.d.upstream !== undefined);
    T('experiment downstream', el.d && el.d.downstream !== undefined);
    T('params_snapshot',      el.d && el.d.params_snapshot !== undefined);
  }
}

// ── P0: Experiment -> Evaluations ───────────────────────────────────────────
async function test_experiment_evaluations(eid) {
  console.log('\n[Experiment Evaluations]');

  if (!eid) { console.log('  [SKIP no experiment id]'); return; }

  const ev = await get('/api/experiments/' + eid + '/evaluations');
  T('get ok',    ev.d && ev.d.ok === true,      ev.d && ev.d.error ? ev.d.error.slice(0, 60) : '');
  T('is array',  Array.isArray(ev.d && ev.d.evaluations));
  T('total >= 0', typeof (ev.d && ev.d.total) === 'number', String(ev.d ? ev.d.total : 'N/A'));
}

// ── P1: Evaluation -> Experiment Binding ─────────────────────────────────────
async function test_evaluation_experiment_binding() {
  console.log('\n[Evaluation Experiment Binding]');

  // Create evaluation WITH experiment_id
  const ev = await post('/api/evaluations', {
    name:            'Smoke Eval ' + Date.now(),
    evaluation_type: 'classification',
    status:          'pending',
    experiment_id:   'nonexistent_exp_id',
  });
  T('create with experiment_id ok', ev.d && ev.d.ok === true, ev.d && ev.d.error ? ev.d.error.slice(0, 60) : '');

  const ev2 = await get('/api/evaluations?limit=5');
  T('list evaluations ok', ev2.d && Array.isArray(ev2.d.evaluations), '');
}

// ── P1: Audit for Promote ───────────────────────────────────────────────────
async function test_audit_promote() {
  console.log('\n[Audit Promote]');

  const ar = await get('/api/audit/recent?action=model_promoted&limit=5');
  T('audit ok',      ar.d && ar.d.ok === true);
  T('promote logged', ar.d && ar.d.data && ar.d.data.length > 0, String(ar.d.data ? ar.d.data.length : 0));
}

// ── P1: List Experiments Filter ─────────────────────────────────────────────
async function test_experiment_filter() {
  console.log('\n[Experiment Filter]');

  const ls1 = await get('/api/experiments?status=running');
  T('filter by status ok', ls1.d && ls1.d.ok === true, ls1.d && ls1.d.error ? ls1.d.error.slice(0, 60) : '');
  const ls2 = await get('/api/experiments?dataset_code=smoke_train');
  T('filter by dataset_code ok', ls2.d && ls2.d.ok === true, ls2.d && ls2.d.error ? ls2.d.error.slice(0, 60) : '');
}

// ── Health + Ops (regression) ───────────────────────────────────────────────
async function test_regression() {
  console.log('\n[Regression: Health + Ops]');

  const h = await get('/api/health');
  T('health 200',   h.s === 200);
  T('health ok',    h.d && h.d.ok === true);
  T('health v2.7', h.d && h.d.version === '2.7.0', h.d.version || '');

  const s = await get('/api/ops/summary');
  T('ops ok',       s.d && s.d.ok === true);
  T('ops version',  s.d && s.d.data && s.d.data.version === '2.7.0', s.d.data ? s.d.data.version : '');
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('=== AGI Model Factory Smoke v2.7.0 ===');
  console.log('API: ' + BASE);

  await test_regression();
  const eid = await test_experiment_crud();
  const mid = await test_model_crud();
  await test_release_readiness(eid, mid);
  await test_lineage(eid, mid);
  await test_experiment_evaluations(eid);
  await test_evaluation_experiment_binding();
  await test_audit_promote();
  await test_experiment_filter();

  console.log('\n=== RESULT: ' + pass + ' passed, ' + fail + ' failed ===');
  if (fail > 0) {
    failures.forEach(f => console.log('FAIL: ' + f.name + (f.detail ? ' -- ' + f.detail : '')));
    process.exit(1);
  } else {
    console.log('ALL PASSED -- v2.7.0 OK');
  }
})().catch(e => { console.error(e); process.exit(1); });
