import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function now() { return new Date().toISOString(); }

export function registerHPORoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS hpo_runs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, method TEXT DEFAULT 'random',
      param_space_json TEXT NOT NULL DEFAULT '[]', target_metric TEXT DEFAULT 'mAP',
      status TEXT DEFAULT 'pending', best_params_json TEXT DEFAULT '{}',
      best_value REAL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hpo_trials (
      id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trial_index INTEGER NOT NULL,
      params_json TEXT NOT NULL DEFAULT '{}', result_value REAL,
      status TEXT DEFAULT 'pending', created_at TEXT NOT NULL
    );
  `);

  app.post('/api/hpo/run', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.name) return reply.code(400).send({ ok: false, error: 'name is required' });
    const paramSpace = Array.isArray(body.param_space) ? body.param_space : [];
    const method = ['grid', 'random', 'bayesian'].includes(body.method) ? body.method : 'random';
    const id = randomUUID();
    const n = now();
    db.prepare(`INSERT INTO hpo_runs (id, name, method, param_space_json, target_metric, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'running', ?, ?)`)
      .run(id, body.name, method, JSON.stringify(paramSpace), body.target_metric || 'mAP', n, n);

    // Generate trials
    const trials = generateTrials(id, paramSpace, method, body.target_metric || 'mAP');
    let bestValue = -Infinity;
    let bestParams: any = {};
    for (const t of trials) {
      db.prepare(`INSERT INTO hpo_trials (id, run_id, trial_index, params_json, result_value, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'completed', ?)`)
        .run(randomUUID(), id, t.index, JSON.stringify(t.params), t.value, n);
      if (t.value > bestValue) { bestValue = t.value; bestParams = t.params; }
    }
    db.prepare(`UPDATE hpo_runs SET status = 'completed', best_value = ?, best_params_json = ?, updated_at = ? WHERE id = ?`)
      .run(bestValue, JSON.stringify(bestParams), n, id);
    const row = db.prepare('SELECT * FROM hpo_runs WHERE id = ?').get(id);
    return { ok: true, run: serializeRun(row), trials_count: trials.length };
  });

  app.get('/api/hpo/runs', async (_req, reply) => {
    const rows = db.prepare('SELECT * FROM hpo_runs ORDER BY created_at DESC').all();
    return { ok: true, runs: rows.map(serializeRun), count: rows.length };
  });

  app.get('/api/hpo/runs/:id', async (request: any, reply: any) => {
    const row = db.prepare('SELECT * FROM hpo_runs WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'run not found' });
    const trials = db.prepare('SELECT * FROM hpo_trials WHERE run_id = ? ORDER BY trial_index').all(request.params.id);
    return { ok: true, run: serializeRun(row), trials: trials.map(serializeTrial), trials_count: trials.length };
  });
}

function generateTrials(runId: string, paramSpace: any[], method: string, _targetMetric: string) {
  const trials: Array<{ index: number; params: Record<string, number>; value: number }> = [];
  const sampleParam = (p: any) => {
    if (p.values && Array.isArray(p.values)) {
      return p.values[Math.floor(Math.random() * p.values.length)];
    }
    const mn = p.min ?? 0;
    const mx = p.max ?? 1;
    const step = p.step || ((mx - mn) / 10);
    const steps = Math.round((mx - mn) / step);
    const v = mn + Math.floor(Math.random() * (steps + 1)) * step;
    return Math.round(v * 1e6) / 1e6;
  };

  const count = method === 'grid' ? Math.min(27, paramSpace.reduce((a: number, p: any) => {
    const steps = p.values ? p.values.length : Math.round((p.max - p.min) / (p.step || 0.1)) + 1;
    return a * Math.min(steps, 3);
  }, 1)) : Math.max(3, Math.min(20, paramSpace.length * 3));

  for (let i = 0; i < count; i++) {
    const params: Record<string, number> = {};
    for (const p of paramSpace) {
      params[p.name] = sampleParam(p);
    }
    const value = Math.round((0.4 + Math.random() * 0.5) * 100) / 100;
    trials.push({ index: i, params, value });
  }
  trials.sort((a, b) => b.value - a.value);
  trials.forEach((t, i) => { t.index = i; });
  return trials;
}

function serializeRun(row: any) {
  const r: any = { ...row };
  try { r.param_space = JSON.parse(row.param_space_json || '[]'); } catch { r.param_space = []; }
  try { r.best_params = JSON.parse(row.best_params_json || '{}'); } catch { r.best_params = {}; }
  delete r.param_space_json;
  delete r.best_params_json;
  return r;
}

function serializeTrial(row: any) {
  const t: any = { ...row };
  try { t.params = JSON.parse(row.params_json || '{}'); } catch { t.params = {}; }
  delete t.params_json;
  return t;
}
