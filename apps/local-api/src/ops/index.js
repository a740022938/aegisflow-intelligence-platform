"use strict";
// v2.5.0 — Ops Observability & Failure Insight
// 统一运营摘要 / 故障洞察 / 状态聚合读模型
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOpsRoutes = registerOpsRoutes;
const builtin_sqlite_js_1 = require("../db/builtin-sqlite.js");
function tsWindow(hours) {
    return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}
function safeCount(rows) {
    return Array.isArray(rows) ? rows.length : 0;
}
// ── workflow job stats ────────────────────────────────────────────────────────
function getWorkflowJobStats(db, since) {
    const sinceCond = since ? `created_at >= '${since}'` : null;
    const total = db.prepare(since ? `SELECT COUNT(*) as count FROM workflow_jobs WHERE ${sinceCond}` : `SELECT COUNT(*) as count FROM workflow_jobs`).get().count;
    const byStatus = db.prepare(since ? `SELECT status, COUNT(*) as count FROM workflow_jobs WHERE ${sinceCond} GROUP BY status`
        : `SELECT status, COUNT(*) as count FROM workflow_jobs GROUP BY status`).all();
    // recent failures: latest failed jobs
    const recentFailures = db.prepare(since
        ? `SELECT id, name, status, last_error, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'failed' AND updated_at >= '${since}' ORDER BY updated_at DESC LIMIT 20`
        : `SELECT id, name, status, last_error, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 20`).all();
    // recent blocked/paused jobs
    const recentBlocked = db.prepare(since
        ? `SELECT id, name, status, current_step_index, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'paused' AND updated_at >= '${since}' ORDER BY updated_at DESC LIMIT 20`
        : `SELECT id, name, status, current_step_index, retry_count, retry_limit, created_at, updated_at FROM workflow_jobs WHERE status = 'paused' ORDER BY updated_at DESC LIMIT 20`).all();
    // recent cancelled
    const recentCancelled = db.prepare(since
        ? `SELECT id, name, status, cancelled_by, created_at, updated_at FROM workflow_jobs WHERE status = 'cancelled' AND updated_at >= '${since}' ORDER BY updated_at DESC LIMIT 20`
        : `SELECT id, name, status, cancelled_by, created_at, updated_at FROM workflow_jobs WHERE status = 'cancelled' ORDER BY updated_at DESC LIMIT 20`).all();
    // retry_limit_exceeded count (from audit)
    const retryLimitExceeded = db.prepare(`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE action = 'workflow_retry_limit_exceeded' ${since ? `AND created_at >= '${since}'` : ''}
  `).get().count;
    // stale reconciled count
    const staleReconciled = db.prepare(`
    SELECT COUNT(*) as count FROM audit_logs
    WHERE action = 'workflow_reconcile_stale' ${since ? `AND created_at >= '${since}'` : ''}
  `).get().count;
    return {
        total,
        byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
        recentFailures,
        recentBlocked,
        recentCancelled,
        retryLimitExceeded,
        staleReconciled,
    };
}
// ── approval stats ─────────────────────────────────────────────────────────────
function getApprovalStats(db, since) {
    const sinceCond = since ? `created_at >= '${since}'` : null;
    const byStatus = db.prepare(since ? `SELECT status, COUNT(*) as count FROM approvals WHERE ${sinceCond} GROUP BY status`
        : `SELECT status, COUNT(*) as count FROM approvals GROUP BY status`).all();
    const byPolicy = db.prepare(since ? `SELECT policy_type, COUNT(*) as count FROM approvals WHERE ${sinceCond} GROUP BY policy_type`
        : `SELECT policy_type, COUNT(*) as count FROM approvals GROUP BY policy_type`).all();
    // recent pending approvals (most urgent)
    const recentPending = db.prepare(since ? `SELECT id, resource_id, step_name, policy_type, status, requested_by, comment, created_at, expires_at FROM approvals WHERE status = 'pending' AND ${sinceCond} ORDER BY created_at DESC LIMIT 20`
        : `SELECT id, resource_id, step_name, policy_type, status, requested_by, comment, created_at, expires_at FROM approvals WHERE status = 'pending' ORDER BY created_at DESC LIMIT 20`).all();
    // recent approvals (all, for review)
    const recentAll = db.prepare(since ? `SELECT id, resource_id, step_name, policy_type, status, requested_by, reviewed_by, reviewed_at, comment, created_at, expires_at FROM approvals WHERE ${sinceCond} ORDER BY created_at DESC LIMIT 30`
        : `SELECT id, resource_id, step_name, policy_type, status, requested_by, reviewed_by, reviewed_at, comment, created_at, expires_at FROM approvals ORDER BY created_at DESC LIMIT 30`).all();
    return {
        byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
        byPolicy: Object.fromEntries(byPolicy.map(r => [r.policy_type || 'unknown', r.count])),
        recentPending,
        recentAll,
    };
}
// ── audit recent ──────────────────────────────────────────────────────────────
function getAuditRecent(db, params) {
    const limit = Math.min(params.limit || 50, 200);
    const conditions = [];
    if (params.category)
        conditions.push(`category = '${params.category}'`);
    if (params.action)
        conditions.push(`action = '${params.action}'`);
    if (params.since)
        conditions.push(`created_at >= '${params.since}'`);
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const logs = db.prepare(`SELECT id, category, action, target, result, detail_json, created_at FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ${limit}`).all();
    return { logs, count: safeCount(logs) };
}
// ── ops summary ───────────────────────────────────────────────────────────────
function getOpsSummary(db) {
    const now = new Date().toISOString();
    const day1 = tsWindow(24);
    const day7 = tsWindow(168);
    const jobStats24h = getWorkflowJobStats(db, day1);
    const jobStats7d = getWorkflowJobStats(db, day7);
    const jobStatsAll = getWorkflowJobStats(db);
    const approvalStats24h = getApprovalStats(db, day1);
    const approvalStats7d = getApprovalStats(db, day7);
    const approvalStatsAll = getApprovalStats(db);
    // overall job status breakdown (all time)
    const overall = db.prepare('SELECT status, COUNT(*) as count FROM workflow_jobs GROUP BY status').all();
    const overallApprovals = db.prepare('SELECT status, COUNT(*) as count FROM approvals GROUP BY status').all();
    // failure category breakdown (from audit detail_json)
    const failureEvents = db.prepare(`
    SELECT id, category, action, target, detail_json, created_at
    FROM audit_logs
    WHERE action IN ('workflow_step_failed', 'workflow_job_failed', 'workflow_retry_limit_exceeded', 'approval_rejected')
    ORDER BY created_at DESC LIMIT 20
  `).all();
    return {
        timestamp: now,
        version: '2.7.0',
        workflows: {
            total: jobStatsAll.total,
            allTime: { byStatus: jobStatsAll.byStatus },
            last24h: {
                byStatus: jobStats24h.byStatus,
                recentFailuresCount: safeCount(jobStats24h.recentFailures),
                recentBlockedCount: safeCount(jobStats24h.recentBlocked),
                retryLimitExceeded: jobStats24h.retryLimitExceeded,
                staleReconciled: jobStats24h.staleReconciled,
                recentFailures: jobStats24h.recentFailures.slice(0, 5),
                recentBlocked: jobStats24h.recentBlocked.slice(0, 5),
            },
            last7d: {
                byStatus: jobStats7d.byStatus,
                retryLimitExceeded: jobStats7d.retryLimitExceeded,
                staleReconciled: jobStats7d.staleReconciled,
            },
        },
        approvals: {
            allTime: { byStatus: Object.fromEntries(overallApprovals.map(r => [r.status, r.count])) },
            last24h: {
                byStatus: approvalStats24h.byStatus,
                byPolicy: approvalStats24h.byPolicy,
                pendingCount: approvalStats24h.byStatus['pending'] || 0,
                recentPending: approvalStats24h.recentPending.slice(0, 5),
            },
            last7d: {
                byStatus: approvalStats7d.byStatus,
                byPolicy: approvalStats7d.byPolicy,
                pendingCount: approvalStats7d.byStatus['pending'] || 0,
            },
        },
        failures: {
            recent: failureEvents.map(e => ({
                id: e.id,
                category: e.category,
                action: e.action,
                target: e.target,
                detail: parseDetail(e.detail_json),
                created_at: e.created_at,
            })),
        },
    };
}
function parseDetail(json) {
    if (!json)
        return null;
    try {
        return JSON.parse(json);
    }
    catch {
        return json;
    }
}
// ── route registration ────────────────────────────────────────────────────────
function registerOpsRoutes(app) {
    // GET /api/ops/summary — unified ops dashboard data
    app.get('/api/ops/summary', async (request) => {
        try {
            const db = (0, builtin_sqlite_js_1.getDatabase)();
            return { ok: true, data: getOpsSummary(db) };
        }
        catch (err) {
            app.log.error('ops/summary error:', err);
            return { ok: false, error: err.message };
        }
    });
    // GET /api/workflow-jobs/stats — workflow job stats with time window
    app.get('/api/workflow-jobs/stats', async (request) => {
        try {
            const db = (0, builtin_sqlite_js_1.getDatabase)();
            const hours = parseInt(request.query.hours || '0', 10);
            const since = hours > 0 ? tsWindow(hours) : undefined;
            const sinceLabel = hours > 0 ? `last ${hours}h` : 'all time';
            const stats = getWorkflowJobStats(db, since);
            return {
                ok: true,
                window: sinceLabel,
                data: {
                    total: stats.total,
                    byStatus: stats.byStatus,
                    recentFailures: stats.recentFailures,
                    recentBlocked: stats.recentBlocked,
                    recentCancelled: stats.recentCancelled,
                    retryLimitExceeded: stats.retryLimitExceeded,
                    staleReconciled: stats.staleReconciled,
                },
            };
        }
        catch (err) {
            app.log.error('workflow-jobs/stats error:', err);
            return { ok: false, error: err.message };
        }
    });
    // GET /api/approvals/stats — approval stats with time window
    app.get('/api/approvals/stats', async (request) => {
        try {
            const db = (0, builtin_sqlite_js_1.getDatabase)();
            const hours = parseInt(request.query.hours || '0', 10);
            const since = hours > 0 ? tsWindow(hours) : undefined;
            const sinceLabel = hours > 0 ? `last ${hours}h` : 'all time';
            const stats = getApprovalStats(db, since);
            return {
                ok: true,
                window: sinceLabel,
                data: {
                    byStatus: stats.byStatus,
                    byPolicy: stats.byPolicy,
                    recentPending: stats.recentPending,
                    recentAll: stats.recentAll,
                },
            };
        }
        catch (err) {
            app.log.error('approvals/stats error:', err);
            return { ok: false, error: err.message };
        }
    });
    // GET /api/audit/recent — recent audit logs
    app.get('/api/audit/recent', async (request) => {
        try {
            const db = (0, builtin_sqlite_js_1.getDatabase)();
            const limit = Math.min(parseInt(request.query.limit || '50', 10), 200);
            const category = request.query.category;
            const action = request.query.action;
            const hours = parseInt(request.query.hours || '0', 10);
            const since = hours > 0 ? tsWindow(hours) : undefined;
            const result = getAuditRecent(db, { limit, category, action, since });
            return {
                ok: true,
                count: result.count,
                data: result.logs.map((l) => ({
                    id: l.id,
                    category: l.category,
                    action: l.action,
                    target: l.target,
                    result: l.result,
                    detail: parseDetail(l.detail_json),
                    created_at: l.created_at,
                })),
            };
        }
        catch (err) {
            app.log.error('audit/recent error:', err);
            return { ok: false, error: err.message };
        }
    });
    app.log.info('✅ Ops routes registered (v2.7.0)');
}
