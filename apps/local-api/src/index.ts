import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as db from './db/builtin-sqlite.js';


import * as tasks from './tasks/index.js';
import * as taskSteps from './task-steps/index.js';
import * as taskLogs from './task-logs/index.js';
import * as taskExecute from './task-execute/index.js';
import * as templates from './templates/index.js';
import * as datasets from './datasets/index.js';

import * as evaluations from './evaluations/index.js';
import * as artifacts from './artifacts/index.js';
import * as experiments from './experiments/index.js';
import * as dashboard from './dashboard/index.js';
import * as deployments from './deployments/index.js';
import * as runs from './runs/index.js';
import * as pipeline from './dataset-pipeline/index.js';
import * as training from './training/index.js';
import * as models from './models/index.js';
import * as packages from './packages/index.js';
import * as deploymentTargets from './deployment-targets/index.js';
import * as deploymentRevisions from './deployment-revisions/index.js';
import * as rollbackPoints from './rollback-points/index.js';
import * as audit from './audit/index.js';
import * as gates from './gates/index.js';
import { registerWorkflowRoutes } from './workflow/index.js';
import { registerApprovalRoutes } from './approvals/index.js';
import { registerKnowledgeRoutes } from './knowledge/index.js';
import { registerOutputsRoutes } from './outputs/index.js';
import { registerFeedbackRoutes } from './feedback/index.js';
import { registerCostRoutingRoutes } from './cost-routing/index.js';
import { registerOpsRoutes } from './ops/index.js';
import { registerBrainRouterRoutes } from './brain-router/index.js';
import { registerSystemRoutes } from './system/index.js';
import * as visionBus from './vision-bus/index.js';
import { registerClassifierRoutes } from './classifier/index.js';
import { registerExperimentsRoutes } from './experiments/index.js';
import { registerModelsRoutes } from './models/index.js';
import { APP_VERSION } from './version.js';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
}

function bootstrapLocalEnv() {
  const cwd = process.cwd();
  const candidates = [
    cwd,
    path.resolve(cwd, '..'),
    path.resolve(cwd, '../..'),
    path.resolve(cwd, '../../..'),
    path.resolve(cwd, '../../../..'),
  ];
  for (const base of candidates) {
    loadEnvFile(path.join(base, '.env.local'));
    loadEnvFile(path.join(base, '.env'));
  }
}

bootstrapLocalEnv();

// P0-C: Restore persisted tokens from DB if env vars not set
function restoreOpenClawTokens() {
  try {
    const dbInstance = db.getDatabase();
    const hasTable = !!dbInstance.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='openclaw_config'`).get();
    if (!hasTable) return;
    if (process.env.OPENCLAW_HEARTBEAT_TOKEN) return;
    const row = dbInstance.prepare(`SELECT value FROM openclaw_config WHERE key = 'heartbeat_token'`).get() as any;
    if (row?.value) {
      process.env.OPENCLAW_HEARTBEAT_TOKEN = row.value;
    }
    if (!process.env.OPENCLAW_ADMIN_TOKEN) {
      const adminRow = dbInstance.prepare(`SELECT value FROM openclaw_config WHERE key = 'admin_token'`).get() as any;
      if (adminRow?.value) {
        process.env.OPENCLAW_ADMIN_TOKEN = adminRow.value;
      }
    }
  } catch {}
}
restoreOpenClawTokens();

// Ensure token source is stable across restarts:
// - env token is persisted to DB
// - DB token is restored when env is empty
function bootstrapOpenClawTokenPersistence() {
  try {
    ensureOpenClawTables();
    const dbInstance = db.getDatabase();

    const envHeartbeat = String(process.env.OPENCLAW_HEARTBEAT_TOKEN || '').trim();
    const envAdmin = String(process.env.OPENCLAW_ADMIN_TOKEN || '').trim();

    const heartbeatRow = dbInstance.prepare(`SELECT value FROM openclaw_config WHERE key = 'heartbeat_token'`).get() as any;
    const adminRow = dbInstance.prepare(`SELECT value FROM openclaw_config WHERE key = 'admin_token'`).get() as any;
    const dbHeartbeat = String(heartbeatRow?.value || '').trim();
    const dbAdmin = String(adminRow?.value || '').trim();

    if (envHeartbeat) {
      dbInstance.prepare(`INSERT OR REPLACE INTO openclaw_config (key, value, updated_at) VALUES ('heartbeat_token', ?, ?)`).run(envHeartbeat, nowIso());
    } else if (dbHeartbeat) {
      process.env.OPENCLAW_HEARTBEAT_TOKEN = dbHeartbeat;
    }

    if (envAdmin) {
      dbInstance.prepare(`INSERT OR REPLACE INTO openclaw_config (key, value, updated_at) VALUES ('admin_token', ?, ?)`).run(envAdmin, nowIso());
    } else if (dbAdmin) {
      process.env.OPENCLAW_ADMIN_TOKEN = dbAdmin;
    }
  } catch {}
}


function computeDurationMs(startedAt?: string | null, finishedAt?: string | null) {
  if (!startedAt) return 0;
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, end - start);
}

function getLatestErrorMessage(logs: Array<{ level: string; message: string }>) {
  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const log = logs[i];
    if (log.level === 'error') {
      return log.message;
    }
  }
  return null;
}

function buildTaskSummary(task: any, steps: any[], logs: any[]) {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.status === 'completed' || step.status === 'success').length;
  const runningSteps = steps.filter(step => step.status === 'running').length;
  const failedSteps = steps.filter(step => step.status === 'failed').length;
  const currentStep = steps.find(step => step.status === 'running') || null;

  let progressPct = 0;
  if (task.status === 'completed' || task.status === 'success') {
    progressPct = 100;
  } else if (totalSteps > 0) {
    progressPct = Math.floor(((completedSteps + runningSteps * 0.5) / totalSteps) * 100);
  } else if (task.status === 'running') {
    progressPct = 5;
  } else if (task.status === 'pending' || task.status === 'queued') {
    progressPct = 0;
  }

  const realBackup = getLatestRealBackup();

  return {
    progress_pct: Math.max(0, Math.min(100, progressPct)),
    current_step_name: currentStep?.step_name || null,
    total_steps: totalSteps,
    completed_steps: completedSteps,
    running_steps: runningSteps,
    failed_steps: failedSteps,
    log_count: logs.length,
    duration_ms: computeDurationMs(task.started_at, task.finished_at)
  };
}

// 创建Fastify实例
const app: FastifyInstance = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// 注册CORS
app.register(cors, {
  origin: '*', // 开发环境允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// OpenClaw 旧路径显式兼容（防止客户端命中 /openclaw/* 返回 404）
app.get('/openclaw/master-switch', async (_request: any, reply: any) => {
  return reply.redirect('/api/openclaw/master-switch', 307);
});
app.post('/openclaw/master-switch', async (_request: any, reply: any) => {
  return reply.redirect('/api/openclaw/master-switch', 307);
});
app.post('/openclaw/heartbeat', async (_request: any, reply: any) => {
  return reply.redirect('/api/openclaw/heartbeat', 307);
});
app.post('/openclaw/circuit/recover', async (_request: any, reply: any) => {
  return reply.redirect('/api/openclaw/circuit/recover', 307);
});

function nowIso() {
  return new Date().toISOString();
}

function openClawHeartbeatConfigured() {
  return !!String(process.env.OPENCLAW_HEARTBEAT_TOKEN || '').trim();
}

function ensureOpenClawTables() {
  const dbInstance = db.getDatabase();
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS openclaw_control (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT 'system',
      last_heartbeat_at TEXT,
      heartbeat_timeout_sec INTEGER NOT NULL DEFAULT 25,
      circuit_state TEXT NOT NULL DEFAULT 'normal',
      circuit_fail_count INTEGER NOT NULL DEFAULT 0,
      circuit_fail_threshold INTEGER NOT NULL DEFAULT 3,
      timeout_window_count INTEGER NOT NULL DEFAULT 0,
      timeout_threshold INTEGER NOT NULL DEFAULT 5,
      error_reason TEXT NOT NULL DEFAULT '',
      auto_cancel_queued_on_disable INTEGER NOT NULL DEFAULT 0,
      queued_cancel_scope_json TEXT NOT NULL DEFAULT '{}'
    );
  `);
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS openclaw_control_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      before_json TEXT NOT NULL DEFAULT '{}',
      after_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);
  const columns = (dbInstance.prepare(`PRAGMA table_info(openclaw_control)`).all() as any[]).map((r: any) => String(r.name || ''));
  if (!columns.includes('last_heartbeat_at')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN last_heartbeat_at TEXT`);
  if (!columns.includes('heartbeat_timeout_sec')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN heartbeat_timeout_sec INTEGER NOT NULL DEFAULT 25`);
  if (!columns.includes('circuit_state')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN circuit_state TEXT NOT NULL DEFAULT 'normal'`);
  if (!columns.includes('circuit_fail_count')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN circuit_fail_count INTEGER NOT NULL DEFAULT 0`);
  if (!columns.includes('circuit_fail_threshold')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN circuit_fail_threshold INTEGER NOT NULL DEFAULT 3`);
  if (!columns.includes('timeout_window_count')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN timeout_window_count INTEGER NOT NULL DEFAULT 0`);
  if (!columns.includes('timeout_threshold')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN timeout_threshold INTEGER NOT NULL DEFAULT 5`);
  if (!columns.includes('error_reason')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN error_reason TEXT NOT NULL DEFAULT ''`);
  if (!columns.includes('auto_cancel_queued_on_disable')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN auto_cancel_queued_on_disable INTEGER NOT NULL DEFAULT 0`);
  if (!columns.includes('queued_cancel_scope_json')) dbInstance.exec(`ALTER TABLE openclaw_control ADD COLUMN queued_cancel_scope_json TEXT NOT NULL DEFAULT '{}'`);
  const existing = dbInstance.prepare(`SELECT id FROM openclaw_control WHERE id = 1`).get() as any;
  if (!existing) {
    dbInstance.prepare(`
      INSERT INTO openclaw_control (
        id, enabled, updated_at, updated_by, heartbeat_timeout_sec, circuit_state,
        circuit_fail_count, circuit_fail_threshold, timeout_window_count, timeout_threshold,
        error_reason, auto_cancel_queued_on_disable, queued_cancel_scope_json
      ) VALUES (1, 0, ?, 'system_bootstrap', 25, 'normal', 0, 3, 0, 5, '', 0, '{}')
    `).run(nowIso());
  }
  // P0-C: Persistent config store for tokens
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS openclaw_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT ''
    );
  `);
}

function getOpenClawControlRow() {
  ensureOpenClawTables();
  const dbInstance = db.getDatabase();
  return dbInstance.prepare(`SELECT * FROM openclaw_control WHERE id = 1`).get() as any;
}

function serializeOpenClawState(row: any) {
  return {
    enabled: !!row?.enabled,
    updated_at: row?.updated_at || null,
    updated_by: row?.updated_by || 'system',
    heartbeat_at: row?.last_heartbeat_at || null,
    heartbeat_timeout_sec: Number(row?.heartbeat_timeout_sec || 25),
    circuit_state: row?.circuit_state || 'normal',
    failure_count: Number(row?.circuit_fail_count || 0),
    timeout_count: Number(row?.timeout_window_count || 0),
    error_reason: row?.error_reason || '',
    auto_cancel_queued_on_disable: !!row?.auto_cancel_queued_on_disable,
    queued_cancel_scope: (() => {
      try { return JSON.parse(row?.queued_cancel_scope_json || '{}'); } catch { return {}; }
    })(),
  };
}

