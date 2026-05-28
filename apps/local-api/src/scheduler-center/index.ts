import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

export function registerSchedulerCenterRoutes(app: FastifyInstance) {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS aip_schedules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'interval',
      config_json TEXT NOT NULL DEFAULT '{}',
      task_json TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1,
      last_run_at TEXT,
      next_run_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS aip_schedule_run_logs (
      id TEXT PRIMARY KEY,
      schedule_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      message TEXT,
      started_at TEXT NOT NULL,
      finished_at TEXT
    );
  `);

  // ── Schedule CRUD ──
  app.get('/api/schedules', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM aip_schedules ORDER BY enabled DESC, created_at DESC').all();
    return { ok: true, schedules: rows, count: rows.length };
  });

  app.post('/api/schedules', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.name) return reply.code(400).send({ ok: false, error: 'name is required' });
    const id = `sched_${randomUUID().slice(0, 8)}`;
    const now = nowIso();
    const config = typeof body.config === 'object' ? body.config : (body.config || {});
    const task = typeof body.task === 'object' ? body.task : (body.task || {});
    const nextRun = computeNextRun(body.type || 'interval', config, now);
    db.prepare(`
      INSERT INTO aip_schedules (id, name, type, config_json, task_json, enabled, last_run_at, next_run_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      String(body.name),
      String(body.type || 'interval'),
      JSON.stringify(config),
      JSON.stringify(task),
      body.enabled !== false ? 1 : 0,
      null,
      nextRun,
      now,
      now,
    );
    const schedule = db.prepare('SELECT * FROM aip_schedules WHERE id = ?').get(id);
    return { ok: true, schedule };
  });

  app.put('/api/schedules/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const body = request.body || {};
    const existing = db.prepare('SELECT * FROM aip_schedules WHERE id = ?').get(id) as any;
    if (!existing) return reply.code(404).send({ ok: false, error: 'not found' });
    const now = nowIso();
    const config = typeof body.config === 'object' ? body.config : (body.config || JSON.parse(String(existing.config_json || '{}')));
    const task = typeof body.task === 'object' ? body.task : (body.task || JSON.parse(String(existing.task_json || '{}')));
    const type = body.type || existing.type;
    const nextRun = computeNextRun(type, config, now);
    db.prepare(`
      UPDATE aip_schedules
      SET name = ?, type = ?, config_json = ?, task_json = ?, enabled = ?, next_run_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      String(body.name ?? existing.name),
      String(type),
      JSON.stringify(config),
      JSON.stringify(task),
      body.enabled !== undefined ? (body.enabled ? 1 : 0) : existing.enabled,
      nextRun,
      now,
      id,
    );
    const schedule = db.prepare('SELECT * FROM aip_schedules WHERE id = ?').get(id);
    return { ok: true, schedule };
  });

  app.delete('/api/schedules/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const existing = db.prepare('SELECT * FROM aip_schedules WHERE id = ?').get(id);
    if (!existing) return reply.code(404).send({ ok: false, error: 'not found' });
    db.prepare('DELETE FROM aip_schedule_run_logs WHERE schedule_id = ?').run(id);
    db.prepare('DELETE FROM aip_schedules WHERE id = ?').run(id);
    return { ok: true };
  });

  // ── Toggle ──
  app.patch('/api/schedules/:id/toggle', async (request: any, reply: any) => {
    const { id } = request.params;
    const row = db.prepare('SELECT * FROM aip_schedules WHERE id = ?').get(id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'not found' });
    const newState = row.enabled ? 0 : 1;
    db.prepare('UPDATE aip_schedules SET enabled = ?, updated_at = ? WHERE id = ?').run(newState, nowIso(), id);
    return { ok: true, enabled: !!newState };
  });

  // ── Manual trigger ──
  app.post('/api/schedules/:id/run', async (request: any, reply: any) => {
    const { id } = request.params;
    const row = db.prepare('SELECT * FROM aip_schedules WHERE id = ?').get(id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'not found' });
    const logId = randomUUID();
    const logTime = nowIso();
    db.prepare('INSERT INTO aip_schedule_run_logs (id, schedule_id, status, message, started_at) VALUES (?, ?, ?, ?, ?)')
      .run(logId, id, 'running', `Manual trigger: ${row.name}`, logTime);
    db.prepare('UPDATE aip_schedules SET last_run_at = ?, updated_at = ? WHERE id = ?')
      .run(logTime, logTime, id);
    try {
      taskExec(db, row, logId);
    } catch (err: any) {
      db.prepare("UPDATE aip_schedule_run_logs SET status = 'failed', message = ?, finished_at = ? WHERE id = ?")
        .run(err.message, nowIso(), logId);
    }
    return { ok: true, message: `Triggered schedule "${row.name}"` };
  });

  // ── Run logs per schedule ──
  app.get('/api/schedules/:id/logs', async (request: any, reply: any) => {
    const { id } = request.params;
    const limit = Math.min(Number(request.query?.limit || 50), 200);
    const logs = db.prepare('SELECT * FROM aip_schedule_run_logs WHERE schedule_id = ? ORDER BY started_at DESC LIMIT ?').all(id, limit);
    return { ok: true, logs, count: logs.length };
  });
}

function computeNextRun(type: string, config: any, fromIso?: string): string | null {
  const from = fromIso ? new Date(fromIso).getTime() : Date.now();
  if (type === 'cron') {
    const expr = config.cron_expr || config.cron || '';
    const intervalMs = parseCronToMs(expr);
    if (intervalMs) return new Date(from + intervalMs).toISOString();
    return null;
  }
  if (type === 'interval') {
    const hours = Number(config.hours ?? 0);
    const minutes = Number(config.minutes ?? 0);
    const ms = (hours * 3600 + minutes * 60) * 1000;
    const intervalMs = ms > 0 ? ms : 3600000;
    return new Date(from + intervalMs).toISOString();
  }
  return null;
}

function parseCronToMs(expr: string): number | null {
  if (!expr || expr === '* * * * *') return 60000;
  const parts = expr.split(/\s+/);
  if (parts.length !== 5) return null;
  if (parts[1] !== '*') { const m = parseInt(parts[1]); if (!isNaN(m)) return m * 60000; }
  if (parts[0] !== '*') { const h = parseInt(parts[0]); if (!isNaN(h)) return h * 3600000; }
  return 60000;
}

function taskExec(db: any, schedule: any, logId: string) {
  const task = (() => { try { return JSON.parse(schedule.task_json || '{}'); } catch { return {}; } })();
  const now = nowIso();
  if (task.action === 'workflow' && task.template_id) {
    const jId = `job_sched_${randomUUID().slice(0, 8)}`;
    db.prepare('INSERT INTO workflow_jobs (id, name, status, template_id, created_at, updated_at, input_params_json) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(jId, `[Schedule] ${schedule.name}`, 'running', task.template_id, now, now, JSON.stringify(task));
  }
  db.prepare("UPDATE aip_schedule_run_logs SET status = 'success', finished_at = ? WHERE id = ?").run(now, logId);
}
