import { getDatabase } from '../db/builtin-sqlite.js';
import { logAudit } from '../audit/index.js';
import { resolveWorkerPath, resolveRunDir, resolveCheckpoint } from '../python-runner.js';

function genId()  { return crypto.randomUUID(); }
function now()    { return new Date().toISOString(); }

interface CreateSegmentationBody {
  name?: string;
  source_handoff_id?: string;
  source_experiment_id?: string;
  source_model_id?: string;
  source_dataset_id?: string;
  manifest_path?: string;
  model_type?: string;
  checkpoint_path?: string;
  prompt_count?: number;
  mask_count?: number;
  avg_mask_score?: number;
  avg_coverage?: number;
  total_infer_time_s?: number;
  status?: string;
}

// Parse manifest to extract summary stats
function parseManifestStats(manifestPath: string): Partial<CreateSegmentationBody> {
  try {
    const fs = require('fs');
    if (!fs.existsSync(manifestPath)) return {};
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const s = data.summary || {};
    return {
      prompt_count:       s.total_rois_processed || 0,
      mask_count:         s.mask_count || 0,
      avg_mask_score:     s.avg_mask_score || 0,
      avg_coverage:       s.avg_coverage || 0,
      total_infer_time_s: s.total_infer_time_s || 0,
      model_type:         s.model_type || 'vit_b',
      checkpoint_path:    s.checkpoint || '',
    };
  } catch {
    return {};
  }
}