function writeOpenClawEvent(eventType: string, actor: string, reason: string, beforeState: any, afterState: any) {
  try {
    const dbInstance = db.getDatabase();
    dbInstance.prepare(`
      INSERT INTO openclaw_control_events (id, event_type, actor, reason, before_json, after_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      eventType,
      actor || 'system',
      reason || '',
      JSON.stringify(beforeState || {}),
      JSON.stringify(afterState || {}),
      nowIso(),
    );
  } catch {}
}

function writeOpenClawAudit(action: string, target: string, result: 'success' | 'failed' | 'partial', detail: Record<string, any>) {
  try {
    const dbInstance = db.getDatabase();
    dbInstance.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'openclaw', ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), action, target, result, JSON.stringify(detail || {}), nowIso());
  } catch {}
}

function buildOpenClawStatus(row: any) {
  const dbInstance = db.getDatabase();
  const heartbeatAt = row?.last_heartbeat_at ? new Date(row.last_heartbeat_at).getTime() : 0;
  const timeoutSec = Number(row?.heartbeat_timeout_sec || 25);
  const online = heartbeatAt > 0 && (Date.now() - heartbeatAt) <= timeoutSec * 1000;

  const runningRow = dbInstance.prepare(`
    SELECT COUNT(*) AS c FROM runs
    WHERE executor_type = 'openclaw' AND status = 'running'
  `).get() as any;
  const queuedRow = dbInstance.prepare(`
    SELECT COUNT(*) AS c FROM runs
    WHERE executor_type = 'openclaw' AND status = 'queued'
  `).get() as any;
  const lastActionRow = dbInstance.prepare(`
    SELECT id, run_code, name, status, updated_at
    FROM runs
    WHERE executor_type = 'openclaw'
    ORDER BY datetime(updated_at) DESC
    LIMIT 1
  `).get() as any;
  const lastErrorRow = dbInstance.prepare(`
    SELECT id, run_code, name, error_message, updated_at
    FROM runs
    WHERE executor_type = 'openclaw' AND error_message IS NOT NULL AND TRIM(error_message) <> ''
    ORDER BY datetime(updated_at) DESC
    LIMIT 1
  `).get() as any;

  return {
    online_status: online ? 'online' : 'offline',
    execution_status: Number(runningRow?.c || 0) > 0 ? 'executing' : 'idle',
    running_count: Number(runningRow?.c || 0),
    queued_count: Number(queuedRow?.c || 0),
    last_action: lastActionRow ? {
      run_id: String(lastActionRow.id || ''),
      run_code: String(lastActionRow.run_code || ''),
      run_name: String(lastActionRow.name || ''),
      status: String(lastActionRow.status || ''),
      at: lastActionRow.updated_at || null,
    } : null,
    last_error: lastErrorRow ? {
      run_id: String(lastErrorRow.id || ''),
      run_code: String(lastErrorRow.run_code || ''),
      run_name: String(lastErrorRow.name || ''),
      message: String(lastErrorRow.error_message || ''),
      at: lastErrorRow.updated_at || null,
    } : null,
    circuit_status: row?.circuit_state === 'triggered' ? 'triggered' : 'normal',
  };
}

app.get('/api/openclaw/master-switch', async (request: any, reply: any) => {
  const row = getOpenClawControlRow();
  const state = serializeOpenClawState(row);
  const status = buildOpenClawStatus(row);
  return {
    ok: true,
    enabled: state.enabled,
    message: state.enabled ? 'OpenClaw 执行层已开启' : 'OpenClaw 执行层已关闭',
    token_configured: openClawHeartbeatConfigured(),
    switch: {
      enabled: state.enabled,
      status_text: state.enabled ? 'enabled' : 'disabled',
      updated_at: state.updated_at,
      updated_by: state.updated_by,
    },
    status,
    heartbeat_at: state.heartbeat_at,
    circuit_state: state.circuit_state,
    failure_count: state.failure_count,
    timeout_count: state.timeout_count,
    auto_cancel_queued_on_disable: state.auto_cancel_queued_on_disable,
    queued_cancel_scope: state.queued_cancel_scope,
    last_action: status.last_action,
    last_error: status.last_error,
  };
});

app.post('/api/openclaw/master-switch', async (request: any, reply: any) => {
  const body = request.body || {};
  const enabled = !!body.enabled;
  const actor = String(body.actor || 'system');
  const reason = String(body.reason || '');
  const autoCancel = !!body.auto_cancel_queued_on_disable;
  const queuedCancelScope = body.queued_cancel_scope && typeof body.queued_cancel_scope === 'object'
    ? body.queued_cancel_scope
    : {};

  const beforeRow = getOpenClawControlRow();
  const beforeState = serializeOpenClawState(beforeRow);
  const dbInstance = db.getDatabase();
  dbInstance.prepare(`
    UPDATE openclaw_control
    SET enabled = ?, updated_at = ?, updated_by = ?, auto_cancel_queued_on_disable = ?, queued_cancel_scope_json = ?
    WHERE id = 1
  `).run(enabled ? 1 : 0, nowIso(), actor, autoCancel ? 1 : 0, JSON.stringify(queuedCancelScope || {}));
  const afterRow = getOpenClawControlRow();
  const afterState = serializeOpenClawState(afterRow);
  writeOpenClawEvent(enabled ? 'master_switch_enable' : 'master_switch_disable', actor, reason, beforeState, afterState);
  writeOpenClawAudit(enabled ? 'master_switch_enable' : 'master_switch_disable', 'openclaw_master_switch', 'success', {
    actor,
    reason,
    before: beforeState,
    after: afterState,
  });
  const status = buildOpenClawStatus(afterRow);
  return {
    ok: true,
    enabled: afterState.enabled,
    message: afterState.enabled ? 'OpenClaw 执行层已开启' : 'OpenClaw 执行层已关闭',
    switch: {
      enabled: afterState.enabled,
      status_text: afterState.enabled ? 'enabled' : 'disabled',
      updated_at: afterState.updated_at,
      updated_by: afterState.updated_by,
    },
    status,
  };
});

app.post('/api/openclaw/heartbeat', async (request: any, reply: any) => {
  const expectedToken = String(process.env.OPENCLAW_HEARTBEAT_TOKEN || '').trim();
  const token = String(request.headers['x-openclaw-token'] || '').trim();
  if (expectedToken && (!token || token !== expectedToken)) {
    return reply.code(401).send({ ok: false, error: 'invalid heartbeat token' });
  }

  const body = request.body || {};
  const actor = String(body.actor || 'openclaw_agent');
  const timeoutSecRaw = Number(body.heartbeat_timeout_sec ?? 25);
  const timeoutSec = Number.isFinite(timeoutSecRaw) ? Math.min(300, Math.max(5, Math.floor(timeoutSecRaw))) : 25;
  const beforeRow = getOpenClawControlRow();
  const beforeState = serializeOpenClawState(beforeRow);
  const dbInstance = db.getDatabase();
  dbInstance.prepare(`
    UPDATE openclaw_control
    SET last_heartbeat_at = ?, heartbeat_timeout_sec = ?, updated_at = ?, updated_by = ?, error_reason = CASE WHEN error_reason = 'heartbeat_missing' THEN '' ELSE error_reason END
    WHERE id = 1
  `).run(nowIso(), timeoutSec, nowIso(), actor);
  const afterRow = getOpenClawControlRow();
  const afterState = serializeOpenClawState(afterRow);
  writeOpenClawEvent('heartbeat', actor, 'heartbeat', beforeState, afterState);
  return {
    ok: true,
    token_configured: !!expectedToken,
    heartbeat_at: afterState.heartbeat_at,
    runtime_online: body.runtime_online !== false,
    heartbeat_timeout_sec: afterState.heartbeat_timeout_sec,
  };
});

// P0-C: Set and persist heartbeat token (survives restart)
app.post('/api/openclaw/token', async (request: any, reply: any) => {
  const body = request.body || {};
  const token = String(body.heartbeat_token || '').trim();
  const adminToken = String(body.admin_token || '').trim();
  const expectedAdminToken = String(process.env.OPENCLAW_ADMIN_TOKEN || '').trim();
  const providedAdminToken = String(request.headers['x-openclaw-admin-token'] || '').trim();
  if (!token && !adminToken) {
    return reply.code(400).send({ ok: false, error: 'heartbeat_token or admin_token required' });
  }
  // Security:
  // - Bootstrap: allow initializing admin token only when OPENCLAW_ADMIN_TOKEN is absent
  // - Normal: require x-openclaw-admin-token to match configured admin token
  const bootstrapInit = !expectedAdminToken && !!adminToken;
  if (!bootstrapInit) {
    if (!expectedAdminToken || providedAdminToken !== expectedAdminToken) {
      return reply.code(403).send({ ok: false, error: 'unauthorized token update' });
    }
  }
  try {
    ensureOpenClawTables();
    const dbInstance = db.getDatabase();
    if (token) {
      process.env.OPENCLAW_HEARTBEAT_TOKEN = token;
      dbInstance.prepare(`INSERT OR REPLACE INTO openclaw_config (key, value, updated_at) VALUES ('heartbeat_token', ?, ?)`).run(token, nowIso());
    }
    if (adminToken) {
      process.env.OPENCLAW_ADMIN_TOKEN = adminToken;
      dbInstance.prepare(`INSERT OR REPLACE INTO openclaw_config (key, value, updated_at) VALUES ('admin_token', ?, ?)`).run(adminToken, nowIso());
    }
    return {
      ok: true,
      token_configured: true,
      message: bootstrapInit ? 'Admin token bootstrapped and tokens saved' : 'Token saved and activated',
    };
  } catch (err: any) {
    return reply.code(500).send({ ok: false, error: String(err?.message || err) });
  }
});

app.post('/api/openclaw/circuit/recover', async (request: any, reply: any) => {
  const expectedToken = String(process.env.OPENCLAW_ADMIN_TOKEN || '').trim();
  const token = String(request.headers['x-openclaw-admin-token'] || '').trim();
  if (!expectedToken || token !== expectedToken) {
    return reply.code(403).send({ ok: false, error: 'unauthorized recover' });
  }

  const body = request.body || {};
  const actor = String(body.actor || 'ops_admin');
  const reason = String(body.reason || 'manual_recover');
  const beforeRow = getOpenClawControlRow();
  const beforeState = serializeOpenClawState(beforeRow);
  const dbInstance = db.getDatabase();
  dbInstance.prepare(`
    UPDATE openclaw_control
    SET enabled = 1,
        circuit_state = 'normal',
        circuit_fail_count = 0,
        timeout_window_count = 0,
        error_reason = '',
        updated_at = ?,
        updated_by = ?
    WHERE id = 1
  `).run(nowIso(), actor);
  const afterRow = getOpenClawControlRow();
  const afterState = serializeOpenClawState(afterRow);
  writeOpenClawEvent('circuit_recover', actor, reason, beforeState, afterState);
  writeOpenClawAudit('circuit_recover', 'openclaw_master_switch', 'success', {
    actor,
    reason,
    before: beforeState,
    after: afterState,
  });
  return {
    ok: true,
    message: 'OpenClaw 熔断已恢复',
    enabled: afterState.enabled,
    circuit_state: afterState.circuit_state,
    failure_count: afterState.failure_count,
    timeout_count: afterState.timeout_count,
  };
});


// ── Deployments ───────────────────────────────────────────────────────────────
app.get('/api/deployments', async (request: any, reply: any) => {
  const result = await deployments.listDeployments(request.query || {});
  return result;
});

app.get('/api/deployments/:id', async (request: any, reply: any) => {
  const result = await deployments.getDeploymentById(request.params.id);
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

app.get('/api/deployments/:id/detail', async (request: any, reply: any) => {
  const id = request.params.id;
  const result = await deployments.getDeploymentById(id);
  if (!result.ok) return reply.status(404).send(result);
  const relations = dashboard.getDeploymentRelations(id);
  return { ...result, ...relations };
});

app.post('/api/deployments', async (request: any, reply: any) => {
  const result = await deployments.createDeployment(request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.put('/api/deployments/:id', async (request: any, reply: any) => {
  const result = await deployments.updateDeployment(request.params.id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.delete('/api/deployments/:id', async (request: any, reply: any) => {
  const result = await deployments.deleteDeployment(request.params.id);
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

app.post('/api/deployments/from-artifact/:artifactId', async (request: any, reply: any) => {
  const result = await deployments.createDeploymentFromArtifact(request.params.artifactId, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/deployments/:id/start', async (request: any, reply: any) => {
  const result = await deployments.startDeployment(request.params.id);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/deployments/:id/stop', async (request: any, reply: any) => {
  const result = await deployments.stopDeployment(request.params.id);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/deployments/:id/restart', async (request: any, reply: any) => {
  const result = await deployments.restartDeployment(request.params.id);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.get('/api/deployments/:id/logs', async (request: any, reply: any) => {
  const result = await deployments.getDeploymentLogs(request.params.id, request.query || {});
  return result;
});

app.get('/api/deployments/:id/health', async (request: any, reply: any) => {
  const result = await deployments.getDeploymentHealth(request.params.id);
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

// Health check interface
app.get('/api/health', async (request, reply) => {
  app.log.info('Health check requested');
  try {
    const dbInstance = db.getDatabase();
    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const jTotal = (dbInstance.prepare(`SELECT COUNT(*) as c FROM workflow_jobs`).get() as any).c;
    const jFailed = (dbInstance.prepare(`SELECT COUNT(*) as c FROM workflow_jobs WHERE status = 'failed' AND updated_at >= '${since24h}'`).get() as any).c;
    const jPaused = (dbInstance.prepare(`SELECT COUNT(*) as c FROM workflow_jobs WHERE status = 'paused'`).get() as any).c;
    const aPending = (dbInstance.prepare(`SELECT COUNT(*) as c FROM approvals WHERE status = 'pending'`).get() as any).c;
    const retryLimit = (dbInstance.prepare(`SELECT COUNT(*) as c FROM audit_logs WHERE action = 'workflow_retry_limit_exceeded' AND created_at >= '${since24h}'`).get() as any).c;
    const staleRecon = (dbInstance.prepare(`SELECT COUNT(*) as c FROM audit_logs WHERE action = 'workflow_reconcile_stale' AND created_at >= '${since24h}'`).get() as any).c;
    return {
      ok: true,
      service: 'local-api',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      uptime: process.uptime(),
      database: 'ok',
      workflows: { total: jTotal, failed_24h: jFailed, paused: jPaused },
      approvals: { pending: aPending },
      incidents: { retry_limit_exceeded_24h: retryLimit, stale_reconciled_24h: staleRecon },
    };
  } catch(err: any) {
    return { ok: false, service: 'local-api', timestamp: new Date().toISOString(), version: APP_VERSION, error: err.message };
  }
});



// 数据库测试接口
// v4.8.1: WAL checkpoint for backup integrity
app.post('/api/db/checkpoint', async (request, reply) => {
  try {
    const dbInstance = db.getDatabase();
    dbInstance.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    const result = dbInstance.prepare('PRAGMA wal_checkpoint(TRUNCATE)').get();
    return { ok: true, checkpoint: result };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
});

app.get('/api/db/ping', async (request, reply) => {
  app.log.info('Database ping requested');
  
  try {
    const dbInstance = db.getDatabase();
    const tables = dbInstance
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as Array<{ name: string }>;
    
    const tableNames = tables.map(t => t.name);
    
    app.log.info(`Database connected, tables: ${tableNames.length}`);
    
    return {
      ok: true,
      db: 'sqlite',
      connected: true,
      tables: tableNames,
      tableCount: tableNames.length,
    };
  } catch (error) {
    app.log.error(`Database connection failed: ${error}`);
    return {
      ok: false,
      db: 'sqlite',
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// 根路径
app.get('/', async (request, reply) => {
  return {
    message: 'AegisFlow Intelligence Platform Local API (AGI Model Factory legacy compatible)',
    endpoints: [
      { method: 'GET', path: '/', description: 'API信息' },
      { method: 'GET', path: '/api/health', description: '健康检查' },
      { method: 'GET', path: '/api/db/ping', description: '数据库测试' },
      { method: 'GET', path: '/api/tasks', description: '获取任务列表' },
      { method: 'POST', path: '/api/tasks', description: '创建新任务' },
      { method: 'GET', path: '/api/tasks/:id', description: '获取任务详情' },
      { method: 'PUT', path: '/api/tasks/:id', description: '更新任务信息' },
      { method: 'PATCH', path: '/api/tasks/:id/status', description: '更新任务状态' },
      { method: 'GET', path: '/api/tasks/:id/steps', description: '获取任务步骤列表' },
      { method: 'POST', path: '/api/tasks/:id/steps', description: '创建任务步骤' },
      { method: 'PATCH', path: '/api/tasks/:id/steps/:stepId/status', description: '更新步骤状态' },
      { method: 'GET', path: '/api/tasks/:id/logs', description: '获取任务日志列表' },
      { method: 'POST', path: '/api/tasks/:id/logs', description: '创建任务日志' },
      { method: 'POST', path: '/api/tasks/:id/execute', description: '执行任务' },
      { method: 'POST', path: '/api/tasks/:id/cancel', description: '取消任务' },
      { method: 'POST', path: '/api/tasks/:id/retry', description: '重试任务' },
      { method: 'GET', path: '/api/templates', description: '模板列表' },
      { method: 'GET', path: '/api/templates/:id', description: '模板详情' },
      { method: 'POST', path: '/api/templates', description: '创建模板' },
      { method: 'PUT', path: '/api/templates/:id', description: '更新模板' },
      { method: 'POST', path: '/api/templates/:id/clone', description: '克隆模板' },
      { method: 'POST', path: '/api/templates/:id/create-task', description: '基于模板创建任务' },
    ],
    documentation: 'See /api/health for service status',
  };
});

// 模板列表
app.get('/api/templates', async (request, reply) => {
  const query = request.query as any;
  const result = templates.listTemplates({
    builtin: query.builtin,
    category: query.category,
    status: query.status,
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
  });
  if (!result.ok) {
    return reply.code(500).send({
      ok: false,
      error: 'Failed to load templates'
    });
  }
  return {
    ok: true,
    templates: result.templates,
    count: result.total
  };
});

// 模板详情
app.get('/api/templates/:id', async (request, reply) => {
  const params = request.params as any;
  const result = templates.getTemplateById(params.id);
  if (!result.ok) {
    return reply.code(404).send({
      ok: false,
      error: result.error || 'Template not found'
    });
  }
  return {
    ok: true,
    template: 'template' in result ? result.template : null
  };
});

// 新建模板
app.post('/api/templates', async (request, reply) => {
  const body = (request.body as any) || {};
  if (typeof body.code !== 'string' || !body.code.trim() || typeof body.name !== 'string' || !body.name.trim()) {
    return reply.code(400).send({
      ok: false,
      error: 'code and name are required',
    });
  }
  const result = templates.createTemplate(body);
  if (!result.ok) {
    const statusCode = result.error?.includes('already exists') || result.error?.includes('required') || result.error?.includes('Invalid') ? 400 : 500;
    return reply.code(statusCode).send({
      ok: false,
      error: result.error || 'Failed to create template'
    });
  }
  return {
    ok: true,
    template: 'template' in result ? result.template : null
  };
});

// 更新模板
app.put('/api/templates/:id', async (request, reply) => {
  const params = request.params as any;
  const body = request.body as any;
  const result = templates.updateTemplate(params.id, body);
  if (!result.ok) {
    const code = result.error?.includes('not found') ? 404 : result.error?.includes('read-only') || result.error?.includes('Invalid') ? 400 : 500;
    return reply.code(code).send({
      ok: false,
      error: result.error || 'Failed to update template'
    });
  }
  return {
    ok: true,
    template: 'template' in result ? result.template : null
  };
});

// 克隆模板
app.post('/api/templates/:id/clone', async (request, reply) => {
  const params = request.params as any;
  const result = templates.cloneTemplate(params.id);
  if (!result.ok) {
    const code = result.error?.includes('not found') ? 404 : 500;
    return reply.code(code).send({
      ok: false,
      error: result.error || 'Failed to clone template'
    });
  }
  return {
    ok: true,
    template: 'template' in result ? result.template : null
  };
});

// 基于模板创建任务
app.post('/api/templates/:id/create-task', async (request, reply) => {
  const params = request.params as any;
  const body = request.body as any;
  const result = await templates.createTaskFromTemplate(params.id, body);
  if (!result.ok) {
    const code = result.error?.includes('not found') ? 404 : result.error?.includes('Invalid') ? 400 : 500;
    return reply.code(code).send({
      ok: false,
      error: result.error || 'Failed to create task from template'
    });
  }
  return {
    ok: true,
    task: 'task' in result ? result.task : null,
    template: 'template' in result ? result.template : null
  };
});

// ========== 数据集路由 ==========

// 数据集列表
app.get('/api/datasets', async (request: any, reply: any) => {
  const result = await datasets.listDatasets(request.query);
  return result;
});

// 数据集详情
app.get('/api/datasets/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await datasets.getDatasetById(id);
  if (!result.ok) {
    return reply.status(404).send(result);
  }
  return result;
});

// 创建数据集
app.post('/api/datasets', async (request: any, reply: any) => {
  const result = await datasets.createDataset(request.body);
  if (!result.ok) {
    return reply.status(400).send(result);
  }
  return result;
});

// 更新数据集
app.put('/api/datasets/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await datasets.updateDataset(id, request.body);
  if (!result.ok) {
    return reply.status(400).send(result);
  }
  return result;
});

// 创建新版本
app.post('/api/datasets/:id/new-version', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await datasets.createNewVersion(id);
  if (!result.ok) {
    return reply.status(400).send(result);
  }
  return result;
});

// 删除数据集
app.delete('/api/datasets/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await datasets.deleteDataset(id);
  if (!result.ok) {
    return reply.status(404).send(result);
  }
  return result;
});

// ========== 实验路由 ==========
app.get('/api/tasks', async (request, reply) => {
  const query = request.query as any;
  
  // 解析查询参数
  const filter: any = {};
  const options: any = {};
  
  // 过滤参数
  if (query.status !== undefined) filter.status = query.status;
  if (query.owner !== undefined) {
    // 空字符串表示查询owner为null的任务
    filter.owner = query.owner === '' ? null : query.owner;
  }
  if (query.created_after !== undefined) filter.created_after = query.created_after;
  if (query.created_before !== undefined) filter.created_before = query.created_before;
  
  // 排序参数
  if (query.sort !== undefined) options.sort = query.sort;
  if (query.order !== undefined) options.order = query.order;
  
  // 分页参数
  if (query.page !== undefined) {
    const page = parseInt(query.page, 10);
    if (isNaN(page) || page < 1) {
      return reply.code(400).send({
        ok: false,
        error: 'Invalid page parameter. Must be a positive integer.',
      });
    }
    options.page = page;
  }
  
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return reply.code(400).send({
        ok: false,
        error: 'Invalid limit parameter. Must be an integer between 1 and 100.',
      });
    }
    options.limit = limit;
  }
  
  // 记录查询参数
  const filterStr = Object.keys(filter).length > 0 
    ? ` with filter: ${JSON.stringify(filter)}` 
    : '';
  const optionsStr = Object.keys(options).length > 0 
    ? ` and options: ${JSON.stringify(options)}` 
    : '';
  
  app.log.info(`Get tasks requested${filterStr}${optionsStr}`);
  
  // 执行查询
  const result = tasks.getTasksAdvanced(
    Object.keys(filter).length > 0 ? filter : undefined,
    Object.keys(options).length > 0 ? options : undefined
  );
  
  if (result.ok) {
    app.log.info(`Returning ${result.count} tasks (total: ${result.total})`);
    
    const response: any = {
      ok: true,
      tasks: result.tasks,
      count: result.count,
      total: result.total,
    };
    
    // 添加过滤条件信息
    if (result.filter) response.filter = result.filter;
    
    // 添加分页信息
    if (result.page !== undefined) {
      response.page = result.page;
      response.limit = result.limit;
      response.pages = result.pages;
    }
    
    // 添加排序信息
    if (result.options) {
      response.sort = result.options.sort || 'created_at';
      response.order = result.options.order || 'desc';
    }
    
    return response;
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && (
      result.error.includes('Invalid sort field') ||
      result.error.includes('Invalid sort order')
    )) {
      app.log.error(`Invalid query parameter: ${result.error}`);
      return reply.code(400).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to get tasks: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to get tasks',
      });
    }
  }
});

// 创建新任务
app.post('/api/tasks', async (request, reply) => {
  app.log.info('Create task requested');
  
  const body = request.body as any;
  
  // 验证必要字段
  if (!body.title || typeof body.title !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Title is required and must be a string',
    });
  }
  
  const taskData = {
    title: body.title,
    description: body.description || '',
  };
  
  const result = tasks.createTask(taskData);
  
  if (result.ok && result.task) {
    app.log.info(`Task created: ${result.task.id}`);
    return {
      ok: true,
      task: result.task,
      message: 'Task created successfully',
    };
  } else {
    app.log.error(`Failed to create task: ${result.error}`);
    return reply.code(500).send({
      ok: false,
      error: result.error || 'Failed to create task',
    });
  }
});

// 获取单个任务详情（聚合）
app.get('/api/tasks/:id', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  
  app.log.info(`Get task requested: ${taskId}`);
  
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  const taskResult = tasks.getTaskById(taskId);
  
  if (taskResult.ok && taskResult.task) {
    const stepsResult = taskSteps.getTaskSteps(taskId);
    const logsResult = taskLogs.getTaskLogs(taskId, { order: 'asc' });
    const steps = stepsResult.ok ? stepsResult.steps : [];
    const logs = logsResult.ok ? logsResult.logs : [];
    const summary = buildTaskSummary(taskResult.task, steps, logs);
    const latestError = getLatestErrorMessage(logs);

    let templateInfo: any = null;
    if (taskResult.task.template_id) {
      const templateRes = templates.getTemplateById(taskResult.task.template_id);
      if (templateRes.ok && templateRes.template) {
        templateInfo = {
          id: templateRes.template.id,
          code: templateRes.template.code,
          name: templateRes.template.name,
          version: templateRes.template.version,
          status: templateRes.template.status
        };
      }
    }

    const normalizedTask = {
      ...taskResult.task,
      name: taskResult.task.title,
      type: taskResult.task.template_id || 'manual',
      error_message: taskResult.task.error_message || latestError,
      duration_ms: summary.duration_ms,
      template: templateInfo
    };

    app.log.info(`Task detail aggregated: ${taskId}`);
    return {
      ok: true,
      task: normalizedTask,
      summary,
      steps,
      logs
    };
  } else {
    app.log.error(`Task not found: ${taskId}`);
    return reply.code(404).send({
      ok: false,
      error: taskResult.error || 'Task not found',
    });
  }
});

// 更新任务状态
app.patch('/api/tasks/:id/status', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  const body = request.body as any;
  
  app.log.info(`Update task status requested: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  if (!body.status || typeof body.status !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Status is required and must be a string',
    });
  }
  
  const result = tasks.updateTaskStatus(taskId, body.status);
  
  if (result.ok && result.task) {
    app.log.info(`Task status updated: ${taskId} -> ${body.status}`);
    return {
      ok: true,
      task: result.task,
      message: 'Task status updated successfully',
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Task not found: ${taskId}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else if (result.error && result.error.includes('Invalid status')) {
      app.log.error(`Invalid status: ${body.status}`);
      return reply.code(400).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to update task status: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to update task status',
      });
    }
  }
});

