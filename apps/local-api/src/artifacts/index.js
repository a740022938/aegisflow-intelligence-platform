"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listArtifacts = listArtifacts;
exports.getArtifactById = getArtifactById;
exports.createArtifact = createArtifact;
exports.updateArtifact = updateArtifact;
exports.archiveArtifact = archiveArtifact;
exports.deleteArtifact = deleteArtifact;
exports.createArtifactFromTraining = createArtifactFromTraining;
exports.createEvaluationFromArtifact = createEvaluationFromArtifact;
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
const createArtifactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'name is required'),
    artifact_type: zod_1.z.enum(['model', 'checkpoint', 'weights', 'tokenizer', 'adapter', 'embedding_index', 'config', 'report', 'other']).default('model'),
    status: zod_1.z.enum(['ready', 'draft', 'archived', 'deleted', 'failed']).default('draft'),
    source_type: zod_1.z.enum(['training', 'evaluation', 'manual', 'imported', 'system']).default('manual'),
    training_job_id: zod_1.z.string().default(''),
    evaluation_id: zod_1.z.string().default(''),
    dataset_id: zod_1.z.string().default(''),
    parent_artifact_id: zod_1.z.string().default(''),
    model_family: zod_1.z.string().default(''),
    framework: zod_1.z.string().default(''),
    format: zod_1.z.string().default(''),
    version: zod_1.z.string().default(''),
    path: zod_1.z.string().default(''),
    file_size_bytes: zod_1.z.number().int().nonnegative().optional(),
    metadata_json: zod_1.z.string().default('{}'),
    metrics_snapshot_json: zod_1.z.string().default('{}'),
    notes: zod_1.z.string().default(''),
});
const updateArtifactSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    artifact_type: zod_1.z.enum(['model', 'checkpoint', 'weights', 'tokenizer', 'adapter', 'embedding_index', 'config', 'report', 'other']).optional(),
    status: zod_1.z.enum(['ready', 'draft', 'archived', 'deleted', 'failed']).optional(),
    source_type: zod_1.z.enum(['training', 'evaluation', 'manual', 'imported', 'system']).optional(),
    training_job_id: zod_1.z.string().optional(),
    evaluation_id: zod_1.z.string().optional(),
    dataset_id: zod_1.z.string().optional(),
    parent_artifact_id: zod_1.z.string().optional(),
    model_family: zod_1.z.string().optional(),
    framework: zod_1.z.string().optional(),
    format: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    path: zod_1.z.string().optional(),
    file_size_bytes: zod_1.z.number().int().nonnegative().optional().catch(undefined),
    metadata_json: zod_1.z.string().optional(),
    metrics_snapshot_json: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
