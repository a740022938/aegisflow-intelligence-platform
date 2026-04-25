import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

let telegramConfig = {
  enabled: false,
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID || '',
};

async function sendTelegram(text: string): Promise<boolean> {
  if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramConfig.chatId, text, parse_mode: 'Markdown' }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch { return false; }
}

export function notifyTrainingComplete(name: string, metrics: any) {
  const msg = `🎯 *训练完成*\n名称: ${name}\n${metrics.mAP ? `mAP: ${metrics.mAP}\n` : ''}${metrics.accuracy ? `准确率: ${metrics.accuracy}\n` : ''}时间: ${nowIso()}`;
  sendTelegram(msg);
}

export function notifyAlert(title: string, detail: string) {
  const msg = `⚠️ *系统告警*\n${title}\n${detail}`;
  sendTelegram(msg);
}

export function notifyWorkflowComplete(jobId: string, status: string) {
  const msg = `📋 *工作流: ${status}*\nID: ${jobId}\n时间: ${nowIso()}`;
  sendTelegram(msg);
}

export function registerNotifyRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS notify_config (
      id TEXT PRIMARY KEY, channel TEXT NOT NULL, enabled INTEGER DEFAULT 1,
      config_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notify_log (
      id TEXT PRIMARY KEY, channel TEXT NOT NULL, message TEXT,
      status TEXT, created_at TEXT NOT NULL
    );
  `);

  app.get('/api/notify/config', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM notify_config').all();
    return { ok: true, config: rows, telegram: { enabled: telegramConfig.enabled, chatId: telegramConfig.chatId ? '***' : 'not set' } };
  });

  app.post('/api/notify/config', async (request: any, reply: any) => {
    const body = request.body || {};
    if (body.channel === 'telegram') {
      if (body.botToken) telegramConfig.botToken = body.botToken;
      if (body.chatId) telegramConfig.chatId = body.chatId;
      telegramConfig.enabled = body.enabled !== false && !!telegramConfig.botToken && !!telegramConfig.chatId;
      db.prepare("INSERT OR REPLACE INTO notify_config (id, channel, enabled, config_json, created_at) VALUES ('telegram_main', 'telegram', ?, ?, ?)")
        .run(telegramConfig.enabled ? 1 : 0, JSON.stringify({ chatId: telegramConfig.chatId, enabled: telegramConfig.enabled }), nowIso());
    }
    return { ok: true, telegram: { enabled: telegramConfig.enabled, chatId: telegramConfig.chatId ? '***' : 'not set' } };
  });

  app.post('/api/notify/test', async (_request, reply) => {
    const sent = await sendTelegram('✅ *AIP 通知测试*\n天枢智治平台 Notify 模块已就绪');
    const logId = randomUUID();
    db.prepare('INSERT INTO notify_log (id, channel, message, status, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(logId, 'telegram', 'Test message', sent ? 'sent' : 'failed', nowIso());
    return { ok: sent, message: sent ? 'Telegram 通知已发送' : '发送失败，请检查 botToken 和 chatId' };
  });

  app.get('/api/notify/log', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 20), 100);
    const rows = db.prepare('SELECT * FROM notify_log ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, logs: rows, count: rows.length };
  });
}