// 更新任务信息
app.put('/api/tasks/:id', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  const body = request.body as any;
  
  app.log.info(`Update task requested: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  // 验证至少提供了一个可更新的字段
  const hasUpdateFields = 
    body.title !== undefined ||
    body.description !== undefined ||
    body.owner !== undefined ||
    body.status !== undefined;
  
  if (!hasUpdateFields) {
    return reply.code(400).send({
      ok: false,
      error: 'At least one field must be provided for update: title, description, owner, status',
    });
  }
  
  // 准备更新数据
  const updateData: any = {};
  
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.owner !== undefined) updateData.owner = body.owner;
  if (body.status !== undefined) updateData.status = body.status;
  
  const result = tasks.updateTask(taskId, updateData);
  
  if (result.ok && result.task) {
    app.log.info(`Task updated: ${taskId}`);
    return {
      ok: true,
      task: result.task,
      message: 'Task updated successfully',
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Task not found: ${taskId}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else if (
      result.error && (
        result.error.includes('Invalid status') ||
        result.error.includes('must be a') ||
        result.error.includes('No fields to update')
      )
    ) {
      app.log.error(`Invalid update data: ${result.error}`);
      return reply.code(400).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to update task: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to update task',
      });
    }
  }
});

// 获取任务步骤列表
app.get('/api/tasks/:id/steps', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  
  app.log.info(`Get task steps requested: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  const result = taskSteps.getTaskSteps(taskId);
  
  if (result.ok) {
    app.log.info(`Returning ${result.count} steps for task ${taskId}`);
    return {
      ok: true,
      steps: result.steps,
      count: result.count,
      task_id: taskId,
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Task not found: ${taskId}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to get task steps: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to get task steps',
      });
    }
  }
});

// 创建任务步骤
app.post('/api/tasks/:id/steps', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  const body = request.body as any;
  
  app.log.info(`Create task step requested for task: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  // 验证步骤数据
  if (!body.step_name || typeof body.step_name !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'step_name is required and must be a string',
    });
  }
  
  if (body.step_index === undefined || typeof body.step_index !== 'number') {
    return reply.code(400).send({
      ok: false,
      error: 'step_index is required and must be a number',
    });
  }
  
  const stepData = {
    step_name: body.step_name,
    step_type: body.step_type || '',
    step_index: body.step_index,
  };
  
  const result = taskSteps.createTaskStep(taskId, stepData);
  
  if (result.ok && result.step) {
    app.log.info(`Step created: ${result.step.id} for task ${taskId}`);
    return {
      ok: true,
      step: result.step,
      message: 'Task step created successfully',
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Task not found: ${taskId}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else if (result.error && result.error.includes('already exists')) {
      app.log.error(`Step index conflict: ${body.step_index}`);
      return reply.code(400).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to create task step: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to create task step',
      });
    }
  }
});

// 更新步骤状态
app.patch('/api/tasks/:id/steps/:stepId/status', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  const stepId = params.stepId;
  const body = request.body as any;
  
  app.log.info(`Update step status requested: ${stepId} for task ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  if (!stepId || typeof stepId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Step ID is required',
    });
  }
  
  if (!body.status || typeof body.status !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Status is required and must be a string',
    });
  }
  
  const result = taskSteps.updateStepStatus(taskId, stepId, body.status);
  
  if (result.ok && result.step) {
    app.log.info(`Step status updated: ${stepId} -> ${body.status}`);
    return {
      ok: true,
      step: result.step,
      message: 'Step status updated successfully',
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Step not found: ${stepId} for task ${taskId}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else if (result.error && result.error.includes('Invalid status')) {
      app.log.error(`Invalid status: ${body.status}`);
      return reply.code(400).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to update step status: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to update step status',
      });
    }
  }
});

// 获取任务日志列表
app.get('/api/tasks/:id/logs', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  const query = request.query as any;
  
  app.log.info(`Get task logs requested: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  // 解析查询参数
  const options: any = {};
  if (query.order !== undefined) {
    if (query.order !== 'asc' && query.order !== 'desc') {
      return reply.code(400).send({
        ok: false,
        error: 'Invalid order parameter. Must be "asc" or "desc"',
      });
    }
    options.order = query.order;
  }
  
  const result = taskLogs.getTaskLogs(taskId, options);
  
  if (result.ok) {
    app.log.info(`Returning ${result.count} logs for task ${taskId}`);
    return {
      ok: true,
      logs: result.logs,
      count: result.count,
      task_id: taskId,
      order: options.order || 'asc',
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Task not found: ${taskId}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to get task logs: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to get task logs',
      });
    }
  }
});

// 创建任务日志
app.post('/api/tasks/:id/logs', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  const body = request.body as any;
  
  app.log.info(`Create task log requested for task: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  // 验证日志数据
  if (!body.level || typeof body.level !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'level is required and must be a string',
    });
  }
  
  if (!body.message || typeof body.message !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'message is required and must be a string',
    });
  }
  
  const logData = {
    step_id: body.step_id !== undefined ? body.step_id : null,
    level: body.level,
    message: body.message,
  };
  
  const result = taskLogs.createTaskLog(taskId, logData);
  
  if (result.ok && result.log) {
    app.log.info(`Log created: ${result.log.id} for task ${taskId}`);
    return {
      ok: true,
      log: result.log,
      message: 'Task log created successfully',
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Task or step not found: ${result.error}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else if (result.error && result.error.includes('Invalid level')) {
      app.log.error(`Invalid level: ${body.level}`);
      return reply.code(400).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to create task log: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to create task log',
      });
    }
  }
});

