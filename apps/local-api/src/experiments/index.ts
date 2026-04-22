import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';
import {
  createPatchSet, listPatchSets, getPatchSet,
  updatePatchSet, deletePatchSet, getPatchSetLineage,
  autoCreateFromExperiment,
} from './patch_sets.js';
import {
  createSamHandoff, listSamHandoffs, getSamHandoff,
  updateSamHandoff, deleteSamHandoff, getSamHandoffLineage,
  autoCreateFromExperiment as autoCreateSamHandoff,
} from './sam_handoffs.js';
import {
  createSamSegmentation, listSamSegmentations, getSamSegmentation,
  updateSamSegmentation, deleteSamSegmentation, getSamSegmentationLineage,
  createSegmentationFromHandoff,
} from './sam_segmentations.js';
import {
  createClassifierVerification, listClassifierVerifications, getClassifierVerification,
  updateClassifierVerification, deleteClassifierVerification, getClassifierVerificationLineage,
  createVerificationFromSegmentation,
} from './classifier_verifications.js';
import {
  createTrackerRun, listTrackerRuns, getTrackerRun,
  updateTrackerRun, deleteTrackerRun, getTrackerRunLineage,
  createTrackerFromVerification,
} from './tracker_runs.js';
import {
  createRuleEngineRun, listRuleEngineRuns, getRuleEngineRun,
  updateRuleEngineRun, deleteRuleEngineRun, getRuleEngineRunLineage,
  createRuleFromTracker,
} from './rule_engine_runs.js';

function genId()  { return crypto.randomUUID(); }
function nowStr() { return new Date().toISOString(); }
function pj(val: any) { return typeof val === 'string' ? val : JSON.stringify(val || {}); }
function uj(val: any) { try { return JSON.parse(val); } catch { return {}; } }

const CreateSchema = z.object({
  experiment_code: z.string().min(1),
  name: z.string().min(1),
  dataset_id:       z.string().optional(),
  dataset_code:     z.string().optional(),
  dataset_version:  z.string().optional(),
  template_id:      z.string().optional(),
  template_code:    z.string().optional(),
  params_snapshot_json: z.any().optional(),
});

/** 快照辅助：从外部表捞 dataset/template/version 信息，写入 experiment 的快照列 */
function snapshotSources(db: any, exp: any) {
  const snaps: Record<string, string> = {};
  if (exp.dataset_id) {
    const ds = db.prepare('SELECT id, dataset_code, version, dataset_type, description FROM datasets WHERE id = ?').get(exp.dataset_id) as any;
    if (ds) {
      snaps.dataset_snapshot = JSON.stringify({ id: ds.id, dataset_code: ds.dataset_code, version: ds.version, dataset_type: ds.dataset_type, description: ds.description });
    }
  }
  if (exp.template_id) {
    const tm = db.prepare('SELECT id, code, name, version, status FROM templates WHERE id = ?').get(exp.template_id) as any;
    if (tm) {
      snaps.template_snapshot = JSON.stringify({ id: tm.id, code: tm.code, name: tm.name, version: tm.version, status: tm.status });
    }
  }
  return snaps;
}

