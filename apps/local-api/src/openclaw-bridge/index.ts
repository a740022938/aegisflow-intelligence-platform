import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { getTaskQueue, type QueueTask } from '../queue/index.js';
import { getWorkerPool } from '../worker-pool/index.js';
import { metrics } from '../observability/index.js';
import { randomUUID } from 'node:crypto';
import { resolveIntent, getContext, getPatterns, resetContext, setContextJob, AUTO_EXECUTE_THRESHOLD } from '../intent-engine/index.js';

const OPENCLAW_BASE = process.env.OPENCLAW_BASE_URL || 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_HEARTBEAT_TOKEN || '';

interface OpenClawEvent {
  event_type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'task_created' | 'task_updated' | 'system_alert' | 'heartbeat_status';
  source: string;
  payload: Record<string, any>;
  timestamp: string;
}

interface OpenClawCommand {
  command: 'pause' | 'resume' | 'cancel' | 'retry' | 'inspect' | 'execute_workflow' | 'run_script' | 'trigger_flywheel';
  target: string;
  params: Record<string, any>;
  id: string;
}

interface CapabilityEntry {
  id: string;
  name: string;
  description: string;
  type: 'workflow' | 'pipeline' | 'plugin' | 'script' | 'model' | 'dataset' | 'api';
  actions: string[];
  params?: Record<string, any>;
}

const WORKFLOW_TEMPLATES: Record<string, { name: string; steps: number; description: string }> = {
  'full-flywheel': { name: '全链路飞轮', steps: 9, description: '视频→抽帧→清洗→注册数据集→切分→训练配置→训练→评估→归档' },
  'dataset-flywheel': { name: '现有数据集飞轮', steps: 6, description: '加载数据集→切分→训练配置→训练→评估→归档' },
  'front-chain': { name: '前置轻链', steps: 5, description: '视频→抽帧→清洗→注册数据集→切分' },
  'train-only': { name: '仅训练', steps: 3, description: '加载数据集→训练配置→训练→评估→归档' },
  'evaluate-only': { name: '仅评估', steps: 2, description: '加载模型→评估→报告' },
};

function nowIso() {
  return new Date().toISOString();
}

function writeAudit(action: string, target: string, result: 'success' | 'failed' | 'partial', detail: Record<string, any>) {
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'openclaw_bridge', ?, ?, ?, ?, ?)
    `).run(randomUUID(), action, target, result, JSON.stringify(detail || {}), nowIso());
  } catch { }
}

function writeEvent(eventType: string, actor: string, reason: string, detail: Record<string, any>) {
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO openclaw_control_events (id, event_type, actor, reason, before_json, after_json, created_at)
      VALUES (?, ?, ?, ?, '{}', ?, ?)
    `).run(randomUUID(), eventType, actor, reason, JSON.stringify(detail), nowIso());
  } catch { }
}

// ─── AIP → OpenClaw: Event Push ──────────────────────────────────────────

