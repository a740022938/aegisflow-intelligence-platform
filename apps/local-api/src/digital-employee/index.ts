import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { getTaskQueue } from '../queue/index.js';
import { getWorkerPool } from '../worker-pool/index.js';
import { resolveIntent, setContextJob } from '../intent-engine/index.js';
import { randomUUID } from 'node:crypto';

const EMPLOYEE_PROFILE = {
  name: '小枢',
  title: 'AI 机器学习工程师',
  employee_id: 'AIP-001',
  department: 'AI 自动化运营部',
  skills: [
    '计算机视觉 (YOLO/SAM/分类器)',
    '数据管道 (抽帧/清洗/标注/切分)',
    '模型训练与评估',
    '工作流编排',
    '系统运维监控',
  ],
  working_hours: '24/7',
  response_time: '实时',
  communication_style: '简洁、结构化、主动汇报',
  principles: [
    '收到任务先确认理解再执行',
    '执行前做 dry-run 检查',
    '高风险操作 (删除/回滚/覆盖) 需人工确认',
    '任务完成后主动汇报结果',
    '遇到异常自动重试1次，仍失败则上报',
  ],
};

interface Assignment {
  id: string;
  title: string;
  description: string;
  status: 'inbox' | 'planning' | 'approved' | 'executing' | 'reviewing' | 'completed' | 'failed' | 'cancelled';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: string;
  created_at: string;
  updated_at: string;
  plan?: string;
  job_id?: string;
  result_summary?: string;
  report?: string;
  feedback?: string;
}

function nowIso() { return new Date().toISOString(); }

