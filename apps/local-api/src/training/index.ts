/**
 * Training Runtime Module
 * 最小训练闭环：training config → training run → checkpoint records → training artifact
 * 所有执行动作统一挂 runs 体系，不分叉。
 */
import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';
import fs from 'node:fs';
import path from 'node:path';

function generateId() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function parseJson(val: string | undefined | null, fallback: any = null) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}
function firstValidationError(validation: any) {
  return validation?.error?.issues?.[0]?.message
    || validation?.error?.errors?.[0]?.message
    || 'Invalid request body';
}

function resolveRepoRoot(): string {
  const candidates = [
    process.env.AIP_REPO_ROOT,
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    path.resolve(process.cwd(), '../..'),
    path.resolve(process.cwd(), '../../..'),
    path.resolve(__dirname, '../../..'),
    path.resolve(__dirname, '../../../..'),
  ].filter(Boolean) as string[];
  for (const candidate of candidates) {
    if (
      fs.existsSync(path.join(candidate, 'package.json')) &&
      fs.existsSync(path.join(candidate, 'workers', 'python-worker'))
    ) {
      return candidate;
    }
  }
  return path.resolve(process.cwd(), '../..');
}

function resolvePythonWorker(scriptName: string): string {
  return path.join(resolveRepoRoot(), 'workers', 'python-worker', scriptName);
}

// ── Schemas ──────────────────────────────────────────────────────────────────
const createTrainingConfigSchema = z.object({
  config_code: z.string().min(1, 'config_code is required'),
  name: z.string().min(1, 'name is required'),
  description: z.string().default(''),
  model_name: z.string().default(''),
  dataset_id: z.string().default(''),
  config_json: z.union([z.string(), z.any()]).default({}),
  params_json: z.union([z.string(), z.any()]).default({}),
  resource_json: z.union([z.string(), z.any()]).default({}),
});

const createTrainingRunSchema = z.object({
  name: z.string().min(1, 'name is required'),
  training_config_id: z.string().optional(),
  dataset_id: z.string().optional(),
  dataset_version_id: z.string().optional(),
  execution_mode: z.enum(['standard', 'yolo']).default('standard'),
  model_name: z.string().default(''),
  config_json: z.union([z.string(), z.any()]).default({}),
});

const createCheckpointSchema = z.object({
  run_id: z.string().min(1, 'run_id is required'),
  step: z.number().int().min(0).default(0),
  epoch: z.number().int().min(0).default(0),
  checkpoint_path: z.string().default(''),
  metrics_json: z.union([z.string(), z.any()]).default({}),
  is_best: z.boolean().default(false),
  is_latest: z.boolean().default(true),
  file_size_bytes: z.number().int().min(0).optional(),
  notes: z.string().default(''),
});

// ── Training Config CRUD ──────────────────────────────────────────────────────
export function listTrainingConfigs(query: any = {}) {
  const db = getDatabase();
  const { keyword, model_name } = query;
  let sql = 'SELECT * FROM training_configs WHERE 1=1';
  const params: any[] = [];
  if (keyword) { sql += ' AND (name LIKE ? OR config_code LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
  if (model_name) { sql += ' AND model_name = ?'; params.push(model_name); }
  sql += ' ORDER BY updated_at DESC';
  const rows = (db.prepare(sql) as any).all(...params);
  return {
    ok: true,
    configs: rows.map((r: any) => ({
      ...r,
      config_json: parseJson(r.config_json, {}),
      params_json: parseJson(r.params_json, {}),
      resource_json: parseJson(r.resource_json, {}),
    })),
    total: rows.length,
  };
}

export function getTrainingConfig(id: string) {
  const db = getDatabase();
  const row = (db.prepare('SELECT * FROM training_configs WHERE id = ?') as any).get(id) as any;
  if (!row) return { ok: false, error: 'Training config not found' };
  return {
    ok: true,
    config: {
      ...row,
      config_json: parseJson(row.config_json, {}),
      params_json: parseJson(row.params_json, {}),
      resource_json: parseJson(row.resource_json, {}),
    },
  };
}

export function createTrainingConfig(body: any) {
  const db = getDatabase();
  const validation = createTrainingConfigSchema.safeParse(body);
  if (!validation.success) return { ok: false, error: firstValidationError(validation) };
  const d = validation.data;

  const configStr = typeof d.config_json === 'string' ? d.config_json : JSON.stringify(d.config_json || {});
  const paramsStr = typeof d.params_json === 'string' ? d.params_json : JSON.stringify(d.params_json || {});
  const resourceStr = typeof d.resource_json === 'string' ? d.resource_json : JSON.stringify(d.resource_json || {});

  const id = generateId();
  const n = now();
  try {
    (db.prepare(`
      INSERT INTO training_configs (id,config_code,name,description,model_name,dataset_id,config_json,params_json,resource_json,is_builtin,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `) as any).run(id, d.config_code, d.name, d.description, d.model_name, d.dataset_id, configStr, paramsStr, resourceStr, 0, n, n);
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) return { ok: false, error: `Config "${d.config_code}" already exists` };
    return { ok: false, error: e.message };
  }
  const row = (db.prepare('SELECT * FROM training_configs WHERE id = ?') as any).get(id);
  return {
    ok: true,
    config: {
      ...row,
      config_json: parseJson(row.config_json, {}),
      params_json: parseJson(row.params_json, {}),
      resource_json: parseJson(row.resource_json, {}),
    },
  };
}