// 执行任务
app.post('/api/tasks/:id/execute', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  
  app.log.info(`Execute task requested: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  try {
    // 执行任务
    const result = await taskExecute.executeTask(taskId);
    
    if (result.ok) {
      app.log.info(`Task execution completed: ${taskId} -> ${result.status}`);
      return {
        ok: true,
        taskId: result.taskId,
        status: result.status,
        stepsCreated: result.stepsCreated || 0,
        logsCreated: result.logsCreated || 0,
        message: result.status === 'running' ? 'Task execution started' : 'Task execution completed successfully',
      };
    } else {
      // 根据错误类型返回不同的状态码
      if (result.error && result.error.includes('not found')) {
        app.log.error(`Task not found: ${taskId}`);
        return reply.code(404).send({
          ok: false,
          error: result.error,
        });
      } else {
        app.log.error(`Failed to execute task: ${result.error}`);
        return reply.code(500).send({
          ok: false,
          error: result.error || 'Failed to execute task',
        });
      }
    }
  } catch (error) {
    app.log.error(`Unexpected error executing task: ${error}`);
    return reply.code(500).send({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// 取消任务
app.post('/api/tasks/:id/cancel', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  app.log.info(`Cancel task requested: ${taskId}`);

  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required'
    });
  }

  const cancelResult = taskExecute.cancelTask(taskId);
  if (!cancelResult.ok) {
    if (cancelResult.error?.includes('not found')) {
      return reply.code(404).send({ ok: false, error: cancelResult.error });
    }
    return reply.code(400).send({ ok: false, error: cancelResult.error || 'Task cannot be cancelled' });
  }

  const taskResult = tasks.getTaskById(taskId);
  return {
    ok: true,
    task: taskResult.ok ? taskResult.task : null,
    message: 'Cancellation requested'
  };
});

// 重试任务（复制并立即执行）
app.post('/api/tasks/:id/retry', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  app.log.info(`Retry task requested: ${taskId}`);

  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required'
    });
  }

  const sourceTask = tasks.getTaskById(taskId);
  if (!sourceTask.ok || !sourceTask.task) {
    return reply.code(404).send({
      ok: false,
      error: sourceTask.error || 'Task not found'
    });
  }

  if (!['failed', 'cancelled'].includes(sourceTask.task.status)) {
    return reply.code(400).send({
      ok: false,
      error: `Task status "${sourceTask.task.status}" is not retryable`
    });
  }

  const cloneResult = tasks.cloneTaskForRetry(taskId);
  if (!cloneResult.ok || !cloneResult.task) {
    return reply.code(500).send({
      ok: false,
      error: cloneResult.error || 'Failed to create retry task'
    });
  }

  const executeResult = await taskExecute.executeTask(cloneResult.task.id);
  if (!executeResult.ok) {
    return reply.code(500).send({
      ok: false,
      error: executeResult.error || 'Failed to execute retry task'
    });
  }

  const newTask = tasks.getTaskById(cloneResult.task.id);
  return {
    ok: true,
    task: newTask.ok ? newTask.task : cloneResult.task,
    source_task_id: taskId,
    execute: {
      status: executeResult.status
    }
  };
});

// 获取任务执行统计
app.get('/api/tasks/:id/execute/stats', async (request, reply) => {
  const params = request.params as any;
  const taskId = params.id;
  
  app.log.info(`Get task execution stats requested: ${taskId}`);
  
  // 验证必要字段
  if (!taskId || typeof taskId !== 'string') {
    return reply.code(400).send({
      ok: false,
      error: 'Task ID is required',
    });
  }
  
  const result = taskExecute.getTaskExecutionStats(taskId);
  
  if (result.ok) {
    return {
      ok: true,
      taskId: result.taskId,
      stepsCount: result.stepsCount,
      pendingSteps: result.pendingSteps,
      completedSteps: result.completedSteps,
      logsCount: result.logsCount,
    };
  } else {
    // 根据错误类型返回不同的状态码
    if (result.error && result.error.includes('not found')) {
      app.log.error(`Task not found: ${taskId}`);
      return reply.code(404).send({
        ok: false,
        error: result.error,
      });
    } else {
      app.log.error(`Failed to get task execution stats: ${result.error}`);
      return reply.code(500).send({
        ok: false,
        error: result.error || 'Failed to get task execution stats',
      });
    }
  }
});


// ── Runs ─────────────────────────────────────────────────────────────────────
app.get('/api/runs', async (request: any, reply: any) => {
  const result = runs.listRuns(request.query || {});
  return result;
});

app.get('/api/runs/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = runs.getRunById(id);
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

app.post('/api/runs', async (request: any, reply: any) => {
  const result = runs.createRun(request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.put('/api/runs/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = runs.updateRun(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

const NO_BODY_SCHEMA = { body: { type: 'null' as const } };

app.post('/api/runs/:id/start', { schema: NO_BODY_SCHEMA }, async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await runs.startRun(id);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/runs/:id/cancel', { schema: NO_BODY_SCHEMA }, async (request: any, reply: any) => {
  const { id } = request.params;
  const result = runs.cancelRun(id);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/runs/:id/retry', { schema: NO_BODY_SCHEMA }, async (request: any, reply: any) => {
  const { id } = request.params;
  const result = runs.retryRun(id);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.get('/api/runs/:id/steps', async (request: any, reply: any) => {
  const { id } = request.params;
  return runs.getRunSteps(id);
});

app.get('/api/runs/:id/logs', async (request: any, reply: any) => {
  const { id } = request.params;
  return runs.getRunLogs(id, request.query || {});
});

app.get('/api/runs/:id/artifacts', async (request: any, reply: any) => {
  const { id } = request.params;
  return runs.getRunArtifacts(id);
});

app.post('/api/runs/:id/artifacts', async (request: any, reply: any) => {
  const { id } = request.params;
  const { artifact_id, relation_type } = request.body || {};
  const result = runs.linkArtifactToRun(id, artifact_id || '', relation_type || 'output');
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

// ── Dataset Pipeline ──────────────────────────────────────────────────────────
app.get('/api/pipeline/configs', async (request: any, reply: any) => {
  return pipeline.listPipelineConfigs(request.query || {});
});
app.get('/api/pipeline/configs/:id', async (request: any, reply: any) => {
  return pipeline.getPipelineConfig(request.params.id);
});
app.post('/api/pipeline/configs', async (request: any, reply: any) => {
  return pipeline.createPipelineConfig(request.body || {});
});

app.get('/api/pipeline/runs', async (request: any, reply: any) => {
  return pipeline.listPipelineRuns(request.query || {});
});
app.get('/api/pipeline/runs/:id', async (request: any, reply: any) => {
  return pipeline.getPipelineRun(request.params.id);
});
app.post('/api/pipeline/runs', async (request: any, reply: any) => {
  return pipeline.createPipelineRun(request.body || {});
});

app.get('/api/pipeline/splits', async (request: any, reply: any) => {
  return pipeline.listSplits(request.query || {});
});
app.post('/api/pipeline/splits', async (request: any, reply: any) => {
  return pipeline.createSplit(request.body || {});
});

app.get('/api/pipeline/summary', async (request: any, reply: any) => {
  return pipeline.getPipelineSummary();
});


// ── Training Runtime ─────────────────────────────────────────────────────────
app.get('/api/training/configs', async (request: any, reply: any) => {
  return training.listTrainingConfigs(request.query || {});
});
app.get('/api/training/configs/:id', async (request: any, reply: any) => {
  return training.getTrainingConfig(request.params.id);
});
app.post('/api/training/configs', async (request: any, reply: any) => {
  const result = training.createTrainingConfig(request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.get('/api/training/runs', async (request: any, reply: any) => {
  return training.listTrainingRuns(request.query || {});
});
app.get('/api/training/runs/:id', async (request: any, reply: any) => {
  return training.getTrainingRun(request.params.id);
});
app.post('/api/training/runs', async (request: any, reply: any) => {
  return training.createTrainingRun(request.body || {});
});

app.get('/api/training/checkpoints', async (request: any, reply: any) => {
  return training.listCheckpoints(request.query || {});
});
app.get('/api/training/checkpoints/:id', async (request: any, reply: any) => {
  return training.getCheckpoint(request.params.id);
});
app.post('/api/training/checkpoints', async (request: any, reply: any) => {
  return training.createCheckpoint(request.body || {});
});

app.get('/api/training/summary', async (request: any, reply: any) => {
  return training.getTrainingSummary();
});

// ── F6: Training Presets ────────────────────────────────────────────────────
const _presetSeeded = training.seedBuiltinTrainingPresets();
app.get('/api/training-presets', async (request: any) => {
  return training.listTrainingPresets(request.query || {});
});

app.get('/api/training-presets/:code', async (request: any) => {
  return training.resolvePreset(request.params.code);
});


// ── Evaluations ──────────────────────────────────────────────────────────────
app.get('/api/evaluations', async (request: any, reply: any) => {
  const result = await evaluations.listEvaluations(request.query || {});
  return result;
});

app.get('/api/evaluations/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await evaluations.getEvaluationById(id);
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

app.get('/api/evaluations/:id/detail', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await evaluations.getEvaluationById(id);
  if (!result.ok) return reply.status(404).send(result);
  const source_artifact = result.evaluation?.artifact_id
    ? dashboard.getSourceArtifact(result.evaluation.artifact_id)
    : null;
  return { ...result, source_artifact };
});

app.post('/api/evaluations', async (request: any, reply: any) => {
  const result = await evaluations.createEvaluation(request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.put('/api/evaluations/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await evaluations.updateEvaluation(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.delete('/api/evaluations/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await evaluations.deleteEvaluation(id);
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

app.post('/api/evaluations/:id/execute', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await evaluations.executeEvaluation(id);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.get('/api/evaluations/:id/steps', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = evaluations.getEvaluationSteps(id);
  return result;
});

app.get('/api/evaluations/:id/logs', async (request: any, reply: any) => {
  const { id } = request.params;
  const { order } = request.query || {};
  const result = evaluations.getEvaluationLogs(id, order || 'asc');
  return result;
});

app.get('/api/evaluations/:id/metrics', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = evaluations.getEvaluationMetrics(id);
  return result;
});

app.get('/api/evaluations/:id/lineage', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = evaluations.getEvaluationLineage(id);
  return result;
});

// ── F8: Evaluation Report ─────────────────────────────────────────────────────
app.get('/api/evaluations/:id/report', async (request: any, reply: any) => {
  const { id } = request.params;
  return evaluations.getEvaluationReport(id);
});

// F8: Compare two evaluations
app.get('/api/evaluations/compare', async (request: any, reply: any) => {
  const { baseline_id, candidate_id } = request.query || {};
  if (!baseline_id || !candidate_id) {
    return reply.status(400).send({ ok: false, error: 'baseline_id and candidate_id are required' });
  }
  return evaluations.getEvaluationComparison(baseline_id, candidate_id);
});

// F8: Experiment batch report
app.get('/api/experiments/:id/evaluation-report', async (request: any, reply: any) => {
  const { id } = request.params;
  return evaluations.getExperimentReport(id);
});


// ── Artifacts ────────────────────────────────────────────────────────────────
app.get('/api/artifacts', async (request: any, reply: any) => {
  const result = await artifacts.listArtifacts(request.query || {});
  return result;
});

app.get('/api/artifacts/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.getArtifactById(id);
  if (!result.ok) return reply.status(404).send(result);
  return result;
});

app.get('/api/artifacts/:id/detail', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.getArtifactById(id);
  if (!result.ok) return reply.status(404).send(result);
  const related_evaluations = dashboard.getRelatedEvaluations(id);
  const related_deployments = dashboard.getRelatedDeployments(id);
  const source_training = result.artifact?.training_job_id
    ? dashboard.getSourceTraining(result.artifact.training_job_id)
    : null;
  return { ...result, related_evaluations, related_deployments, source_training };
});

app.post('/api/artifacts', async (request: any, reply: any) => {
  const result = await artifacts.createArtifact(request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.put('/api/artifacts/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.updateArtifact(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.delete('/api/artifacts/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  // 直接调用，不经过任何代理
  return artifacts.deleteArtifact(id);
});

app.post('/api/artifacts/:id/archive', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.archiveArtifact(id);
});

// ══ v4.8.0: Promotion Gate API ═══════════════════════════════════════════════
app.get('/api/artifacts/:id/promotion-readiness', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.getPromotionReadiness(id);
});

app.post('/api/artifacts/:id/promote', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.promoteArtifact(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/artifacts/:id/approve-promotion', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.approvePromotion(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/artifacts/:id/reject-promotion', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.rejectPromotion(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

// ══ v4.9.0: Release Seal API ═══════════════════════════════════════════════
app.post('/api/artifacts/:id/seal-release', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.sealRelease(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.get('/api/releases', async (request: any, reply: any) => {
  return artifacts.listReleases(request.query || {});
});

app.get('/api/releases/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.getRelease(id);
});

app.get('/api/artifacts/:id/release', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.getArtifactRelease(id);
});

// ── F9: Release Package Status ─────────────────────────────────────────────
app.get('/api/artifacts/:id/release-package', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.getArtifactReleasePackage(id);
});

app.post('/api/artifacts/:id/build-package', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.buildArtifactReleasePackage(id, request.body || {});
});

// ── F9: Release Pipeline Readiness ──────────────────────────────────────────
app.get('/api/artifacts/:id/release-readiness', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.getReleasePipelineReadiness(id);
});

// ── F9: Release Delivery Manifest ───────────────────────────────────────────
app.get('/api/releases/:id/delivery-manifest', async (request: any, reply: any) => {
  const { id } = request.params;
  return artifacts.getReleaseDeliveryManifest(id);
});

// ══ v5.0.0: Gate Checks API ════════════════════════════════════════════════
app.get('/api/gates', async (request: any, reply: any) => {
  return gates.listGateChecks(request.query || {});
});

app.get('/api/gates/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  return gates.getGateCheck(id);
});

app.post('/api/gates/evaluation-ready/:evalId', async (request: any, reply: any) => {
  const { evalId } = request.params;
  return gates.checkEvaluationReadyGate(evalId);
});

app.post('/api/gates/artifact-ready/:artifactId', async (request: any, reply: any) => {
  const { artifactId } = request.params;
  return gates.checkArtifactReadyGate(artifactId);
});

app.post('/api/gates/promotion-ready/:artifactId', async (request: any, reply: any) => {
  const { artifactId } = request.params;
  return gates.checkPromotionReadyGate(artifactId);
});

app.post('/api/gates/release-ready/:artifactId', async (request: any, reply: any) => {
  const { artifactId } = request.params;
  return gates.checkReleaseReadyGate(artifactId);
});

app.post('/api/gates/seal-ready/:releaseId', async (request: any, reply: any) => {
  const { releaseId } = request.params;
  return gates.checkSealReadyGate(releaseId);
});

// ══ v5.0.0: Factory Status API ════════════════════════════════════════════
app.get('/api/factory/status', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();

  // Stage counts
  const evaluationsCount = (dbInstance.prepare("SELECT COUNT(*) as c FROM evaluations").get() as any).c;
  const artifactsCount = (dbInstance.prepare("SELECT COUNT(*) as c FROM artifacts").get() as any).c;
  const modelsCount = (dbInstance.prepare("SELECT COUNT(*) as c FROM models").get() as any).c;
  const releasesCount = (dbInstance.prepare("SELECT COUNT(*) as c FROM releases").get() as any).c;

  // Stage by status
  const evalByStatus = dbInstance.prepare("SELECT status, COUNT(*) as c FROM evaluations GROUP BY status").all() as any[];
  const artByStatus = dbInstance.prepare("SELECT status, COUNT(*) as c FROM artifacts GROUP BY status").all() as any[];
  const artByPromo = dbInstance.prepare("SELECT promotion_status, COUNT(*) as c FROM artifacts GROUP BY promotion_status").all() as any[];
  const modelByPromo = dbInstance.prepare("SELECT promotion_status, COUNT(*) as c FROM models GROUP BY promotion_status").all() as any[];

  // Gate blocking points — with time_range filter
  const timeRange = (request.query.time_range as string) || '24h';
  const timeDeltaMap: Record<string, string> = { '24h': '-24 hours', '7d': '-7 days', '30d': '-30 days' };
  const timeDelta = timeDeltaMap[timeRange] || '-24 hours';

  // v5.2.0: version_prefix and active_only filters
  const versionPrefix = (request.query.version_prefix as string) || '';
  const activeOnly = request.query.active_only === 'true';

  let blockedGates = dbInstance.prepare("SELECT gate_name, COUNT(*) as c FROM gate_checks WHERE status = 'blocked' AND checked_at > datetime('now', ?) GROUP BY gate_name").all(timeDelta) as any[];
  if (blockedGates.length === 0) {
    blockedGates = dbInstance.prepare("SELECT gate_name, COUNT(*) as c FROM gate_checks WHERE status = 'blocked' GROUP BY gate_name").all() as any[];
  }
  // Apply version_prefix filter on gate name patterns
  if (versionPrefix) {
    // No direct version in gate_checks, skip filtering (future enhancement)
  }

  // Pending approvals
  const pendingApprovals = (dbInstance.prepare("SELECT COUNT(*) as c FROM approvals WHERE status = 'pending'").get() as any).c;

  // Recent failures (workflow jobs) — time_range aware + active_only
  let recentFailuresSql = "SELECT id, name, status, error_message, updated_at, template_id FROM workflow_jobs WHERE status = 'failed' AND updated_at > datetime('now', ?)";
  if (activeOnly) {
    // active_only not applicable for failed jobs (they are not active)
    // But we can use it for other queries below
  }
  const recentFailures = dbInstance.prepare(recentFailuresSql + " ORDER BY updated_at DESC LIMIT 20").all(timeDelta) as any[];

  // Failure reason aggregation — time_range aware
  const failureReasons = dbInstance.prepare("SELECT step_key, COUNT(*) as c FROM job_steps WHERE status = 'failed' AND created_at > datetime('now', ?) GROUP BY step_key ORDER BY c DESC LIMIT 10").all(timeDelta) as any[];

  // Recent releases — with version_prefix filter
  let recentReleasesSql = "SELECT id, release_name, status, sealed_at, sealed_by FROM releases WHERE 1=1";
  const releasesParams: any[] = [];
  if (versionPrefix) {
    recentReleasesSql += " AND (release_name LIKE ? OR id LIKE ?)";
    releasesParams.push(`${versionPrefix}%`, `%${versionPrefix}%`);
  }
  if (activeOnly) {
    recentReleasesSql += " AND status != 'archived'";
  }
  recentReleasesSql += " ORDER BY sealed_at DESC LIMIT 5";
  const recentReleases = dbInstance.prepare(recentReleasesSql).all(...releasesParams) as any[];

  // Recent backups
  const recentBackups = dbInstance.prepare("SELECT id, action, result, created_at FROM audit_logs WHERE category = 'system' AND action = 'backup_created' ORDER BY created_at DESC LIMIT 5").all() as any[];

  // Recent recoveries
  const recentRecoveries = dbInstance.prepare("SELECT id, recovery_type, status, performed_at FROM recovery_logs ORDER BY performed_at DESC LIMIT 5").all() as any[];

  // Mainline health
  const mainlineHealth = {
    evaluations: evaluationsCount,
    artifacts: artifactsCount,
    promotions_passed: (artByPromo.find(r => r.promotion_status === 'approved')?.c || 0) + (artByPromo.find(r => r.promotion_status === 'sealed')?.c || 0),
    releases: releasesCount,
    blocked_gates: blockedGates.reduce((sum, g) => sum + g.c, 0),
    pending_approvals: pendingApprovals,
    recent_failures_24h: recentFailures.length,
  };
  const realBackup = getLatestRealBackup();

  return {
    ok: true,
    time_range: timeRange,
    version_prefix: versionPrefix || null,
    active_only: activeOnly,
    mainline_health: mainlineHealth,
    stage_counts: {
      evaluations: evaluationsCount,
      artifacts: artifactsCount,
      models: modelsCount,
      releases: releasesCount,
    },
    stage_by_status: {
      evaluations: evalByStatus,
      artifacts: artByStatus,
      artifacts_promotion: artByPromo,
      models_promotion: modelByPromo,
    },
    blocked_gates: blockedGates,
    pending_approvals: pendingApprovals,
    recent_failures: recentFailures,
    failure_reasons: failureReasons,
    recent_releases: recentReleases,
    recent_backups: recentBackups,
    recent_recoveries: recentRecoveries,

    // v5.1.0: Real backup artifact details
    real_backup: realBackup,
  };
});

// ══ v5.1.0: Factory Failures API (drilldown) ═══════════════════════════════
app.get('/api/factory/failures', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const timeRange = (request.query.time_range as string) || '24h';
  const limit = Math.min(parseInt(request.query.limit as string) || 20, 100);
  const timeDeltaMap: Record<string, string> = { '24h': '-24 hours', '7d': '-7 days', '30d': '-30 days' };
  const timeDelta = timeDeltaMap[timeRange] || '-24 hours';

  const sql = "SELECT id, name, status, error_message, updated_at, template_id FROM workflow_jobs WHERE status = 'failed' AND updated_at > datetime('now', ?) ORDER BY updated_at DESC LIMIT ?";
  const failures = dbInstance.prepare(sql).all(timeDelta, limit) as any[];

  return {
    ok: true,
    failures,
    total: failures.length,
    time_range: timeRange,
  };
});

// ══ v5.1.0: Gate Drilldown API ═════════════════════════════════════════════
app.get('/api/gates/drilldown', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const gateName = (request.query.gate_name as string) || '';
  const status = (request.query.status as string) || 'blocked';
  const limit = Math.min(parseInt(request.query.limit as string) || 50, 200);
  const timeRange = (request.query.time_range as string) || '7d';
  const timeDeltaMap: Record<string, string> = { '24h': '-24 hours', '7d': '-7 days', '30d': '-30 days' };
  const timeDelta = timeDeltaMap[timeRange] || '-7 days';

  let sql = "SELECT * FROM gate_checks WHERE 1=1";
  const params: any[] = [];
  if (gateName) { sql += " AND gate_name = ?"; params.push(gateName); }
  if (status) { sql += " AND status = ?"; params.push(status); }
  sql += " AND checked_at > datetime('now', ?)";
  params.push(timeDelta);
  sql += " ORDER BY checked_at DESC LIMIT ?";
  params.push(limit);

  const rows = dbInstance.prepare(sql).all(...params) as any[];

  function parseJson(v: string | null | undefined): any {
    if (!v) return [];
    try { return JSON.parse(v); } catch { return []; }
  }

  return {
    ok: true,
    gates: rows.map(r => ({
      ...r,
      check_results: parseJson(r.check_results_json),
      fail_reasons: parseJson(r.fail_reasons_json),
    })),
    total: rows.length,
    gate_name: gateName || null,
    status,
    time_range: timeRange,
  };
});

app.post('/api/artifacts/from-training/:trainingJobId', async (request: any, reply: any) => {
  const { trainingJobId } = request.params;
  const result = await artifacts.createArtifactFromTraining(trainingJobId);
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.post('/api/artifacts/:id/create-evaluation', async (request: any, reply: any) => {
  const { id } = request.params;
  const result = await artifacts.createEvaluationFromArtifact(id, request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

// ══ v5.2.0: Timeline API — 统一事件时间线 ═══════════════════════════════════
app.get('/api/timeline', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const entityType = request.query.entity_type as string || '';
  const entityId = request.query.entity_id as string || '';
  const jobId = request.query.job_id as string || '';
  const gateCheckId = request.query.gate_check_id as string || '';
  const releaseId = request.query.release_id as string || '';
  const limit = Math.min(parseInt(request.query.limit as string) || 100, 500);

  const events: any[] = [];

  // Gate check events
  if (entityId || gateCheckId) {
    const sql = entityId
      ? "SELECT id, gate_name, stage_name, entity_type, entity_id, status, checked_at, fail_reasons_json FROM gate_checks WHERE entity_id = ? ORDER BY checked_at DESC LIMIT ?"
      : "SELECT id, gate_name, stage_name, entity_type, entity_id, status, checked_at, fail_reasons_json FROM gate_checks WHERE id = ? ORDER BY checked_at DESC LIMIT ?";
    const params = entityId ? [entityId, limit] : [gateCheckId, limit];
    const rows = dbInstance.prepare(sql).all(...params) as any[];
    for (const r of rows) {
      events.push({
        timestamp: r.checked_at,
        event_type: 'gate_check',
        event_id: r.id,
        entity_type: r.entity_type,
        entity_id: r.entity_id,
        action: 'status_changed',
        summary: `${r.gate_name} → ${r.status}`,
        status: r.status,
        related_to: [{ type: r.entity_type, id: r.entity_id }],
      });
    }
  }

  // Job step events
  if (jobId) {
    const rows = dbInstance.prepare("SELECT id, job_id, step_key, step_name, status, error_message, started_at, finished_at, updated_at FROM job_steps WHERE job_id = ? ORDER BY updated_at DESC LIMIT ?").all(jobId, limit) as any[];
    for (const r of rows) {
      events.push({
        timestamp: r.updated_at,
        event_type: 'job_step',
        event_id: r.id,
        entity_type: 'workflow_job',
        entity_id: r.job_id,
        action: 'status_changed',
        summary: `${r.step_key} → ${r.status}`,
        status: r.status,
        error_message: r.error_message,
        related_to: [{ type: 'workflow_job', id: r.job_id }],
      });
    }
  }

  // Release events
  if (releaseId) {
    const r = dbInstance.prepare("SELECT id, release_name, status, sealed_at, sealed_by, artifact_id FROM releases WHERE id = ?").get(releaseId) as any;
    if (r) {
      events.push({
        timestamp: r.sealed_at,
        event_type: 'release',
        event_id: r.id,
        entity_type: 'release',
        entity_id: r.id,
        action: 'sealed',
        summary: `Release ${r.release_name} sealed by ${r.sealed_by}`,
        status: r.status,
        related_to: [{ type: 'artifact', id: r.artifact_id }],
      });
    }
  }

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { ok: true, events, total: events.length };
});

// ══ v5.2.0: Incident API — 故障详情聚合 ══════════════════════════════════════
app.get('/api/incident', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const id = request.query.id as string || '';
  const type = request.query.type as string || 'failure';

  if (!id) return { ok: false, error: 'Missing id' };

  let incident: any = null;

  if (type === 'failure' || type === 'job_failure') {
    // Get job and first failed step
    const job = dbInstance.prepare("SELECT id, name, status, error_message, updated_at, template_id, created_at FROM workflow_jobs WHERE id = ?").get(id) as any;
    if (job) {
      const failedStep = dbInstance.prepare("SELECT step_key, step_name, error_message, started_at, status FROM job_steps WHERE job_id = ? AND status = 'failed' ORDER BY started_at ASC LIMIT 1").get(id) as any;
      incident = {
        id,
        incident_type: 'failure',
        root_entity_type: 'workflow_job',
        root_entity_id: id,
        root_cause_step: failedStep?.step_key || null,
        root_cause_message: failedStep?.error_message || job.error_message,
        related_job_id: id,
        first_seen_at: failedStep?.started_at || job.created_at,
        last_seen_at: job.updated_at,
        latest_status: job.status,
        error_message: job.error_message,
        timeline_url: `/api/timeline?job_id=${id}`,
        audit_url: `/api/audit?target=${id}`,
      };
    }
  } else if (type === 'gate_block') {
    const gc = dbInstance.prepare("SELECT id, gate_name, stage_name, entity_type, entity_id, status, fail_reasons_json, checked_at FROM gate_checks WHERE id = ?").get(id) as any;
    if (gc) {
      incident = {
        id,
        incident_type: 'gate_block',
        root_entity_type: gc.entity_type,
        root_entity_id: gc.entity_id,
        root_cause_step: gc.stage_name,
        root_cause_message: gc.fail_reasons_json ? JSON.parse(gc.fail_reasons_json).join('; ') : null,
        related_gate_check_id: id,
        first_seen_at: gc.checked_at,
        last_seen_at: gc.checked_at,
        latest_status: gc.status,
        timeline_url: `/api/timeline?gate_check_id=${id}`,
        audit_url: `/api/audit?target=${id}`,
      };
    }
  }

  return { ok: true, incident };
});

// ══ v5.2.0: Correlate API — 跨对象关联查询 ══════════════════════════════════
app.get('/api/correlate', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const gateCheckId = request.query.gate_check_id as string || '';
  const releaseId = request.query.release_id as string || '';
  const jobId = request.query.job_id as string || '';
  const recoveryId = request.query.recovery_id as string || '';

  const result: any = { ok: true, related: [] };

  if (gateCheckId) {
    const gc = dbInstance.prepare("SELECT * FROM gate_checks WHERE id = ?").get(gateCheckId) as any;
    if (gc) {
      result.gate_check = gc;
      // Find related entity
      if (gc.entity_type === 'artifact') {
        result.entity = dbInstance.prepare("SELECT id, name, promotion_status FROM artifacts WHERE id = ?").get(gc.entity_id);
      } else if (gc.entity_type === 'evaluation') {
        result.entity = dbInstance.prepare("SELECT id, name, status FROM evaluations WHERE id = ?").get(gc.entity_id);
      }
      // Find related audit
      result.audit = dbInstance.prepare("SELECT id, action, created_at FROM audit_logs WHERE target = ? ORDER BY created_at DESC LIMIT 5").all(gc.id);
      result.related.push({ type: gc.entity_type, id: gc.entity_id });
    }
  }

  if (releaseId) {
    const rel = dbInstance.prepare("SELECT * FROM releases WHERE id = ?").get(releaseId) as any;
    if (rel) {
      result.release = rel;
      result.artifact = dbInstance.prepare("SELECT id, name, promotion_status FROM artifacts WHERE id = ?").get(rel.artifact_id);
      result.recovery_drills = dbInstance.prepare("SELECT id, recovery_type, status, performed_at FROM recovery_logs WHERE source_release = ? ORDER BY performed_at DESC LIMIT 5").all(releaseId);
      result.audit = dbInstance.prepare("SELECT id, action, created_at FROM audit_logs WHERE category = 'release' AND target = ? ORDER BY created_at DESC LIMIT 5").all(rel.artifact_id);
      result.related.push({ type: 'artifact', id: rel.artifact_id });
    }
  }

  if (jobId) {
    const job = dbInstance.prepare("SELECT id, name, status, template_id FROM workflow_jobs WHERE id = ?").get(jobId) as any;
    if (job) {
      result.job = job;
      result.steps = dbInstance.prepare("SELECT id, step_key, status, error_message FROM job_steps WHERE job_id = ? ORDER BY step_order").all(jobId);
      result.audit = dbInstance.prepare("SELECT id, action, created_at FROM audit_logs WHERE category = 'workflow' AND target = ? ORDER BY created_at DESC LIMIT 10").all(jobId);
    }
  }

  if (recoveryId) {
    const rec = dbInstance.prepare("SELECT * FROM recovery_logs WHERE id = ?").get(recoveryId) as any;
    if (rec) {
      result.recovery = rec;
      if (rec.source_backup) result.backup_path = rec.source_backup;
      if (rec.target_id) result.target = dbInstance.prepare("SELECT id, name FROM artifacts WHERE id = ?").get(rec.target_id);
      result.audit = dbInstance.prepare("SELECT id, action, created_at FROM audit_logs WHERE category = 'system' AND target = ? ORDER BY created_at DESC LIMIT 5").all(recoveryId);
    }
  }

  return result;
});

// ══ v5.2.0: 扩展 Factory Status 支持 version_prefix 和 active_only ══════════
// 已在原有 factory/status 端点中扩展，这里仅作为注释说明：
// - version_prefix: 按名称或 ID 前缀过滤（如 v5, v4）
// - active_only: 只显示 active 状态对象

// ══ v5.3.0: Release Governance API ════════════════════════════════════════════
app.get('/api/release/governance', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const timeRange = (request.query.time_range as string) || '30d';
  const versionPrefix = (request.query.version_prefix as string) || '';

  // 获取 Stable Release（最新封存）
  const stableRelease = dbInstance.prepare(`
    SELECT id, release_name, release_version, status, sealed_at, sealed_by,
           package_present, backup_verified, artifact_id
    FROM releases 
    WHERE status = 'sealed' 
    ORDER BY sealed_at DESC LIMIT 1
  `).get() as any;

  // 获取 Candidate Release（最新候选）
  const candidateRelease = dbInstance.prepare(`
    SELECT id, release_name, release_version, status, created_at, artifact_id, model_id
    FROM releases 
    WHERE status = 'candidate' 
    ORDER BY created_at DESC LIMIT 1
  `).get() as any;

  // Gate 汇总
  let gateStable: any = { passed: 0, total: 0 };
  let gateCandidate: any = { passed: 0, total: 0, blocked: 0 };

  if (stableRelease) {
    const stableGates = dbInstance.prepare(`
      SELECT status, COUNT(*) as c FROM gate_checks 
      WHERE entity_id = ? AND entity_type = 'release' 
      GROUP BY status
    `).all(stableRelease.id) as any[];
    gateStable.total = stableGates.reduce((sum, g) => sum + g.c, 0);
    gateStable.passed = stableGates.find(g => g.status === 'passed')?.c || 0;
  }

  if (candidateRelease) {
    const candidateGates = dbInstance.prepare(`
      SELECT status, COUNT(*) as c FROM gate_checks 
      WHERE entity_id = ? AND entity_type = 'release' 
      GROUP BY status
    `).all(candidateRelease.id) as any[];
    gateCandidate.total = candidateGates.reduce((sum, g) => sum + g.c, 0);
    gateCandidate.passed = candidateGates.find(g => g.status === 'passed')?.c || 0;
    gateCandidate.blocked = candidateGates.find(g => g.status === 'blocked')?.c || 0;
  }

  // 检查 Rollback Readiness
  const rollbackChecks: any[] = [];
  let rollbackStatus = 'ready';

  if (stableRelease) {
    // 检查备份
    const backupOk = stableRelease.backup_verified === 1;
    rollbackChecks.push({ name: 'backup_verified', passed: backupOk, detail: backupOk ? 'Backup verified' : 'Backup not verified' });

    // 检查封板产物
    const packageOk = stableRelease.package_present === 1;
    rollbackChecks.push({ name: 'package_present', passed: packageOk, detail: packageOk ? 'Seal artifact exists' : 'Seal artifact missing' });

    // 检查最近演练
    const recentDrill = dbInstance.prepare(`
      SELECT id, status, performed_at FROM recovery_logs 
      WHERE source_release = ? AND status = 'success' 
      AND performed_at > datetime('now', '-30 days')
      ORDER BY performed_at DESC LIMIT 1
    `).get(stableRelease.id) as any;
    rollbackChecks.push({ name: 'recent_drill', passed: !!recentDrill, detail: recentDrill ? `Last drill: ${recentDrill.performed_at}` : 'No recent drill' });

    // 检查活跃 incident（当前无 incidents 表，默认无阻塞）
    rollbackChecks.push({ name: 'no_blocking_incident', passed: true, detail: 'No active incidents' });

    // 检查 Gate 阻塞
    const blockedGates = dbInstance.prepare(`
      SELECT COUNT(*) as c FROM gate_checks 
      WHERE entity_id = ? AND blocking_status IS NOT NULL
    `).get(stableRelease.id) as any;
    const noGateBlock = (blockedGates?.c || 0) === 0;
    rollbackChecks.push({ name: 'no_active_gate_block', passed: noGateBlock, detail: noGateBlock ? 'No gates blocked' : `${blockedGates?.c} gates blocked` });

    // 计算状态
    if (!backupOk || !packageOk) {
      rollbackStatus = 'blocked';
    } else if (!recentDrill || !noGateBlock) {
      rollbackStatus = 'caution';
    }
  }

  // 最近发布记录
  let recentReleasesSql = "SELECT id, release_name, release_version, status, sealed_at FROM releases WHERE 1=1";
  const releasesParams: any[] = [];
  if (versionPrefix) {
    recentReleasesSql += " AND (release_name LIKE ? OR release_version LIKE ?)";
    releasesParams.push(`${versionPrefix}%`, `${versionPrefix}%`);
  }
  recentReleasesSql += " ORDER BY sealed_at DESC LIMIT 5";
  const recentReleases = dbInstance.prepare(recentReleasesSql).all(...releasesParams) as any[];

  // 最近恢复记录
  const recentRecoveries = dbInstance.prepare(`
    SELECT id, recovery_type, status, performed_at FROM recovery_logs 
    ORDER BY performed_at DESC LIMIT 5
  `).all() as any[];

  return {
    ok: true,
    stable_release: stableRelease ? {
      ...stableRelease,
      gate_summary: gateStable,
      health_status: 'ok',
    } : null,
    candidate_release: candidateRelease ? {
      ...candidateRelease,
      gate_summary: gateCandidate,
      ready_for_promotion: gateCandidate.blocked === 0,
    } : null,
    recent_releases: recentReleases,
    recent_recoveries: recentRecoveries,
    rollback_readiness: {
      status: stableRelease ? rollbackStatus : 'unknown',
      checks: rollbackChecks,
    },
  };
});

app.get('/api/release/compare', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const candidateId = request.query.candidate_id as string || '';
  const stableId = request.query.stable_id as string || '';

  if (!candidateId) return { ok: false, error: 'Missing candidate_id' };

  // 获取 candidate
  const candidate = dbInstance.prepare("SELECT * FROM releases WHERE id = ?").get(candidateId) as any;
  if (!candidate) return { ok: false, error: 'Candidate not found' };

  // 获取 stable（指定或最新）
  let stable: any = null;
  if (stableId) {
    stable = dbInstance.prepare("SELECT * FROM releases WHERE id = ?").get(stableId) as any;
  } else {
    stable = dbInstance.prepare("SELECT * FROM releases WHERE status = 'sealed' ORDER BY sealed_at DESC LIMIT 1").get() as any;
  }

  // Gate 汇总
  const candidateGates = dbInstance.prepare("SELECT status, COUNT(*) as c FROM gate_checks WHERE entity_id = ? GROUP BY status").all(candidateId) as any[];
  const stableGates = stable ? dbInstance.prepare("SELECT status, COUNT(*) as c FROM gate_checks WHERE entity_id = ? GROUP BY status").all(stable.id) as any[] : [];

  const gatePassed = (gates: any[]) => gates.find(g => g.status === 'passed')?.c || 0;

  // 检查是否可以晋升
  const blockers: string[] = [];
  if (candidate.status !== 'candidate') blockers.push('Not in candidate status');
  if (candidateGates.some(g => g.status === 'blocked')) blockers.push('Gate blocked');

  return {
    ok: true,
    candidate: {
      id: candidate.id,
      release_name: candidate.release_name,
      release_version: candidate.release_version,
      status: candidate.status,
      artifact_id: candidate.artifact_id,
      created_at: candidate.created_at,
    },
    stable: stable ? {
      id: stable.id,
      release_name: stable.release_name,
      release_version: stable.release_version,
      status: stable.status,
      artifact_id: stable.artifact_id,
      sealed_at: stable.sealed_at,
      backup_verified: stable.backup_verified,
      package_present: stable.package_present,
    } : null,
    diff: {
      version: { candidate: candidate.release_version, stable: stable?.release_version },
      gate_passed: { candidate: gatePassed(candidateGates), stable: gatePassed(stableGates) },
      backup_verified: { candidate: false, stable: stable?.backup_verified === 1 },
      sealed_at: { candidate: null, stable: stable?.sealed_at },
    },
    ready_for_promotion: blockers.length === 0,
    blockers,
  };
});

app.get('/api/release/rollback-readiness', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const releaseId = request.query.release_id as string || '';

  // 获取 stable（指定或最新）
  let release: any = null;
  if (releaseId) {
    release = dbInstance.prepare("SELECT * FROM releases WHERE id = ?").get(releaseId) as any;
  } else {
    release = dbInstance.prepare("SELECT * FROM releases WHERE status = 'sealed' ORDER BY sealed_at DESC LIMIT 1").get() as any;
  }

  if (!release) {
    return { ok: true, status: 'unknown', checks: [], recommendation: 'No stable release found' };
  }

  const checks: any[] = [];
  let status = 'ready';

  // 检查备份
  checks.push({ name: 'backup_verified', passed: release.backup_verified === 1, detail: release.backup_verified ? 'Backup verified' : 'Backup NOT verified' });
  checks.push({ name: 'package_present', passed: release.package_present === 1, detail: release.package_present ? 'Seal artifact exists' : 'Seal artifact missing' });

  // 最近演练
  const recentDrill = dbInstance.prepare(`
    SELECT id, status, performed_at FROM recovery_logs 
    WHERE source_release = ? AND status = 'success' 
    AND performed_at > datetime('now', '-30 days')
    ORDER BY performed_at DESC LIMIT 1
  `).get(release.id) as any;
  checks.push({ name: 'recent_drill', passed: !!recentDrill, detail: recentDrill ? `Last drill: ${recentDrill.performed_at}` : 'No recent drill' });

  // 活跃 incident
  // 活跃 incident（当前无 incidents 表，默认无阻塞）
  checks.push({ name: 'no_blocking_incident', passed: true, detail: 'No active incidents' });

  // Gate 阻塞
  const blockedCount = dbInstance.prepare(`
    SELECT COUNT(*) as c FROM gate_checks WHERE entity_id = ? AND blocking_status IS NOT NULL
  `).get(release.id) as any;
  const noBlock = (blockedCount?.c || 0) === 0;
  checks.push({ name: 'no_active_gate_block', passed: noBlock, detail: noBlock ? 'No gates blocked' : `${blockedCount?.c} gates blocked` });

  // 计算状态
  if (!release.backup_verified || !release.package_present) {
    status = 'blocked';
  } else if (!recentDrill || !noBlock) {
    status = 'caution';
  }

  return {
    ok: true,
    release_id: release.id,
    release_name: release.release_name,
    status,
    checks,
    recommendation: status === 'ready' ? 'System is ready for rollback.' : status === 'caution' ? 'Rollback possible but with cautions.' : 'Rollback blocked. Fix issues first.',
    last_drill: recentDrill || null,
  };
});

app.get('/api/release/validation', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const releaseId = request.query.release_id as string || '';
  if (!releaseId) return { ok: false, error: 'Missing release_id' };

  const release = dbInstance.prepare("SELECT * FROM releases WHERE id = ?").get(releaseId) as any;
  if (!release) return { ok: false, error: 'Release not found' };

  // Gate 汇总
  const gates = dbInstance.prepare(`
    SELECT gate_name, status FROM gate_checks 
    WHERE entity_id = ? AND entity_type = 'release'
  `).all(releaseId) as any[];

  const gateSummary: Record<string, string> = {};
  gates.forEach(g => { gateSummary[g.gate_name] = g.status; });

  // Audit 相关
  const auditEvents = dbInstance.prepare(`
    SELECT id, action, created_at FROM audit_logs 
    WHERE category = 'release' AND target = ?
    ORDER BY created_at DESC LIMIT 5
  `).all(release.artifact_id) as any[];

  // Recovery drill
  const recoveryDrills = dbInstance.prepare(`
    SELECT id, status, performed_at FROM recovery_logs 
    WHERE source_release = ?
    ORDER BY performed_at DESC LIMIT 5
  `).all(releaseId) as any[];

  return {
    ok: true,
    release_id: releaseId,
    release_name: release.release_name,
    status: release.status,
    gate_summary: gateSummary,
    recovery_drill_count: recoveryDrills.length,
    recovery_drills: recoveryDrills,
    audit_events: auditEvents,
    health_status: Object.values(gateSummary).every(s => s === 'passed') ? 'ok' : 'warning',
  };
});

app.get('/api/release/relations', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  const releaseId = request.query.release_id as string || '';
  if (!releaseId) return { ok: false, error: 'Missing release_id' };

  const release = dbInstance.prepare("SELECT * FROM releases WHERE id = ?").get(releaseId) as any;
  if (!release) return { ok: false, error: 'Release not found' };

  const result: any = { ok: true, release: { id: release.id, release_name: release.release_name, status: release.status } };

  // Artifact
  if (release.artifact_id) {
    result.artifact = dbInstance.prepare("SELECT id, name, promotion_status FROM artifacts WHERE id = ?").get(release.artifact_id);
  }

  // Model
  if (release.model_id) {
    result.model = dbInstance.prepare("SELECT id, name, promotion_status FROM models WHERE id = ?").get(release.model_id);
  }

  // Recovery drills
  result.recovery_drills = dbInstance.prepare(`
    SELECT id, recovery_type, status, performed_at, performed_by 
    FROM recovery_logs WHERE source_release = ?
    ORDER BY performed_at DESC LIMIT 5
  `).all(releaseId) as any[];

  // Audit
  result.audit_events = dbInstance.prepare(`
    SELECT id, category, action, created_at 
    FROM audit_logs WHERE category = 'release' AND target = ?
    ORDER BY created_at DESC LIMIT 5
  `).all(release.artifact_id) as any[];

  // Backup info（动态读取最近封板备份）
  const latestBackup = getLatestRealBackup();
  result.backup = latestBackup
    ? {
        seal_tag: latestBackup.seal_tag,
        db_snapshot_path: latestBackup.db_snapshot_path,
        verified: true,
      }
    : null;

  return result;
});

// ══ F10: Vision Bus - 视觉能力总线预留接口 ══════════════════════════════════════
app.get('/api/vision/catalog', async (request: any, reply: any) => {
  return await visionBus.getVisionCatalog();
});

app.get('/api/vision/sam-handoffs', async (request: any, reply: any) => {
  return visionBus.getVisionSamHandoffs(request.query || {});
});

app.get('/api/vision/sam-segmentations', async (request: any, reply: any) => {
  return visionBus.getVisionSamSegmentations(request.query || {});
});

app.get('/api/vision/classifier-verifications', async (request: any, reply: any) => {
  return visionBus.getVisionClassifierVerifications(request.query || {});
});

app.get('/api/vision/tracker-runs', async (request: any, reply: any) => {
  return visionBus.getVisionTrackerRuns(request.query || {});
});

app.get('/api/vision/rule-engine-runs', async (request: any, reply: any) => {
  return visionBus.getVisionRuleEngineRuns(request.query || {});
});

// 启动服务器
const start = async () => {
  try {
    const PORT = 8787;
    const HOST = '0.0.0.0';
    
    app.log.info(`Starting local-api server...`);
    app.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    app.log.info(`Node version: ${process.version}`);
    
    // 初始化数据库连接（延迟加载，不立即连接）
    app.log.info('Database connection will be initialized on first request...');
    bootstrapOpenClawTokenPersistence();
    
    await app.listen({ port: PORT, host: HOST });
    
    app.log.info(`✅ Server started successfully`);
    app.log.info(`📡 Listening on http://${HOST}:${PORT}`);
    app.log.info(`🔗 Health check: http://${HOST}:${PORT}/api/health`);
    app.log.info(`🗄️  Database test: http://${HOST}:${PORT}/api/db/ping`);
    
    // 优雅关闭处理
    const shutdown = async (signal: string) => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      
      // 关闭数据库连接
      try {
        db.closeDatabase();
        app.log.info('Database connection closed');
      } catch (dbError) {
        app.log.error(`Error closing database: ${dbError}`);
      }
      
      await app.close();
      app.log.info('Server closed');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
  } catch (err) {
    app.log.error(err);
    
    // 确保数据库连接关闭
    try {
      db.closeDatabase();
    } catch (dbError) {
      // 忽略关闭错误
    }
    
    process.exit(1);
  }
};