async function pushEventToOpenClaw(event: OpenClawEvent): Promise<boolean> {
  if (!OPENCLAW_TOKEN) return false;
  try {
    const res = await fetch(`${OPENCLAW_BASE}/api/aip/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openclaw-token': OPENCLAW_TOKEN,
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function notifyWorkflowEvent(eventType: OpenClawEvent['event_type'], jobId: string, data: Record<string, any>) {
  metrics.counter('aip_openclaw_events_pushed_total', { event_type: eventType });
  const event: OpenClawEvent = {
    event_type: eventType,
    source: 'aip',
    payload: { job_id: jobId, ...data },
    timestamp: nowIso(),
  };
  pushEventToOpenClaw(event);
  writeEvent(eventType, 'aip', '', data);
}

// ─── OpenClaw → AIP: Command Handler ─────────────────────────────────────

function handleCommand(command: OpenClawCommand): Promise<Record<string, any>> {
  metrics.counter('aip_openclaw_commands_received_total', { command: command.command });
  writeAudit('command_received', command.target, 'success', { command: command.command, id: command.id });

  switch (command.command) {
    case 'pause': return handlePauseCommand(command);
    case 'resume': return handleResumeCommand(command);
    case 'cancel': return handleCancelCommand(command);
    case 'retry': return handleRetryCommand(command);
    case 'inspect': return handleInspectCommand(command);
    case 'execute_workflow': return handleExecuteWorkflow(command);
    case 'run_script': return handleRunScript(command);
    case 'trigger_flywheel': return handleTriggerFlywheel(command);
    default:
      return Promise.resolve({ ok: false, error: `unknown_command: ${command.command}` });
  }
}

async function handlePauseCommand(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const db = getDatabase();
  const jobId = cmd.target;
  if (jobId.startsWith('job_')) {
    db.prepare(`UPDATE workflow_jobs SET status = 'paused', updated_at = ? WHERE id = ? AND status = 'running'`).run(nowIso(), jobId);
    notifyWorkflowEvent('workflow_failed', jobId, { reason: 'paused_by_openclaw', command_id: cmd.id });
    return { ok: true, target: jobId, new_status: 'paused' };
  }
  return { ok: false, error: 'target_not_found' };
}

async function handleResumeCommand(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const db = getDatabase();
  const jobId = cmd.target;
  if (jobId.startsWith('job_')) {
    db.prepare(`UPDATE workflow_jobs SET status = 'running', updated_at = ? WHERE id = ? AND status = 'paused'`).run(nowIso(), jobId);
    return { ok: true, target: jobId, new_status: 'running' };
  }
  return { ok: false, error: 'target_not_found' };
}

async function handleCancelCommand(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const db = getDatabase();
  const jobId = cmd.target;
  if (jobId.startsWith('job_')) {
    db.prepare(`UPDATE workflow_jobs SET status = 'cancelled', updated_at = ? WHERE id = ? AND status IN ('running','paused','pending')`).run(nowIso(), jobId);
    return { ok: true, target: jobId, new_status: 'cancelled' };
  }
  return { ok: false, error: 'target_not_found' };
}

async function handleRetryCommand(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const db = getDatabase();
  const jobId = cmd.target;
  if (jobId.startsWith('job_')) {
    db.prepare(`UPDATE workflow_jobs SET status = 'running', retry_count = retry_count + 1, updated_at = ? WHERE id = ? AND status = 'failed'`).run(nowIso(), jobId);
    return { ok: true, target: jobId, new_status: 'running' };
  }
  return { ok: false, error: 'target_not_found' };
}

async function handleInspectCommand(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const db = getDatabase();
  const target = cmd.target;
  const result: Record<string, any> = { ok: true, target, timestamp: nowIso() };

  if (target === 'system') {
    const wpStats = getWorkerPool().getStats();
    const qStats = getTaskQueue().getStats();
    const dbStats = (await import('../db/builtin-sqlite.js')).getDbStats();
    const mem = process.memoryUsage();
    result.system = {
      uptime: process.uptime(),
      version: (await import('../version.js')).APP_VERSION,
      memory: { rss: mem.rss, heapUsed: mem.heapUsed },
      database: dbStats,
      workerPool: wpStats,
      taskQueue: qStats,
    };
  } else if (target.startsWith('job_')) {
    const job = db.prepare(`SELECT * FROM workflow_jobs WHERE id = ?`).get(target) as any;
    if (job) {
      const steps = db.prepare(`SELECT step_key, status, started_at, finished_at FROM job_steps WHERE job_id = ?`).all(target);
      const logs = db.prepare(`SELECT level, message, created_at FROM job_logs WHERE job_id = ? ORDER BY created_at DESC LIMIT 50`).all(target);
      result.job = job;
      result.steps = steps;
      result.logs = logs;
    } else {
      result.ok = false;
      result.error = 'job_not_found';
    }
  } else {
    result.ok = false;
    result.error = 'unknown_target';
  }
  return result;
}

async function handleExecuteWorkflow(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const templateKey = String(cmd.params?.template || cmd.params?.workflow || 'dataset-flywheel');
  const template = WORKFLOW_TEMPLATES[templateKey];
  if (!template) {
    return { ok: false, error: `unknown_template: ${templateKey}. Available: ${Object.keys(WORKFLOW_TEMPLATES).join(', ')}` };
  }

  const db = getDatabase();
  const jobId = `job_${randomUUID().slice(0, 12)}`;
  const now = nowIso();

  try {
    db.prepare(`
      INSERT INTO workflow_jobs (id, name, status, template_id, created_at, updated_at, input_params_json)
      VALUES (?, ?, 'pending', ?, ?, ?, ?)
    `).run(jobId, template.name, templateKey, now, now, JSON.stringify(cmd.params || {}));

    notifyWorkflowEvent('workflow_started', jobId, { template: templateKey, name: template.name });

    return {
      ok: true,
      job_id: jobId,
      name: template.name,
      template: templateKey,
      steps: template.steps,
      status: 'pending',
    };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

async function handleRunScript(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const scriptName = String(cmd.params?.script || cmd.target || '');
  if (!scriptName) return { ok: false, error: 'script_name_required' };

  try {
    const scriptDir = process.env.AIP_REPO_ROOT
      ? require('path').join(process.env.AIP_REPO_ROOT, 'scripts', 'openclaw')
      : require('path').resolve(process.cwd(), '../../scripts/openclaw');

    const scriptPath = require('path').join(scriptDir, scriptName);
    if (!require('fs').existsSync(scriptPath)) {
      return { ok: false, error: `script_not_found: ${scriptName}` };
    }

    const { execSync } = require('child_process');
    const output = execSync(`node "${scriptPath}"`, {
      encoding: 'utf-8',
      timeout: 60000,
      env: { ...process.env, OPENCLAW_API_BASE: `http://127.0.0.1:8787` },
    });

    return { ok: true, script: scriptName, output: output.trim() };
  } catch (err: any) {
    return { ok: false, error: err.message, script: scriptName };
  }
}