// ── Training Run: create + auto-start ──────────────────────────────────────
export function createTrainingRun(body: any) {
  const db = getDatabase();
  const validation = createTrainingRunSchema.safeParse(body);
  if (!validation.success) return { ok: false, error: firstValidationError(validation) };
  const d = validation.data;

  const configStr = typeof d.config_json === 'string' ? d.config_json : JSON.stringify(d.config_json || {});
  const summaryStr = JSON.stringify({
    model_name: d.model_name || '',
    dataset_id: d.dataset_id || '',
    training_config_id: d.training_config_id || '',
    epochs: parseJson(configStr)?.epochs || 3,
  });

  const runId = generateId();
  const code = 'TRN-' + runId.slice(0, 8).toUpperCase();
  const trainingRunId = generateId();
  const n = now();

  // Validate dataset_version if provided
  if (d.dataset_version_id) {
    const dvRow = (db.prepare('SELECT * FROM dataset_versions WHERE id = ?') as any).get(d.dataset_version_id);
    if (!dvRow) {
      return { ok: false, error: `Dataset version not found: ${d.dataset_version_id}` };
    }
    if (dvRow.status !== 'approved') {
      return { ok: false, error: `Dataset version not approved: ${dvRow.status}` };
    }
  }

  // Build yolo_config if execution_mode is yolo
  const yoloConfig = d.execution_mode === 'yolo' ? {
    model_type: parseJson(configStr)?.model_type || 'yolov8n',
    epochs: parseJson(configStr)?.epochs || 100,
    batch_size: parseJson(configStr)?.batch_size || 16,
    imgsz: parseJson(configStr)?.imgsz || 640,
    lr0: parseJson(configStr)?.lr0 || 0.01,
    lrf: parseJson(configStr)?.lrf || 0.01,
    momentum: parseJson(configStr)?.momentum || 0.937,
    weight_decay: parseJson(configStr)?.weight_decay || 0.0005,
  } : {};

  // 1. Create run (source_type='training')
  (db.prepare(`
    INSERT INTO runs (id,run_code,name,source_type,source_id,status,priority,trigger_mode,executor_type,workspace_path,config_json,summary_json,error_message,dataset_version_id,execution_mode,yolo_config_json,env_snapshot_json,exit_code,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `) as any).run(
    runId, code, d.name, 'training', d.training_config_id || '',
    'running', 8, 'manual', d.execution_mode === 'yolo' ? 'yolo' : 'mock', '', configStr, summaryStr, '',
    d.dataset_version_id || '', d.execution_mode, JSON.stringify(yoloConfig), '{}', 0, n, n
  );

  // 2. Create training_checkpoints entry (epoch 0, step 0 = start marker)
  const startCkptId = generateId();
  (db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)') as any)
    .run(startCkptId, runId, 0, 0, '', '{}', 0, 0, 0, 'Training started', n, n);

  // 3. Kick off async executor with execution mode
  void _executeTrainingRun(runId, trainingRunId, configStr, d.model_name, d.execution_mode, d.dataset_version_id).catch((err: any) => {
    console.error("[TRAINING ERROR]", err);
    const db2 = getDatabase();
    const nn = now();
    (db2.prepare('UPDATE runs SET status=?, finished_at=?, error_message=?, exit_code=?, updated_at=? WHERE id=?') as any)
      .run('failed', nn, err.message, 1, nn, runId);
  });

  const run = (db.prepare('SELECT * FROM runs WHERE id = ?') as any).get(runId);
  return { ok: true, run, training_run_id: trainingRunId };
}

async function _executeTrainingRun(runId: string, trainingRunId: string, configStr: string, modelName: string, executionMode?: string, datasetVersionId?: string) {
  const db = getDatabase();
  const run = (db.prepare('SELECT * FROM runs WHERE id = ?') as any).get(runId);
  const mode = executionMode || run?.execution_mode || 'standard';
  
  // Capture environment snapshot
  const envSnapshot = {
    python_version: process.version,
    platform: process.platform,
    timestamp: now(),
  };
  (db.prepare('UPDATE runs SET env_snapshot_json = ? WHERE id = ?') as any).run(JSON.stringify(envSnapshot), runId);

  if (mode === 'yolo') {
    return _executeYoloTraining(runId, configStr, modelName, datasetVersionId);
  } else {
    return _executeMockTraining(runId, configStr, modelName);
  }
}

