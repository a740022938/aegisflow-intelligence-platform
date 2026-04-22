"use strict";
// v1.8.0 Workflow Templates & Job Orchestration
// apps/local-api/src/workflow/index.ts
// v2.3.0: Resume / Cancel / Retry with state machine & audit
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWorkflowJob = runWorkflowJob;
exports.createWorkflowJob = createWorkflowJob;
exports.listWorkflowJobs = listWorkflowJobs;
exports.getWorkflowJobById = getWorkflowJobById;
exports.getWorkflowJobSteps = getWorkflowJobSteps;
exports.getWorkflowJobLogs = getWorkflowJobLogs;
exports.getBuiltinTemplates = getBuiltinTemplates;
exports.registerWorkflowRoutes = registerWorkflowRoutes;
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
const crypto_1 = require("crypto");
const index_js_1 = require("../approvals/index.js");
const index_js_2 = require("../audit/index.js");
// ── State Machine ─────────────────────────────────────────────────────────────
const JOB_STATES = ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled'];
const JOB_TRANSITIONS = {
    resume: { paused: 'running' },
    cancel: { pending: 'cancelled', running: 'cancelled', paused: 'cancelled' },
    retry: { failed: 'running' },
    start: { pending: 'running' },
};
function validateTransition(action, currentStatus) {
    const allowed = JOB_TRANSITIONS[action];
    if (!allowed)
        return { ok: false, error: `Unknown action: ${action}` };
    const target = allowed[currentStatus];
    if (!target)
        return { ok: false, error: `Cannot ${action} job in status '${currentStatus}'` };
    return { ok: true, target };
}
const STEP_REQUIRED_INPUTS = {
    build_package: ['package_id'],
    publish_package: ['package_id'],
    deploy_revision: ['revision_id'],
    health_check: ['deployment_id'],
    rollback: ['rollback_point_id'],
    train_model: ['experiment_id', 'dataset_id', 'template_version'],
    evaluate_model: ['experiment_id', 'model_id', 'dataset_id'],
};
// ── Helpers ───────────────────────────────────────────────────────────────────
function now() {
    return new Date().toISOString();
}
function uuid() {
    return (0, crypto_1.randomUUID)();
}
function parseJsonField(raw, _field) {
    if (!raw)
        return null;
    if (typeof raw === 'object')
        return raw;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function normalizeWorkflowSteps(raw) {
    const parsed = parseJsonField(raw, 'workflow_steps_json');
    if (!Array.isArray(parsed) || parsed.length === 0) {
        return { ok: false, steps: [], error: 'workflow_steps_json must be a non-empty array' };
    }
    const normalized = [];
    for (let i = 0; i < parsed.length; i++) {
        const step = parsed[i] || {};
        const stepKey = typeof step.step_key === 'string' ? step.step_key.trim() : '';
        if (!stepKey)
            return { ok: false, steps: [], error: `step ${i + 1} missing step_key` };
        normalized.push({
            step_key: stepKey,
            step_name: typeof step.step_name === 'string' && step.step_name.trim() ? step.step_name.trim() : stepKey,
            step_order: Number.isFinite(Number(step.step_order)) ? Number(step.step_order) : i + 1,
            require_approval: Boolean(step.require_approval),
            approval_policy: typeof step.approval_policy === 'string' ? step.approval_policy.trim() : '',
            approval_timeout: Number.isFinite(Number(step.approval_timeout)) ? Number(step.approval_timeout) : 0,
            params: step.params && typeof step.params === 'object' ? step.params : {},
        });
    }
    normalized.sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
    return { ok: true, steps: normalized };
}
function parseObjectField(raw) {
    const parsed = parseJsonField(raw, 'json');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
        return parsed;
    return {};
}
function isMissingValue(v) {
    if (v === null || v === undefined)
        return true;
    if (typeof v === 'string')
        return v.trim().length === 0;
    return false;
}
function collectRequiredKeys(steps, schemaRequired) {
    const out = new Set();
    for (const s of steps) {
        for (const key of (STEP_REQUIRED_INPUTS[s.step_key] || []))
            out.add(key);
    }
    for (const key of schemaRequired || [])
        out.add(key);
    return Array.from(out);
}
function validateJobInput(resolvedInput, requiredKeys) {
    const missing = requiredKeys.filter(k => isMissingValue(resolvedInput[k]));
    if (missing.length > 0) {
        return { ok: false, error: `Missing required input fields: ${missing.join(', ')}` };
    }
    const idKeys = ['package_id', 'deployment_id', 'revision_id', 'rollback_point_id'];
    const invalidType = idKeys.filter((k) => resolvedInput[k] !== undefined && resolvedInput[k] !== null && typeof resolvedInput[k] !== 'string');
    if (invalidType.length > 0) {
        return { ok: false, error: `Invalid id field type (expect string): ${invalidType.join(', ')}` };
    }
    return { ok: true };
}
function seedTemplateIfMissingOrEmpty(db, seed) {
    const existing = db.prepare(`
    SELECT id, workflow_steps_json
    FROM templates
    WHERE id = ?
  `).get(seed.id);
    if (!existing) {
        db.prepare(`
      INSERT INTO templates (
        id, code, name, category, version, status, description,
        definition_json, input_schema_json, default_input_json, workflow_steps_json,
        is_builtin, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(seed.id, seed.code, seed.name, seed.category || 'deployment', seed.version || '2.0.0', seed.status || 'active', seed.description || null, JSON.stringify(seed.definition_json || {}), JSON.stringify(seed.input_schema_json || {}), JSON.stringify(seed.default_input_json || {}), JSON.stringify(seed.workflow_steps_json || []), 1, now(), now());
        return;
    }
    const currentSteps = parseJsonField(existing.workflow_steps_json, 'workflow_steps_json');
    if (!Array.isArray(currentSteps) || currentSteps.length === 0) {
        db.prepare(`
      UPDATE templates
      SET code = ?, name = ?, category = ?, version = ?, status = ?, description = ?,
          definition_json = ?, input_schema_json = ?, default_input_json = ?, workflow_steps_json = ?,
          is_builtin = 1, updated_at = ?
      WHERE id = ?
    `).run(seed.code, seed.name, seed.category || 'deployment', seed.version || '2.0.0', seed.status || 'active', seed.description || null, JSON.stringify(seed.definition_json || {}), JSON.stringify(seed.input_schema_json || {}), JSON.stringify(seed.default_input_json || {}), JSON.stringify(seed.workflow_steps_json || []), now(), seed.id);
    }
}
function seedWorkflowFactoryTemplates() {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const seeds = [
        {
            id: 'tpl-factory-release',
            code: 'factory_release_full_chain',
            name: 'Factory Release Full Chain',
            category: 'deployment',
            version: '2.0.0',
            status: 'active',
            description: 'Build -> Publish -> Deploy -> Health with approval gate before deploy',
            workflow_steps_json: [
                { step_key: 'build_package', step_name: 'Build Package', step_order: 1, require_approval: false },
                { step_key: 'publish_package', step_name: 'Publish Package', step_order: 2, require_approval: false },
                { step_key: 'deploy_revision', step_name: 'Deploy Revision', step_order: 3, require_approval: true },
                { step_key: 'health_check', step_name: 'Health Check', step_order: 4, require_approval: false },
            ],
            input_schema_json: {
                type: 'object',
                required: ['package_id', 'deployment_id'],
                properties: {
                    package_id: { type: 'string', title: 'Package ID' },
                    deployment_id: { type: 'string', title: 'Deployment ID' },
                    revision_id: { type: 'string', title: 'Revision ID' },
                },
            },
            default_input_json: {
                package_id: '',
                deployment_id: '',
                revision_id: '',
            },
        },
        {
            id: 'tpl-factory-deploy-health',
            code: 'factory_deploy_health_gate',
            name: 'Factory Deploy + Health',
            category: 'deployment',
            version: '2.0.0',
            status: 'active',
            description: 'Deploy revision then run health check (approval before deploy)',
            workflow_steps_json: [
                { step_key: 'deploy_revision', step_name: 'Deploy Revision', step_order: 1, require_approval: true },
                { step_key: 'health_check', step_name: 'Health Check', step_order: 2, require_approval: false },
            ],
            input_schema_json: {
                type: 'object',
                required: ['revision_id', 'deployment_id'],
                properties: {
                    revision_id: { type: 'string', title: 'Revision ID' },
                    deployment_id: { type: 'string', title: 'Deployment ID' },
                },
            },
            default_input_json: {
                revision_id: '',
                deployment_id: '',
            },
        },
        {
            id: 'tpl-factory-recovery',
            code: 'factory_recovery_rollback_health',
            name: 'Factory Recovery Rollback',
            category: 'deployment',
            version: '2.0.0',
            status: 'active',
            description: 'Rollback to rollback point and verify health',
            workflow_steps_json: [
                { step_key: 'rollback', step_name: 'Rollback', step_order: 1, require_approval: true },
                { step_key: 'health_check', step_name: 'Health Check', step_order: 2, require_approval: false },
            ],
            input_schema_json: {
                type: 'object',
                required: ['rollback_point_id', 'deployment_id'],
                properties: {
                    rollback_point_id: { type: 'string', title: 'Rollback Point ID' },
                    deployment_id: { type: 'string', title: 'Deployment ID' },
                },
            },
            default_input_json: {
                rollback_point_id: '',
                deployment_id: '',
            },
        },
    ];
    for (const s of seeds)
        seedTemplateIfMissingOrEmpty(db, s);
}
async function logJob(db, jobId, stepId, level, message) {
    try {
        db.prepare(`INSERT INTO job_logs (id, job_id, step_id, level, message, created_at) VALUES (?, ?, ?, ?, ?, ?)`).run(uuid(), jobId, stepId || null, level, message, now());
    }
    catch { /* silent - job_logs table may not exist yet */ }
}
// ── Step Executors ────────────────────────────────────────────────────────────
async function executeBuildPackage(step) {
    try {
        const { buildPackage } = await import('../packages/index.js');
        const pkgId = step.input_json ? JSON.parse(step.input_json).package_id : null;
        if (!pkgId)
            return { ok: false, error: 'package_id required in step input' };
        return await buildPackage(pkgId);
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
async function executePublishPackage(step) {
    try {
        const { publishPackage } = await import('../packages/index.js');
        const pkgId = step.input_json ? JSON.parse(step.input_json).package_id : null;
        if (!pkgId)
            return { ok: false, error: 'package_id required in step input' };
        return await publishPackage(pkgId);
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
async function executeDeployRevision(step) {
    try {
        const { deployRevision } = await import('../deployment-revisions/index.js');
        const revId = step.input_json ? JSON.parse(step.input_json).revision_id : null;
        if (!revId)
            return { ok: false, error: 'revision_id required in step input' };
        return await deployRevision(revId);
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
async function executeHealthCheck(step) {
    try {
        const { getDeploymentHealth } = await import('../deployments/index.js');
        const depId = step.input_json ? JSON.parse(step.input_json).deployment_id : null;
        if (!depId)
            return { ok: false, error: 'deployment_id required in step input' };
        return await getDeploymentHealth(depId);
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
async function executeRollback(step) {
    try {
        const { executeRollback } = await import('../rollback-points/index.js');
        const rpId = step.input_json ? JSON.parse(step.input_json).rollback_point_id : null;
        if (!rpId)
            return { ok: false, error: 'rollback_point_id required in step input' };
        return await executeRollback(rpId);
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
// ── Training Step Executors (v2.8.0) ─────────────────────────────────────────
async function executeTrainModel(step) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const rawInput = parseJsonField(step.input_json, 'input_json') || {};
    const { experiment_id, dataset_id, template_version } = rawInput;
    // ── v2.8.0 Lineage Validation ──────────────────────────────────────────────
    const validationErrors = [];
    if (!experiment_id)
        validationErrors.push('experiment_id');
    if (!dataset_id)
        validationErrors.push('dataset_id');
    if (!template_version)
        validationErrors.push('template_version');
    if (validationErrors.length > 0) {
        const errMsg = `[Lineage Validation Failed] Missing required source fields: ${validationErrors.join(', ')}. Training job cannot start without complete lineage.`;
        // Audit
        try {
            db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'workflow', 'lineage_validation_failed', ?, 'failure', ?, ?)`)
                .run(uuid(), step.job_id, JSON.stringify({ step_id: step.id, step_key: step.step_key, missing_fields: validationErrors }), now());
        }
        catch (_) { }
        await logJob(db, step.job_id, step.id, 'error', errMsg);
        return { ok: false, output: null, error: errMsg };
    }
    // Verify experiment exists
    const exp = db.prepare('SELECT id, status, name FROM experiments WHERE id = ?').get(experiment_id);
    if (!exp) {
        const err = `[Lineage Validation Failed] experiment_id="${experiment_id}" not found. Cannot start training.`;
        try {
            db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'workflow', 'lineage_validation_failed', ?, 'failure', ?, ?)`)
                .run(uuid(), step.job_id, JSON.stringify({ step_id: step.id, reason: 'experiment_not_found', experiment_id }), now());
        }
        catch (_) { }
        await logJob(db, step.job_id, step.id, 'error', err);
        return { ok: false, output: null, error: err };
    }
    // Verify dataset exists
    const ds = db.prepare('SELECT id, version FROM datasets WHERE id = ?').get(dataset_id);
    if (!ds) {
        const err = `[Lineage Validation Failed] dataset_id="${dataset_id}" not found. Cannot start training.`;
        try {
            db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'workflow', 'lineage_validation_failed', ?, 'failure', ?, ?)`)
                .run(uuid(), step.job_id, JSON.stringify({ step_id: step.id, reason: 'dataset_not_found', dataset_id }), now());
        }
        catch (_) { }
        await logJob(db, step.job_id, step.id, 'error', err);
        return { ok: false, output: null, error: err };
    }
    // ── v2.8.0: Update experiment status → running ────────────────────────────
    if (exp.status !== 'running') {
        db.prepare('UPDATE experiments SET status = ?, updated_at = ? WHERE id = ?')
            .run('running', now(), experiment_id);
        try {
            db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'experiment', 'experiment_status_updated', ?, 'success', ?, ?)`)
                .run(uuid(), experiment_id, JSON.stringify({ from_status: exp.status, to_status: 'running', job_id: step.job_id, step_id: step.id }), now());
        }
        catch (_) { }
        await logJob(db, step.job_id, step.id, 'info', `Lineage OK. Experiment "${exp.name}" (${experiment_id}) status updated: ${exp.status} → running`);
    }
    // Audit: training started
    try {
        db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'workflow', 'training_started', ?, 'success', ?, ?)`)
            .run(uuid(), experiment_id, JSON.stringify({ job_id: step.job_id, step_id: step.id, experiment_id, dataset_id, template_version }), now());
    }
    catch (_) { }
    // ── Mock training: simulate 2-3 seconds of training ───────────────────────
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
    const epochCount = rawInput.epochs || 10;
    const loss = +(0.5 + Math.random() * 0.4).toFixed(4);
    const checkpoint_path = `/checkpoints/exp_${experiment_id}/epoch_${epochCount}.pt`;
    const output = { experiment_id, dataset_id, template_version, epochs: epochCount, final_loss: loss, checkpoint_path };
    try {
        db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'workflow', 'training_completed', ?, 'success', ?, ?)`)
            .run(uuid(), experiment_id, JSON.stringify({ job_id: step.job_id, step_id: step.id, experiment_id, dataset_id, epochs: epochCount, final_loss: loss }), now());
    }
    catch (_) { }
    return { ok: true, output };
}
async function executeEvaluateModel(step) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const rawInput = parseJsonField(step.input_json, 'input_json') || {};
    const { experiment_id, model_id, dataset_id } = rawInput;
    if (!experiment_id || !model_id || !dataset_id) {
        const err = `[Lineage Validation Failed] Missing required source fields for evaluation: ${[
            !experiment_id ? 'experiment_id' : '', !model_id ? 'model_id' : '', !dataset_id ? 'dataset_id' : ''
        ].filter(Boolean).join(', ')}. Cannot start evaluation.`;
        try {
            db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'workflow', 'lineage_validation_failed', ?, 'failure', ?, ?)`)
                .run(uuid(), step.job_id, JSON.stringify({ step_id: step.id, step_key: step.step_key, missing_fields: [experiment_id, model_id, dataset_id].filter(Boolean) }), now());
        }
        catch (_) { }
        await logJob(db, step.job_id, step.id, 'error', err);
        return { ok: false, output: null, error: err };
    }
    // Mock evaluation: 1-2 seconds
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    const output = { experiment_id, model_id, dataset_id, eval_status: 'completed' };
    // Audit
    try {
        db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'workflow', 'evaluation_completed', ?, 'success', ?, ?)`)
            .run(uuid(), experiment_id, JSON.stringify({ job_id: step.job_id, step_id: step.id, experiment_id, model_id, dataset_id }), now());
    }
    catch (_) { }
    return { ok: true, output };
}
const STEP_EXECUTORS = {
    build_package: executeBuildPackage,
    publish_package: executePublishPackage,
    deploy_revision: executeDeployRevision,
    health_check: executeHealthCheck,
    rollback: executeRollback,
    train_model: executeTrainModel,
    evaluate_model: executeEvaluateModel,
};
// ── Step Runner ───────────────────────────────────────────────────────────────
async function runStep(db, step) {
    const start = Date.now();
    const nowStr = now();
    db.prepare(`UPDATE job_steps SET status = 'running', started_at = ?, updated_at = ? WHERE id = ?`)
        .run(nowStr, nowStr, step.id);
    // eslint-disable-next-line no-console
    console.error(`[runStep] step=${step.step_key} id=${step.id} started`);
    try {
        require('fs').appendFileSync('E:/AGI_Model_Factory/repo/apps/local-api/workflow-debug.log', `[${now()}] START step=${step.step_key} id=${step.id}\n`);
    }
    catch (e) { }
    const executor = STEP_EXECUTORS[step.step_key];
    if (!executor) {
        const errMsg = `Unknown step_key: ${step.step_key}`;
        db.prepare(`UPDATE job_steps SET status = 'failed', error_message = ?, finished_at = ?, duration_ms = ?, updated_at = ? WHERE id = ?`)
            .run(errMsg, nowStr, Date.now() - start, nowStr, step.id);
        return { ok: false, duration_ms: Date.now() - start, error_message: errMsg };
    }
    const endTime = Date.now();
    const duration_ms = endTime - start;
    const ts = now();
    try {
        try {
            require('fs').appendFileSync('workflow-err.log', `[${ts}] EXECUTOR_START step=${step.step_key}\n`);
        }
        catch (e2) { }
        const result = await executor(step);
        try {
            require('fs').appendFileSync('workflow-err.log', `[${now()}] EXECUTOR_DONE step=${step.step_key} ok=${result.ok}\n`);
        }
        catch (e2) { }
        if (result.ok !== true) {
            db.prepare(`UPDATE job_steps SET status = 'failed', output_json = ?, error_message = ?, finished_at = ?, duration_ms = ?, updated_at = ? WHERE id = ?`)
                .run(JSON.stringify(result), result.error || null, ts, duration_ms, ts, step.id);
            return { ok: false, duration_ms, error_message: result.error };
        }
        db.prepare(`UPDATE job_steps SET status = 'success', output_json = ?, finished_at = ?, duration_ms = ?, updated_at = ? WHERE id = ?`)
            .run(JSON.stringify(result), ts, duration_ms, ts, step.id);
        return { ok: true, duration_ms };
    }
    catch (err) {
        const errTs = now();
        try {
            require('fs').appendFileSync('workflow-err.log', `[${errTs}] RUNSTEP_ERR step=${step.step_key} id=${step.id} msg=${err.message}\n`);
        }
        catch (e2) { }
        db.prepare(`UPDATE job_steps SET status = 'failed', error_message = ?, finished_at = ?, duration_ms = ?, updated_at = ? WHERE id = ?`)
            .run(err.message || String(err), errTs, duration_ms, errTs, step.id);
        return { ok: false, duration_ms, error_message: err.message };
    }
}
// ── Workflow Runner ───────────────────────────────────────────────────────────
async function runWorkflowJob(jobId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const nowStr = now();
    const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(jobId);
    if (!job)
        return { ok: false };
    if (job.status !== 'pending' && job.status !== 'paused')
        return { ok: false };
    const steps = db.prepare('SELECT * FROM job_steps WHERE job_id = ? ORDER BY step_order').all(jobId);
    if (steps.length === 0) {
        db.prepare(`UPDATE workflow_jobs SET status = 'failed', error_message = ?, updated_at = ?, finished_at = ? WHERE id = ?`)
            .run('No steps defined', nowStr, nowStr, jobId);
        return { ok: false };
    }
    db.prepare(`UPDATE workflow_jobs SET status = 'running', updated_at = ? WHERE id = ?`).run(nowStr, jobId);
    await logJob(db, jobId, null, 'info', `Workflow started: ${job.name}`);
    let allSuccess = true;
    let stepIndex = job.current_step_index || 0;
    for (let i = stepIndex; i < steps.length; i++) {
        // v2.3.0→v2.4.0: cancel checkpoint — check cancel_requested (more responsive than status check)
        const freshJob = db.prepare('SELECT status, cancel_requested_at FROM workflow_jobs WHERE id = ?').get(jobId);
        if (freshJob && (freshJob.status === 'cancelled' || freshJob.cancel_requested_at)) {
            // v2.4.0: if cancel_requested but not yet cancelled, finalize the cancel here
            if (freshJob.cancel_requested_at && freshJob.status !== 'cancelled') {
                const cj = db.prepare('SELECT cancel_requested_by FROM workflow_jobs WHERE id = ?').get(jobId);
                db.prepare(`UPDATE workflow_jobs SET status = 'cancelled', cancelled_at = ?, cancelled_by = COALESCE(cancel_requested_by, 'system'), cancel_requested_at = NULL, cancel_requested_by = NULL, updated_at = ?, finished_at = ? WHERE id = ?`)
                    .run(now(), now(), now(), jobId);
                await logJob(db, jobId, null, 'warn', `Workflow cancelled at step ${i + 1} checkpoint (cancel_requested fulfilled)`);
                await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_cancel_checkpoint_hit', target: jobId, result: 'success', detail: { step_index: i, actor: cj?.cancel_requested_by } });
            }
            else {
                await logJob(db, jobId, null, 'warn', `Workflow cancelled at step ${i + 1} (cancel checkpoint)`);
            }
            return { ok: false };
        }
        const step = steps[i];
        const stepInput = parseJsonField(step.input_json, 'input_json') || {};
        if (stepInput.require_approval === true && stepInput.approved !== true) {
            // Resolve approval policy
            const policy = stepInput.approval_policy || 'manual';
            const timeoutSec = Number(stepInput.approval_timeout) || 0;
            if (policy === 'auto_approve') {
                // auto_approve: create approved approval, continue workflow
                const approvalResult = (0, index_js_1.createApproval)({
                    resource_type: 'workflow_job',
                    resource_id: jobId,
                    step_id: step.id,
                    step_name: step.step_name,
                    requested_by: 'system',
                    comment: `Auto-approved by policy for step "${step.step_name}"`,
                    policy_type: 'auto_approve',
                });
                if (approvalResult.ok) {
                    // Mark step as approved in input_json for forward compat
                    const nextInput = { ...stepInput, approved: true, approved_at: now(), approved_by: 'policy:auto_approve' };
                    db.prepare('UPDATE job_steps SET input_json = ?, updated_at = ? WHERE id = ?')
                        .run(JSON.stringify(nextInput), now(), step.id);
                    await logJob(db, jobId, step.id, 'info', `Step ${i + 1} auto-approved by policy: ${step.step_name}`);
                    // Continue to execute this step (don't return, fall through)
                }
                else {
                    await logJob(db, jobId, step.id, 'error', `Failed to create auto-approve for step ${i + 1}: ${approvalResult.error}`);
                    db.prepare(`UPDATE workflow_jobs SET status = 'paused', current_step_index = ?, updated_at = ? WHERE id = ?`)
                        .run(i, now(), jobId);
                    return { ok: false };
                }
            }
            else if (policy === 'auto_reject') {
                // auto_reject: create rejected approval, pause workflow (recoverable)
                const approvalResult = (0, index_js_1.createApproval)({
                    resource_type: 'workflow_job',
                    resource_id: jobId,
                    step_id: step.id,
                    step_name: step.step_name,
                    requested_by: 'system',
                    comment: `Auto-rejected by policy for step "${step.step_name}"`,
                    policy_type: 'auto_reject',
                });
                if (approvalResult.ok) {
                    await logJob(db, jobId, step.id, 'warn', `Step ${i + 1} auto-rejected by policy: ${step.step_name} (approval_id: ${approvalResult.approval?.id})`);
                }
                else {
                    await logJob(db, jobId, step.id, 'error', `Failed to create auto-reject for step ${i + 1}: ${approvalResult.error}`);
                }
                db.prepare(`UPDATE workflow_jobs SET status = 'paused', current_step_index = ?, updated_at = ? WHERE id = ?`)
                    .run(i, now(), jobId);
                return { ok: false };
            }
            else {
                // manual policy (default): create pending approval and pause
                const existingApproval = (0, index_js_1.findPendingApproval)('workflow_job', jobId, step.id);
                if (!existingApproval) {
                    const approvalResult = (0, index_js_1.createApproval)({
                        resource_type: 'workflow_job',
                        resource_id: jobId,
                        step_id: step.id,
                        step_name: step.step_name,
                        requested_by: 'system',
                        comment: `Approval required for step "${step.step_name}" in workflow "${job.name}"`,
                        policy_type: 'manual',
                        timeout_seconds: timeoutSec,
                    });
                    if (approvalResult.ok) {
                        await logJob(db, jobId, step.id, 'warn', `Approval required for step ${i + 1}: ${step.step_name} (approval_id: ${approvalResult.approval?.id})`);
                    }
                    else {
                        await logJob(db, jobId, step.id, 'error', `Failed to create approval for step ${i + 1}: ${approvalResult.error}`);
                    }
                }
                else {
                    await logJob(db, jobId, step.id, 'info', `Step ${i + 1} waiting for approval (approval_id: ${existingApproval.id})`);
                }
                db.prepare(`UPDATE workflow_jobs SET status = 'paused', current_step_index = ?, updated_at = ? WHERE id = ?`)
                    .run(i, now(), jobId);
                return { ok: false };
            }
        }
        await logJob(db, jobId, step.id, 'info', `Step ${i + 1}/${steps.length} started: ${step.step_name}`);
        const { ok, duration_ms, error_message } = await runStep(db, step);
        if (ok) {
            await logJob(db, jobId, step.id, 'info', `Step ${i + 1} succeeded (${duration_ms}ms)`);
            db.prepare(`UPDATE workflow_jobs SET current_step_index = ?, updated_at = ? WHERE id = ?`).run(i + 1, now(), jobId);
        }
        else {
            await logJob(db, jobId, step.id, 'error', `Step ${i + 1} failed: ${error_message || 'unknown error'}`);
            allSuccess = false;
            db.prepare(`UPDATE workflow_jobs SET status = 'failed', error_message = ?, updated_at = ?, finished_at = ? WHERE id = ?`)
                .run(`Step ${i + 1} (${step.step_name}) failed: ${error_message || 'unknown'}`, now(), now(), jobId);
            await logJob(db, jobId, null, 'error', `Workflow failed at step ${i + 1}: ${step.step_name}`);
            // ── v2.8.0: Update experiment status → failed ──────────────────────
            const failStep = steps[i];
            const failInp = parseJsonField(failStep.input_json, 'input_json') || {};
            const expIdFromFail = failInp.experiment_id;
            if (expIdFromFail) {
                const prevExp2 = db.prepare('SELECT status FROM experiments WHERE id = ?').get(expIdFromFail);
                if (prevExp2 && prevExp2.status !== 'failed') {
                    db.prepare('UPDATE experiments SET status = ?, updated_at = ? WHERE id = ?').run('failed', now(), expIdFromFail);
                    try {
                        db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'experiment', 'experiment_status_updated', ?, 'success', ?, ?)`)
                            .run(uuid(), expIdFromFail, JSON.stringify({ from_status: prevExp2.status, to_status: 'failed', job_id: jobId, failed_step: failStep.step_name }), now());
                    }
                    catch (_) { }
                    await logJob(db, jobId, failStep.id, 'warn', `Experiment ${expIdFromFail} status updated: ${prevExp2.status} → failed`);
                }
            }
            break;
        }
    }
    if (allSuccess) {
        const steps2 = db.prepare('SELECT * FROM job_steps WHERE job_id = ? ORDER BY step_order').all(jobId);
        const totalMs = steps2.reduce((s, s2) => s + (Number(s2.duration_ms) || 0), 0);
        const summary = {
            job_id: jobId,
            completed_at: now(),
            steps_completed: steps2.length,
            total_duration_ms: totalMs,
        };
        db.prepare(`UPDATE workflow_jobs SET status = 'completed', output_summary_json = ?, updated_at = ?, finished_at = ? WHERE id = ?`)
            .run(JSON.stringify(summary), now(), now(), jobId);
        await logJob(db, jobId, null, 'info', `Workflow completed successfully`);
        // ── v2.8.0: Update experiment status → completed ────────────────────────
        // Find experiment_id from train_model step input
        const trainStep = steps2.find((s2) => {
            try {
                const inp = JSON.parse(s2.input_json || '{}');
                return inp.step_key === 'train_model' || s2.step_key === 'train_model';
            }
            catch {
                return false;
            }
        });
        if (trainStep) {
            const inp = parseJsonField(trainStep.input_json, 'input_json') || {};
            const expId = inp.experiment_id;
            if (expId) {
                const prevExp = db.prepare('SELECT status FROM experiments WHERE id = ?').get(expId);
                if (prevExp && prevExp.status !== 'completed') {
                    db.prepare('UPDATE experiments SET status = ?, updated_at = ? WHERE id = ?').run('completed', now(), expId);
                    try {
                        db.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at) VALUES (?, 'experiment', 'experiment_status_updated', ?, 'success', ?, ?)`)
                            .run(uuid(), expId, JSON.stringify({ from_status: prevExp.status, to_status: 'completed', job_id: jobId }), now());
                    }
                    catch (_) { }
                    await logJob(db, jobId, null, 'info', `Experiment ${expId} status updated: ${prevExp.status} → completed`);
                }
            }
        }
    }
    return { ok: allSuccess };
}
// ── CRUD ──────────────────────────────────────────────────────────────────────
function createWorkflowJob(params) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const id = uuid();
    const nowStr = now();
    try {
        let resolvedSteps = [];
        let resolvedInput = { ...(params.input || {}) };
        let schemaRequired = [];
        if (params.template_id) {
            const template = db.prepare(`
        SELECT id, name, version, status, workflow_steps_json, input_schema_json, default_input_json
        FROM templates
        WHERE id = ?
      `).get(params.template_id);
            if (!template)
                return { ok: false, error: `Template ${params.template_id} not found` };
            if ((template.status || '').toLowerCase() !== 'active') {
                return { ok: false, error: `Template ${params.template_id} is ${template.status || 'inactive'}, expected active` };
            }
            const normalized = normalizeWorkflowSteps(template.workflow_steps_json);
            if (!normalized.ok) {
                return { ok: false, error: `Template ${params.template_id} invalid workflow steps: ${normalized.error}` };
            }
            resolvedSteps = normalized.steps;
            const templateDefaults = parseObjectField(template.default_input_json);
            const schema = parseObjectField(template.input_schema_json);
            schemaRequired = Array.isArray(schema.required) ? schema.required.filter((x) => typeof x === 'string') : [];
            resolvedInput = { ...templateDefaults, ...(params.input || {}) };
        }
        else {
            const normalized = normalizeWorkflowSteps(params.steps || []);
            if (!normalized.ok)
                return { ok: false, error: normalized.error };
            resolvedSteps = normalized.steps;
        }
        const requiredKeys = collectRequiredKeys(resolvedSteps, schemaRequired);
        const inputValidation = validateJobInput(resolvedInput, requiredKeys);
        if (!inputValidation.ok)
            return { ok: false, error: inputValidation.error };
        db.prepare(`
      INSERT INTO workflow_jobs (id, name, description, template_id, status, current_step_index,
        input_json, output_summary_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', 0, ?, ?, ?, ?)
    `).run(id, params.name, params.description || null, params.template_id || null, JSON.stringify(resolvedInput), JSON.stringify({}), nowStr, nowStr);
        resolvedSteps.forEach((s, idx) => {
            const stepId = uuid();
            db.prepare(`
        INSERT INTO job_steps (id, job_id, step_order, step_key, step_name, status,
          input_json, retry_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, 0, ?, ?)
      `).run(stepId, id, Number.isFinite(Number(s.step_order)) ? Number(s.step_order) : idx + 1, s.step_key, s.step_name || s.step_key, JSON.stringify({
                ...resolvedInput,
                ...(s.params || {}),
                require_approval: Boolean(s.require_approval),
                approval_policy: s.approval_policy || 'manual',
                approval_timeout: Number(s.approval_timeout) || 0,
                approved: s.require_approval ? false : true,
            }), nowStr, nowStr);
        });
        const jobResult = getWorkflowJobById(id);
        if (!jobResult.ok)
            return { ok: false, error: jobResult.error };
        const job = jobResult.job;
        return { ok: true, job };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
function listWorkflowJobs(query) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const limit = Math.min(query.limit || 50, 200);
    const offset = query.offset || 0;
    const conditions = [];
    const params = [];
    if (query.status) {
        conditions.push('wj.status = ?');
        params.push(query.status);
    }
    if (query.template_id) {
        conditions.push('wj.template_id = ?');
        params.push(query.template_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) as n FROM workflow_jobs wj ${where}`).get(...params)?.n || 0;
    const jobs = db.prepare(`
    SELECT wj.*, t.name as template_name, t.version as template_version,
      (SELECT COUNT(*) FROM job_steps WHERE job_id = wj.id) as total_steps,
      (SELECT COUNT(*) FROM job_steps WHERE job_id = wj.id AND status = 'success') as completed_steps
    FROM workflow_jobs wj
    LEFT JOIN templates t ON wj.template_id = t.id
    ${where}
    ORDER BY wj.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
    return {
        ok: true,
        jobs: jobs.map((j) => ({
            ...j,
            input_json: parseJsonField(j.input_json, 'input_json'),
            output_summary_json: parseJsonField(j.output_summary_json, 'output_summary_json'),
        })),
        total,
    };
}
function getWorkflowJobById(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const job = db.prepare(`SELECT wj.*, t.name as template_name, t.version as template_version
     FROM workflow_jobs wj LEFT JOIN templates t ON wj.template_id = t.id WHERE wj.id = ?`).get(id);
    if (!job)
        return { ok: false, error: `Job ${id} not found` };
    const steps = db.prepare('SELECT * FROM job_steps WHERE job_id = ? ORDER BY step_order').all(id)
        .map((s) => ({
        ...s,
        input_json: parseJsonField(s.input_json, 'input_json'),
        output_json: parseJsonField(s.output_json, 'output_json'),
    }));
    return {
        ok: true,
        job: {
            ...job,
            input_json: parseJsonField(job.input_json, 'input_json'),
            output_summary_json: parseJsonField(job.output_summary_json, 'output_summary_json'),
            steps,
        }
    };
}
function getWorkflowJobSteps(jobId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const steps = db.prepare('SELECT * FROM job_steps WHERE job_id = ? ORDER BY step_order').all(jobId)
        .map((s) => ({
        ...s,
        input_json: parseJsonField(s.input_json, 'input_json'),
        output_json: parseJsonField(s.output_json, 'output_json'),
    }));
    return { ok: true, steps };
}
function getWorkflowJobLogs(jobId, stepId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const where = stepId ? 'job_id = ? AND step_id = ?' : 'job_id = ?';
    const params = stepId ? [jobId, stepId] : [jobId];
    const logs = db.prepare(`SELECT * FROM job_logs WHERE ${where} ORDER BY created_at ASC`).all(...params);
    return { ok: true, logs };
}
// ── Built-in Templates ────────────────────────────────────────────────────────
function getBuiltinTemplates() {
    const n = now();
    return [
        {
            id: 'tpl-bpd',
            code: 'build_publish_deploy',
            name: 'Build → Publish → Deploy',
            category: 'deployment',
            version: '1.0',
            status: 'active',
            description: 'Build a model package, publish it, deploy to runtime, and verify health',
            workflow_steps_json: JSON.stringify([
                { step_key: 'build_package', step_name: 'Build Package', step_order: 1 },
                { step_key: 'publish_package', step_name: 'Publish Package', step_order: 2 },
                { step_key: 'deploy_revision', step_name: 'Deploy to Runtime', step_order: 3 },
                { step_key: 'health_check', step_name: 'Health Check', step_order: 4 },
            ]),
            definition_json: JSON.stringify({}),
            input_schema_json: JSON.stringify({
                type: 'object',
                required: ['package_id', 'deployment_id'],
                properties: {
                    package_id: { type: 'string', title: 'Package ID', description: 'Model package to build and deploy' },
                    deployment_id: { type: 'string', title: 'Deployment ID', description: 'Target deployment runtime' },
                },
            }),
            default_input_json: JSON.stringify({}),
            is_builtin: 1,
            created_at: n,
            updated_at: n,
        },
        {
            id: 'tpl-deploy-only',
            code: 'deploy_only',
            name: 'Deploy Only',
            category: 'deployment',
            version: '1.0',
            status: 'active',
            description: 'Deploy an existing package revision and verify health',
            workflow_steps_json: JSON.stringify([
                { step_key: 'deploy_revision', step_name: 'Deploy Revision', step_order: 1 },
                { step_key: 'health_check', step_name: 'Health Check', step_order: 2 },
            ]),
            definition_json: JSON.stringify({}),
            input_schema_json: JSON.stringify({
                type: 'object',
                required: ['revision_id', 'deployment_id'],
                properties: {
                    revision_id: { type: 'string', title: 'Revision ID', description: 'Deployment revision to activate' },
                    deployment_id: { type: 'string', title: 'Deployment ID', description: 'Target deployment runtime' },
                },
            }),
            default_input_json: JSON.stringify({}),
            is_builtin: 1,
            created_at: n,
            updated_at: n,
        },
    ];
}
// ── Route Registration ─────────────────────────────────────────────────────────
async function registerWorkflowRoutes(app) {
    seedWorkflowFactoryTemplates();
    app.get('/api/workflow-jobs', async (request) => {
        return listWorkflowJobs(request.query || {});
    });
    app.post('/api/workflow-jobs', async (request) => {
        const body = request.body || {};
        return createWorkflowJob({
            name: body.name,
            description: body.description,
            template_id: body.template_id,
            steps: body.steps || [],
            input: body.input || {},
        });
    });
    app.get('/api/workflow-jobs/:id', async (request) => {
        return getWorkflowJobById(request.params.id);
    });
    // ── Start job (pending → running) ──────────────────────────────────────────
    app.post('/api/workflow-jobs/:id/start', async (request) => {
        try {
            const db = (0, builtin_sqlite_js_1.getDatabase)();
            const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(request.params.id);
            if (!job)
                return { ok: false, error: 'Job not found' };
            const check = validateTransition('start', job.status);
            if (!check.ok) {
                await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_invalid_transition', target: request.params.id, result: 'failed', detail: { action: 'start', current: job.status } });
                return { ok: false, error: check.error };
            }
            await runWorkflowJob(request.params.id);
            return getWorkflowJobById(request.params.id);
        }
        catch (err) {
            return { ok: false, error: `Workflow execution error: ${err.message}` };
        }
    });
    // ── v2.3.0: Resume job (paused → running) ─────────────────────────────────
    app.post('/api/workflow-jobs/:id/resume', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const jobId = request.params.id;
        const body = request.body || {};
        const actor = body.resumed_by || 'operator';
        const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(jobId);
        if (!job)
            return { ok: false, error: 'Job not found' };
        // 幂等: running 状态直接返回
        if (job.status === 'running') {
            return { ok: true, message: 'Job already running', job };
        }
        const check = validateTransition('resume', job.status);
        if (!check.ok) {
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_invalid_transition', target: jobId, result: 'failed', detail: { action: 'resume', current: job.status, actor } });
            return { ok: false, error: check.error };
        }
        const nowStr = now();
        db.prepare(`UPDATE workflow_jobs SET status = 'running', resumed_at = ?, resumed_by = ?, updated_at = ? WHERE id = ?`)
            .run(nowStr, actor, nowStr, jobId);
        await logJob(db, jobId, null, 'info', `Workflow resumed by ${actor}`);
        await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_resume', target: jobId, result: 'success', detail: { actor, resumed_at: nowStr } });
        await runWorkflowJob(jobId);
        return getWorkflowJobById(jobId);
    });
    // ── v2.3.0: Cancel job (pending/running/paused → cancelled) ───────────────
    app.post('/api/workflow-jobs/:id/cancel', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const jobId = request.params.id;
        const body = request.body || {};
        const actor = body.cancelled_by || 'operator';
        const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(jobId);
        if (!job)
            return { ok: false, error: 'Job not found' };
        // v2.3.0: 幂等保护 — 已 cancelled 直接返回成功
        if (job.status === 'cancelled') {
            return { ok: true, message: 'Job already cancelled', job };
        }
        const check = validateTransition('cancel', job.status);
        if (!check.ok) {
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_invalid_transition', target: jobId, result: 'failed', detail: { action: 'cancel', current: job.status, actor } });
            return { ok: false, error: check.error };
        }
        const nowStr = now();
        db.prepare(`UPDATE workflow_jobs SET status = 'cancelled', cancelled_at = ?, cancelled_by = ?, updated_at = ?, finished_at = ? WHERE id = ?`)
            .run(nowStr, actor, nowStr, nowStr, jobId);
        await logJob(db, jobId, null, 'warn', `Workflow cancelled by ${actor}`);
        await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_cancel', target: jobId, result: 'success', detail: { actor, cancelled_at: nowStr, previous_status: job.status } });
        const fresh = getWorkflowJobById(jobId);
        return { ok: true, message: 'Job cancelled', job: fresh.job };
    });
    // ── v2.4.0: Request cancel (marks cancel_requested, does not immediately set cancelled) ─
    app.post('/api/workflow-jobs/:id/request-cancel', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const jobId = request.params.id;
        const body = request.body || {};
        const actor = body.cancel_requested_by || 'operator';
        const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(jobId);
        if (!job)
            return { ok: false, error: 'Job not found' };
        // 已完成/已取消的 job 不接受 request-cancel
        if (job.status === 'completed')
            return { ok: false, error: 'Job already completed' };
        if (job.status === 'cancelled')
            return { ok: true, message: 'Job already cancelled' };
        // 幂等：已有 cancel_requested 直接返回
        if (job.cancel_requested_at) {
            return { ok: true, message: 'Cancel already requested', job };
        }
        // 非 running 的 job 直接走 cancel
        if (job.status !== 'running') {
            const check = validateTransition('cancel', job.status);
            if (!check.ok) {
                await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_invalid_transition', target: jobId, result: 'failed', detail: { action: 'request-cancel', current: job.status, actor } });
                return { ok: false, error: check.error };
            }
            const nowStr = now();
            db.prepare(`UPDATE workflow_jobs SET status = 'cancelled', cancelled_at = ?, cancelled_by = ?, updated_at = ?, finished_at = ? WHERE id = ?`)
                .run(nowStr, actor, nowStr, nowStr, jobId);
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_request_cancel', target: jobId, result: 'success', detail: { actor, resolved: 'immediate', previous_status: job.status } });
            return { ok: true, message: 'Job cancelled (was not running)', job: getWorkflowJobById(jobId).job };
        }
        // running 状态：标记 cancel_requested，等 checkpoint 拦截
        const nowStr = now();
        db.prepare(`UPDATE workflow_jobs SET cancel_requested_at = ?, cancel_requested_by = ?, updated_at = ? WHERE id = ?`)
            .run(nowStr, actor, nowStr, jobId);
        await logJob(db, jobId, null, 'warn', `Cancel requested by ${actor} (will take effect at next checkpoint)`);
        await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_request_cancel', target: jobId, result: 'success', detail: { actor, resolved: 'deferred', previous_status: job.status } });
        return { ok: true, message: 'Cancel requested (will take effect at next checkpoint)', job: getWorkflowJobById(jobId).job };
    });
    // ── v2.4.0: Reconcile stale jobs ────────────────────────────────────────────
    app.post('/api/workflow-jobs/reconcile-stale', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const body = request.body || {};
        const actor = body.reconciled_by || 'system';
        // Find stale jobs: status=running but no recent activity (>60s old updated_at)
        const staleThreshold = new Date(Date.now() - 60 * 1000).toISOString();
        const staleJobs = db.prepare("SELECT * FROM workflow_jobs WHERE status IN ('running', 'retrying') AND updated_at < ?")
            .all(staleThreshold);
        const reconciled = [];
        const skipped = [];
        for (const job of staleJobs) {
            // Check if actually still running (has active cancel_requested?)
            // Mark as failed with reason
            const nowStr = now();
            db.prepare(`UPDATE workflow_jobs SET status = 'failed', error_message = ?, blocked_reason = 'reconciled: stale job recovered', reconciled_at = ?, reconciled_by = ?, cancel_requested_at = NULL, cancel_requested_by = NULL, updated_at = ?, finished_at = ? WHERE id = ?`)
                .run(`Job was in '${job.status}' state but appears stale (last updated: ${job.updated_at})`, nowStr, actor, nowStr, nowStr, job.id);
            await logJob(db, job.id, null, 'warn', `Stale job reconciled by ${actor}: was ${job.status} since ${job.updated_at}`);
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_reconcile_stale', target: job.id, result: 'success', detail: { actor, previous_status: job.status, stale_since: job.updated_at } });
            reconciled.push(job.id);
        }
        // Also clean up any running jobs with cancel_requested that are stale
        const staleCancelRequested = db.prepare("SELECT * FROM workflow_jobs WHERE status = 'running' AND cancel_requested_at IS NOT NULL AND updated_at < ?")
            .all(staleThreshold);
        for (const job of staleCancelRequested) {
            if (reconciled.includes(job.id))
                continue; // already handled
            const nowStr = now();
            db.prepare(`UPDATE workflow_jobs SET status = 'cancelled', cancelled_at = ?, cancelled_by = COALESCE(cancel_requested_by, ?), cancel_requested_at = NULL, cancel_requested_by = NULL, reconciled_at = ?, reconciled_by = ?, updated_at = ?, finished_at = ? WHERE id = ?`)
                .run(nowStr, actor, nowStr, actor, nowStr, nowStr, job.id);
            await logJob(db, job.id, null, 'warn', `Stale job with cancel_request reconciled to cancelled by ${actor}`);
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_reconcile_stale', target: job.id, result: 'success', detail: { actor, previous_status: job.status, action_taken: 'cancelled', stale_since: job.updated_at } });
            reconciled.push(job.id);
        }
        return {
            ok: true,
            reconciled_count: reconciled.length,
            skipped_count: skipped.length,
            reconciled_ids: reconciled,
            skipped_ids: skipped,
        };
    });
    // ── v2.4.0: Reconcile single job ────────────────────────────────────────────
    app.post('/api/workflow-jobs/:id/reconcile', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const jobId = request.params.id;
        const body = request.body || {};
        const actor = body.reconciled_by || 'operator';
        const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(jobId);
        if (!job)
            return { ok: false, error: 'Job not found' };
        // Only reconcile jobs in running/retrying state
        if (job.status !== 'running' && job.status !== 'retrying') {
            return { ok: false, error: `Job is '${job.status}', only running/retrying jobs can be reconciled` };
        }
        const nowStr = now();
        if (job.cancel_requested_at) {
            // Had cancel requested → reconcile to cancelled
            db.prepare(`UPDATE workflow_jobs SET status = 'cancelled', cancelled_at = ?, cancelled_by = COALESCE(cancel_requested_by, ?), cancel_requested_at = NULL, cancel_requested_by = NULL, reconciled_at = ?, reconciled_by = ?, updated_at = ?, finished_at = ? WHERE id = ?`)
                .run(nowStr, actor, nowStr, actor, nowStr, nowStr, job.id);
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_reconcile_stale', target: jobId, result: 'success', detail: { actor, previous_status: job.status, action_taken: 'cancelled' } });
        }
        else {
            // No cancel request → reconcile to failed
            db.prepare(`UPDATE workflow_jobs SET status = 'failed', error_message = ?, blocked_reason = 'reconciled: stale job recovered', reconciled_at = ?, reconciled_by = ?, cancel_requested_at = NULL, cancel_requested_by = NULL, updated_at = ?, finished_at = ? WHERE id = ?`)
                .run(`Job was '${job.status}' but appears stale (reconciled by ${actor})`, nowStr, actor, nowStr, nowStr, job.id);
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_reconcile_stale', target: jobId, result: 'success', detail: { actor, previous_status: job.status, action_taken: 'failed' } });
        }
        await logJob(db, jobId, null, 'warn', `Job reconciled by ${actor}`);
        return { ok: true, job: getWorkflowJobById(jobId).job };
    });
    app.post('/api/workflow-jobs/:id/retry', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const jobId = request.params.id;
        const body = request.body || {};
        const actor = body.retried_by || 'operator';
        const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(jobId);
        if (!job)
            return { ok: false, error: 'Job not found' };
        // v2.4.0: retry limit check (before idempotent check)
        const retryCount = Number(job.retry_count) || 0;
        const retryLimit = Number(job.retry_limit) || 3;
        if (retryCount >= retryLimit) {
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_retry_limit_exceeded', target: jobId, result: 'failed', detail: { actor, retry_count: retryCount, retry_limit: retryLimit } });
            return { ok: false, error: `Retry limit exceeded (${retryCount}/${retryLimit})` };
        }
        // 幂等: running 状态直接返回
        if (job.status === 'running') {
            return { ok: true, message: 'Job already running', job };
        }
        const check = validateTransition('retry', job.status);
        if (!check.ok) {
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_invalid_transition', target: jobId, result: 'failed', detail: { action: 'retry', current: job.status, actor } });
            return { ok: false, error: check.error };
        }
        // Find the first failed step — retry from there
        const failedStep = db.prepare('SELECT * FROM job_steps WHERE job_id = ? AND status = ? ORDER BY step_order LIMIT 1')
            .get(jobId, 'failed');
        if (!failedStep) {
            // No failed step found — find the last non-pending step and reset from there
            const lastNonPending = db.prepare(`SELECT * FROM job_steps WHERE job_id = ? AND status != 'pending' ORDER BY step_order DESC LIMIT 1`)
                .get(jobId);
            if (lastNonPending) {
                db.prepare(`UPDATE job_steps SET status = 'pending', error_message = NULL, started_at = NULL, finished_at = NULL, duration_ms = NULL, updated_at = ? WHERE id = ?`)
                    .run(now(), lastNonPending.id);
                // Also reset any subsequent steps
                db.prepare(`UPDATE job_steps SET status = 'pending', error_message = NULL, started_at = NULL, finished_at = NULL, duration_ms = NULL, updated_at = ? WHERE job_id = ? AND step_order > ?`)
                    .run(now(), jobId, lastNonPending.step_order);
            }
            else {
                // All steps are pending — just run from the beginning
            }
        }
        else {
            // Reset the failed step
            db.prepare(`UPDATE job_steps SET status = 'pending', error_message = NULL, started_at = NULL, finished_at = NULL, duration_ms = NULL, updated_at = ? WHERE id = ?`)
                .run(now(), failedStep.id);
            // Also reset any subsequent steps
            db.prepare(`UPDATE job_steps SET status = 'pending', error_message = NULL, started_at = NULL, finished_at = NULL, duration_ms = NULL, updated_at = ? WHERE job_id = ? AND step_order > ?`)
                .run(now(), jobId, failedStep.step_order);
        }
        const nowStr = now();
        // v2.4.0: increment retry_count, reset current_step_index
        // Set status to 'pending' so runWorkflowJob will execute
        const newRetryCount = retryCount + 1;
        const retryFromIndex = failedStep ? (failedStep.step_order - 1) : 0;
        db.prepare(`UPDATE workflow_jobs SET status = 'pending', error_message = NULL, blocked_reason = NULL, current_step_index = ?, retry_count = ?, retried_at = ?, retried_by = ?, updated_at = ? WHERE id = ?`)
            .run(retryFromIndex, newRetryCount, nowStr, actor, nowStr, jobId);
        await logJob(db, jobId, null, 'info', `Workflow retried by ${actor} (attempt ${newRetryCount}/${retryLimit})`);
        await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_retry', target: jobId, result: 'success', detail: { actor, retried_at: nowStr, from_status: job.status, retry_count: newRetryCount, retry_limit: retryLimit } });
        await runWorkflowJob(jobId);
        return getWorkflowJobById(jobId);
    });
    app.get('/api/workflow-jobs/:id/steps', async (request) => {
        return getWorkflowJobSteps(request.params.id);
    });
    app.get('/api/workflow-jobs/:id/logs', async (request) => {
        return getWorkflowJobLogs(request.params.id, request.query.step_id || undefined);
    });
    // v2.3.0: Retry single failed step
    app.post('/api/workflow-jobs/:id/steps/:stepId/retry', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const jobId = request.params.id;
        const stepId = request.params.stepId;
        const body = request.body || {};
        const actor = body.retried_by || 'operator';
        const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(jobId);
        if (!job)
            return { ok: false, error: 'Job not found' };
        if (job.status !== 'failed' && job.status !== 'paused') {
            await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_invalid_transition', target: jobId, result: 'failed', detail: { action: 'step_retry', current: job.status, actor } });
            return { ok: false, error: `Cannot retry step: job is '${job.status}' (expected failed or paused)` };
        }
        const step = db.prepare('SELECT * FROM job_steps WHERE id = ? AND job_id = ?')
            .get(stepId, jobId);
        if (!step)
            return { ok: false, error: 'Step not found' };
        if (step.status !== 'failed')
            return { ok: false, error: `Step status is '${step.status}' (only failed steps can be retried)` };
        // Reset step to pending
        const nowStr = now();
        db.prepare(`UPDATE job_steps SET status = 'pending', error_message = NULL, started_at = NULL, finished_at = NULL, duration_ms = NULL, retry_count = ?, updated_at = ? WHERE id = ?`)
            .run(step.retry_count + 1, nowStr, step.id);
        await logJob(db, jobId, step.id, 'info', `Step retry #${step.retry_count + 1} by ${actor}`);
        await (0, index_js_2.logAudit)({ category: 'workflow', action: 'workflow_step_retry', target: stepId, result: 'success', detail: { job_id: jobId, step_name: step.step_name, retry_count: step.retry_count + 1, actor } });
        // Set job to running and execute from this step
        db.prepare(`UPDATE workflow_jobs SET status = 'running', error_message = NULL, current_step_index = ?, updated_at = ? WHERE id = ?`)
            .run(step.step_order - 1, nowStr, jobId);
        const { ok } = await runStep(db, { ...step, status: 'running' });
        if (ok) {
            // Advance current_step_index and check if there are more steps
            db.prepare(`UPDATE workflow_jobs SET current_step_index = ?, updated_at = ? WHERE id = ?`)
                .run(step.step_order, nowStr, jobId);
            // Check if more steps remain
            const nextSteps = db.prepare('SELECT * FROM job_steps WHERE job_id = ? AND step_order > ? ORDER BY step_order').all(jobId, step.step_order);
            if (nextSteps.length > 0) {
                // Continue remaining steps
                await runWorkflowJob(jobId);
            }
            else {
                // All steps done
                const allSteps = db.prepare('SELECT * FROM job_steps WHERE job_id = ? ORDER BY step_order').all(jobId);
                const allDone = allSteps.every(s => s.status === 'success' || s.status === 'skipped');
                if (allDone) {
                    db.prepare(`UPDATE workflow_jobs SET status = 'completed', updated_at = ?, finished_at = ? WHERE id = ?`)
                        .run(nowStr, nowStr, jobId);
                    await logJob(db, jobId, null, 'info', `Workflow completed after step retry`);
                }
            }
        }
        else {
            db.prepare(`UPDATE workflow_jobs SET status = 'failed', updated_at = ? WHERE id = ?`)
                .run(nowStr, jobId);
        }
        return { ok, step_id: stepId };
    });
    app.post('/api/workflow-jobs/:id/steps/:stepId/approve', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const step = db.prepare('SELECT * FROM job_steps WHERE id = ? AND job_id = ?')
            .get(request.params.stepId, request.params.id);
        if (!step)
            return { ok: false, error: 'Step not found' };
        const rawInput = parseJsonField(step.input_json, 'input_json') || {};
        if (rawInput.require_approval !== true)
            return { ok: false, error: 'Step does not require approval' };
        const body = request.body || {};
        // v2.1.0: Use approvals module as source of truth
        const approval = (0, index_js_1.findPendingApproval)('workflow_job', request.params.id, request.params.stepId);
        let approvalResult;
        if (approval) {
            approvalResult = (0, index_js_1.approveApproval)(approval.id, {
                reviewed_by: body.approved_by || 'operator',
                comment: body.approval_note || '',
            });
            if (!approvalResult.ok)
                return { ok: false, error: approvalResult.error };
        }
        else {
            // Legacy fallback: create + approve in one step (shouldn't happen in normal flow)
            approvalResult = (0, index_js_1.approveApproval)('legacy-fallback', {
                reviewed_by: body.approved_by || 'operator',
                comment: body.approval_note || '',
            });
        }
        // Still update job_steps.input_json for backward compatibility
        const nextInput = {
            ...rawInput,
            approved: true,
            approved_at: now(),
            approved_by: body.approved_by || 'operator',
            approval_note: body.approval_note || '',
        };
        db.prepare('UPDATE job_steps SET input_json = ?, updated_at = ? WHERE id = ?')
            .run(JSON.stringify(nextInput), now(), step.id);
        await logJob(db, request.params.id, step.id, 'info', `Step approved: ${step.step_name}`);
        // Auto-resume workflow job if paused
        const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(request.params.id);
        if (!job)
            return { ok: false, error: 'Job not found' };
        if (job.status === 'paused' || job.status === 'pending') {
            await runWorkflowJob(request.params.id);
        }
        const fresh = getWorkflowJobById(request.params.id);
        if (!fresh.ok)
            return fresh;
        return { ok: true, step_id: step.id, approval: approvalResult.approval, job: fresh.job };
    });
    app.get('/api/workflow-templates/builtin', async () => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const rows = db.prepare(`
      SELECT id, code, name, category, version, status, description,
             definition_json, input_schema_json, default_input_json, workflow_steps_json,
             is_builtin, created_at, updated_at
      FROM templates
      WHERE is_builtin = 1
      ORDER BY updated_at DESC
    `).all();
        return {
            ok: true,
            templates: rows.map((t) => ({
                ...t,
                definition_json: parseJsonField(t.definition_json, 'definition_json'),
                input_schema_json: parseJsonField(t.input_schema_json, 'input_schema_json'),
                default_input_json: parseJsonField(t.default_input_json, 'default_input_json'),
                workflow_steps_json: parseJsonField(t.workflow_steps_json, 'workflow_steps_json'),
            })),
        };
    });
    app.get('/api/workflow-templates', async () => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const rows = db.prepare(`
      SELECT id, code, name, category, version, status, description,
             definition_json, input_schema_json, default_input_json, workflow_steps_json,
             is_builtin, created_at, updated_at
      FROM templates
      ORDER BY updated_at DESC
    `).all();
        return {
            ok: true,
            templates: rows.map((t) => ({
                ...t,
                definition_json: parseJsonField(t.definition_json, 'definition_json'),
                input_schema_json: parseJsonField(t.input_schema_json, 'input_schema_json'),
                default_input_json: parseJsonField(t.default_input_json, 'default_input_json'),
                workflow_steps_json: parseJsonField(t.workflow_steps_json, 'workflow_steps_json'),
            })),
            total: rows.length,
        };
    });
    app.get('/api/workflow-templates/:id', async (request) => {
        const db = (0, builtin_sqlite_js_1.getDatabase)();
        const t = db.prepare(`
      SELECT id, code, name, category, version, status, description,
             definition_json, input_schema_json, default_input_json, workflow_steps_json,
             is_builtin, created_at, updated_at
      FROM templates
      WHERE id = ?
    `).get(request.params.id);
        if (!t)
            return { ok: false, error: `Template ${request.params.id} not found` };
        return {
            ok: true,
            template: {
                ...t,
                definition_json: parseJsonField(t.definition_json, 'definition_json'),
                input_schema_json: parseJsonField(t.input_schema_json, 'input_schema_json'),
                default_input_json: parseJsonField(t.default_input_json, 'default_input_json'),
                workflow_steps_json: parseJsonField(t.workflow_steps_json, 'workflow_steps_json'),
            },
        };
    });
}
