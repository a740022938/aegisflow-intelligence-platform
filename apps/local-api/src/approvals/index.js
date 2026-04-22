"use strict";
// v2.1.0 — Approvals Module
// 独立审批实体，不再依赖 job_steps.input_json 作为唯一真相
// v2.1.0 Pack 2 — 增加策略引擎（manual/auto_approve/auto_reject）+ 懒过期
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApproval = createApproval;
exports.approveApproval = approveApproval;
exports.rejectApproval = rejectApproval;
exports.cancelApproval = cancelApproval;
exports.getApprovalById = getApprovalById;
exports.listApprovals = listApprovals;
exports.getPendingApprovals = getPendingApprovals;
exports.findPendingApproval = findPendingApproval;
exports.processExpiredApprovals = processExpiredApprovals;
exports.registerApprovalRoutes = registerApprovalRoutes;
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
const index_js_1 = require("../audit/index.js");
const crypto_1 = require("crypto");
// ── Helpers ───────────────────────────────────────────────────────────────────
function now() {
    return new Date().toISOString();
}
function uuid() {
    return (0, crypto_1.randomUUID)();
}
function parseJsonField(raw) {
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
// ── CRUD ──────────────────────────────────────────────────────────────────────
/**
 * Create an approval record.
 * If policy_type is auto_approve or auto_reject, the approval is resolved immediately.
 */
function createApproval(params) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const id = uuid();
    const ts = now();
    const policy = params.policy_type || 'manual';
    const timeoutSec = typeof params.timeout_seconds === 'number' ? params.timeout_seconds : 0;
    const expiresAt = timeoutSec > 0 ? new Date(Date.now() + timeoutSec * 1000).toISOString() : null;
    // Determine initial status based on policy
    let initialStatus = 'pending';
    let reviewedBy = null;
    let reviewedAt = null;
    let commentSuffix = '';
    if (policy === 'auto_approve') {
        initialStatus = 'approved';
        reviewedBy = 'policy:auto_approve';
        reviewedAt = ts;
        commentSuffix = ' [auto-approved by policy]';
    }
    else if (policy === 'auto_reject') {
        initialStatus = 'rejected';
        reviewedBy = 'policy:auto_reject';
        reviewedAt = ts;
        commentSuffix = ' [auto-rejected by policy]';
    }
    try {
        db.prepare(`
      INSERT INTO approvals (
        id, task_id, action, resource_type, resource_id, step_id, step_name,
        status, policy_type, timeout_seconds, expires_at,
        requested_by, reviewed_by, reviewed_at, comment, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, params.resource_id || '', // task_id: legacy NOT NULL column
        'request', // action: legacy column
        params.resource_type, params.resource_id, params.step_id || null, params.step_name || null, initialStatus, policy, timeoutSec, expiresAt, params.requested_by || 'system', reviewedBy, reviewedAt, (params.comment || '') + commentSuffix, ts, ts);
        // Write audit log
        const auditAction = policy === 'auto_approve' ? 'auto_approve' :
            policy === 'auto_reject' ? 'auto_reject' : 'create';
        (0, index_js_1.logAudit)({
            category: 'approval',
            action: auditAction,
            target: `${params.resource_type}:${params.resource_id}`,
            result: 'success',
            detail: {
                approval_id: id,
                resource_type: params.resource_type,
                resource_id: params.resource_id,
                step_id: params.step_id || null,
                step_name: params.step_name || null,
                policy_type: policy,
                timeout_seconds: timeoutSec,
                expires_at: expiresAt,
                requested_by: params.requested_by || 'system',
            },
        }).catch(() => { }); // audit is best-effort
        const approval = getApprovalById(id);
        return { ok: true, approval: approval || undefined };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
/**
 * Approve an approval record
 */
function approveApproval(approvalId, params) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const ts = now();
    const existing = db.prepare('SELECT * FROM approvals WHERE id = ?').get(approvalId);
    if (!existing)
        return { ok: false, error: `Approval ${approvalId} not found` };
    if (existing.status !== 'pending') {
        return { ok: false, error: `Approval status is '${existing.status}', expected 'pending'` };
    }
    try {
        db.prepare(`
      UPDATE approvals
      SET status = 'approved', reviewed_by = ?, reviewed_at = ?, comment = COALESCE(?, comment), updated_at = ?
      WHERE id = ?
    `).run(params.reviewed_by || 'operator', ts, params.comment || null, ts, approvalId);
        // Write audit log
        (0, index_js_1.logAudit)({
            category: 'approval',
            action: 'approve',
            target: `${existing.resource_type}:${existing.resource_id}`,
            result: 'success',
            detail: {
                approval_id: approvalId,
                step_id: existing.step_id,
                step_name: existing.step_name,
                reviewed_by: params.reviewed_by || 'operator',
                comment: params.comment || null,
            },
        }).catch(() => { });
        const approval = getApprovalById(approvalId);
        return { ok: true, approval: approval || undefined };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
/**
 * Reject an approval record
 */
function rejectApproval(approvalId, params) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const ts = now();
    const existing = db.prepare('SELECT * FROM approvals WHERE id = ?').get(approvalId);
    if (!existing)
        return { ok: false, error: `Approval ${approvalId} not found` };
    if (existing.status !== 'pending') {
        return { ok: false, error: `Approval status is '${existing.status}', expected 'pending'` };
    }
    try {
        db.prepare(`
      UPDATE approvals
      SET status = 'rejected', reviewed_by = ?, reviewed_at = ?, comment = COALESCE(?, comment), updated_at = ?
      WHERE id = ?
    `).run(params.reviewed_by || 'operator', ts, params.comment || null, ts, approvalId);
        // Write audit log
        (0, index_js_1.logAudit)({
            category: 'approval',
            action: 'reject',
            target: `${existing.resource_type}:${existing.resource_id}`,
            result: 'success',
            detail: {
                approval_id: approvalId,
                step_id: existing.step_id,
                step_name: existing.step_name,
                reviewed_by: params.reviewed_by || 'operator',
                comment: params.comment || null,
            },
        }).catch(() => { });
        const approval = getApprovalById(approvalId);
        return { ok: true, approval: approval || undefined };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
/**
 * Cancel an approval record
 */
function cancelApproval(approvalId, cancelledBy) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const ts = now();
    const existing = db.prepare('SELECT * FROM approvals WHERE id = ?').get(approvalId);
    if (!existing)
        return { ok: false, error: `Approval ${approvalId} not found` };
    if (existing.status !== 'pending') {
        return { ok: false, error: `Approval status is '${existing.status}', cannot cancel` };
    }
    try {
        db.prepare(`
      UPDATE approvals
      SET status = 'cancelled', reviewed_by = ?, reviewed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(cancelledBy || 'system', ts, ts, approvalId);
        (0, index_js_1.logAudit)({
            category: 'approval',
            action: 'cancel',
            target: `${existing.resource_type}:${existing.resource_id}`,
            result: 'success',
            detail: { approval_id: approvalId, cancelled_by: cancelledBy || 'system' },
        }).catch(() => { });
        const approval = getApprovalById(approvalId);
        return { ok: true, approval: approval || undefined };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
/**
 * Get single approval by ID
 */
function getApprovalById(id) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const row = db.prepare('SELECT * FROM approvals WHERE id = ?').get(id);
    return row ? mapRow(row) : null;
}
/**
 * List approvals with filters
 */
function listApprovals(filters) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const limit = Math.min(filters.limit || 50, 200);
    const offset = filters.offset || 0;
    const conditions = [];
    const params = [];
    if (filters.status) {
        conditions.push('a.status = ?');
        params.push(filters.status);
    }
    if (filters.resource_type) {
        conditions.push('a.resource_type = ?');
        params.push(filters.resource_type);
    }
    if (filters.resource_id) {
        conditions.push('a.resource_id = ?');
        params.push(filters.resource_id);
    }
    if (filters.step_id) {
        conditions.push('a.step_id = ?');
        params.push(filters.step_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as n FROM approvals a ${where}`).get(...params)?.n) || 0;
    const rows = db.prepare(`
    SELECT a.* FROM approvals a ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
    return {
        ok: true,
        approvals: rows.map(mapRow),
        total,
    };
}
/**
 * Get pending approvals (shortcut)
 */
function getPendingApprovals(filters) {
    const result = listApprovals({
        status: 'pending',
        resource_type: filters?.resource_type,
        limit: 100,
        offset: 0,
    });
    return { ok: true, approvals: result.approvals, count: result.total };
}
/**
 * Find pending approval by resource + step.
 * Includes lazy expiry check: if expires_at has passed, marks as expired first.
 */
function findPendingApproval(resourceType, resourceId, stepId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    let row;
    if (stepId) {
        row = db.prepare(`SELECT * FROM approvals WHERE resource_type = ? AND resource_id = ? AND step_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`).get(resourceType, resourceId, stepId);
    }
    else {
        row = db.prepare(`SELECT * FROM approvals WHERE resource_type = ? AND resource_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`).get(resourceType, resourceId);
    }
    if (!row)
        return null;
    // Lazy expiry check
    const expiresAt = row.expires_at;
    if (expiresAt) {
        const nowMs = Date.now();
        const expiryMs = new Date(expiresAt).getTime();
        if (expiryMs <= nowMs) {
            // Expire this approval
            expireApproval(row.id);
            return null; // Return null so caller knows there's no actionable approval
        }
    }
    return mapRow(row);
}
/**
 * Mark a single approval as expired (lazy).
 */
function expireApproval(approvalId) {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const ts = now();
    const existing = db.prepare('SELECT * FROM approvals WHERE id = ? AND status = ?').get(approvalId, 'pending');
    if (!existing)
        return;
    db.prepare(`
    UPDATE approvals SET status = 'expired', reviewed_by = 'policy:timeout', reviewed_at = ?, updated_at = ?
    WHERE id = ? AND status = 'pending'
  `).run(ts, ts, approvalId);
    (0, index_js_1.logAudit)({
        category: 'approval',
        action: 'expired',
        target: `${existing.resource_type || 'workflow_job'}:${existing.resource_id || ''}`,
        result: 'success',
        detail: {
            approval_id: approvalId,
            step_id: existing.step_id,
            step_name: existing.step_name,
            policy_type: existing.policy_type || 'manual',
            expired_at: ts,
        },
    }).catch(() => { });
}
/**
 * Process all expired approvals in a single batch (lazy sweep).
 * Call this from queries or on workflow resume to clean up stale entries.
 * Returns count of approvals expired.
 */
function processExpiredApprovals() {
    const db = (0, builtin_sqlite_js_1.getDatabase)();
    const nowTs = new Date().toISOString();
    const expired = db.prepare(`SELECT id, resource_type, resource_id, step_id, step_name, policy_type
     FROM approvals
     WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at <= ?`).all(nowTs);
    const ts = now();
    for (const row of expired) {
        db.prepare(`
      UPDATE approvals SET status = 'expired', reviewed_by = 'policy:timeout', reviewed_at = ?, updated_at = ?
      WHERE id = ? AND status = 'pending'
    `).run(ts, ts, row.id);
        (0, index_js_1.logAudit)({
            category: 'approval',
            action: 'expired',
            target: `${row.resource_type || 'workflow_job'}:${row.resource_id || ''}`,
            result: 'success',
            detail: {
                approval_id: row.id,
                step_id: row.step_id,
                step_name: row.step_name,
                policy_type: row.policy_type || 'manual',
            },
        }).catch(() => { });
    }
    return expired.length;
}
// ── Row Mapper ───────────────────────────────────────────────────────────────
function mapRow(row) {
    return {
        id: row.id,
        resource_type: row.resource_type || 'workflow_job',
        resource_id: row.resource_id || row.task_id || '',
        step_id: row.step_id || null,
        step_name: row.step_name || null,
        status: row.status || 'pending',
        policy_type: row.policy_type || 'manual',
        timeout_seconds: row.timeout_seconds || 0,
        expires_at: row.expires_at || null,
        requested_by: row.requested_by || 'system',
        reviewed_by: row.reviewed_by || row.approver || null,
        reviewed_at: row.reviewed_at || null,
        comment: row.comment || null,
        created_at: row.created_at,
        updated_at: row.updated_at || row.created_at,
        // legacy
        task_id: row.task_id,
        action: row.action,
        approver: row.approver,
    };
}
// ── Route Registration ─────────────────────────────────────────────────────────
function registerApprovalRoutes(app) {
    // GET /api/approvals
    app.get('/api/approvals', async (request) => {
        // Lazy expiry sweep on every list query
        processExpiredApprovals();
        return listApprovals(request.query || {});
    });
    // GET /api/approvals/pending
    app.get('/api/approvals/pending', async (request) => {
        processExpiredApprovals();
        return getPendingApprovals(request.query || {});
    });
    // GET /api/approvals/:id
    app.get('/api/approvals/:id', async (request) => {
        processExpiredApprovals();
        const approval = getApprovalById(request.params.id);
        if (!approval)
            return { ok: false, error: 'Approval not found' };
        return { ok: true, approval };
    });
    // POST /api/approvals/:id/approve
    app.post('/api/approvals/:id/approve', async (request) => {
        const body = request.body || {};
        const result = approveApproval(request.params.id, {
            reviewed_by: body.reviewed_by,
            comment: body.comment,
        });
        if (!result.ok)
            return result;
        // Auto-resume workflow job if applicable (lazy import to avoid circular dep)
        const approval = result.approval;
        if (approval && approval.resource_type === 'workflow_job' && approval.step_id) {
            try {
                const db = (0, builtin_sqlite_js_1.getDatabase)();
                // Update job_steps.input_json to mark as approved (required by runWorkflowJob)
                const step = db.prepare('SELECT * FROM job_steps WHERE id = ?').get(approval.step_id);
                if (step) {
                    const rawInput = (() => {
                        const raw = step.input_json;
                        if (!raw)
                            return {};
                        if (typeof raw === 'object')
                            return raw;
                        try {
                            return JSON.parse(raw);
                        }
                        catch {
                            return {};
                        }
                    })();
                    const nextInput = {
                        ...rawInput,
                        approved: true,
                        approved_at: now(),
                        approved_by: body.reviewed_by || 'operator',
                    };
                    db.prepare('UPDATE job_steps SET input_json = ?, updated_at = ? WHERE id = ?')
                        .run(JSON.stringify(nextInput), now(), approval.step_id);
                }
                // Resume workflow
                const job = db.prepare('SELECT * FROM workflow_jobs WHERE id = ?').get(approval.resource_id);
                if (job && (job.status === 'paused' || job.status === 'pending')) {
                    const { runWorkflowJob } = await import('../workflow/index.js');
                    await runWorkflowJob(approval.resource_id);
                }
            }
            catch (e) {
                // Resume failure is non-fatal; the approval itself succeeded
            }
        }
        return result;
    });
    // POST /api/approvals/:id/reject
    app.post('/api/approvals/:id/reject', async (request) => {
        const body = request.body || {};
        return rejectApproval(request.params.id, {
            reviewed_by: body.reviewed_by,
            comment: body.comment,
        });
    });
    // POST /api/approvals/:id/cancel
    app.post('/api/approvals/:id/cancel', async (request) => {
        const body = request.body || {};
        return cancelApproval(request.params.id, body.cancelled_by);
    });
    // POST /api/approvals/process-expired (lazy sweep trigger)
    app.post('/api/approvals/process-expired', async () => {
        const count = processExpiredApprovals();
        return { ok: true, expired_count: count };
    });
}