async function _executeYoloTraining(runId: string, configStr: string, modelName: string, datasetVersionId?: string) {
  const db = getDatabase();
  const config = parseJson(configStr, {}) as any;
  const epochs = config.epochs || 20;  // Reduced for B1 testing
  const batchSize = config.batch_size || 16;
  const imgsz = config.imgsz || 640;
  
  // Get dataset_version info
  let datasetVersion: any = null;
  if (datasetVersionId) {
    datasetVersion = (db.prepare('SELECT * FROM dataset_versions WHERE id = ?') as any).get(datasetVersionId);
  }
  
  // Check if dataset_version has YOLO format data
  const sourceChain = parseJson(datasetVersion?.source_chain_json, {});
  const storagePath = datasetVersion?.storage_path || sourceChain?.storage_path;
  
  if (!storagePath || !datasetVersion) {
    // Fall back to mock if no real dataset
    (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
      .run(generateId(), runId, '', 'warn', `[YOLO] No real dataset found, falling back to mock training`, now());
    return _executeMockYoloTraining(runId, configStr, modelName, datasetVersionId);
  }
  
  // Prepare dataset.yaml path
  const datasetYamlPath = `${storagePath}/data.yaml`;
  
  // Initial log
  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, '', 'info', `[YOLO] Starting REAL training: model=${modelName || 'yolov8n'}, epochs=${epochs}, dataset_version=${datasetVersion?.version || 'unknown'}`, now());
  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, '', 'info', `[YOLO] Dataset: ${datasetYamlPath}`, now());

  // Prepare output directory
  const projectDir = path.join(resolveRepoRoot(), 'runs', 'train');
  const runName = runId;
  
  // Build trainer_runner.py command
  const runnerPath = resolvePythonWorker('trainer_runner.py');
  const cmd = [
    'python', runnerPath,
    '--dataset-yaml', datasetYamlPath,
    '--model', modelName || 'yolov8n',
    '--epochs', String(epochs),
    '--imgsz', String(imgsz),
    '--batch', String(batchSize),
    '--project', projectDir,
    '--name', runName,
    '--device', 'cpu',  // Use CPU for B1 testing (change to '0' for GPU)
  ];
  
  // Update run status to running
  (db.prepare('UPDATE runs SET status=?, started_at=?, updated_at=? WHERE id=?') as any)
    .run('running', now(), now(), runId);
  
  // Execute training via subprocess
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);
  
  try {
    (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
      .run(generateId(), runId, '', 'info', `[YOLO] Executing: ${cmd.join(' ')}`, now());
    
    const { stdout, stderr } = await execFileAsync('python', cmd.slice(1), {
      timeout: epochs * 300 * 1000,  // epochs * 5 minutes per epoch
      maxBuffer: 10 * 1024 * 1024,  // 10MB buffer
    });
    
    // Parse output
    const output = stdout || stderr || '{}';
    let result: any = {};
    try {
      // Try to find JSON output in the last line
      const lines = output.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      result = JSON.parse(lastLine);
    } catch {
      result = { ok: true, stdout: output };
    }
    
    // Check for outputs
    const runDir = `${projectDir}/${runName}`;
    const bestPtPath = `${runDir}/weights/best.pt`;
    const resultsCsvPath = `${runDir}/results.csv`;
    
    // Parse final metrics
    let finalMetrics: any = {};
    if (result.final_metrics) {
      finalMetrics = result.final_metrics;
    }
    
    const bestMap50 = finalMetrics.mAP50 || 0;
    
    // Log completion
    (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
      .run(generateId(), runId, '', 'info', `[YOLO] Training completed: best_mAP50=${bestMap50.toFixed(4)}`, now());
    
    // Create checkpoint record
    const ckptId = generateId();
    (db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)') as any)
      .run(ckptId, runId, epochs, epochs, bestPtPath, JSON.stringify(finalMetrics), 1, 1, 0, 'Best checkpoint from real training', now(), now());
    
    // Create artifact
    const artifactId = generateId();
    const artifactName = `yolo_${modelName || 'yolov8n'}_${datasetVersion?.version || 'unknown'}_${new Date().toISOString().slice(0, 10)}`;
    const artifactMetrics = JSON.stringify({
      best_mAP50: bestMap50,
      total_epochs: epochs,
      model_type: modelName || 'yolov8n',
      dataset_version_id: datasetVersionId || '',
      execution_mode: 'real_yolo',
    });
    
    (db.prepare(`
      INSERT INTO artifacts (id,name,artifact_type,status,source_type,training_job_id,dataset_id,model_family,format,version,path,file_size_bytes,metrics_snapshot_json,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `) as any).run(artifactId, artifactName, 'model', 'ready', 'training', runId, datasetVersion?.dataset_id || '', modelName || 'yolov8n', 'pytorch', 'v1', bestPtPath, 0, artifactMetrics, now(), now());
    
    // Link artifact to run
    const linkId = generateId();
    (db.prepare('INSERT OR IGNORE INTO run_artifacts (id,run_id,artifact_id,relation_type) VALUES (?,?,?,?)') as any)
      .run(linkId, runId, artifactId, 'output');
    
    // Update run status
    (db.prepare('UPDATE runs SET status=?, finished_at=?, exit_code=?, summary_json=?, updated_at=? WHERE id=?') as any)
      .run('success', now(), 0, JSON.stringify({ best_mAP50: bestMap50, total_epochs: epochs, artifact_id: artifactId, artifact_name: artifactName, dataset_version_id: datasetVersionId, execution_mode: 'real_yolo' }), now(), runId);
    
    return { exit_code: 0, artifact_id: artifactId };
    
  } catch (error: any) {
    // Log error
    (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
      .run(generateId(), runId, '', 'error', `[YOLO] Training failed: ${error.message}`, now());
    
    // Update run status
    (db.prepare('UPDATE runs SET status=?, finished_at=?, exit_code=?, error_message=?, updated_at=? WHERE id=?') as any)
      .run('failed', now(), 1, error.message, now(), runId);
    
    return { exit_code: 1, error: error.message };
  }
}

// Mock YOLO training fallback
async function _executeMockYoloTraining(runId: string, configStr: string, modelName: string, datasetVersionId?: string) {
  const db = getDatabase();
  const config = parseJson(configStr, {}) as any;
  const epochs = config.epochs || 20;
  const batchSize = config.batch_size || 16;
  const imgsz = config.imgsz || 640;
  
  // Get dataset_version info
  let datasetVersion: any = null;
  if (datasetVersionId) {
    datasetVersion = (db.prepare('SELECT * FROM dataset_versions WHERE id = ?') as any).get(datasetVersionId);
  }
  
  // Initial log
  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, '', 'info', `[YOLO-MOCK] Training started: model=${modelName || 'yolov8n'}, epochs=${epochs}, imgsz=${imgsz}, dataset_version=${datasetVersion?.version || 'unknown'}`, now());

  // Simulate YOLO training
  let bestMap50 = 0.0;
  let bestCkptId = '';
  
  for (let epoch = 1; epoch <= epochs; epoch++) {
    // Simulate epoch training
    const progress = (epoch / epochs * 100).toFixed(1);
    const boxLoss = Math.max(0.1, 2.0 * Math.exp(-epoch / 30) + (Math.random() * 0.1));
    const clsLoss = Math.max(0.05, 1.5 * Math.exp(-epoch / 25) + (Math.random() * 0.05));
    const dflLoss = Math.max(0.02, 0.8 * Math.exp(-epoch / 20) + (Math.random() * 0.02));
    const map50 = Math.min(0.99, 0.5 + (epoch / epochs) * 0.4 + (Math.random() * 0.05));
    const map50_95 = map50 * 0.85;
    
    const metrics = JSON.stringify({
      box_loss: parseFloat(boxLoss.toFixed(4)),
      cls_loss: parseFloat(clsLoss.toFixed(4)),
      dfl_loss: parseFloat(dflLoss.toFixed(4)),
      mAP50: parseFloat(map50.toFixed(4)),
      mAP50_95: parseFloat(map50_95.toFixed(4)),
      epoch,
    });
    
    // Log every 10 epochs
    if (epoch % 10 === 0 || epoch === 1 || epoch === epochs) {
      (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
        .run(generateId(), runId, '', 'info', `[YOLO-MOCK] Epoch ${epoch}/${epochs} [${progress}%] box_loss=${boxLoss.toFixed(4)} cls_loss=${clsLoss.toFixed(4)} mAP50=${map50.toFixed(4)} mAP50-95=${map50_95.toFixed(4)}`, now());
    }
    
    // Create checkpoint every 10 epochs
    if (epoch % 10 === 0 || epoch === epochs) {
      const ckptId = generateId();
      const ckptPath = `/runs/train/${runId}/weights/epoch_${epoch}.pt`;
      const isBest = map50 > bestMap50;
      if (isBest) { bestMap50 = map50; bestCkptId = ckptId; }
      
      (db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)') as any)
        .run(ckptId, runId, epoch, epoch, ckptPath, metrics, isBest ? 1 : 0, 0, Math.floor(Math.random() * 50000000) + 50000000, `Epoch ${epoch} checkpoint`, now(), now());
      
      if (isBest) {
        (db.prepare('UPDATE training_checkpoints SET is_best=0, updated_at=? WHERE run_id=? AND id!=?') as any).run(now(), runId, ckptId);
      }
    }
    
    // Simulate epoch time
    await new Promise(res => setTimeout(res, 100));
  }
  
  // Finalize
  const finishTime = now();
  
  // Mark best checkpoint
  if (bestCkptId) {
    (db.prepare('UPDATE training_checkpoints SET is_best=1, is_latest=1, notes=?, updated_at=? WHERE id=?') as any)
      .run('Final best checkpoint', now(), bestCkptId);
  }
  
  // Create artifact
  const artifactId = generateId();
  const artifactName = `yolo_${modelName || 'yolov8n'}_${datasetVersion?.version || 'unknown'}_${new Date().toISOString().slice(0, 10)}`;
  const artifactPath = `/runs/train/${runId}/weights/best.pt`;
  const finalMetrics = JSON.stringify({
    best_mAP50: parseFloat(bestMap50.toFixed(4)),
    total_epochs: epochs,
    model_type: modelName || 'yolov8n',
    dataset_version_id: datasetVersionId || '',
    execution_mode: 'mock_yolo',
  });
  
  (db.prepare(`
    INSERT INTO artifacts (id,name,artifact_type,status,source_type,training_job_id,dataset_id,model_family,format,version,path,file_size_bytes,metrics_snapshot_json,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `) as any).run(artifactId, artifactName, 'model', 'ready', 'training', runId, datasetVersion?.dataset_id || '', modelName || 'yolov8n', 'pytorch', 'v1', artifactPath, Math.floor(Math.random() * 100000000) + 100000000, finalMetrics, finishTime, finishTime);
  
  // Link artifact to run
  const linkId = generateId();
  (db.prepare('INSERT OR IGNORE INTO run_artifacts (id,run_id,artifact_id,relation_type) VALUES (?,?,?,?)') as any)
    .run(linkId, runId, artifactId, 'output');
  
  // Final log
  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, '', 'info', `[YOLO-MOCK] Training completed: best_mAP50=${bestMap50.toFixed(4)} artifact=${artifactName}`, finishTime);
  
  // Update run status
  (db.prepare('UPDATE runs SET status=?, finished_at=?, exit_code=?, summary_json=?, updated_at=? WHERE id=?') as any)
    .run('success', finishTime, 0, JSON.stringify({ best_mAP50: bestMap50, total_epochs: epochs, artifact_id: artifactId, artifact_name: artifactName, dataset_version_id: datasetVersionId, execution_mode: 'mock_yolo' }), now(), runId);
  
  return { exit_code: 0, artifact_id: artifactId };
}

async function _executeMockTraining(runId: string, configStr: string, modelName: string) {
  const db = getDatabase();
  const config = parseJson(configStr, {}) as any;
  const epochs = config.epochs || 3;
  const stepsPerEpoch = config.steps_per_epoch || 10;
  const delayPerStep = config.delay_per_step || 400;

  const startTime = now();

  // Initial log
  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, '', 'info', `Training started: model=${modelName || 'unnamed'}, epochs=${epochs}`, now());

  let bestLoss = 999.0;  // start very high so first checkpoint becomes best
  let bestCkptId = '';
  const totalSteps = epochs * stepsPerEpoch;

  for (let epoch = 1; epoch <= epochs; epoch++) {
    for (let step = 1; step <= stepsPerEpoch; step++) {
      const stepIdx = (epoch - 1) * stepsPerEpoch + step;
      const progress = (stepIdx / totalSteps * 100).toFixed(1);

      // Simulate training metrics
      const loss = Math.max(0.01, 2.0 * Math.exp(-stepIdx / 30) + (Math.random() * 0.05));
      const acc = Math.min(0.99, 1 - loss + (Math.random() * 0.02));
      const lr = config.learning_rate ? parseFloat(config.learning_rate) * Math.pow(0.98, epoch - 1) : 0.001 * Math.pow(0.98, epoch - 1);

      const metrics = JSON.stringify({ loss: parseFloat(loss.toFixed(4)), accuracy: parseFloat(acc.toFixed(4)), learning_rate: parseFloat(lr.toFixed(6)), epoch, step: stepIdx });

      // Log every 5 steps
      if (step % 5 === 0) {
        (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
          .run(generateId(), runId, '', 'info', `Epoch ${epoch}/${epochs} Step ${step} [${progress}%] loss=${loss.toFixed(4)} acc=${acc.toFixed(4)} lr=${lr.toFixed(6)}`, now());
      }

      // Create checkpoint every 2 epochs (stepsPerEpoch * 2)
      if (step === stepsPerEpoch) {
        await new Promise(res => setTimeout(res, delayPerStep));
        const ckptId = generateId();
        const ckptPath = `/checkpoints/${runId}/epoch_${epoch}.pt`;
        const isBest = loss < bestLoss;
        if (isBest) { bestLoss = loss; bestCkptId = ckptId; }

        (db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)') as any)
          .run(ckptId, runId, stepIdx, epoch, ckptPath, metrics, isBest ? 1 : 0, 0, Math.floor(Math.random() * 50000000) + 10000000, `Epoch ${epoch} checkpoint`, now(), now());
        (db.prepare('UPDATE training_checkpoints SET is_latest=0, updated_at=? WHERE run_id=? AND epoch>=?') as any).run(now(), runId, epoch);

        (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
          .run(generateId(), runId, '', 'info', `Checkpoint saved: epoch=${epoch} path=${ckptPath} loss=${loss.toFixed(4)}${isBest ? ' [BEST]' : ''}`, now());
      } else {
        await new Promise(res => setTimeout(res, delayPerStep));
      }
    }
  }

  // Finalize
  const finishTime = now();
  const totalDurationMs = epochs * stepsPerEpoch * delayPerStep;

  // Update best checkpoint
  if (bestCkptId) {
    // Clear best flag from all checkpoints of this run, then mark the best one
    (db.prepare('UPDATE training_checkpoints SET is_best=0, updated_at=? WHERE run_id=?') as any).run(now(), runId);
    (db.prepare('UPDATE training_checkpoints SET is_best=1, is_latest=1, notes=?, updated_at=? WHERE id=?') as any)
      .run('Final best checkpoint', now(), bestCkptId);
  }

  // Write training artifact
  const artifactId = generateId();
  const artifactName = `trained_${modelName || 'model'}_${new Date().toISOString().slice(0, 10)}`;
  const artifactPath = `/models/${runId}/final.pt`;
  const finalMetrics = JSON.stringify({ final_loss: parseFloat(bestLoss.toFixed(4)), final_accuracy: parseFloat((1 - bestLoss).toFixed(4)), total_epochs: epochs, total_steps: totalSteps });

  (db.prepare(`
    INSERT INTO artifacts (id,name,artifact_type,status,source_type,training_job_id,model_family,format,version,path,file_size_bytes,metrics_snapshot_json,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `) as any).run(artifactId, artifactName, 'model', 'ready', 'training', runId, modelName || '', 'pytorch', 'v1', artifactPath, Math.floor(Math.random() * 100000000) + 50000000, finalMetrics, finishTime, finishTime);

  // Link artifact to run
  const linkId = generateId();
  (db.prepare('INSERT OR IGNORE INTO run_artifacts (id,run_id,artifact_id,relation_type) VALUES (?,?,?,?)') as any)
    .run(linkId, runId, artifactId, 'output');

  (db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)') as any)
    .run(generateId(), runId, '', 'info', `Training completed: final_loss=${bestLoss.toFixed(4)} artifact=${artifactName}`, finishTime);

  (db.prepare('UPDATE runs SET status=?, finished_at=?, summary_json=?, updated_at=? WHERE id=?') as any)
    .run('success', finishTime, JSON.stringify({ best_loss: bestLoss, total_epochs: epochs, total_steps: totalSteps, artifact_id: artifactId, artifact_name: artifactName }), now(), runId);
}

// ── Checkpoint CRUD ─────────────────────────────────────────────────────────
export function listCheckpoints(query: any = {}) {
  const db = getDatabase();
  const { run_id, is_best } = query;
  let sql = 'SELECT * FROM training_checkpoints WHERE 1=1';
  const params: any[] = [];
  if (run_id) { sql += ' AND run_id = ?'; params.push(run_id); }
  if (is_best !== undefined) { sql += ' AND is_best = ?'; params.push(is_best ? 1 : 0); }
  sql += ' ORDER BY epoch DESC, step DESC';
  const rows = (db.prepare(sql) as any).all(...params);
  return {
    ok: true,
    checkpoints: rows.map((r: any) => ({ ...r, metrics_json: parseJson(r.metrics_json, {}), is_best: !!r.is_best, is_latest: !!r.is_latest })),
    total: rows.length,
  };
}

export function getCheckpoint(id: string) {
  const db = getDatabase();
  const row = (db.prepare('SELECT * FROM training_checkpoints WHERE id = ?') as any).get(id) as any;
  if (!row) return { ok: false, error: 'Checkpoint not found' };
  return {
    ok: true,
    checkpoint: { ...row, metrics_json: parseJson(row.metrics_json, {}), is_best: !!row.is_best, is_latest: !!row.is_latest },
  };
}

export function createCheckpoint(body: any) {
  const db = getDatabase();
  const validation = createCheckpointSchema.safeParse(body);
  if (!validation.success) return { ok: false, error: firstValidationError(validation) };
  const d = validation.data;

  const run = (db.prepare('SELECT id FROM runs WHERE id = ?') as any).get(d.run_id);
  if (!run) return { ok: false, error: 'Run not found' };

  const metricsStr = typeof d.metrics_json === 'string' ? d.metrics_json : JSON.stringify(d.metrics_json || {});
  const id = generateId();
  const n = now();
  (db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)') as any)
    .run(id, d.run_id, d.step, d.epoch, d.checkpoint_path, metricsStr, d.is_best ? 1 : 0, d.is_latest ? 1 : 0, d.file_size_bytes || 0, d.notes, n, n);

  const row = (db.prepare('SELECT * FROM training_checkpoints WHERE id = ?') as any).get(id);
  return { ok: true, checkpoint: { ...row, metrics_json: parseJson(row.metrics_json, {}), is_best: !!row.is_best, is_latest: !!row.is_latest } };
}

// ── Training Runs: list via runs table ─────────────────────────────────────
export function listTrainingRuns(query: any = {}) {
  const db = getDatabase();
  const { dataset_id, status, limit = 100 } = query;
  let sql = `SELECT r.*, tc.name as config_name, tc.config_code as config_code
             FROM runs r
             LEFT JOIN training_configs tc ON r.source_id = tc.id
             WHERE r.source_type = 'training'`;
  const params: any[] = [];
  if (dataset_id) { sql += ' AND r.config_json LIKE ?'; params.push(`%"dataset_id":"${dataset_id}"%`); }
  if (status) { sql += ' AND r.status = ?'; params.push(status); }
  sql += ' ORDER BY r.created_at DESC LIMIT ?';
  params.push(Number(limit));
  const rows = (db.prepare(sql) as any).all(...params);
  const total = (db.prepare('SELECT COUNT(*) as c FROM runs WHERE source_type=?') as any).get('training').c;
  return { ok: true, runs: rows, total };
}

export function getTrainingRun(id: string) {
  const db = getDatabase();
  const run = (db.prepare('SELECT * FROM runs WHERE id = ? AND source_type = ?') as any).get(id, 'training') as any;
  if (!run) return { ok: false, error: 'Training run not found' };

  const checkpoints = (db.prepare('SELECT * FROM training_checkpoints WHERE run_id = ? ORDER BY epoch DESC') as any).all(id);
  const artifacts = (db.prepare('SELECT ra.*, a.name, a.artifact_type, a.format, a.path as artifact_path FROM run_artifacts ra JOIN artifacts a ON a.id = ra.artifact_id WHERE ra.run_id = ?') as any).all(id);

  return {
    ok: true,
    run,
    checkpoints: checkpoints.map((r: any) => ({ ...r, metrics_json: parseJson(r.metrics_json, {}), is_best: !!r.is_best, is_latest: !!r.is_latest })),
    artifacts,
  };
}

// ── F6: Built-in Training Presets ──────────────────────────────────────────

export function seedBuiltinTrainingPresets(): number {
  const db = getDatabase();
  const n = now();

  // Three-layer preset model:
  //   config_json  → training hyperparameters (epochs, learning_rate, optimizer, ...)
  //   params_json  → model/task parameters (model, imgsz, batch, task_type, ...)
  //   resource_json → device/resource parameters (device, workers, ...)
  const seeds = [
    {
      config_code: 'yolo-detect-fast',
      name: 'YOLO Detect Fast',
      description: 'Quick iteration preset: 1 epoch, small image, large batch. Good for sanity checks.',
      model_name: 'yolov8n',
      config_json: { epochs: 1, learning_rate: 0.01, optimizer: 'SGD', momentum: 0.937, weight_decay: 0.0005, lr_scheduler: 'cosine', warmup_epochs: 0, warmup_momentum: 0.8, warmup_bias_lr: 0.1 },
      params_json: { task_type: 'vision_detect', model_family: 'yolo', model: 'yolov8n.pt', imgsz: 320, batch: 32, patience: 10, save_period: -1, cache: false, single_cls: false },
      resource_json: { device: 'auto', workers: 8, amp: true, verbose: false },
      is_builtin: 1,
    },
    {
      config_code: 'yolo-detect-standard',
      name: 'YOLO Detect Standard',
      description: 'Balanced preset: 30 epochs, 640px, batch 16. Default for production training.',
      model_name: 'yolov8n',
      config_json: { epochs: 30, learning_rate: 0.01, optimizer: 'SGD', momentum: 0.937, weight_decay: 0.0005, lr_scheduler: 'cosine', warmup_epochs: 3, warmup_momentum: 0.8, warmup_bias_lr: 0.1 },
      params_json: { task_type: 'vision_detect', model_family: 'yolo', model: 'yolov8n.pt', imgsz: 640, batch: 16, patience: 50, save_period: 10, cache: false, single_cls: false },
      resource_json: { device: 'auto', workers: 8, amp: true, verbose: true },
      is_builtin: 1,
    },
    {
      config_code: 'yolo-detect-accurate',
      name: 'YOLO Detect Accurate',
      description: 'High-fidelity preset: 100 epochs, 640px, batch 8, longer patience. For final training runs.',
      model_name: 'yolov8n',
      config_json: { epochs: 100, learning_rate: 0.001, optimizer: 'SGD', momentum: 0.937, weight_decay: 0.0005, lr_scheduler: 'cosine', warmup_epochs: 5, warmup_momentum: 0.8, warmup_bias_lr: 0.1 },
      params_json: { task_type: 'vision_detect', model_family: 'yolo', model: 'yolov8n.pt', imgsz: 640, batch: 8, patience: 100, save_period: 10, cache: true, single_cls: false },
      resource_json: { device: 'auto', workers: 8, amp: true, verbose: true },
      is_builtin: 1,
    },
    {
      config_code: 'yolo-detect-debug',
      name: 'YOLO Detect Debug',
      description: 'Minimal debug preset: 1 epoch, small image, batch 2, CPU forced. For pipeline validation.',
      model_name: 'yolov8n',
      config_json: { epochs: 1, learning_rate: 0.01, optimizer: 'SGD', momentum: 0.937, weight_decay: 0.0005, lr_scheduler: 'cosine', warmup_epochs: 0, warmup_momentum: 0.8, warmup_bias_lr: 0.1 },
      params_json: { task_type: 'vision_detect', model_family: 'yolo', model: 'yolov8n.pt', imgsz: 320, batch: 2, patience: 1, save_period: -1, cache: false, single_cls: false },
      resource_json: { device: 'cpu', workers: 0, amp: false, verbose: true },
      is_builtin: 1,
    },
  ];

  let seeded = 0;
  for (const s of seeds) {
    const existing = db.prepare('SELECT config_code FROM training_configs WHERE config_code = ?').get(s.config_code);
    if (!existing) {
      const id = generateId();
      db.prepare(`
        INSERT INTO training_configs (id, config_code, name, description, model_name,
          config_json, params_json, resource_json, is_builtin, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, s.config_code, s.name, s.description, s.model_name,
        JSON.stringify(s.config_json), JSON.stringify(s.params_json), JSON.stringify(s.resource_json),
        s.is_builtin, n, n
      );
      seeded++;
    }
  }
  return seeded;
}

/** List built-in training presets (is_builtin=1) */
export function listTrainingPresets(query: any = {}) {
  const db = getDatabase();
  const { keyword } = query;
  let sql = 'SELECT * FROM training_configs WHERE is_builtin = 1';
  const params: any[] = [];
  if (keyword) { sql += ' AND (name LIKE ? OR config_code LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
  sql += ' ORDER BY config_code ASC';
  const rows = (db.prepare(sql) as any).all(...params);
  return {
    ok: true,
    presets: rows.map((r: any) => ({
      config_code: r.config_code,
      name: r.name,
      description: r.description,
      model_name: r.model_name,
      config_json: parseJson(r.config_json, {}),
      params_json: parseJson(r.params_json, {}),
      resource_json: parseJson(r.resource_json, {}),
    })),
    total: rows.length,
  };
}

/** Resolve a preset by config_code, returning merged parameters */
export function resolvePreset(configCode: string): { ok: boolean; preset?: any; error?: string } {
  const db = getDatabase();
  const row = (db.prepare('SELECT * FROM training_configs WHERE config_code = ? AND is_builtin = 1') as any).get(configCode) as any;
  if (!row) return { ok: false, error: `Preset "${configCode}" not found` };
  return {
    ok: true,
    preset: {
      config_code: row.config_code,
      name: row.name,
      model_name: row.model_name,
      config_json: parseJson(row.config_json, {}),
      params_json: parseJson(row.params_json, {}),
      resource_json: parseJson(row.resource_json, {}),
    },
  };
}

// ── Summary ─────────────────────────────────────────────────────────────────
export function getTrainingSummary() {
  const db = getDatabase();
  const all = (db.prepare("SELECT status, COUNT(*) as count FROM runs WHERE source_type='training' GROUP BY status") as any).all() as any[];
  const total = (db.prepare("SELECT COUNT(*) as total FROM runs WHERE source_type='training'") as any).get().total;
  const statusMap: Record<string, number> = { queued: 0, running: 0, success: 0, failed: 0, cancelled: 0 };
  for (const r of all) { statusMap[r.status] = r.count; }
  const ckptCount = (db.prepare('SELECT COUNT(*) as c FROM training_checkpoints') as any).get().c;
  const configCount = (db.prepare('SELECT COUNT(*) as c FROM training_configs') as any).get().c;
  return { ok: true, total, ...statusMap, checkpoint_count: ckptCount, config_count: configCount };
}
