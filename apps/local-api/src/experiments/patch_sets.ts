import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'crypto';

function genId() { return randomUUID(); }
function now()   { return new Date().toISOString(); }

const CreatePatchSetSchema = z.object({
  name:                 z.string().optional(),
  patch_type:           z.enum(['badcases', 'hardcases']).default('badcases'),
  source_experiment_id: z.string().optional(),
  source_model_id:      z.string().optional(),
  source_evaluation_id: z.string().optional(),
  source_dataset_id:    z.string().optional(),
  source_dataset_version: z.string().optional(),
  manifest_path:        z.string().optional(),
  status:               z.enum(['draft', 'registered', 'consumed']).default('draft'),
});

// ── Parse manifest to extract sample_count ──────────────────────────────────
function parseManifestSampleCount(manifestPath: string): number {
  try {
    const fs = require('fs');
    if (!fs.existsSync(manifestPath)) return 0;
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const data = JSON.parse(content);
    return data.total_count ?? data.badcases?.length ?? data.hardcases?.length ?? 0;
  } catch {
    return 0;
  }
}

// ── POST /api/patch-sets ─────────────────────────────────────────────────────
export async function createPatchSet(body: any) {
  const db = getDatabase();
  const validation = CreatePatchSetSchema.safeParse(body);
  if (!validation.success) {
    return { ok: false, error: validation.error.message };
  }
  const data = validation.data;

  // If manifest_path provided, auto-extract sample_count
  let sample_count = data.manifest_path ? parseManifestSampleCount(data.manifest_path) : 0;

  // Resolve experiment → model + dataset
  let source_model_id = data.source_model_id || '';
  let source_dataset_id = data.source_dataset_id || '';
  let source_dataset_version = data.source_dataset_version || '';

  if (data.source_experiment_id) {
    const exp = db.prepare('SELECT id, name, report_path, eval_manifest_path, badcases_manifest_path, hardcases_manifest_path FROM experiments WHERE id = ?').get(data.source_experiment_id) as any;
    if (!exp) return { ok: false, error: `Experiment ${data.source_experiment_id} not found` };

    // Resolve model from latest evaluation
    if (!source_model_id) {
      const eval_ = db.prepare('SELECT id, model_name, artifact_name FROM evaluations WHERE experiment_id = ? ORDER BY created_at DESC LIMIT 1').get(data.source_experiment_id) as any;
      if (eval_) {
        const model = db.prepare('SELECT model_id FROM models WHERE latest_evaluation_id = ?').get(eval_.id) as any;
        if (model) source_model_id = model.model_id;
      }
    }

    // Resolve dataset from experiment
    if (!source_dataset_id) {
      source_dataset_id = exp.dataset_id || '';
      const ds = db.prepare('SELECT version FROM datasets WHERE id = ?').get(source_dataset_id) as any;
      if (ds) source_dataset_version = ds.version;
    }
  }

  const id = genId();
  const nowStr = now();

  db.prepare(`
    INSERT INTO patch_sets (
      patch_set_id, name, patch_type, status,
      source_experiment_id, source_model_id, source_evaluation_id,
      source_dataset_id, source_dataset_version,
      manifest_path, sample_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name || `${data.patch_type}-${id.slice(0, 8)}`,
    data.patch_type, data.status,
    data.source_experiment_id || '', source_model_id, data.source_evaluation_id || '',
    source_dataset_id, source_dataset_version,
    data.manifest_path || '', sample_count, nowStr, nowStr
  );

  return { ok: true, patch_set: { patch_set_id: id, ...data, sample_count } };
}

// ── GET /api/patch-sets ─────────────────────────────────────────────────────
export async function listPatchSets(params: {
  source_experiment_id?: string;
  source_model_id?: string;
  source_dataset_id?: string;
  patch_type?: string;
  status?: string;
  limit?: number;
}) {
  const db = getDatabase();
  const limit = params.limit || 50;
  let sql = 'SELECT * FROM patch_sets WHERE 1=1';
  const binds: any[] = [];

  if (params.source_experiment_id) { sql += ' AND source_experiment_id = ?'; binds.push(params.source_experiment_id); }
  if (params.source_model_id)       { sql += ' AND source_model_id = ?';       binds.push(params.source_model_id); }
  if (params.source_dataset_id)      { sql += ' AND source_dataset_id = ?';      binds.push(params.source_dataset_id); }
  if (params.patch_type)            { sql += ' AND patch_type = ?';             binds.push(params.patch_type); }
  if (params.status)                { sql += ' AND status = ?';                 binds.push(params.status); }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const rows = db.prepare(sql).all(...binds);
  return { ok: true, patch_sets: rows, total: rows.length };
}

// ── GET /api/patch-sets/:id ─────────────────────────────────────────────────
export async function getPatchSet(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM patch_sets WHERE patch_set_id = ?').get(id) as any;
  if (!row) return { ok: false, error: `PatchSet ${id} not found` };
  return { ok: true, patch_set: row };
}

// ── PATCH /api/patch-sets/:id ───────────────────────────────────────────────
export async function updatePatchSet(id: string, body: any) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM patch_sets WHERE patch_set_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `PatchSet ${id} not found` };

  const allowed = ['name', 'status', 'manifest_path', 'sample_count', 'source_dataset_id', 'source_dataset_version'];
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

  db.prepare(`UPDATE patch_sets SET ${updates.join(', ')} WHERE patch_set_id = ?`).run(...binds);
  const updated = db.prepare('SELECT * FROM patch_sets WHERE patch_set_id = ?').get(id);
  return { ok: true, patch_set: updated };
}

// ── DELETE /api/patch-sets/:id ──────────────────────────────────────────────
export async function deletePatchSet(id: string) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM patch_sets WHERE patch_set_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `PatchSet ${id} not found` };
  db.prepare('DELETE FROM patch_sets WHERE patch_set_id = ?').run(id);
  return { ok: true };
}

// ── GET /api/patch-sets/:id/lineage ─────────────────────────────────────────
// Returns the full lineage chain: experiment → patch_set → dataset
export async function getPatchSetLineage(id: string) {
  const db = getDatabase();
  const ps = db.prepare('SELECT * FROM patch_sets WHERE patch_set_id = ?').get(id) as any;
  if (!ps) return { ok: false, error: `PatchSet ${id} not found` };

  let experiment = null;
  let model = null;
  let dataset = null;

  if (ps.source_experiment_id) {
    experiment = db.prepare('SELECT id, experiment_code, name, dataset_id, status, task_type FROM experiments WHERE id = ?').get(ps.source_experiment_id) as any;
    if (experiment?.dataset_id) {
      dataset = db.prepare('SELECT id, dataset_code, name, version, dataset_type, sample_count FROM datasets WHERE id = ?').get(experiment.dataset_id) as any;
    }
  }

  if (ps.source_model_id) {
    model = db.prepare('SELECT model_id, name, version FROM models WHERE model_id = ?').get(ps.source_model_id) as any;
  }

  return { ok: true, lineage: { patch_set: ps, experiment, model, dataset } };
}

// ── Convenience: auto-create patch set from experiment's manifest ────────────
// Called by workflow after eval completes — creates patch sets for both
// badcases and hardcases if manifests exist
export async function autoCreateFromExperiment(experimentId: string) {
  const db = getDatabase();
  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(experimentId) as any;
  if (!exp) return { ok: false, error: `Experiment ${experimentId} not found` };

  const results: any[] = [];

  for (const field of ['badcases_manifest_path', 'hardcases_manifest_path'] as const) {
    if (exp[field]) {
      const type = field === 'badcases_manifest_path' ? 'badcases' : 'hardcases';
      const result = await createPatchSet({
        name: `${type}-from-${exp.name || experimentId.slice(0, 8)}`,
        patch_type: type,
        source_experiment_id: experimentId,
        manifest_path: exp[field],
        status: 'draft',
      });
      results.push(result);
    }
  }

  return { ok: true, patch_sets: results };
}
