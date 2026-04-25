import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

interface AlertChannel {
  type: 'webhook' | 'feishu' | 'dingtalk' | 'email';
  url: string;
  secret?: string;
  enabled: boolean;
}

interface AlertEvent {
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  title: string;
  message: string;
  details?: Record<string, any>;
}

function nowIso() { return new Date().toISOString(); }

const CHANNELS_TABLE = `
  CREATE TABLE IF NOT EXISTS aip_alert_channels (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS aip_alert_history (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details_json TEXT,
    delivered_to TEXT,
    created_at TEXT NOT NULL
  );
`;

function getWebhookBody(event: AlertEvent, channelType: string): any {
  switch (channelType) {
    case 'feishu':
      return {
        msg_type: 'interactive',
        card: { header: { title: { tag: 'plain_text', content: event.title } },
          elements: [{ tag: 'markdown', content: `**级别**: ${event.level}\n**来源**: ${event.source}\n${event.message}` }] },
      };
    case 'dingtalk':
      return { msgtype: 'markdown', markdown: { title: event.title, text: `### ${event.title}\n**级别**: ${event.level}\n**来源**: ${event.source}\n\n${event.message}` } };
    default:
      return { event, timestamp: nowIso() };
  }
}

let alertInterval: ReturnType<typeof setInterval> | null = null;

export function registerAlertingRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(CHANNELS_TABLE);

  // Channel management
  app.get('/api/alerting/channels', async (_request, reply) => {
    const channels = db.prepare('SELECT * FROM aip_alert_channels ORDER BY created_at DESC').all();
    return { ok: true, channels };
  });

  app.post('/api/alerting/channels', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.type || !body.url || !body.name) return reply.code(400).send({ ok: false, error: 'type, url, name required' });
    const id = randomUUID();
    const enabled = body.enabled !== false ? 1 : 0;
    db.prepare('INSERT INTO aip_alert_channels (id, type, name, url, secret, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, body.type, body.name, body.url, body.secret || '', enabled, nowIso());
    return { ok: true, channel: { id, type: body.type, name: body.name } };
  });

  app.delete('/api/alerting/channels/:id', async (request: any, reply: any) => {
    db.prepare('DELETE FROM aip_alert_channels WHERE id = ?').run(request.params.id);
    return { ok: true };
  });

  // Manual send
  app.post('/api/alerting/send', async (request: any, reply: any) => {
    const event: AlertEvent = {
      level: request.body?.level || 'info',
      source: request.body?.source || 'manual',
      title: request.body?.title || 'Alert',
      message: request.body?.message || '',
      details: request.body?.details,
    };
    const results = await dispatchAlert(db, event);
    return { ok: true, results };
  });

  // Test all channels
  app.post('/api/alerting/test', async (_request, reply) => {
    const event: AlertEvent = { level: 'info', source: 'aip-test', title: 'AIP 告警测试', message: '这是一条测试告警消息' };
    const results = await dispatchAlert(db, event);
    return { ok: true, message: `发送到 ${results.filter(r => r.ok).length}/${results.length} 个渠道`, results };
  });

  // History
  app.get('/api/alerting/history', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 200);
    const level = request.query?.level || '';
    const rows = level
      ? db.prepare('SELECT * FROM aip_alert_history WHERE level = ? ORDER BY created_at DESC LIMIT ?').all(level, limit)
      : db.prepare('SELECT * FROM aip_alert_history ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, alerts: rows, count: rows.length };
  });
}

async function dispatchAlert(db: any, event: AlertEvent): Promise<Array<{ channel: string; ok: boolean; error?: string }>> {
  const channels = db.prepare('SELECT * FROM aip_alert_channels WHERE enabled = 1').all() as AlertChannel[];
  const results: Array<{ channel: string; ok: boolean; error?: string }> = [];

  for (const ch of channels) {
    try {
      const body = getWebhookBody(event, ch.type);
      const res = await fetch(ch.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(ch.secret ? { 'X-Webhook-Secret': ch.secret } : {}) },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      results.push({ channel: ch.type, ok: res.ok });
    } catch (err: any) {
      results.push({ channel: ch.type, ok: false, error: err.message });
    }
  }

  const history = results.some(r => !r.ok)
    ? { ok: false, results }
    : { ok: true, results };

  db.prepare(`
    INSERT INTO aip_alert_history (id, level, source, title, message, details_json, delivered_to, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), event.level, event.source, event.title, event.message, JSON.stringify(event.details || {}), JSON.stringify(results), nowIso());

  return results;
}

export function startSystemHealthMonitor(app: FastifyInstance) {
  if (alertInterval) return;
  const db = getDatabase();
  const channels = db.prepare('SELECT COUNT(*) as c FROM aip_alert_channels WHERE enabled = 1').get() as any;

  alertInterval = setInterval(async () => {
    try {
      const wpStats = (await import('../worker-pool/index.js')).getWorkerPool().getStats();
      const qStats = (await import('../queue/index.js')).getTaskQueue().getStats();

      if (wpStats.totalErrors > 100) {
        await dispatchAlert(db, { level: 'warning', source: 'worker-pool', title: 'Worker 错误过多', message: `Worker 池累计错误数: ${wpStats.totalErrors}`, details: wpStats });
      }
      if (qStats.failed > 10) {
        await dispatchAlert(db, { level: 'warning', source: 'task-queue', title: '队列失败任务过多', message: `队列失败数: ${qStats.failed}`, details: qStats });
      }
    } catch { }
  }, 60000);
  alertInterval.unref();
}

export function stopSystemHealthMonitor() {
  if (alertInterval) { clearInterval(alertInterval); alertInterval = null; }
}
