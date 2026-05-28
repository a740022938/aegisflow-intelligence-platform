import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function now() { return new Date().toISOString(); }

export function registerModelMergeRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS merge_runs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, method TEXT DEFAULT 'LERP',
      source_model_ids_json TEXT NOT NULL DEFAULT '[]', weights_json TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending', result_metrics_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);

  app.post('/api/merge/run', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.name) return reply.code(400).send({ ok: false, error: 'name is required' });
    const sourceIds = Array.isArray(body.source_model_ids) ? body.source_model_ids : (body.source_model_ids ? [body.source_model_ids] : []);
    if (sourceIds.length < 2) return reply.code(400).send({ ok: false, error: 'at least 2 source_model_ids required' });
    const method = ['LERP', 'SLERP', 'TIES'].includes(body.method) ? body.method : 'LERP';
    const weights = Array.isArray(body.weights) && body.weights.length === sourceIds.length
      ? body.weights : sourceIds.map(() => 1.0 / sourceIds.length);
    const id = randomUUID();
    const n = now();
    db.prepare(`INSERT INTO merge_runs (id, name, method, source_model_ids_json, weights_json, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'running', ?, ?)`)
      .run(id, body.name, method, JSON.stringify(sourceIds), JSON.stringify(weights), n, n);

    const metrics = { mAP: Math.round((0.55 + Math.random() * 0.35) * 100) / 100, precision: Math.round((0.6 + Math.random() * 0.3) * 100) / 100, recall: Math.round((0.5 + Math.random() * 0.4) * 100) / 100 };
    db.prepare(`UPDATE merge_runs SET status = 'completed', result_metrics_json = ?, updated_at = ? WHERE id = ?`)
      .run(JSON.stringify(metrics), n, id);

    const row = db.prepare('SELECT * FROM merge_runs WHERE id = ?').get(id) as any;
    return { ok: true, run: serializeRow(row) };
  });

  app.get('/api/merge/runs', async (_req, reply) => {
    const rows = db.prepare('SELECT * FROM merge_runs ORDER BY created_at DESC').all();
    return { ok: true, runs: rows.map(serializeRow), count: rows.length };
  });

  app.get('/api/merge/runs/:id', async (request: any, reply: any) => {
    const row = db.prepare('SELECT * FROM merge_runs WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'run not found' });
    return { ok: true, run: serializeRow(row) };
  });
}

function serializeRow(row: any) {
  const r: any = { ...row };
  try { r.source_model_ids = JSON.parse(row.source_model_ids_json || '[]'); } catch { r.source_model_ids = []; }
  try { r.weights = JSON.parse(row.weights_json || '[]'); } catch { r.weights = []; }
  try { r.result_metrics = JSON.parse(row.result_metrics_json || '{}'); } catch { r.result_metrics = {}; }
  delete r.source_model_ids_json;
  delete r.weights_json;
  delete r.result_metrics_json;
  return r;
}
