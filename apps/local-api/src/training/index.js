"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTrainingConfigs = listTrainingConfigs;
exports.getTrainingConfig = getTrainingConfig;
exports.createTrainingConfig = createTrainingConfig;
exports.createTrainingRun = createTrainingRun;
exports.listCheckpoints = listCheckpoints;
exports.getCheckpoint = getCheckpoint;
exports.createCheckpoint = createCheckpoint;
exports.listTrainingRuns = listTrainingRuns;
exports.getTrainingRun = getTrainingRun;
exports.getTrainingSummary = getTrainingSummary;
/**
 * Training Runtime Module
 * 最小训练闭环：training config → training run → checkpoint records → training artifact
 * 所有执行动作统一挂 runs 体系，不分叉。
 */
const zod_1 = require("zod");
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
function generateId() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function parseJson(val, fallback = null) {
    if (!val)
        return fallback;
    try {
        return JSON.parse(val);
    }
    catch {
        return fallback;
    }
}
// ── Schemas ──────────────────────────────────────────────────────────────────
const createTrainingConfigSchema = zod_1.z.object({
    config_code: zod_1.z.string().min(1, 'config_code is required'),
    name: zod_1.z.string().min(1, 'name is required'),
    description: zod_1.z.string().default(''),
    model_name: zod_1.z.string().default(''),
    dataset_id: zod_1.z.string().default(''),
    config_json: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]).default({}),
    params_json: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]).default({}),
    resource_json: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]).default({}),
});
const createTrainingRunSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'name is required'),
    training_config_id: zod_1.z.string().optional(),
    dataset_id: zod_1.z.string().optional(),
    model_name: zod_1.z.string().default(''),
    config_json: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]).default({}),
});
const createCheckpointSchema = zod_1.z.object({
    run_id: zod_1.z.string().min(1, 'run_id is required'),
    step: zod_1.z.number().int().min(0).default(0),
    epoch: zod_1.z.number().int().min(0).default(0),
    checkpoint_path: zod_1.z.string().default(''),
    metrics_json: zod_1.z.union([zod_1.z.string(), zod_1.z.any()]).default({}),
    is_best: zod_1.z.boolean().default(false),
    is_latest: zod_1.z.boolean().default(true),
    file_size_bytes: zod_1.z.number().int().min(0).optional(),
    notes: zod_1.z.string().default(''),
});
// ── Training Config CRUD ──────────────────────────────────────────────────────
function listTrainingConfigs(query = {}) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const { keyword, model_name } = query;
    let sql = 'SELECT * FROM training_configs WHERE 1=1';
    const params = [];
    if (keyword) {
        sql += ' AND (name LIKE ? OR config_code LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (model_name) {
        sql += ' AND model_name = ?';
        params.push(model_name);
    }
    sql += ' ORDER BY updated_at DESC';
    const rows = db.prepare(sql).all(...params);
    return {
        ok: true,
        configs: rows.map((r) => ({
            ...r,
            config_json: parseJson(r.config_json, {}),
            params_json: parseJson(r.params_json, {}),
            resource_json: parseJson(r.resource_json, {}),
        })),
        total: rows.length,
    };
}
function getTrainingConfig(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const row = db.prepare('SELECT * FROM training_configs WHERE id = ?').get(id);
    if (!row)
        return { ok: false, error: 'Training config not found' };
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
function createTrainingConfig(body) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const validation = createTrainingConfigSchema.safeParse(body);
    if (!validation.success)
        return { ok: false, error: validation.error.errors[0].message };
    const d = validation.data;
    const configStr = typeof d.config_json === 'string' ? d.config_json : JSON.stringify(d.config_json || {});
    const paramsStr = typeof d.params_json === 'string' ? d.params_json : JSON.stringify(d.params_json || {});
    const resourceStr = typeof d.resource_json === 'string' ? d.resource_json : JSON.stringify(d.resource_json || {});
    const id = generateId();
    const n = now();
    try {
        db.prepare(`
      INSERT INTO training_configs (id,config_code,name,description,model_name,dataset_id,config_json,params_json,resource_json,is_builtin,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, d.config_code, d.name, d.description, d.model_name, d.dataset_id, configStr, paramsStr, resourceStr, 0, n, n);
    }
    catch (e) {
        if (e.message.includes('UNIQUE'))
            return { ok: false, error: `Config "${d.config_code}" already exists` };
        return { ok: false, error: e.message };
    }
    const row = db.prepare('SELECT * FROM training_configs WHERE id = ?').get(id);
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
function createTrainingRun(body) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const validation = createTrainingRunSchema.safeParse(body);
    if (!validation.success)
        return { ok: false, error: validation.error.errors[0].message };
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
    // 1. Create run (source_type='training')
    db.prepare(`
    INSERT INTO runs (id,run_code,name,source_type,source_id,status,priority,trigger_mode,executor_type,workspace_path,config_json,summary_json,error_message,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(runId, code, d.name, 'training', d.training_config_id || '', 'running', 8, 'manual', 'mock', '', configStr, summaryStr, '', n, n);
    // 2. Create training_checkpoints entry (epoch 0, step 0 = start marker)
    const startCkptId = generateId();
    db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(startCkptId, runId, 0, 0, '', '{}', 0, 0, 0, 'Training started', n, n);
    // 3. Kick off async mock executor
    void _executeTrainingRun(runId, trainingRunId, configStr, d.model_name).catch((err) => {
        console.error("[TRAINING ERROR]", err);
        const db2 = (0, builtin_sqlite_js_1.getDatabase)();
        const nn = now();
        db2.prepare('UPDATE runs SET status=?, finished_at=?, error_message=?, updated_at=? WHERE id=?')
            .run('failed', nn, err.message, nn, runId);
    });
    const run = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId);
    return { ok: true, run, training_run_id: trainingRunId };
}
async function _executeTrainingRun(runId, trainingRunId, configStr, modelName) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const config = parseJson(configStr, {});
    const epochs = config.epochs || 3;
    const stepsPerEpoch = config.steps_per_epoch || 10;
    const delayPerStep = config.delay_per_step || 400;
    const startTime = now();
    // Initial log
    db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)')
        .run(generateId(), runId, '', 'info', `Training started: model=${modelName || 'unnamed'}, epochs=${epochs}`, now());
    let bestLoss = 999.0; // start very high so first checkpoint becomes best
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
                db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)')
                    .run(generateId(), runId, '', 'info', `Epoch ${epoch}/${epochs} Step ${step} [${progress}%] loss=${loss.toFixed(4)} acc=${acc.toFixed(4)} lr=${lr.toFixed(6)}`, now());
            }
            // Create checkpoint every 2 epochs (stepsPerEpoch * 2)
            if (step === stepsPerEpoch) {
                await new Promise(res => setTimeout(res, delayPerStep));
                const ckptId = generateId();
                const ckptPath = `/checkpoints/${runId}/epoch_${epoch}.pt`;
                const isBest = loss < bestLoss;
                if (isBest) {
                    bestLoss = loss;
                    bestCkptId = ckptId;
                }
                db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
                    .run(ckptId, runId, stepIdx, epoch, ckptPath, metrics, isBest ? 1 : 0, 0, Math.floor(Math.random() * 50000000) + 10000000, `Epoch ${epoch} checkpoint`, now(), now());
                db.prepare('UPDATE training_checkpoints SET is_latest=0, updated_at=? WHERE run_id=? AND epoch>=?').run(now(), runId, epoch);
                db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)')
                    .run(generateId(), runId, '', 'info', `Checkpoint saved: epoch=${epoch} path=${ckptPath} loss=${loss.toFixed(4)}${isBest ? ' [BEST]' : ''}`, now());
            }
            else {
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
        db.prepare('UPDATE training_checkpoints SET is_best=0, updated_at=? WHERE run_id=?').run(now(), runId);
        db.prepare('UPDATE training_checkpoints SET is_best=1, is_latest=1, notes=?, updated_at=? WHERE id=?')
            .run('Final best checkpoint', now(), bestCkptId);
    }
    // Write training artifact
    const artifactId = generateId();
    const artifactName = `trained_${modelName || 'model'}_${new Date().toISOString().slice(0, 10)}`;
    const artifactPath = `/models/${runId}/final.pt`;
    const finalMetrics = JSON.stringify({ final_loss: parseFloat(bestLoss.toFixed(4)), final_accuracy: parseFloat((1 - bestLoss).toFixed(4)), total_epochs: epochs, total_steps: totalSteps });
    db.prepare(`
    INSERT INTO artifacts (id,name,artifact_type,status,source_type,training_job_id,model_family,format,version,path,file_size_bytes,metrics_snapshot_json,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(artifactId, artifactName, 'model', 'ready', 'training', runId, modelName || '', 'pytorch', 'v1', artifactPath, Math.floor(Math.random() * 100000000) + 50000000, finalMetrics, finishTime, finishTime);
    // Link artifact to run
    const linkId = generateId();
    db.prepare('INSERT OR IGNORE INTO run_artifacts (id,run_id,artifact_id,relation_type) VALUES (?,?,?,?)')
        .run(linkId, runId, artifactId, 'output');
    db.prepare('INSERT INTO run_logs (id,run_id,step_id,log_level,message,created_at) VALUES (?,?,?,?,?,?)')
        .run(generateId(), runId, '', 'info', `Training completed: final_loss=${bestLoss.toFixed(4)} artifact=${artifactName}`, finishTime);
    db.prepare('UPDATE runs SET status=?, finished_at=?, summary_json=?, updated_at=? WHERE id=?')
        .run('success', finishTime, JSON.stringify({ best_loss: bestLoss, total_epochs: epochs, total_steps: totalSteps, artifact_id: artifactId, artifact_name: artifactName }), now(), runId);
}
// ── Checkpoint CRUD ─────────────────────────────────────────────────────────
function listCheckpoints(query = {}) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const { run_id, is_best } = query;
    let sql = 'SELECT * FROM training_checkpoints WHERE 1=1';
    const params = [];
    if (run_id) {
        sql += ' AND run_id = ?';
        params.push(run_id);
    }
    if (is_best !== undefined) {
        sql += ' AND is_best = ?';
        params.push(is_best ? 1 : 0);
    }
    sql += ' ORDER BY epoch DESC, step DESC';
    const rows = db.prepare(sql).all(...params);
    return {
        ok: true,
        checkpoints: rows.map((r) => ({ ...r, metrics_json: parseJson(r.metrics_json, {}), is_best: !!r.is_best, is_latest: !!r.is_latest })),
        total: rows.length,
    };
}
function getCheckpoint(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const row = db.prepare('SELECT * FROM training_checkpoints WHERE id = ?').get(id);
    if (!row)
        return { ok: false, error: 'Checkpoint not found' };
    return {
        ok: true,
        checkpoint: { ...row, metrics_json: parseJson(row.metrics_json, {}), is_best: !!row.is_best, is_latest: !!row.is_latest },
    };
}
function createCheckpoint(body) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const validation = createCheckpointSchema.safeParse(body);
    if (!validation.success)
        return { ok: false, error: validation.error.errors[0].message };
    const d = validation.data;
    const run = db.prepare('SELECT id FROM runs WHERE id = ?').get(d.run_id);
    if (!run)
        return { ok: false, error: 'Run not found' };
    const metricsStr = typeof d.metrics_json === 'string' ? d.metrics_json : JSON.stringify(d.metrics_json || {});
    const id = generateId();
    const n = now();
    db.prepare('INSERT INTO training_checkpoints (id,run_id,step,epoch,checkpoint_path,metrics_json,is_best,is_latest,file_size_bytes,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(id, d.run_id, d.step, d.epoch, d.checkpoint_path, metricsStr, d.is_best ? 1 : 0, d.is_latest ? 1 : 0, d.file_size_bytes || 0, d.notes, n, n);
    const row = db.prepare('SELECT * FROM training_checkpoints WHERE id = ?').get(id);
    return { ok: true, checkpoint: { ...row, metrics_json: parseJson(row.metrics_json, {}), is_best: !!row.is_best, is_latest: !!row.is_latest } };
}
// ── Training Runs: list via runs table ─────────────────────────────────────
function listTrainingRuns(query = {}) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const { dataset_id, status, limit = 100 } = query;
    let sql = `SELECT r.*, tc.name as config_name, tc.config_code as config_code
             FROM runs r
             LEFT JOIN training_configs tc ON r.source_id = tc.id
             WHERE r.source_type = 'training'`;
    const params = [];
    if (dataset_id) {
        sql += ' AND r.config_json LIKE ?';
        params.push(`%"dataset_id":"${dataset_id}"%`);
    }
    if (status) {
        sql += ' AND r.status = ?';
        params.push(status);
    }
    sql += ' ORDER BY r.created_at DESC LIMIT ?';
    params.push(Number(limit));
    const rows = db.prepare(sql).all(...params);
    const total = db.prepare('SELECT COUNT(*) as c FROM runs WHERE source_type=?').get('training').c;
    return { ok: true, runs: rows, total };
}
function getTrainingRun(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const run = db.prepare('SELECT * FROM runs WHERE id = ? AND source_type = ?').get(id, 'training');
    if (!run)
        return { ok: false, error: 'Training run not found' };
    const checkpoints = db.prepare('SELECT * FROM training_checkpoints WHERE run_id = ? ORDER BY epoch DESC').all(id);
    const artifacts = db.prepare('SELECT ra.*, a.name, a.artifact_type, a.format, a.path as artifact_path FROM run_artifacts ra JOIN artifacts a ON a.id = ra.artifact_id WHERE ra.run_id = ?').all(id);
    return {
        ok: true,
        run,
        checkpoints: checkpoints.map((r) => ({ ...r, metrics_json: parseJson(r.metrics_json, {}), is_best: !!r.is_best, is_latest: !!r.is_latest })),
        artifacts,
    };
}
// ── Summary ─────────────────────────────────────────────────────────────────
function getTrainingSummary() {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const all = db.prepare("SELECT status, COUNT(*) as count FROM runs WHERE source_type='training' GROUP BY status").all();
    const total = db.prepare("SELECT COUNT(*) as total FROM runs WHERE source_type='training'").get().total;
    const statusMap = { queued: 0, running: 0, success: 0, failed: 0, cancelled: 0 };
    for (const r of all) {
        statusMap[r.status] = r.count;
    }
    const ckptCount = db.prepare('SELECT COUNT(*) as c FROM training_checkpoints').get().c;
    const configCount = db.prepare('SELECT COUNT(*) as c FROM training_configs').get().c;
    return { ok: true, total, ...statusMap, checkpoint_count: ckptCount, config_count: configCount };
}
