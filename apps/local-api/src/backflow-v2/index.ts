import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';

// ─── Types ───────────────────────────────────────────────────────────

interface BackflowInput {
  model_id: string;
  job_id?: string;
  experiment_id?: string;
  dataset_id?: string;
  evaluation_id?: string;
  validation_report_path?: string;
  metrics?: Record<string, number>;
  auto_retrain?: boolean;
  force_retrain?: boolean;
}

interface DriftPoint {
  metric: string;
  current: number;
  previous: number;
  threshold: number;
  drifted: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorAnalysis {
  class_name: string;
  false_positives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  relative_frequency: number;
  priority: number;
}

interface RetrainSuggestion {
  should_retrain: boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggested_epochs: number;
  suggested_lr: number;
  suggested_augmentations: string[];
  focus_classes: string[];
  estimated_gpu_hours: number;
}

interface BackflowReport {
  id: string;
  model_id: string;
  model_name: string;
  timestamp: string;
  backflow_type: 'pass' | 'drift' | 'degradation' | 'critical';
  drifts: DriftPoint[];
  error_analysis: ErrorAnalysis[];
  retrain_suggestion: RetrainSuggestion;
  feedback_items: any[];
  previous_backflows: BackflowSummary[];
  ensemble_models: string[];
}

interface BackflowSummary {
  id: string;
  model_id: string;
  backflow_type: string;
  metrics: Record<string, number>;
  retrained: boolean;
  improved: boolean;
  timestamp: string;
}

function nowIso() { return new Date().toISOString(); }

// ─── Drift Detection ─────────────────────────────────────────────────

const METRIC_THRESHOLDS: Record<string, { critical: number; high: number; medium: number }> = {
  mAP: { critical: 0.15, high: 0.08, medium: 0.04 },
  precision: { critical: 0.15, high: 0.08, medium: 0.04 },
  recall: { critical: 0.15, high: 0.08, medium: 0.04 },
  f1_score: { critical: 0.12, high: 0.06, medium: 0.03 },
  accuracy: { critical: 0.10, high: 0.05, medium: 0.02 },
  loss: { critical: 0.30, high: 0.15, medium: 0.08 },
};

function detectDrifts(current: Record<string, number>, previous: Record<string, number>): DriftPoint[] {
  const drifts: DriftPoint[] = [];
  for (const [metric, curVal] of Object.entries(current)) {
    const prevVal = previous[metric];
    if (prevVal === undefined) continue;
    const thresholds = METRIC_THRESHOLDS[metric] || { critical: 0.10, high: 0.06, medium: 0.03 };
    const diff = Math.abs(curVal - prevVal);
    const isBetter = metric === 'loss' ? curVal < prevVal : curVal > prevVal;
    let severity: DriftPoint['severity'] = 'low';
    if (diff >= thresholds.critical) severity = 'critical';
    else if (diff >= thresholds.high) severity = 'high';
    else if (diff >= thresholds.medium) severity = 'medium';
    drifts.push({
      metric, current: curVal, previous: prevVal,
      threshold: thresholds.medium, drifted: !isBetter && severity !== 'low',
      severity,
    });
  }
  return drifts;
}

// ─── Error Analysis ─────────────────────────────────────────────────

function analyzeErrors(report: any): ErrorAnalysis[] {
  if (!report?.per_class) return [];
  const classes = report.per_class;
  const totalFP = classes.reduce((s: number, c: any) => s + (c.false_positives || 0), 0) || 1;
  const totalFN = classes.reduce((s: number, c: any) => s + (c.false_negatives || 0), 0) || 1;

  return classes.map((c: any) => {
    const fp = c.false_positives || 0;
    const fn = c.false_negatives || 0;
    const tp = c.true_positives || 1;
    const relFreqFP = fp / totalFP;
    const relFreqFN = fn / totalFN;
    const priority = Math.round((relFreqFP + relFreqFN) * 100);
    return {
      class_name: c.class_name || c.class || 'unknown',
      false_positives: fp, false_negatives: fn,
      precision: tp / (tp + fp + 1e-8),
      recall: tp / (tp + fn + 1e-8),
      relative_frequency: Math.round((relFreqFP + relFreqFN) * 100) / 100,
      priority,
    };
  }).sort((a: ErrorAnalysis, b: ErrorAnalysis) => b.priority - a.priority);
}

// ─── Retrain Suggestion Engine ──────────────────────────────────────

function suggestRetrain(drifts: DriftPoint[], errorAnalysis: ErrorAnalysis[], prevBackflows: BackflowSummary[]): RetrainSuggestion {
  const criticalDrifts = drifts.filter(d => d.drifted && d.severity === 'critical');
  const highDrifts = drifts.filter(d => d.drifted && d.severity === 'high');
  const mediumDrifts = drifts.filter(d => d.drifted && d.severity === 'medium');
  const hasDrifts = criticalDrifts.length > 0 || highDrifts.length > 0;

  const topErrors = errorAnalysis.slice(0, 5);
  const consecutiveDegradations = prevBackflows.filter(b => b.backflow_type === 'degradation' || b.backflow_type === 'critical').length;
  const lastRetrain = prevBackflows.find(b => b.retrained);
  const lastImproved = prevBackflows.find(b => b.improved);

  let should_retrain = false;
  let priority: RetrainSuggestion['priority'] = 'low';
  let reason = '';

  if (criticalDrifts.length > 0) {
    should_retrain = true;
    priority = 'critical';
    reason = `${criticalDrifts.length} 个关键指标严重漂移: ${criticalDrifts.map(d => d.metric).join(', ')}`;
  } else if (highDrifts.length > 1 || (highDrifts.length > 0 && consecutiveDegradations > 0)) {
    should_retrain = true;
    priority = 'high';
    reason = `${highDrifts.length} 个指标漂移 + 连续 ${consecutiveDegradations} 次退化`;
  } else if (mediumDrifts.length > 2 && consecutiveDegradations >= 2) {
    should_retrain = true;
    priority = 'medium';
    reason = `多个指标轻微漂移，连续 ${consecutiveDegradations} 次未改善`;
  } else if (errorAnalysis.length > 0 && errorAnalysis[0].priority > 60) {
    should_retrain = true;
    priority = 'medium';
    reason = `类别 "${topErrors[0]?.class_name}" 错误率异常高 (优先级 ${errorAnalysis[0].priority})`;
  } else {
    reason = '暂无需重训';
  }

  const focusedClasses = topErrors.filter(e => e.priority > 30).map(e => e.class_name);
  const suggestedAugmentations: string[] = [];
  if (focusedClasses.length > 0) {
    suggestedAugmentations.push('copy_paste');
    suggestedAugmentations.push('mosaic');
  }
  if (criticalDrifts.length > 0) suggestedAugmentations.push('mixup');
  if (errorAnalysis.some(e => e.false_negatives > e.false_positives * 2)) suggestedAugmentations.push('random_affine');

  const severityFactor = priority === 'critical' ? 1.5 : priority === 'high' ? 1.0 : 0.5;
  return {
    should_retrain,
    reason,
    priority,
    suggested_epochs: Math.round(100 * severityFactor),
    suggested_lr: 0.01 * (priority === 'critical' ? 0.5 : priority === 'high' ? 0.8 : 1.0),
    suggested_augmentations: suggestedAugmentations,
    focus_classes: focusedClasses,
    estimated_gpu_hours: Math.round(2 * severityFactor * 10) / 10,
  };
}

// ─── Get Previous Context ───────────────────────────────────────────

function getPreviousBackflows(db: any, modelId: string): BackflowSummary[] {
  const rows = db.prepare(`
    SELECT id, model_id, backflow_type, metrics_json, retrained, improved, created_at
    FROM backflow_v2_reports WHERE model_id = ? ORDER BY created_at DESC LIMIT 5
  `).all(modelId) as any[];
  return rows.map(r => ({
    id: r.id, model_id: r.model_id, backflow_type: r.backflow_type,
    metrics: JSON.parse(r.metrics_json || '{}'),
    retrained: !!r.retrained, improved: !!r.improved, timestamp: r.created_at,
  }));
}

function getLastMetrics(db: any, modelId: string): Record<string, number> {
  const last = db.prepare(`
    SELECT metrics_json FROM backflow_v2_reports WHERE model_id = ? AND metrics_json IS NOT NULL ORDER BY created_at DESC LIMIT 1
  `).get(modelId) as any;
  return last ? JSON.parse(last.metrics_json || '{}') : {};
}

function findEnsembleCandidates(db: any, modelId: string): string[] {
  const rows = db.prepare(`
    SELECT DISTINCT m.id, m.name FROM models m
    WHERE m.architecture = (SELECT architecture FROM models WHERE id = ?)
    AND m.id != ? AND m.status = 'ready'
    ORDER BY m.created_at DESC LIMIT 3
  `).all(modelId, modelId) as any[];
  return rows.map(r => r.id);
}

// ─── Main Backflow Engine ───────────────────────────────────────────

function ensureTables(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS backflow_v2_reports (
      id TEXT PRIMARY KEY, model_id TEXT NOT NULL, model_name TEXT DEFAULT '',
      backflow_type TEXT NOT NULL, backflow_json TEXT NOT NULL DEFAULT '{}',
      metrics_json TEXT, drifts_json TEXT, error_analysis_json TEXT,
      retrain_suggestion_json TEXT, retrained INTEGER DEFAULT 0, improved INTEGER DEFAULT 0,
      feedback_items_json TEXT DEFAULT '[]', ensemble_models_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS backflow_v2_actions (
      id TEXT PRIMARY KEY, report_id TEXT NOT NULL, action_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending', result TEXT, job_id TEXT,
      created_at TEXT NOT NULL, completed_at TEXT
    );
  `);
}

export function registerBackflowV2Routes(app: FastifyInstance) {
  const db = getDatabase();
  ensureTables(db);

  // ── Execute backflow analysis ──────────────────────────────────
  app.post('/api/backflow/v2/analyze', async (request: any, reply: any) => {
    const input: BackflowInput = request.body || {};
    if (!input.model_id) return reply.code(400).send({ ok: false, error: 'model_id required' });

    const model = db.prepare('SELECT id, name, architecture, metrics_snapshot_json FROM models WHERE id = ?').get(input.model_id) as any;
    if (!model) return reply.code(404).send({ ok: false, error: 'model not found' });

    // Load validation report
    let validationReport: any = null;
    const reportPath = input.validation_report_path || '';
    if (reportPath && fs.existsSync(reportPath)) {
      try { validationReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8')); } catch { /* safe */ }
    }

    // Get current metrics
    const currentMetrics: Record<string, number> = { ...(input.metrics || {}) };
    if (Object.keys(currentMetrics).length === 0 && validationReport?.metrics) {
      Object.assign(currentMetrics, validationReport.metrics);
    }
    if (Object.keys(currentMetrics).length === 0 && model.metrics_snapshot_json) {
      try { Object.assign(currentMetrics, JSON.parse(model.metrics_snapshot_json)); } catch { /* safe */ }
    }

    // Previous context
    const prevBackflows = getPreviousBackflows(db, input.model_id);
    const previousMetrics = prevBackflows.length > 0 ? prevBackflows[0].metrics : {};
    const ensembleCandidates = findEnsembleCandidates(db, input.model_id);

    // Drift detection
    const drifts = Object.keys(previousMetrics).length > 0
      ? detectDrifts(currentMetrics, previousMetrics)
      : [];

    // Error analysis
    const errorAnalysis = analyzeErrors(validationReport);

    // Retrain suggestion
    const retrainSuggestion = suggestRetrain(drifts, errorAnalysis, prevBackflows);

    // Build report
    const reportId = `bf_${randomUUID().slice(0, 12)}`;
    const now = nowIso();
    const backflowType = drifts.some(d => d.drifted && d.severity === 'critical') ? 'critical'
      : drifts.some(d => d.drifted && d.severity === 'high') ? 'degradation'
      : drifts.some(d => d.drifted) ? 'drift' : 'pass';

    const report = {
      id: reportId, model_id: input.model_id, model_name: model.name, timestamp: now,
      backflow_type: backflowType, drifts, error_analysis: errorAnalysis, retrain_suggestion: retrainSuggestion,
      feedback_items: [], previous_backflows: prevBackflows, ensemble_models: ensembleCandidates,
    };

    // Persist
    db.prepare(`
      INSERT INTO backflow_v2_reports (id, model_id, model_name, backflow_type, backflow_json, metrics_json, drifts_json, error_analysis_json, retrain_suggestion_json, ensemble_models_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(reportId, input.model_id, model.name, backflowType, JSON.stringify(report), JSON.stringify(currentMetrics),
      JSON.stringify(drifts), JSON.stringify(errorAnalysis), JSON.stringify(retrainSuggestion), JSON.stringify(ensembleCandidates), now);

    // Auto-trigger retrain if needed
    let actionId: string | null = null;
    if (retrainSuggestion.should_retrain && input.auto_retrain !== false) {
      actionId = triggerAutoRetrain(db, reportId, input, retrainSuggestion, model);
    }

    // Log to audit
    db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'backflow_v2', 'analyze', ?, ?, ?, ?)`)
      .run(randomUUID(), input.model_id, backflowType === 'pass' ? 'success' : 'partial', JSON.stringify({ report_id: reportId, type: backflowType, should_retrain: retrainSuggestion.should_retrain }), now);

    return {
      ok: true, report_id: reportId, backflow_type: backflowType,
      drifts: drifts.filter(d => d.drifted).length, has_drift: drifts.some(d => d.drifted),
      retrain_suggestion: retrainSuggestion, auto_retrain_triggered: !!actionId, action_id: actionId,
      error_focus: errorAnalysis.slice(0, 3).map(e => e.class_name),
      ensemble_candidates: ensembleCandidates,
    };
  });

  // ── List reports ───────────────────────────────────────────────
  app.get('/api/backflow/v2/reports', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 20), 100);
    const modelId = request.query?.model_id || '';
    const rows = modelId
      ? db.prepare('SELECT * FROM backflow_v2_reports WHERE model_id = ? ORDER BY created_at DESC LIMIT ?').all(modelId, limit)
      : db.prepare('SELECT * FROM backflow_v2_reports ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, reports: rows, count: rows.length };
  });

  app.get('/api/backflow/v2/reports/:id', async (request: any, reply: any) => {
    const row = db.prepare('SELECT * FROM backflow_v2_reports WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'report not found' });
    return { ok: true, report: row };
  });

  // ── Retrain from backflow ──────────────────────────────────────
  app.post('/api/backflow/v2/retrain/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const report = db.prepare('SELECT * FROM backflow_v2_reports WHERE id = ?').get(id) as any;
    if (!report) return reply.code(404).send({ ok: false, error: 'report not found' });

    const suggestion = JSON.parse(report.retrain_suggestion_json || '{}');
    const modelId = report.model_id;

    // Create training v2 job
    const jobId = `bf_retrain_${randomUUID().slice(0, 8)}`;
    const now = nowIso();
    db.prepare(`INSERT INTO training_v2_jobs (id, name, status, architecture, hyperparams, created_at, updated_at) VALUES (?, ?, 'running', ?, ?, ?, ?)`)
      .run(jobId, `Backflow retrain: ${modelId}`, (suggestion.focus_classes || []).join(',') || 'yolo', JSON.stringify({
        epochs: suggestion.suggested_epochs || 50,
        lr: suggestion.suggested_lr || 0.01,
        augmentations: suggestion.suggested_augmentations || [],
      }), now, now);

    // Record action
    db.prepare(`INSERT INTO backflow_v2_actions (id, report_id, action_type, status, job_id, created_at) VALUES (?, ?, 'retrain', 'triggered', ?, ?)`)
      .run(randomUUID(), id, jobId, now);

    db.prepare('UPDATE backflow_v2_reports SET retrained = 1, updated_at = ? WHERE id = ?').run(now, id);

    return { ok: true, job_id: jobId, suggestion };
  });

  // ── Dashboard ─────────────────────────────────────────────────
  app.get('/api/backflow/v2/dashboard', async (_request, reply) => {
    const total = (db.prepare('SELECT COUNT(*) as c FROM backflow_v2_reports').get() as any)?.c || 0;
    const critical = (db.prepare("SELECT COUNT(*) as c FROM backflow_v2_reports WHERE backflow_type = 'critical'").get() as any)?.c || 0;
    const degradation = (db.prepare("SELECT COUNT(*) as c FROM backflow_v2_reports WHERE backflow_type = 'degradation'").get() as any)?.c || 0;
    const retrained = (db.prepare('SELECT COUNT(*) as c FROM backflow_v2_reports WHERE retrained = 1').get() as any)?.c || 0;
    const improved = (db.prepare('SELECT COUNT(*) as c FROM backflow_v2_reports WHERE improved = 1').get() as any)?.c || 0;
    const recent = db.prepare('SELECT id, model_id, model_name, backflow_type, retrained, improved, created_at FROM backflow_v2_reports ORDER BY created_at DESC LIMIT 10').all();
    return {
      ok: true, summary: { total, critical, degradation, pass: total - critical - degradation, retrained, improved },
      recent,
      health: critical > 0 ? '⚠️ 存在关键漂移' : degradation > 0 ? '🔶 存在性能退化' : '✅ 健康',
    };
  });
}

// ─── Auto Retrain Trigger ───────────────────────────────────────────

function triggerAutoRetrain(db: any, reportId: string, input: BackflowInput, suggestion: RetrainSuggestion, model: any): string {
  const actionId = randomUUID();
  const now = nowIso();

  const jobId = `bf_auto_${randomUUID().slice(0, 8)}`;
  db.prepare(`INSERT INTO training_v2_jobs (id, name, status, architecture, dataset_id, hyperparams, created_at, updated_at) VALUES (?, ?, 'running', ?, ?, ?, ?, ?)`)
    .run(jobId, `[Backflow] ${model.name} retrain`, model.architecture || 'yolov8n', input.dataset_id || '', JSON.stringify({
      epochs: suggestion.suggested_epochs, lr: suggestion.suggested_lr,
      augmentations: suggestion.suggested_augmentations, focus_classes: suggestion.focus_classes,
      backflow_report_id: reportId,
    }), now, now);

  db.prepare(`INSERT INTO backflow_v2_actions (id, report_id, action_type, status, job_id, created_at) VALUES (?, ?, 'auto_retrain', 'triggered', ?, ?)`)
    .run(actionId, reportId, jobId, now);

  db.prepare('UPDATE backflow_v2_reports SET retrained = 1, updated_at = ? WHERE id = ?').run(now, reportId);
  return actionId;
}
