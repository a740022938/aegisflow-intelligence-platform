"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvaluations = listEvaluations;
exports.getEvaluationById = getEvaluationById;
exports.createEvaluation = createEvaluation;
exports.updateEvaluation = updateEvaluation;
exports.deleteEvaluation = deleteEvaluation;
exports.executeEvaluation = executeEvaluation;
exports.getEvaluationSteps = getEvaluationSteps;
exports.getEvaluationLogs = getEvaluationLogs;
exports.getEvaluationMetrics = getEvaluationMetrics;
exports.getEvaluationLineage = getEvaluationLineage;
const zod_1 = require("zod");
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
function generateId() {
    return crypto.randomUUID();
}
function now() {
    return new Date().toISOString();
}
function parseJsonField(val, fieldName) {
    if (!val)
        return {};
    try {
        return JSON.parse(val);
    }
    catch {
        throw new Error(`Invalid JSON in ${fieldName}`);
    }
}
const createEvaluationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'name is required'),
    evaluation_type: zod_1.z.enum(['classification', 'detection', 'generation', 'ranking', 'custom']).default('classification'),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).default('pending'),
    model_name: zod_1.z.string().default(''),
    artifact_id: zod_1.z.string().default(''),
    artifact_name: zod_1.z.string().default(''),
    dataset_name: zod_1.z.string().default(''),
    dataset_id: zod_1.z.string().default(''),
    training_job_id: zod_1.z.string().default(''),
    experiment_id: zod_1.z.string().default(''),
    notes: zod_1.z.string().default(''),
    config_json: zod_1.z.string().default('{}'),
});
const updateEvaluationSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    evaluation_type: zod_1.z.enum(['classification', 'detection', 'generation', 'ranking', 'custom']).optional(),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
    model_name: zod_1.z.string().optional(),
    artifact_id: zod_1.z.string().optional(),
    artifact_name: zod_1.z.string().optional(),
    dataset_name: zod_1.z.string().optional(),
    dataset_id: zod_1.z.string().optional(),
    training_job_id: zod_1.z.string().optional(),
    experiment_id: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    config_json: zod_1.z.string().optional(),
});
// ── List ─────────────────────────────────────────────────────────────────────
async function listEvaluations(query) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const { keyword, status, evaluation_type } = query;
    let sql = 'SELECT * FROM evaluations WHERE 1=1';
    const params = [];
    if (keyword) {
        sql += ' AND (name LIKE ? OR model_name LIKE ? OR artifact_name LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    if (evaluation_type) {
        sql += ' AND evaluation_type = ?';
        params.push(evaluation_type);
    }
    sql += ' ORDER BY updated_at DESC';
    const rows = dbInstance.prepare(sql).all(...params);
    return {
        ok: true,
        evaluations: rows.map(r => ({
            ...r,
            config_json: parseJsonField(r.config_json, 'config_json'),
            result_summary_json: parseJsonField(r.result_summary_json, 'result_summary_json'),
        })),
        total: rows.length,
    };
}
// ── Get One ──────────────────────────────────────────────────────────────────
async function getEvaluationById(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const evaluation = dbInstance.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    if (!evaluation) {
        return { ok: false, error: `Evaluation ${id} not found` };
    }
    return {
        ok: true,
        evaluation: {
            ...evaluation,
            config_json: parseJsonField(evaluation.config_json, 'config_json'),
            result_summary_json: parseJsonField(evaluation.result_summary_json, 'result_summary_json'),
        },
    };
}
// ── Create ───────────────────────────────────────────────────────────────────
async function createEvaluation(body) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const validation = createEvaluationSchema.safeParse(body);
    if (!validation.success) {
        return { ok: false, error: validation.error.message };
    }
    const data = validation.data;
    const id = generateId();
    const nowStr = now();
    let configStr = data.config_json;
    if (typeof configStr === 'object') {
        configStr = JSON.stringify(configStr);
    }
    else if (!configStr) {
        configStr = '{}';
    }
    // validate config_json
    try {
        JSON.parse(configStr);
    }
    catch {
        return { ok: false, error: 'config_json is not valid JSON' };
    }
    dbInstance.prepare(`
    INSERT INTO evaluations (
      id, name, evaluation_type, status, model_name, artifact_id, artifact_name,
      dataset_name, dataset_id, training_job_id, experiment_id, notes,
      config_json, result_summary_json,
      created_at, updated_at, started_at, finished_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.evaluation_type, data.status, data.model_name || '', data.artifact_id || '', data.artifact_name || '', data.dataset_name || '', data.dataset_id || '', data.training_job_id || '', data.experiment_id || '', data.notes || '', configStr || '{}', '{}', nowStr, nowStr, null, null);
    const created = dbInstance.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    return {
        ok: true,
        evaluation: {
            ...created,
            config_json: parseJsonField(created.config_json, 'config_json'),
            result_summary_json: {},
        },
    };
}
// ── Update ───────────────────────────────────────────────────────────────────
async function updateEvaluation(id, body) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const existing = dbInstance.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    if (!existing) {
        return { ok: false, error: 'Evaluation not found' };
    }
    const validation = updateEvaluationSchema.safeParse(body);
    if (!validation.success) {
        return { ok: false, error: validation.error.message };
    }
    const data = validation.data;
    if (data.config_json !== undefined) {
        try {
            JSON.parse(data.config_json);
        }
        catch {
            return { ok: false, error: 'config_json is not valid JSON' };
        }
    }
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
            if (key === 'config_json') {
                fields.push(`${key} = ?`);
                values.push(JSON.stringify(val));
            }
            else {
                fields.push(`${key} = ?`);
                values.push(val);
            }
        }
    }
    if (fields.length > 0) {
        fields.push('updated_at = ?');
        values.push(now());
        values.push(id);
        dbInstance.prepare(`UPDATE evaluations SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
    const updated = dbInstance.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    return {
        ok: true,
        evaluation: {
            ...updated,
            config_json: parseJsonField(updated.config_json, 'config_json'),
            result_summary_json: parseJsonField(updated.result_summary_json, 'result_summary_json'),
        },
    };
}
// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteEvaluation(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const existing = dbInstance.prepare('SELECT id FROM evaluations WHERE id = ?').get(id);
    if (!existing) {
        return { ok: false, error: 'Evaluation not found' };
    }
    // cascade delete related records
    dbInstance.prepare('DELETE FROM evaluation_metrics WHERE evaluation_id = ?').run(id);
    dbInstance.prepare('DELETE FROM evaluation_logs WHERE evaluation_id = ?').run(id);
    dbInstance.prepare('DELETE FROM evaluation_steps WHERE evaluation_id = ?').run(id);
    dbInstance.prepare('DELETE FROM evaluations WHERE id = ?').run(id);
    return { ok: true };
}
// ── Execute Mock ─────────────────────────────────────────────────────────────
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const STEP_DEFINITIONS = [
    { name: 'load_model', message: 'Loading model from artifact...', duration: 2500 },
    { name: 'load_dataset', message: 'Loading evaluation dataset...', duration: 2000 },
    { name: 'prepare_runtime', message: 'Preparing evaluation runtime...', duration: 1500 },
    { name: 'run_evaluation', message: 'Running evaluation pipeline...', duration: 5000 },
    { name: 'aggregate_metrics', message: 'Aggregating metrics...', duration: 1500 },
    { name: 'finalize_report', message: 'Finalizing evaluation report...', duration: 1000 },
];
const MOCK_METRICS = {
    classification: {
        accuracy: () => +(0.78 + Math.random() * 0.18).toFixed(4),
        precision: () => +(0.75 + Math.random() * 0.20).toFixed(4),
        recall: () => +(0.73 + Math.random() * 0.22).toFixed(4),
        // f1 由 precision + recall 推导，不独立随机
    },
    detection: {
        mAP50: () => +(0.65 + Math.random() * 0.25).toFixed(4),
        mAP50_95: () => +(0.42 + Math.random() * 0.30).toFixed(4),
        precision: () => +(0.70 + Math.random() * 0.20).toFixed(4),
        recall: () => +(0.68 + Math.random() * 0.22).toFixed(4),
    },
    generation: {
        bleu_score: () => +(0.35 + Math.random() * 0.30).toFixed(4),
        rouge_l: () => +(0.42 + Math.random() * 0.25).toFixed(4),
        perplexity: () => +(8 + Math.random() * 12).toFixed(2),
    },
    ranking: {
        ndcg_at_10: () => +(0.55 + Math.random() * 0.30).toFixed(4),
        mrr: () => +(0.50 + Math.random() * 0.30).toFixed(4),
        hit_rate: () => +(0.65 + Math.random() * 0.25).toFixed(4),
    },
    custom: {
        score: () => +(0.60 + Math.random() * 0.30).toFixed(4),
        latency_ms: () => +(50 + Math.random() * 200).toFixed(1),
    },
};
async function runEvaluation(evaluationId, evaluationType) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    // Write steps
    for (let i = 0; i < STEP_DEFINITIONS.length; i++) {
        const step = STEP_DEFINITIONS[i];
        const stepId = generateId();
        const stepStartedAt = now();
        db.prepare(`
      INSERT INTO evaluation_steps (id, evaluation_id, step_order, name, status, message, started_at, finished_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(stepId, evaluationId, i, step.name, 'running', step.message, stepStartedAt, null, now(), now());
        db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
            .run(generateId(), evaluationId, 'info', step.message, now());
        await delay(step.duration);
        db.prepare(`UPDATE evaluation_steps SET status = ?, finished_at = ?, updated_at = ? WHERE id = ?`)
            .run('completed', now(), now(), stepId);
        db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
            .run(generateId(), evaluationId, 'info', `Step "${step.name}" completed`, now());
    }
    // Write metrics
    const metricsGenerators = MOCK_METRICS[evaluationType] || MOCK_METRICS.custom;
    const metricValues = {};
    for (const [metricKey, metricFn] of Object.entries(metricsGenerators)) {
        const metricValue = metricFn();
        metricValues[metricKey] = metricValue;
        db.prepare(`INSERT INTO evaluation_metrics (id, evaluation_id, metric_key, metric_value, created_at) VALUES (?, ?, ?, ?, ?)`)
            .run(generateId(), evaluationId, metricKey, metricValue.toString(), now());
        db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
            .run(generateId(), evaluationId, 'info', `Metric recorded: ${metricKey} = ${metricValue}`, now());
    }
    // classification: f1 = 2 * p * r / (p + r)
    if (evaluationType === 'classification') {
        const p = metricValues['precision'];
        const r = metricValues['recall'];
        const f1 = (p !== undefined && r !== undefined && (p + r) > 0)
            ? +((2 * p * r) / (p + r)).toFixed(4)
            : +(0.74 + Math.random() * 0.15).toFixed(4);
        metricValues['f1'] = f1;
        db.prepare(`INSERT INTO evaluation_metrics (id, evaluation_id, metric_key, metric_value, created_at) VALUES (?, ?, ?, ?, ?)`)
            .run(generateId(), evaluationId, 'f1', f1.toString(), now());
        db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
            .run(generateId(), evaluationId, 'info', `Metric recorded: f1 = ${f1} (derived from precision=${p}, recall=${r})`, now());
    }
    // Write result_summary_json
    const summary = {
        evaluation_type: evaluationType,
        total_samples: Math.floor(500 + Math.random() * 1500),
        total_duration_ms: STEP_DEFINITIONS.reduce((s, s2) => s + s2.duration, 0),
        metrics_summary: { ...metricValues },
    };
    db.prepare(`UPDATE evaluations SET status = ?, result_summary_json = ?, finished_at = ?, updated_at = ? WHERE id = ?`)
        .run('completed', JSON.stringify(summary), now(), now(), evaluationId);
    db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
        .run(generateId(), evaluationId, 'info', 'Evaluation completed successfully', now());
    // ── v2.8.0: Auto-update model.latest_evaluation_id ───────────────────
    try {
        const ev = db.prepare('SELECT experiment_id, artifact_id FROM evaluations WHERE id = ?').get(evaluationId);
        let updated_model_id = null;
        if (ev && ev.experiment_id) {
            const model = db.prepare("SELECT model_id FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 1").get(ev.experiment_id);
            if (model) {
                db.prepare('UPDATE models SET latest_evaluation_id = ?, updated_at = ? WHERE model_id = ?')
                    .run(evaluationId, now(), model.model_id);
                updated_model_id = model.model_id;
                db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
                    .run(generateId(), evaluationId, 'info', `model_latest_evaluation_updated: model_id=${model.model_id}`, now());
            }
        }
        if (updated_model_id) {
            try {
                db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'model', 'model_latest_evaluation_updated', ?, 'success', ?, ?)`)
                    .run(generateId(), updated_model_id, JSON.stringify({ model_id: updated_model_id, evaluation_id: evaluationId }), now());
            }
            catch (_) { /* silent */ }
        }
    }
    catch (_) { /* silent */ }
}
async function executeEvaluation(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const evaluation = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    if (!evaluation) {
        return { ok: false, error: `Evaluation ${id} not found` };
    }
    if (evaluation.status === 'running') {
        return { ok: false, error: 'Evaluation is already running' };
    }
    db.prepare(`UPDATE evaluations SET status = ?, started_at = ?, updated_at = ? WHERE id = ?`)
        .run('running', now(), now(), id);
    db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
        .run(generateId(), id, 'info', 'Evaluation execution started', now());
    void runEvaluation(id, evaluation.evaluation_type).catch((err) => {
        db.prepare(`UPDATE evaluations SET status = ?, error_message = ?, finished_at = ?, updated_at = ? WHERE id = ?`)
            .run('failed', err.message, now(), now(), id);
        db.prepare(`INSERT INTO evaluation_logs (id, evaluation_id, level, message, created_at) VALUES (?, ?, ?, ?, ?)`)
            .run(generateId(), id, 'error', `Evaluation failed: ${err.message}`, now());
    });
    return { ok: true, evaluation_id: id, status: 'running' };
}
// ── Get Steps ────────────────────────────────────────────────────────────────
function getEvaluationSteps(evaluationId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const steps = db.prepare('SELECT * FROM evaluation_steps WHERE evaluation_id = ? ORDER BY step_order').all(evaluationId);
    return { ok: true, steps, evaluation_id: evaluationId };
}
// ── Get Logs ─────────────────────────────────────────────────────────────────
function getEvaluationLogs(evaluationId, order = 'asc') {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const logs = db.prepare('SELECT * FROM evaluation_logs WHERE evaluation_id = ? ORDER BY created_at ' + order).all(evaluationId);
    return { ok: true, logs, evaluation_id: evaluationId, order };
}
// ── Get Metrics ──────────────────────────────────────────────────────────────
function getEvaluationMetrics(evaluationId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const metrics = db.prepare('SELECT * FROM evaluation_metrics WHERE evaluation_id = ? ORDER BY created_at').all(evaluationId);
    return { ok: true, metrics, evaluation_id: evaluationId };
}
// ── Get Lineage ──────────────────────────────────────────────────────────────
function getEvaluationLineage(evaluationId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    // 1. Evaluation
    const evaluation = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(evaluationId);
    if (!evaluation)
        return { ok: false, error: 'Evaluation not found' };
    // 2. Artifact — try artifact_id first, then name match
    let artifact = null;
    if (evaluation.artifact_id) {
        artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(evaluation.artifact_id);
    }
    if (!artifact && evaluation.artifact_name) {
        // Prefer exact match, then LIKE fallback
        artifact = db.prepare('SELECT * FROM artifacts WHERE name = ? LIMIT 1').get(evaluation.artifact_name);
        if (!artifact) {
            artifact = db.prepare("SELECT * FROM artifacts WHERE name LIKE ? LIMIT 1").get(`%${evaluation.artifact_name}%`);
        }
    }
    // 3. Experiment — artifact.training_job_id is actually experiment.id
    let experiment = null;
    if (artifact?.training_job_id) {
        experiment = db.prepare('SELECT id, name, experiment_code, status, created_at, updated_at FROM experiments WHERE id = ?').get(artifact.training_job_id);
    }
    // Fallback: evaluation.training_job_id -> experiment.id
    if (!experiment && evaluation.training_job_id) {
        experiment = db.prepare('SELECT id, name, experiment_code, status, created_at, updated_at FROM experiments WHERE id = ?').get(evaluation.training_job_id);
    }
    // 4. Run — via run_artifacts (artifact_id) or runs.source_id = experiment.id
    let run = null;
    if (artifact?.id) {
        // Try run_artifacts join first
        run = db.prepare('SELECT r.* FROM runs r JOIN run_artifacts ra ON r.id = ra.run_id WHERE ra.artifact_id = ? LIMIT 1').get(artifact.id);
    }
    if (!run && experiment?.id) {
        // Fallback: runs where source_type='experiment' and source_id = experiment.id
        run = db.prepare("SELECT * FROM runs WHERE source_type = 'experiment' AND source_id = ? LIMIT 1")
            .get(experiment.id);
    }
    // 5. Training Config (from run.config_json -> config_id, or from training_configs table)
    let trainingConfig = null;
    if (run?.config_json) {
        try {
            const cfg = JSON.parse(run.config_json);
            if (cfg.config_id) {
                trainingConfig = db.prepare('SELECT * FROM training_configs WHERE id = ?').get(cfg.config_id);
            }
        }
        catch { }
    }
    // 6. Dataset
    let dataset = null;
    if (evaluation.dataset_id) {
        dataset = db.prepare('SELECT id, name, format, size_bytes, created_at FROM datasets WHERE id = ?').get(evaluation.dataset_id);
    }
    // 7. Deployments — linked via artifact_id (artifact -> deployments)
    const deployments = artifact?.id
        ? db.prepare('SELECT id, name, deployment_type, status, health_status, base_url, created_at, updated_at FROM deployments WHERE artifact_id = ? LIMIT 20').all(artifact.id)
        : [];
    // 8. Related evaluations (same artifact or same experiment)
    const relatedEvals = (artifact?.id
        ? db.prepare("SELECT id, name, evaluation_type, status, result_summary_json, created_at, started_at, finished_at FROM evaluations WHERE (artifact_id = ? OR artifact_name = ?) AND id != ? ORDER BY created_at DESC LIMIT 10").all(artifact.id, artifact.name, evaluationId)
        : db.prepare("SELECT id, name, evaluation_type, status, result_summary_json, created_at, started_at, finished_at FROM evaluations WHERE id != ? ORDER BY created_at DESC LIMIT 5").all(evaluationId));
    return {
        ok: true,
        evaluation,
        artifact: artifact || null,
        experiment: experiment || null,
        run: run || null,
        training_config: trainingConfig || null,
        dataset: dataset || null,
        deployments,
        related_evaluations: relatedEvals,
    };
}