function ensureTables(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS digital_employee_assignments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'inbox',
      priority TEXT NOT NULL DEFAULT 'normal',
      category TEXT NOT NULL DEFAULT 'general',
      source TEXT NOT NULL DEFAULT 'manual',
      plan TEXT,
      job_id TEXT,
      result_summary TEXT,
      report TEXT,
      feedback TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS digital_employee_reports (
      id TEXT PRIMARY KEY,
      report_type TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      details_json TEXT NOT NULL DEFAULT '{}',
      generated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS digital_employee_feedback (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      rating INTEGER DEFAULT 3,
      comment TEXT DEFAULT '',
      improvement_suggestion TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);
}

export function registerDigitalEmployeeRoutes(app: FastifyInstance) {
  const db = getDatabase();
  ensureTables(db);

  // ── Employee Profile ───────────────────────────────────────────────
  app.get('/api/employee/profile', async (_request, reply) => {
    const stats = getWorkSummary(db);
    return {
      ok: true,
      employee: EMPLOYEE_PROFILE,
      stats: {
        total_assignments: stats.total,
        completed_today: stats.completedToday,
        in_progress: stats.inProgress,
        avg_rating: stats.avgRating,
      },
    };
  });

  // ── Inbox: List assignments ────────────────────────────────────────
  app.get('/api/employee/inbox', async (request: any, reply: any) => {
    const status = request.query?.status || '';
    const limit = Math.min(Number(request.query?.limit || 50), 100);
    let rows: any[];
    if (status) {
      rows = db.prepare('SELECT * FROM digital_employee_assignments WHERE status = ? ORDER BY created_at DESC LIMIT ?').all(status, limit);
    } else {
      rows = db.prepare('SELECT * FROM digital_employee_assignments ORDER BY created_at DESC LIMIT ?').all(limit);
    }
    return { ok: true, assignments: rows, count: rows.length, profile: EMPLOYEE_PROFILE };
  });

  // ── Create assignment ──────────────────────────────────────────────
  app.post('/api/employee/inbox', async (request: any, reply: any) => {
    const body = request.body || {};
    const title = String(body.title || body.task || '').trim();
    const description = String(body.description || body.detail || body.prompt || '');
    if (!title) return reply.code(400).send({ ok: false, error: 'title required' });

    const id = `assign_${randomUUID().slice(0, 12)}`;
    const now = nowIso();
    const assignment: Assignment = {
      id, title, description,
      status: 'inbox',
      priority: body.priority || 'normal',
      category: body.category || 'general',
      created_at: now, updated_at: now,
    };

    db.prepare(`
      INSERT INTO digital_employee_assignments (id, title, description, status, priority, category, source, created_at, updated_at)
      VALUES (?, ?, ?, 'inbox', ?, ?, ?, ?, ?)
    `).run(id, title, description, assignment.priority, assignment.category, String(body.source || 'api'), now, now);

    return { ok: true, assignment, message: `任务已收到，小枢开始处理: ${title}` };
  });

  // ── Auto-plan: AI analyzes assignment and creates plan ─────────────
  app.post('/api/employee/inbox/:id/plan', async (request: any, reply: any) => {
    const { id } = request.params;
    const row = db.prepare('SELECT * FROM digital_employee_assignments WHERE id = ?').get(id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'assignment not found' });

    const plan = generatePlan(row);
    db.prepare("UPDATE digital_employee_assignments SET status = 'planning', plan = ?, updated_at = ? WHERE id = ?")
      .run(JSON.stringify(plan), nowIso(), id);

    return { ok: true, assignment_id: id, plan };
  });

  // ── Execute plan → triggers AIP workflow ──────────────────────────
  app.post('/api/employee/inbox/:id/execute', async (request: any, reply: any) => {
    const { id } = request.params;
    const row = db.prepare('SELECT * FROM digital_employee_assignments WHERE id = ?').get(id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'assignment not found' });

    const plan = tryParseJson(row.plan, {});
    const intentResult = resolveIntent(row.title + ' ' + (row.description || ''));
    let jobId: string | null = null;

    if (intentResult.template && intentResult.confidence > 0.7) {
      const now = nowIso();
      const jId = `job_de_${randomUUID().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO workflow_jobs (id, name, status, template_id, created_at, updated_at, input_params_json)
        VALUES (?, ?, 'running', ?, ?, ?, ?)
      `).run(jId, `[数字员工] ${row.title}`, intentResult.template, now, now, JSON.stringify({
        assignment_id: id,
        intent: intentResult.intent_id,
        confidence: intentResult.confidence,
        ...intentResult.params,
      }));
      jobId = jId;
      setContextJob(jId);
    }

    db.prepare("UPDATE digital_employee_assignments SET status = 'executing', job_id = ?, updated_at = ?, started_at = ? WHERE id = ?")
      .run(jobId || '', nowIso(), nowIso(), id);

    return {
      ok: true,
      assignment_id: id,
      status: 'executing',
      job_id: jobId,
      intent: intentResult,
      plan,
    };
  });

  // ── Complete with result ───────────────────────────────────────────
  app.post('/api/employee/inbox/:id/complete', async (request: any, reply: any) => {
    const { id } = request.params;
    const body = request.body || {};
    const row = db.prepare('SELECT * FROM digital_employee_assignments WHERE id = ?').get(id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'assignment not found' });

    const resultSummary = String(body.summary || body.result || '');
    const report = String(body.report || '');

    db.prepare(`
      UPDATE digital_employee_assignments
      SET status = 'completed', result_summary = ?, report = ?, updated_at = ?, completed_at = ?
      WHERE id = ?
    `).run(resultSummary, report, nowIso(), nowIso(), id);

    writeReport(db, id, row.title, resultSummary);

    return { ok: true, assignment_id: id, status: 'completed', message: `✅ 任务完成: ${row.title}` };
  });

  // ── Dashboard / Today's summary ────────────────────────────────────
  app.get('/api/employee/dashboard', async (_request, reply) => {
    const stats = getWorkSummary(db);
    const today = nowIso().slice(0, 10);
    const todayAssignments = db.prepare(`
      SELECT id, title, status, priority, category, created_at
      FROM digital_employee_assignments
      WHERE created_at >= ? ORDER BY created_at DESC LIMIT 20
    `).all(`${today}T00:00:00.000Z`);

    const lastReport = db.prepare(`
      SELECT * FROM digital_employee_reports ORDER BY generated_at DESC LIMIT 1
    `).get() as any;

    return {
      ok: true,
      employee: EMPLOYEE_PROFILE,
      date: today,
      stats,
      today_assignments: todayAssignments,
      last_report: lastReport || null,
      message: stats.inProgress > 0
        ? `小枢正在处理 ${stats.inProgress} 项任务`
        : '小枢空闲中，随时可以派活',
    };
  });

  // ── Reports ────────────────────────────────────────────────────────
  app.get('/api/employee/reports', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 10), 50);
    const rows = db.prepare('SELECT * FROM digital_employee_reports ORDER BY generated_at DESC LIMIT ?').all(limit);
    return { ok: true, reports: rows, count: rows.length };
  });

  app.post('/api/employee/reports/generate', async (_request, reply) => {
    const report = generateDailyReport(db);
    return { ok: true, report };
  });

  // ── Self review ────────────────────────────────────────────────────
  app.post('/api/employee/review', async (_request, reply) => {
    const review = selfReview(db);
    return { ok: true, review };
  });

  // ── Feedback ───────────────────────────────────────────────────────
  app.post('/api/employee/feedback', async (request: any, reply: any) => {
    const body = request.body || {};
    const assignId = String(body.assignment_id || '');
    if (!assignId) return reply.code(400).send({ ok: false, error: 'assignment_id required' });

    db.prepare(`
      INSERT INTO digital_employee_feedback (id, assignment_id, rating, comment, improvement_suggestion, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), assignId, Number(body.rating || 3), String(body.comment || ''), String(body.improvement || ''), nowIso());

    db.prepare("UPDATE digital_employee_assignments SET feedback = ?, updated_at = ? WHERE id = ?")
      .run(JSON.stringify({ rating: body.rating, comment: body.comment }), nowIso(), assignId);

    return { ok: true, message: '收到反馈，小枢会记住改进' };
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

function tryParseJson(val: any, fallback: any = {}) {
  if (!val) return fallback;
  try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return fallback; }
}

function getWorkSummary(db: any) {
  const total = (db.prepare('SELECT COUNT(*) as c FROM digital_employee_assignments').get() as any)?.c || 0;
  const today = `${nowIso().slice(0, 10)}T00:00:00.000Z`;
  const completedToday = (db.prepare("SELECT COUNT(*) as c FROM digital_employee_assignments WHERE status = 'completed' AND updated_at >= ?").get(today) as any)?.c || 0;
  const inProgress = (db.prepare("SELECT COUNT(*) as c FROM digital_employee_assignments WHERE status IN ('inbox','planning','approved','executing','reviewing')").get() as any)?.c || 0;
  const avgRating = (db.prepare('SELECT AVG(rating) as r FROM digital_employee_feedback').get() as any)?.r || 0;
  return { total, completedToday, inProgress, avgRating: Math.round(avgRating * 10) / 10 };
}

function generatePlan(assignment: any): Record<string, any> {
  const title = (assignment.title || '').toLowerCase();
  const desc = (assignment.description || '').toLowerCase();
  const combined = title + ' ' + desc;
  const intentResult = resolveIntent(combined);

  let steps: string[] = [];
  if (intentResult.template) {
    const templateNames: Record<string, string> = {
      'tpl-minimal-full-chain-flywheel': '全链路飞轮',
      'tpl-existing-dataset-flywheel': '数据集飞轮',
      'tpl-front-chain-light': '前置抽帧链',
      'train-only': '模型训练',
      'evaluate-only': '模型评估',
    };
    steps = [
      `1. 解析意图 → ${intentResult.intent_id} (置信度 ${Math.round(intentResult.confidence * 100)}%)`,
      `2. 执行模板 → ${templateNames[intentResult.template] || intentResult.template}`,
      '3. 监控执行进度',
      '4. 验证结果',
      '5. 生成汇报',
    ];
  } else {
    steps = [
      '1. 分析任务需求',
      '2. 检查系统状态和可用资源',
      '3. 制定执行方案',
      '4. 执行并监控',
      '5. 生成汇报',
    ];
  }

  return {
    task: assignment.title,
    analyzed_at: nowIso(),
    intent_match: intentResult.intent_id,
    confidence: intentResult.confidence,
    steps,
    estimated_duration: estimateDuration(intentResult.template),
  };
}

function estimateDuration(template: string | undefined): string {
  const durations: Record<string, string> = {
    'tpl-minimal-full-chain-flywheel': '30-60 分钟',
    'tpl-existing-dataset-flywheel': '20-45 分钟',
    'tpl-front-chain-light': '5-15 分钟',
    'train-only': '15-30 分钟',
    'evaluate-only': '5-10 分钟',
  };
  return durations[template || ''] || '10-30 分钟';
}

function writeReport(db: any, assignId: string, title: string, summary: string) {
  try {
    const today = nowIso().slice(0, 10);
    const existing = db.prepare(`
      SELECT id, details_json FROM digital_employee_reports
      WHERE report_type = 'daily' AND period_start = ? ORDER BY generated_at DESC LIMIT 1
    `).get(`${today}T00:00:00.000Z`) as any;

    const entry = { assignment_id: assignId, title, summary: summary || '完成', time: nowIso() };

    if (existing) {
      const details = tryParseJson(existing.details_json, { entries: [] });
      if (!Array.isArray(details.entries)) details.entries = [];
      details.entries.push(entry);
      db.prepare('UPDATE digital_employee_reports SET details_json = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(details), nowIso(), existing.id);
    }
  } catch { }
}

function generateDailyReport(db: any): Record<string, any> {
  const today = nowIso().slice(0, 10);
  const startOfDay = `${today}T00:00:00.000Z`;
  const endOfDay = `${today}T23:59:59.999Z`;

  const completed = db.prepare(`
    SELECT id, title, priority, category, result_summary, completed_at
    FROM digital_employee_assignments
    WHERE status = 'completed' AND completed_at >= ? AND completed_at <= ?
    ORDER BY completed_at DESC
  `).all(startOfDay, endOfDay) as any[];

  const inProgress = db.prepare(`
    SELECT id, title, priority, category, status, plan
    FROM digital_employee_assignments
    WHERE status IN ('inbox','planning','approved','executing','reviewing')
    ORDER BY priority DESC, created_at ASC
  `).all() as any[];

  const inboxCount = (db.prepare("SELECT COUNT(*) as c FROM digital_employee_assignments WHERE status = 'inbox'").get() as any)?.c || 0;
  const systemStatus = getWorkerPool().getStats();

  const report = {
    id: randomUUID(),
    report_type: 'daily',
    period_start: startOfDay,
    period_end: endOfDay,
    summary: [
      `📋 今日完成: ${completed.length} 项`,
      `🔄 进行中: ${inProgress.length} 项`,
      `📥 待办: ${inboxCount} 项`,
      `⚙️ Worker 池: ${systemStatus.busyWorkers}忙 / ${systemStatus.idleWorkers}闲`,
    ].join(' | '),
    details_json: JSON.stringify({ completed, inProgress, system: systemStatus }),
    generated_at: nowIso(),
  };

  db.prepare(`
    INSERT INTO digital_employee_reports (id, report_type, period_start, period_end, summary, details_json, generated_at)
    VALUES (?, 'daily', ?, ?, ?, ?, ?)
  `).run(report.id, startOfDay, endOfDay, report.summary, report.details_json, report.generated_at);

  return report;
}

function selfReview(db: any): Record<string, any> {
  const total = (db.prepare('SELECT COUNT(*) as c FROM digital_employee_assignments').get() as any)?.c || 0;
  const failed = (db.prepare("SELECT COUNT(*) as c FROM digital_employee_assignments WHERE status = 'failed'").get() as any)?.c || 0;
  const avgRating = (db.prepare('SELECT AVG(rating) as r FROM digital_employee_feedback').get() as any)?.r || 0;
  const feedbacks = db.prepare('SELECT * FROM digital_employee_feedback ORDER BY created_at DESC LIMIT 5').all() as any[];
  const categories = db.prepare('SELECT category, COUNT(*) as c FROM digital_employee_assignments GROUP BY category ORDER BY c DESC').all() as any[];

  return {
    reviewed_at: nowIso(),
    period: '全部历史',
    metrics: {
      total_assignments: total,
      success_rate: total > 0 ? `${Math.round((1 - failed / total) * 100)}%` : 'N/A',
      avg_rating: avgRating > 0 ? `${avgRating}/5` : '暂无评分',
      categories: Object.fromEntries((categories || []).map((r: any) => [r.category, r.c])),
    },
    recent_feedback: feedbacks.map((f: any) => ({
      rating: f.rating,
      comment: f.comment,
      improvement: f.improvement_suggestion,
    })),
    improvement_suggestions: failed > 0
      ? [`有 ${failed} 次失败记录，建议检查异常模式`]
      : ['运行良好，继续保持'],
  };
}

export { EMPLOYEE_PROFILE };
export type { Assignment };