async function handleTriggerFlywheel(cmd: OpenClawCommand): Promise<Record<string, any>> {
  const flywheelType = String(cmd.params?.flywheel || cmd.params?.type || 'full');
  const templateMap: Record<string, string> = {
    full: 'tpl-minimal-full-chain-flywheel',
    dataset: 'tpl-existing-dataset-flywheel',
    front: 'tpl-front-chain-light',
    train: 'train-only',
    eval: 'evaluate-only',
  };
  const templateKey = templateMap[flywheelType] || templateMap.full;

  const db = getDatabase();
  const jobId = `job_fw_${randomUUID().slice(0, 8)}`;
  const now = nowIso();

  db.prepare(`
    INSERT INTO workflow_jobs (id, name, status, template_id, created_at, updated_at, input_params_json)
    VALUES (?, 'OpenClaw Flywheel: ' || ?, 'running', ?, ?, ?, ?)
  `).run(jobId, flywheelType, templateKey, now, now, JSON.stringify(cmd.params || {}));

  notifyWorkflowEvent('workflow_started', jobId, { flywheel: flywheelType, template: templateKey });

  return { ok: true, job_id: jobId, flywheel: flywheelType, template: templateKey, status: 'running' };
}

// ─── Capabilities Discovery ──────────────────────────────────────────────

