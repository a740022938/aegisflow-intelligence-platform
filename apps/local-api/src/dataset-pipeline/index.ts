/**
 * Dataset Pipeline Module
 * 最小可运行闭环：数据导入登记 → 基础清洗记录 → split manifest → dataset version lineage
 * 所有执行动作统一挂 runs 体系，不分叉。
 */
import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';

function generateId() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function parseJson(val: string | undefined | null, fallback: any = null) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ── Schemas ──────────────────────────────────────────────────────────────────
const createPipelineConfigSchema = z.object({
  config_code: z.string().min(1, 'config_code is required'),
  name: z.string().min(1, 'name is required'),
  description: z.string().default(''),
  pipeline_type: z.enum(['import', 'clean', 'split', 'augment', 'validate', 'full']).default('full'),
  steps_json: z.union([z.string(), z.array(z.string())]).default([]),
  default_params_json: z.union([z.string(), z.any()]).default({}),
  env_vars_json: z.union([z.string(), z.any()]).default({}),
});

const createPipelineRunSchema = z.object({
  name: z.string().min(1, 'name is required'),
  dataset_id: z.string().min(1, 'dataset_id is required'),
  pipeline_config_id: z.string().optional(),
  pipeline_type: z.enum(['import', 'clean', 'split', 'augment', 'validate', 'full']).default('full'),
  config_json: z.union([z.string(), z.any()]).default({}),
});

const createSplitSchema = z.object({
  dataset_pipeline_run_id: z.string().min(1, 'dataset_pipeline_run_id is required'),
  dataset_id: z.string().min(1, 'dataset_id is required'),
  split_name: z.string().min(1, 'split_name is required'),
  sample_count: z.number().int().min(0).default(0),
  file_path: z.string().default(''),
  record_count: z.number().int().min(0).default(0),
  checksum: z.string().default(''),
  config_json: z.union([z.string(), z.any()]).default({}),
});

