import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

export function registerAlertingCenterRoutes(app: FastifyInstance) {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS aip_alert_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      metric TEXT NOT NULL DEFAULT 'cpu',
      operator TEXT NOT NULL DEFAULT 'gt',
      threshold REAL NOT NULL DEFAULT 80,
      severity TEXT NOT NULL DEFAULT 'warn',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS aip_alert_rule_history (
      id TEXT PRIMARY KEY,
      rule_id TEXT,
      rule_name TEXT,
      metric TEXT,
      triggered_value REAL,
      threshold REAL,
      severity TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // ── Alert Rules CRUD ──
  app.get('/api/alerts', async (_request, reply) => {
    const rules = db.prepare('SELECT * FROM aip_alert_rules ORDER BY created_at DESC').all();
    return { ok: true, alerts: rules, count: rules.length };
  });

  app.post('/api/alerts', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.name || !body.metric) {
      return reply.code(400).send({ ok: false, error: 'name and metric are required' });
    }
    const id = randomUUID();
    const now = nowIso();
    db.prepare(`
      INSERT INTO aip_alert_rules (id, name, metric, operator, threshold, severity, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      String(body.name),
      String(body.metric),
      String(body.operator || 'gt'),
      Number(body.threshold ?? 80),
      String(body.severity || 'warn'),
      body.enabled !== false ? 1 : 0,
      now,
      now,
    );
    const rule = db.prepare('SELECT * FROM aip_alert_rules WHERE id = ?').get(id);
    return { ok: true, alert: rule };
  });

  app.put('/api/alerts/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const body = request.body || {};
    const existing = db.prepare('SELECT * FROM aip_alert_rules WHERE id = ?').get(id) as any;
    if (!existing) return reply.code(404).send({ ok: false, error: 'not found' });
    const now = nowIso();
    db.prepare(`
      UPDATE aip_alert_rules
      SET name = ?, metric = ?, operator = ?, threshold = ?, severity = ?, enabled = ?, updated_at = ?
      WHERE id = ?
    `).run(
      String(body.name ?? existing.name),
      String(body.metric ?? existing.metric),
      String(body.operator ?? existing.operator),
      Number(body.threshold ?? existing.threshold),
      String(body.severity ?? existing.severity),
      body.enabled !== undefined ? (body.enabled ? 1 : 0) : existing.enabled,
      now,
      id,
    );
    const rule = db.prepare('SELECT * FROM aip_alert_rules WHERE id = ?').get(id);
    return { ok: true, alert: rule };
  });

  app.delete('/api/alerts/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const existing = db.prepare('SELECT * FROM aip_alert_rules WHERE id = ?').get(id);
    if (!existing) return reply.code(404).send({ ok: false, error: 'not found' });
    db.prepare('DELETE FROM aip_alert_rules WHERE id = ?').run(id);
    return { ok: true };
  });

  // ── Toggle enable / disable ──
  app.patch('/api/alerts/:id/toggle', async (request: any, reply: any) => {
    const { id } = request.params;
    const row = db.prepare('SELECT * FROM aip_alert_rules WHERE id = ?').get(id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'not found' });
    const newState = row.enabled ? 0 : 1;
    db.prepare('UPDATE aip_alert_rules SET enabled = ?, updated_at = ? WHERE id = ?').run(newState, nowIso(), id);
    return { ok: true, enabled: !!newState };
  });

  // ── Test alert rule ──
  app.post('/api/alerts/:id/test', async (request: any, reply: any) => {
    const { id } = request.params;
    const rule = db.prepare('SELECT * FROM aip_alert_rules WHERE id = ?').get(id) as any;
    if (!rule) return reply.code(404).send({ ok: false, error: 'rule not found' });
    const now = nowIso();
    db.prepare(`
      INSERT INTO aip_alert_rule_history (id, rule_id, rule_name, metric, triggered_value, threshold, severity, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), rule.id, rule.name, rule.metric, rule.threshold, rule.threshold, rule.severity, now);
    return { ok: true, message: `Test alert triggered for rule "${rule.name}"` };
  });

  // ── Alert history ──
  app.get('/api/alerts/history', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 200);
    const ruleId = request.query?.rule_id || '';
    const rows = ruleId
      ? db.prepare('SELECT * FROM aip_alert_rule_history WHERE rule_id = ? ORDER BY created_at DESC LIMIT ?').all(ruleId, limit)
      : db.prepare('SELECT * FROM aip_alert_rule_history ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, history: rows, count: rows.length };
  });
}