function getCapabilities(): CapabilityEntry[] {
  const db = getDatabase();
  const plugins = (db.prepare(`SELECT plugin_id, COALESCE(name, plugin_id) AS plugin_name, capabilities AS capability, enabled FROM plugin_registry WHERE enabled = 1`).all() as any[]) || [];

  return [
    {
      id: 'workflow-execution',
      name: '工作流执行',
      description: '执行预定义的 ML 工作流管道',
      type: 'workflow',
      actions: ['create', 'run', 'pause', 'resume', 'cancel', 'retry'],
      params: {
        templates: Object.entries(WORKFLOW_TEMPLATES).map(([k, v]) => ({ id: k, name: v.name, steps: v.steps, description: v.description })),
      },
    },
    {
      id: 'flywheel-engine',
      name: '自学习飞轮',
      description: '全自动训练-评估-反馈闭环',
      type: 'pipeline',
      actions: ['trigger', 'status', 'report'],
      params: {
        modes: ['full', 'dataset', 'front', 'train', 'eval'],
      },
    },
    {
      id: 'data-management',
      name: '数据管理',
      description: '数据集注册、版本管理、管道处理',
      type: 'dataset',
      actions: ['list', 'create', 'version', 'pipeline'],
    },
    {
      id: 'model-lifecycle',
      name: '模型生命周期',
      description: '模型训练、评估、发布、归档',
      type: 'model',
      actions: ['list', 'train', 'evaluate', 'deploy', 'archive'],
    },
    {
      id: 'plugin-system',
      name: '插件系统',
      description: '内置 8 个插件: 规则引擎、报告、SAM、数据集查看器等',
      type: 'plugin',
      actions: ['list', 'enable', 'disable', 'status'],
      params: {
        plugins: plugins.map(p => ({ id: p.plugin_id, name: p.plugin_name, capability: p.capability })),
      },
    },
    {
      id: 'system-ops',
      name: '系统运维',
      description: '健康检查、审计、配置管理、运维报告',
      type: 'api',
      actions: ['health', 'status', 'metrics', 'audit', 'config'],
    },
    {
      id: 'vision-pipeline',
      name: '视觉管道',
      description: 'YOLO 检测、SAM 分割、分类器、目标跟踪',
      type: 'pipeline',
      actions: ['detect', 'segment', 'classify', 'track'],
    },
  ];
}

// ─── Intent Processing (delegated to intent-engine/) ──────────────────────

// ─── Route Registration ──────────────────────────────────────────────────