/** POST /api/experiments */
export async function createExperiment(body: any) {
  const db = getDatabase();
  const v = CreateSchema.safeParse(body);
  if (!v.success) return { ok: false, error: v.error.errors[0].message };

  const d = v.data;
  const ex = db.prepare('SELECT id FROM experiments WHERE experiment_code = ?').get(d.experiment_code);
  if (ex) return { ok: false, error: `Experiment code "${d.experiment_code}" already exists` };

  // 若传了 dataset_id 但没传 version，自动补
  let dataset_version = d.dataset_version || '';
  if (d.dataset_id && !dataset_version) {
    const ds = db.prepare('SELECT version FROM datasets WHERE id = ?').get(d.dataset_id) as any;
    if (ds) dataset_version = ds.version || '';
  }

  // 若传了 template_id 但没传 version，自动补
  let template_version = '';
  if (d.template_id) {
    const tm = db.prepare('SELECT version FROM templates WHERE id = ?').get(d.template_id) as any;
    if (tm) template_version = tm.version || '';
  }

  // 快照
  const params_snapshot = pj(d.params_snapshot_json || {});
  const id = genId();
  const t = nowStr();

  db.prepare(`
    INSERT INTO experiments (id, experiment_code, name, status, dataset_id, dataset_code, dataset_version,
      template_id, template_code, params_snapshot_json,
      config_json, metrics_json, notes,
      created_at, updated_at)
    VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, '{}', '{}', '', ?, ?)
  `).run(id, d.experiment_code, d.name,
    d.dataset_id || '', d.dataset_code || '', dataset_version,
    d.template_id || '', d.template_code || '',
    params_snapshot, t, t);

  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id) as any;
  return { ok: true, experiment: exp };
}

/** GET /api/experiments */
export async function listExperiments(query: any) {
  const db = getDatabase();
  const { keyword, status, dataset_code, template_code } = query;
  let sql = 'SELECT * FROM experiments WHERE 1=1';
  const params: any[] = [];
  if (keyword) { sql += ' AND (name LIKE ? OR experiment_code LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
  if (status)  { sql += ' AND status = ?'; params.push(status); }
  if (dataset_code) { sql += ' AND dataset_code = ?'; params.push(dataset_code); }
  if (template_code) { sql += ' AND template_code = ?'; params.push(template_code); }
  sql += ' ORDER BY updated_at DESC';
  const rows = db.prepare(sql).all(...params);
  return { ok: true, experiments: rows, total: rows.length };
}

/** GET /api/experiments/:id */
export async function getExperimentById(id: string) {
  const db = getDatabase();
  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id) as any;
  if (!exp) return { ok: false, error: 'Experiment not found' };

  let dataset = null, template = null;
  if (exp.dataset_id)   dataset  = db.prepare('SELECT id, dataset_code, version, dataset_type, description FROM datasets WHERE id = ?').get(exp.dataset_id);
  if (exp.template_id)  template = db.prepare('SELECT id, code, name, version, status FROM templates WHERE id = ?').get(exp.template_id);

  return {
    ok: true,
    experiment: exp,
    dataset,
    template,
    params_snapshot: uj(exp.params_snapshot_json),
  };
}

/** PUT /api/experiments/:id */
export async function updateExperiment(id: string, body: any) {
  const db = getDatabase();
  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id) as any;
  if (!exp) return { ok: false, error: 'Experiment not found' };

  const allowed = ['name','status','dataset_id','dataset_code','dataset_version',
    'template_id','template_code','template_version','params_snapshot_json',
    'config_json','metrics_json','notes','checkpoint_path','report_path'];
  const fields: string[] = [], vals: any[] = [];
  for (const k of allowed) {
    if (body[k] !== undefined) {
      fields.push(`${k} = ?`);
      vals.push(k.endsWith('_json') ? pj(body[k]) : body[k]);
    }
  }
  if (!fields.length) return { ok: true, experiment: exp };
  fields.push('updated_at = ?'); vals.push(nowStr()); vals.push(id);
  db.prepare(`UPDATE experiments SET ${fields.join(',')} WHERE id = ?`).run(...vals);
  const updated = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
  return { ok: true, experiment: updated };
}

/** DELETE /api/experiments/:id */
export async function deleteExperiment(id: string) {
  const db = getDatabase();
  if (!db.prepare('SELECT id FROM experiments WHERE id = ?').get(id)) return { ok: false, error: 'Not found' };
  db.prepare('DELETE FROM experiments WHERE id = ?').run(id);
  return { ok: true };
}

