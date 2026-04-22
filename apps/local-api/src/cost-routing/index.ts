import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';

type RouteType = 'local_low_cost' | 'local_balanced' | 'cloud_high_capability';

const ROUTE_TYPES: RouteType[] = ['local_low_cost', 'local_balanced', 'cloud_high_capability'];
const STATUS_TYPES = ['active', 'disabled'];

function genId(prefix = 'rt'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function now(): string {
  return new Date().toISOString();
}

function parseJson(raw: any): any {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

function stringifyJson(v: any): string {
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v ?? {});
  } catch {
    return '{}';
  }
}

function normalizeRouteType(v: any): RouteType {
  if (ROUTE_TYPES.includes(v as RouteType)) return v as RouteType;
  return 'local_balanced';
}

function normalizeStatus(v: any): string {
  return STATUS_TYPES.includes(v) ? v : 'active';
}

function auditLog(action: string, target: string, result: 'success' | 'failed', detail: any) {
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'cost_routing', ?, ?, ?, ?, ?)
    `).run(genId('audit'), action, target, result, stringifyJson(detail), now());
  } catch (e) {
    console.error('[cost-routing audit] failed:', e);
  }
}

function fail(action: string, target: string, error: string, detail: any = {}) {
  auditLog('route_failed', target, 'failed', { action, error, ...detail });
  return { ok: false, error };
}

function rowToPolicy(row: any) {
  return {
    id: row.id,
    name: row.name,
    task_type: row.task_type,
    route_type: row.route_type,
    priority: row.priority,
    status: row.status,
    reason_template: row.reason_template,
    metadata_json: parseJson(row.metadata_json),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToDecision(row: any) {
  return {
    id: row.id,
    task_id: row.task_id,
    task_type: row.task_type,
    policy_id: row.policy_id,
    route_type: row.route_type,
    route_reason: row.route_reason,
    input_json: parseJson(row.input_json),
    created_at: row.created_at,
  };
}

function listPolicies(query: any) {
  try {
    const db = getDatabase();
    const limit = Math.min(Number(query.limit || 100), 500);
    const offset = Number(query.offset || 0);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.task_type) {
      conditions.push('task_type = ?');
      params.push(query.task_type);
    }
    if (query.route_type) {
      conditions.push('route_type = ?');
      params.push(normalizeRouteType(query.route_type));
    }
    if (query.status) {
      conditions.push('status = ?');
      params.push(normalizeStatus(query.status));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as n FROM route_policies ${where}`).get(...params) as any)?.n || 0;
    const rows = db.prepare(`
      SELECT * FROM route_policies ${where}
      ORDER BY priority DESC, updated_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const policies = rows.map(rowToPolicy);
    auditLog('route_policy_view', 'route-policies', 'success', { route: 'list', total, limit, offset });
    return { ok: true, policies, total };
  } catch (e: any) {
    return fail('list_policies', 'route-policies', e.message || 'list policies failed');
  }
}

function getPolicyById(id: string) {
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM route_policies WHERE id = ?').get(id) as any;
    if (!row) return fail('get_policy', id, 'Policy not found');
    auditLog('route_policy_view', id, 'success', { route: 'detail' });
    return { ok: true, policy: rowToPolicy(row) };
  } catch (e: any) {
    return fail('get_policy', id, e.message || 'get policy failed');
  }
}

function createPolicy(body: any) {
  try {
    const name = String(body.name || '').trim();
    const taskType = String(body.task_type || '').trim();
    if (!name) return fail('create_policy', 'route-policies', 'name is required');
    if (!taskType) return fail('create_policy', 'route-policies', 'task_type is required');

    const db = getDatabase();
    const id = genId('rp');
    const routeType = normalizeRouteType(body.route_type);
    const priority = Number.isFinite(Number(body.priority)) ? Number(body.priority) : 100;
    const status = normalizeStatus(body.status);
    const reasonTemplate = String(body.reason_template || '').trim();
    const metadataJson = stringifyJson(body.metadata_json || {});
    const ts = now();

    db.prepare(`
      INSERT INTO route_policies (id, name, task_type, route_type, priority, status, reason_template, metadata_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, taskType, routeType, priority, status, reasonTemplate, metadataJson, ts, ts);

    auditLog('route_policy_create', id, 'success', {
      task_type: taskType,
      route_type: routeType,
      priority,
      status,
    });

    return getPolicyById(id);
  } catch (e: any) {
    return fail('create_policy', 'route-policies', e.message || 'create policy failed');
  }
}