export function registerOpenClawBridgeRoutes(app: FastifyInstance) {
  // OpenClaw → AIP: Command endpoint
  app.post('/api/openclaw/command', async (request: any, reply: any) => {
    const expectedToken = String(process.env.OPENCLAW_ADMIN_TOKEN || '').trim();
    const token = String(request.headers['x-openclaw-admin-token'] || '').trim();
    if (expectedToken && token !== expectedToken) {
      return reply.code(403).send({ ok: false, error: 'unauthorized' });
    }

    const cmd = request.body as OpenClawCommand;
    if (!cmd || !cmd.command) {
      return reply.code(400).send({ ok: false, error: 'command_required' });
    }

    cmd.id = cmd.id || randomUUID();
    const result = await handleCommand(cmd);
    return { ok: result.ok, command: cmd.command, target: cmd.target, result };
  });

  // OpenClaw → AIP: Resolve intent to workflow (v2 intent engine)
  app.post('/api/openclaw/intent', async (request: any, reply: any) => {
    const body = request.body || {};
    const prompt = String(body.prompt || body.intent || '').trim();
    if (!prompt) return reply.code(400).send({ ok: false, error: 'prompt_required' });

    const resolved = resolveIntent(prompt);
    writeAudit('intent_resolved', prompt.slice(0, 100), resolved.confidence > AUTO_EXECUTE_THRESHOLD ? 'success' : 'partial', resolved);

    return {
      ok: true,
      prompt,
      intent_id: resolved.intent_id,
      template: resolved.template,
      confidence: resolved.confidence,
      params: resolved.params,
      matched_keywords: resolved.matched_keywords,
      clarification_needed: resolved.clarification_needed,
      clarification_question: resolved.clarification_question,
      alternatives: resolved.alternatives,
      source: resolved.source,
      context: getContext(),
      available_templates: WORKFLOW_TEMPLATES,
      auto_execute_threshold: AUTO_EXECUTE_THRESHOLD,
    };
  });

  // Intent engine: get patterns list
  app.get('/api/openclaw/intent/patterns', async (_request: any, reply: any) => {
    const patterns = getPatterns();
    return { ok: true, builtin_count: patterns.builtin.length, user_count: patterns.user.length, ...patterns };
  });

  // Intent engine: reset context
  app.post('/api/openclaw/intent/reset', async (_request: any, reply: any) => {
    resetContext();
    return { ok: true, message: '意图上下文已重置' };
  });

  // Intent engine: train from feedback (user corrects a wrong match)
  app.post('/api/openclaw/intent/feedback', async (request: any, reply: any) => {
    const body = request.body || {};
    const userInput = String(body.user_input || '');
    const correctTemplate = String(body.correct_template || '');
    const originalMatch = String(body.original_match || '');

    if (!userInput || !correctTemplate) {
      return reply.code(400).send({ ok: false, error: 'user_input and correct_template required' });
    }

    const db = getDatabase();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'intent_feedback', 'user_correction', ?, 'success', ?, ?)
    `).run(
      crypto.randomUUID(), correctTemplate,
      JSON.stringify({ user_input: userInput, original_match: originalMatch, corrected_to: correctTemplate }),
      nowIso(),
    );

    return { ok: true, message: '反馈已记录，下次匹配会参考' };
  });

  // OpenClaw → AIP: Trigger workflow
  app.post('/api/openclaw/workflow', async (request: any, reply: any) => {
    const expectedToken = String(process.env.OPENCLAW_ADMIN_TOKEN || '').trim();
    const token = String(request.headers['x-openclaw-admin-token'] || '').trim();
    if (expectedToken && token !== expectedToken) {
      return reply.code(403).send({ ok: false, error: 'unauthorized' });
    }

    const body = request.body || {};
    const cmd: OpenClawCommand = {
      command: 'execute_workflow',
      target: body.template || body.workflow || '',
      params: body.params || {},
      id: randomUUID(),
    };

    const result = await handleExecuteWorkflow(cmd);
    return result.ok
      ? { ok: true, job_id: result.job_id, status: result.status }
      : reply.code(400).send(result);
  });

  // OpenClaw → AIP: Write execution results
  app.post('/api/openclaw/result', async (request: any, reply: any) => {
    const expectedToken = String(process.env.OPENCLAW_HEARTBEAT_TOKEN || '').trim();
    const token = String(request.headers['x-openclaw-token'] || '').trim();
    if (expectedToken && token !== expectedToken) {
      return reply.code(401).send({ ok: false, error: 'unauthorized' });
    }

    const body = request.body || {};
    const runId = String(body.run_id || body.job_id || '');
    const status = String(body.status || 'completed');
    const output = body.output || body.result || {};

    if (!runId) return reply.code(400).send({ ok: false, error: 'run_id_required' });

    try {
      const db = getDatabase();
      const existing = db.prepare(`SELECT id FROM runs WHERE id = ?`).get(runId) as any;
      if (existing) {
        db.prepare(`
          UPDATE runs SET status = ?, summary_json = ?, finished_at = ?, updated_at = ?
          WHERE id = ?
        `).run(status, JSON.stringify(output), nowIso(), nowIso(), runId);
      } else {
        db.prepare(`
          INSERT INTO runs (id, name, status, executor_type, summary_json, created_at, updated_at, finished_at)
          VALUES (?, 'openclaw_result', ?, 'openclaw', ?, ?, ?, ?)
        `).run(runId, status, JSON.stringify(output), nowIso(), nowIso(), nowIso());
      }

      writeAudit('result_received', runId, 'success', { status });
      return { ok: true, run_id: runId, status };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });

  // AIP → OpenClaw: Event history
  app.get('/api/openclaw/events', async (request: any, reply: any) => {
    const db = getDatabase();
    const limit = Math.min(Number(request.query?.limit || 50), 200);
    const rows = db.prepare(`
      SELECT id, event_type, actor, reason, created_at
      FROM openclaw_control_events
      ORDER BY created_at DESC LIMIT ?
    `).all(limit);
    return { ok: true, events: rows, count: rows.length };
  });

  // OpenClaw → AIP: Capabilities discovery endpoint
  app.get('/api/openclaw/capabilities', async (_request: any, reply: any) => {
    const capabilities = getCapabilities();
    return {
      ok: true,
      service: 'AegisFlow Intelligence Platform',
      version: (await import('../version.js')).APP_VERSION,
      capabilities,
      workflow_templates: WORKFLOW_TEMPLATES,
      total_capabilities: capabilities.length,
    };
  });

  // AIP → OpenClaw: Push event manually (for testing/debugging)
  app.post('/api/openclaw/push-event', async (request: any, reply: any) => {
    const body = request.body || {};
    const eventType = String(body.event_type || 'system_alert');
    const payload = body.payload || {};

    notifyWorkflowEvent(eventType as any, payload.job_id || 'manual', payload);
    return { ok: true, event_type: eventType, pushed: true };
  });

  // Enhanced heartbeat with capability exchange
  app.post('/api/openclaw/heartbeat-v2', async (request: any, reply: any) => {
    const expectedToken = String(process.env.OPENCLAW_HEARTBEAT_TOKEN || '').trim();
    const token = String(request.headers['x-openclaw-token'] || '').trim();
    if (expectedToken && token !== expectedToken) {
      return reply.code(401).send({ ok: false, error: 'invalid token' });
    }

    const body = request.body || {};
    const db = getDatabase();
    const now = nowIso();

    db.prepare(`
      UPDATE openclaw_control
      SET last_heartbeat_at = ?, updated_at = ?, updated_by = ?,
          error_reason = CASE WHEN error_reason = 'heartbeat_missing' THEN '' ELSE error_reason END
      WHERE id = 1
    `).run(now, now, String(body.actor || 'openclaw_agent'));

    const wpStats = getWorkerPool().getStats();
    const qStats = getTaskQueue().getStats();
    const dbStats = (await import('../db/builtin-sqlite.js')).getDbStats();

    writeEvent('heartbeat_v2', body.actor || 'openclaw_agent', '', { runtime_online: body.runtime_online });

    return {
      ok: true,
      heartbeat_at: now,
      aip_status: {
        uptime: process.uptime(),
        version: (await import('../version.js')).APP_VERSION,
        database: { queries: dbStats.totalQueries, errors: dbStats.totalErrors },
        workerPool: { busy: wpStats.busyWorkers, idle: wpStats.idleWorkers, queued: wpStats.queuedTasks },
        taskQueue: { queued: qStats.queued, active: qStats.active, completed: qStats.completed, failed: qStats.failed },
      },
      capabilities_available: getCapabilities().length,
      pending_alerts: [],
    };
  });

  // OpenClaw → AIP: Script discovery and execution
  app.get('/api/openclaw/scripts', async (_request: any, reply: any) => {
    const scriptDir = process.env.AIP_REPO_ROOT
      ? require('path').join(process.env.AIP_REPO_ROOT, 'scripts', 'openclaw')
      : require('path').resolve(process.cwd(), '../../scripts/openclaw');
    const fs = require('fs');
    const path = require('path');

    let scripts: string[] = [];
    if (fs.existsSync(scriptDir)) {
      scripts = fs.readdirSync(scriptDir)
        .filter((f: string) => f.endsWith('.mjs') || f.endsWith('.ps1'))
        .map((f: string) => f.replace(/\.(mjs|ps1)$/, ''));
    }

    return { ok: true, script_dir: scriptDir, scripts };
  });

  app.post('/api/openclaw/run-script', async (request: any, reply: any) => {
    const expectedToken = String(process.env.OPENCLAW_ADMIN_TOKEN || '').trim();
    const token = String(request.headers['x-openclaw-admin-token'] || '').trim();
    if (expectedToken && token !== expectedToken) {
      return reply.code(403).send({ ok: false, error: 'unauthorized' });
    }

    const body = request.body || {};
    const cmd: OpenClawCommand = {
      command: 'run_script',
      target: String(body.script || ''),
      params: body.params || {},
      id: randomUUID(),
    };

    const result = await handleRunScript(cmd);
    return result.ok
      ? { ok: true, script: result.script, output: result.output }
      : reply.code(400).send(result);
  });

  // AIP → OpenClaw: Workflow event notifier (called by workflow system)
  app.post('/api/openclaw/notify', async (request: any, reply: any) => {
    const body = request.body || {};
    const eventType = String(body.event_type || 'workflow_updated');
    const jobId = String(body.job_id || '');
    const data = body.data || {};

    notifyWorkflowEvent(eventType as any, jobId, data);
    return { ok: true, notified: true };
  });
}
