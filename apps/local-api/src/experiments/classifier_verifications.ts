import { getDatabase } from '../db/builtin-sqlite.js';

function genId()  { return crypto.randomUUID(); }
function now()    { return new Date().toISOString(); }

interface CreateVerificationBody {
  name?: string;
  source_segmentation_id?: string;
  source_handoff_id?: string;
  source_experiment_id?: string;
  source_model_id?: string;
  source_dataset_id?: string;
  manifest_path?: string;
  model_type?: string;
  classifier_model_path?: string;
  execution_mode?: string;
  total_items?: number;
  accepted_count?: number;
  rejected_count?: number;
  uncertain_count?: number;
  avg_confidence?: number;
  avg_infer_time_s?: number;
  status?: string;
}

// Parse manifest to extract summary
function parseManifestStats(manifestPath: string): Partial<CreateVerificationBody> {
  try {
    const fs = require('fs');
    if (!fs.existsSync(manifestPath)) return {};
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const s = data.summary || {};
    const mi = data.model_info || {};
    return {
      total_items:       s.total_items || 0,
      accepted_count:   s.accepted_count || 0,
      rejected_count:   s.rejected_count || 0,
      uncertain_count:  s.uncertain_count || 0,
      avg_confidence:   s.avg_confidence || 0,
      avg_infer_time_s: s.avg_infer_time_s || 0,
      model_type:        mi.model_type || 'resnet18',
      execution_mode:    mi.execution_mode || 'real',
      classifier_model_path: mi.checkpoint || '',
    };
  } catch {
    return {};
  }
}