function updatePolicy(id: string, body: any) {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM route_policies WHERE id = ?').get(id) as any;
    if (!existing) return fail('update_policy', id, 'Policy not found');

    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now()];

    if (body.name !== undefined) { updates.push('name = ?'); params.push(String(body.name)); }
    if (body.task_type !== undefined) { updates.push('task_type = ?'); params.push(String(body.task_type)); }
    if (body.route_type !== undefined) { updates.push('route_type = ?'); params.push(normalizeRouteType(body.route_type)); }
    if (body.priority !== undefined) { updates.push('priority = ?'); params.push(Number(body.priority) || 100); }
    if (body.status !== undefined) { updates.push('status = ?'); params.push(normalizeStatus(body.status)); }
    if (body.reason_template !== undefined) { updates.push('reason_template = ?'); params.push(String(body.reason_template || '')); }
    if (body.metadata_json !== undefined) { updates.push('metadata_json = ?'); params.push(stringifyJson(body.metadata_json)); }

    params.push(id);
    db.prepare(`UPDATE route_policies SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    auditLog('route_policy_update', id, 'success', {
      route: 'update',
      updated_fields: Object.keys(body),
    });

    return getPolicyById(id);
  } catch (e: any) {
    return fail('update_policy', id, e.message || 'update policy failed');
  }
}

function listDecisions(query: any) {
  try {
    const db = getDatabase();
    const limit = Math.min(Number(query.limit || 50), 200);
    const offset = Number(query.offset || 0);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.task_type) {
      conditions.push('task_type = ?');
      params.push(String(query.task_type));
    }
    if (query.route_type) {
      conditions.push('route_type = ?');
      params.push(normalizeRouteType(query.route_type));
    }
    if (query.task_id) {
      conditions.push('task_id = ?');
      params.push(String(query.task_id));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as n FROM route_decisions ${where}`).get(...params) as any)?.n || 0;
    const rows = db.prepare(`
      SELECT * FROM route_decisions ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const decisions = rows.map(rowToDecision);
    auditLog('route_decision_view', 'route-decisions', 'success', { route: 'list', total, limit, offset });
    return { ok: true, decisions, total };
  } catch (e: any) {
    return fail('list_decisions', 'route-decisions', e.message || 'list decisions failed');
  }
}

function getDecisionById(id: string) {
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM route_decisions WHERE id = ?').get(id) as any;
    if (!row) return fail('get_decision', id, 'Decision not found');
    auditLog('route_decision_view', id, 'success', { route: 'detail' });
    return { ok: true, decision: rowToDecision(row) };
  } catch (e: any) {
    return fail('get_decision', id, e.message || 'get decision failed');
  }
}

function renderReason(policy: any, taskType: string, ruleKind: 'exact' | 'fallback'): string {
  if (policy?.reason_template) {
    return String(policy.reason_template)
      .replaceAll('{task_type}', taskType)
      .replaceAll('{route_type}', policy.route_type)
      .replaceAll('{policy_id}', policy.id)
      .replaceAll('{rule_kind}', ruleKind);
  }
  return `policy=${policy.id}; rule=${ruleKind}; task_type=${taskType}; route_type=${policy.route_type}`;
}

export function resolveRoute(body: any) {
  try {
    const db = getDatabase();
    const taskType = String(body.task_type || '').trim();
    if (!taskType) return fail('resolve_route', 'route-decisions', 'task_type is required');

    const taskId = String(body.task_id || '').trim();
    const inputJson = stringifyJson(body.input_json || {});

    let policy = db.prepare(`
      SELECT * FROM route_policies
      WHERE status = 'active' AND task_type = ?
      ORDER BY priority DESC, updated_at DESC
      LIMIT 1
    `).get(taskType) as any;

    let ruleKind: 'exact' | 'fallback' = 'exact';
    if (!policy) {
      policy = db.prepare(`
        SELECT * FROM route_policies
        WHERE status = 'active' AND task_type = '*'
        ORDER BY priority DESC, updated_at DESC
        LIMIT 1
      `).get() as any;
      ruleKind = 'fallback';
    }

    const ts = now();
    let routeType: RouteType = 'local_balanced';
    let routeReason = `no active policy for task_type=${taskType}; fallback=local_balanced`;
    let policyId = '';

    if (policy) {
      routeType = normalizeRouteType(policy.route_type);
      routeReason = renderReason(policy, taskType, ruleKind);
      policyId = policy.id;
    }

    const id = genId('rd');
    db.prepare(`
      INSERT INTO route_decisions (id, task_id, task_type, policy_id, route_type, route_reason, input_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, taskId, taskType, policyId, routeType, routeReason, inputJson, ts);

    auditLog('route_decision_resolve', id, 'success', {
      task_type: taskType,
      task_id: taskId,
      route_type: routeType,
      policy_id: policyId,
      rule_kind: ruleKind,
    });

    return getDecisionById(id);
  } catch (e: any) {
    return fail('resolve_route', 'route-decisions', e.message || 'resolve route failed');
  }
}

export async function registerCostRoutingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/route-policies', async (request: any) => listPolicies(request.query || {}));
  app.get('/api/route-policies/:id', async (request: any) => getPolicyById(request.params.id));
  app.post('/api/route-policies', async (request: any) => createPolicy(request.body || {}));
  app.put('/api/route-policies/:id', async (request: any) => updatePolicy(request.params.id, request.body || {}));

  app.post('/api/cost-routing/resolve', async (request: any) => resolveRoute(request.body || {}));
  app.get('/api/cost-routing/decisions', async (request: any) => listDecisions(request.query || {}));
  app.get('/api/cost-routing/decisions/:id', async (request: any) => getDecisionById(request.params.id));

  app.get('/api/cost-routing/route-types', async () => ({ ok: true, route_types: ROUTE_TYPES }));
}