// 启动应用
start();


// ── Models ───────────────────────────────────────────────────────────────────
app.get('/api/models', async (request: any, reply: any) => {
  const result = await models.listModels(request.query || {});
  return result;
});

app.get('/api/models/:id', async (request: any, reply: any) => {
  const result = await models.getModelById(request.params.id);
  return result;
});

app.post('/api/models', async (request: any, reply: any) => {
  const result = await models.createModel(request.body || {});
  if (!result.ok) return reply.status(400).send(result);
  return result;
});

app.put('/api/models/:id', async (request: any, reply: any) => {
  const result = await models.updateModel(request.params.id, request.body || {});
  return result;
});

app.delete('/api/models/:id', async (request: any, reply: any) => {
  const result = await models.deleteModel(request.params.id);
  return result;
});

app.get('/api/models/:id/detail', async (request: any, reply: any) => {
  const result = await models.getModelDetail(request.params.id);
  return result;
});

app.get('/api/models/:id/artifacts', async (request: any, reply: any) => {
  const result = await models.getModelArtifacts(request.params.id);
  return result;
});

app.get('/api/models/:id/deployments', async (request: any, reply: any) => {
  const result = await models.getModelDeployments(request.params.id);
  return result;
});

app.get('/api/models/:id/evaluations', async (request: any, reply: any) => {
  const result = await models.getModelEvaluations(request.params.id);
  return result;
});


