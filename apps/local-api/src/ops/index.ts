// v2.5.0 — Ops Observability & Failure Insight
// 统一运营摘要 / 故障洞察 / 状态聚合读模型

import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { APP_VERSION } from '../version.js';

interface StatRow { count: number; status?: string; policy_type?: string; category?: string; action?: string; }
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'ignored';
type IncidentSourceType =
  | 'workflow_failure'
  | 'route_anomaly'
  | 'rule_blocked'
  | 'ops_health_anomaly'
  | 'feedback_risk_signal';

type IncidentRecord = {
  id: string;
  source_type: IncidentSourceType;
  source_id: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assignee: string;
  summary: string;
  probable_cause: string;
  resolution_summary: string;
  playbook_id: string;
  playbook_code: string;
  playbook_match_reason: string;
  playbook_run_status: string;
  playbook_step_completed: number;
  playbook_step_total: number;
  recommended_actions_json: string;
  evidence_refs_json: string;
  created_at: string;
  updated_at: string;
};

function tsWindow(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function safeCount(rows: any[]): number {
  return Array.isArray(rows) ? rows.length : 0;
}

// ── workflow job stats ────────────────────────────────────────────────────────

function getWorkflowJobStats(db: any, since?: string) {
  const sinceCond = since ? `created_at >= '${since}'` : null;

  const total = (db.prepare(
    since ? `SELECT COUNT(*) as count FROM workflow_jobs WHERE ${sinceCond}` : `SELECT COUNT(*) as count FROM workflow_jobs`
  ).get() as StatRow).count;
  const byStatus = db.prepare(
    since ? `SELECT status, COUNT(*) as count FROM workflow_jobs WHERE ${sinceCond} GROUP BY status`
          : `SELECT status, COUNT(*) as count FROM workflow_jobs GROUP BY status`
  ).all() as StatRow[];

  // recent failures: latest failed jobs
  const recentFailures = db.prepare(
    since
      ? `SELECT id, name, status, last_error, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'failed' AND updated_at >= '${since}' ORDER BY updated_at DESC LIMIT 20`
      : `SELECT id, name, status, last_error, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 20`
  ).all();

  // recent blocked/paused jobs
  const recentBlocked = db.prepare(
    since
      ? `SELECT id, name, status, current_step_index, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'paused' AND updated_at >= '${since}' ORDER BY updated_at DESC LIMIT 20`
      : `SELECT id, name, status, current_step_index, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'paused' ORDER BY updated_at DESC LIMIT 20`
  ).all();

  // recent cancelled
  const recentCancelled = db.prepare(
    since
      ? `SELECT id, name, status, cancelled_by, created_at, updated_at FROM workflow_jobs WHERE status = 'cancelled' AND updated_at >= '${since}' ORDER BY updated_at DESC LIMIT 20`
      : `SELECT id, name, status, cancelled_by, created_at, updated_at FROM workflow_jobs WHERE status = 'cancelled' ORDER BY updated_at DESC LIMIT 20`
  ).all();

  // retry_limit_exceeded count (from audit)
  const retryLimitExceeded = (db.prepare(`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE action = 'workflow_retry_limit_exceeded' ${since ? `AND created_at >= '${since}'` : ''}
  `).get() as StatRow).count;

  // stale reconciled count
  const staleReconciled = (db.prepare(`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE action = 'workflow_reconcile_stale' ${since ? `AND created_at >= '${since}'` : ''}
  `).get() as StatRow).count;

  return {
    total,
    byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
    recentFailures,
    recentBlocked,
    recentCancelled,
    retryLimitExceeded,
    staleReconciled,
  };
}

// ── approval stats ─────────────────────────────────────────────────────────────

function getApprovalStats(db: any, since?: string) {
  const sinceCond = since ? `created_at >= '${since}'` : null;

  const byStatus = db.prepare(
    since ? `SELECT status, COUNT(*) as count FROM approvals WHERE ${sinceCond} GROUP BY status`
          : `SELECT status, COUNT(*) as count FROM approvals GROUP BY status`
  ).all() as StatRow[];

  const byPolicy = db.prepare(
    since ? `SELECT policy_type, COUNT(*) as count FROM approvals WHERE ${sinceCond} GROUP BY policy_type`
          : `SELECT policy_type, COUNT(*) as count FROM approvals GROUP BY policy_type`
  ).all() as StatRow[];

  // recent pending approvals (most urgent)
  const recentPending = db.prepare(
    since ? `SELECT id, resource_id, step_name, policy_type, status, requested_by, comment, created_at, expires_at FROM approvals WHERE status = 'pending' AND ${sinceCond} ORDER BY created_at DESC LIMIT 20`
            : `SELECT id, resource_id, step_name, policy_type, status, requested_by, comment, created_at, expires_at FROM approvals WHERE status = 'pending' ORDER BY created_at DESC LIMIT 20`
  ).all();

  // recent approvals (all, for review)
  const recentAll = db.prepare(
    since ? `SELECT id, resource_id, step_name, policy_type, status, requested_by, reviewed_by, reviewed_at, comment, created_at, expires_at FROM approvals WHERE ${sinceCond} ORDER BY created_at DESC LIMIT 30`
           : `SELECT id, resource_id, step_name, policy_type, status, requested_by, reviewed_by, reviewed_at, comment, created_at, expires_at FROM approvals ORDER BY created_at DESC LIMIT 30`
  ).all();

  return {
    byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
    byPolicy: Object.fromEntries(byPolicy.map(r => [r.policy_type || 'unknown', r.count])),
    recentPending,
    recentAll,
  };
}

// ── audit recent ──────────────────────────────────────────────────────────────

function getAuditRecent(db: any, params: {
  limit?: number;
  category?: string;
  action?: string;
  since?: string;
}) {
  const limit = Math.min(params.limit || 50, 200);
  const conditions: string[] = [];
  if (params.category) conditions.push(`category = '${params.category}'`);
  if (params.action) conditions.push(`action = '${params.action}'`);
  if (params.since) conditions.push(`created_at >= '${params.since}'`);
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const logs = db.prepare(
    `SELECT id, category, action, target, result, detail_json, created_at FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ${limit}`
  ).all();

  return { logs, count: safeCount(logs) };
}

// ── ops summary ───────────────────────────────────────────────────────────────

function getOpsSummary(db: any) {
  const now = new Date().toISOString();
  const day1 = tsWindow(24);
  const day7 = tsWindow(168);

  const jobStats24h = getWorkflowJobStats(db, day1);
  const jobStats7d = getWorkflowJobStats(db, day7);
  const jobStatsAll = getWorkflowJobStats(db);

  const approvalStats24h = getApprovalStats(db, day1);
  const approvalStats7d = getApprovalStats(db, day7);
  const approvalStatsAll = getApprovalStats(db);

  // overall job status breakdown (all time)
  const overall = db.prepare('SELECT status, COUNT(*) as count FROM workflow_jobs GROUP BY status').all() as StatRow[];
  const overallApprovals = db.prepare('SELECT status, COUNT(*) as count FROM approvals GROUP BY status').all() as StatRow[];

  // failure category breakdown (from audit detail_json)
  const failureEvents = db.prepare(`
    SELECT id, category, action, target, detail_json, created_at
    FROM audit_logs
    WHERE action IN ('workflow_step_failed', 'workflow_job_failed', 'workflow_retry_limit_exceeded', 'approval_rejected')
    ORDER BY created_at DESC LIMIT 20
  `).all();

  return {
    timestamp: now,
    version: APP_VERSION,
    workflows: {
      total: jobStatsAll.total,
      allTime: { byStatus: jobStatsAll.byStatus },
      last24h: {
        byStatus: jobStats24h.byStatus,
        recentFailuresCount: safeCount(jobStats24h.recentFailures),
        recentBlockedCount: safeCount(jobStats24h.recentBlocked),
        retryLimitExceeded: jobStats24h.retryLimitExceeded,
        staleReconciled: jobStats24h.staleReconciled,
        recentFailures: jobStats24h.recentFailures.slice(0, 5),
        recentBlocked: jobStats24h.recentBlocked.slice(0, 5),
      },
      last7d: {
        byStatus: jobStats7d.byStatus,
        retryLimitExceeded: jobStats7d.retryLimitExceeded,
        staleReconciled: jobStats7d.staleReconciled,
      },
    },
    approvals: {
      allTime: { byStatus: Object.fromEntries(overallApprovals.map(r => [r.status, r.count])) },
      last24h: {
        byStatus: approvalStats24h.byStatus,
        byPolicy: approvalStats24h.byPolicy,
        pendingCount: approvalStats24h.byStatus['pending'] || 0,
        recentPending: approvalStats24h.recentPending.slice(0, 5),
      },
      last7d: {
        byStatus: approvalStats7d.byStatus,
        byPolicy: approvalStats7d.byPolicy,
        pendingCount: approvalStats7d.byStatus['pending'] || 0,
      },
    },
    failures: {
      recent: failureEvents.map(e => ({
        id: e.id,
        category: e.category,
        action: e.action,
        target: e.target,
        detail: parseDetail(e.detail_json),
        created_at: e.created_at,
      })),
    },
  };
}

function parseDetail(json: string | null): any {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return json; }
}

function parseObject(json: string | null): any {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function asJson(v: any): string {
  try {
    return JSON.stringify(v ?? []);
  } catch {
    return '[]';
  }
}

function parseJson(v: string | null): any {
  if (!v) return [];
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

function asArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return [v];
}

function buildIncidentId(sourceType: IncidentSourceType, sourceId: string): string {
  return `inc_${sourceType}_${sourceId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function writeIncidentAudit(db: any, action: string, target: string, result: 'success' | 'failed' | 'partial', detail: any) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'incident', ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), action, target, result, JSON.stringify(detail || {}), nowIso());
  } catch {}
}

function addIncidentAction(
  db: any,
  incidentId: string,
  actionType: string,
  fromStatus: string,
  toStatus: string,
  comment: string,
  actor: string,
  meta?: Record<string, any>,
) {
  try {
    db.prepare(`
      INSERT INTO incident_actions (id, incident_id, action_type, from_status, to_status, comment, actor, meta_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      incidentId,
      actionType,
      fromStatus || '',
      toStatus || '',
      comment || '',
      actor || 'system',
      JSON.stringify(meta || {}),
      nowIso(),
    );
  } catch {}
}

