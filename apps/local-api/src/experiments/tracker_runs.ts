import { getDatabase } from '../db/builtin-sqlite.js';
import { resolveWorkerPath, resolveRunDir } from '../python-runner.js';

function genId()  { return crypto.randomUUID(); }
function now()    { return new Date().toISOString(); }

interface CreateTrackerRunBody {
  name?: string;
  source_verification_id?: string;
  source_segmentation_id?: string;
  source_handoff_id?: string;
  source_experiment_id?: string;
  source_model_id?: string;
  source_dataset_id?: string;
  manifest_path?: string;
  total_tracks?: number;
  total_frames?: number;
  avg_track_length?: number;
  active_count?: number;
  ended_count?: number;
  iou_threshold?: number;
  dist_threshold?: number;
  tracking_config_json?: string;
  status?: string;
}

// Parse manifest to extract summary
function parseManifestStats(manifestPath: string): Partial<CreateTrackerRunBody> {
  try {
    const fs = require('fs');
    if (!fs.existsSync(manifestPath)) return {};
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const s = data.summary || {};
    const cfg = data.tracking_config || {};
    return {
      total_tracks:     s.total_tracks || 0,
      total_frames:     s.total_frames || 0,
      avg_track_length: s.avg_track_length || 0,
      active_count:     s.active_count || 0,
      ended_count:     s.ended_count || 0,
      iou_threshold:    cfg.iou_threshold || 0.3,
      dist_threshold:   cfg.dist_threshold || 80.0,
      tracking_config_json: JSON.stringify(cfg),
    };
  } catch {
    return {};
  }
}

// Resolve lineage from verification
function resolveLineage(db: any, verificationId: string, segmentationId: string) {
  let source_segmentation_id = segmentationId || '';
  let source_handoff_id    = '';
  let source_experiment_id = '';
  let source_model_id      = '';
  let source_dataset_id    = '';

  if (verificationId) {
    const cv = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(verificationId) as any;
    if (cv) {
      source_segmentation_id = cv.source_segmentation_id || source_segmentation_id;
      source_handoff_id    = cv.source_handoff_id    || '';
      source_experiment_id = cv.source_experiment_id || '';
      source_model_id      = cv.source_model_id      || '';
      source_dataset_id    = cv.source_dataset_id    || '';
    }
  }

  if (source_segmentation_id && !source_handoff_id) {
    const seg = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(source_segmentation_id) as any;
    if (seg) {
      source_handoff_id    = seg.source_handoff_id     || source_handoff_id;
      source_experiment_id = seg.source_experiment_id  || source_experiment_id;
      source_model_id      = seg.source_model_id        || source_model_id;
      source_dataset_id    = seg.source_dataset_id     || source_dataset_id;
    }
  }

  return { source_segmentation_id, source_handoff_id, source_experiment_id, source_model_id, source_dataset_id };
}

