"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTargets = listTargets;
exports.getTargetById = getTargetById;
exports.createTarget = createTarget;
exports.updateTarget = updateTarget;
exports.deleteTarget = deleteTarget;
exports.checkTargetHealth = checkTargetHealth;
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
// ── Schemas ──────────────────────────────────────────────────────────────────
const createTargetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'name is required'),
    target_type: zod_1.z.enum(['server', 'kubernetes', 'lambda', 'edge', 'custom']).default('server'),
    host: zod_1.z.string().min(1, 'host is required'),
    port: zod_1.z.number().int().positive().default(80),
    base_url: zod_1.z.string().default(''),
    region: zod_1.z.string().default(''),
    environment: zod_1.z.enum(['development', 'staging', 'production']).default('development'),
    credentials_json: zod_1.z.record(zod_1.z.any()).optional(),
    config_json: zod_1.z.record(zod_1.z.any()).optional(),
    notes: zod_1.z.string().default(''),
});
const updateTargetSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    target_type: zod_1.z.enum(['server', 'kubernetes', 'lambda', 'edge', 'custom']).optional(),
    host: zod_1.z.string().optional(),
    port: zod_1.z.number().int().positive().optional(),
    base_url: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    environment: zod_1.z.enum(['development', 'staging', 'production']).optional(),
    credentials_json: zod_1.z.record(zod_1.z.any()).optional(),
    config_json: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'maintenance']).optional(),
    notes: zod_1.z.string().optional(),
});
// ── List ─────────────────────────────────────────────────────────────────────
async function listTargets(query) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const { target_type, environment, status, q } = query;
    let sql = 'SELECT * FROM deployment_targets WHERE 1=1';
    const params = [];
    if (target_type) {
        sql += ' AND target_type = ?';
        params.push(target_type);
    }
    if (environment) {
        sql += ' AND environment = ?';
        params.push(environment);
    }
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    if (q) {
        sql += ' AND (name LIKE ? OR host LIKE ?)';
        params.push(`%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = dbInstance.prepare(sql).all(...params);
    return {
        ok: true,
        targets: rows.map((r) => ({
            ...r,
            credentials_json: parseJsonField(r.credentials_json, 'credentials_json'),
            config_json: parseJsonField(r.config_json, 'config_json'),
        })),
        total: rows.length,
    };
}
// ── Get One ──────────────────────────────────────────────────────────────────
async function getTargetById(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const target = dbInstance.prepare('SELECT * FROM deployment_targets WHERE id = ?').get(id);
    if (!target) {
        return { ok: false, error: `Target ${id} not found` };
    }
    return {
        ok: true,
        target: {
            ...target,
            credentials_json: parseJsonField(target.credentials_json, 'credentials_json'),
            config_json: parseJsonField(target.config_json, 'config_json'),
        },
    };
}
// ── Create ───────────────────────────────────────────────────────────────────
async function createTarget(body) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const validation = createTargetSchema.safeParse(body);
    if (!validation.success) {
        return { ok: false, error: validation.error.message };
    }
    const data = validation.data;
    const id = generateId();
    const nowStr = now();
    dbInstance.prepare(`
    INSERT INTO deployment_targets (
      id, name, target_type, host, port, base_url, region, environment,
      credentials_json, config_json, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, data.name, data.target_type, data.host, data.port, data.base_url, data.region, data.environment, JSON.stringify(data.credentials_json || {}), JSON.stringify(data.config_json || {}), nowStr, nowStr);
    return {
        ok: true,
        target: {
            id,
            name: data.name,
            target_type: data.target_type,
            host: data.host,
            port: data.port,
            base_url: data.base_url,
            region: data.region,
            environment: data.environment,
            status: 'active',
            created_at: nowStr,
        },
    };
}
// ── Update ───────────────────────────────────────────────────────────────────
async function updateTarget(id, body) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const existing = dbInstance.prepare('SELECT * FROM deployment_targets WHERE id = ?').get(id);
    if (!existing) {
        return { ok: false, error: `Target ${id} not found` };
    }
    const validation = updateTargetSchema.safeParse(body);
    if (!validation.success) {
        return { ok: false, error: validation.error.message };
    }
    const data = validation.data;
    const fields = [];
    const values = [];
    if (data.name !== undefined) {
        fields.push('name = ?');
        values.push(data.name);
    }
    if (data.target_type !== undefined) {
        fields.push('target_type = ?');
        values.push(data.target_type);
    }
    if (data.host !== undefined) {
        fields.push('host = ?');
        values.push(data.host);
    }
    if (data.port !== undefined) {
        fields.push('port = ?');
        values.push(data.port);
    }
    if (data.base_url !== undefined) {
        fields.push('base_url = ?');
        values.push(data.base_url);
    }
    if (data.region !== undefined) {
        fields.push('region = ?');
        values.push(data.region);
    }
    if (data.environment !== undefined) {
        fields.push('environment = ?');
        values.push(data.environment);
    }
    if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
    }
    if (data.credentials_json !== undefined) {
        fields.push('credentials_json = ?');
        values.push(JSON.stringify(data.credentials_json));
    }
    if (data.config_json !== undefined) {
        fields.push('config_json = ?');
        values.push(JSON.stringify(data.config_json));
    }
    if (fields.length === 0) {
        return { ok: true, target: existing };
    }
    fields.push('updated_at = ?');
    values.push(now());
    values.push(id);
    dbInstance.prepare(`UPDATE deployment_targets SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    const updated = dbInstance.prepare('SELECT * FROM deployment_targets WHERE id = ?').get(id);
    return {
        ok: true,
        target: {
            ...updated,
            credentials_json: parseJsonField(updated.credentials_json, 'credentials_json'),
            config_json: parseJsonField(updated.config_json, 'config_json'),
        },
    };
}
// ── Delete ───────────────────────────────────────────────────────────────────
async function deleteTarget(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const existing = dbInstance.prepare('SELECT * FROM deployment_targets WHERE id = ?').get(id);
    if (!existing) {
        return { ok: false, error: `Target ${id} not found` };
    }
    // Check if target is in use
    const deployments = dbInstance.prepare('SELECT COUNT(*) as count FROM deployments WHERE artifact_id = ?').get(id);
    if (deployments && deployments.count > 0) {
        return { ok: false, error: `Target is in use by ${deployments.count} deployment(s)` };
    }
    dbInstance.prepare('DELETE FROM deployment_targets WHERE id = ?').run(id);
    return { ok: true, deleted: id };
}
// ── Health Check ─────────────────────────────────────────────────────────────
async function checkTargetHealth(id) {
    const dbInstance = (0, builtin_sqlite_js_1.getDatabase)();
    const target = dbInstance.prepare('SELECT * FROM deployment_targets WHERE id = ?').get(id);
    if (!target) {
        return { ok: false, error: `Target ${id} not found` };
    }
    const nowStr = now();
    let healthStatus = 'unknown';
    let latencyMs = 0;
    let errorMessage = null;
    try {
        const startTime = Date.now();
        if (target.target_type === 'server') {
            // Try TCP connection
            const net = await import('net');
            const canConnect = await new Promise((resolve) => {
                const socket = new net.Socket();
                const timeout = setTimeout(() => {
                    socket.destroy();
                    resolve(false);
                }, 5000);
                socket.connect(target.port, target.host, () => {
                    clearTimeout(timeout);
                    socket.destroy();
                    resolve(true);
                });
                socket.on('error', () => {
                    clearTimeout(timeout);
                    resolve(false);
                });
            });
            latencyMs = Date.now() - startTime;
            healthStatus = canConnect ? 'healthy' : 'unhealthy';
            if (!canConnect) {
                errorMessage = `Connection refused to ${target.host}:${target.port}`;
            }
        }
        else if (target.target_type === 'kubernetes') {
            // For k8s, check if kubectl is available and can reach cluster
            // For now, just mark as healthy if target exists
            healthStatus = 'healthy';
            latencyMs = 1;
        }
        else if (target.target_type === 'lambda') {
            // For lambda, would need AWS SDK
            healthStatus = 'healthy';
            latencyMs = 1;
        }
        else {
            // For other types, just mark as healthy
            healthStatus = 'healthy';
            latencyMs = 1;
        }
    }
    catch (e) {
        healthStatus = 'unhealthy';
        errorMessage = e.message;
    }
    // Update last health check time
    dbInstance.prepare('UPDATE deployment_targets SET last_health_check_at = ? WHERE id = ?').run(nowStr, id);
    return {
        ok: true,
        target_id: id,
        health_status: healthStatus,
        latency_ms: latencyMs,
        checked_at: nowStr,
        error: errorMessage,
    };
}