function upsertIncident(db: any, p: Omit<IncidentRecord, 'created_at' | 'updated_at'>) {
  const now = nowIso();
  const existing = db.prepare('SELECT id, status, assignee, probable_cause, resolution_summary, playbook_run_status, playbook_step_completed, playbook_step_total, created_at FROM incidents WHERE id = ?').get(p.id) as any;
  const statusToWrite: IncidentStatus = existing?.status === 'resolved' || existing?.status === 'ignored' ? existing.status : p.status;
  if (existing) {
    db.prepare(`
      UPDATE incidents
      SET source_type=?, source_id=?, severity=?, status=?, assignee=?, summary=?, probable_cause=?, resolution_summary=?, playbook_id=?, playbook_code=?, playbook_match_reason=?, playbook_run_status=?, playbook_step_completed=?, playbook_step_total=?, recommended_actions_json=?, evidence_refs_json=?, updated_at=?
      WHERE id=?
    `).run(
      p.source_type,
      p.source_id,
      p.severity,
      statusToWrite,
      existing.assignee || p.assignee || '',
      p.summary,
      p.probable_cause || existing.probable_cause || '',
      existing.resolution_summary || p.resolution_summary || '',
      p.playbook_id || '',
      p.playbook_code || '',
      p.playbook_match_reason || '',
      existing.playbook_run_status || p.playbook_run_status || 'not_started',
      Number(existing.playbook_step_completed ?? p.playbook_step_completed ?? 0),
      Math.max(Number(existing.playbook_step_total ?? 0), Number(p.playbook_step_total ?? 0)),
      p.recommended_actions_json,
      p.evidence_refs_json,
      now,
      p.id,
    );
    return;
  }
  db.prepare(`
    INSERT INTO incidents
    (id, source_type, source_id, severity, status, assignee, summary, probable_cause, resolution_summary, playbook_id, playbook_code, playbook_match_reason, playbook_run_status, playbook_step_completed, playbook_step_total, recommended_actions_json, evidence_refs_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    p.id,
    p.source_type,
    p.source_id,
    p.severity,
    statusToWrite,
    p.assignee || '',
    p.summary,
    p.probable_cause,
    p.resolution_summary || '',
    p.playbook_id || '',
    p.playbook_code || '',
    p.playbook_match_reason || '',
    p.playbook_run_status || 'not_started',
    Number(p.playbook_step_completed || 0),
    Number(p.playbook_step_total || 0),
    p.recommended_actions_json,
    p.evidence_refs_json,
    now,
    now,
  );
  addIncidentAction(db, p.id, 'incident_created', '', statusToWrite, 'incident created by sync', 'incident_sync', {
    source_type: p.source_type,
    source_id: p.source_id,
  });
}

function buildEvidenceRefShape() {
  return {
    jobs: [] as any[],
    routes: [] as any[],
    rules: [] as any[],
    feedback: [] as any[],
    artifacts: [] as any[],
    logs: [] as any[],
  };
}

function matchIncidentPlaybook(db: any, sourceType: IncidentSourceType, severity: IncidentSeverity, sourceId: string) {
  const rows = db.prepare(`
    SELECT id, playbook_code, applies_to_source_type, applies_to_severity, applies_to_pattern, steps_json
    FROM incident_playbooks
    WHERE enabled = 1
      AND (applies_to_source_type = ? OR applies_to_source_type = '*')
    ORDER BY CASE WHEN applies_to_source_type = ? THEN 2 ELSE 1 END DESC, version DESC, updated_at DESC
    LIMIT 20
  `).all(sourceType, sourceType) as any[];
  for (const r of rows) {
    const sevOk = !r.applies_to_severity || r.applies_to_severity === '*' || String(r.applies_to_severity).includes(severity);
    const pattern = String(r.applies_to_pattern || '').trim();
    const patternOk = !pattern || sourceId.includes(pattern);
    if (sevOk && patternOk) {
      const steps = parseJson(r.steps_json);
      return {
        id: String(r.id),
        playbook_code: String(r.playbook_code),
        reason: `matched by source_type=${sourceType}${pattern ? `,pattern=${pattern}` : ''}`,
        step_total: Array.isArray(steps) ? steps.length : 0,
      };
    }
  }
  return {
    id: '',
    playbook_code: '',
    reason: 'no playbook matched',
    step_total: 0,
  };
}

function ensureIncidentPlaybookRun(db: any, incident: any, actor: string) {
  if (!incident?.playbook_id) return null;
  const existing = db.prepare(`
    SELECT id, incident_id, playbook_id, playbook_code, run_status, current_step_index, total_steps, started_at, completed_at, aborted_at, result_note, review_summary_json, backflow_json, actor, created_at, updated_at
    FROM incident_playbook_runs
    WHERE incident_id = ?
    ORDER BY datetime(created_at) DESC
    LIMIT 1
  `).get(incident.id) as any;
  if (existing) return existing;
  const runId = crypto.randomUUID();
  const now = nowIso();
  db.prepare(`
    INSERT INTO incident_playbook_runs
    (id, incident_id, playbook_id, playbook_code, run_status, current_step_index, total_steps, started_at, completed_at, aborted_at, result_note, actor, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'not_started', 0, ?, '', '', '', '', ?, ?, ?)
  `).run(runId, incident.id, incident.playbook_id, incident.playbook_code, Number(incident.playbook_step_total || 0), actor || 'operator', now, now);
  return db.prepare(`
    SELECT id, incident_id, playbook_id, playbook_code, run_status, current_step_index, total_steps, started_at, completed_at, aborted_at, result_note, review_summary_json, backflow_json, actor, created_at, updated_at
    FROM incident_playbook_runs
    WHERE id = ?
  `).get(runId) as any;
}

function buildRunReviewSummary(run: any, incident: any, stepRows: any[]) {
  const completedSteps = (stepRows || []).filter((x: any) => x.action_type === 'playbook_step_complete').map((x: any) => x.step_index);
  const notes = (stepRows || []).filter((x: any) => x.action_type === 'playbook_note').map((x: any) => x.action_note).filter(Boolean);
  const lastStep = completedSteps.length ? Math.max(...completedSteps) : 0;
  const isCompleted = String(run?.run_status || '') === 'completed';
  const isAborted = String(run?.run_status || '') === 'aborted';
  return {
    what_happened: `${incident?.source_type || 'incident'} handled by ${run?.playbook_code || 'playbook'} with status ${run?.run_status || 'unknown'}`,
    what_was_done: `completed_steps=${completedSteps.length}, current_step=${run?.current_step_index || 0}`,
    what_resolved_it: isCompleted ? `step_${lastStep || run?.current_step_index || 0}` : '',
    where_it_got_stuck: isAborted ? `step_${run?.current_step_index || 0}` : '',
    operator_notes: notes.slice(-3).join(' | '),
    followup_suggestion: isAborted ? 'needs_update_or_manual_override' : (isCompleted ? 'consider_promoting_precheck_or_rule_hint' : 'continue_execution'),
  };
}

function runDurationMs(run: any): number {
  if (!run?.started_at) return 0;
  const start = new Date(run.started_at).getTime();
  const endAt = run?.completed_at || run?.aborted_at || run?.updated_at || '';
  const end = endAt ? new Date(endAt).getTime() : Date.now();
  return Math.max(0, end - start);
}

function evaluatePlaybookQuality(db: any, playbookId: string) {
  const now = nowIso();
  const boundCount = (db.prepare(`SELECT COUNT(*) as c FROM incidents WHERE playbook_id = ?`).get(playbookId) as any)?.c || 0;
  const rows = db.prepare(`
    SELECT run_status, current_step_index, total_steps, started_at, completed_at, aborted_at, updated_at
    FROM incident_playbook_runs
    WHERE playbook_id = ?
  `).all(playbookId) as any[];
  const started = rows.filter((r: any) => r.run_status !== 'not_started');
  const completed = rows.filter((r: any) => r.run_status === 'completed');
  const aborted = rows.filter((r: any) => r.run_status === 'aborted');
  const startedCount = started.length;
  const completedCount = completed.length;
  const abortedCount = aborted.length;
  const completionRate = startedCount > 0 ? completedCount / startedCount : 0;
  const abortRate = startedCount > 0 ? abortedCount / startedCount : 0;
  const avgCompletionSteps = completedCount > 0
    ? completed.reduce((acc: number, x: any) => acc + Number(x.current_step_index || 0), 0) / completedCount
    : 0;
  const completedDurations = completed.map((x: any) => runDurationMs(x)).filter((x: number) => x > 0);
  const avgCompletionTimeMs = completedDurations.length > 0
    ? Math.round(completedDurations.reduce((a: number, b: number) => a + b, 0) / completedDurations.length)
    : 0;
  const effectiveScore = Math.max(0, Math.min(100, Math.round(completionRate * 100)));
  const qualityScore = Math.max(0, Math.min(100, Math.round((completionRate * 0.7 + (1 - abortRate) * 0.3) * 100)));

  const stepRows = db.prepare(`
    SELECT step_index, action_type, run_id
    FROM incident_playbook_steps
    WHERE playbook_id = ?
  `).all(playbookId) as any[];
  const stepStatsMap: Record<string, any> = {};
  for (const s of stepRows) {
    const k = String(Number(s.step_index || 0));
    if (!stepStatsMap[k]) stepStatsMap[k] = { step_index: Number(k), hit_count: 0, completed_count: 0, stuck_count: 0 };
    stepStatsMap[k].hit_count += 1;
    if (s.action_type === 'playbook_step_complete') stepStatsMap[k].completed_count += 1;
  }
  const abortedByRun = db.prepare(`
    SELECT id, current_step_index
    FROM incident_playbook_runs
    WHERE playbook_id = ? AND run_status = 'aborted'
  `).all(playbookId) as any[];
  for (const a of abortedByRun) {
    const k = String(Number(a.current_step_index || 0));
    if (!stepStatsMap[k]) stepStatsMap[k] = { step_index: Number(k), hit_count: 0, completed_count: 0, stuck_count: 0 };
    stepStatsMap[k].stuck_count += 1;
  }
  const stepStats = Object.values(stepStatsMap).sort((a: any, b: any) => a.step_index - b.step_index);
  const needsRevision = abortRate >= 0.5 || qualityScore < 50 || stepStats.some((s: any) => s.stuck_count >= 2);

  db.prepare(`
    UPDATE incident_playbooks
    SET quality_score = ?, effectiveness_score = ?, last_evaluated_at = ?, needs_revision = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(qualityScore, effectiveScore, now, needsRevision ? 1 : 0, needsRevision ? 'watch' : 'active', now, playbookId);

  writeIncidentAudit(db, 'playbook_quality_evaluated', playbookId, 'success', {
    playbook_id: playbookId,
    bound_count: boundCount,
    started_count: startedCount,
    completed_count: completedCount,
    aborted_count: abortedCount,
    avg_completion_steps: avgCompletionSteps,
    avg_completion_time_ms: avgCompletionTimeMs,
    completion_rate: completionRate,
    abort_rate: abortRate,
    quality_score: qualityScore,
    effectiveness_score: effectiveScore,
    needs_revision: needsRevision,
  });
  if (needsRevision) {
    writeIncidentAudit(db, 'playbook_marked_needs_revision', playbookId, 'success', {
      playbook_id: playbookId,
      reason: 'high_abort_or_low_quality_or_stuck_steps',
    });
  }
  return {
    bound_count: boundCount,
    started_count: startedCount,
    completed_count: completedCount,
    aborted_count: abortedCount,
    avg_completion_steps: Number(avgCompletionSteps.toFixed(2)),
    avg_completion_time_ms: avgCompletionTimeMs,
    completion_rate: Number(completionRate.toFixed(4)),
    abort_rate: Number(abortRate.toFixed(4)),
    quality_score: qualityScore,
    effectiveness_score: effectiveScore,
    last_evaluated_at: now,
    needs_revision: needsRevision,
    step_stats: stepStats,
  };
}

function backflowPlaybookOutcome(db: any, incident: any, run: any, summary: any, actor: string) {
  const now = nowIso();
  const evidence = {
    incident_id: incident.id,
    source_type: incident.source_type,
    playbook_id: incident.playbook_id,
    playbook_code: incident.playbook_code,
    run_id: run.id,
    run_status: run.run_status,
    current_step_index: run.current_step_index,
    review: summary,
  };
  if (incident.source_type === 'workflow_failure' && incident.source_id) {
    db.prepare(`
      INSERT INTO task_reflections
      (id, job_id, template_id, status, what_failed, what_worked, root_cause, wrong_assumption, fix_applied, evidence_json, next_time_rule_draft, created_at, updated_at)
      VALUES (?, ?, '', ?, ?, ?, ?, '', ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      String(incident.source_id),
      run.run_status === 'completed' ? 'completed' : 'failed',
      summary.what_happened || '',
      summary.what_was_done || '',
      incident.probable_cause || '',
      run.result_note || '',
      JSON.stringify(evidence),
      summary.followup_suggestion || '',
      now,
      now,
    );
  }
  const pat = db.prepare(`SELECT id, recommended_actions_json, latest_evidence_json, hit_count FROM error_patterns WHERE step_key = ? ORDER BY datetime(updated_at) DESC LIMIT 1`).get(incident.source_type) as any;
  if (pat) {
    const rec = parseJson(pat.recommended_actions_json);
    rec.push({ type: 'playbook_outcome', playbook_code: incident.playbook_code, run_status: run.run_status, suggestion: summary.followup_suggestion || '' });
    db.prepare(`
      UPDATE error_patterns
      SET recommended_actions_json = ?, latest_evidence_json = ?, hit_count = ?, last_seen_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(rec.slice(-20)),
      JSON.stringify(evidence),
      Number(pat.hit_count || 0) + 1,
      now,
      now,
      pat.id,
    );
  }
  db.prepare(`
    UPDATE incident_playbook_runs
    SET review_summary_json = ?, backflow_json = ?, updated_at = ?
    WHERE id = ?
  `).run(JSON.stringify(summary), JSON.stringify(evidence), now, run.id);
  writeIncidentAudit(db, 'playbook_outcome_backflow', incident.id, 'success', {
    incident_id: incident.id,
    playbook_id: incident.playbook_id,
    run_id: run.id,
    actor,
    run_status: run.run_status,
    followup_suggestion: summary.followup_suggestion || '',
  });
}

function buildAssistantDiagnosticResult(incident: any, reqPayload: any) {
  const source = String(incident?.source_type || '');
  const severity = String(incident?.severity || 'medium');
  const riskLevel = (severity === 'critical' || severity === 'high') ? 'high' : (severity === 'medium' ? 'medium' : 'low');
  const manualConfirmationRequired = riskLevel === 'high' || source === 'rule_blocked';
  const recommended = [
    { type: 'diagnostic_summary', step: '先校验上下文证据', detail: '优先核对 incident evidence 与最近审计日志一致性。', manual_confirmation_required: false },
    { type: 'safe_action', step: '执行只读排查', detail: '仅执行 read_state/read_logs/precheck_inputs 类动作，不触发主链改动。', manual_confirmation_required: false },
    { type: 'manual_gate', step: '人工确认高风险建议', detail: '涉及规则阈值、配置变更、发布/回滚时必须人工确认。', manual_confirmation_required: true },
  ];
  return {
    role: 'diagnostic_assistant',
    diagnosis_summary: `OpenClaw 对 incident ${incident.id} 给出诊断：当前最可能为 ${source} 相关异常，建议先只读排查后人工确认处置。`,
    probable_root_cause: incident.probable_cause || `Likely root cause around ${source}`,
    recommended_actions_json: recommended,
    risk_level: riskLevel,
    confidence: riskLevel === 'high' ? 0.72 : 0.81,
    evidence_notes_json: [
      { note: 'evidence_refs reviewed', incident_id: incident.id },
      { note: 'job/trace linkage checked where available', job_id: incident.source_type === 'workflow_failure' ? incident.source_id : '' },
    ],
    manual_confirmation_required: manualConfirmationRequired,
    suggested_playbook_adjustments: [
      { suggestion: 'add precheck for latest audit consistency', source_type: source },
    ],
    suggested_rule_evidence: [
      { suggestion: 'append diagnostic evidence into rule/pattern references', source_type: source },
    ],
    model_meta: {
      provider: 'openclaw',
      mode: 'diagnostic_assistant',
      request_hint: reqPayload?.request_hint || '',
    },
  };
}

async function runAssistantDiagnosticBridge(db: any, incident: any, reqPayload: any) {
  const oc = db.prepare(`SELECT enabled, circuit_state, error_reason FROM openclaw_control WHERE id = 1`).get() as any;
  const forceFail = !!reqPayload?.force_fail;
  if (forceFail) throw new Error('forced_failure_for_validation');
  if (!oc || Number(oc.enabled || 0) !== 1) throw new Error('openclaw_disabled');
  if (String(oc.circuit_state || 'normal') === 'triggered') throw new Error('openclaw_circuit_triggered');
  return buildAssistantDiagnosticResult(incident, reqPayload);
}

function buildEvidenceFingerprint(evidenceRefs: any): string {
  const refs = Array.isArray(evidenceRefs) ? evidenceRefs : [];
  const keys = refs.map((x: any) => `${String(x?.type || '')}:${String(x?.id || x?.ref || '')}`).slice(0, 6);
  return keys.join('|');
}

function findRecentReusableRequest(db: any, incident: any, probableCause: string, evidenceFingerprint: string) {
  return db.prepare(`
    SELECT id, incident_id, source_type, severity, probable_cause, summary, response_json, updated_at
    FROM assistant_diagnostic_requests
    WHERE status = 'completed'
      AND source_type = ?
      AND severity = ?
      AND probable_cause = ?
      AND reuse_hint_json LIKE ?
      AND datetime(updated_at) >= datetime('now', '-24 hours')
    ORDER BY datetime(updated_at) DESC
    LIMIT 1
  `).get(
    String(incident?.source_type || ''),
    String(incident?.severity || ''),
    String(probableCause || ''),
    `%${evidenceFingerprint}%`,
  ) as any;
}

function evaluateAssistantGate(db: any, incident: any, probableCause: string, evidenceFingerprint: string) {
  const status = String(incident?.status || 'open');
  if (status === 'resolved' || status === 'ignored') {
    return { decision: 'blocked', reason: `incident_status_${status}`, manual_confirmation_required: false, reuse: null };
  }
  const reuseHit = findRecentReusableRequest(db, incident, probableCause, evidenceFingerprint);
  const sev = String(incident?.severity || 'medium');
  const source = String(incident?.source_type || '');
  if (sev === 'low' && reuseHit) {
    return {
      decision: 'blocked',
      reason: 'low_severity_recent_reuse_hit',
      manual_confirmation_required: false,
      reuse: { mode: 'reuse_suggested', request_id: reuseHit.id, updated_at: reuseHit.updated_at },
    };
  }
  if (reuseHit) {
    return {
      decision: 'manual_confirmation_required',
      reason: 'recent_reuse_hit_manual_decision',
      manual_confirmation_required: true,
      reuse: { mode: 'reuse_or_rerun', request_id: reuseHit.id, updated_at: reuseHit.updated_at },
    };
  }
  if (sev === 'critical' || sev === 'high' || source === 'rule_blocked') {
    return { decision: 'manual_confirmation_required', reason: 'high_risk_requires_human_gate', manual_confirmation_required: true, reuse: null };
  }
  return { decision: 'allowed', reason: 'default_allowed', manual_confirmation_required: false, reuse: null };
}

function buildAssistantGatePolicyHints(db: any) {
  const rows = db.prepare(`
    SELECT source_type,
           COUNT(*) as requested,
           SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed,
           SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted,
           SUM(CASE WHEN adoption_status='rejected' THEN 1 ELSE 0 END) as rejected,
           SUM(CASE WHEN reuse_hit=1 THEN 1 ELSE 0 END) as reuse_hits,
           SUM(CASE WHEN gate_decision='blocked' THEN 1 ELSE 0 END) as blocked
    FROM assistant_diagnostic_requests
    GROUP BY source_type
  `).all() as any[];
  const hints: any[] = [];
  for (const r of rows) {
    const requested = Number(r.requested || 0);
    const completed = Number(r.completed || 0);
    const adopted = Number(r.adopted || 0);
    const failed = Number(r.failed || 0);
    const reuseHits = Number(r.reuse_hits || 0);
    const adoptionRate = completed > 0 ? adopted / completed : 0;
    const failureRate = requested > 0 ? failed / requested : 0;
    const reuseRate = requested > 0 ? reuseHits / requested : 0;
    let suggestion = 'keep_current_gate';
    let reason = 'baseline';
    if (adoptionRate >= 0.6 && failureRate <= 0.2) { suggestion = 'more_aggressive_allow'; reason = 'high_adoption_low_failure'; }
    else if (reuseRate >= 0.4) { suggestion = 'prefer_reuse_then_manual'; reason = 'high_reuse_gain'; }
    else if (adoptionRate < 0.25 && failureRate > 0.35) { suggestion = 'prefer_block_or_manual'; reason = 'low_value_high_failure'; }
    hints.push({
      source_type: r.source_type || '',
      requested,
      adoption_rate: adoptionRate,
      failure_rate: failureRate,
      reuse_rate: reuseRate,
      blocked_count: Number(r.blocked || 0),
      suggestion,
      reason,
    });
  }
  return hints.sort((a, b) => Number(b.adoption_rate) - Number(a.adoption_rate));
}

function opsSinceByRange(range: string): string {
  if (String(range || '').toLowerCase() === '7d') return tsWindow(24 * 7);
  return tsWindow(24);
}

function opsMetricDictionary() {
  return [
    { category: 'quality', metric: 'workflow_success_rate', formula: 'completed_workflow_jobs / total_workflow_jobs', source: ['workflow_jobs'], refresh: 'request-time', status: 'available' },
    { category: 'quality', metric: 'incident_completion_rate', formula: 'resolved_incidents / total_incidents', source: ['incidents'], refresh: 'request-time', status: 'available' },
    { category: 'quality', metric: 'playbook_completion_rate', formula: 'completed_playbook_runs / total_playbook_runs', source: ['incident_playbook_runs'], refresh: 'request-time', status: 'available' },
    { category: 'quality', metric: 'assistant_adoption_rate', formula: 'adopted_assistant_requests / completed_assistant_requests', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'quality', metric: 'rule_positive_feedback_rate', formula: '(rule_feedback useful+adopted) / total_rule_feedback', source: ['rule_feedback'], refresh: 'request-time', status: 'available' },
    { category: 'latency', metric: 'avg_workflow_completion_time_s', formula: 'avg(workflow_jobs.updated_at-created_at where status=completed)', source: ['workflow_jobs'], refresh: 'request-time', status: 'available' },
    { category: 'latency', metric: 'avg_incident_time_to_first_action_s', formula: 'avg(min(incident_actions.created_at)-incidents.created_at)', source: ['incidents', 'incident_actions'], refresh: 'request-time', status: 'available' },
    { category: 'latency', metric: 'avg_incident_time_to_resolution_s', formula: 'avg(last_resolved_action_at-incidents.created_at)', source: ['incidents', 'incident_actions'], refresh: 'request-time', status: 'available' },
    { category: 'latency', metric: 'avg_assistant_response_time_ms', formula: 'avg(assistant_diagnostic_requests.response_time_ms where status=completed)', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'latency', metric: 'avg_playbook_completion_time_s', formula: 'avg(incident_playbook_runs.completed_at-started_at)', source: ['incident_playbook_runs'], refresh: 'request-time', status: 'available' },
    { category: 'cost', metric: 'route_decision_distribution', formula: 'count by route_type', source: ['route_decisions'], refresh: 'request-time', status: 'available' },
    { category: 'cost', metric: 'cloud_diagnostic_request_count', formula: 'count(assistant_diagnostic_requests)', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'cost', metric: 'blocked_saved_count', formula: 'count(gate_decision=blocked)', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'cost', metric: 'reuse_success_count', formula: 'count(reuse_hit=1 and status=completed)', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'cost', metric: 'cloud_cost_proxy_units', formula: 'completed_assistant_requests - blocked_saved_count - reuse_success_count', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'proxy' },
    { category: 'risk', metric: 'high_severity_incident_count', formula: 'count(incidents severity in critical/high)', source: ['incidents'], refresh: 'request-time', status: 'available' },
    { category: 'risk', metric: 'blocked_or_frozen_rule_count', formula: "count(learned_rules status in blocked/frozen or mode=blocked)", source: ['learned_rules'], refresh: 'request-time', status: 'available' },
    { category: 'risk', metric: 'high_risk_assistant_ratio', formula: 'high_risk_assistant_requests / total_assistant_requests', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'risk', metric: 'needs_revision_playbook_count', formula: 'count(incident_playbooks.needs_revision=1)', source: ['incident_playbooks'], refresh: 'request-time', status: 'available' },
    { category: 'risk', metric: 'open_incident_count', formula: "count(incidents status in open/in_progress)", source: ['incidents'], refresh: 'request-time', status: 'available' },
    { category: 'value', metric: 'assistant_adoption_lift', formula: 'assistant_adoption_rate - assistant_rejection_rate', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'value', metric: 'playbook_effectiveness_score', formula: 'avg(incident_playbooks.effectiveness_score)', source: ['incident_playbooks'], refresh: 'request-time', status: 'available' },
    { category: 'value', metric: 'rule_quality_score', formula: 'avg(learned_rules.quality_score)', source: ['learned_rules'], refresh: 'request-time', status: 'available' },
    { category: 'value', metric: 'source_type_cloud_helpfulness', formula: 'source_type adoption+reuse composite', source: ['assistant_diagnostic_requests'], refresh: 'request-time', status: 'available' },
    { category: 'value', metric: 'gate_policy_hint_count', formula: 'count(generated gate_policy_hints)', source: ['assistant_diagnostic_requests', 'audit_logs'], refresh: 'request-time', status: 'available' },
  ];
}

function buildOperationsSnapshot(db: any, range: string, sourceType: string) {
  const since = opsSinceByRange(range);
  const sourceCond = `AND (@sourceType='' OR source_type = @sourceType)`;
  const pBase: any = { since };
  const pSource: any = { since, sourceType };

  const wf = db.prepare(`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed,
           AVG(CASE WHEN status='completed' THEN (julianday(updated_at)-julianday(created_at))*86400 END) as avg_time_s
    FROM workflow_jobs
    WHERE datetime(created_at) >= datetime(@since)
  `).get(pBase) as any;

  const inc = db.prepare(`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) as resolved,
           SUM(CASE WHEN status IN ('open','in_progress') THEN 1 ELSE 0 END) as open_count,
           SUM(CASE WHEN severity IN ('critical','high') THEN 1 ELSE 0 END) as high_risk
    FROM incidents
    WHERE datetime(created_at) >= datetime(@since) ${sourceCond}
  `).get(pSource) as any;

  const incFirst = db.prepare(`
    SELECT AVG((julianday(a.first_action_at)-julianday(i.created_at))*86400) as avg_ttf_action_s
    FROM incidents i
    JOIN (
      SELECT incident_id, MIN(created_at) as first_action_at
      FROM incident_actions
      WHERE datetime(created_at) >= datetime(@since)
      GROUP BY incident_id
    ) a ON a.incident_id = i.id
    WHERE datetime(i.created_at) >= datetime(@since) ${sourceCond}
  `).get(pSource) as any;

  const incRes = db.prepare(`
    SELECT AVG((julianday(a.resolved_at)-julianday(i.created_at))*86400) as avg_ttr_s
    FROM incidents i
    JOIN (
      SELECT incident_id, MAX(created_at) as resolved_at
      FROM incident_actions
      WHERE action_type='resolve' AND datetime(created_at) >= datetime(@since)
      GROUP BY incident_id
    ) a ON a.incident_id = i.id
    WHERE datetime(i.created_at) >= datetime(@since) ${sourceCond}
  `).get(pSource) as any;

  const playbook = db.prepare(`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN run_status='completed' THEN 1 ELSE 0 END) as completed,
           AVG(CASE WHEN run_status='completed' AND started_at<>'' AND completed_at<>'' THEN (julianday(completed_at)-julianday(started_at))*86400 END) as avg_completion_s
    FROM incident_playbook_runs
    WHERE datetime(created_at) >= datetime(@since)
  `).get(pBase) as any;

  const playbookRisk = db.prepare(`SELECT COUNT(*) as needs_revision_count FROM incident_playbooks WHERE needs_revision = 1`).get() as any;

  const assistant = db.prepare(`
    SELECT COUNT(*) as requested,
           SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed,
           SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted,
           SUM(CASE WHEN adoption_status='rejected' THEN 1 ELSE 0 END) as rejected,
           SUM(CASE WHEN gate_decision='blocked' THEN 1 ELSE 0 END) as blocked_saved,
           SUM(CASE WHEN reuse_hit=1 AND status='completed' THEN 1 ELSE 0 END) as reuse_success,
           AVG(CASE WHEN status='completed' THEN response_time_ms END) as avg_response_ms,
           SUM(CASE WHEN json_extract(response_json,'$.risk_level')='high' THEN 1 ELSE 0 END) as high_risk_count
    FROM assistant_diagnostic_requests
    WHERE datetime(created_at) >= datetime(@since) ${sourceCond}
  `).get(pSource) as any;

  const routeRows = db.prepare(`
    SELECT route_type, COUNT(*) as count
    FROM route_decisions
    WHERE datetime(created_at) >= datetime(@since)
    GROUP BY route_type
    ORDER BY count DESC
  `).all(pBase) as any[];

  const ruleFeedback = db.prepare(`
    SELECT COUNT(*) as total,
           SUM(CASE WHEN feedback_type IN ('useful','adopted') THEN 1 ELSE 0 END) as positive
    FROM rule_feedback
    WHERE datetime(created_at) >= datetime(@since)
  `).get(pBase) as any;

  const ruleRisk = db.prepare(`
    SELECT COUNT(*) as blocked_or_frozen_count,
           AVG(quality_score) as avg_quality_score
    FROM learned_rules
    WHERE (status IN ('blocked','frozen') OR mode='blocked')
  `).get() as any;

  const ruleQualityAvg = db.prepare(`SELECT AVG(quality_score) as avg_quality_score FROM learned_rules`).get() as any;
  const playbookEffectivenessAvg = db.prepare(`SELECT AVG(effectiveness_score) as avg_effectiveness_score FROM incident_playbooks`).get() as any;

  const sourceHelpful = db.prepare(`
    SELECT source_type,
           COUNT(*) as requested_count,
           SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_count,
           SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted_count,
           SUM(CASE WHEN reuse_hit=1 AND status='completed' THEN 1 ELSE 0 END) as reuse_count,
           SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed_count
    FROM assistant_diagnostic_requests
    WHERE datetime(created_at) >= datetime(@since)
    GROUP BY source_type
  `).all(pBase) as any[];

  const sourceHelpfulness = sourceHelpful.map((r: any) => {
    const requested = Number(r.requested_count || 0);
    const completed = Number(r.completed_count || 0);
    const adoptionRate = completed > 0 ? Number(r.adopted_count || 0) / completed : 0;
    const reuseRate = requested > 0 ? Number(r.reuse_count || 0) / requested : 0;
    const failureRate = requested > 0 ? Number(r.failed_count || 0) / requested : 0;
    const helpfulScore = Number((adoptionRate * 0.6 + reuseRate * 0.3 - failureRate * 0.3).toFixed(4));
    return { source_type: r.source_type || '', requested_count: requested, adoption_rate: adoptionRate, reuse_rate: reuseRate, failure_rate: failureRate, helpful_score: helpfulScore };
  }).sort((a: any, b: any) => Number(b.helpful_score) - Number(a.helpful_score));

  const hintCount = buildAssistantGatePolicyHints(db).length;
  const topRisks = (db.prepare(`
    SELECT id, source_type, severity, status, summary, updated_at
    FROM incidents
    WHERE status IN ('open','in_progress') AND datetime(created_at) >= datetime(@since) ${sourceCond}
    ORDER BY CASE severity WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC, datetime(updated_at) DESC
    LIMIT 5
  `).all(pSource) as any[]);

  const topBottlenecks = [
    { domain: 'workflow', metric: 'avg_workflow_completion_time_s', value: Number(wf?.avg_time_s || 0) },
    { domain: 'incidents', metric: 'avg_incident_time_to_resolution_s', value: Number(incRes?.avg_ttr_s || 0) },
    { domain: 'playbook', metric: 'avg_playbook_completion_time_s', value: Number(playbook?.avg_completion_s || 0) },
  ].sort((a, b) => Number(b.value) - Number(a.value));

  const topValueOpportunities = sourceHelpfulness.slice(0, 5);
  const topWaste = [
    { type: 'blocked_saved', count: Number(assistant?.blocked_saved || 0), note: 'blocked gate replaced potential cloud diagnostic calls' },
    { type: 'reuse_success', count: Number(assistant?.reuse_success || 0), note: 'reuse avoided repeated cloud diagnostics' },
    { type: 'assistant_rejected', count: Number(assistant?.rejected || 0), note: 'low value assistant recommendations' },
  ].sort((a, b) => Number(b.count) - Number(a.count));

  const quality = {
    workflow_success_rate: Number(wf?.total || 0) > 0 ? Number(wf?.completed || 0) / Number(wf?.total || 1) : 0,
    incident_completion_rate: Number(inc?.total || 0) > 0 ? Number(inc?.resolved || 0) / Number(inc?.total || 1) : 0,
    playbook_completion_rate: Number(playbook?.total || 0) > 0 ? Number(playbook?.completed || 0) / Number(playbook?.total || 1) : 0,
    assistant_adoption_rate: Number(assistant?.completed || 0) > 0 ? Number(assistant?.adopted || 0) / Number(assistant?.completed || 1) : 0,
    rule_positive_feedback_rate: Number(ruleFeedback?.total || 0) > 0 ? Number(ruleFeedback?.positive || 0) / Number(ruleFeedback?.total || 1) : 0,
  };
  const latency = {
    avg_workflow_completion_time_s: Number(wf?.avg_time_s || 0),
    avg_incident_time_to_first_action_s: Number(incFirst?.avg_ttf_action_s || 0),
    avg_incident_time_to_resolution_s: Number(incRes?.avg_ttr_s || 0),
    avg_assistant_response_time_ms: Number(assistant?.avg_response_ms || 0),
    avg_playbook_completion_time_s: Number(playbook?.avg_completion_s || 0),
  };
  const cost = {
    route_decision_distribution: routeRows,
    cloud_diagnostic_request_count: Number(assistant?.requested || 0),
    blocked_saved_count: Number(assistant?.blocked_saved || 0),
    reuse_success_count: Number(assistant?.reuse_success || 0),
    cloud_cost_proxy_units: Math.max(0, Number(assistant?.completed || 0) - Number(assistant?.blocked_saved || 0) - Number(assistant?.reuse_success || 0)),
  };
  const risk = {
    high_severity_incident_count: Number(inc?.high_risk || 0),
    blocked_or_frozen_rule_count: Number(ruleRisk?.blocked_or_frozen_count || 0),
    high_risk_assistant_ratio: Number(assistant?.requested || 0) > 0 ? Number(assistant?.high_risk_count || 0) / Number(assistant?.requested || 1) : 0,
    needs_revision_playbook_count: Number(playbookRisk?.needs_revision_count || 0),
    open_incident_count: Number(inc?.open_count || 0),
  };
  const value = {
    assistant_adoption_lift: quality.assistant_adoption_rate - (Number(assistant?.completed || 0) > 0 ? Number(assistant?.rejected || 0) / Number(assistant?.completed || 1) : 0),
    playbook_effectiveness_score: Number(playbookEffectivenessAvg?.avg_effectiveness_score || 0),
    rule_quality_score: Number(ruleQualityAvg?.avg_quality_score || 0),
    source_type_cloud_helpfulness: sourceHelpfulness.slice(0, 8),
    gate_policy_hint_count: hintCount,
  };

  const since24h = tsWindow(24);
  const since7d = tsWindow(24 * 7);
  const incident24h = db.prepare(`SELECT source_type, COUNT(*) as count FROM incidents WHERE datetime(created_at)>=datetime(@since) GROUP BY source_type`).all({ since: since24h }) as any[];
  const incident7d = db.prepare(`SELECT source_type, COUNT(*) as count FROM incidents WHERE datetime(created_at)>=datetime(@since) GROUP BY source_type`).all({ since: since7d }) as any[];
  const adopt24h = db.prepare(`SELECT SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM assistant_diagnostic_requests WHERE datetime(created_at)>=datetime(@since)`).get({ since: since24h }) as any;
  const adopt7d = db.prepare(`SELECT SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM assistant_diagnostic_requests WHERE datetime(created_at)>=datetime(@since)`).get({ since: since7d }) as any;
  const playbook24h = db.prepare(`SELECT SUM(CASE WHEN run_status='completed' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN run_status='aborted' THEN 1 ELSE 0 END) as aborted FROM incident_playbook_runs WHERE datetime(created_at)>=datetime(@since)`).get({ since: since24h }) as any;
  const playbook7d = db.prepare(`SELECT SUM(CASE WHEN run_status='completed' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN run_status='aborted' THEN 1 ELSE 0 END) as aborted FROM incident_playbook_runs WHERE datetime(created_at)>=datetime(@since)`).get({ since: since7d }) as any;
  const ruleFb24h = db.prepare(`SELECT SUM(CASE WHEN feedback_type IN ('useful','adopted') THEN 1 ELSE 0 END) as positive, COUNT(*) as total FROM rule_feedback WHERE datetime(created_at)>=datetime(@since)`).get({ since: since24h }) as any;
  const ruleFb7d = db.prepare(`SELECT SUM(CASE WHEN feedback_type IN ('useful','adopted') THEN 1 ELSE 0 END) as positive, COUNT(*) as total FROM rule_feedback WHERE datetime(created_at)>=datetime(@since)`).get({ since: since7d }) as any;

  const attribution = {
    range_compare: {
      incidents_by_source_24h: incident24h,
      incidents_by_source_7d: incident7d,
      assistant_adoption_rate_24h: Number(adopt24h?.completed || 0) > 0 ? Number(adopt24h?.adopted || 0) / Number(adopt24h?.completed || 1) : 0,
      assistant_adoption_rate_7d: Number(adopt7d?.completed || 0) > 0 ? Number(adopt7d?.adopted || 0) / Number(adopt7d?.completed || 1) : 0,
      playbook_completion_24h: Number(playbook24h?.completed || 0),
      playbook_aborted_24h: Number(playbook24h?.aborted || 0),
      playbook_completion_7d: Number(playbook7d?.completed || 0),
      playbook_aborted_7d: Number(playbook7d?.aborted || 0),
      rule_positive_rate_24h: Number(ruleFb24h?.total || 0) > 0 ? Number(ruleFb24h?.positive || 0) / Number(ruleFb24h?.total || 1) : 0,
      rule_positive_rate_7d: Number(ruleFb7d?.total || 0) > 0 ? Number(ruleFb7d?.positive || 0) / Number(ruleFb7d?.total || 1) : 0,
    },
    probable_drivers: [
      'incident source_type distribution shift',
      'assistant adoption/rejection drift',
      'playbook abort ratio change',
      'rule feedback positivity change',
    ],
    linked_evidence_refs: {
      audit: '/api/audit?limit=100',
      incidents: '/api/incidents?limit=100',
      assistant: '/api/governance/assistant-quality',
      playbook_quality: '/api/playbook-quality/overview',
    },
    recommended_focus_areas: [
      topRisks[0] ? `priority incident: ${topRisks[0].id}` : 'stabilize open high severity incidents',
      topBottlenecks[0] ? `bottleneck domain: ${topBottlenecks[0].domain}` : 'reduce end-to-end latency hotspots',
      topWaste[0] ? `waste reduction target: ${topWaste[0].type}` : 'improve gate/reuse efficiency',
    ],
  };

  return {
    scope: { range: String(range || '24h'), source_type: sourceType || '' },
    dictionary: opsMetricDictionary(),
    overview: {
      quality,
      latency,
      cost,
      risk,
      value,
      priority_board: {
        top_risks: topRisks,
        top_bottlenecks: topBottlenecks,
        top_value_opportunities: topValueOpportunities,
        top_waste: topWaste,
      },
      attribution,
    },
  };
}

function applyAssistantBackflow(db: any, incidentId: string, requestId: string, adoption: 'adopted' | 'rejected', actor: string, note: string) {
  const now = nowIso();
  const incident = db.prepare(`SELECT id, source_type, playbook_id, playbook_code FROM incidents WHERE id = ?`).get(incidentId) as any;
  const req = db.prepare(`
    SELECT id, source_type, severity, probable_cause, summary, response_json, gate_decision, reuse_hit
    FROM assistant_diagnostic_requests
    WHERE id = ? AND incident_id = ?
  `).get(requestId, incidentId) as any;
  if (!incident || !req) return { pattern_id: '', rule_id: '', playbook_id: '' };
  const response = parseObject(req.response_json || '{}');
  const backflowBrief = {
    incident_id: incidentId,
    request_id: requestId,
    adoption,
    actor,
    summary: String(response?.diagnosis_summary || req.summary || ''),
    risk_level: String(response?.risk_level || ''),
    confidence: Number(response?.confidence || 0),
    note: note || '',
    at: now,
  };

  const pattern = db.prepare(`
    SELECT id, recommended_actions_json, latest_evidence_json, assistant_backflow_json, assistant_adopted_count, assistant_rejected_count
    FROM error_patterns
    WHERE step_key = ?
    ORDER BY datetime(updated_at) DESC LIMIT 1
  `).get(incident.source_type) as any
    || db.prepare(`
      SELECT id, recommended_actions_json, latest_evidence_json, assistant_backflow_json, assistant_adopted_count, assistant_rejected_count
      FROM error_patterns
      ORDER BY datetime(updated_at) DESC LIMIT 1
    `).get() as any;
  let patternId = '';
  if (pattern) {
    patternId = String(pattern.id || '');
    const oldBackflow = parseObject(pattern.assistant_backflow_json || '{}');
    const oldActions = parseJson(pattern.recommended_actions_json || '[]');
    const nextActions = oldActions.concat([
      {
        type: 'assistant_backflow',
        adoption,
        reason: note || 'assistant diagnostic feedback',
        request_id: requestId,
      },
    ]).slice(-30);
    const nextBackflow = {
      ...(oldBackflow || {}),
      last: backflowBrief,
      signals: asArray((oldBackflow as any)?.signals).concat([{ adoption, request_id: requestId, at: now }]).slice(-30),
    };
    db.prepare(`
      UPDATE error_patterns
      SET recommended_actions_json = ?, latest_evidence_json = ?, assistant_backflow_json = ?,
          assistant_adopted_count = assistant_adopted_count + ?, assistant_rejected_count = assistant_rejected_count + ?, updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(nextActions),
      JSON.stringify({ ...(parseObject(pattern.latest_evidence_json || '{}') || {}), assistant: backflowBrief }),
      JSON.stringify(nextBackflow),
      adoption === 'adopted' ? 1 : 0,
      adoption === 'rejected' ? 1 : 0,
      now,
      pattern.id,
    );
    writeIncidentAudit(db, 'assistant_pattern_backflow', incidentId, 'success', {
      incident_id: incidentId,
      request_id: requestId,
      target_id: patternId,
      actor,
      reason: adoption,
      summary: `pattern backflow (${adoption})`,
    });
  }

  const rule = db.prepare(`
    SELECT id, scope, assistant_evidence_json
    FROM learned_rules
    WHERE enabled = 1 AND (scope = ? OR scope LIKE ?)
    ORDER BY confidence DESC, datetime(updated_at) DESC
    LIMIT 1
  `).get(incident.source_type, `%${incident.source_type}%`) as any
    || db.prepare(`SELECT id, scope, assistant_evidence_json FROM learned_rules WHERE enabled=1 ORDER BY confidence DESC, datetime(updated_at) DESC LIMIT 1`).get() as any;
  let ruleId = '';
  if (rule) {
    ruleId = String(rule.id || '');
    const oldEvidence = parseObject(rule.assistant_evidence_json || '{}');
    const allRows = db.prepare(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted
      FROM assistant_diagnostic_requests
      WHERE source_type = ?
    `).get(incident.source_type) as any;
    const rate = Number(allRows?.total || 0) > 0 ? Number(allRows?.adopted || 0) / Number(allRows.total || 1) : 0;
    const nextEvidence = {
      ...(oldEvidence || {}),
      source_type: incident.source_type,
      adoption_rate: rate,
      last: backflowBrief,
      hints: asArray((oldEvidence as any)?.hints).concat([
        { type: 'assistant_collab_signal', adoption, request_id: requestId, summary: backflowBrief.summary },
      ]).slice(-30),
    };
    db.prepare(`
      UPDATE learned_rules
      SET assistant_evidence_json = ?, assistant_adoption_rate = ?, cloud_helpful = ?, updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(nextEvidence),
      rate,
      rate >= 0.55 ? 1 : 0,
      now,
      rule.id,
    );
    writeIncidentAudit(db, 'assistant_rule_backflow', incidentId, 'success', {
      incident_id: incidentId,
      request_id: requestId,
      target_id: ruleId,
      actor,
      reason: adoption,
      summary: `rule evidence backflow (${adoption})`,
    });
  }

  let playbookId = '';
  if (incident.playbook_id) {
    const p = db.prepare(`
      SELECT id, assistant_playbook_evidence_json, playbook_improvement_hint, playbook_needs_revision_assistant_hint
      FROM incident_playbooks WHERE id = ?
    `).get(incident.playbook_id) as any;
    if (p) {
      playbookId = String(p.id || '');
      const oldEvidence = parseObject(p.assistant_playbook_evidence_json || '{}');
      const signals = asArray((oldEvidence as any)?.signals);
      const nextSignals = signals.concat([{ adoption, request_id: requestId, source_type: incident.source_type, at: now }]).slice(-40);
      const adoptedCount = nextSignals.filter((s: any) => s.adoption === 'adopted').length;
      const nextHint = adoptedCount >= 3
        ? `assistant建议在${incident.source_type}场景已多次采纳，建议评审剧本预检与后续建议`
        : String(p.playbook_improvement_hint || '');
      db.prepare(`
        UPDATE incident_playbooks
        SET assistant_playbook_evidence_json = ?, playbook_improvement_hint = ?, playbook_needs_revision_assistant_hint = ?, updated_at = ?
        WHERE id = ?
      `).run(
        JSON.stringify({ ...(oldEvidence || {}), last: backflowBrief, signals: nextSignals }),
        nextHint,
        adoptedCount >= 3 ? 1 : Number(p.playbook_needs_revision_assistant_hint || 0),
        now,
        p.id,
      );
      writeIncidentAudit(db, 'assistant_playbook_backflow', incidentId, 'success', {
        incident_id: incidentId,
        request_id: requestId,
        target_id: playbookId,
        actor,
        reason: adoption,
        summary: `playbook evidence backflow (${adoption})`,
      });
    }
  }

  db.prepare(`
    UPDATE assistant_diagnostic_requests
    SET pattern_backflow_id = ?, rule_backflow_id = ?, playbook_backflow_id = ?, updated_at = ?
    WHERE id = ?
  `).run(patternId, ruleId, playbookId, now, requestId);

  return { pattern_id: patternId, rule_id: ruleId, playbook_id: playbookId };
}

function generateIncidents(db: any, actor = 'incident_sync', trigger = 'manual') {
  const createdOrUpdatedIds: string[] = [];
  const bySource: Record<IncidentSourceType, number> = {
    workflow_failure: 0,
    route_anomaly: 0,
    rule_blocked: 0,
    ops_health_anomaly: 0,
    feedback_risk_signal: 0,
  };

  const failedJobs = db.prepare(`
    SELECT id, name, template_id, error_message, updated_at
    FROM workflow_jobs
    WHERE status='failed'
    ORDER BY updated_at DESC
    LIMIT 50
  `).all() as any[];
  for (const job of failedJobs) {
    const sourceId = String(job.id);
    const id = buildIncidentId('workflow_failure', sourceId);
    const pb = matchIncidentPlaybook(db, 'workflow_failure', 'high', sourceId);
    const steps = db.prepare(`
      SELECT id, step_key, status, error_message, output_json, updated_at
      FROM job_steps WHERE job_id = ?
      ORDER BY step_order ASC
    `).all(sourceId) as any[];
    const failedSteps = steps.filter((s: any) => String(s.status) === 'failed');
    const routeRows = db.prepare(`
      SELECT id, task_type, route_type, route_reason, created_at
      FROM route_decisions
      WHERE task_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(sourceId) as any[];
    const ruleRows = db.prepare(`
      SELECT id, rule_id, feedback_type, created_at
      FROM rule_feedback
      WHERE job_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(sourceId) as any[];
    const auditRows = db.prepare(`
      SELECT id, category, action, target, created_at
      FROM audit_logs
      WHERE target = ? OR detail_json LIKE ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(sourceId, `%${sourceId}%`) as any[];
    const evidence = buildEvidenceRefShape();
    evidence.jobs.push({
      job_id: sourceId,
      template_id: job.template_id || '',
      failed_step_keys: failedSteps.map((s: any) => s.step_key),
    });
    evidence.routes.push(...routeRows.map((r: any) => ({
      route_decision_id: r.id,
      route_type: r.route_type,
      task_type: r.task_type,
      route_reason: r.route_reason,
      created_at: r.created_at,
    })));
    evidence.rules.push(...ruleRows.map((r: any) => ({
      rule_event_id: r.id,
      rule_id: r.rule_id,
      feedback_type: r.feedback_type,
      created_at: r.created_at,
    })));
    for (const s of steps) {
      const out = parseObject(s.output_json)?.output || {};
      if (out.feedback_id) evidence.feedback.push({ feedback_id: String(out.feedback_id), step_id: s.id, step_key: s.step_key });
      if (out.artifact_id || out.release_id || out.model_id || out.dataset_id || out.evaluation_id) {
        evidence.artifacts.push({
          step_id: s.id,
          step_key: s.step_key,
          artifact_id: out.artifact_id || '',
          release_id: out.release_id || '',
          model_id: out.model_id || '',
          dataset_id: out.dataset_id || '',
          evaluation_id: out.evaluation_id || '',
        });
      }
    }
    evidence.logs.push(...auditRows.map((a: any) => ({
      log_id: a.id,
      category: a.category,
      action: a.action,
      target: a.target,
      created_at: a.created_at,
    })));
    upsertIncident(db, {
      id,
      source_type: 'workflow_failure',
      source_id: sourceId,
      severity: 'high',
      status: 'open',
      assignee: '',
      summary: `Workflow Job 失败: ${job.name || sourceId}`,
      probable_cause: String(job.error_message || '任务执行阶段异常失败'),
      resolution_summary: '',
      playbook_id: pb.id,
      playbook_code: pb.playbook_code,
      playbook_match_reason: pb.reason,
      playbook_run_status: 'not_started',
      playbook_step_completed: 0,
      playbook_step_total: pb.step_total,
      recommended_actions_json: asJson([
        { step: '先查什么', detail: '先查看该 job 的失败 step 与 error_message。' },
        { step: '关联排查', detail: '关联检查 route_decisions、rule_feedback、feedback_batches、audit_logs。' },
        { step: '证据入口', detail: `/api/governance/jobs/${sourceId}/trace` },
      ]),
      evidence_refs_json: asJson(evidence),
    });
    if (pb.id) writeIncidentAudit(db, 'incident_playbook_bound', id, 'success', { source_type: 'workflow_failure', source_id: sourceId, playbook_id: pb.id, playbook_code: pb.playbook_code, reason: pb.reason, actor, trigger });
    createdOrUpdatedIds.push(id);
    bySource.workflow_failure += 1;
  }

  const routeAnomalies = db.prepare(`
    SELECT COALESCE(task_type,'unknown') as task_type, COUNT(*) as c, MAX(created_at) as latest_at
    FROM route_decisions
    WHERE (
      LOWER(route_type) LIKE '%fallback%'
      OR LOWER(route_reason) LIKE '%fallback%'
      OR LOWER(route_reason) LIKE '%degraded%'
    ) AND created_at >= datetime('now','-24 hours')
    GROUP BY COALESCE(task_type,'unknown')
    HAVING c >= 3
    ORDER BY c DESC
    LIMIT 20
  `).all() as any[];
  for (const r of routeAnomalies) {
    const sourceId = `${r.task_type}_24h`;
    const id = buildIncidentId('route_anomaly', sourceId);
    const sev: IncidentSeverity = Number(r.c || 0) >= 10 ? 'high' : 'medium';
    const pb = matchIncidentPlaybook(db, 'route_anomaly', sev, sourceId);
    const routeRows = db.prepare(`
      SELECT id, task_id, route_type, route_reason, created_at
      FROM route_decisions
      WHERE COALESCE(task_type,'unknown') = ? AND created_at >= datetime('now','-24 hours')
      ORDER BY created_at DESC
      LIMIT 10
    `).all(r.task_type) as any[];
    const evidence = buildEvidenceRefShape();
    evidence.routes.push(...routeRows.map((x: any) => ({
      route_decision_id: x.id,
      task_id: x.task_id,
      route_type: x.route_type,
      route_reason: x.route_reason,
      created_at: x.created_at,
    })));
    upsertIncident(db, {
      id,
      source_type: 'route_anomaly',
      source_id: sourceId,
      severity: sev,
      status: 'open',
      assignee: '',
      summary: `Route 异常聚集: ${r.task_type} (${r.c}/24h)`,
      probable_cause: '路由降级/回退频率偏高，可能存在上游能力波动或策略配置不稳。',
      resolution_summary: '',
      playbook_id: pb.id,
      playbook_code: pb.playbook_code,
      playbook_match_reason: pb.reason,
      playbook_run_status: 'not_started',
      playbook_step_completed: 0,
      playbook_step_total: pb.step_total,
      recommended_actions_json: asJson([
        { step: '先查什么', detail: '先查 route_reason 明细与 route_type 分布。' },
        { step: '关联排查', detail: '关联 workflow_jobs、route_policies、audit_logs(route*)。' },
        { step: '证据入口', detail: '/api/governance/overview + /api/audit/recent?action=route_decision' },
      ]),
      evidence_refs_json: asJson({
        ...evidence,
        logs: [
          { type: 'route_anomaly_count', task_type: r.task_type, count_24h: r.c, latest_at: r.latest_at || '' },
        ],
      }),
    });
    if (pb.id) writeIncidentAudit(db, 'incident_playbook_bound', id, 'success', { source_type: 'route_anomaly', source_id: sourceId, playbook_id: pb.id, playbook_code: pb.playbook_code, reason: pb.reason, actor, trigger });
    createdOrUpdatedIds.push(id);
    bySource.route_anomaly += 1;
  }

  const blockedRules = db.prepare(`
    SELECT COALESCE(target,'rule_unknown') as target, COUNT(*) as c, MAX(created_at) as latest_at
    FROM audit_logs
    WHERE action='rule_blocked' AND created_at >= datetime('now','-24 hours')
    GROUP BY COALESCE(target,'rule_unknown')
    HAVING c >= 3
    ORDER BY c DESC
    LIMIT 20
  `).all() as any[];
  for (const r of blockedRules) {
    const sourceId = String(r.target || 'rule_unknown');
    const id = buildIncidentId('rule_blocked', sourceId);
    const sev: IncidentSeverity = Number(r.c || 0) >= 10 ? 'high' : 'medium';
    const pb = matchIncidentPlaybook(db, 'rule_blocked', sev, sourceId);
    const logs = db.prepare(`
      SELECT id, target, action, detail_json, created_at
      FROM audit_logs
      WHERE action='rule_blocked' AND COALESCE(target,'rule_unknown') = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(sourceId) as any[];
    const evidence = buildEvidenceRefShape();
    evidence.rules.push(...logs.map((x: any) => ({
      audit_log_id: x.id,
      target: x.target,
      action: x.action,
      detail: parseObject(x.detail_json),
      created_at: x.created_at,
    })));
    upsertIncident(db, {
      id,
      source_type: 'rule_blocked',
      source_id: sourceId,
      severity: sev,
      status: 'open',
      assignee: '',
      summary: `Rule 阻塞高频: ${sourceId} (${r.c}/24h)`,
      probable_cause: '规则命中后阻断频率偏高，可能存在规则阈值过严或数据输入质量问题。',
      resolution_summary: '',
      playbook_id: pb.id,
      playbook_code: pb.playbook_code,
      playbook_match_reason: pb.reason,
      playbook_run_status: 'not_started',
      playbook_step_completed: 0,
      playbook_step_total: pb.step_total,
      recommended_actions_json: asJson([
        { step: '先查什么', detail: '先查该 rule 的最近 block 原因与命中输入。' },
        { step: '关联排查', detail: '关联 job_steps、rule_feedback、audit_logs(rule_blocked)。' },
        { step: '证据入口', detail: '/api/audit/recent?action=rule_blocked&hours=24' },
      ]),
      evidence_refs_json: asJson({
        ...evidence,
        logs: [
          { type: 'rule_blocked_count', rule_target: sourceId, count_24h: r.c, latest_at: r.latest_at || '' },
        ],
      }),
    });
    if (pb.id) writeIncidentAudit(db, 'incident_playbook_bound', id, 'success', { source_type: 'rule_blocked', source_id: sourceId, playbook_id: pb.id, playbook_code: pb.playbook_code, reason: pb.reason, actor, trigger });
    createdOrUpdatedIds.push(id);
    bySource.rule_blocked += 1;
  }

  const failedJobs24h = (db.prepare(`
    SELECT COUNT(*) as c FROM workflow_jobs
    WHERE status='failed' AND updated_at >= datetime('now','-24 hours')
  `).get() as any)?.c || 0;
  const pendingApprovals = (db.prepare(`
    SELECT COUNT(*) as c FROM approvals WHERE status='pending'
  `).get() as any)?.c || 0;
  if (failedJobs24h >= 5 || pendingApprovals >= 10) {
    const sourceId = 'health_snapshot_24h';
    const id = buildIncidentId('ops_health_anomaly', sourceId);
    const sev: IncidentSeverity = failedJobs24h >= 10 ? 'critical' : 'high';
    const pb = matchIncidentPlaybook(db, 'ops_health_anomaly', sev, sourceId);
    upsertIncident(db, {
      id,
      source_type: 'ops_health_anomaly',
      source_id: sourceId,
      severity: sev,
      status: 'open',
      assignee: '',
      summary: `Ops 健康异常: failed_jobs_24h=${failedJobs24h}, pending_approvals=${pendingApprovals}`,
      probable_cause: '失败任务/待审批积压导致治理吞吐下降，需进行拥塞与失败根因排查。',
      resolution_summary: '',
      playbook_id: pb.id,
      playbook_code: pb.playbook_code,
      playbook_match_reason: pb.reason,
      playbook_run_status: 'not_started',
      playbook_step_completed: 0,
      playbook_step_total: pb.step_total,
      recommended_actions_json: asJson([
        { step: '先查什么', detail: '先查 failed workflow jobs Top N 与 pending approvals 列表。' },
        { step: '关联排查', detail: '关联 workflow_jobs、approvals、route_decisions、audit_logs。' },
        { step: '证据入口', detail: '/api/ops/health-snapshot + /api/workflow-jobs/stats?hours=24' },
      ]),
      evidence_refs_json: asJson({
        ...buildEvidenceRefShape(),
        logs: [
          { type: 'failed_jobs_24h', value: failedJobs24h },
          { type: 'pending_approvals', value: pendingApprovals },
        ],
      }),
    });
    if (pb.id) writeIncidentAudit(db, 'incident_playbook_bound', id, 'success', { source_type: 'ops_health_anomaly', source_id: sourceId, playbook_id: pb.id, playbook_code: pb.playbook_code, reason: pb.reason, actor, trigger });
    createdOrUpdatedIds.push(id);
    bySource.ops_health_anomaly += 1;
  }

  const riskyFeedback = db.prepare(`
    SELECT id, title, status, updated_at
    FROM feedback_batches
    WHERE (
      status IN ('risk', 'blocked', 'failed')
      OR LOWER(notes) LIKE '%risk%'
      OR LOWER(notes) LIKE '%degraded%'
    )
    ORDER BY updated_at DESC
    LIMIT 30
  `).all() as any[];
  for (const f of riskyFeedback) {
    const sourceId = String(f.id);
    const id = buildIncidentId('feedback_risk_signal', sourceId);
    const pb = matchIncidentPlaybook(db, 'feedback_risk_signal', 'medium', sourceId);
    upsertIncident(db, {
      id,
      source_type: 'feedback_risk_signal',
      source_id: sourceId,
      severity: 'medium',
      status: 'open',
      assignee: '',
      summary: `Feedback 风险信号: ${f.title || sourceId}`,
      probable_cause: '反馈批次呈现风险状态，可能存在样本质量问题或模型漂移风险。',
      resolution_summary: '',
      playbook_id: pb.id,
      playbook_code: pb.playbook_code,
      playbook_match_reason: pb.reason,
      playbook_run_status: 'not_started',
      playbook_step_completed: 0,
      playbook_step_total: pb.step_total,
      recommended_actions_json: asJson([
        { step: '先查什么', detail: '先查看 feedback batch notes/status 与关联模型版本。' },
        { step: '关联排查', detail: '关联 feedback_items、models、evaluations、audit_logs(feedback*)。' },
        { step: '证据入口', detail: `/api/feedback-batches/${sourceId}` },
      ]),
      evidence_refs_json: asJson({
        ...buildEvidenceRefShape(),
        feedback: [
          { feedback_id: sourceId, status: f.status || '', updated_at: f.updated_at || '' },
        ],
      }),
    });
    if (pb.id) writeIncidentAudit(db, 'incident_playbook_bound', id, 'success', { source_type: 'feedback_risk_signal', source_id: sourceId, playbook_id: pb.id, playbook_code: pb.playbook_code, reason: pb.reason, actor, trigger });
    createdOrUpdatedIds.push(id);
    bySource.feedback_risk_signal += 1;
  }

  const summary = {
    total_touched: createdOrUpdatedIds.length,
    by_source: bySource,
  };
  writeIncidentAudit(db, 'incident_synced', 'incidents', 'success', { actor, trigger, ...summary });
  return summary;
}

function collectJobTrace(db: any, jobId: string) {
  const job = db.prepare(`
    SELECT id, name, status, template_id, input_json, output_summary_json, created_at, updated_at, finished_at, error_message
    FROM workflow_jobs WHERE id = ?
  `).get(jobId) as any;
  if (!job) return { ok: false, error: 'Job not found' };

  const routeDecisions = db.prepare(`
    SELECT id, task_id, task_type, policy_id, route_type, route_reason, input_json, created_at
    FROM route_decisions WHERE task_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(jobId) as any[];

  const ruleEvents = db.prepare(`
    SELECT id, rule_id, job_id, step_id, feedback_type, comment, created_by, created_at
    FROM rule_feedback WHERE job_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(jobId) as any[];

  const steps = db.prepare(`
    SELECT id, step_key, step_name, status, output_json, error_message, started_at, finished_at
    FROM job_steps WHERE job_id = ? ORDER BY step_order
  `).all(jobId) as any[];

  const feedbackRefs = steps
    .map((s: any) => ({ step_id: s.id, step_key: s.step_key, output: parseObject(s.output_json)?.output || {} }))
    .filter((x: any) => !!x.output.feedback_id)
    .map((x: any) => ({
      feedback_id: x.output.feedback_id,
      step_id: x.step_id,
      step_key: x.step_key,
      backflow_type: x.output.backflow_type || '',
      model_id: x.output.model_id || '',
      validation_id: x.output.validation_id || '',
      feedback_dir: x.output.feedback_dir || '',
    }));

  const feedbackBatches = feedbackRefs.length
    ? db.prepare(`SELECT id, title, source_type, source_id, status, notes, created_at FROM feedback_batches WHERE id IN (${feedbackRefs.map(() => '?').join(',')})`).all(...feedbackRefs.map((r: any) => r.feedback_id))
    : [];

  const auditRefs = db.prepare(`
    SELECT id, category, action, target, result, detail_json, created_at
    FROM audit_logs
    WHERE target = ? OR detail_json LIKE ?
    ORDER BY created_at DESC LIMIT 80
  `).all(jobId, `%${jobId}%`) as any[];

  const artifactRefs = steps.map((s: any) => {
    const out = parseObject(s.output_json)?.output || {};
    return {
      step_key: s.step_key,
      model_id: out.model_id || null,
      dataset_id: out.dataset_id || null,
      evaluation_id: out.evaluation_id || null,
      artifact_id: out.artifact_id || null,
      release_id: out.release_id || null,
      rule_run_id: out.rule_run_id || null,
    };
  }).filter((x: any) => Object.values(x).some((v) => !!v));
  const relatedIncidents = db.prepare(`
    SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause, updated_at
    FROM incidents
    WHERE (source_type = 'workflow_failure' AND source_id = ?)
       OR (evidence_refs_json LIKE ?)
    ORDER BY datetime(updated_at) DESC
    LIMIT 20
  `).all(jobId, `%${jobId}%`) as any[];

  return {
    ok: true,
    trace: {
      job: {
        ...job,
        input_json: parseObject(job.input_json),
        output_summary_json: parseObject(job.output_summary_json),
      },
      route_decisions: routeDecisions.map((d: any) => ({ ...d, input_json: parseObject(d.input_json) })),
      rule_events: ruleEvents,
      feedback_refs: feedbackRefs,
      feedback_batches: feedbackBatches,
      audit_refs: auditRefs.map((a: any) => ({ ...a, detail_json: parseObject(a.detail_json) })),
      artifact_refs: artifactRefs,
      related_incidents: relatedIncidents,
      steps: steps.map((s: any) => ({ ...s, output_json: parseObject(s.output_json) })),
    },
  };
}

function getGovernanceOverview(db: any, limit = 20) {
  const n = Math.min(Math.max(Number(limit || 20), 5), 100);
  const jobs = db.prepare(`
    SELECT id, name, status, template_id, created_at, updated_at, finished_at
    FROM workflow_jobs ORDER BY updated_at DESC LIMIT ?
  `).all(n);
  const decisions = db.prepare(`
    SELECT id, task_id, task_type, route_type, route_reason, created_at
    FROM route_decisions ORDER BY created_at DESC LIMIT ?
  `).all(n);
  const ruleHits = db.prepare(`
    SELECT id, rule_id, job_id, step_id, feedback_type, created_at
    FROM rule_feedback ORDER BY created_at DESC LIMIT ?
  `).all(n);
  const feedback = db.prepare(`
    SELECT id, title, source_type, source_id, status, notes, created_at
    FROM feedback_batches ORDER BY created_at DESC LIMIT ?
  `).all(n);
  const auditSummaryRows = db.prepare(`
    SELECT category, action, result, COUNT(*) as count
    FROM audit_logs
    WHERE created_at >= ?
    GROUP BY category, action, result
    ORDER BY count DESC
    LIMIT 50
  `).all(tsWindow(24));
  const incidents = db.prepare(`
    SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause, resolution_summary,
           playbook_id, playbook_code, playbook_match_reason, playbook_run_status, playbook_step_completed, playbook_step_total,
           assistant_diagnosis_summary, assistant_confidence, assistant_risk_level, assistant_manual_confirmation_required, assistant_last_request_id, assistant_last_status,
           created_at, updated_at
    FROM incidents
    ORDER BY datetime(updated_at) DESC
    LIMIT ?
  `).all(n);

  return {
    recent_jobs: jobs,
    route_decisions: decisions,
    rule_hits: ruleHits,
    feedback_refs: feedback,
    audit_summary_24h: auditSummaryRows,
    incidents,
  };
}

function getHealthSnapshot(db: any) {
  const failedJobs = db.prepare(`
    SELECT id, name, status, error_message, updated_at
    FROM workflow_jobs WHERE status = 'failed'
    ORDER BY updated_at DESC LIMIT 20
  `).all();
  const keyApiStatus = {
    workflow_jobs: true,
    cost_routing: true,
    feedback: true,
    audit: true,
    ops: true,
  };
  return {
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime_sec: Math.round(process.uptime()),
      node: process.version,
      platform: process.platform,
    },
    database: {
      ok: true,
      workflow_jobs_total: (db.prepare('SELECT COUNT(*) as n FROM workflow_jobs').get() as any)?.n || 0,
      route_decisions_total: (db.prepare('SELECT COUNT(*) as n FROM route_decisions').get() as any)?.n || 0,
      feedback_batches_total: (db.prepare('SELECT COUNT(*) as n FROM feedback_batches').get() as any)?.n || 0,
      audit_logs_total: (db.prepare('SELECT COUNT(*) as n FROM audit_logs').get() as any)?.n || 0,
    },
    key_api_status: keyApiStatus,
    recent_failed_jobs: failedJobs,
  };
}

// ── route registration ────────────────────────────────────────────────────────

export function registerOpsRoutes(app: FastifyInstance) {

  // GET /api/ops/summary — unified ops dashboard data
  app.get('/api/ops/summary', async (request: any) => {
    try {
      const db = getDatabase();
      return { ok: true, data: getOpsSummary(db) };
    } catch (err: any) {
      app.log.error({ err }, 'ops/summary error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/workflow-jobs/stats — workflow job stats with time window
  app.get('/api/workflow-jobs/stats', async (request: any) => {
    try {
      const db = getDatabase();
      const hours = parseInt(request.query.hours || '0', 10);
      const since = hours > 0 ? tsWindow(hours) : undefined;
      const sinceLabel = hours > 0 ? `last ${hours}h` : 'all time';
      const stats = getWorkflowJobStats(db, since);
      return {
        ok: true,
        window: sinceLabel,
        data: {
          total: stats.total,
          byStatus: stats.byStatus,
          recentFailures: stats.recentFailures,
          recentBlocked: stats.recentBlocked,
          recentCancelled: stats.recentCancelled,
          retryLimitExceeded: stats.retryLimitExceeded,
          staleReconciled: stats.staleReconciled,
        },
      };
    } catch (err: any) {
      app.log.error({ err }, 'workflow-jobs/stats error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/approvals/stats — approval stats with time window
  app.get('/api/approvals/stats', async (request: any) => {
    try {
      const db = getDatabase();
      const hours = parseInt(request.query.hours || '0', 10);
      const since = hours > 0 ? tsWindow(hours) : undefined;
      const sinceLabel = hours > 0 ? `last ${hours}h` : 'all time';
      const stats = getApprovalStats(db, since);
      return {
        ok: true,
        window: sinceLabel,
        data: {
          byStatus: stats.byStatus,
          byPolicy: stats.byPolicy,
          recentPending: stats.recentPending,
          recentAll: stats.recentAll,
        },
      };
    } catch (err: any) {
      app.log.error({ err }, 'approvals/stats error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/audit/recent — recent audit logs
  app.get('/api/audit/recent', async (request: any) => {
    try {
      const db = getDatabase();
      const limit = Math.min(parseInt(request.query.limit || '50', 10), 200);
      const category = request.query.category as string | undefined;
      const action = request.query.action as string | undefined;
      const hours = parseInt(request.query.hours || '0', 10);
      const since = hours > 0 ? tsWindow(hours) : undefined;
      const result = getAuditRecent(db, { limit, category, action, since });
      return {
        ok: true,
        count: result.count,
        data: result.logs.map((l: any) => ({
          id: l.id,
          category: l.category,
          action: l.action,
          target: l.target,
          result: l.result,
          detail: parseDetail(l.detail_json),
          created_at: l.created_at,
        })),
      };
    } catch (err: any) {
      app.log.error({ err }, 'audit/recent error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/governance/jobs/:id/trace — unified governance trace by job_id
  app.get('/api/governance/jobs/:id/trace', async (request: any) => {
    try {
      const db = getDatabase();
      return collectJobTrace(db, request.params.id);
    } catch (err: any) {
      app.log.error({ err }, 'governance/jobs/:id/trace error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/governance/overview — minimal governance hub aggregate
  app.get('/api/governance/overview', async (request: any) => {
    try {
      const db = getDatabase();
      const limit = parseInt(request.query.limit || '20', 10);
      return { ok: true, data: getGovernanceOverview(db, limit) };
    } catch (err: any) {
      app.log.error({ err }, 'governance/overview error');
      return { ok: false, error: err.message };
    }
  });

  // POST /api/incidents/sync — build incidents from existing governance signals
  app.post('/api/incidents/sync', async (request: any) => {
    try {
      const db = getDatabase();
      const actor = String(request.body?.actor || request.headers['x-actor'] || 'incident_sync');
      const trigger = String(request.body?.trigger || 'manual');
      const stats = generateIncidents(db, actor, trigger);
      return { ok: true, data: stats };
    } catch (err: any) {
      app.log.error({ err }, 'incidents/sync error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/incidents — list incidents
  app.get('/api/incidents', async (request: any) => {
    try {
      const db = getDatabase();
      const severity = String(request.query.severity || '').trim();
      const status = String(request.query.status || '').trim();
      const sourceType = String(request.query.source_type || '').trim();
      const sourceId = String(request.query.source_id || '').trim();
      const assignee = String(request.query.assignee || '').trim();
      const sort = String(request.query.sort || 'unclosed_then_severity').trim();
      const limit = Math.min(Math.max(parseInt(request.query.limit || '50', 10), 1), 200);
      const where: string[] = [];
      const params: any[] = [];
      if (severity) { where.push('severity = ?'); params.push(severity); }
      if (status) { where.push('status = ?'); params.push(status); }
      if (sourceType) { where.push('source_type = ?'); params.push(sourceType); }
      if (sourceId) { where.push('source_id = ?'); params.push(sourceId); }
      if (assignee) { where.push('assignee = ?'); params.push(assignee); }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const orderSql = sort === 'latest'
        ? `ORDER BY datetime(updated_at) DESC`
        : sort === 'severity_first'
          ? `ORDER BY CASE severity WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END DESC, datetime(updated_at) DESC`
          : `ORDER BY CASE WHEN status IN ('open','in_progress') THEN 0 ELSE 1 END ASC, CASE severity WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END DESC, datetime(updated_at) DESC`;
      const rows = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause, resolution_summary,
               playbook_id, playbook_code, playbook_match_reason, playbook_run_status, playbook_step_completed, playbook_step_total,
               assistant_diagnosis_summary, assistant_confidence, assistant_risk_level, assistant_manual_confirmation_required, assistant_last_request_id, assistant_last_status,
               recommended_actions_json, evidence_refs_json, created_at, updated_at
        FROM incidents
        ${whereSql}
        ${orderSql}
        LIMIT ?
      `).all(...params, limit) as any[];
      return {
        ok: true,
        incidents: rows.map((r: any) => ({
          ...r,
          recommended_actions_json: parseJson(r.recommended_actions_json),
          evidence_refs_json: parseJson(r.evidence_refs_json),
        })),
      };
    } catch (err: any) {
      app.log.error({ err }, 'incidents list error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/incidents/summary — recent/high/open aggregates
  app.get('/api/incidents/summary', async () => {
    try {
      const db = getDatabase();
      const recent = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause,
               playbook_id, playbook_code, playbook_run_status, playbook_step_completed, playbook_step_total,
               assistant_last_status, assistant_confidence, updated_at
        FROM incidents
        ORDER BY datetime(updated_at) DESC LIMIT 20
      `).all() as any[];
      const highSeverity = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause,
               playbook_id, playbook_code, playbook_run_status, playbook_step_completed, playbook_step_total,
               assistant_last_status, assistant_confidence, updated_at
        FROM incidents
        WHERE severity IN ('critical','high')
        ORDER BY datetime(updated_at) DESC LIMIT 20
      `).all() as any[];
      const openIncidents = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause,
               playbook_id, playbook_code, playbook_run_status, playbook_step_completed, playbook_step_total,
               assistant_last_status, assistant_confidence, updated_at
        FROM incidents
        WHERE status IN ('open','in_progress')
        ORDER BY
          CASE severity
            WHEN 'critical' THEN 4
            WHEN 'high' THEN 3
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 1
            ELSE 0
          END DESC,
          datetime(updated_at) DESC
        LIMIT 30
      `).all() as any[];
      const recentResolved = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause,
               playbook_id, playbook_code, playbook_run_status, playbook_step_completed, playbook_step_total,
               assistant_last_status, assistant_confidence, updated_at
        FROM incidents
        WHERE status='resolved'
        ORDER BY datetime(updated_at) DESC
        LIMIT 20
      `).all() as any[];
      const ignoredCount = (db.prepare(`SELECT COUNT(*) as c FROM incidents WHERE status='ignored'`).get() as any)?.c || 0;
      const bySeverityRows = db.prepare(`
        SELECT severity, COUNT(*) as count FROM incidents GROUP BY severity
      `).all() as any[];
      const byStatusRows = db.prepare(`
        SELECT status, COUNT(*) as count FROM incidents GROUP BY status
      `).all() as any[];
      const bySourceRows = db.prepare(`
        SELECT source_type, COUNT(*) as count FROM incidents GROUP BY source_type
      `).all() as any[];
      return {
        ok: true,
        data: {
          recent_incidents: recent,
          high_severity_incidents: highSeverity,
          open_incidents: openIncidents,
          recent_resolved: recentResolved,
          ignored_count: ignoredCount,
          by_severity: Object.fromEntries(bySeverityRows.map((x: any) => [x.severity, x.count])),
          by_status: Object.fromEntries(byStatusRows.map((x: any) => [x.status, x.count])),
          by_source_type: Object.fromEntries(bySourceRows.map((x: any) => [x.source_type, x.count])),
        },
      };
    } catch (err: any) {
      app.log.error({ err }, 'incidents summary error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/incidents/:id/actions — incident action history
  app.get('/api/incidents/:id/actions', async (request: any) => {
    try {
      const db = getDatabase();
      const rows = db.prepare(`
        SELECT id, incident_id, action_type, from_status, to_status, comment, actor, meta_json, created_at
        FROM incident_actions
        WHERE incident_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 200
      `).all(request.params.id) as any[];
      return {
        ok: true,
        actions: rows.map((r: any) => ({ ...r, meta_json: parseObject(r.meta_json) })),
      };
    } catch (err: any) {
      app.log.error({ err }, 'incident actions list error');
      return { ok: false, error: err.message };
    }
  });

  // POST /api/incidents/:id/actions — status/comment/disposition actions
  app.post('/api/incidents/:id/actions', async (request: any) => {
    try {
      const db = getDatabase();
      const incidentId = String(request.params.id || '');
      const actionType = String(request.body?.action_type || '').trim();
      const actor = String(request.body?.actor || 'operator').trim();
      const comment = String(request.body?.comment || '').trim();
      const probableCause = String(request.body?.probable_cause || '').trim();
      const resolutionSummary = String(request.body?.resolution_summary || '').trim();
      const assignee = String(request.body?.assignee || '').trim();
      const row = db.prepare(`
        SELECT id, status, assignee, probable_cause, resolution_summary, source_type, source_id,
               playbook_id, playbook_code, playbook_run_status, playbook_step_completed, playbook_step_total
        FROM incidents WHERE id = ?
      `).get(incidentId) as any;
      if (!row) return { ok: false, error: 'incident not found' };

      let nextStatus: IncidentStatus = row.status;
      if (actionType === 'mark_in_progress' || actionType === 'take_ownership') nextStatus = 'in_progress';
      if (actionType === 'resolve') nextStatus = 'resolved';
      if (actionType === 'ignore') nextStatus = 'ignored';
      if (actionType === 'reopen') nextStatus = 'open';

      let nextAssignee = row.assignee || '';
      if (assignee) nextAssignee = assignee;
      if (actionType === 'take_ownership' && !nextAssignee) nextAssignee = actor;

      let nextProbableCause = row.probable_cause || '';
      if (probableCause) nextProbableCause = probableCause;
      let nextResolutionSummary = row.resolution_summary || '';
      if (resolutionSummary) nextResolutionSummary = resolutionSummary;

      db.prepare(`
        UPDATE incidents
        SET status = ?, assignee = ?, probable_cause = ?, resolution_summary = ?, playbook_run_status = ?, updated_at = ?
        WHERE id = ?
      `).run(nextStatus, nextAssignee, nextProbableCause, nextResolutionSummary, row.playbook_run_status || 'not_started', nowIso(), incidentId);

      addIncidentAction(db, incidentId, actionType || 'comment', row.status || '', nextStatus || '', comment, actor, {
        probable_cause_updated: !!probableCause,
        resolution_summary_updated: !!resolutionSummary,
        assignee_updated: assignee || '',
      });

      if (nextStatus !== row.status) {
        writeIncidentAudit(db, 'incident_status_changed', incidentId, 'success', {
          actor,
          action_type: actionType,
          from_status: row.status,
          to_status: nextStatus,
          comment,
        });
      }
      if (comment) {
        writeIncidentAudit(db, 'incident_comment_added', incidentId, 'success', {
          actor,
          action_type: actionType,
          comment,
        });
      }
      if (actionType === 'resolve' || nextStatus === 'resolved') {
        writeIncidentAudit(db, 'incident_resolved', incidentId, 'success', {
          actor,
          resolution_summary: nextResolutionSummary,
        });
      }
      if (actionType === 'ignore' || nextStatus === 'ignored') {
        writeIncidentAudit(db, 'incident_ignored', incidentId, 'success', {
          actor,
          comment,
        });
      }

      const updated = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause, resolution_summary,
               playbook_id, playbook_code, playbook_match_reason, playbook_run_status, playbook_step_completed, playbook_step_total,
               assistant_diagnosis_summary, assistant_probable_cause, assistant_recommended_actions_json, assistant_confidence, assistant_risk_level, assistant_manual_confirmation_required, assistant_last_request_id, assistant_last_status,
               recommended_actions_json, evidence_refs_json, created_at, updated_at
        FROM incidents WHERE id = ?
      `).get(incidentId) as any;
      return {
        ok: true,
        incident: {
          ...updated,
          assistant_recommended_actions_json: parseJson(updated.assistant_recommended_actions_json),
          recommended_actions_json: parseJson(updated.recommended_actions_json),
          evidence_refs_json: parseJson(updated.evidence_refs_json),
        },
      };
    } catch (err: any) {
      app.log.error({ err }, 'incident action error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/incidents/:id — incident detail
  app.get('/api/incidents/:id', async (request: any) => {
    try {
      const db = getDatabase();
      const row = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause, resolution_summary,
               playbook_id, playbook_code, playbook_match_reason, playbook_run_status, playbook_step_completed, playbook_step_total,
               assistant_diagnosis_summary, assistant_probable_cause, assistant_recommended_actions_json, assistant_confidence, assistant_risk_level, assistant_manual_confirmation_required, assistant_last_request_id, assistant_last_status,
               recommended_actions_json, evidence_refs_json, created_at, updated_at
        FROM incidents WHERE id = ?
      `).get(request.params.id) as any;
      if (!row) return { ok: false, error: 'incident not found' };
      const actions = db.prepare(`
        SELECT id, incident_id, action_type, from_status, to_status, comment, actor, meta_json, created_at
        FROM incident_actions
        WHERE incident_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 200
      `).all(request.params.id) as any[];
      const playbook = row.playbook_id
        ? db.prepare(`
            SELECT id, playbook_code, name, applies_to_source_type, applies_to_severity, applies_to_pattern, summary,
                   precheck_json, steps_json, risk_notes_json, rollback_notes_json, acceptance_json, enabled, version, created_at, updated_at
            FROM incident_playbooks WHERE id = ?
          `).get(row.playbook_id) as any
        : null;
      const run = db.prepare(`
        SELECT id, incident_id, playbook_id, playbook_code, run_status, current_step_index, total_steps, started_at, completed_at, aborted_at, result_note, review_summary_json, backflow_json, actor, created_at, updated_at
        FROM incident_playbook_runs
        WHERE incident_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 1
      `).get(request.params.id) as any;
      const runSteps = run
        ? db.prepare(`
            SELECT id, run_id, incident_id, playbook_id, step_index, action_type, action_note, actor, created_at
            FROM incident_playbook_steps
            WHERE run_id = ?
            ORDER BY datetime(created_at) ASC
            LIMIT 500
          `).all(run.id) as any[]
        : [];
      return {
        ok: true,
        incident: {
          ...row,
          assistant_recommended_actions_json: parseJson(row.assistant_recommended_actions_json),
          recommended_actions_json: parseJson(row.recommended_actions_json),
          evidence_refs_json: parseJson(row.evidence_refs_json),
          actions: actions.map((x: any) => ({ ...x, meta_json: parseObject(x.meta_json) })),
          playbook: playbook
            ? {
                ...playbook,
                precheck_json: parseJson(playbook.precheck_json),
                steps_json: parseJson(playbook.steps_json),
                risk_notes_json: parseJson(playbook.risk_notes_json),
                rollback_notes_json: parseJson(playbook.rollback_notes_json),
                acceptance_json: parseJson(playbook.acceptance_json),
              }
            : null,
          playbook_run: run ? { ...run, review_summary_json: parseObject(run.review_summary_json), backflow_json: parseObject(run.backflow_json) } : null,
          playbook_steps: runSteps,
        },
      };
    } catch (err: any) {
      app.log.error({ err }, 'incident detail error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/incident-playbooks', async (request: any) => {
    try {
      const db = getDatabase();
      const sourceType = String(request.query.source_type || '').trim();
      const where = sourceType ? 'WHERE enabled = 1 AND (applies_to_source_type = ? OR applies_to_source_type = \'*\')' : 'WHERE enabled = 1';
      const rows = sourceType
        ? db.prepare(`
            SELECT id, playbook_code, name, applies_to_source_type, applies_to_severity, applies_to_pattern, summary,
                   precheck_json, steps_json, risk_notes_json, rollback_notes_json, acceptance_json, enabled, version, created_at, updated_at
            FROM incident_playbooks ${where}
            ORDER BY applies_to_source_type DESC, version DESC, updated_at DESC
          `).all(sourceType) as any[]
        : db.prepare(`
            SELECT id, playbook_code, name, applies_to_source_type, applies_to_severity, applies_to_pattern, summary,
                   precheck_json, steps_json, risk_notes_json, rollback_notes_json, acceptance_json, enabled, version, created_at, updated_at
            FROM incident_playbooks ${where}
            ORDER BY applies_to_source_type DESC, version DESC, updated_at DESC
          `).all() as any[];
      return {
        ok: true,
        playbooks: rows.map((x: any) => ({
          ...x,
          precheck_json: parseJson(x.precheck_json),
          steps_json: parseJson(x.steps_json),
          risk_notes_json: parseJson(x.risk_notes_json),
          rollback_notes_json: parseJson(x.rollback_notes_json),
          acceptance_json: parseJson(x.acceptance_json),
        })),
      };
    } catch (err: any) {
      app.log.error({ err }, 'incident-playbooks list error');
      return { ok: false, error: err.message };
    }
  });

  app.post('/api/incidents/:id/playbook/actions', async (request: any) => {
    try {
      const db = getDatabase();
      const incidentId = String(request.params.id || '');
      const actionType = String(request.body?.action_type || '').trim();
      const actor = String(request.body?.actor || 'operator').trim();
      const stepIndex = Number(request.body?.step_index || 0);
      const note = String(request.body?.action_note || request.body?.comment || '').trim();
      const incident = db.prepare(`
        SELECT id, status, playbook_id, playbook_code, playbook_run_status, playbook_step_completed, playbook_step_total, resolution_summary
        FROM incidents WHERE id = ?
      `).get(incidentId) as any;
      if (!incident) return { ok: false, error: 'incident not found' };
      if (!incident.playbook_id) return { ok: false, error: 'incident has no bound playbook' };
      const run = ensureIncidentPlaybookRun(db, incident, actor);
      if (!run) return { ok: false, error: 'playbook run init failed' };

      let nextRunStatus = String(run.run_status || 'not_started');
      let nextStep = Number(run.current_step_index || 0);
      let completedAt = String(run.completed_at || '');
      let abortedAt = String(run.aborted_at || '');
      let resultNote = String(run.result_note || '');
      const now = nowIso();
      const auditBase = { incident_id: incidentId, playbook_id: incident.playbook_id, playbook_code: incident.playbook_code, actor, current_step: nextStep };

      if (actionType === 'playbook_start') {
        nextRunStatus = 'in_progress';
        db.prepare(`
          INSERT INTO incident_playbook_steps (id, run_id, incident_id, playbook_id, step_index, action_type, action_note, actor, created_at)
          VALUES (?, ?, ?, ?, 0, 'playbook_start', ?, ?, ?)
        `).run(crypto.randomUUID(), run.id, incidentId, incident.playbook_id, note || 'playbook started', actor, now);
        writeIncidentAudit(db, 'incident_playbook_started', incidentId, 'success', { ...auditBase, note });
      } else if (actionType === 'playbook_step_complete') {
        nextRunStatus = 'in_progress';
        nextStep = Math.max(nextStep, stepIndex > 0 ? stepIndex : nextStep + 1);
        db.prepare(`
          INSERT INTO incident_playbook_steps (id, run_id, incident_id, playbook_id, step_index, action_type, action_note, actor, created_at)
          VALUES (?, ?, ?, ?, ?, 'playbook_step_complete', ?, ?, ?)
        `).run(crypto.randomUUID(), run.id, incidentId, incident.playbook_id, nextStep, note || `step ${nextStep} completed`, actor, now);
        writeIncidentAudit(db, 'incident_playbook_step_completed', incidentId, 'success', { ...auditBase, current_step: nextStep, note });
      } else if (actionType === 'playbook_note') {
        db.prepare(`
          INSERT INTO incident_playbook_steps (id, run_id, incident_id, playbook_id, step_index, action_type, action_note, actor, created_at)
          VALUES (?, ?, ?, ?, ?, 'playbook_note', ?, ?, ?)
        `).run(crypto.randomUUID(), run.id, incidentId, incident.playbook_id, stepIndex > 0 ? stepIndex : nextStep, note || 'note added', actor, now);
        writeIncidentAudit(db, 'incident_playbook_note_added', incidentId, 'success', { ...auditBase, current_step: stepIndex || nextStep, note });
      } else if (actionType === 'playbook_complete') {
        nextRunStatus = 'completed';
        completedAt = now;
        nextStep = Math.max(nextStep, Number(incident.playbook_step_total || nextStep));
        resultNote = note || resultNote || 'playbook completed';
        db.prepare(`
          INSERT INTO incident_playbook_steps (id, run_id, incident_id, playbook_id, step_index, action_type, action_note, actor, created_at)
          VALUES (?, ?, ?, ?, ?, 'playbook_complete', ?, ?, ?)
        `).run(crypto.randomUUID(), run.id, incidentId, incident.playbook_id, nextStep, resultNote, actor, now);
        writeIncidentAudit(db, 'incident_playbook_completed', incidentId, 'success', { ...auditBase, current_step: nextStep, note: resultNote });
        addIncidentAction(db, incidentId, 'playbook_completed', incident.status || '', 'resolved', resultNote, actor, { playbook_id: incident.playbook_id, step_index: nextStep });
      } else if (actionType === 'playbook_abort') {
        nextRunStatus = 'aborted';
        abortedAt = now;
        resultNote = note || resultNote || 'playbook aborted';
        db.prepare(`
          INSERT INTO incident_playbook_steps (id, run_id, incident_id, playbook_id, step_index, action_type, action_note, actor, created_at)
          VALUES (?, ?, ?, ?, ?, 'playbook_abort', ?, ?, ?)
        `).run(crypto.randomUUID(), run.id, incidentId, incident.playbook_id, stepIndex > 0 ? stepIndex : nextStep, resultNote, actor, now);
        writeIncidentAudit(db, 'incident_playbook_aborted', incidentId, 'success', { ...auditBase, current_step: stepIndex || nextStep, note: resultNote });
        addIncidentAction(db, incidentId, 'playbook_aborted', incident.status || '', incident.status || '', resultNote, actor, { playbook_id: incident.playbook_id, step_index: stepIndex || nextStep });
      } else {
        return { ok: false, error: 'unsupported action_type' };
      }

      db.prepare(`
        UPDATE incident_playbook_runs
        SET run_status = ?, current_step_index = ?, completed_at = ?, aborted_at = ?, result_note = ?, updated_at = ?, actor = ?
        WHERE id = ?
      `).run(nextRunStatus, nextStep, completedAt, abortedAt, resultNote, now, actor, run.id);
      const runAfter = db.prepare(`
        SELECT id, incident_id, playbook_id, playbook_code, run_status, current_step_index, total_steps, started_at, completed_at, aborted_at, result_note, actor, created_at, updated_at
        FROM incident_playbook_runs
        WHERE id = ?
      `).get(run.id) as any;
      const stepAfter = db.prepare(`
        SELECT id, run_id, incident_id, playbook_id, step_index, action_type, action_note, actor, created_at
        FROM incident_playbook_steps
        WHERE run_id = ?
        ORDER BY datetime(created_at) ASC
      `).all(run.id) as any[];

      const incidentStatus = nextRunStatus === 'completed' ? 'resolved' : incident.status;
      db.prepare(`
        UPDATE incidents
        SET status = ?, playbook_run_status = ?, playbook_step_completed = ?, resolution_summary = ?, updated_at = ?
        WHERE id = ?
      `).run(
        incidentStatus,
        nextRunStatus,
        nextStep,
        nextRunStatus === 'completed' ? (note || incident.resolution_summary || `resolved by ${incident.playbook_code}`) : incident.resolution_summary,
        now,
        incidentId,
      );
      if (nextRunStatus === 'completed' || nextRunStatus === 'aborted') {
        const incidentAfter = db.prepare(`
          SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause, resolution_summary,
                 playbook_id, playbook_code, playbook_match_reason, playbook_run_status, playbook_step_completed, playbook_step_total
          FROM incidents WHERE id = ?
        `).get(incidentId) as any;
        const review = buildRunReviewSummary(runAfter, incidentAfter, stepAfter);
        backflowPlaybookOutcome(db, incidentAfter, runAfter, review, actor);
      }
      const quality = evaluatePlaybookQuality(db, incident.playbook_id);

      const detail = db.prepare(`
        SELECT id, source_type, source_id, severity, status, assignee, summary, probable_cause, resolution_summary,
               playbook_id, playbook_code, playbook_match_reason, playbook_run_status, playbook_step_completed, playbook_step_total,
               recommended_actions_json, evidence_refs_json, created_at, updated_at
        FROM incidents WHERE id = ?
      `).get(incidentId) as any;
      return {
        ok: true,
        incident: {
          ...detail,
          recommended_actions_json: parseJson(detail.recommended_actions_json),
          evidence_refs_json: parseJson(detail.evidence_refs_json),
        },
        quality,
      };
    } catch (err: any) {
      app.log.error({ err }, 'incident playbook action error');
      return { ok: false, error: err.message };
    }
  });

  app.post('/api/incidents/:id/playbook/feedback', async (request: any) => {
    try {
      const db = getDatabase();
      const incidentId = String(request.params.id || '');
      const feedbackType = String(request.body?.feedback_type || '').trim();
      const createdBy = String(request.body?.created_by || request.body?.actor || 'operator').trim();
      const comment = String(request.body?.comment || '').trim();
      if (!['useful', 'useless', 'adopted', 'needs_update'].includes(feedbackType)) {
        return { ok: false, error: 'invalid feedback_type' };
      }
      const incident = db.prepare(`
        SELECT id, playbook_id, playbook_code
        FROM incidents WHERE id = ?
      `).get(incidentId) as any;
      if (!incident) return { ok: false, error: 'incident not found' };
      if (!incident.playbook_id) return { ok: false, error: 'incident has no bound playbook' };
      const run = db.prepare(`
        SELECT id
        FROM incident_playbook_runs
        WHERE incident_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT 1
      `).get(incidentId) as any;
      const runId = run?.id || '';
      db.prepare(`
        INSERT INTO playbook_feedback
        (id, playbook_id, incident_id, run_id, feedback_type, comment, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), incident.playbook_id, incidentId, runId, feedbackType, comment, createdBy, nowIso());
      writeIncidentAudit(db, 'playbook_feedback_recorded', incidentId, 'success', {
        playbook_id: incident.playbook_id,
        playbook_code: incident.playbook_code,
        incident_id: incidentId,
        run_id: runId,
        feedback_type: feedbackType,
        actor: createdBy,
        comment,
      });
      const quality = evaluatePlaybookQuality(db, incident.playbook_id);
      return { ok: true, quality };
    } catch (err: any) {
      app.log.error({ err }, 'playbook feedback error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/playbook-quality/overview', async (request: any) => {
    try {
      const db = getDatabase();
      const sourceType = String(request.query.source_type || '').trim();
      const needsRevision = String(request.query.needs_revision || '').trim();
      const active = String(request.query.active || '').trim();
      const where: string[] = ['1=1'];
      const params: any[] = [];
      if (sourceType) { where.push('applies_to_source_type = ?'); params.push(sourceType); }
      if (needsRevision === '1' || needsRevision === '0') { where.push('needs_revision = ?'); params.push(Number(needsRevision)); }
      if (active === '1' || active === '0') { where.push('enabled = ?'); params.push(Number(active)); }
      const rows = db.prepare(`
        SELECT id, playbook_code, name, applies_to_source_type, enabled, version, status, quality_score, effectiveness_score, last_evaluated_at, needs_revision
        FROM incident_playbooks
        WHERE ${where.join(' AND ')}
        ORDER BY quality_score DESC, updated_at DESC
        LIMIT 200
      `).all(...params) as any[];
      const data = rows.map((r: any) => {
        const stats = evaluatePlaybookQuality(db, r.id);
        const fbRows = db.prepare(`
          SELECT feedback_type, COUNT(*) as c
          FROM playbook_feedback
          WHERE playbook_id = ?
          GROUP BY feedback_type
        `).all(r.id) as any[];
        const feedback = Object.fromEntries(fbRows.map((x: any) => [x.feedback_type, x.c]));
        return { ...r, ...stats, feedback };
      });
      return { ok: true, playbooks: data };
    } catch (err: any) {
      app.log.error({ err }, 'playbook-quality overview error');
      return { ok: false, error: err.message };
    }
  });

  app.post('/api/incidents/:id/assistant-diagnostics', async (request: any) => {
    try {
      const db = getDatabase();
      const incidentId = String(request.params.id || '');
      const actor = String(request.body?.actor || 'operator').trim();
      const requestHint = String(request.body?.request_hint || '').trim();
      const forceFail = !!request.body?.force_fail;
      const confirmRequest = !!request.body?.confirm_request;
      const useReuse = !!request.body?.use_reuse;
      const incident = db.prepare(`
        SELECT id, source_type, source_id, severity, status, summary, probable_cause, recommended_actions_json, evidence_refs_json
        FROM incidents WHERE id = ?
      `).get(incidentId) as any;
      if (!incident) return { ok: false, error: 'incident not found' };
      const requestId = crypto.randomUUID();
      const now = nowIso();
      const probableCause = String(incident.probable_cause || '');
      const evidenceRefs = parseJson(incident.evidence_refs_json);
      const evidenceFingerprint = buildEvidenceFingerprint(evidenceRefs);
      const gate = evaluateAssistantGate(db, incident, probableCause, evidenceFingerprint);
      const payload = {
        mode: 'diagnostic_assistant',
        incident_id: incident.id,
        job_id: incident.source_type === 'workflow_failure' ? incident.source_id : '',
        source_type: incident.source_type,
        incident_status: incident.status,
        severity: incident.severity,
        summary: incident.summary,
        probable_cause: incident.probable_cause,
        recommended_actions_json: parseJson(incident.recommended_actions_json),
        evidence_refs_json: evidenceRefs,
        evidence_fingerprint: evidenceFingerprint,
        gate_decision: gate.decision,
        gate_reason: gate.reason,
        reuse_hint: gate.reuse || null,
        request_hint: requestHint,
        force_fail: forceFail,
        confirm_request: confirmRequest,
        use_reuse: useReuse,
      };
      const initialStatus = gate.decision === 'blocked'
        ? 'blocked'
        : (gate.decision === 'manual_confirmation_required' && !confirmRequest ? 'awaiting_manual_confirmation' : 'running');
      db.prepare(`
        INSERT INTO assistant_diagnostic_requests
        (id, incident_id, job_id, source_type, severity, probable_cause, summary, evidence_refs_json, request_payload_json, status, response_summary, response_json, adoption_status, adoption_note, gate_decision, gate_reason, reuse_hit, reuse_hint_json, manual_confirmation_required, manual_confirmation_status, manual_confirmation_actor, manual_confirmation_note, response_time_ms, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        requestId,
        incident.id,
        payload.job_id || '',
        incident.source_type,
        incident.severity,
        incident.probable_cause || '',
        incident.summary || '',
        JSON.stringify(payload.evidence_refs_json || {}),
        JSON.stringify(payload),
        initialStatus,
        '',
        '{}',
        '',
        '',
        gate.decision,
        gate.reason,
        gate.reuse ? 1 : 0,
        JSON.stringify({ ...(gate.reuse || {}), evidence_fingerprint: evidenceFingerprint }),
        gate.manual_confirmation_required ? 1 : 0,
        gate.manual_confirmation_required ? 'pending' : '',
        gate.manual_confirmation_required ? actor : '',
        '',
        0,
        now,
        now,
      );
      db.prepare(`UPDATE incidents SET assistant_last_request_id = ?, assistant_last_status = ?, assistant_manual_confirmation_required = ?, updated_at = ? WHERE id = ?`)
        .run(requestId, initialStatus, gate.manual_confirmation_required ? 1 : 0, now, incident.id);
      writeIncidentAudit(db, 'assistant_diagnostic_requested', incident.id, 'success', {
        incident_id: incident.id,
        request_id: requestId,
        actor,
        summary: incident.summary || '',
        gate_decision: gate.decision,
        gate_reason: gate.reason,
        confidence: null,
        risk_level: null,
      });
      if (gate.reuse) {
        writeIncidentAudit(db, gate.decision === 'blocked' ? 'assistant_diagnostic_reused' : 'assistant_diagnostic_reuse_suggested', incident.id, 'success', {
          incident_id: incident.id,
          request_id: requestId,
          actor,
          summary: gate.reason,
          request_reuse_ref: gate.reuse.request_id,
        });
      }
      if (gate.decision === 'blocked') {
        addIncidentAction(db, incident.id, 'assistant_diagnostic_blocked', '', '', gate.reason, actor, { request_id: requestId, gate_reason: gate.reason });
        writeIncidentAudit(db, 'assistant_diagnostic_blocked', incident.id, 'partial', {
          incident_id: incident.id,
          request_id: requestId,
          actor,
          reason: gate.reason,
          summary: 'blocked by governance gate',
        });
        const reqRow = db.prepare(`SELECT * FROM assistant_diagnostic_requests WHERE id = ?`).get(requestId) as any;
        return { ok: true, blocked: true, requires_manual_confirmation: false, request: { ...reqRow, evidence_refs_json: parseObject(reqRow.evidence_refs_json), request_payload_json: parseObject(reqRow.request_payload_json), response_json: parseObject(reqRow.response_json), reuse_hint_json: parseObject(reqRow.reuse_hint_json) } };
      }
      if (gate.decision === 'manual_confirmation_required' && !confirmRequest) {
        addIncidentAction(db, incident.id, 'assistant_manual_confirmation_requested', '', '', gate.reason, actor, { request_id: requestId, gate_reason: gate.reason });
        writeIncidentAudit(db, 'assistant_manual_confirmation_requested', incident.id, 'success', {
          incident_id: incident.id,
          request_id: requestId,
          actor,
          reason: gate.reason,
          summary: 'manual confirmation required before cloud diagnostic',
        });
        const reqRow = db.prepare(`SELECT * FROM assistant_diagnostic_requests WHERE id = ?`).get(requestId) as any;
        return { ok: true, blocked: false, requires_manual_confirmation: true, request: { ...reqRow, evidence_refs_json: parseObject(reqRow.evidence_refs_json), request_payload_json: parseObject(reqRow.request_payload_json), response_json: parseObject(reqRow.response_json), reuse_hint_json: parseObject(reqRow.reuse_hint_json) } };
      }
      if (gate.reuse && useReuse) {
        const reusedRow = db.prepare(`SELECT response_json FROM assistant_diagnostic_requests WHERE id = ?`).get(gate.reuse.request_id) as any;
        const reusedPayload = parseObject(reusedRow?.response_json || '{}');
        const updatedAt = nowIso();
        const responseTimeMs = Math.max(1, Date.now() - new Date(now).getTime());
        db.prepare(`UPDATE assistant_diagnostic_requests SET status='completed', response_summary=?, response_json=?, response_time_ms=?, updated_at=? WHERE id=?`)
          .run(String(reusedPayload?.diagnosis_summary || 'reused_previous_diagnostic'), JSON.stringify(reusedPayload || {}), responseTimeMs, updatedAt, requestId);
        db.prepare(`
          UPDATE incidents
          SET assistant_diagnosis_summary = ?, assistant_probable_cause = ?, assistant_recommended_actions_json = ?, assistant_confidence = ?, assistant_risk_level = ?, assistant_manual_confirmation_required = ?, assistant_last_request_id = ?, assistant_last_status = 'completed', updated_at = ?
          WHERE id = ?
        `).run(
          String(reusedPayload?.diagnosis_summary || ''),
          String(reusedPayload?.probable_root_cause || ''),
          JSON.stringify(reusedPayload?.recommended_actions_json || []),
          Number(reusedPayload?.confidence || 0),
          String(reusedPayload?.risk_level || ''),
          reusedPayload?.manual_confirmation_required ? 1 : 0,
          requestId,
          updatedAt,
          incident.id,
        );
        writeIncidentAudit(db, 'assistant_diagnostic_reused', incident.id, 'success', {
          incident_id: incident.id,
          request_id: requestId,
          actor,
          reason: 'use_reuse=true',
          summary: `reused request ${gate.reuse.request_id}`,
          confidence: Number(reusedPayload?.confidence || 0),
          risk_level: String(reusedPayload?.risk_level || ''),
        });
      } else {

        try {
          const result = await runAssistantDiagnosticBridge(db, incident, payload);
          const updatedAt = nowIso();
          const responseTimeMs = Math.max(1, Date.now() - new Date(now).getTime());
          db.prepare(`
            UPDATE assistant_diagnostic_requests
            SET status='completed', response_summary = ?, response_json = ?, response_time_ms = ?, updated_at = ?
            WHERE id = ?
          `).run(result.diagnosis_summary || '', JSON.stringify(result), responseTimeMs, updatedAt, requestId);
          db.prepare(`
            UPDATE incidents
            SET assistant_diagnosis_summary = ?, assistant_probable_cause = ?, assistant_recommended_actions_json = ?, assistant_confidence = ?, assistant_risk_level = ?, assistant_manual_confirmation_required = ?, assistant_last_request_id = ?, assistant_last_status = 'completed', updated_at = ?
            WHERE id = ?
          `).run(
            String(result.diagnosis_summary || ''),
            String(result.probable_root_cause || ''),
            JSON.stringify(result.recommended_actions_json || []),
            Number(result.confidence || 0),
            String(result.risk_level || ''),
            result.manual_confirmation_required ? 1 : 0,
            requestId,
            updatedAt,
            incident.id,
          );
          addIncidentAction(db, incident.id, 'assistant_diagnostic_completed', '', '', String(result.diagnosis_summary || ''), actor, {
            request_id: requestId,
            confidence: result.confidence,
            risk_level: result.risk_level,
            manual_confirmation_required: !!result.manual_confirmation_required,
          });
          writeIncidentAudit(db, 'assistant_diagnostic_completed', incident.id, 'success', {
            incident_id: incident.id,
            request_id: requestId,
            actor,
            summary: result.diagnosis_summary || '',
            confidence: Number(result.confidence || 0),
            risk_level: result.risk_level || '',
          });
        } catch (err: any) {
          const updatedAt = nowIso();
          db.prepare(`
            UPDATE assistant_diagnostic_requests
            SET status='failed', response_summary = ?, response_json = ?, response_time_ms = ?, updated_at = ?
            WHERE id = ?
          `).run(String(err?.message || 'diagnostic_failed'), JSON.stringify({ error: String(err?.message || 'diagnostic_failed') }), Math.max(1, Date.now() - new Date(now).getTime()), updatedAt, requestId);
          db.prepare(`UPDATE incidents SET assistant_last_request_id = ?, assistant_last_status = 'failed', updated_at = ? WHERE id = ?`).run(requestId, updatedAt, incident.id);
          addIncidentAction(db, incident.id, 'assistant_diagnostic_failed', '', '', String(err?.message || 'diagnostic_failed'), actor, { request_id: requestId });
          writeIncidentAudit(db, 'assistant_diagnostic_failed', incident.id, 'failed', {
            incident_id: incident.id,
            request_id: requestId,
            actor,
            summary: String(err?.message || 'diagnostic_failed'),
            confidence: null,
            risk_level: null,
          });
        }
      }
      const reqRow = db.prepare(`SELECT * FROM assistant_diagnostic_requests WHERE id = ?`).get(requestId) as any;
      return {
        ok: true,
        request: {
          ...reqRow,
          evidence_refs_json: parseObject(reqRow.evidence_refs_json),
          request_payload_json: parseObject(reqRow.request_payload_json),
          response_json: parseObject(reqRow.response_json),
          reuse_hint_json: parseObject(reqRow.reuse_hint_json),
          gate_policy_hint_json: parseObject(reqRow.gate_policy_hint_json),
        },
      };
    } catch (err: any) {
      app.log.error({ err }, 'assistant diagnostic request error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/incidents/:id/assistant-diagnostics', async (request: any) => {
    try {
      const db = getDatabase();
      const incidentId = String(request.params.id || '');
      const limit = Math.min(Math.max(parseInt(String(request.query.limit || '20'), 10), 1), 200);
      const rows = db.prepare(`
        SELECT id, incident_id, job_id, source_type, severity, probable_cause, summary, evidence_refs_json, request_payload_json, status, response_summary, response_json, adoption_status, adoption_note, gate_decision, gate_reason, reuse_hit, reuse_hint_json, manual_confirmation_required, manual_confirmation_status, manual_confirmation_actor, manual_confirmation_note, response_time_ms, pattern_backflow_id, rule_backflow_id, playbook_backflow_id, gate_policy_hint_json, created_at, updated_at
        FROM assistant_diagnostic_requests
        WHERE incident_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT ?
      `).all(incidentId, limit) as any[];
      return {
        ok: true,
        requests: rows.map((x: any) => ({
          ...x,
          evidence_refs_json: parseObject(x.evidence_refs_json),
          request_payload_json: parseObject(x.request_payload_json),
          response_json: parseObject(x.response_json),
          reuse_hint_json: parseObject(x.reuse_hint_json),
          gate_policy_hint_json: parseObject(x.gate_policy_hint_json),
        })),
      };
    } catch (err: any) {
      app.log.error({ err }, 'assistant diagnostics list error');
      return { ok: false, error: err.message };
    }
  });

  app.post('/api/incidents/:id/assistant-diagnostics/:requestId/adoption', async (request: any) => {
    try {
      const db = getDatabase();
      const incidentId = String(request.params.id || '');
      const requestId = String(request.params.requestId || '');
      const actor = String(request.body?.actor || 'operator').trim();
      const adoption = String(request.body?.adoption || '').trim();
      const note = String(request.body?.note || '').trim();
      if (!['adopted', 'rejected'].includes(adoption)) return { ok: false, error: 'adoption must be adopted/rejected' };
      const reqRow = db.prepare(`SELECT id, incident_id, response_json FROM assistant_diagnostic_requests WHERE id = ? AND incident_id = ?`).get(requestId, incidentId) as any;
      if (!reqRow) return { ok: false, error: 'request not found' };
      db.prepare(`
        UPDATE assistant_diagnostic_requests
        SET adoption_status = ?, adoption_note = ?, updated_at = ?
        WHERE id = ?
      `).run(adoption, note, nowIso(), requestId);
      const backflowTargets = applyAssistantBackflow(db, incidentId, requestId, adoption as any, actor, note);
      const gateHints = buildAssistantGatePolicyHints(db);
      db.prepare(`UPDATE assistant_diagnostic_requests SET gate_policy_hint_json = ?, updated_at = ? WHERE id = ?`).run(
        JSON.stringify(gateHints.slice(0, 8)),
        nowIso(),
        requestId,
      );
      addIncidentAction(db, incidentId, adoption === 'adopted' ? 'assistant_diagnostic_adopted' : 'assistant_diagnostic_rejected', '', '', note || adoption, actor, {
        request_id: requestId,
        pattern_backflow_id: backflowTargets.pattern_id,
        rule_backflow_id: backflowTargets.rule_id,
        playbook_backflow_id: backflowTargets.playbook_id,
      });
      writeIncidentAudit(db, adoption === 'adopted' ? 'assistant_diagnostic_adopted' : 'assistant_diagnostic_rejected', incidentId, 'success', {
        incident_id: incidentId,
        request_id: requestId,
        actor,
        summary: note || adoption,
        confidence: parseObject(reqRow.response_json)?.confidence ?? null,
        risk_level: parseObject(reqRow.response_json)?.risk_level ?? null,
        why_adopted_or_rejected: note || '',
      });
      writeIncidentAudit(db, 'assistant_gate_policy_hint_generated', incidentId, 'success', {
        incident_id: incidentId,
        request_id: requestId,
        actor,
        summary: 'gate policy hints updated after adoption decision',
        hint_count: gateHints.length,
      });
      return { ok: true };
    } catch (err: any) {
      app.log.error({ err }, 'assistant diagnostic adoption error');
      return { ok: false, error: err.message };
    }
  });

  app.post('/api/incidents/:id/assistant-diagnostics/:requestId/manual-confirmation', async (request: any) => {
    try {
      const db = getDatabase();
      const incidentId = String(request.params.id || '');
      const requestId = String(request.params.requestId || '');
      const actor = String(request.body?.actor || 'operator').trim();
      const decision = String(request.body?.decision || '').trim();
      const note = String(request.body?.note || '').trim();
      if (!['confirm_request', 'reject_request'].includes(decision)) return { ok: false, error: 'decision must be confirm_request/reject_request' };
      const reqRow = db.prepare(`
        SELECT id, incident_id, status, request_payload_json, manual_confirmation_required, gate_reason
        FROM assistant_diagnostic_requests
        WHERE id = ? AND incident_id = ?
      `).get(requestId, incidentId) as any;
      if (!reqRow) return { ok: false, error: 'request not found' };
      if (Number(reqRow.manual_confirmation_required || 0) !== 1) return { ok: false, error: 'manual confirmation not required' };
      if (decision === 'reject_request') {
        db.prepare(`
          UPDATE assistant_diagnostic_requests
          SET status='blocked', manual_confirmation_status='rejected', manual_confirmation_actor=?, manual_confirmation_note=?, updated_at=?
          WHERE id=?
        `).run(actor, note, nowIso(), requestId);
        db.prepare(`UPDATE incidents SET assistant_last_status='blocked', updated_at=? WHERE id=?`).run(nowIso(), incidentId);
        writeIncidentAudit(db, 'assistant_manual_confirmation_rejected', incidentId, 'success', {
          incident_id: incidentId,
          request_id: requestId,
          actor,
          reason: reqRow.gate_reason || '',
          summary: note || 'manual confirmation rejected',
        });
        return { ok: true, decision };
      }
      const payload = parseObject(reqRow.request_payload_json || '{}');
      const incident = db.prepare(`
        SELECT id, source_type, source_id, severity, status, summary, probable_cause, recommended_actions_json, evidence_refs_json
        FROM incidents WHERE id = ?
      `).get(incidentId) as any;
      if (!incident) return { ok: false, error: 'incident not found' };
      db.prepare(`
        UPDATE assistant_diagnostic_requests
        SET status='running', manual_confirmation_status='approved', manual_confirmation_actor=?, manual_confirmation_note=?, updated_at=?
        WHERE id=?
      `).run(actor, note, nowIso(), requestId);
      writeIncidentAudit(db, 'assistant_manual_confirmation_approved', incidentId, 'success', {
        incident_id: incidentId,
        request_id: requestId,
        actor,
        reason: reqRow.gate_reason || '',
        summary: note || 'manual confirmation approved',
      });
      try {
        const startAt = Date.now();
        const result = await runAssistantDiagnosticBridge(db, incident, payload);
        const updatedAt = nowIso();
        db.prepare(`
          UPDATE assistant_diagnostic_requests
          SET status='completed', response_summary=?, response_json=?, response_time_ms=?, updated_at=?
          WHERE id=?
        `).run(String(result.diagnosis_summary || ''), JSON.stringify(result), Math.max(1, Date.now() - startAt), updatedAt, requestId);
        db.prepare(`
          UPDATE incidents
          SET assistant_diagnosis_summary = ?, assistant_probable_cause = ?, assistant_recommended_actions_json = ?, assistant_confidence = ?, assistant_risk_level = ?, assistant_manual_confirmation_required = ?, assistant_last_request_id = ?, assistant_last_status = 'completed', updated_at = ?
          WHERE id = ?
        `).run(
          String(result.diagnosis_summary || ''),
          String(result.probable_root_cause || ''),
          JSON.stringify(result.recommended_actions_json || []),
          Number(result.confidence || 0),
          String(result.risk_level || ''),
          result.manual_confirmation_required ? 1 : 0,
          requestId,
          updatedAt,
          incident.id,
        );
      } catch (err: any) {
        db.prepare(`UPDATE assistant_diagnostic_requests SET status='failed', response_summary=?, response_json=?, updated_at=? WHERE id=?`)
          .run(String(err?.message || 'diagnostic_failed'), JSON.stringify({ error: String(err?.message || 'diagnostic_failed') }), nowIso(), requestId);
        db.prepare(`UPDATE incidents SET assistant_last_status='failed', updated_at=? WHERE id=?`).run(nowIso(), incidentId);
      }
      return { ok: true, decision };
    } catch (err: any) {
      app.log.error({ err }, 'assistant manual confirmation error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/governance/assistant-quality', async (request: any) => {
    try {
      const db = getDatabase();
      const sourceType = String(request.query.source_type || '').trim();
      const severity = String(request.query.severity || '').trim();
      const adoptionStatus = String(request.query.adoption_status || '').trim();
      const riskLevel = String(request.query.risk_level || '').trim();
      const reqStatus = String(request.query.request_status || '').trim();
      const where: string[] = ['1=1'];
      const params: any[] = [];
      if (sourceType) { where.push('source_type = ?'); params.push(sourceType); }
      if (severity) { where.push('severity = ?'); params.push(severity); }
      if (adoptionStatus) { where.push('adoption_status = ?'); params.push(adoptionStatus); }
      if (riskLevel) { where.push(`json_extract(response_json, '$.risk_level') = ?`); params.push(riskLevel); }
      if (reqStatus) { where.push('status = ?'); params.push(reqStatus); }
      const baseWhere = where.join(' AND ');
      const overview = db.prepare(`
        SELECT
          COUNT(*) as requested_count,
          SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed_count,
          SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted_count,
          SUM(CASE WHEN adoption_status='rejected' THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN manual_confirmation_required=1 THEN 1 ELSE 0 END) as manual_confirmation_required_count,
          SUM(CASE WHEN json_extract(response_json, '$.risk_level')='high' THEN 1 ELSE 0 END) as high_risk_count,
          AVG(CASE WHEN status='completed' THEN json_extract(response_json, '$.confidence') END) as avg_confidence,
          AVG(CASE WHEN response_time_ms > 0 THEN response_time_ms END) as avg_response_time_ms
        FROM assistant_diagnostic_requests
        WHERE ${baseWhere}
      `).get(...params) as any;
      const bySource = db.prepare(`SELECT source_type, COUNT(*) as count FROM assistant_diagnostic_requests WHERE ${baseWhere} GROUP BY source_type`).all(...params) as any[];
      const bySeverity = db.prepare(`SELECT severity, COUNT(*) as count FROM assistant_diagnostic_requests WHERE ${baseWhere} GROUP BY severity`).all(...params) as any[];
      const byGateDecision = db.prepare(`SELECT gate_decision, COUNT(*) as count FROM assistant_diagnostic_requests WHERE ${baseWhere} GROUP BY gate_decision`).all(...params) as any[];
      const byRisk = db.prepare(`
        SELECT COALESCE(json_extract(response_json, '$.risk_level'), '') as risk_level, COUNT(*) as count
        FROM assistant_diagnostic_requests WHERE ${baseWhere}
        GROUP BY COALESCE(json_extract(response_json, '$.risk_level'), '')
      `).all(...params) as any[];
      const byAdoption = db.prepare(`SELECT adoption_status, COUNT(*) as count FROM assistant_diagnostic_requests WHERE ${baseWhere} GROUP BY adoption_status`).all(...params) as any[];
      const o = overview || {};
      const requested = Number(o.requested_count || 0);
      const completed = Number(o.completed_count || 0);
      const adopted = Number(o.adopted_count || 0);
      const rejected = Number(o.rejected_count || 0);
      const failed = Number(o.failed_count || 0);
      const highRisk = Number(o.high_risk_count || 0);
      const metrics = {
        requested_count: requested,
        completed_count: completed,
        failed_count: failed,
        adopted_count: adopted,
        rejected_count: rejected,
        manual_confirmation_required_count: Number(o.manual_confirmation_required_count || 0),
        avg_confidence: Number(o.avg_confidence || 0),
        high_risk_count: highRisk,
        avg_response_time_ms: Math.round(Number(o.avg_response_time_ms || 0)),
        adoption_rate: completed > 0 ? adopted / completed : 0,
        rejection_rate: completed > 0 ? rejected / completed : 0,
        failure_rate: requested > 0 ? failed / requested : 0,
        high_risk_ratio: requested > 0 ? highRisk / requested : 0,
      };
      const longTerm = db.prepare(`
        SELECT
          SUM(CASE WHEN reuse_hit = 1 AND status='completed' THEN 1 ELSE 0 END) as reuse_success_count,
          SUM(CASE WHEN manual_confirmation_status='approved' AND adoption_status='adopted' THEN 1 ELSE 0 END) as adoption_after_manual_confirm_count,
          SUM(CASE WHEN gate_decision='blocked' THEN 1 ELSE 0 END) as blocked_saved_count,
          SUM(CASE WHEN manual_confirmation_status='approved' AND json_extract(response_json, '$.risk_level')='high' THEN 1 ELSE 0 END) as high_risk_manual_approved,
          SUM(CASE WHEN manual_confirmation_required=1 AND json_extract(response_json, '$.risk_level')='high' THEN 1 ELSE 0 END) as high_risk_manual_total
        FROM assistant_diagnostic_requests
        WHERE ${baseWhere}
      `).get(...params) as any;
      const highRiskPassRate = Number(longTerm?.high_risk_manual_total || 0) > 0
        ? Number(longTerm?.high_risk_manual_approved || 0) / Number(longTerm?.high_risk_manual_total || 1)
        : 0;
      const sourceRows = db.prepare(`
        SELECT source_type,
               COUNT(*) as requested_count,
               SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_count,
               SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed_count,
               SUM(CASE WHEN adoption_status='adopted' THEN 1 ELSE 0 END) as adopted_count,
               SUM(CASE WHEN reuse_hit=1 THEN 1 ELSE 0 END) as reuse_count
        FROM assistant_diagnostic_requests
        WHERE ${baseWhere}
        GROUP BY source_type
      `).all(...params) as any[];
      const sourceTypeRollup = sourceRows.map((r: any) => {
        const requestedCount = Number(r.requested_count || 0);
        const completedCount = Number(r.completed_count || 0);
        return {
          source_type: r.source_type || '',
          requested_count: requestedCount,
          source_type_adoption_rate: completedCount > 0 ? Number(r.adopted_count || 0) / completedCount : 0,
          source_type_failure_rate: requestedCount > 0 ? Number(r.failed_count || 0) / requestedCount : 0,
          source_type_reuse_rate: requestedCount > 0 ? Number(r.reuse_count || 0) / requestedCount : 0,
        };
      });
      const valueTop = [...sourceTypeRollup].sort((a: any, b: any) => Number(b.source_type_adoption_rate) - Number(a.source_type_adoption_rate)).slice(0, 5);
      const lowValueTop = [...sourceTypeRollup].sort((a: any, b: any) => Number(b.source_type_failure_rate) - Number(a.source_type_failure_rate)).slice(0, 5);
      const reuseTop = [...sourceTypeRollup].sort((a: any, b: any) => Number(b.source_type_reuse_rate) - Number(a.source_type_reuse_rate)).slice(0, 5);
      const gatePolicyHints = buildAssistantGatePolicyHints(db).slice(0, 8);
      writeIncidentAudit(db, 'assistant_quality_evaluated', 'assistant_diagnostic_requests', 'success', {
        actor: 'governance_hub',
        summary: 'assistant quality overview queried',
        metrics,
      });
      writeIncidentAudit(db, 'assistant_quality_rollup_evaluated', 'assistant_diagnostic_requests', 'success', {
        actor: 'governance_hub',
        summary: 'assistant long-term rollup evaluated',
        metrics: {
          reuse_success_count: Number(longTerm?.reuse_success_count || 0),
          adoption_after_manual_confirm_count: Number(longTerm?.adoption_after_manual_confirm_count || 0),
          blocked_saved_count: Number(longTerm?.blocked_saved_count || 0),
          high_risk_manual_confirm_pass_rate: highRiskPassRate,
        },
      });
      return {
        ok: true,
        metrics,
        long_term_metrics: {
          reuse_success_count: Number(longTerm?.reuse_success_count || 0),
          adoption_after_manual_confirm_count: Number(longTerm?.adoption_after_manual_confirm_count || 0),
          blocked_saved_count: Number(longTerm?.blocked_saved_count || 0),
          high_risk_manual_confirm_pass_rate: highRiskPassRate,
        },
        source_type_rollup: sourceTypeRollup,
        value_ranking: {
          most_worth_cloud: valueTop,
          least_worth_cloud: lowValueTop,
          highest_reuse_gain: reuseTop,
        },
        gate_policy_hints: gatePolicyHints,
        by_source_type: bySource,
        by_severity: bySeverity,
        by_gate_decision: byGateDecision,
        by_risk_level: byRisk,
        by_adoption_status: byAdoption,
      };
    } catch (err: any) {
      app.log.error({ err }, 'assistant quality overview error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/operations/overview', async (request: any) => {
    try {
      const db = getDatabase();
      const range = String(request.query.range || '24h').trim();
      const sourceType = String(request.query.source_type || '').trim();
      const data = buildOperationsSnapshot(db, range, sourceType);
      return { ok: true, ...data };
    } catch (err: any) {
      app.log.error({ err }, 'operations overview error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/operations/quality', async (request: any) => {
    try {
      const db = getDatabase();
      const range = String(request.query.range || '24h').trim();
      const sourceType = String(request.query.source_type || '').trim();
      const data = buildOperationsSnapshot(db, range, sourceType);
      return { ok: true, scope: data.scope, dictionary: data.dictionary.filter((x: any) => x.category === 'quality' || x.category === 'latency'), quality: data.overview.quality, latency: data.overview.latency };
    } catch (err: any) {
      app.log.error({ err }, 'operations quality error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/operations/incidents', async (request: any) => {
    try {
      const db = getDatabase();
      const range = String(request.query.range || '24h').trim();
      const sourceType = String(request.query.source_type || '').trim();
      const data = buildOperationsSnapshot(db, range, sourceType);
      return {
        ok: true,
        scope: data.scope,
        risk: data.overview.risk,
        top_risks: data.overview.priority_board.top_risks,
        top_bottlenecks: data.overview.priority_board.top_bottlenecks,
        attribution: data.overview.attribution,
      };
    } catch (err: any) {
      app.log.error({ err }, 'operations incidents error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/operations/assistant', async (request: any) => {
    try {
      const db = getDatabase();
      const range = String(request.query.range || '24h').trim();
      const sourceType = String(request.query.source_type || '').trim();
      const data = buildOperationsSnapshot(db, range, sourceType);
      return {
        ok: true,
        scope: data.scope,
        assistant: {
          adoption_rate: data.overview.quality.assistant_adoption_rate,
          avg_response_time_ms: data.overview.latency.avg_assistant_response_time_ms,
          high_risk_assistant_ratio: data.overview.risk.high_risk_assistant_ratio,
          blocked_saved_count: data.overview.cost.blocked_saved_count,
          reuse_success_count: data.overview.cost.reuse_success_count,
          source_type_cloud_helpfulness: data.overview.value.source_type_cloud_helpfulness,
        },
      };
    } catch (err: any) {
      app.log.error({ err }, 'operations assistant error');
      return { ok: false, error: err.message };
    }
  });

  app.get('/api/operations/value', async (request: any) => {
    try {
      const db = getDatabase();
      const range = String(request.query.range || '24h').trim();
      const sourceType = String(request.query.source_type || '').trim();
      const data = buildOperationsSnapshot(db, range, sourceType);
      return {
        ok: true,
        scope: data.scope,
        value: data.overview.value,
        cost: data.overview.cost,
        top_value_opportunities: data.overview.priority_board.top_value_opportunities,
        top_waste: data.overview.priority_board.top_waste,
        attribution: data.overview.attribution,
      };
    } catch (err: any) {
      app.log.error({ err }, 'operations value error');
      return { ok: false, error: err.message };
    }
  });

  // GET /api/ops/health-snapshot — read-only diagnostics
  app.get('/api/ops/health-snapshot', async () => {
    try {
      const db = getDatabase();
      return { ok: true, data: getHealthSnapshot(db) };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  });

  app.log.info('✅ Ops routes registered (v2.7.0)');
}
