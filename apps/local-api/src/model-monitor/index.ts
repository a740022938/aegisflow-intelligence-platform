import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

export function registerModelMonitorRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS monitor_deployments (
      id TEXT PRIMARY KEY, model_id TEXT NOT NULL, model_name TEXT,
      status TEXT DEFAULT 'active', version TEXT, endpoint TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS monitor_metrics (
      id TEXT PRIMARY KEY, deployment_id TEXT NOT NULL, metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL, metric_value REAL NOT NULL,
      threshold REAL, drift_detected INTEGER DEFAULT 0,
      sample_count INTEGER DEFAULT 0, recorded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS monitor_alerts (
      id TEXT PRIMARY KEY, deployment_id TEXT NOT NULL, alert_type TEXT NOT NULL,
      severity TEXT DEFAULT 'warning', message TEXT, metric_name TEXT,
      metric_value REAL, threshold REAL, acknowledged INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS monitor_retrain_log (
      id TEXT PRIMARY KEY, deployment_id TEXT NOT NULL, reason TEXT,
      trigger_type TEXT, new_model_id TEXT, new_job_id TEXT,
      status TEXT DEFAULT 'pending', created_at TEXT NOT NULL
    );
  `);

  app.post('/api/monitor/deployments', async (request: any, reply: any) => {
    const body = request.body || {};
    const id = `mon_${randomUUID().slice(0, 8)}`;
    db.prepare(`INSERT INTO monitor_deployments (id, model_id, model_name, endpoint, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, String(body.model_id || ''), String(body.model_name || ''), String(body.endpoint || ''), nowIso(), nowIso());
    return { ok: true, deployment: { id, model_id: body.model_id } };
  });

  app.get('/api/monitor/deployments', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM monitor_deployments ORDER BY created_at DESC').all();
    return { ok: true, deployments: rows, count: rows.length };
  });

  app.post('/api/monitor/metrics', async (request: any, reply: any) => {
    const body = request.body || {};
    const depId = String(body.deployment_id || '');
    const metrics = Array.isArray(body.metrics) ? body.metrics : [body];
    const drifts: string[] = [];

    for (const m of metrics) {
      const id = randomUUID();
      const metricValue = Number(m.value || 0);
      const threshold = Number(m.threshold || 0);
      const driftDetected = threshold > 0 && metricValue < threshold ? 1 : 0;
      db.prepare(`INSERT INTO monitor_metrics (id, deployment_id, metric_type, metric_name, metric_value, threshold, drift_detected, sample_count, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, depId, String(m.type || 'accuracy'), String(m.name || 'f1_score'), metricValue, threshold, driftDetected, Number(m.samples || 0), nowIso());
      if (driftDetected) {
        const alertId = randomUUID();
        db.prepare(`INSERT INTO monitor_alerts (id, deployment_id, alert_type, severity, message, metric_name, metric_value, threshold, created_at) VALUES (?, ?, 'drift', ?, ?, ?, ?, ?, ?)`)
          .run(alertId, depId, 'warning', `Drift detected: ${m.name} = ${metricValue} (threshold: ${threshold})`, m.name, metricValue, threshold, nowIso());
        drifts.push(m.name);
      }
    }
    return { ok: true, drifts_detected: drifts, metrics_logged: metrics.length };
  });

  app.get('/api/monitor/deployments/:id/metrics', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 100), 500);
    const rows = db.prepare('SELECT * FROM monitor_metrics WHERE deployment_id = ? ORDER BY recorded_at DESC LIMIT ?').all(request.params.id, limit);
    return { ok: true, deployment_id: request.params.id, metrics: rows, count: rows.length };
  });

  app.get('/api/monitor/alerts', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 200);
    const rows = db.prepare('SELECT * FROM monitor_alerts ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, alerts: rows, count: rows.length };
  });

  app.post('/api/monitor/alerts/:id/acknowledge', async (request: any, reply: any) => {
    db.prepare('UPDATE monitor_alerts SET acknowledged = 1 WHERE id = ?').run(request.params.id);
    return { ok: true };
  });

  app.post('/api/monitor/retrain', async (request: any, reply: any) => {
    const body = request.body || {};
    const depId = String(body.deployment_id || '');
    const reason = String(body.reason || 'manual_trigger');
    const logId = `retrain_${randomUUID().slice(0, 8)}`;
    const now = nowIso();
    db.prepare(`INSERT INTO monitor_retrain_log (id, deployment_id, reason, trigger_type, new_job_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(logId, depId, reason, body.trigger_type || 'manual', body.job_id || `train_${randomUUID().slice(0, 8)}`, 'triggered', now);
    return { ok: true, retrain_id: logId, message: 'Retrain triggered', reason };
  });
}