// ── POST /api/sam-segmentations ──────────────────────────────────────────────
export async function createSamSegmentation(body: CreateSegmentationBody) {
  const db = getDatabase();
  const stats = body.manifest_path ? parseManifestStats(body.manifest_path) : {};

  // Resolve lineage context from handoff if provided
  let source_experiment_id = body.source_experiment_id || '';
  let source_model_id      = body.source_model_id      || '';
  let source_dataset_id    = body.source_dataset_id    || '';

  if (body.source_handoff_id) {
    const sh = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(body.source_handoff_id) as any;
    if (sh) {
      source_experiment_id = sh.source_experiment_id || source_experiment_id;
      source_model_id      = sh.source_model_id      || source_model_id;
      source_dataset_id    = sh.source_dataset_id    || source_dataset_id;
    }
  }

  const id = genId();
  const t  = now();
  const name = body.name || `seg-${id.slice(0, 8)}`;

  db.prepare(`
    INSERT INTO sam_segmentations (
      segmentation_id, name, status, source_handoff_id,
      source_experiment_id, source_model_id, source_dataset_id,
      manifest_path, model_type, checkpoint_path,
      prompt_count, mask_count, avg_mask_score, avg_coverage,
      total_infer_time_s, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, body.status || 'completed',
    body.source_handoff_id || '',
    source_experiment_id, source_model_id, source_dataset_id,
    body.manifest_path || '',
    body.model_type || stats.model_type || 'vit_b',
    body.checkpoint_path || stats.checkpoint_path || '',
    body.prompt_count  ?? stats.prompt_count  ?? 0,
    body.mask_count    ?? stats.mask_count    ?? 0,
    body.avg_mask_score ?? stats.avg_mask_score ?? 0,
    body.avg_coverage   ?? stats.avg_coverage   ?? 0,
    body.total_infer_time_s ?? stats.total_infer_time_s ?? 0,
    t, t,
  );

  const row = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(id);
  logAudit({
    category: 'sam',
    action: 'create',
    target: `sam_segmentation:${id}`,
    result: 'success',
    detail: {
      segmentation_id: id,
      name,
      source_handoff_id: body.source_handoff_id || '',
      source_experiment_id,
      source_model_id,
      source_dataset_id,
      manifest_path: body.manifest_path || '',
      prompt_count: body.prompt_count ?? stats.prompt_count ?? 0,
      mask_count: body.mask_count ?? stats.mask_count ?? 0,
      avg_mask_score: body.avg_mask_score ?? stats.avg_mask_score ?? 0,
    },
  }).catch(() => {});

  return { ok: true, sam_segmentation: row };
}

// ── GET /api/sam-segmentations ───────────────────────────────────────────────
export async function listSamSegmentations(params: {
  handoff_id?: string;
  experiment_id?: string;
  model_id?: string;
  dataset_id?: string;
  status?: string;
  limit?: number;
}) {
  const db = getDatabase();
  const limit = params.limit || 50;
  let sql = 'SELECT * FROM sam_segmentations WHERE 1=1';
  const binds: any[] = [];

  if (params.handoff_id)     { sql += ' AND source_handoff_id = ?';     binds.push(params.handoff_id); }
  if (params.experiment_id)  { sql += ' AND source_experiment_id = ?'; binds.push(params.experiment_id); }
  if (params.model_id)       { sql += ' AND source_model_id = ?';       binds.push(params.model_id); }
  if (params.dataset_id)     { sql += ' AND source_dataset_id = ?';     binds.push(params.dataset_id); }
  if (params.status)          { sql += ' AND status = ?';                 binds.push(params.status); }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const rows = db.prepare(sql).all(...binds);
  return { ok: true, sam_segmentations: rows, total: rows.length };
}

// ── GET /api/sam-segmentations/:id ─────────────────────────────────────────
export async function getSamSegmentation(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(id) as any;
  if (!row) return { ok: false, error: `SamSegmentation ${id} not found` };
  return { ok: true, sam_segmentation: row };
}

// ── PATCH /api/sam-segmentations/:id ─────────────────────────────────────────
export async function updateSamSegmentation(id: string, body: any) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `SamSegmentation ${id} not found` };

  const allowed = ['name', 'status', 'manifest_path', 'prompt_count', 'mask_count', 'avg_mask_score', 'avg_coverage'];
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

  db.prepare(`UPDATE sam_segmentations SET ${updates.join(', ')} WHERE segmentation_id = ?`).run(...binds);
  const updated = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(id);
  logAudit({
    category: 'sam',
    action: 'update',
    target: `sam_segmentation:${id}`,
    result: 'success',
    detail: { segmentation_id: id, updated_fields: body },
  }).catch(() => {});
  return { ok: true, sam_segmentation: updated };
}

// ── DELETE /api/sam-segmentations/:id ───────────────────────────────────────
export async function deleteSamSegmentation(id: string) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `SamSegmentation ${id} not found` };
  db.prepare('DELETE FROM sam_segmentations WHERE segmentation_id = ?').run(id);
  logAudit({
    category: 'sam',
    action: 'delete',
    target: `sam_segmentation:${id}`,
    result: 'success',
    detail: { segmentation_id: id, deleted_name: existing.name },
  }).catch(() => {});
  return { ok: true };
}

// ── GET /api/sam-segmentations/:id/lineage ───────────────────────────────────
// Returns: seg -> handoff -> experiment -> model -> dataset
export async function getSamSegmentationLineage(id: string) {
  const db = getDatabase();
  const seg = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(id) as any;
  if (!seg) return { ok: false, error: `SamSegmentation ${id} not found` };

  let handoff: any = null;
  let experiment: any = null;
  let model: any = null;
  let dataset: any = null;

  if (seg.source_handoff_id) {
    handoff = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(seg.source_handoff_id) as any;
    if (handoff) {
      if (handoff.source_experiment_id) {
        experiment = db.prepare('SELECT id, experiment_code, name, status, task_type, dataset_id FROM experiments WHERE id = ?').get(handoff.source_experiment_id) as any;
        if (experiment?.dataset_id) {
          dataset = db.prepare('SELECT id, dataset_code, name, version, dataset_type, sample_count FROM datasets WHERE id = ?').get(experiment.dataset_id) as any;
        }
      }
      if (handoff.source_model_id) {
        model = db.prepare('SELECT model_id, name, version, artifact_path FROM models WHERE model_id = ?').get(handoff.source_model_id) as any;
      }
    }
  }

  return { ok: true, lineage: { sam_segmentation: seg, sam_handoff: handoff, experiment, model, dataset } };
}

// ── POST /api/sam-handoffs/:id/segmentations ────────────────────────────────
// Auto-run SAM inference and register result
export async function createSegmentationFromHandoff(handoffId: string) {
  const db = getDatabase();
  const sh = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(handoffId) as any;
  if (!sh) return { ok: false, error: `SamHandoff ${handoffId} not found` };

  if (!sh.manifest_path) return { ok: false, error: 'Handoff has no manifest_path' };

  const { execSync } = require('child_process');
  const { writeFileSync, mkdirSync, existsSync } = require('fs');

  const segOutputDir = resolveRunDir('segmentations', handoffId);
  const manifestOut  = `${segOutputDir}\\sam_segmentation_manifest.json`;

  try {
    mkdirSync(segOutputDir, { recursive: true });

    const pythonCmd = [
      'python',
      resolveWorkerPath('sam_runner.py'),
      '--manifest',   sh.manifest_path,
      '--checkpoint', resolveCheckpoint('sam_vit_b.pth'),
      '--output-dir', segOutputDir,
      '--model-type', 'vit_b',
      '--device',     'cpu',
    ];

    execSync(pythonCmd.join(' '), { encoding: 'utf-8', timeout: 600000 });  // 10min timeout

    // Register in DB
    const result = await createSamSegmentation({
      name: `seg-from-${sh.name || handoffId.slice(0, 8)}`,
      source_handoff_id: handoffId,
      manifest_path: manifestOut,
      status: 'completed',
    });

    if (result.ok && result.sam_segmentation) {
      logAudit({
        category: 'sam',
        action: 'run',
        target: `sam_segmentation:auto:${handoffId}`,
        result: 'success',
        detail: {
          trigger: 'auto_from_handoff',
          handoff_id: handoffId,
          segmentation_id: result.sam_segmentation.segmentation_id,
          manifest_path: manifestOut,
          prompt_count: result.sam_segmentation.prompt_count,
          mask_count: result.sam_segmentation.mask_count,
        },
      }).catch(() => {});
    }

    return result;
  } catch (e: any) {
    logAudit({
      category: 'sam',
      action: 'run',
      target: `sam_segmentation:auto:${handoffId}`,
      result: 'failed',
      detail: {
        trigger: 'auto_from_handoff',
        handoff_id: handoffId,
        error: e.message,
      },
    }).catch(() => {});
    return { ok: false, error: e.message };
  }
}