/** GET /api/experiments/:id/evaluations */
export async function getExperimentEvaluations(id: string) {
  const db = getDatabase();
  const exp = db.prepare('SELECT id FROM experiments WHERE id = ?').get(id);
  if (!exp) return { ok: false, error: 'Experiment not found' };

  // evaluations 通过 experiment_id 直接关联，或通过 training_job_id 关联
  const evals = db.prepare(
    "SELECT * FROM evaluations WHERE experiment_id = ? ORDER BY created_at DESC"
  ).all(id);

  return { ok: true, experiment_id: id, evaluations: evals, total: evals.length };
}

/** GET /api/experiments/:id/lineage */
export async function getExperimentLineage(id: string) {
  const db = getDatabase();
  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id) as any;
  if (!exp) return { ok: false, error: 'Experiment not found' };

  // Upstream: dataset + template
  let dataset = null, template = null;
  if (exp.dataset_id) dataset = db.prepare('SELECT id, dataset_code, version, dataset_type, sample_count, description FROM datasets WHERE id = ?').get(exp.dataset_id);
  if (exp.template_id) template = db.prepare('SELECT id, code, name, version, status, description FROM templates WHERE id = ?').get(exp.template_id);

  // Downstream: evaluations + artifacts + runs
  const evaluations = db.prepare("SELECT * FROM evaluations WHERE experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);
  // artifacts: join through evaluations (artifacts.evaluation_id → evaluations.id → this experiment)
  const artifacts   = db.prepare("SELECT * FROM artifacts WHERE evaluation_id IN (SELECT id FROM evaluations WHERE experiment_id = ?) ORDER BY created_at DESC LIMIT 50").all(id);
  const runs        = db.prepare("SELECT * FROM runs WHERE source_type = 'experiment' AND source_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  // Models via source_experiment_id
  const models = db.prepare("SELECT * FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  // v3.6.0: Patch sets from this experiment
  const patch_sets = db.prepare("SELECT * FROM patch_sets WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  // v3.7.0: SAM handoffs from this experiment
  const sam_handoffs = db.prepare("SELECT * FROM sam_handoffs WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  // v3.8.0: SAM segmentations from this experiment
  const sam_segmentations = db.prepare("SELECT * FROM sam_segmentations WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  // v3.9.0: Classifier verifications from this experiment
  const classifier_verifications = db.prepare("SELECT * FROM classifier_verifications WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  // v4.0.0: Tracker runs from this experiment
  const tracker_runs = db.prepare("SELECT * FROM tracker_runs WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  // v4.1.0: Rule engine runs from this experiment
  const rule_engine_runs = db.prepare("SELECT * FROM rule_engine_runs WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);

  return {
    ok: true,
    experiment: exp,
    upstream: { dataset, template },
    downstream: { evaluations, artifacts, runs, models, patch_sets, sam_handoffs, sam_segmentations, classifier_verifications, tracker_runs, rule_engine_runs },
    params_snapshot: uj(exp.params_snapshot_json),
  };
}

// ── Route registration ───────────────────────────────────────────────────────
export async function registerExperimentsRoutes(app: any) {
  app.get('/api/experiments', async (req, reply) => listExperiments(req.query));
  app.get('/api/experiments/:id', async (req, reply) => {
    const r = await getExperimentById(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.post('/api/experiments', async (req, reply) => {
    const r = await createExperiment(req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.put('/api/experiments/:id', async (req, reply) => {
    const r = await updateExperiment(req.params.id, req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.delete('/api/experiments/:id', async (req, reply) => {
    const r = await deleteExperiment(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/experiments/:id/evaluations', async (req, reply) => {
    const r = await getExperimentEvaluations(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/experiments/:id/lineage', async (req, reply) => {
    const r = await getExperimentLineage(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });

  // v3.4.0: Compare experiments or models
  app.post('/api/compare', async (req: any, reply: any) => {
    try {
      const db = getDatabase();
      const { experiment_ids, model_ids } = req.body || {};

      if (!experiment_ids?.length && !model_ids?.length) {
        return reply.status(400).send({ ok: false, error: 'Provide experiment_ids or model_ids' });
      }

      const results: any[] = [];

      // Compare experiments
      if (experiment_ids?.length) {
        for (const expId of experiment_ids) {
          const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(expId) as any;
          if (!exp) continue;

          // Get latest evaluation for this experiment's model
          const latestEval = exp.report_path || exp.eval_manifest_path ? null :
            db.prepare(`
              SELECT ev.* FROM evaluations ev
              JOIN models m ON m.latest_evaluation_id = ev.id
              WHERE m.source_experiment_id = ?
              ORDER BY ev.created_at DESC LIMIT 1
            `).get(expId) as any;

          // Get model for this experiment
          const model = db.prepare(`
            SELECT * FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 1
          `).get(expId) as any;

          results.push({
            type: 'experiment',
            id: expId,
            name: exp.name,
            status: exp.status,
            task_type: exp.task_type,
            model_family: exp.model_family,
            execution_mode: exp.execution_mode,
            final_device: exp.final_device,
            resume_used: !!exp.resume_used,
            config_snapshot_path: exp.config_snapshot_path,
            env_snapshot_path: exp.env_snapshot_path,
            report_path: exp.report_path,
            eval_manifest_path: exp.eval_manifest_path,
            badcases_manifest_path: exp.badcases_manifest_path,
            hardcases_manifest_path: exp.hardcases_manifest_path,
            // Metrics from evaluations table
            metrics: latestEval?.result_summary_json ? JSON.parse(latestEval.result_summary_json) : null,
            model_id: model?.model_id,
            model_artifact: model?.artifact_path,
            created_at: exp.created_at,
            finished_at: exp.finished_at,
          });
        }
      }

      // Compare models
      if (model_ids?.length) {
        for (const modelId of model_ids) {
          const model = db.prepare('SELECT * FROM models WHERE model_id = ?').get(modelId) as any;
          if (!model) continue;

          // Get latest evaluation
          const latestEval = model.latest_evaluation_id
            ? db.prepare('SELECT * FROM evaluations WHERE id = ?').get(model.latest_evaluation_id) as any
            : null;

          // Get experiment
          const experiment = model.source_experiment_id
            ? db.prepare('SELECT * FROM experiments WHERE id = ?').get(model.source_experiment_id) as any
            : null;

          results.push({
            type: 'model',
            id: modelId,
            name: model.name,
            task_type: model.task_type,
            model_family: model.model_family,
            artifact_path: model.artifact_path,
            execution_mode: experiment?.execution_mode || '',
            final_device: experiment?.final_device || '',
            // Metrics
            metrics: latestEval?.result_summary_json ? JSON.parse(latestEval.result_summary_json) : null,
            latest_evaluation_id: model.latest_evaluation_id,
            experiment_id: model.source_experiment_id,
            report_path: experiment?.report_path || '',
            created_at: model.created_at,
          });
        }
      }

      // Build compare summary
      const compareSummary: any = {};
      if (results.length >= 2) {
        compareSummary.type = experiment_ids?.length ? 'experiments' : 'models';
        compareSummary.count = results.length;

        // Extract metrics for comparison
        const metricsComparison: any[] = [];
        for (const r of results) {
          const m = r.metrics?.metrics_summary || r.metrics || {};
          metricsComparison.push({
            id: r.id,
            name: r.name,
            precision: m.precision || m.map || 0,
            recall: m.recall || 0,
            map50: m.map50 || 0,
            map50_95: m.map || 0,
            fitness: m.fitness || 0,
          });
        }
        compareSummary.metrics_comparison = metricsComparison;

        // Device comparison
        compareSummary.device_comparison = results.map(r => ({
          id: r.id,
          name: r.name,
          device: r.final_device,
          execution_mode: r.execution_mode,
        }));

        // Report availability
        compareSummary.report_comparison = results.map(r => ({
          id: r.id,
          name: r.name,
          has_report: !!r.report_path,
          report_path: r.report_path,
          has_badcases: !!r.badcases_manifest_path,
          has_hardcases: !!r.hardcases_manifest_path,
        }));
      }

      return { ok: true, results, compare_summary: compareSummary };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  // v3.6.0: Patch Sets CRUD
  app.get('/api/patch-sets', async (req: any, reply) => {
    const r = await listPatchSets({
      source_experiment_id: req.query.experiment_id,
      source_model_id: req.query.model_id,
      source_dataset_id: req.query.dataset_id,
      patch_type: req.query.patch_type,
      status: req.query.status,
      limit: parseInt(req.query.limit || '50'),
    });
    return r;
  });
  app.post('/api/patch-sets', async (req: any, reply) => {
    const r = await createPatchSet(req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.get('/api/patch-sets/:id', async (req: any, reply) => {
    const r = await getPatchSet(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.patch('/api/patch-sets/:id', async (req: any, reply) => {
    const r = await updatePatchSet(req.params.id, req.body);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.delete('/api/patch-sets/:id', async (req: any, reply) => {
    const r = await deletePatchSet(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/patch-sets/:id/lineage', async (req: any, reply) => {
    const r = await getPatchSetLineage(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  // Auto-create from experiment (for workflow integration)
  app.post('/api/experiments/:id/patch-sets', async (req: any, reply) => {
    const r = await autoCreateFromExperiment(req.params.id);
    return r.ok ? r : reply.status(400).send(r);
  });

  // v3.7.0: SAM Handoffs CRUD
  app.get('/api/sam-handoffs', async (req: any, reply) => {
    return listSamHandoffs({
      experiment_id: req.query.experiment_id,
      model_id: req.query.model_id,
      dataset_id: req.query.dataset_id,
      status: req.query.status,
      limit: parseInt(req.query.limit || '50'),
    });
  });
  app.post('/api/sam-handoffs', async (req: any, reply) => {
    const r = await createSamHandoff(req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.get('/api/sam-handoffs/:id', async (req: any, reply) => {
    const r = await getSamHandoff(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.patch('/api/sam-handoffs/:id', async (req: any, reply) => {
    const r = await updateSamHandoff(req.params.id, req.body);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.delete('/api/sam-handoffs/:id', async (req: any, reply) => {
    const r = await deleteSamHandoff(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/sam-handoffs/:id/lineage', async (req: any, reply) => {
    const r = await getSamHandoffLineage(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  // Auto-create SAM handoff from experiment
  app.post('/api/experiments/:id/sam-handoffs', async (req: any, reply) => {
    const r = await autoCreateSamHandoff(req.params.id);
    return r.ok ? r : reply.status(400).send(r);
  });

  // v3.8.0: SAM Segmentations CRUD
  app.get('/api/sam-segmentations', async (req: any) => {
    return listSamSegmentations({
      handoff_id: req.query.handoff_id,
      experiment_id: req.query.experiment_id,
      model_id: req.query.model_id,
      dataset_id: req.query.dataset_id,
      status: req.query.status,
      limit: parseInt(req.query.limit || '50'),
    });
  });
  app.post('/api/sam-segmentations', async (req: any, reply) => {
    const r = await createSamSegmentation(req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.get('/api/sam-segmentations/:id', async (req: any, reply) => {
    const r = await getSamSegmentation(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.patch('/api/sam-segmentations/:id', async (req: any, reply) => {
    const r = await updateSamSegmentation(req.params.id, req.body);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.delete('/api/sam-segmentations/:id', async (req: any, reply) => {
    const r = await deleteSamSegmentation(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/sam-segmentations/:id/lineage', async (req: any, reply) => {
    const r = await getSamSegmentationLineage(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  // Auto-run SAM segmentation from handoff
  app.post('/api/sam-handoffs/:id/segmentations', async (req: any, reply) => {
    const r = await createSegmentationFromHandoff(req.params.id);
    return r.ok ? r : reply.status(400).send(r);
  });

  // v3.9.0: Classifier Verifications CRUD
  app.get('/api/classifier-verifications', async (req: any) => {
    return listClassifierVerifications({
      segmentation_id: req.query.segmentation_id,
      handoff_id: req.query.handoff_id,
      experiment_id: req.query.experiment_id,
      model_id: req.query.model_id,
      dataset_id: req.query.dataset_id,
      status: req.query.status,
      limit: parseInt(req.query.limit || '50'),
    });
  });
  app.post('/api/classifier-verifications', async (req: any, reply) => {
    const r = await createClassifierVerification(req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.get('/api/classifier-verifications/:id', async (req: any, reply) => {
    const r = await getClassifierVerification(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.patch('/api/classifier-verifications/:id', async (req: any, reply) => {
    const r = await updateClassifierVerification(req.params.id, req.body);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.delete('/api/classifier-verifications/:id', async (req: any, reply) => {
    const r = await deleteClassifierVerification(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/classifier-verifications/:id/lineage', async (req: any, reply) => {
    const r = await getClassifierVerificationLineage(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  // Auto-run classifier verification on SAM segmentation
  app.post('/api/sam-segmentations/:id/classifier-verifications', async (req: any, reply) => {
    const r = await createVerificationFromSegmentation(req.params.id);
    return r.ok ? r : reply.status(400).send(r);
  });

  // v4.0.0: Tracker Runs CRUD
  app.get('/api/tracker-runs', async (req: any) => {
    return listTrackerRuns({
      verification_id: req.query.verification_id,
      segmentation_id: req.query.segmentation_id,
      handoff_id: req.query.handoff_id,
      experiment_id: req.query.experiment_id,
      model_id: req.query.model_id,
      dataset_id: req.query.dataset_id,
      status: req.query.status,
      limit: parseInt(req.query.limit || '50'),
    });
  });
  app.post('/api/tracker-runs', async (req: any, reply) => {
    const r = await createTrackerRun(req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.get('/api/tracker-runs/:id', async (req: any, reply) => {
    const r = await getTrackerRun(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.patch('/api/tracker-runs/:id', async (req: any, reply) => {
    const r = await updateTrackerRun(req.params.id, req.body);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.delete('/api/tracker-runs/:id', async (req: any, reply) => {
    const r = await deleteTrackerRun(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/tracker-runs/:id/lineage', async (req: any, reply) => {
    const r = await getTrackerRunLineage(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  // Auto-run tracker on classifier verification
  app.post('/api/classifier-verifications/:id/tracker-runs', async (req: any, reply) => {
    const r = await createTrackerFromVerification(req.params.id);
    return r.ok ? r : reply.status(400).send(r);
  });

  // v4.1.0: Rule Engine Runs CRUD
  app.get('/api/rule-engine-runs', async (req: any) => {
    return listRuleEngineRuns({
      tracker_run_id: req.query.tracker_run_id,
      verification_id: req.query.verification_id,
      experiment_id: req.query.experiment_id,
      model_id: req.query.model_id,
      dataset_id: req.query.dataset_id,
      status: req.query.status,
      limit: parseInt(req.query.limit || '50'),
    });
  });
  app.post('/api/rule-engine-runs', async (req: any, reply) => {
    const r = await createRuleEngineRun(req.body);
    return r.ok ? r : reply.status(400).send(r);
  });
  app.get('/api/rule-engine-runs/:id', async (req: any, reply) => {
    const r = await getRuleEngineRun(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.patch('/api/rule-engine-runs/:id', async (req: any, reply) => {
    const r = await updateRuleEngineRun(req.params.id, req.body);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.delete('/api/rule-engine-runs/:id', async (req: any, reply) => {
    const r = await deleteRuleEngineRun(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  app.get('/api/rule-engine-runs/:id/lineage', async (req: any, reply) => {
    const r = await getRuleEngineRunLineage(req.params.id);
    return r.ok ? r : reply.status(404).send(r);
  });
  // Auto-run rule engine on tracker run
  app.post('/api/tracker-runs/:id/rule-engine-runs', async (req: any, reply) => {
    const r = await createRuleFromTracker(req.params.id);
    return r.ok ? r : reply.status(400).send(r);
  });
}
