"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = getDashboardSummary;
exports.getRecentActivity = getRecentActivity;
exports.getRelatedArtifacts = getRelatedArtifacts;
exports.getRelatedEvaluations = getRelatedEvaluations;
exports.getRelatedDeployments = getRelatedDeployments;
exports.getSourceTraining = getSourceTraining;
exports.getSourceArtifact = getSourceArtifact;
exports.getArtifactByIdSimple = getArtifactByIdSimple;
exports.getDeploymentRelations = getDeploymentRelations;
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
function now() { return new Date().toISOString(); }
// ── Summary ──────────────────────────────────────────────────────────────────
async function getDashboardSummary() {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const count = (table, where = '1=1') => {
        try {
            return db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE ${where}`).get()?.c ?? 0;
        }
        catch {
            return 0;
        }
    };
    return {
        ok: true,
        tasks_total: count('tasks'),
        templates_total: count('templates'),
        datasets_total: count('datasets'),
        experiments_total: count('experiments'),
        artifacts_total: count('artifacts'),
        evaluations_total: count('evaluations'),
        deployments_total: count('deployments'),
        // Status snapshots
        running_tasks: count('tasks', "status = 'running'"),
        running_experiments: count('experiments', "status = 'running'"),
        queued_experiments: count('experiments', "status = 'queued'"),
        failed_experiments: count('experiments', "status = 'failed'"),
        ready_artifacts: count('artifacts', "status = 'ready'"),
        failed_artifacts: count('artifacts', "status = 'failed'"),
        completed_evaluations: count('evaluations', "status = 'completed'"),
        failed_evaluations: count('evaluations', "status = 'failed'"),
        running_deployments: count('deployments', "status = 'running'"),
        // Dataset pipeline stats
        pipeline_runs_total: count('dataset_pipeline_runs'),
        pipeline_runs_success: count('dataset_pipeline_runs', "status = 'success'"),
        pipeline_runs_running: count('dataset_pipeline_runs', "status = 'running'"),
        pipeline_runs_failed: count('dataset_pipeline_runs', "status = 'failed'"),
        dataset_splits_total: count('dataset_splits'),
        stopped_deployments: count('deployments', "status = 'stopped'"),
        healthy_deployments: count('deployments', "health_status = 'healthy'"),
        unhealthy_deployments: count('deployments', "health_status = 'unhealthy'"),
        // Runs summary
        runs_total: count('runs'),
        queued_runs: count('runs', "status = 'queued'"),
        running_runs: count('runs', "status = 'running'"),
        success_runs: count('runs', "status = 'success'"),
        failed_runs: count('runs', "status = 'failed'"),
        cancelled_runs: count('runs', "status = 'cancelled'"),
    };
}
async function getRecentActivity(limit = 30) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const rows = [];
    const push = (type, id, name, ts, action = 'created') => rows.push({ type, entity_id: id, entity_name: name, created_at: ts, action });
    const safe = (table, cols, where, type, actionMap = {}) => {
        try {
            const q = `SELECT ${cols} FROM ${table} WHERE ${where} ORDER BY updated_at DESC LIMIT ${limit}`;
            const r = db.prepare(q).all();
            r.forEach(row => {
                const a = actionMap[row.status] || 'created';
                push(type, row.id, row.name || row.title || row.experiment_name || row.deployment_name || type, row.updated_at || row.created_at, a);
            });
        }
        catch { }
    };
    safe('experiments', 'id, experiment_name as name, status, updated_at', "status != 'deleted'", 'experiment', {
        running: 'started', completed: 'completed', failed: 'failed', cancelled: 'cancelled',
    });
    safe('artifacts', 'id, name, status, updated_at', "status != 'deleted'", 'artifact', {
        ready: 'completed', failed: 'failed',
    });
    safe('evaluations', 'id, title, status, updated_at', "status != 'deleted'", 'evaluation', {
        completed: 'completed', failed: 'failed',
    });
    safe('deployments', 'id, name, status, updated_at', "status != 'deleted'", 'deployment', {
        running: 'started', stopped: 'stopped', failed: 'failed',
    });
    safe('tasks', 'id, title, status, updated_at', "status != 'deleted'", 'task', {
        running: 'started', completed: 'completed', failed: 'failed',
    });
    safe('runs', 'id, name, status, updated_at', "1=1", 'run', {
        running: 'started', success: 'completed', failed: 'failed', cancelled: 'cancelled',
    });
    // Deduplicate and sort by time descending
    const seen = new Set();
    const deduped = rows.filter(r => {
        const key = r.type + ':' + r.entity_id;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
    deduped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { ok: true, activities: deduped.slice(0, limit) };
}
// ── Enhanced detail helpers (called by index.ts) ─────────────────────────────
// Get related artifacts for an experiment
function getRelatedArtifacts(experimentId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    try {
        // artifacts table has 'path' not 'model_path'
        return db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE training_job_id = ? ORDER BY created_at DESC LIMIT 10').all(experimentId);
    }
    catch {
        return [];
    }
}
// Get related evaluations for an artifact (evaluations table has artifact_name, not artifact_id)
function getRelatedEvaluations(artifactId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    try {
        // First look up the artifact name
        const art = db.prepare('SELECT name FROM artifacts WHERE id = ?').get(artifactId);
        if (!art?.name)
            return [];
        return db.prepare('SELECT id, name as title, status, evaluation_type, created_at FROM evaluations WHERE artifact_name = ? ORDER BY created_at DESC LIMIT 10').all(art.name);
    }
    catch {
        return [];
    }
}
// Get related deployments for an artifact
function getRelatedDeployments(artifactId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    try {
        return db.prepare('SELECT id, name, deployment_type, status, health_status, host, port, created_at FROM deployments WHERE artifact_id = ? ORDER BY created_at DESC LIMIT 10').all(artifactId);
    }
    catch {
        return [];
    }
}
// Get source training for an artifact
function getSourceTraining(experimentId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    try {
        // experiments table has 'name' column, not 'experiment_name'
        const row = db.prepare('SELECT id, name, status, created_at FROM experiments WHERE id = ?').get(experimentId);
        return row || null;
    }
    catch {
        return null;
    }
}
// Get source artifact for an evaluation (artifactId = artifacts.id)
function getSourceArtifact(artifactId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    try {
        // artifacts table has 'path' not 'model_path'
        const row = db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE id = ?').get(artifactId);
        return row || null;
    }
    catch {
        return null;
    }
}
// Get artifact by ID (used by deployment relations)
function getArtifactByIdSimple(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    try {
        // artifacts table has 'path' not 'model_path'
        const row = db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE id = ?').get(id);
        return row || null;
    }
    catch {
        return null;
    }
}
// Get source artifact/evaluation/training for a deployment
function getDeploymentRelations(deploymentId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    let artifact = null, evaluation = null, training = null;
    try {
        const row = db.prepare('SELECT artifact_id, training_job_id, evaluation_id FROM deployments WHERE id = ?').get(deploymentId);
        if (!row)
            return { artifact: null, evaluation: null, training: null };
        if (row.artifact_id) {
            try {
                artifact = db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE id = ?').get(row.artifact_id);
            }
            catch { }
        }
        if (row.evaluation_id) {
            try {
                evaluation = db.prepare('SELECT id, name as title, status, evaluation_type, created_at FROM evaluations WHERE id = ?').get(row.evaluation_id);
            }
            catch { }
        }
        if (row.training_job_id) {
            // experiments table has 'name' column, not 'experiment_name'
            try {
                training = db.prepare('SELECT id, name, status, created_at FROM experiments WHERE id = ?').get(row.training_job_id);
            }
            catch { }
        }
        return { artifact, evaluation, training };
    }
    catch {
        return { artifact: null, evaluation: null, training: null };
    }
}
