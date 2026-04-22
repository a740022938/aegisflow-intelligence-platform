"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRevisions = listRevisions;
exports.getRevisionById = getRevisionById;
exports.createRevision = createRevision;
exports.deployRevision = deployRevision;
exports.getCurrentRevision = getCurrentRevision;
exports.getRevisionTimeline = getRevisionTimeline;
exports.retryDeployRevision = retryDeployRevision;
const zod_1 = require("zod");
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
// 动态导入避免循环依赖
async function auditLog(params) {
    try {
        const audit = await import('../audit/index.js');
        return await audit.logAudit(params);
    }
    catch { /* 审计模块不可用时静默忽略 */ }
}
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
// ── Schemas ──────────────────────────────────────────────────────────────────
const createRevisionSchema = zod_1.z.object({
    deployment_id: zod_1.z.string().min(1, 'deployment_id is required'),
    package_id: zod_1.z.string().optional(),
    artifact_id: zod_1.z.string().optional(),
    config_snapshot_json: zod_1.z.record(zod_1.z.any()).optional(),
    notes: zod_1.z.string().default(''),
});
// ── List ─────────────────────────────────────────────────────────────────────
async function listRevisions(query) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const { deployment_id, package_id, status } = query;
    let sql = `
    SELECT dr.*, d.name as deployment_name, p.package_name
    FROM deployment_revisions dr
    LEFT JOIN deployments d ON dr.deployment_id = d.id
    LEFT JOIN model_packages p ON dr.package_id = p.id
    WHERE 1=1
  `;
    const params = [];
    if (deployment_id) {
        sql += ' AND dr.deployment_id = ?';
        params.push(deployment_id);
    }
    if (package_id) {
        sql += ' AND dr.package_id = ?';
        params.push(package_id);
    }
    if (status) {
        sql += ' AND dr.status = ?';
        params.push(status);
    }
    sql += ' ORDER BY dr.revision_number DESC';
    const rows = dbInstance.prepare(sql).all(...params);
    return {
        ok: true,
        revisions: rows.map((r) => ({
            ...r,
            config_snapshot_json: parseJsonField(r.config_snapshot_json, 'config_snapshot_json'),
        })),
        total: rows.length,
    };
}
// ── Get One ──────────────────────────────────────────────────────────────────
async function getRevisionById(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const rev = dbInstance.prepare(`
    SELECT dr.*, d.name as deployment_name, p.package_name
    FROM deployment_revisions dr
    LEFT JOIN deployments d ON dr.deployment_id = d.id
    LEFT JOIN model_packages p ON dr.package_id = p.id
    WHERE dr.id = ?
  `).get(id);
    if (!rev) {
        return { ok: false, error: `Revision ${id} not found` };
    }
    return {
        ok: true,
        revision: {
            ...rev,
            config_snapshot_json: parseJsonField(rev.config_snapshot_json, 'config_snapshot_json'),
        },
    };
}
// ── Create ───────────────────────────────────────────────────────────────────
async function createRevision(body) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const validation = createRevisionSchema.safeParse(body);
    if (!validation.success) {
        return { ok: false, error: validation.error.message };
    }
    const data = validation.data;
    const id = generateId();
    const nowStr = now();
    // Verify deployment exists
    const deployment = dbInstance.prepare('SELECT * FROM deployments WHERE id = ?').get(data.deployment_id);
    if (!deployment) {
        return { ok: false, error: `Deployment ${data.deployment_id} not found` };
    }
    // Get next revision number
    const maxRev = dbInstance.prepare('SELECT MAX(revision_number) as max FROM deployment_revisions WHERE deployment_id = ?').get(data.deployment_id);
    const revisionNumber = (maxRev?.max || 0) + 1;
    // Create config snapshot from deployment if not provided
    const configSnapshot = data.config_snapshot_json || {
        deployment_type: deployment.deployment_type,
        runtime: deployment.runtime,
        host: deployment.host,
        port: deployment.port,
        base_url: deployment.base_url,
        entrypoint: deployment.entrypoint,
        model_path: deployment.model_path,
    };
    dbInstance.prepare(`
    INSERT INTO deployment_revisions (
      id, deployment_id, package_id, artifact_id, revision_number,
      status, config_snapshot_json, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(id, data.deployment_id, data.package_id || null, data.artifact_id || null, revisionNumber, JSON.stringify(configSnapshot), data.notes, nowStr);
    return {
        ok: true,
        revision: {
            id,
            deployment_id: data.deployment_id,
            package_id: data.package_id || null,
            artifact_id: data.artifact_id || null,
            revision_number: revisionNumber,
            status: 'pending',
            config_snapshot_json: configSnapshot,
            created_at: nowStr,
        },
    };
}
// ── Deploy Revision ──────────────────────────────────────────────────────────
async function deployRevision(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const rev = dbInstance.prepare('SELECT * FROM deployment_revisions WHERE id = ?').get(id);
    if (!rev) {
        return { ok: false, error: `Revision ${id} not found` };
    }
    if (rev.status === 'deployed') {
        return { ok: false, error: 'Revision is already deployed' };
    }
    const nowStr = now();
    // Count how many were previously current (for audit)
    const previouslyCurrent = dbInstance.prepare('SELECT COUNT(*) as n FROM deployment_revisions WHERE deployment_id = ? AND status = ?').get(rev.deployment_id, 'current');
    // Mark any current revision as superseded
    dbInstance.prepare(`
    UPDATE deployment_revisions 
    SET status = 'superseded' 
    WHERE deployment_id = ? AND status = 'current'
  `).run(rev.deployment_id);
    // Mark this revision as current
    dbInstance.prepare(`
    UPDATE deployment_revisions 
    SET status = 'current', deployed_at = ?, health_status = 'healthy'
    WHERE id = ?
  `).run(nowStr, id);
    // Update deployment status
    dbInstance.prepare(`
    UPDATE deployments 
    SET status = 'running', updated_at = ?, started_at = ?
    WHERE id = ?
  `).run(nowStr, nowStr, rev.deployment_id);
    // Audit: deploy success
    await auditLog({
        category: 'deployment',
        action: 'deploy',
        target: `deployment:${rev.deployment_id} revision:${id}`,
        result: 'success',
        detail: {
            revision_id: id,
            deployment_id: rev.deployment_id,
            package_id: rev.package_id,
            consistency_check: {
                previous_current_count: previouslyCurrent?.n ?? 0,
                deployment_status_updated: true
            }
        }
    });
    const updated = dbInstance.prepare('SELECT * FROM deployment_revisions WHERE id = ?').get(id);
    return {
        ok: true,
        revision: {
            ...updated,
            config_snapshot_json: parseJsonField(updated.config_snapshot_json, 'config_snapshot_json'),
        },
    };
}
// ── Get Current Revision ─────────────────────────────────────────────────────
async function getCurrentRevision(deploymentId) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const rev = dbInstance.prepare(`
    SELECT dr.*, d.name as deployment_name, p.package_name
    FROM deployment_revisions dr
    LEFT JOIN deployments d ON dr.deployment_id = d.id
    LEFT JOIN model_packages p ON dr.package_id = p.id
    WHERE dr.deployment_id = ? AND dr.status = 'current'
  `).get(deploymentId);
    if (!rev) {
        return { ok: true, revision: null, message: 'No current revision' };
    }
    return {
        ok: true,
        revision: {
            ...rev,
            config_snapshot_json: parseJsonField(rev.config_snapshot_json, 'config_snapshot_json'),
        },
    };
}
// ── Get Revision Timeline ────────────────────────────────────────────────────
async function getRevisionTimeline(deploymentId) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const revisions = dbInstance.prepare(`
    SELECT dr.*, p.package_name
    FROM deployment_revisions dr
    LEFT JOIN model_packages p ON dr.package_id = p.id
    WHERE dr.deployment_id = ?
    ORDER BY dr.revision_number DESC
  `).all(deploymentId);
    const current = revisions.find((r) => r.status === 'current');
    return {
        ok: true,
        deployment_id: deploymentId,
        current_revision: current ? {
            ...current,
            config_snapshot_json: parseJsonField(current.config_snapshot_json, 'config_snapshot_json'),
        } : null,
        timeline: revisions.map((r) => ({
            ...r,
            config_snapshot_json: parseJsonField(r.config_snapshot_json, 'config_snapshot_json'),
        })),
        total: revisions.length,
    };
}
// ── Retry Deploy ─────────────────────────────────────────────────────────────
async function retryDeployRevision(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const rev = dbInstance.prepare('SELECT * FROM deployment_revisions WHERE id = ?').get(id);
    if (!rev)
        return { ok: false, error: `Revision ${id} not found` };
    const lastFailure = dbInstance.prepare(`SELECT * FROM audit_logs WHERE category = 'deployment' AND action = 'deploy' AND target LIKE ? AND result = 'failed' ORDER BY created_at DESC LIMIT 1`).get(`%revision:${id}%`);
    const retryId = await auditLog({
        category: 'deployment',
        action: 'retry_deploy',
        target: `deployment:${rev.deployment_id} revision:${id}`,
        result: 'pending',
        detail: {
            revision_id: id,
            deployment_id: rev.deployment_id,
            original_failure: lastFailure ? {
                at: lastFailure.created_at,
                error: lastFailure.detail_json ? JSON.parse(lastFailure.detail_json).error : 'unknown'
            } : null
        }
    });
    const result = await deployRevision(id);
    dbInstance.prepare(`UPDATE audit_logs SET result = ?, detail_json = ? WHERE id = ?`).run(result.ok ? 'success' : 'failed', JSON.stringify({
        ...(lastFailure ? { original_failure: JSON.parse(lastFailure.detail_json || '{}') } : {}),
        retry_result: result.ok ? 'deploy succeeded' : result.error
    }), retryId);
    return result;
}
