import { getDatabase } from '../db/builtin-sqlite.js';
import { resolveWorkerPath, resolveRunDir } from '../python-runner.js';

function genId()  { return crypto.randomUUID(); }
function now()    { return new Date().toISOString(); }

interface CreateRuleRunBody {
  name?: string;
  source_tracker_run_id?: string;
  source_verification_id?: string;
  source_segmentation_id?: string;
  source_handoff_id?: string;
  source_experiment_id?: string;
  source_model_id?: string;
  source_dataset_id?: string;
  manifest_path?: string;
  total_decisions?: number;
  affected_tracks?: number;
  unstable_class_count?: number;
  low_confidence_count?: number;
  transient_count?: number;
  conflict_count?: number;
  ended_resolved_count?: number;
  rule_config_json?: string;
  status?: string;
}

function parseManifestStats(manifestPath: string): Partial<CreateRuleRunBody> {
  try {
    const fs = require('fs');
    if (!fs.existsSync(manifestPath)) return {};
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const s = data.summary || {};
    const cfg = data.rule_config || {};
    return {
      total_decisions:     s.total_decisions || 0,
      affected_tracks:     s.affected_tracks || 0,
      unstable_class_count: s.unstable_class_count || 0,
      low_confidence_count: s.low_confidence_count || 0,
      transient_count:     s.transient_count || 0,
      conflict_count:      s.conflict_count || 0,
      ended_resolved_count: s.ended_resolved_count || 0,
      rule_config_json:    JSON.stringify(cfg),
    };
  } catch { return {}; }
}

function resolveLineage(db: any, trackerRunId: string) {
  let source_verification_id = '';
  let source_segmentation_id = '';
  let source_handoff_id    = '';
  let source_experiment_id = '';
  let source_model_id      = '';
  let source_dataset_id    = '';

  if (trackerRunId) {
    const tr = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(trackerRunId) as any;
    if (tr) {
      source_verification_id = tr.source_verification_id || '';
      source_segmentation_id = tr.source_segmentation_id || '';
      source_handoff_id    = tr.source_handoff_id    || '';
      source_experiment_id = tr.source_experiment_id || '';
      source_model_id      = tr.source_model_id      || '';
      source_dataset_id    = tr.source_dataset_id    || '';
    }
  }

  return { source_verification_id, source_segmentation_id, source_handoff_id, source_experiment_id, source_model_id, source_dataset_id };
}

