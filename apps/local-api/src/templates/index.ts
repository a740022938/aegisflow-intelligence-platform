// v1.9.0 — Template Persistence & Approval Gate
// apps/local-api/src/templates/index.ts

import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import * as tasks from '../tasks/index.js';

function now() { return new Date().toISOString(); }
function uuid() { return require('crypto').randomUUID(); }
function parseJson(raw: any): any {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return null; }
}
function row(t: any) {
  return {
    ...t,
    definition_json: parseJson(t.definition_json),
    input_schema_json: parseJson(t.input_schema_json),
    default_input_json: parseJson(t.default_input_json),
    workflow_steps_json: parseJson(t.workflow_steps_json),
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function listTemplates(q: {
  builtin?: string; status?: string; category?: string; limit?: number; offset?: number;
}) {
  const db = getDatabase();
  const limit = Math.min(q.limit || 50, 200);
  const offset = q.offset || 0;
  const conds: string[] = []; const vp: any[] = [];
  if (q.builtin !== undefined) { conds.push('is_builtin = ?'); vp.push(q.builtin === 'true' ? 1 : 0); }
  if (q.status) { conds.push('status = ?'); vp.push(q.status); }
  if (q.category) { conds.push('category = ?'); vp.push(q.category); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const total = (db.prepare(`SELECT COUNT(*) as n FROM templates ${where}`).get(...vp) as any)?.n || 0;
  const rows = db.prepare(`SELECT * FROM templates ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...vp, limit, offset);
  return { ok: true, templates: rows.map(row), total };
}

export function getTemplateById(id: string) {
  const db = getDatabase();
  const t = db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as any;
  if (!t) return { ok: false, error: `Template ${id} not found` };
  return { ok: true, template: row(t) };
}

export function getTemplateByCode(code: string) {
  const db = getDatabase();
  const t = db.prepare('SELECT * FROM templates WHERE code = ?').get(code) as any;
  if (!t) return { ok: false, error: `Template code ${code} not found` };
  return { ok: true, template: row(t) };
}

export function createTemplate(p: {
  code: string; name: string; category?: string; version?: string;
  status?: string; description?: string; definition_json?: any;
  input_schema_json?: any; default_input_json?: any;
  workflow_steps_json?: any; is_builtin?: number;
}) {
  if (!p || typeof p.code !== 'string' || !p.code.trim() || typeof p.name !== 'string' || !p.name.trim()) {
    return { ok: false, error: 'code and name are required' };
  }
  const db = getDatabase();
  const id = uuid();
  const n = now();
  try {
    db.prepare(`
      INSERT INTO templates (id,code,name,category,version,status,description,
        definition_json,input_schema_json,default_input_json,workflow_steps_json,
        is_builtin,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, p.code, p.name, p.category || 'general', p.version || '1.0',
      p.status || 'active', p.description || null,
      JSON.stringify(p.definition_json || {}),
      JSON.stringify(p.input_schema_json || {}),
      JSON.stringify(p.default_input_json || {}),
      JSON.stringify(p.workflow_steps_json || []),
      p.is_builtin ?? 0, n, n,
    );
    return { ok: true, template: getTemplateById(id).template };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export function updateTemplate(id: string, p: {
  name?: string; category?: string; version?: string;
  status?: string; description?: string;
  input_schema_json?: any; default_input_json?: any; workflow_steps_json?: any;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as any;
  if (!existing) return { ok: false, error: `Template ${id} not found` };
  if (existing.is_builtin) return { ok: false, error: 'Cannot modify built-in template' };
  const fields: string[] = []; const vals: any[] = [];
  if (p.name !== undefined) { fields.push('name = ?'); vals.push(p.name); }
  if (p.category !== undefined) { fields.push('category = ?'); vals.push(p.category); }
  if (p.version !== undefined) { fields.push('version = ?'); vals.push(p.version); }
  if (p.status !== undefined) { fields.push('status = ?'); vals.push(p.status); }
  if (p.description !== undefined) { fields.push('description = ?'); vals.push(p.description); }
  if (p.input_schema_json !== undefined) { fields.push('input_schema_json = ?'); vals.push(JSON.stringify(p.input_schema_json)); }
  if (p.default_input_json !== undefined) { fields.push('default_input_json = ?'); vals.push(JSON.stringify(p.default_input_json)); }
  if (p.workflow_steps_json !== undefined) { fields.push('workflow_steps_json = ?'); vals.push(JSON.stringify(p.workflow_steps_json)); }
  if (!fields.length) return getTemplateById(id);
  fields.push('updated_at = ?'); vals.push(now()); vals.push(id);
  try {
    db.prepare(`UPDATE templates SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
    return getTemplateById(id);
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export function cloneTemplate(id: string) {
  const src = getTemplateById(id);
  if (!src.ok || !src.template) return { ok: false, error: src.error || 'Template not found' };
  const t = src.template as any;
  const code = `${t.code}_clone_${Date.now()}`;
  return createTemplate({
    code,
    name: `${t.name} (Clone)`,
    category: t.category,
    version: t.version || '1.0',
    status: 'draft',
    description: t.description || '',
    definition_json: t.definition_json || {},
    input_schema_json: t.input_schema_json || {},
    default_input_json: t.default_input_json || {},
    workflow_steps_json: t.workflow_steps_json || [],
    is_builtin: 0,
  });
}

export async function createTaskFromTemplate(id: string, payload: any = {}) {
  const tRes = getTemplateById(id);
  if (!tRes.ok || !tRes.template) return { ok: false, error: tRes.error || 'Template not found' };
  const t = tRes.template as any;
  const title = payload?.title || `Task from ${t.name || t.code || id}`;
  const created = tasks.createTask({
    title,
    description: payload?.description || t.description || '',
  });
  if (!created.ok || !created.task) return { ok: false, error: created.error || 'Failed to create task' };
  const patched = tasks.updateTask(created.task.id, {
    template_id: t.id,
    template_code: t.code || null,
    template_version: t.version || null,
    input_payload: payload?.input_payload ? JSON.stringify(payload.input_payload) : null,
  } as any);
  if (!patched.ok) return { ok: false, error: patched.error || 'Failed to bind template to task' };
  return { ok: true, task: patched.task, template: t };
}

// ── Seed Built-in Templates ─────────────────────────────────────────────────

export function seedBuiltinTemplates(): number {
  const db = getDatabase();
  const n = now();
  const seeds = [
    {
      id: 'tpl-bpd', code: 'build_publish_deploy',
      name: 'Build → Publish → Deploy → Health',
      category: 'deployment', version: '1.0', status: 'active',
      description: 'Build a model package, publish it, deploy to runtime, and verify health',
      workflow_steps_json: [
        { step_key: 'build_package',   step_name: 'Build Package',   step_order: 1, require_approval: false },
        { step_key: 'publish_package', step_name: 'Publish Package', step_order: 2, require_approval: false },
        { step_key: 'deploy_revision', step_name: 'Deploy Revision', step_order: 3, require_approval: true  },
        { step_key: 'health_check',    step_name: 'Health Check',    step_order: 4, require_approval: false },
      ],
      input_schema_json: {
        type: 'object',
        required: ['package_id', 'deployment_id'],
        properties: {
          package_id:    { type: 'string', title: 'Package ID' },
          deployment_id:  { type: 'string', title: 'Deployment ID' },
        },
      },
      definition_json: {}, default_input_json: {},
    },
    {
      id: 'tpl-deploy-only', code: 'deploy_only',
      name: 'Deploy Only',
      category: 'deployment', version: '1.0', status: 'active',
      description: 'Deploy an existing package revision and verify health',
      workflow_steps_json: [
        { step_key: 'deploy_revision', step_name: 'Deploy Revision', step_order: 1, require_approval: true  },
        { step_key: 'health_check',    step_name: 'Health Check',    step_order: 2, require_approval: false },
      ],
      input_schema_json: {
        type: 'object',
        required: ['revision_id', 'deployment_id'],
        properties: {
          revision_id:   { type: 'string', title: 'Revision ID' },
          deployment_id: { type: 'string', title: 'Deployment ID' },
        },
      },
      definition_json: {}, default_input_json: {},
    },
    {
      id: 'tpl-rollback', code: 'rollback',
      name: 'Rollback + Health Check',
      category: 'deployment', version: '1.0', status: 'active',
      description: 'Rollback to a previous checkpoint and verify health',
      workflow_steps_json: [
        { step_key: 'rollback',      step_name: 'Rollback',      step_order: 1, require_approval: true  },
        { step_key: 'health_check',  step_name: 'Health Check',  step_order: 2, require_approval: false },
      ],
      input_schema_json: {
        type: 'object',
        required: ['rollback_point_id', 'deployment_id'],
        properties: {
          rollback_point_id: { type: 'string', title: 'Rollback Point ID' },
          deployment_id:     { type: 'string', title: 'Deployment ID' },
        },
      },
      definition_json: {}, default_input_json: {},
    },
  ];

  let seeded = 0;
  for (const s of seeds) {
    const existing = db.prepare('SELECT id FROM templates WHERE id = ?').get(s.id);
    if (!existing) {
      db.prepare(`
        INSERT INTO templates (id,code,name,category,version,status,description,
          definition_json,input_schema_json,default_input_json,workflow_steps_json,
          is_builtin,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        s.id, s.code, s.name, s.category, s.version, s.status, s.description,
        JSON.stringify(s.definition_json), JSON.stringify(s.input_schema_json),
        JSON.stringify(s.default_input_json), JSON.stringify(s.workflow_steps_json),
        1, n, n,
      );
      seeded++;
    }
  }
  return seeded;
}

// ── Route Registration ──────────────────────────────────────────────────────────

export async function registerTemplateRoutes(app: FastifyInstance) {
  const seeded = seedBuiltinTemplates();
  if (seeded > 0) app.log.info(`Seeded ${seeded} built-in workflow templates`);

  app.get('/api/workflow-templates', async (request: any) => {
    return listTemplates(request.query || {});
  });

  app.get('/api/workflow-templates/builtin', async () => {
    const r = listTemplates({ builtin: 'true', limit: 50 });
    return { ok: true, templates: r.templates };
  });

  app.get('/api/workflow-templates/:id', async (request: any) => {
    return getTemplateById(request.params.id);
  });

  app.post('/api/workflow-templates', async (request: any) => {
    const b = request.body || {};
    if (!b.code || !b.name) return { ok: false, error: 'code and name are required' };
    return createTemplate({
      code: b.code, name: b.name, category: b.category, version: b.version,
      status: b.status, description: b.description,
      definition_json: b.definition_json, input_schema_json: b.input_schema_json,
      default_input_json: b.default_input_json, workflow_steps_json: b.workflow_steps_json,
      is_builtin: 0,
    });
  });

  app.put('/api/workflow-templates/:id', async (request: any) => {
    const b = request.body || {};
    return updateTemplate(request.params.id, {
      name: b.name, category: b.category, version: b.version,
      status: b.status, description: b.description,
      input_schema_json: b.input_schema_json, default_input_json: b.default_input_json,
      workflow_steps_json: b.workflow_steps_json,
    });
  });
}
