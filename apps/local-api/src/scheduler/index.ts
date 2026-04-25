import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

type ScheduleType = 'cron' | 'interval' | 'event' | 'once_at';
type JobAction = 'workflow' | 'script' | 'command' | 'train' | 'infer' | 'alert';

function nowIso() { return new Date().toISOString(); }
function parseCron(expr: string): number | null {
  if (!expr || expr === '* * * * *') return 60_000;
  const parts = expr.split(/\s+/);
  if (parts.length !== 5) return null;
  if (parts[1] !== '*') { const m = parseInt(parts[1]); if (!isNaN(m)) return m * 60_000; }
  if (parts[0] !== '*') { const h = parseInt(parts[0]); if (!isNaN(h)) return h * 3600_000; }
  return 60_000;
}

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

export function registerSchedulerRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduler_jobs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      schedule_type TEXT NOT NULL, cron_expr TEXT, interval_sec INTEGER,
      action_type TEXT NOT NULL, action_params TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1, last_run_at TEXT, next_run_at TEXT,
      run_count INTEGER DEFAULT 0, success_count INTEGER DEFAULT 0, fail_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scheduler_logs (
      id TEXT PRIMARY KEY, job_id TEXT NOT NULL, status TEXT NOT NULL,
      message TEXT, started_at TEXT, finished_at TEXT
    );
  `);

  // CRUD
  app.post('/api/scheduler/jobs', async (request: any, reply: any) => {
    const body = request.body || {};
    const id = `sched_${randomUUID().slice(0, 8)}`;
    const now = nowIso();
    db.prepare(`INSERT INTO scheduler_jobs (id, name, description, schedule_type, cron_expr, interval_sec, action_type, action_params, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, String(body.name || 'unnamed'), String(body.description || ''), String(body.schedule_type || 'interval'), String(body.cron_expr || ''), Number(body.interval_sec || 3600), String(body.action_type || 'command'), JSON.stringify(body.action_params || {}), now, now);
    return { ok: true, job: { id, name: body.name } };
  });

  app.get('/api/scheduler/jobs', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM scheduler_jobs ORDER BY enabled DESC, next_run_at ASC').all();
    return { ok: true, jobs: rows, count: rows.length };
  });

  app.delete('/api/scheduler/jobs/:id', async (request: any, reply: any) => {
    db.prepare('DELETE FROM scheduler_jobs WHERE id = ?').run(request.params.id);
    return { ok: true };
  });

  app.post('/api/scheduler/jobs/:id/toggle', async (request: any, reply: any) => {
    const row = db.prepare('SELECT enabled FROM scheduler_jobs WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'not found' });
    const newState = row.enabled ? 0 : 1;
    db.prepare('UPDATE scheduler_jobs SET enabled = ?, updated_at = ? WHERE id = ?').run(newState, nowIso(), request.params.id);
    return { ok: true, enabled: !!newState };
  });

  app.get('/api/scheduler/logs', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 200);
    const jobId = request.query?.job_id || '';
    const rows = jobId
      ? db.prepare('SELECT * FROM scheduler_logs WHERE job_id = ? ORDER BY started_at DESC LIMIT ?').all(jobId, limit)
      : db.prepare('SELECT * FROM scheduler_logs ORDER BY started_at DESC LIMIT ?').all(limit);
    return { ok: true, logs: rows, count: rows.length };
  });

  // Start scheduler loop
  startScheduler(db);
}

function startScheduler(db: any) {
  if (schedulerTimer) return;

  const tick = () => {
    try {
      const jobs = db.prepare("SELECT * FROM scheduler_jobs WHERE enabled = 1").all() as any[];
      const now = Date.now();

      for (const job of jobs) {
        const lastRun = job.last_run_at ? new Date(job.last_run_at).getTime() : 0;
        let due = false;

        if (job.schedule_type === 'interval') {
          due = (now - lastRun) >= (job.interval_sec || 3600) * 1000;
        } else if (job.schedule_type === 'cron') {
          const interval = parseCron(job.cron_expr || '');
          due = !!interval && (now - lastRun) >= interval;
        }

        if (due) {
          const logId = randomUUID();
          const logTime = nowIso();
          db.prepare('INSERT INTO scheduler_logs (id, job_id, status, message, started_at) VALUES (?, ?, ?, ?, ?)')
            .run(logId, job.id, 'running', `Auto-triggered: ${job.action_type}`, logTime);
          db.prepare('UPDATE scheduler_jobs SET last_run_at = ?, run_count = run_count + 1, updated_at = ? WHERE id = ?')
            .run(logTime, logTime, job.id);
          executeScheduledAction(db, job, logId);
        }
      }
    } catch { }
  };

  schedulerTimer = setInterval(tick, 30_000);
  schedulerTimer.unref();
}

function executeScheduledAction(db: any, job: any, logId: string) {
  try {
    const params = JSON.parse(job.action_params || '{}');
    const now = nowIso();

    switch (job.action_type) {
      case 'workflow': {
        const jId = `job_sched_${randomUUID().slice(0, 8)}`;
        db.prepare('INSERT INTO workflow_jobs (id, name, status, template_id, created_at, updated_at, input_params_json) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(jId, `[Scheduler] ${job.name}`, 'running', params.template || 'dataset-flywheel', now, now, JSON.stringify(params));
        break;
      }
      case 'train': {
        const tId = `train2_${randomUUID().slice(0, 8)}`;
        db.prepare('INSERT INTO training_v2_jobs (id, name, status, architecture, dataset_id, hyperparams, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(tId, `[Scheduler] ${job.name}`, 'running', params.architecture || 'yolov8n', params.dataset_id || '', JSON.stringify(params.hyperparams || {}), now, now);
        break;
      }
      case 'command': {
        // Log command execution
        break;
      }
    }
    db.prepare("UPDATE scheduler_logs SET status = 'success', finished_at = ? WHERE id = ?").run(nowIso(), logId);
    db.prepare('UPDATE scheduler_jobs SET success_count = success_count + 1, updated_at = ? WHERE id = ?').run(nowIso(), job.id);
  } catch (err: any) {
    db.prepare("UPDATE scheduler_logs SET status = 'failed', message = ?, finished_at = ? WHERE id = ?").run(err.message, nowIso(), logId);
    db.prepare('UPDATE scheduler_jobs SET fail_count = fail_count + 1, updated_at = ? WHERE id = ?').run(nowIso(), job.id);
  }
}

export function stopScheduler() {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
}