// ── Pipeline step definitions per type ──────────────────────────────────────
const PIPELINE_STEP_DEFS: Record<string, Array<{ key: string; name: string; dur: number }>> = {
  import:  [{ key: 'validate_source', name: 'Validate data source',    dur: 400 }, { key: 'load_data',    name: 'Load data into storage',  dur: 1500 }, { key: 'register',    name: 'Register dataset',         dur: 500  }],
  clean:   [{ key: 'scan',            name: 'Scan for issues',         dur: 800 }, { key: 'dedup',       name: 'Remove duplicates',       dur: 1200 }, { key: 'normalize',   name: 'Normalize formats',        dur: 600  }, { key: 'validate_cleaned', name: 'Validate cleaned data', dur: 400 }],
  split:   [{ key: 'analyze',         name: 'Analyze distribution',    dur: 600 }, { key: 'split_data',  name: 'Split train/val/test',    dur: 1000 }, { key: 'write_manifest',  name: 'Write split manifest',  dur: 400  }],
  full:    [{ key: 'validate',        name: 'Validate source',         dur: 400 }, { key: 'load',        name: 'Load data',               dur: 1200 }, { key: 'clean',       name: 'Clean and transform',     dur: 1500 }, { key: 'split',       name: 'Split datasets',           dur: 800  }, { key: 'finalize',    name: 'Finalize and register',   dur: 500  }],
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ── Pipeline Config CRUD ──────────────────────────────────────────────────────
export function listPipelineConfigs(query: any = {}) {
  const db = getDatabase();
  const { pipeline_type, keyword } = query;
  let sql = 'SELECT * FROM dataset_pipeline_configs WHERE 1=1';
  const params: any[] = [];
  if (pipeline_type) { sql += ' AND pipeline_type = ?'; params.push(pipeline_type); }
  if (keyword) { sql += ' AND (name LIKE ? OR config_code LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
  sql += ' ORDER BY updated_at DESC';
  const rows = (db.prepare(sql) as any).all(...params);
  return {
    ok: true,
    configs: rows.map((r: any) => ({
      ...r,
      steps_json: parseJson(r.steps_json, []),
      default_params_json: parseJson(r.default_params_json, {}),
      env_vars_json: parseJson(r.env_vars_json, {}),
    })),
    total: rows.length,
  };
}

export function getPipelineConfig(id: string) {
  const db = getDatabase();
  const row = (db.prepare('SELECT * FROM dataset_pipeline_configs WHERE id = ?') as any).get(id) as any;
  if (!row) return { ok: false, error: 'Pipeline config not found' };
  return {
    ok: true,
    config: {
      ...row,
      steps_json: parseJson(row.steps_json, []),
      default_params_json: parseJson(row.default_params_json, {}),
      env_vars_json: parseJson(row.env_vars_json, {}),
    },
  };
}

export function createPipelineConfig(body: any) {
  const db = getDatabase();
  const validation = createPipelineConfigSchema.safeParse(body);
  if (!validation.success) return { ok: false, error: validation.error.errors[0].message };
  const d = validation.data;

  const stepsStr = Array.isArray(d.steps_json) ? JSON.stringify(d.steps_json) : d.steps_json;
  const paramsStr = typeof d.default_params_json === 'string' ? d.default_params_json : JSON.stringify(d.default_params_json || {});
  const envStr = typeof d.env_vars_json === 'string' ? d.env_vars_json : JSON.stringify(d.env_vars_json || {});

  const id = generateId();
  const n = now();
  try {
    (db.prepare(`
      INSERT INTO dataset_pipeline_configs (id,config_code,name,description,pipeline_type,steps_json,default_params_json,env_vars_json,is_builtin,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `) as any).run(id, d.config_code, d.name, d.description, d.pipeline_type, stepsStr, paramsStr, envStr, 0, n, n);
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) return { ok: false, error: `Config with code "${d.config_code}" already exists` };
    return { ok: false, error: e.message };
  }
  const row = (db.prepare('SELECT * FROM dataset_pipeline_configs WHERE id = ?') as any).get(id);
  return {
    ok: true,
    config: {
      ...row,
      steps_json: parseJson(row.steps_json, []),
      default_params_json: parseJson(row.default_params_json, {}),
      env_vars_json: parseJson(row.env_vars_json, {}),
    },
  };
}

// ── Pipeline Run: create + auto-start ──────────────────────────────────────
export function createPipelineRun(body: any) {
  const db = getDatabase();
  const validation = createPipelineRunSchema.safeParse(body);
  if (!validation.success) return { ok: false, error: validation.error.errors[0].message };
  const d = validation.data;

  // Verify dataset exists
  const ds = (db.prepare('SELECT id FROM datasets WHERE id = ?') as any).get(d.dataset_id);
  if (!ds) return { ok: false, error: 'Dataset not found' };

  const configStr = typeof d.config_json === 'string' ? d.config_json : JSON.stringify(d.config_json || {});

  const runId = generateId();
  const code = 'DPR-' + runId.slice(0, 8).toUpperCase();
  const pipelineRunId = generateId();
  const n = now();

  // 1. Create the run record (source_type='dataset')
  (db.prepare(`
    INSERT INTO runs (id,run_code,name,source_type,source_id,status,priority,trigger_mode,executor_type,workspace_path,config_json,summary_json,error_message,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `) as any).run(
    runId, code, d.name, 'dataset', d.dataset_id,
    'running', 5, 'manual', 'mock', '', configStr, '{}', '', n, n
  );

  // 2. Create the pipeline run record
  (db.prepare(`
    INSERT INTO dataset_pipeline_runs (id,run_id,dataset_id,pipeline_config_id,pipeline_type,status,config_json,started_at,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `) as any).run(
    pipelineRunId, runId, d.dataset_id, d.pipeline_config_id || '', d.pipeline_type, 'running', configStr, n, n, n
  );

  // 3. Link dataset as input artifact
  const linkId = generateId();
  (db.prepare('INSERT OR IGNORE INTO run_artifacts (id,run_id,artifact_id,relation_type) VALUES (?,?,?,?)') as any)
    .run(linkId, runId, d.dataset_id, 'input');

  // 4. Kick off async mock executor
  void _executePipelineRun(pipelineRunId, runId, d.dataset_id, d.pipeline_type).catch((err: any) => {
    const db2 = getDatabase();
    const nn = now();
    (db2.prepare('UPDATE dataset_pipeline_runs SET status=?, finished_at=?, error_message=?, updated_at=? WHERE id=?') as any)
      .run('failed', nn, err.message, nn, pipelineRunId);
    (db2.prepare('UPDATE runs SET status=?, finished_at=?, error_message=?, updated_at=? WHERE id=?') as any)
      .run('failed', nn, err.message, nn, runId);
  });

  const run = (db.prepare('SELECT * FROM runs WHERE id = ?') as any).get(runId);
  const pipelineRun = (db.prepare('SELECT * FROM dataset_pipeline_runs WHERE id = ?') as any).get(pipelineRunId);
  return { ok: true, run, pipeline_run: pipelineRun };
}

async function _executePipelineRun(pipelineRunId: string, runId: string, datasetId: string, pipelineType: string) {
  const db = getDatabase();
  const defs = PIPELINE_STEP_DEFS[pipelineType] || PIPELINE_STEP_DEFS.full;
  const startTime = now();

  const step0Id = generateId();
  (db.prepare('INSERT INTO run_steps (id,run_id,step_key,step_name,step_order,status,started_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)') as any)
    .run(step0Id, runId, 'pipeline_start', 'Dataset pipeline started', 0, 'running', startTime, now(), now());
  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, step0Id, 'info', `Pipeline type=${pipelineType} on dataset=${datasetId}`, now());

  for (let i = 0; i < defs.length; i++) {
    const def = defs[i];
    const stepId = generateId();
    const stepStart = now();

    (db.prepare('INSERT INTO run_steps (id,run_id,step_key,step_name,step_order,status,started_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)') as any)
      .run(stepId, runId, def.key, def.name, i + 1, 'running', stepStart, now(), now());
    (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
      .run(generateId(), runId, stepId, 'info', `[Step ${i + 1}/${defs.length}] ${def.name} started`, now());

    await delay(def.dur);

    const stepFinish = now();
    const output = JSON.stringify({ duration_ms: def.dur, step: def.key });
    (db.prepare('UPDATE run_steps SET status=?, finished_at=?, duration_ms=?, output_json=?, updated_at=? WHERE id=?') as any)
      .run('success', stepFinish, def.dur, output, now(), stepId);
    (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
      .run(generateId(), runId, stepId, 'info', `[Step ${i + 1}/${defs.length}] ${def.name} completed in ${def.dur}ms`, now());

    // Auto-write split manifest for split/full pipelines
    if ((pipelineType === 'split' || pipelineType === 'full') && def.key === 'split_data') {
      const splits = [
        { name: 'train', pct: 0.8, sample_count: 800,  file_path: `/data/${datasetId}/train.jsonl`, record_count: 800 },
        { name: 'val',   pct: 0.1, sample_count: 100,  file_path: `/data/${datasetId}/val.jsonl`,   record_count: 100 },
        { name: 'test',  pct: 0.1, sample_count: 100,  file_path: `/data/${datasetId}/test.jsonl`,  record_count: 100 },
      ];
      for (const s of splits) {
        const splitId = generateId();
        (db.prepare('INSERT INTO dataset_splits (id,dataset_pipeline_run_id,dataset_id,split_name,sample_count,file_path,record_count,config_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)') as any)
          .run(splitId, pipelineRunId, datasetId, s.name, s.sample_count, s.file_path, s.record_count, JSON.stringify({ pct: s.pct }), now(), now());
      }
      (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
        .run(generateId(), runId, stepId, 'info', `Split manifest written: 3 splits (train/val/test)`, now());
    }
  }

  const finishTime = now();
  const totalDurationMs = defs.reduce((s, d) => s + d.dur, 0);
  const outputSamples = (pipelineType === 'split' || pipelineType === 'full') ? 1000 : 0;

  (db.prepare('UPDATE dataset_pipeline_runs SET status=?, output_sample_count=?, started_at=?, finished_at=?, updated_at=? WHERE id=?') as any)
    .run('success', outputSamples, startTime, finishTime, now(), pipelineRunId);
  (db.prepare('UPDATE runs SET status=?, started_at=?, finished_at=?, summary_json=?, updated_at=? WHERE id=?') as any)
    .run('success', startTime, finishTime, JSON.stringify({ total_steps: defs.length, total_duration_ms: totalDurationMs, output_samples: outputSamples }), now(), runId);
  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, '', 'info', `Pipeline completed: ${defs.length} steps, ${totalDurationMs}ms total`, now());
}

// ── Pipeline Run CRUD ──────────────────────────────────────────────────────────
export function listPipelineRuns(query: any = {}) {
  const db = getDatabase();
  const { dataset_id, status, pipeline_type, limit = 100 } = query;
  let sql = `SELECT dpr.*, r.run_code, r.name as run_name, r.status as run_status, r.created_at as run_created
             FROM dataset_pipeline_runs dpr JOIN runs r ON r.id = dpr.run_id WHERE 1=1`;
  const params: any[] = [];
  if (dataset_id)    { sql += ' AND dpr.dataset_id = ?';           params.push(dataset_id); }
  if (status)        { sql += ' AND dpr.status = ?';               params.push(status); }
  if (pipeline_type) { sql += ' AND dpr.pipeline_type = ?';        params.push(pipeline_type); }
  sql += ' ORDER BY dpr.created_at DESC LIMIT ?';
  params.push(Number(limit));
  const rows = (db.prepare(sql) as any).all(...params);
  return { ok: true, pipeline_runs: rows, total: rows.length };
}

export function getPipelineRun(id: string) {
  const db = getDatabase();
  const row = (db.prepare('SELECT * FROM dataset_pipeline_runs WHERE id = ?') as any).get(id) as any;
  if (!row) return { ok: false, error: 'Pipeline run not found' };
  const run = (db.prepare('SELECT * FROM runs WHERE id = ?') as any).get(row.run_id);
  const splits = (db.prepare('SELECT * FROM dataset_splits WHERE dataset_pipeline_run_id = ? ORDER BY split_name') as any).all(id);
  return {
    ok: true,
    pipeline_run: { ...row, config_json: parseJson(row.config_json, {}) },
    run,
    splits,
  };
}

export function getPipelineRunByRunId(runId: string) {
  const db = getDatabase();
  const row = (db.prepare('SELECT * FROM dataset_pipeline_runs WHERE run_id = ?') as any).get(runId) as any;
  if (!row) return { ok: false, error: 'Pipeline run not found' };
  return getPipelineRun(row.id);
}

// ── Splits ──────────────────────────────────────────────────────────────────
export function createSplit(body: any) {
  const db = getDatabase();
  const validation = createSplitSchema.safeParse(body);
  if (!validation.success) return { ok: false, error: validation.error.errors[0].message };
  const d = validation.data;

  const pr = (db.prepare('SELECT id FROM dataset_pipeline_runs WHERE id = ?') as any).get(d.dataset_pipeline_run_id);
  if (!pr) return { ok: false, error: 'Pipeline run not found' };

  const configStr = typeof d.config_json === 'string' ? d.config_json : JSON.stringify(d.config_json || {});
  const id = generateId();
  const n = now();
  (db.prepare('INSERT INTO dataset_splits (id,dataset_pipeline_run_id,dataset_id,split_name,sample_count,file_path,record_count,checksum,config_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)') as any)
    .run(id, d.dataset_pipeline_run_id, d.dataset_id, d.split_name, d.sample_count, d.file_path, d.record_count, d.checksum, configStr, n, n);

  const total = (db.prepare('SELECT SUM(sample_count) as total FROM dataset_splits WHERE dataset_pipeline_run_id = ?') as any).get(d.dataset_pipeline_run_id) as any;
  (db.prepare('UPDATE dataset_pipeline_runs SET output_sample_count=?, updated_at=? WHERE id=?') as any)
    .run(total?.total || d.sample_count, n, d.dataset_pipeline_run_id);

  const row = (db.prepare('SELECT * FROM dataset_splits WHERE id = ?') as any).get(id);
  return { ok: true, split: row };
}

export function listSplits(query: any = {}) {
  const db = getDatabase();
  const { dataset_id, dataset_pipeline_run_id } = query;
  let sql = 'SELECT * FROM dataset_splits WHERE 1=1';
  const params: any[] = [];
  if (dataset_pipeline_run_id) { sql += ' AND dataset_pipeline_run_id = ?'; params.push(dataset_pipeline_run_id); }
  if (dataset_id)             { sql += ' AND dataset_id = ?';              params.push(dataset_id); }
  sql += ' ORDER BY split_name';
  const rows = (db.prepare(sql) as any).all(...params);
  return { ok: true, splits: rows, total: rows.length };
}

// ── Link dataset to run via run_artifacts (relation_type='input') ─────────────
export function linkDatasetToRun(datasetId: string, runId: string, relationType = 'input') {
  const db = getDatabase();
  if (!(db.prepare('SELECT id FROM runs WHERE id = ?').get(runId))) return { ok: false, error: 'Run not found' };
  if (!(db.prepare('SELECT id FROM datasets WHERE id = ?').get(datasetId))) return { ok: false, error: 'Dataset not found' };
  const id = generateId();
  (db.prepare('INSERT OR IGNORE INTO run_artifacts (id,run_id,artifact_id,relation_type) VALUES (?,?,?,?)') as any)
    .run(id, runId, datasetId, relationType);
  return { ok: true, id, run_id: runId, artifact_id: datasetId, relation_type: relationType };
}

// ── Summary ──────────────────────────────────────────────────────────────────
export function getPipelineSummary() {
  const db = getDatabase();
  const all = (db.prepare('SELECT status, COUNT(*) as count FROM dataset_pipeline_runs GROUP BY status') as any).all() as any[];
  const total = (db.prepare('SELECT COUNT(*) as total FROM dataset_pipeline_runs') as any).get().total;
  const statusMap: Record<string, number> = { queued: 0, running: 0, success: 0, failed: 0 };
  for (const r of all) { statusMap[r.status] = r.count; }
  return { ok: true, total, ...statusMap };
}
