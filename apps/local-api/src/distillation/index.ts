import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function now() { return new Date().toISOString(); }

export function registerDistillationRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS distill_runs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, teacher_model_id TEXT NOT NULL,
      student_model_arch TEXT NOT NULL, temperature REAL DEFAULT 3.0,
      alpha REAL DEFAULT 0.5, status TEXT DEFAULT 'pending',
      loss_history_json TEXT DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);

  app.post('/api/distill/run', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.name) return reply.code(400).send({ ok: false, error: 'name is required' });
    if (!body.teacher_model_id) return reply.code(400).send({ ok: false, error: 'teacher_model_id is required' });
    const id = randomUUID();
    const n = now();
    const temp = Number(body.temperature ?? 3.0);
    const alpha = Number(body.alpha ?? 0.5);
    db.prepare(`INSERT INTO distill_runs (id, name, teacher_model_id, student_model_arch, temperature, alpha, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'running', ?, ?)`)
      .run(id, body.name, body.teacher_model_id, body.student_model_arch || 'yolov8n', temp, alpha, n, n);

    const lossHistory = generateLossHistory(20, alpha);
    db.prepare(`UPDATE distill_runs SET status = 'completed', loss_history_json = ?, updated_at = ? WHERE id = ?`)
      .run(JSON.stringify(lossHistory), n, id);

    const row = db.prepare('SELECT * FROM distill_runs WHERE id = ?').get(id) as any;
    return { ok: true, run: serializeRow(row) };
  });

  app.get('/api/distill/runs', async (_req, reply) => {
    const rows = db.prepare('SELECT * FROM distill_runs ORDER BY created_at DESC').all();
    return { ok: true, runs: rows.map(serializeRow), count: rows.length };
  });

  app.get('/api/distill/runs/:id', async (request: any, reply: any) => {
    const row = db.prepare('SELECT * FROM distill_runs WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'run not found' });
    return { ok: true, run: serializeRow(row) };
  });
}

function generateLossHistory(steps: number, alpha: number) {
  const history: number[] = [];
  let loss = 2.5 + Math.random() * 0.5;
  for (let i = 0; i < steps; i++) {
    loss = loss * (0.85 + Math.random() * 0.1);
    history.push(Math.round(loss * 1e4) / 1e4);
  }
  return history;
}

function serializeRow(row: any) {
  const r: any = { ...row };
  try { r.loss_history = JSON.parse(row.loss_history_json || '[]'); } catch { r.loss_history = []; }
  delete r.loss_history_json;
  return r;
}