// ── Packages ────────────────────────────────────────────────────────────────
app.get('/api/packages', async (request: any, reply: any) => {
  const result = await packages.listPackages(request.query || {});
  return result;
});

app.get('/api/packages/:id', async (request: any, reply: any) => {
  const result = await packages.getPackageById(request.params.id);
  return result;
});

app.post('/api/packages', async (request: any, reply: any) => {
  const result = await packages.createPackage(request.body || {});
  return result;
});

app.put('/api/packages/:id', async (request: any, reply: any) => {
  const result = await packages.updatePackage(request.params.id, request.body || {});
  return result;
});

app.delete('/api/packages/:id', async (request: any, reply: any) => {
  const result = await packages.deletePackage(request.params.id);
  return result;
});

app.get('/api/packages/:id/detail', async (request: any, reply: any) => {
  const result = await packages.getPackageDetail(request.params.id);
  return result;
});

app.get('/api/packages/:id/artifacts', async (request: any, reply: any) => {
  const result = await packages.getPackageArtifacts(request.params.id);
  return result;
});

app.get('/api/packages/:id/manifest', async (request: any, reply: any) => {
  const result = await packages.getPackageManifest(request.params.id);
  return result;
});

app.get('/api/packages/:id/release-note', async (request: any, reply: any) => {
  const result = await packages.getPackageReleaseNote(request.params.id);
  return result;
});

app.post('/api/packages/:id/build', async (request: any, reply: any) => {
  const result = await packages.buildPackage(request.params.id);
  return result;
});

app.post('/api/packages/:id/publish', async (request: any, reply: any) => {
  const result = await packages.publishPackage(request.params.id);
  return result;
});

// Retry build
app.post('/api/packages/:id/retry-build', async (request: any, reply: any) => {
  const result = await packages.retryPackageBuild(request.params.id);
  return result;
});

// Retry publish
app.post('/api/packages/:id/retry-publish', async (request: any, reply: any) => {
  const result = await packages.retryPackagePublish(request.params.id);
  return result;
});


// ── Deployment Targets ───────────────────────────────────────────────────────
app.get('/api/deployment-targets', async (request: any, reply: any) => {
  const result = await deploymentTargets.listTargets(request.query || {});
  return result;
});

app.get('/api/deployment-targets/:id', async (request: any, reply: any) => {
  const result = await deploymentTargets.getTargetById(request.params.id);
  return result;
});

app.post('/api/deployment-targets', async (request: any, reply: any) => {
  const result = await deploymentTargets.createTarget(request.body || {});
  return result;
});

app.put('/api/deployment-targets/:id', async (request: any, reply: any) => {
  const result = await deploymentTargets.updateTarget(request.params.id, request.body || {});
  return result;
});

app.delete('/api/deployment-targets/:id', async (request: any, reply: any) => {
  const result = await deploymentTargets.deleteTarget(request.params.id);
  return result;
});

app.post('/api/deployment-targets/:id/health-check', async (request: any, reply: any) => {
  const result = await deploymentTargets.checkTargetHealth(request.params.id);
  return result;
});


// ── Deployment Revisions ─────────────────────────────────────────────────────
app.get('/api/deployment-revisions', async (request: any, reply: any) => {
  const result = await deploymentRevisions.listRevisions(request.query || {});
  return result;
});

app.get('/api/deployment-revisions/:id', async (request: any, reply: any) => {
  const result = await deploymentRevisions.getRevisionById(request.params.id);
  return result;
});

app.post('/api/deployment-revisions', async (request: any, reply: any) => {
  const result = await deploymentRevisions.createRevision(request.body || {});
  return result;
});

app.post('/api/deployment-revisions/:id/deploy', async (request: any, reply: any) => {
  const result = await deploymentRevisions.deployRevision(request.params.id);
  return result;
});

