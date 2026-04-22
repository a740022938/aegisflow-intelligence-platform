import { getDatabase } from '../db/builtin-sqlite.js';
import { logAudit } from '../audit/index.js';

function genId()  { return crypto.randomUUID(); }
function now()    { return new Date().toISOString(); }

interface CreateSamHandoffBody {
  name?: string;
  source_experiment_id?: string;
  source_model_id?: string;
  source_dataset_id?: string;
  source_dataset_version?: string;
  manifest_path?: string;
  roi_count?: number;
  prompt_count?: number;
  prompt_type?: string;
  total_detections?: number;
  avg_confidence?: number;
  unique_classes?: number;
  status?: string;
}

// ── Parse SAM handoff manifest to extract stats ───────────────────────────────
function parseManifestStats(manifestPath: string): Partial<CreateSamHandoffBody> {
  try {
    const fs = require('fs');
    if (!fs.existsSync(manifestPath)) return {};
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    return {
      roi_count:        data.summary?.roi_count        || 0,
      prompt_count:     data.summary?.prompt_count     || 0,
      total_detections: data.summary?.total_detections || 0,
      avg_confidence:   data.summary?.avg_confidence   || 0,
      unique_classes:   data.summary?.unique_classes   || 0,
      prompt_type:      'box',
    };
  } catch {
    return {};
  }
}