// ── POST /api/rule-engine-runs ────────────────────────────────────────────────
export async function createRuleEngineRun(body: CreateRuleRunBody) {
  const db = getDatabase();
  const stats = body.manifest_path ? parseManifestStats(body.manifest_path) : {};
  const lineage = resolveLineage(db, body.source_tracker_run_id || '');

  const id   = genId();
  const t    = now();
  const name = body.name || `rule-${id.slice(0, 8)}`;

  db.prepare(`
    INSERT INTO rule_engine_runs (
      rule_run_id, name, status,
      source_tracker_run_id, source_verification_id, source_segmentation_id,
      source_handoff_id, source_experiment_id, source_model_id, source_dataset_id,
      manifest_path, total_decisions, affected_tracks,
      unstable_class_count, low_confidence_count, transient_count,
      conflict_count, ended_resolved_count, rule_config_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, body.status || 'completed',
    body.source_tracker_run_id || '',
    body.source_verification_id || lineage.source_verification_id,
    body.source_segmentation_id || lineage.source_segmentation_id,
    body.source_handoff_id    || lineage.source_handoff_id,
    body.source_experiment_id || lineage.source_experiment_id,
    body.source_model_id      || lineage.source_model_id,
    body.source_dataset_id    || lineage.source_dataset_id,
    body.manifest_path || '',
    body.total_decisions     ?? stats.total_decisions     ?? 0,
    body.affected_tracks     ?? stats.affected_tracks     ?? 0,
    body.unstable_class_count ?? stats.unstable_class_count ?? 0,
    body.low_confidence_count ?? stats.low_confidence_count ?? 0,
    body.transient_count     ?? stats.transient_count     ?? 0,
    body.conflict_count      ?? stats.conflict_count      ?? 0,
    body.ended_resolved_count ?? stats.ended_resolved_count ?? 0,
    body.rule_config_json    || stats.rule_config_json || '',
    t, t,
  );

  const row = db.prepare('SELECT * FROM rule_engine_runs WHERE rule_run_id = ?').get(id);
  return { ok: true, rule_engine_run: row };
}

// ── GET /api/rule-engine-runs ─────────────────────────────────────────────────
export async function listRuleEngineRuns(params: {
  tracker_run_id?: string;
  verification_id?: string;
  experiment_id?: string;
  model_id?: string;
  dataset_id?: string;
  status?: string;
  limit?: number;
}) {
  const db = getDatabase();
  const limit = params.limit || 50;
  let sql = 'SELECT * FROM rule_engine_runs WHERE 1=1';
  const binds: any[] = [];

  if (params.tracker_run_id) { sql += ' AND source_tracker_run_id = ?'; binds.push(params.tracker_run_id); }
  if (params.verification_id) { sql += ' AND source_verification_id = ?'; binds.push(params.verification_id); }
  if (params.experiment_id)  { sql += ' AND source_experiment_id = ?';  binds.push(params.experiment_id); }
  if (params.model_id)        { sql += ' AND source_model_id = ?';        binds.push(params.model_id); }
  if (params.dataset_id)      { sql += ' AND source_dataset_id = ?';      binds.push(params.dataset_id); }
  if (params.status)           { sql += ' AND status = ?';                 binds.push(params.status); }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const rows = db.prepare(sql).all(...binds);
  return { ok: true, rule_engine_runs: rows, total: rows.length };
}

// ── GET /api/rule-engine-runs/:id ─────────────────────────────────────────────
export async function getRuleEngineRun(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM rule_engine_runs WHERE rule_run_id = ?').get(id) as any;
  if (!row) return { ok: false, error: `RuleEngineRun ${id} not found` };
  return { ok: true, rule_engine_run: row };
}

// ── PATCH /api/rule-engine-runs/:id ──────────────────────────────────────────
export async function updateRuleEngineRun(id: string, body: any) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM rule_engine_runs WHERE rule_run_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `RuleEngineRun ${id} not found` };

  const allowed = ['name', 'status', 'manifest_path', 'total_decisions', 'affected_tracks', 'unstable_class_count', 'low_confidence_count', 'transient_count', 'conflict_count'];
  const updates: string[] = [];
  const binds: any[] = [];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates.push(`${key} = ?`);
      binds.push(body[key]);
    }
  }
  if (updates.length === 0) return { ok: false, error: 'No valid fields to update' };

  updates.push('updated_at = ?');
  binds.push(new Date().toISOString());
  binds.push(id);

  db.prepare(`UPDATE rule_engine_runs SET ${updates.join(', ')} WHERE rule_run_id = ?`).run(...binds);
  const updated = db.prepare('SELECT * FROM rule_engine_runs WHERE rule_run_id = ?').get(id);
  return { ok: true, rule_engine_run: updated };
}

// ── DELETE /api/rule-engine-runs/:id ────────────────────────────────────────
export async function deleteRuleEngineRun(id: string) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM rule_engine_runs WHERE rule_run_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `RuleEngineRun ${id} not found` };
  db.prepare('DELETE FROM rule_engine_runs WHERE rule_run_id = ?').run(id);
  return { ok: true };
}

// ── GET /api/rule-engine-runs/:id/lineage ────────────────────────────────────
export async function getRuleEngineRunLineage(id: string) {
  const db = getDatabase();
  const re = db.prepare('SELECT * FROM rule_engine_runs WHERE rule_run_id = ?').get(id) as any;
  if (!re) return { ok: false, error: `RuleEngineRun ${id} not found` };

  let tracker_run: any = null;
  let verification: any = null;
  let segmentation: any = null;
  let handoff: any = null;
  let experiment: any = null;
  let model: any = null;
  let dataset: any = null;

  if (re.source_tracker_run_id) {
    tracker_run = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(re.source_tracker_run_id) as any;
    if (tracker_run?.source_verification_id) {
      verification = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(tracker_run.source_verification_id) as any;
    }
    if (tracker_run?.source_segmentation_id) {
      segmentation = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(tracker_run.source_segmentation_id) as any;
      if (segmentation?.source_handoff_id) {
        handoff = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(segmentation.source_handoff_id) as any;
      }
    }
  }

  if (re.source_experiment_id) {
    experiment = db.prepare('SELECT id, experiment_code, name, status, task_type, dataset_id FROM experiments WHERE id = ?').get(re.source_experiment_id) as any;
    if (experiment?.dataset_id) {
      dataset = db.prepare('SELECT id, dataset_code, name, version, dataset_type, sample_count FROM datasets WHERE id = ?').get(experiment.dataset_id) as any;
    }
  }
  if (re.source_model_id) {
    model = db.prepare('SELECT model_id, name, version, artifact_path FROM models WHERE model_id = ?').get(re.source_model_id) as any;
  }

  return { ok: true, lineage: { rule_engine_run: re, tracker_run, classifier_verification: verification, sam_segmentation: segmentation, sam_handoff: handoff, experiment, model, dataset } };
}

// ── POST /api/tracker-runs/:id/rule-engine-runs ───────────────────────────────
export async function createRuleFromTracker(trackerRunId: string) {
  const db = getDatabase();
  const tr = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(trackerRunId) as any;
  if (!tr) return { ok: false, error: `TrackerRun ${trackerRunId} not found` };
  if (!tr.manifest_path) return { ok: false, error: 'Tracker has no manifest_path' };

  const { execSync } = require('child_process');
  const { mkdirSync } = require('fs');

  const safeId = trackerRunId.replace(/[^a-zA-Z0-9]/g, '');
  const outputDir = resolveRunDir('rule_engine', trackerRunId);
  const manifestOut = `${outputDir}\\rule_engine_manifest.json`;
  mkdirSync(outputDir, { recursive: true });

  try {
    const pythonCmd = [
      'python',
      resolveWorkerPath('rule_engine_runner.py'),
      '--tracker-manifest', tr.manifest_path,
      '--output-dir', outputDir,
    ];
    execSync(pythonCmd.join(' '), { encoding: 'utf-8', timeout: 300000 });

    return await createRuleEngineRun({
      name: `rule-from-${trackerRunId.slice(0, 8)}`,
      source_tracker_run_id: trackerRunId,
      manifest_path: manifestOut,
      status: 'completed',
    });
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