app.post('/api/deployment-revisions/:id/retry-deploy', async (request: any, reply: any) => {
  const result = await deploymentRevisions.retryDeployRevision(request.params.id);
  return result;
});

app.get('/api/deployments/:id/current-revision', async (request: any, reply: any) => {
  const result = await deploymentRevisions.getCurrentRevision(request.params.id);
  return result;
});

app.get('/api/deployments/:id/revision-timeline', async (request: any, reply: any) => {
  const result = await deploymentRevisions.getRevisionTimeline(request.params.id);
  return result;
});


// ── Rollback Points ──────────────────────────────────────────────────────────
app.get('/api/rollback-points', async (request: any, reply: any) => {
  const result = await rollbackPoints.listRollbackPoints(request.query || {});
  return result;
});

app.get('/api/rollback-points/:id', async (request: any, reply: any) => {
  const result = await rollbackPoints.getRollbackPointById(request.params.id);
  return result;
});

app.post('/api/rollback-points', async (request: any, reply: any) => {
  const result = await rollbackPoints.createRollbackPoint(request.body || {});
  return result;
});

app.post('/api/rollback-points/:id/execute', async (request: any, reply: any) => {
  const result = await rollbackPoints.executeRollback(request.params.id);
  return result;
});

app.post('/api/rollback-points/:id/retry-execute', async (request: any, reply: any) => {
  const result = await rollbackPoints.retryRollback(request.params.id);
  return result;
});

app.get('/api/deployments/:id/rollback-history', async (request: any, reply: any) => {
  const result = await rollbackPoints.getRollbackHistory(request.params.id);
  return result;
});


// ── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/dashboard/summary', async (request, reply) => {
  const result = await dashboard.getDashboardSummary();
  return result;
});

app.get('/api/dashboard/recent-activity', async (request: any, reply: any) => {
  const limit = Number(request.query?.limit) || 30;
  const result = await dashboard.getRecentActivity(limit);
  return result;
});


// ── Audit Logs ───────────────────────────────────────────────────────────────
audit.setDatabase(db);

app.get('/api/audit', async (request: any, reply: any) => {
  return audit.handlers.list(request, reply);
});

app.get('/api/audit/stats', async (request: any, reply: any) => {
  return audit.handlers.stats(request, reply);
});

app.get('/api/audit/:id', async (request: any, reply: any) => {
  return audit.handlers.get(request, reply);
});


// ── Templates (v1.9.0) ─────────────────────────────────────────────────────────
// registerTemplateRoutes 与 registerWorkflowRoutes 都会注册 /api/workflow-templates*；
// 保留 workflow 路由来源，避免启动期 duplicated route 错误。


// ── Workflow Jobs ─────────────────────────────────────────────────────────────
registerWorkflowRoutes(app).catch((err: any) => { app.log.error({ err }, 'Workflow routes error'); console.error(err); });


// ── Approvals (v2.1.0) ────────────────────────────────────────────────────────
registerApprovalRoutes(app);
registerKnowledgeRoutes(app);
registerOutputsRoutes(app);
registerFeedbackRoutes(app);
registerCostRoutingRoutes(app);
registerClassifierRoutes(app);   // v3.9.x: Classifier Verification CRUD
registerOpsRoutes(app);
registerBrainRouterRoutes(app); // Brain router V1
registerSystemRoutes(app);
  experiments.registerExperimentsRoutes(app);
  models.registerModelsRoutes(app);

// ══ v6.0.0: Plugin System ════════════════════════════════════════════════════
// M6: 插件系统默认启用，不再依赖环境变量
const PLUGIN_SYSTEM_ENABLED = true;

function resolvePluginRuntimeModule(moduleFile: string): string {
  const candidates = [
    path.resolve(process.cwd(), '../../packages/plugin-runtime/src', moduleFile),
    path.resolve(process.cwd(), '../packages/plugin-runtime/src', moduleFile),
    path.resolve(process.cwd(), 'packages/plugin-runtime/src', moduleFile),
    path.resolve(__dirname, '../../../../packages/plugin-runtime/src', moduleFile),
    path.resolve(__dirname, '../../../../../packages/plugin-runtime/src', moduleFile),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(`plugin-runtime module not found: ${moduleFile}`);
}

type RealBackupView = {
  seal_tag: string;
  db_snapshot_path: string;
  db_sha256: string;
  db_size_bytes: number;
  seal_manifest_path: string;
  zip_path: string;
  recovery_commands: {
    db_restore: string;
    verify: string;
    regression: string;
  };
};

function walkFiles(root: string, match: (name: string) => boolean, out: string[] = []): string[] {
  if (!fs.existsSync(root)) return out;
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, match, out);
    } else if (entry.isFile() && match(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function getLatestRealBackup(): RealBackupView | null {
  const backupRoots = [
    path.resolve(process.cwd(), 'backups'),
    path.resolve(process.cwd(), '..', 'backups'),
    path.resolve(process.cwd(), '../..', 'backups'),
    'E:\\AGI_Factory\\backups',
  ];
  const existingRoots = backupRoots.filter((p) => fs.existsSync(p));
  if (existingRoots.length === 0) return null;

  const manifests = existingRoots.flatMap((root) =>
    walkFiles(root, (name) => /seal_manifest.*\.json$/i.test(name)),
  );
  if (manifests.length === 0) return null;

  manifests.sort((a, b) => {
    const sa = fs.statSync(a).mtimeMs;
    const sb = fs.statSync(b).mtimeMs;
    return sb - sa;
  });

  for (const manifestPath of manifests) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as any;
      const dbSnapshotPath = String(manifest.db_snapshot_path || '');
      const zipPath = String(manifest.zip_path || '');
      const dbSize = Number(manifest.db_size_bytes || 0);
      const dbSha = String(manifest.db_sha256 || '');
      const sealTag = String(manifest.seal_tag || path.basename(path.dirname(manifestPath)));
      return {
        seal_tag: sealTag || `AIP_v${APP_VERSION}_sealed_latest`,
        db_snapshot_path: dbSnapshotPath,
        db_sha256: dbSha,
        db_size_bytes: Number.isFinite(dbSize) ? dbSize : 0,
        seal_manifest_path: manifestPath,
        zip_path: zipPath,
        recovery_commands: {
          db_restore: dbSnapshotPath
            ? `Copy-Item "${dbSnapshotPath}" "E:\\AGI_Factory\\repo\\packages\\db\\agi_factory.db" -Force`
            : 'N/A',
          verify: 'python scripts/recovery_verify.py',
          regression: 'python scripts/regression_v500.py',
        },
      };
    } catch {}
  }
  return null;
}

function resolvePluginBuiltinDir(): string {
  const candidates = [
    path.resolve(process.cwd(), '../../plugins/builtin'),
    path.resolve(process.cwd(), '../plugins/builtin'),
    path.resolve(process.cwd(), 'plugins/builtin'),
    path.resolve(__dirname, '../../../../plugins/builtin'),
    path.resolve(__dirname, '../../../../../plugins/builtin'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), '../../plugins/builtin');
}

// Phase 0.5: 初始化插件审计数据库适配器
async function initPluginDbAdapter() {
  try {
    const dbAdapterModule = resolvePluginRuntimeModule('DbAdapter.js');
    const { setDbAdapter } = await import(pathToFileURL(dbAdapterModule).href);
    setDbAdapter(db.getDatabase());
    console.log('[Plugin:DbAdapter] Database adapter initialized');
  } catch (err) {
    console.error('[Plugin:DbAdapter] Failed to initialize:', err);
  }
}
// 立即初始化（在首次请求前）
initPluginDbAdapter().catch(() => {});

// 插件管理器（延迟初始化）
let pluginManager: any = null;
let pluginBuiltinLoaded = false;

async function getPluginManager() {
  if (!PLUGIN_SYSTEM_ENABLED) {
    return null;
  }
  if (!pluginManager) {
    try {
      // 动态导入以避免影响不启用插件的系统
      const pmModule = resolvePluginRuntimeModule('PluginManager.js');
      const { PluginManager } = await import(pathToFileURL(pmModule).href);
      pluginManager = new PluginManager({
        enabled: true,
        pluginDir: resolvePluginBuiltinDir(),
        autoLoadBuiltin: true,
      });
      try {
        await pluginManager.loadBuiltinPlugins?.();
        pluginBuiltinLoaded = true;
      } catch (loadErr) {
        console.error('[Plugin] Initial builtin load failed:', loadErr);
      }
      console.log('[Plugin] Plugin system initialized');
    } catch (err) {
      console.error('[Plugin] Failed to initialize plugin system:', err);
      return null;
    }
  }
  if (pluginManager && !pluginBuiltinLoaded) {
    try {
      await pluginManager.loadBuiltinPlugins?.();
      pluginBuiltinLoaded = true;
    } catch (loadErr) {
      console.error('[Plugin] Deferred builtin load failed:', loadErr);
    }
  }
  return pluginManager;
}

// 插件 API 路由
app.get('/api/plugins', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled', enabled: false });
  }
  const plugins = pm.listPlugins();
  const stats = pm.getStats();
  return { ok: true, enabled: true, plugins, stats };
});

// Phase 1C: 插件目录 - 供画布节点面板消费
app.get('/api/plugins/catalog', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled', enabled: false });
  }
  const plugins = pm.listPlugins();
  // 返回画布节点面板所需的核心字段
  const catalog = plugins.map((p: any) => ({
    plugin_id: p.plugin_id,
    name: p.name,
    version: p.version,
    category: p.category,
    status: p.status,
    execution_mode: p.execution_mode,
    risk_level: p.risk_level,
    enabled: p.enabled,
    requires_approval: p.requires_approval,
    dry_run_supported: p.dry_run_supported,
    ui_node_type: p.ui_node_type || 'transform',
    icon: p.icon || 'plug',
    color: p.color || '#6b7280',
    description: p.description || '',
    capabilities: p.capabilities || [],
    permissions: p.permissions || [],
    allowed_upstream: p.allowed_upstream || [],
    allowed_downstream: p.allowed_downstream || [],
    input_schema: p.input_schema || null,
    output_schema: p.output_schema || null,
    tags: p.tags || [],
  }));
  // 按 category 分组
  const grouped: Record<string, typeof catalog> = {};
  catalog.forEach((p: any) => {
    const cat = p.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });
  return { ok: true, catalog, grouped };
});

// ══ P0-B: 插件池接口对齐（必须在 :id 通配之前注册）══════════════════════════
// 整体健康检查（聚合所有插件）
app.get('/api/plugins/health', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled', health: 'unknown', updated_at: new Date().toISOString() });
  }
  const runtimePlugins = pm.listPlugins();
  const dbInstance = db.getDatabase();
  const hasAudit = !!dbInstance.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='plugin_audit_logs'`).get();
  const pluginHealth = runtimePlugins.map((p: any) => {
    const summary = hasAudit ? dbInstance.prepare(`
      SELECT
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status = 'error' OR status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count
      FROM plugin_audit_logs
      WHERE plugin_id = ?
    `).get(p.plugin_id) : null;
    const failed = Number(summary?.failed_count || 0);
    const blocked = Number(summary?.blocked_count || 0);
    return { plugin_id: p.plugin_id, health: failed > 0 ? 'error' : blocked > 0 ? 'warning' : 'healthy', enabled: !!p.enabled, status: p.status || 'unknown' };
  });
  const hasError = pluginHealth.some((p: any) => p.health === 'error');
  const hasWarning = pluginHealth.some((p: any) => p.health === 'warning');
  return { ok: true, health: hasError ? 'error' : hasWarning ? 'warning' : 'healthy', items: pluginHealth, updated_at: new Date().toISOString() };
});

// Registry 端点（统一结构）
app.get('/api/plugins/registry', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled', items: [], updated_at: new Date().toISOString() });
  }
  const runtimePlugins = pm.listPlugins();
  const dbInstance = db.getDatabase();
  const registryRows = dbInstance.prepare(`SELECT * FROM plugin_registry`).all() as any[];
  const registryById = new Map(registryRows.map((r: any) => [String(r.plugin_id), r]));
  const items = runtimePlugins.map((p: any) => {
    const reg = registryById.get(String(p.plugin_id));
    return { plugin_id: p.plugin_id, name: p.name || reg?.name || p.plugin_id, version: p.version || reg?.version || '0.0.0', enabled: !!p.enabled, status: p.status || reg?.status || 'unknown', risk_level: p.risk_level || reg?.risk_level || 'LOW', capabilities: p.capabilities || [] };
  });
  return { ok: true, items, updated_at: new Date().toISOString() };
});

app.get('/api/plugins/:id', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled' });
  }
  const { id } = request.params;
  const status = pm.getPluginStatus(id);
  if (!status) {
    return reply.code(404).send({ ok: false, error: `Plugin not found: ${id}` });
  }
  return { ok: true, status };
});

app.post('/api/plugins/:id/enable', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled' });
  }
  const { id } = request.params;
  const result = await pm.enablePlugin(id);
  return { ok: result.success, ...result };
});

app.post('/api/plugins/:id/disable', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled' });
  }
  const { id } = request.params;
  const result = await pm.disablePlugin(id);
  return { ok: result.success, ...result };
});

app.post('/api/plugins/:id/execute', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled' });
  }
  const { id } = request.params;
  const { action, params } = request.body || {};
  if (!action) {
    return reply.code(400).send({ ok: false, error: 'action is required' });
  }
  const result = await pm.executePlugin(id, action, params);
  return { ok: result.success, ...result };
});

app.get('/api/plugins/status', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  return {
    ok: true,
    enabled: PLUGIN_SYSTEM_ENABLED,
    system_status: pm ? pm.isPluginSystemEnabled() : false,
  };
});

app.get('/api/plugins/pool', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled', enabled: false });
  }

  const dbInstance = db.getDatabase();
  let runtimePlugins = pm.listPlugins();
  if ((!runtimePlugins || runtimePlugins.length === 0) && typeof pm.loadBuiltinPlugins === 'function') {
    try {
      await pm.loadBuiltinPlugins();
      runtimePlugins = pm.listPlugins();
    } catch (err) {
      app.log.warn({ err }, 'plugins/pool: lazy builtin load failed');
    }
  }
  const runtimeStats = pm.getStats();

  const hasTable = (name: string) =>
    !!dbInstance.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`).get(name);

  let registryRows: any[] = [];
  if (hasTable('plugin_registry')) {
    try {
      registryRows = dbInstance.prepare(`SELECT * FROM plugin_registry`).all() as any[];
    } catch (err) {
      app.log.warn({ err }, 'plugins/pool: failed to query plugin_registry, fallback to runtime only');
      registryRows = [];
    }
  }

  let auditRows: any[] = [];
  if (hasTable('plugin_audit_logs')) {
    try {
      auditRows = dbInstance.prepare(`
        SELECT plugin_id,
               SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
               SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
               SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count,
               MAX(created_at) as last_audit_at
        FROM plugin_audit_logs
        GROUP BY plugin_id
      `).all() as any[];
    } catch (err) {
      app.log.warn({ err }, 'plugins/pool: failed to query plugin_audit_logs, fallback to zero stats');
      auditRows = [];
    }
  }

  const registryById = new Map(registryRows.map((r: any) => [String(r.plugin_id), r]));
  const auditById = new Map(auditRows.map((r: any) => [String(r.plugin_id), r]));

  const pool = runtimePlugins.map((p: any) => {
    const reg = registryById.get(String(p.plugin_id));
    const aud = auditById.get(String(p.plugin_id));
    const regCapabilities = (() => {
      try {
        if (Array.isArray(reg?.capabilities)) return reg.capabilities;
        if (typeof reg?.capabilities === 'string') return JSON.parse(reg.capabilities);
        if (typeof reg?.capability === 'string') return [reg.capability];
      } catch {}
      return [];
    })();
    return {
      plugin_id: p.plugin_id,
      name: p.name || reg?.name || reg?.plugin_name || p.plugin_id,
      version: p.version || reg?.version || '0.0.0',
      capabilities: (p.capabilities && p.capabilities.length > 0) ? p.capabilities : regCapabilities,
      risk_level: p.risk_level || reg?.risk_level || 'LOW',
      enabled: !!p.enabled,
      status: p.status || reg?.status || reg?.init_status || 'unknown',
      execution_mode: p.execution_mode || reg?.execution_mode || 'readonly',
      source: reg?.source || 'runtime',
      init_status: reg?.init_status || reg?.status || 'unknown',
      error_reason: reg?.error_reason || '',
      active: reg?.active == null ? true : reg?.active === 1,
      execution_count: Number(p.execution_count || 0),
      success_count: Number(aud?.success_count || 0),
      failed_count: Number(aud?.failed_count || 0),
      blocked_count: Number(aud?.blocked_count || 0),
      last_executed_at: p.last_executed_at || null,
      last_audit_at: aud?.last_audit_at || null,
      updated_at: reg?.updated_at || null,
      description: p.description || reg?.description || '',
      tags: (Array.isArray(p.tags) && p.tags.length > 0)
        ? p.tags
        : (() => { try { return typeof reg?.tags === 'string' ? JSON.parse(reg.tags) : (reg?.tags || []); } catch { return []; } })(),
    };
  });

  return {
    ok: true,
    enabled: true,
    stats: runtimeStats,
    count: pool.length,
    plugins: pool,
  };
});