// ── POST /api/sam-handoffs ───────────────────────────────────────────────────
export async function createSamHandoff(body: CreateSamHandoffBody) {
  const db = getDatabase();

  // If manifest_path provided, auto-extract stats
  const stats = body.manifest_path ? parseManifestStats(body.manifest_path) : {};

  // Resolve experiment context
  let source_model_id = body.source_model_id || '';
  let source_dataset_id = body.source_dataset_id || '';
  let source_dataset_version = body.source_dataset_version || '';

  if (body.source_experiment_id) {
    const exp = db.prepare('SELECT id, name, dataset_id FROM experiments WHERE id = ?').get(body.source_experiment_id) as any;
    if (!exp) return { ok: false, error: `Experiment ${body.source_experiment_id} not found` };

    if (!source_dataset_id) {
      source_dataset_id = exp.dataset_id || '';
      const ds = db.prepare('SELECT version FROM datasets WHERE id = ?').get(source_dataset_id) as any;
      if (ds) source_dataset_version = ds.version;
    }

    if (!source_model_id) {
      const model = db.prepare('SELECT model_id FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 1').get(body.source_experiment_id) as any;
      if (model) source_model_id = model.model_id;
    }
  }

  const id = genId();
  const t = now();
  const name = body.name || `handoff-${id.slice(0, 8)}`;

  db.prepare(`
    INSERT INTO sam_handoffs (
      handoff_id, name, status, source_experiment_id, source_model_id,
      source_dataset_id, source_dataset_version, manifest_path,
      roi_count, prompt_count, prompt_type, total_detections,
      avg_confidence, unique_classes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, body.status || 'ready',
    body.source_experiment_id || '', source_model_id, source_dataset_id, source_dataset_version,
    body.manifest_path || '',
    body.roi_count ?? stats.roi_count ?? 0,
    body.prompt_count ?? stats.prompt_count ?? 0,
    body.prompt_type || stats.prompt_type || 'box',
    body.total_detections ?? stats.total_detections ?? 0,
    body.avg_confidence ?? stats.avg_confidence ?? 0,
    body.unique_classes ?? stats.unique_classes ?? 0,
    t, t,
  );

  const row = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(id);
  logAudit({
    category: 'sam',
    action: 'create',
    target: `sam_handoff:${id}`,
    result: 'success',
    detail: {
      handoff_id: id,
      name,
      source_experiment_id: body.source_experiment_id || '',
      source_model_id,
      source_dataset_id,
      manifest_path: body.manifest_path || '',
      roi_count: body.roi_count ?? stats.roi_count ?? 0,
      prompt_count: body.prompt_count ?? stats.prompt_count ?? 0,
      total_detections: body.total_detections ?? stats.total_detections ?? 0,
      avg_confidence: body.avg_confidence ?? stats.avg_confidence ?? 0,
    },
  }).catch(() => {});

  return { ok: true, sam_handoff: row };
}

// ── GET /api/sam-handoffs ─────────────────────────────────────────────────────
export async function listSamHandoffs(params: {
  experiment_id?: string;
  model_id?: string;
  dataset_id?: string;
  status?: string;
  limit?: number;
}) {
  const db = getDatabase();
  const limit = params.limit || 50;
  let sql = 'SELECT * FROM sam_handoffs WHERE 1=1';
  const binds: any[] = [];

  if (params.experiment_id) { sql += ' AND source_experiment_id = ?'; binds.push(params.experiment_id); }
  if (params.model_id)       { sql += ' AND source_model_id = ?';       binds.push(params.model_id); }
  if (params.dataset_id)      { sql += ' AND source_dataset_id = ?';      binds.push(params.dataset_id); }
  if (params.status)          { sql += ' AND status = ?';                  binds.push(params.status); }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const rows = db.prepare(sql).all(...binds);
  return { ok: true, sam_handoffs: rows, total: rows.length };
}

// ── GET /api/sam-handoffs/:id ─────────────────────────────────────────────────
export async function getSamHandoff(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(id) as any;
  if (!row) return { ok: false, error: `SamHandoff ${id} not found` };
  return { ok: true, sam_handoff: row };
}

// ── PATCH /api/sam-handoffs/:id ──────────────────────────────────────────────
export async function updateSamHandoff(id: string, body: any) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `SamHandoff ${id} not found` };

  const allowed = ['name', 'status', 'manifest_path', 'roi_count', 'prompt_count', 'total_detections', 'avg_confidence', 'unique_classes'];
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

  db.prepare(`UPDATE sam_handoffs SET ${updates.join(', ')} WHERE handoff_id = ?`).run(...binds);
  const updated = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(id);
  logAudit({
    category: 'sam',
    action: 'update',
    target: `sam_handoff:${id}`,
    result: 'success',
    detail: { handoff_id: id, updated_fields: body },
  }).catch(() => {});
  return { ok: true, sam_handoff: updated };
}

// ── DELETE /api/sam-handoffs/:id ─────────────────────────────────────────────
export async function deleteSamHandoff(id: string) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `SamHandoff ${id} not found` };
  db.prepare('DELETE FROM sam_handoffs WHERE handoff_id = ?').run(id);
  logAudit({
    category: 'sam',
    action: 'delete',
    target: `sam_handoff:${id}`,
    result: 'success',
    detail: { handoff_id: id, deleted_name: existing.name },
  }).catch(() => {});
  return { ok: true };
}

// ── GET /api/sam-handoffs/:id/lineage ─────────────────────────────────────────
// Returns: handoff -> experiment -> model -> dataset
export async function getSamHandoffLineage(id: string) {
  const db = getDatabase();
  const sh = db.prepare('SELECT * FROM sam_handoffs WHERE handoff_id = ?').get(id) as any;
  if (!sh) return { ok: false, error: `SamHandoff ${id} not found` };

  let experiment: any = null;
  let model: any = null;
  let dataset: any = null;

  if (sh.source_experiment_id) {
    experiment = db.prepare('SELECT id, experiment_code, name, status, task_type, dataset_id FROM experiments WHERE id = ?').get(sh.source_experiment_id) as any;
    if (experiment?.dataset_id) {
      dataset = db.prepare('SELECT id, dataset_code, name, version, dataset_type, sample_count FROM datasets WHERE id = ?').get(experiment.dataset_id) as any;
    }
  }

  if (sh.source_model_id) {
    model = db.prepare('SELECT model_id, name, version, artifact_path FROM models WHERE model_id = ?').get(sh.source_model_id) as any;
  }

  return { ok: true, lineage: { sam_handoff: sh, experiment, model, dataset } };
}

// ── Auto-create SAM handoff from experiment's YOLO eval result ────────────────
export async function autoCreateFromExperiment(experimentId: string) {
  const db = getDatabase();
  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(experimentId) as any;
  if (!exp) return { ok: false, error: `Experiment ${experimentId} not found` };

  // Resolve model
  const model = db.prepare('SELECT model_id FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 1').get(experimentId) as any;

  // Get eval result — used for both metrics AND dataset_yaml extraction
  let metrics: any = {};
  let dataset_yaml = '';
  const evalRow = db.prepare('SELECT result_summary_json FROM evaluations WHERE experiment_id = ? ORDER BY created_at DESC LIMIT 1').get(experimentId) as any;
  if (evalRow?.result_summary_json) {
    try {
      const evalResult = JSON.parse(evalRow.result_summary_json);
      // eval_manifest may have config.dataset_yaml AND metrics.sample_count/class_count
      const evalManifestPath = evalResult.eval_manifest_path;
      if (evalManifestPath) {
        try {
          const fs = require('fs');
          if (fs.existsSync(evalManifestPath)) {
            const evalManifest = JSON.parse(fs.readFileSync(evalManifestPath, 'utf-8'));
            dataset_yaml = evalManifest.config?.dataset_yaml || evalManifest.config?.data || '';
            // Pull sample/class counts from eval_manifest.metrics if present
            const em = evalManifest.metrics || {};
            if (em.sample_count) metrics.sample_count = em.sample_count;
            if (em.class_count)  metrics.class_count  = em.class_count;
          }
        } catch { /* fall through */ }
      }
      // Fallback metrics
      if (!metrics || Object.keys(metrics).length === 0) {
        metrics = evalResult.metrics_summary || evalResult.metrics || {};
      }
    } catch { /* ignore */ }
  }

  const summary = metrics.metrics_summary || metrics || {};
  const sampleCount = summary.sample_count || summary.total_images || 20;
  const classCount  = summary.class_count  || summary.unique_classes || 3;

  // Resolve dataset context
  let dataset_version = '';
  if (exp.dataset_id) {
    const ds = db.prepare('SELECT version FROM datasets WHERE id = ?').get(exp.dataset_id) as any;
    if (ds) dataset_version = ds.version || '';
  }

  // Call sam_handoff_builder.py via temp JSON file to avoid Windows shell quoting issues
  const { execSync } = require('child_process');
  const { writeFileSync, mkdirSync, existsSync } = require('fs');
  const runDir = `E:\\AGI_Factory\\runs\\handoff_${experimentId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const manifestOut = `${runDir}\\sam_handoff_manifest.json`;
  const metricsFile = `${runDir}\\_metrics_tmp.json`;

  try {
    if (!existsSync(runDir)) mkdirSync(runDir, { recursive: true });
    writeFileSync(metricsFile, JSON.stringify({ sample_count: sampleCount, class_count: classCount, avg_confidence: summary.avg_confidence || 0.65, unique_classes: classCount }), 'utf-8');

    // Build command — only push optional args with non-empty values
    const pythonCmd = [
      'python',
      'E:\\AGI_Factory\\repo\\workers\\python-worker\\sam_handoff_builder.py',
      '--metrics-file', metricsFile,
      '--output-dir', runDir,
      '--source-experiment-id', experimentId,
    ];
    if (model?.model_id) pythonCmd.push('--source-model-id', model.model_id);
    if (exp.dataset_id) pythonCmd.push('--source-dataset-id', exp.dataset_id);
    // Pass dataset.yaml if available → enables real label loading
    if (dataset_yaml && existsSync(dataset_yaml)) {
      pythonCmd.push('--dataset-yaml', dataset_yaml);
      pythonCmd.push('--split', 'val');
    }

    execSync(pythonCmd.join(' '), { encoding: 'utf-8', timeout: 60000 });

    // Register handoff in DB
    const result = await createSamHandoff({
      name: `sam-handoff-from-${exp.name || experimentId.slice(0, 8)}`,
      source_experiment_id: experimentId,
      source_model_id: model?.model_id || '',
      source_dataset_id: exp.dataset_id || '',
      manifest_path: manifestOut,
      status: 'ready',
    });

    if (result.ok && result.sam_handoff) {
      logAudit({
        category: 'sam',
        action: 'run',
        target: `sam_handoff:auto:${experimentId}`,
        result: 'success',
        detail: {
          trigger: 'auto_from_experiment',
          experiment_id: experimentId,
          handoff_id: result.sam_handoff.handoff_id,
          manifest_path: manifestOut,
          roi_count: result.sam_handoff.roi_count,
        },
      }).catch(() => {});
    }

    return result;
  } catch (e: any) {
    logAudit({
      category: 'sam',
      action: 'run',
      target: `sam_handoff:auto:${experimentId}`,
      result: 'failed',
      detail: {
        trigger: 'auto_from_experiment',
        experiment_id: experimentId,
        error: e.message,
      },
    }).catch(() => {});
    return { ok: false, error: e.message };
  }
}