// ── List ─────────────────────────────────────────────────────────────────────
async function listArtifacts(query) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const { q, status, artifact_type, source_type, training_job_id } = query;
    let sql = 'SELECT * FROM artifacts WHERE 1=1';
    const params = [];
    if (q) {
        sql += ' AND (name LIKE ? OR model_family LIKE ? OR framework LIKE ? OR format LIKE ? OR path LIKE ?)';
        params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    if (artifact_type) {
        sql += ' AND artifact_type = ?';
        params.push(artifact_type);
    }
    if (source_type) {
        sql += ' AND source_type = ?';
        params.push(source_type);
    }
    if (training_job_id) {
        sql += ' AND training_job_id = ?';
        params.push(training_job_id);
    }
    sql += ' ORDER BY updated_at DESC';
    const rows = dbInstance.prepare(sql).all(...params);
    return {
        ok: true,
        artifacts: rows.map(r => ({
            ...r,
            metadata_json: parseJsonField(r.metadata_json, 'metadata_json'),
            metrics_snapshot_json: parseJsonField(r.metrics_snapshot_json, 'metrics_snapshot_json'),
        })),
        total: rows.length,
    };
}
// ── Get One ──────────────────────────────────────────────────────────────────
async function getArtifactById(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const artifact = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    if (!artifact) {
        return { ok: false, error: `Artifact ${id} not found` };
    }
    return {
        ok: true,
        artifact: {
            ...artifact,
            metadata_json: parseJsonField(artifact.metadata_json, 'metadata_json'),
            metrics_snapshot_json: parseJsonField(artifact.metrics_snapshot_json, 'metrics_snapshot_json'),
        },
    };
}
// ── Create ───────────────────────────────────────────────────────────────────
async function createArtifact(body) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const validation = createArtifactSchema.safeParse(body);
    if (!validation.success) {
        return { ok: false, error: validation.error.message };
    }
    const data = validation.data;
    const id = generateId();
    const nowStr = now();
    let metadataStr = data.metadata_json;
    if (typeof metadataStr === 'object')
        metadataStr = JSON.stringify(metadataStr);
    if (!metadataStr)
        metadataStr = '{}';
    let metricsStr = data.metrics_snapshot_json;
    if (typeof metricsStr === 'object')
        metricsStr = JSON.stringify(metricsStr);
    if (!metricsStr)
        metricsStr = '{}';
    try {
        JSON.parse(metadataStr);
    }
    catch {
        return { ok: false, error: 'metadata_json is not valid JSON' };
    }
    try {
        JSON.parse(metricsStr);
    }
    catch {
        return { ok: false, error: 'metrics_snapshot_json is not valid JSON' };
    }
    dbInstance.prepare(`
    INSERT INTO artifacts (
      id, name, artifact_type, status, source_type,
      training_job_id, evaluation_id, dataset_id, parent_artifact_id,
      model_family, framework, format, version, path, file_size_bytes,
      metadata_json, metrics_snapshot_json, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.artifact_type, data.status, data.source_type, data.training_job_id, data.evaluation_id, data.dataset_id, data.parent_artifact_id, data.model_family, data.framework, data.format, data.version, data.path, data.file_size_bytes ?? null, metadataStr, metricsStr, data.notes, nowStr, nowStr);
    const created = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    return {
        ok: true,
        artifact: {
            ...created,
            metadata_json: parseJsonField(created.metadata_json, 'metadata_json'),
            metrics_snapshot_json: parseJsonField(created.metrics_snapshot_json, 'metrics_snapshot_json'),
        },
    };
}
// ── Update ───────────────────────────────────────────────────────────────────
async function updateArtifact(id, body) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const existing = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    if (!existing) {
        return { ok: false, error: 'Artifact not found' };
    }
    const validation = updateArtifactSchema.safeParse(body);
    if (!validation.success) {
        return { ok: false, error: validation.error.message };
    }
    const data = validation.data;
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
            if (['metadata_json', 'metrics_snapshot_json'].includes(key)) {
                try {
                    JSON.parse(String(val));
                }
                catch {
                    return { ok: false, error: `${key} is not valid JSON` };
                }
                fields.push(`${key} = ?`);
                values.push(String(val));
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
        dbInstance.prepare(`UPDATE artifacts SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
    const updated = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    return {
        ok: true,
        artifact: {
            ...updated,
            metadata_json: parseJsonField(updated.metadata_json, 'metadata_json'),
            metrics_snapshot_json: parseJsonField(updated.metrics_snapshot_json, 'metrics_snapshot_json'),
        },
    };
}
// ── Archive ──────────────────────────────────────────────────────────────────
async function archiveArtifact(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const existing = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    if (!existing) {
        return { ok: false, error: 'Artifact not found' };
    }
    dbInstance.prepare('UPDATE artifacts SET status = ?, updated_at = ? WHERE id = ?')
        .run('archived', now(), id);
    const updated = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    return {
        ok: true,
        artifact: {
            ...updated,
            metadata_json: parseJsonField(updated.metadata_json, 'metadata_json'),
            metrics_snapshot_json: parseJsonField(updated.metrics_snapshot_json, 'metrics_snapshot_json'),
        },
    };
}
// ── Soft Delete ───────────────────────────────────────────────────────────────
async function deleteArtifact(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const existing = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    if (!existing) {
        return { ok: false, error: 'Artifact not found' };
    }
    dbInstance.prepare('UPDATE artifacts SET status = ?, updated_at = ? WHERE id = ?')
        .run('deleted', now(), id);
    return { ok: true };
}
// ── Create from Training Job ─────────────────────────────────────────────────
async function createArtifactFromTraining(trainingJobId) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    // Try to get experiment by task_id (experiments.task_id == trainingJobId)
    const experiment = dbInstance.prepare('SELECT * FROM experiments WHERE task_id = ? OR id = ? LIMIT 1').get(trainingJobId, trainingJobId);
    const id = generateId();
    const nowStr = now();
    let name = 'Training Artifact';
    let sourceType = 'training';
    let modelFamily = '';
    let framework = '';
    let version = '1.0';
    let path = '';
    let notes = `Auto-created from training job: ${trainingJobId}`;
    let trainingJobIdFinal = trainingJobId;
    if (experiment) {
        name = `${experiment.name || 'Training Artifact'} (Checkpoint)`;
        modelFamily = experiment.template_code || '';
        path = experiment.checkpoint_path || experiment.output_dir || '';
        notes = `Auto-created from training job ${trainingJobId} (experiment: ${experiment.id})`;
        trainingJobIdFinal = experiment.task_id || experiment.id;
    }
    dbInstance.prepare(`
    INSERT INTO artifacts (
      id, name, artifact_type, status, source_type,
      training_job_id, evaluation_id, dataset_id, parent_artifact_id,
      model_family, framework, format, version, path, file_size_bytes,
      metadata_json, metrics_snapshot_json, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, 'checkpoint', 'ready', sourceType, trainingJobIdFinal, '', '', '', modelFamily, framework, 'pytorch', version, path, null, '{}', experiment ? JSON.stringify({
        experiment_id: experiment.id,
        experiment_code: experiment.experiment_code,
        dataset_version: experiment.dataset_version,
    }) : '{}', notes, nowStr, nowStr);
    const created = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    return {
        ok: true,
        artifact: {
            ...created,
            metadata_json: parseJsonField(created.metadata_json, 'metadata_json'),
            metrics_snapshot_json: parseJsonField(created.metrics_snapshot_json, 'metrics_snapshot_json'),
        },
    };
}
// ── Create Evaluation from Artifact ─────────────────────────────────────────
async function createEvaluationFromArtifact(artifactId, extraData = {}) {
    const artifact = await getArtifactById(artifactId);
    if (!artifact.ok || !artifact.artifact) {
        return { ok: false, error: `Artifact ${artifactId} not found` };
    }
    const a = artifact.artifact;
    // If artifact has evaluation_id already pointing to an evaluation, use that
    if (a.evaluation_id) {
        return {
            ok: false,
            error: `Artifact is already linked to evaluation: ${a.evaluation_id}. Use that evaluation directly.`,
        };
    }
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    // Try to look up the experiment/training job for dataset_id
    let datasetId = a.dataset_id || '';
    let datasetName = '';
    if (a.training_job_id) {
        const exp = dbInstance.prepare('SELECT * FROM experiments WHERE task_id = ? OR id = ? LIMIT 1')
            .get(a.training_job_id, a.training_job_id);
        if (exp) {
            datasetId = exp.dataset_id || '';
            datasetName = exp.dataset_code || '';
        }
    }
    const id = generateId();
    const nowStr = now();
    // Determine evaluation type from artifact type or extraData
    const evalType = extraData.evaluation_type ||
        (a.artifact_type === 'model' || a.artifact_type === 'checkpoint' || a.artifact_type === 'weights' ? 'classification' : 'custom');
    dbInstance.prepare(`
    INSERT INTO evaluations (
      id, name, evaluation_type, status, model_name, artifact_name,
      dataset_name, dataset_id, training_job_id, notes,
      config_json, result_summary_json,
      created_at, updated_at, started_at, finished_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, `评估: ${a.name}`, evalType, 'pending', a.model_family || a.framework || a.artifact_type, a.name, datasetName, datasetId, a.training_job_id, `从产物 ${a.id} 快速创建 | ${a.notes || ''}`.trim(), '{}', '{}', nowStr, nowStr, null, null);
    // Link artifact → evaluation
    dbInstance.prepare('UPDATE artifacts SET evaluation_id = ?, updated_at = ? WHERE id = ?')
        .run(id, nowStr, artifactId);
    const created = dbInstance.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    return {
        ok: true,
        evaluation: {
            ...created,
            config_json: parseJsonField(created.config_json, 'config_json'),
            result_summary_json: parseJsonField(created.result_summary_json, 'result_summary_json'),
        },
        artifact_id: artifactId,
    };
}