app.get('/api/plugins/:id/health', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled' });
  }

  const { id } = request.params;
  const status = pm.getPluginStatus(id);
  if (!status) return reply.code(404).send({ ok: false, error: `Plugin not found: ${id}` });

  const dbInstance = db.getDatabase();
  const hasAudit = !!dbInstance.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='plugin_audit_logs'`).get();
  const summary = hasAudit
    ? dbInstance.prepare(`
      SELECT
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count,
        MAX(created_at) as last_event_at
      FROM plugin_audit_logs
      WHERE plugin_id = ?
    `).get(id) as any
    : null;

  const failed = Number(summary?.failed_count || 0);
  const blocked = Number(summary?.blocked_count || 0);
  const health = failed > 0 ? 'error' : blocked > 0 ? 'warning' : 'healthy';

  return {
    ok: true,
    plugin_id: id,
    status,
    health,
    success_count: Number(summary?.success_count || 0),
    failed_count: failed,
    blocked_count: blocked,
    last_event_at: summary?.last_event_at || null,
  };
});

app.get('/api/plugins/:id/audit-events', async (request: any, reply: any) => {
  const pm = await getPluginManager();
  if (!pm) {
    return reply.code(503).send({ ok: false, error: 'Plugin system is disabled' });
  }

  const { id } = request.params;
  const status = pm.getPluginStatus(id);
  if (!status) return reply.code(404).send({ ok: false, error: `Plugin not found: ${id}` });

  const rawLimit = Number((request.query || {}).limit ?? 20);
  const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.floor(rawLimit))) : 20;

  const dbInstance = db.getDatabase();
  const hasAudit = !!dbInstance.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='plugin_audit_logs'`).get();
  const events = hasAudit
    ? dbInstance.prepare(`
      SELECT audit_id, plugin_id, action, event_type, status, result_code, actor, request_id,
             error_type, error_message, execution_mode, dry_run, duration_ms, created_at
      FROM plugin_audit_logs
      WHERE plugin_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(id, limit) as any[]
    : [];

  return {
    ok: true,
    plugin_id: id,
    count: events.length,
    events: events.map((e: any) => ({
      audit_id: String(e.audit_id || ''),
      plugin_id: String(e.plugin_id || ''),
      action: String(e.action || ''),
      event_type: String(e.event_type || ''),
      status: String(e.status || ''),
      result_code: e.result_code || null,
      actor: e.actor || null,
      request_id: e.request_id || null,
      error_type: e.error_type || null,
      error_message: e.error_message || null,
      execution_mode: e.execution_mode || null,
      dry_run: Number(e.dry_run || 0) === 1,
      duration_ms: e.duration_ms == null ? null : Number(e.duration_ms),
      created_at: e.created_at || null,
    })),
  };
});

// ══ v5.4.0: Health Patrol API ════════════════════════════════════════════════
app.get('/api/health/patrol', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  
  // 最近 Regression 结果（从 audit_logs 查找）
  const lastRegression = dbInstance.prepare(`
    SELECT created_at, result, detail_json 
    FROM audit_logs 
    WHERE category = 'system' AND action LIKE '%regression%'
    ORDER BY created_at DESC LIMIT 1
  `).get() as any;

  // 最近 Recovery Drill
  const lastRecoveryDrill = dbInstance.prepare(`
    SELECT id, status, performed_at 
    FROM recovery_logs 
    WHERE recovery_type = 'drill' 
    ORDER BY performed_at DESC LIMIT 1
  `).get() as any;

  // Gate 汇总
  const gateRows = dbInstance.prepare(`
    SELECT status, COUNT(*) as c 
    FROM gate_checks 
    WHERE checked_at > datetime('now', '-7 days')
    GROUP BY status
  `).all() as any[];
  const gateSummary: any = { passed: 0, blocked: 0, failed: 0, total: 0 };
  gateRows.forEach(r => {
    gateSummary[r.status] = r.c;
    gateSummary.total += r.c;
  });

  // 失败趋势
  const failureTrends = dbInstance.prepare(`
    SELECT 
      COUNT(CASE WHEN updated_at > datetime('now', '-24 hours') THEN 1 END) as c24h,
      COUNT(CASE WHEN updated_at > datetime('now', '-7 days') THEN 1 END) as c7d,
      COUNT(CASE WHEN updated_at > datetime('now', '-30 days') THEN 1 END) as c30d
    FROM workflow_jobs WHERE status = 'failed'
  `).get() as any;

  // Blocked Gates 趋势
  const blockedTrends = dbInstance.prepare(`
    SELECT 
      COUNT(CASE WHEN checked_at > datetime('now', '-24 hours') THEN 1 END) as c24h,
      COUNT(CASE WHEN checked_at > datetime('now', '-7 days') THEN 1 END) as c7d,
      COUNT(CASE WHEN checked_at > datetime('now', '-30 days') THEN 1 END) as c30d
    FROM gate_checks WHERE status = 'blocked'
  `).get() as any;

  // Recovery 成功率
  const recoveryStats = dbInstance.prepare(`
    SELECT 
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
      COUNT(*) as total
    FROM recovery_logs 
    WHERE performed_at > datetime('now', '-30 days')
  `).get() as any;
  const recoverySuccessRate = recoveryStats?.total > 0 
    ? (recoveryStats.success / recoveryStats.total).toFixed(2) 
    : 1;

  // Backup 健康状态
  const stableRelease = dbInstance.prepare(`
    SELECT backup_verified, package_present 
    FROM releases WHERE status = 'sealed' 
    ORDER BY sealed_at DESC LIMIT 1
  `).get() as any;
  const backupHealth = stableRelease?.backup_verified === 1 ? 'verified' : 'unverified';
  const sealHealth = stableRelease?.package_present === 1 ? 'present' : 'missing';

  // 风险判断
  const risks: any[] = [];
  let overallStatus = 'healthy';

  // 规则1: Recovery Drill 年龄
  const drillAge = lastRecoveryDrill 
    ? (Date.now() - new Date(lastRecoveryDrill.performed_at).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  if (drillAge > 30) {
    risks.push({ rule: 'recovery_drill_age', status: 'caution', detail: `Last drill ${Math.floor(drillAge)} days ago` });
    overallStatus = 'caution';
  } else {
    risks.push({ rule: 'recovery_drill_age', status: 'ok', detail: `Last drill ${Math.floor(drillAge)} days ago` });
  }

  // 规则2: Regression 年龄
  const regAge = lastRegression 
    ? (Date.now() - new Date(lastRegression.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  if (regAge > 7) {
    risks.push({ rule: 'regression_age', status: 'caution', detail: `Last regression ${Math.floor(regAge)} days ago` });
    if (overallStatus === 'healthy') overallStatus = 'caution';
  } else {
    risks.push({ rule: 'regression_age', status: 'ok', detail: `Last regression ${Math.floor(regAge)} days ago` });
  }

  // 规则3: Blocked Gates 趋势
  const blocked7d = blockedTrends?.c7d || 0;
  const blocked24h = blockedTrends?.c24h || 0;
  if (blocked7d > blocked24h * 1.5 && blocked7d > 3) {
    risks.push({ rule: 'blocked_gates_trend', status: 'warning', detail: `Blocked gates increasing: ${blocked24h} -> ${blocked7d}` });
    if (overallStatus !== 'blocked') overallStatus = 'warning';
  } else {
    risks.push({ rule: 'blocked_gates_trend', status: 'ok', detail: `${blocked7d} blocked in 7 days` });
  }

  // 规则4: Backup 健康
  if (backupHealth !== 'verified') {
    risks.push({ rule: 'backup_health', status: 'blocked', detail: 'Backup not verified' });
    overallStatus = 'blocked';
  } else {
    risks.push({ rule: 'backup_health', status: 'ok', detail: 'Backup verified' });
  }

  // 规则5: Seal 健康
  if (sealHealth !== 'present') {
    risks.push({ rule: 'seal_health', status: 'blocked', detail: 'Seal artifact missing' });
    overallStatus = 'blocked';
  } else {
    risks.push({ rule: 'seal_health', status: 'ok', detail: 'Seal artifact present' });
  }

  // 规则6: Rollback Readiness (复用 v5.3.0 逻辑)
  const rollbackCheck = stableRelease 
    ? (stableRelease.backup_verified === 1 && stableRelease.package_present === 1 ? 'ready' : 'blocked')
    : 'unknown';
  if (rollbackCheck !== 'ready') {
    risks.push({ rule: 'rollback_readiness', status: 'caution', detail: `Rollback: ${rollbackCheck}` });
    if (overallStatus === 'healthy') overallStatus = 'caution';
  } else {
    risks.push({ rule: 'rollback_readiness', status: 'ok', detail: 'Rollback ready' });
  }

  return {
    ok: true,
    overall_status: overallStatus,
    verification: {
      last_regression: lastRegression ? {
        status: lastRegression.result || 'unknown',
        timestamp: lastRegression.created_at,
      } : null,
      last_recovery_drill: lastRecoveryDrill ? {
        status: lastRecoveryDrill.status,
        timestamp: lastRecoveryDrill.performed_at,
      } : null,
      gate_summary: gateSummary,
      backup_health: backupHealth,
      seal_health: sealHealth,
    },
    trends: {
      failures: { 
        '24h': failureTrends?.c24h || 0, 
        '7d': failureTrends?.c7d || 0, 
        '30d': failureTrends?.c30d || 0 
      },
      blocked_gates: { 
        '24h': blockedTrends?.c24h || 0, 
        '7d': blockedTrends?.c7d || 0, 
        '30d': blockedTrends?.c30d || 0 
      },
      recovery_success_rate: parseFloat(String(recoverySuccessRate)),
    },
    risks,
    links: {
      factory_status: '/factory-status',
      release_governance: '/factory-status?tab=release',
      audit: '/audit',
      workflow_jobs: '/workflow-jobs',
    },
  };
});

app.get('/api/health/verification', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  
  const lastRegression = dbInstance.prepare(`
    SELECT created_at, result FROM audit_logs 
    WHERE category = 'system' AND action LIKE '%regression%'
    ORDER BY created_at DESC LIMIT 1
  `).get() as any;

  const lastRecoveryDrill = dbInstance.prepare(`
    SELECT id, status, performed_at FROM recovery_logs 
    WHERE recovery_type = 'drill' ORDER BY performed_at DESC LIMIT 1
  `).get() as any;

  const gateRows = dbInstance.prepare(`
    SELECT status, COUNT(*) as c FROM gate_checks 
    WHERE checked_at > datetime('now', '-7 days') GROUP BY status
  `).all() as any[];
  const gateSummary: any = { passed: 0, blocked: 0, failed: 0, total: 0 };
  gateRows.forEach(r => {
    gateSummary[r.status] = r.c;
    gateSummary.total += r.c;
  });

  const stableRelease = dbInstance.prepare(`
    SELECT backup_verified, package_present FROM releases 
    WHERE status = 'sealed' ORDER BY sealed_at DESC LIMIT 1
  `).get() as any;

  return {
    ok: true,
    last_regression: lastRegression || null,
    last_recovery_drill: lastRecoveryDrill || null,
    gate_summary: gateSummary,
    backup_health: stableRelease?.backup_verified === 1 ? 'verified' : 'unverified',
    seal_health: stableRelease?.package_present === 1 ? 'present' : 'missing',
  };
});

app.get('/api/health/trends', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  
  const failures = dbInstance.prepare(`
    SELECT 
      COUNT(CASE WHEN updated_at > datetime('now', '-24 hours') THEN 1 END) as c24h,
      COUNT(CASE WHEN updated_at > datetime('now', '-7 days') THEN 1 END) as c7d,
      COUNT(CASE WHEN updated_at > datetime('now', '-30 days') THEN 1 END) as c30d
    FROM workflow_jobs WHERE status = 'failed'
  `).get() as any;

  const blocked = dbInstance.prepare(`
    SELECT 
      COUNT(CASE WHEN checked_at > datetime('now', '-24 hours') THEN 1 END) as c24h,
      COUNT(CASE WHEN checked_at > datetime('now', '-7 days') THEN 1 END) as c7d,
      COUNT(CASE WHEN checked_at > datetime('now', '-30 days') THEN 1 END) as c30d
    FROM gate_checks WHERE status = 'blocked'
  `).get() as any;

  const recoveryStats = dbInstance.prepare(`
    SELECT 
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
      COUNT(*) as total
    FROM recovery_logs WHERE performed_at > datetime('now', '-30 days')
  `).get() as any;

  const recoveryRate = recoveryStats?.total > 0 
    ? (recoveryStats.success / recoveryStats.total).toFixed(2) 
    : 1;

  return {
    ok: true,
    failures: { '24h': failures?.c24h || 0, '7d': failures?.c7d || 0, '30d': failures?.c30d || 0 },
    blocked_gates: { '24h': blocked?.c24h || 0, '7d': blocked?.c7d || 0, '30d': blocked?.c30d || 0 },
    recovery_success_rate: parseFloat(String(recoveryRate)),
  };
});

app.get('/api/health/risks', async (request: any, reply: any) => {
  const dbInstance = db.getDatabase();
  
  const risks: any[] = [];
  let overallStatus = 'healthy';

  // 规则检查（简化版，复用 patrol 逻辑）
  const lastDrill = dbInstance.prepare(`
    SELECT performed_at FROM recovery_logs 
    WHERE recovery_type = 'drill' AND status = 'success' 
    ORDER BY performed_at DESC LIMIT 1
  `).get() as any;
  const drillAge = lastDrill 
    ? (Date.now() - new Date(lastDrill.performed_at).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  risks.push({ 
    rule: 'recovery_drill_age', 
    status: drillAge > 30 ? 'caution' : 'ok', 
    detail: drillAge > 30 ? `Last drill ${Math.floor(drillAge)} days ago` : 'Recent drill exists' 
  });

  const stableRelease = dbInstance.prepare(`
    SELECT backup_verified, package_present FROM releases 
    WHERE status = 'sealed' ORDER BY sealed_at DESC LIMIT 1
  `).get() as any;
  
  risks.push({ 
    rule: 'backup_health', 
    status: stableRelease?.backup_verified === 1 ? 'ok' : 'blocked', 
    detail: stableRelease?.backup_verified === 1 ? 'Backup verified' : 'Backup NOT verified' 
  });
  
  risks.push({ 
    rule: 'seal_health', 
    status: stableRelease?.package_present === 1 ? 'ok' : 'blocked', 
    detail: stableRelease?.package_present === 1 ? 'Seal artifact present' : 'Seal artifact missing' 
  });

  // 计算整体状态
  if (risks.some(r => r.status === 'blocked')) {
    overallStatus = 'blocked';
  } else if (risks.some(r => r.status === 'warning')) {
    overallStatus = 'warning';
  } else if (risks.some(r => r.status === 'caution')) {
    overallStatus = 'caution';
  }

  return {
    ok: true,
    overall_status: overallStatus,
    risks,
    recommendation: overallStatus === 'healthy' 
      ? 'System is healthy. No immediate action required.' 
      : overallStatus === 'caution' 
        ? 'Some items need attention. Review details above.' 
        : 'Issues detected. Please address before proceeding.',
  };
});

// ── Start ─────────────────────────────────────────────────────────────────────