// ── POST /api/tracker-runs ────────────────────────────────────────────────────
export async function createTrackerRun(body: CreateTrackerRunBody) {
  const db = getDatabase();
  const stats = body.manifest_path ? parseManifestStats(body.manifest_path) : {};
  const lineage = resolveLineage(db, body.source_verification_id || '', body.source_segmentation_id || '');

  const id  = genId();
  const t   = now();
  const name = body.name || `track-${id.slice(0, 8)}`;

  db.prepare(`
    INSERT INTO tracker_runs (
      tracker_run_id, name, status, source_verification_id, source_segmentation_id,
      source_handoff_id, source_experiment_id, source_model_id, source_dataset_id,
      manifest_path, total_tracks, total_frames, avg_track_length,
      active_count, ended_count, iou_threshold, dist_threshold,
      tracking_config_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, body.status || 'completed',
    body.source_verification_id || '',
    body.source_segmentation_id || lineage.source_segmentation_id,
    body.source_handoff_id    || lineage.source_handoff_id,
    body.source_experiment_id || lineage.source_experiment_id,
    body.source_model_id      || lineage.source_model_id,
    body.source_dataset_id    || lineage.source_dataset_id,
    body.manifest_path || '',
    body.total_tracks     ?? stats.total_tracks     ?? 0,
    body.total_frames     ?? stats.total_frames     ?? 0,
    body.avg_track_length ?? stats.avg_track_length ?? 0,
    body.active_count     ?? stats.active_count     ?? 0,
    body.ended_count      ?? stats.ended_count      ?? 0,
    body.iou_threshold    ?? stats.iou_threshold    ?? 0.3,
    body.dist_threshold   ?? stats.dist_threshold   ?? 80.0,
    body.tracking_config_json || stats.tracking_config_json || '',
    t, t,
  );

  const row = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(id);
  return { ok: true, tracker_run: row };
}

// ── GET /api/tracker-runs ──────────────────────────────────────────────────────
export async function listTrackerRuns(params: {
  verification_id?: string;
  segmentation_id?: string;
  handoff_id?: string;
  experiment_id?: string;
  model_id?: string;
  dataset_id?: string;
  status?: string;
  limit?: number;
}) {
  const db = getDatabase();
  const limit = params.limit || 50;
  let sql = 'SELECT * FROM tracker_runs WHERE 1=1';
  const binds: any[] = [];

  if (params.verification_id) { sql += ' AND source_verification_id = ?'; binds.push(params.verification_id); }
  if (params.segmentation_id) { sql += ' AND source_segmentation_id = ?'; binds.push(params.segmentation_id); }
  if (params.handoff_id)      { sql += ' AND source_handoff_id = ?';      binds.push(params.handoff_id); }
  if (params.experiment_id)   { sql += ' AND source_experiment_id = ?';  binds.push(params.experiment_id); }
  if (params.model_id)        { sql += ' AND source_model_id = ?';        binds.push(params.model_id); }
  if (params.dataset_id)      { sql += ' AND source_dataset_id = ?';      binds.push(params.dataset_id); }
  if (params.status)           { sql += ' AND status = ?';                 binds.push(params.status); }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const rows = db.prepare(sql).all(...binds);
  return { ok: true, tracker_runs: rows, total: rows.length };
}

// ── GET /api/tracker-runs/:id ──────────────────────────────────────────────────
export async function getTrackerRun(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(id) as any;
  if (!row) return { ok: false, error: `TrackerRun ${id} not found` };
  return { ok: true, tracker_run: row };
}

// ── PATCH /api/tracker-runs/:id ────────────────────────────────────────────────
export async function updateTrackerRun(id: string, body: any) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `TrackerRun ${id} not found` };

  const allowed = ['name', 'status', 'manifest_path', 'total_tracks', 'total_frames', 'avg_track_length', 'active_count', 'ended_count'];
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

  db.prepare(`UPDATE tracker_runs SET ${updates.join(', ')} WHERE tracker_run_id = ?`).run(...binds);
  const updated = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(id);
  return { ok: true, tracker_run: updated };
}

// ── DELETE /api/tracker-runs/:id ──────────────────────────────────────────────
export async function deleteTrackerRun(id: string) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `TrackerRun ${id} not found` };
  db.prepare('DELETE FROM tracker_runs WHERE tracker_run_id = ?').run(id);
  return { ok: true };
}

// ── GET /api/tracker-runs/:id/lineage ──────────────────────────────────────────
// Full chain: tracker -> classifier_verification -> sam_segmentation -> sam_handoff -> experiment -> model -> dataset
export async function getTrackerRunLineage(id: string) {
  const db = getDatabase();
  const tr = db.prepare('SELECT * FROM tracker_runs WHERE tracker_run_id = ?').get(id) as any;
  if (!tr) return { ok: false, error: `TrackerRun ${id} not found` };

  let verification: any = null;
  let segmentation: any = null;
  let handoff: any = null;
  let experiment: any = null;
  let model: any = null;
  let dataset: any = null;

  if (tr.source_verification_id) {
    verification = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(tr.source_verification_id) as any;
  }

  if (tr.source_segmentation_id) {
    segmentation = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(tr.source_segmentation_id) as any;
    if (segmentation?.source_handoff_id) {
      handoff = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(segmentation.source_handoff_id) as any;
    }
  }

  if (tr.source_experiment_id) {
    experiment = db.prepare('SELECT id, experiment_code, name, status, task_type, dataset_id FROM experiments WHERE id = ?').get(tr.source_experiment_id) as any;
    if (experiment?.dataset_id) {
      dataset = db.prepare('SELECT id, dataset_code, name, version, dataset_type, sample_count FROM datasets WHERE id = ?').get(experiment.dataset_id) as any;
    }
  }

  if (tr.source_model_id) {
    model = db.prepare('SELECT model_id, name, version, artifact_path FROM models WHERE model_id = ?').get(tr.source_model_id) as any;
  }

  return {
    ok: true,
    lineage: { tracker_run: tr, classifier_verification: verification, sam_segmentation: segmentation, sam_handoff: handoff, experiment, model, dataset },
  };
}

// ── POST /api/classifier-verifications/:id/tracker-runs ───────────────────────
// Auto-run tracker on classifier verification
export async function createTrackerFromVerification(verificationId: string) {
  const db = getDatabase();
  const cv = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(verificationId) as any;
  if (!cv) return { ok: false, error: `ClassifierVerification ${verificationId} not found` };
  if (!cv.manifest_path) return { ok: false, error: 'Verification has no manifest_path' };

  const { execSync } = require('child_process');
  const { mkdirSync } = require('fs');

  const safeId = verificationId.replace(/[^a-zA-Z0-9]/g, '');
  const outputDir = resolveRunDir('tracker', verificationId);
  const manifestOut = `${outputDir}\\tracker_manifest.json`;
  mkdirSync(outputDir, { recursive: true });

  try {
    const pythonCmd = [
      'python',
      resolveWorkerPath('tracker_runner.py'),
      '--manifest', cv.manifest_path,
      '--output-dir', outputDir,
      '--iou-threshold', '0.3',
      '--dist-threshold', '80.0',
      '--lost-threshold', '2',
    ];
    execSync(pythonCmd.join(' '), { encoding: 'utf-8', timeout: 300000 });

    const result = await createTrackerRun({
      name: `track-from-${cv.name || verificationId.slice(0, 8)}`,
      source_verification_id: verificationId,
      manifest_path: manifestOut,
      status: 'completed',
    });
    return result;
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
