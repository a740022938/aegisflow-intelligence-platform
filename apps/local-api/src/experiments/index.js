"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExperiment = createExperiment;
exports.listExperiments = listExperiments;
exports.getExperimentById = getExperimentById;
exports.updateExperiment = updateExperiment;
exports.deleteExperiment = deleteExperiment;
exports.getExperimentEvaluations = getExperimentEvaluations;
exports.getExperimentLineage = getExperimentLineage;
exports.registerExperimentsRoutes = registerExperimentsRoutes;
const zod_1 = require("zod");
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
function genId() { return crypto.randomUUID(); }
function nowStr() { return new Date().toISOString(); }
function pj(val) { return typeof val === 'string' ? val : JSON.stringify(val || {}); }
function uj(val) { try {
    return JSON.parse(val);
}
catch {
    return {};
} }
const CreateSchema = zod_1.z.object({
    experiment_code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    dataset_id: zod_1.z.string().optional(),
    dataset_code: zod_1.z.string().optional(),
    dataset_version: zod_1.z.string().optional(),
    template_id: zod_1.z.string().optional(),
    template_code: zod_1.z.string().optional(),
    params_snapshot_json: zod_1.z.any().optional(),
});
/** 快照辅助：从外部表捞 dataset/template/version 信息，写入 experiment 的快照列 */
function snapshotSources(db, exp) {
    const snaps = {};
    if (exp.dataset_id) {
        const ds = db.prepare('SELECT id, dataset_code, version, dataset_type, description FROM datasets WHERE id = ?').get(exp.dataset_id);
        if (ds) {
            snaps.dataset_snapshot = JSON.stringify({ id: ds.id, dataset_code: ds.dataset_code, version: ds.version, dataset_type: ds.dataset_type, description: ds.description });
        }
    }
    if (exp.template_id) {
        const tm = db.prepare('SELECT id, code, name, version, status FROM templates WHERE id = ?').get(exp.template_id);
        if (tm) {
            snaps.template_snapshot = JSON.stringify({ id: tm.id, code: tm.code, name: tm.name, version: tm.version, status: tm.status });
        }
    }
    return snaps;
}
/** POST /api/experiments */
async function createExperiment(body) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const v = CreateSchema.safeParse(body);
    if (!v.success)
        return { ok: false, error: v.error.errors[0].message };
    const d = v.data;
    const ex = db.prepare('SELECT id FROM experiments WHERE experiment_code = ?').get(d.experiment_code);
    if (ex)
        return { ok: false, error: `Experiment code "${d.experiment_code}" already exists` };
    // 若传了 dataset_id 但没传 version，自动补
    let dataset_version = d.dataset_version || '';
    if (d.dataset_id && !dataset_version) {
        const ds = db.prepare('SELECT version FROM datasets WHERE id = ?').get(d.dataset_id);
        if (ds)
            dataset_version = ds.version || '';
    }
    // 若传了 template_id 但没传 version，自动补
    let template_version = '';
    if (d.template_id) {
        const tm = db.prepare('SELECT version FROM templates WHERE id = ?').get(d.template_id);
        if (tm)
            template_version = tm.version || '';
    }
    // 快照
    const params_snapshot = pj(d.params_snapshot_json || {});
    const id = genId();
    const t = nowStr();
    db.prepare(`
    INSERT INTO experiments (id, experiment_code, name, status, dataset_id, dataset_code, dataset_version,
      template_id, template_code, template_version, params_snapshot_json,
      config_json, metrics_json, notes,
      created_at, updated_at)
    VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, '{}', '{}', '', ?, ?)
  `).run(id, d.experiment_code, d.name, d.dataset_id || '', d.dataset_code || '', dataset_version, d.template_id || '', d.template_code || '', template_version, params_snapshot, t, t);
    const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
    return { ok: true, experiment: exp };
}
/** GET /api/experiments */
async function listExperiments(query) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const { keyword, status, dataset_code, template_code } = query;
    let sql = 'SELECT * FROM experiments WHERE 1=1';
    const params = [];
    if (keyword) {
        sql += ' AND (name LIKE ? OR experiment_code LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    if (dataset_code) {
        sql += ' AND dataset_code = ?';
        params.push(dataset_code);
    }
    if (template_code) {
        sql += ' AND template_code = ?';
        params.push(template_code);
    }
    sql += ' ORDER BY updated_at DESC';
    const rows = db.prepare(sql).all(...params);
    return { ok: true, experiments: rows, total: rows.length };
}
/** GET /api/experiments/:id */
async function getExperimentById(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
    if (!exp)
        return { ok: false, error: 'Experiment not found' };
    let dataset = null, template = null;
    if (exp.dataset_id)
        dataset = db.prepare('SELECT id, dataset_code, version, dataset_type, description FROM datasets WHERE id = ?').get(exp.dataset_id);
    if (exp.template_id)
        template = db.prepare('SELECT id, code, name, version, status FROM templates WHERE id = ?').get(exp.template_id);
    return {
        ok: true,
        experiment: exp,
        dataset,
        template,
        params_snapshot: uj(exp.params_snapshot_json),
    };
}
/** PUT /api/experiments/:id */
async function updateExperiment(id, body) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
    if (!exp)
        return { ok: false, error: 'Experiment not found' };
    const allowed = ['name', 'status', 'dataset_id', 'dataset_code', 'dataset_version',
        'template_id', 'template_code', 'template_version', 'params_snapshot_json',
        'config_json', 'metrics_json', 'notes', 'checkpoint_path', 'report_path'];
    const fields = [], vals = [];
    for (const k of allowed) {
        if (body[k] !== undefined) {
            fields.push(`${k} = ?`);
            vals.push(k.endsWith('_json') ? pj(body[k]) : body[k]);
        }
    }
    if (!fields.length)
        return { ok: true, experiment: exp };
    fields.push('updated_at = ?');
    vals.push(nowStr());
    vals.push(id);
    db.prepare(`UPDATE experiments SET ${fields.join(',')} WHERE id = ?`).run(...vals);
    const updated = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
    return { ok: true, experiment: updated };
}
/** DELETE /api/experiments/:id */
async function deleteExperiment(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    if (!db.prepare('SELECT id FROM experiments WHERE id = ?').get(id))
        return { ok: false, error: 'Not found' };
    db.prepare('DELETE FROM experiments WHERE id = ?').run(id);
    return { ok: true };
}
/** GET /api/experiments/:id/evaluations */
async function getExperimentEvaluations(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const exp = db.prepare('SELECT id FROM experiments WHERE id = ?').get(id);
    if (!exp)
        return { ok: false, error: 'Experiment not found' };
    // evaluations 通过 experiment_id 直接关联，或通过 training_job_id 关联
    const evals = db.prepare("SELECT * FROM evaluations WHERE experiment_id = ? ORDER BY created_at DESC").all(id);
    return { ok: true, experiment_id: id, evaluations: evals, total: evals.length };
}
/** GET /api/experiments/:id/lineage */
async function getExperimentLineage(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(id);
    if (!exp)
        return { ok: false, error: 'Experiment not found' };
    // Upstream: dataset + template
    let dataset = null, template = null;
    if (exp.dataset_id)
        dataset = db.prepare('SELECT id, dataset_code, version, dataset_type, sample_count, description FROM datasets WHERE id = ?').get(exp.dataset_id);
    if (exp.template_id)
        template = db.prepare('SELECT id, code, name, version, status, description FROM templates WHERE id = ?').get(exp.template_id);
    // Downstream: evaluations + artifacts + runs
    const evaluations = db.prepare("SELECT * FROM evaluations WHERE experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);
    const artifacts = db.prepare("SELECT * FROM artifacts WHERE experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);
    const runs = db.prepare("SELECT * FROM runs WHERE source_type = 'experiment' AND source_id = ? ORDER BY created_at DESC LIMIT 50").all(id);
    // Models via source_experiment_id
    const models = db.prepare("SELECT * FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 50").all(id);
    return {
        ok: true,
        experiment: exp,
        upstream: { dataset, template },
        downstream: { evaluations, artifacts, runs, models },
        params_snapshot: uj(exp.params_snapshot_json),
    };
}
// ── Route registration ───────────────────────────────────────────────────────
async function registerExperimentsRoutes(app) {
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
}
