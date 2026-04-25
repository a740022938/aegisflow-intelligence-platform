import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

const GPU_COST_PER_HOUR: Record<string, number> = {
  'A100': 3.50, 'A100-80G': 4.00, 'V100': 2.00, 'T4': 1.00,
  'RTX3090': 0.80, 'RTX4090': 1.20, 'RTX3060': 0.40, 'CPU': 0.10,
};

export function registerCostTrackerRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS cost_entries (
      id TEXT PRIMARY KEY, category TEXT NOT NULL, source TEXT NOT NULL,
      resource_type TEXT NOT NULL, resource_name TEXT,
      gpu_type TEXT DEFAULT 'CPU', duration_hours REAL DEFAULT 0,
      cost REAL DEFAULT 0, metadata_json TEXT,
      project_id TEXT, user_id TEXT, recorded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cost_budgets (
      id TEXT PRIMARY KEY, project_id TEXT, category TEXT,
      monthly_budget REAL, spent_this_month REAL DEFAULT 0,
      alert_threshold REAL DEFAULT 0.8, created_at TEXT NOT NULL
    );
  `);

  app.post('/api/cost/record', async (request: any, reply: any) => {
    const body = request.body || {};
    const gpuType = String(body.gpu_type || 'CPU');
    const durationHours = Number(body.duration_hours || 0);
    const hourlyRate = GPU_COST_PER_HOUR[gpuType] || GPU_COST_PER_HOUR['CPU'] || 0.10;
    const cost = Number(body.cost) || (durationHours * hourlyRate);

    db.prepare(`INSERT INTO cost_entries (id, category, source, resource_type, resource_name, gpu_type, duration_hours, cost, metadata_json, project_id, user_id, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(randomUUID(), String(body.category || 'training'), String(body.source || 'manual'), String(body.resource_type || 'gpu'), String(body.resource_name || ''), gpuType, durationHours, Math.round(cost * 100) / 100, JSON.stringify(body.metadata || {}), String(body.project_id || ''), String(body.user_id || ''), nowIso());
    return { ok: true, cost, gpu_type: gpuType, duration_hours: durationHours, hourly_rate: hourlyRate };
  });

  app.get('/api/cost/summary', async (request: any, reply: any) => {
    const period = String(request.query?.period || 'all');
    const projectId = String(request.query?.project_id || '');
    let where = '';
    if (period === 'today') where = "WHERE recorded_at >= datetime('now', '-1 day')";
    else if (period === 'week') where = "WHERE recorded_at >= datetime('now', '-7 days')";
    else if (period === 'month') where = "WHERE recorded_at >= datetime('now', '-30 days')";
    if (projectId) where += where ? ` AND project_id = '${projectId}'` : ` WHERE project_id = '${projectId}'`;

    const total = (db.prepare(`SELECT SUM(cost) as t FROM cost_entries ${where}`).get() as any)?.t || 0;
    const byCategory = db.prepare(`SELECT category, SUM(cost) as total, COUNT(*) as count FROM cost_entries ${where} GROUP BY category ORDER BY total DESC`).all();
    const byGpu = db.prepare(`SELECT gpu_type, SUM(duration_hours) as hours, SUM(cost) as total FROM cost_entries ${where} GROUP BY gpu_type ORDER BY total DESC`).all();
    const daily = db.prepare(`SELECT date(recorded_at) as day, SUM(cost) as total FROM cost_entries ${where ? where.replace('WHERE', 'WHERE') : ''} GROUP BY day ORDER BY day DESC LIMIT 30`).all();

    return { ok: true, total_cost: Math.round(total * 100) / 100, period, by_category: byCategory, by_gpu: byGpu, daily };
  });

  app.post('/api/cost/budgets', async (request: any, reply: any) => {
    const body = request.body || {};
    db.prepare(`INSERT INTO cost_budgets (id, project_id, category, monthly_budget, alert_threshold, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(randomUUID(), String(body.project_id || ''), String(body.category || 'training'), Number(body.monthly_budget || 100), Number(body.alert_threshold || 0.8), nowIso());
    return { ok: true };
  });

  app.get('/api/cost/budgets', async (request: any, reply: any) => {
    const rows = db.prepare('SELECT * FROM cost_budgets ORDER BY created_at DESC').all();
    return { ok: true, budgets: rows, count: rows.length };
  });

  app.get('/api/cost/gpu-rates', async (_request, reply) => {
    return { ok: true, rates: GPU_COST_PER_HOUR };
  });
}