// ── POST /api/classifier-verifications ──────────────────────────────────────
export async function createClassifierVerification(body: CreateVerificationBody) {
  const db = getDatabase();
  const stats = body.manifest_path ? parseManifestStats(body.manifest_path) : {};

  // Resolve lineage from segmentation
  let source_handoff_id    = body.source_handoff_id    || '';
  let source_experiment_id = body.source_experiment_id || '';
  let source_model_id      = body.source_model_id      || '';
  let source_dataset_id    = body.source_dataset_id    || '';

  if (body.source_segmentation_id) {
    const seg = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(body.source_segmentation_id) as any;
    if (seg) {
      source_handoff_id    = seg.source_handoff_id     || source_handoff_id;
      source_experiment_id = seg.source_experiment_id  || source_experiment_id;
      source_model_id      = seg.source_model_id        || source_model_id;
      source_dataset_id    = seg.source_dataset_id     || source_dataset_id;
    }
  }

  const id  = genId();
  const t   = now();
  const name = body.name || `verif-${id.slice(0, 8)}`;

  db.prepare(`
    INSERT INTO classifier_verifications (
      verification_id, name, status, source_segmentation_id, source_handoff_id,
      source_experiment_id, source_model_id, source_dataset_id,
      manifest_path, model_type, classifier_model_path, execution_mode,
      total_items, accepted_count, rejected_count, uncertain_count,
      avg_confidence, avg_infer_time_s, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, body.status || 'completed',
    body.source_segmentation_id || '',
    source_handoff_id,
    source_experiment_id,
    source_model_id,
    source_dataset_id,
    body.manifest_path || '',
    body.model_type || stats.model_type || 'resnet18',
    body.classifier_model_path || stats.classifier_model_path || '',
    body.execution_mode || stats.execution_mode || 'real',
    body.total_items     ?? stats.total_items     ?? 0,
    body.accepted_count  ?? stats.accepted_count  ?? 0,
    body.rejected_count  ?? stats.rejected_count  ?? 0,
    body.uncertain_count ?? stats.uncertain_count ?? 0,
    body.avg_confidence  ?? stats.avg_confidence  ?? 0,
    body.avg_infer_time_s ?? stats.avg_infer_time_s ?? 0,
    t, t,
  );

  const row = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id);
  return { ok: true, classifier_verification: row };
}

// ── GET /api/classifier-verifications ────────────────────────────────────────
export async function listClassifierVerifications(params: {
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
  let sql = 'SELECT * FROM classifier_verifications WHERE 1=1';
  const binds: any[] = [];

  if (params.segmentation_id) { sql += ' AND source_segmentation_id = ?'; binds.push(params.segmentation_id); }
  if (params.handoff_id)      { sql += ' AND source_handoff_id = ?';      binds.push(params.handoff_id); }
  if (params.experiment_id)   { sql += ' AND source_experiment_id = ?';  binds.push(params.experiment_id); }
  if (params.model_id)        { sql += ' AND source_model_id = ?';        binds.push(params.model_id); }
  if (params.dataset_id)      { sql += ' AND source_dataset_id = ?';      binds.push(params.dataset_id); }
  if (params.status)           { sql += ' AND status = ?';                 binds.push(params.status); }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const rows = db.prepare(sql).all(...binds);
  return { ok: true, classifier_verifications: rows, total: rows.length };
}

// ── GET /api/classifier-verifications/:id ─────────────────────────────────────
export async function getClassifierVerification(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id) as any;
  if (!row) return { ok: false, error: `ClassifierVerification ${id} not found` };
  return { ok: true, classifier_verification: row };
}

// ── PATCH /api/classifier-verifications/:id ────────────────────────────────────
export async function updateClassifierVerification(id: string, body: any) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `ClassifierVerification ${id} not found` };

  const allowed = ['name', 'status', 'manifest_path', 'total_items', 'accepted_count', 'rejected_count', 'uncertain_count', 'avg_confidence'];
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

  db.prepare(`UPDATE classifier_verifications SET ${updates.join(', ')} WHERE verification_id = ?`).run(...binds);
  const updated = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id);
  return { ok: true, classifier_verification: updated };
}

// ── DELETE /api/classifier-verifications/:id ──────────────────────────────────
export async function deleteClassifierVerification(id: string) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `ClassifierVerification ${id} not found` };
  db.prepare('DELETE FROM classifier_verifications WHERE verification_id = ?').run(id);
  return { ok: true };
}

// ── GET /api/classifier-verifications/:id/lineage ───────────────────────────
// Returns full chain: verif -> seg -> handoff -> experiment -> model -> dataset
export async function getClassifierVerificationLineage(id: string) {
  const db = getDatabase();
  const cv = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id) as any;
  if (!cv) return { ok: false, error: `ClassifierVerification ${id} not found` };

  let segmentation: any = null;
  let handoff: any = null;
  let experiment: any = null;
  let model: any = null;
  let dataset: any = null;

  if (cv.source_segmentation_id) {
    segmentation = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(cv.source_segmentation_id) as any;
    if (segmentation?.source_handoff_id) {
      handoff = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(segmentation.source_handoff_id) as any;
    }
  }

  if (cv.source_experiment_id) {
    experiment = db.prepare('SELECT id, experiment_code, name, status, task_type, dataset_id FROM experiments WHERE id = ?').get(cv.source_experiment_id) as any;
    if (experiment?.dataset_id) {
      dataset = db.prepare('SELECT id, dataset_code, name, version, dataset_type, sample_count FROM datasets WHERE id = ?').get(experiment.dataset_id) as any;
    }
  }

  if (cv.source_model_id) {
    model = db.prepare('SELECT model_id, name, version, artifact_path FROM models WHERE model_id = ?').get(cv.source_model_id) as any;
  }

  return { ok: true, lineage: { classifier_verification: cv, sam_segmentation: segmentation, sam_handoff: handoff, experiment, model, dataset } };
}

// ── POST /api/sam-segmentations/:id/classifier-verifications ─────────────────
// Auto-run classifier verification on a SAM segmentation
export async function createVerificationFromSegmentation(segmentationId: string) {
  const db = getDatabase();
  const seg = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(segmentationId) as any;
  if (!seg) return { ok: false, error: `SamSegmentation ${segmentationId} not found` };
  if (!seg.manifest_path) return { ok: false, error: 'Segmentation has no manifest_path' };

  const { execSync } = require('child_process');
  const { mkdirSync } = require('fs');

  const outputDir = `E:\\AGI_Factory\\runs\\classifier_verifications\\cv_${segmentationId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const manifestOut = `${outputDir}\\classifier_verification_manifest.json`;
  mkdirSync(outputDir, { recursive: true });

  try {
    const pythonCmd = [
      'python',
      'E:\\AGI_Factory\\repo\\workers\\python-worker\\classifier_runner.py',
      '--manifest', seg.manifest_path,
      '--output-dir', outputDir,
      '--model-type', 'resnet18',
      '--device', 'cpu',
    ];
    execSync(pythonCmd.join(' '), { encoding: 'utf-8', timeout: 600000 });

    const result = await createClassifierVerification({
      name: `verif-from-${seg.name || segmentationId.slice(0, 8)}`,
      source_segmentation_id: segmentationId,
      manifest_path: manifestOut,
      status: 'completed',
    });
    return result;
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
