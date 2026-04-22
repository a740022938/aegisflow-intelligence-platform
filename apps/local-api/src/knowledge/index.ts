/**
 * Knowledge Center API Routes — v6.1.0
 * 知识沉淀中心：任务经验、失败复盘、模型结论、处理建议
 */

import * as db from '../db/builtin-sqlite.js';

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function now() {
  return new Date().toISOString();
}

function auditLog(category: string, action: string, target: string, result: string, detail: any) {
  try {
    const database = db.getDatabase();
    database.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuid(), category, action, target, result, JSON.stringify(detail), now());
  } catch (e) {
    console.error('[Knowledge Audit] Error:', e);
  }
}

const VALID_CATEGORIES = ['failure_postmortem', 'model_conclusion', 'task_experience', 'general_note'];
const VALID_SOURCE_TYPES = ['task', 'model', 'experiment', 'general'];
const VALID_RELATION_TYPES = ['relates_to', 'blocks', 'resolves', 'improves'];

// ── GET /api/knowledge ────────────────────────────────────────────────────────
function getKnowledgeList(params: {
  category?: string;
  source_type?: string;
  source_id?: string;
  tag?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}) {
  const database = db.getDatabase();
  const conditions: string[] = [];
  const args: any[] = [];

  if (params.category && VALID_CATEGORIES.includes(params.category)) {
    conditions.push('category = ?');
    args.push(params.category);
  }
  if (params.source_type && VALID_SOURCE_TYPES.includes(params.source_type)) {
    conditions.push('source_type = ?');
    args.push(params.source_type);
  }
  if (params.source_id) {
    conditions.push('source_id = ?');
    args.push(params.source_id);
  }
  if (params.keyword) {
    conditions.push('(title LIKE ? OR summary LIKE ? OR conclusion LIKE ?)');
    const kw = `%${params.keyword}%`;
    args.push(kw, kw, kw);
  }
  if (params.tag) {
    conditions.push('tags_json LIKE ?');
    args.push(`%"${params.tag}"%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  const rows = database.prepare(`
    SELECT * FROM knowledge_entries ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...args, limit, offset) as any[];

  const countRow = database.prepare(`
    SELECT COUNT(*) as total FROM knowledge_entries ${where}
  `).get(...args) as any;

  return { entries: rows, total: countRow?.total ?? 0 };
}

// ── GET /api/knowledge/:id ───────────────────────────────────────────────────
function getKnowledgeById(id: string) {
  const database = db.getDatabase();
  const entry = database.prepare('SELECT * FROM knowledge_entries WHERE id = ?').get(id) as any;
  if (!entry) return null;

  // 加载关联
  const links = database.prepare(`
    SELECT * FROM knowledge_links WHERE knowledge_id = ?
  `).all(id) as any[];

  return { ...entry, links };
}

// ── POST /api/knowledge ──────────────────────────────────────────────────────
function createKnowledge(body: any) {
  const database = db.getDatabase();
  const id = uuid();
  const ts = now();

  const title = (body.title || '').trim().slice(0, 200);
  const category = VALID_CATEGORIES.includes(body.category) ? body.category : 'general_note';
  const source_type = VALID_SOURCE_TYPES.includes(body.source_type) ? body.source_type : 'general';
  const source_id = body.source_id || '';
  const summary = (body.summary || '').slice(0, 500);
  const problem = body.problem || '';
  const resolution = body.resolution || '';
  const conclusion = body.conclusion || '';
  const recommendation = body.recommendation || '';
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const tags_json = JSON.stringify(tags.slice(0, 20));

  database.prepare(`
    INSERT INTO knowledge_entries (id, title, category, source_type, source_id, summary, problem, resolution, conclusion, recommendation, tags_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, category, source_type, source_id, summary, problem, resolution, conclusion, recommendation, tags_json, ts, ts);

  auditLog('knowledge', 'KNOWLEDGE_CREATED', id, 'success', { title, category, source_type });

  return getKnowledgeById(id);
}

// ── PUT /api/knowledge/:id ───────────────────────────────────────────────────
function updateKnowledge(id: string, body: any) {
  const database = db.getDatabase();
  const existing = database.prepare('SELECT id FROM knowledge_entries WHERE id = ?').get(id);
  if (!existing) return null;

  const updates: string[] = ['updated_at = ?'];
  const args: any[] = [now()];

  if (body.title !== undefined) {
    updates.push('title = ?');
    args.push((body.title as string).trim().slice(0, 200));
  }
  if (body.category !== undefined && VALID_CATEGORIES.includes(body.category)) {
    updates.push('category = ?');
    args.push(body.category);
  }
  if (body.summary !== undefined) {
    updates.push('summary = ?');
    args.push((body.summary as string).slice(0, 500));
  }
  if (body.problem !== undefined) { updates.push('problem = ?'); args.push(body.problem); }
  if (body.resolution !== undefined) { updates.push('resolution = ?'); args.push(body.resolution); }
  if (body.conclusion !== undefined) { updates.push('conclusion = ?'); args.push(body.conclusion); }
  if (body.recommendation !== undefined) { updates.push('recommendation = ?'); args.push(body.recommendation); }
  if (body.tags !== undefined) {
    updates.push('tags_json = ?');
    args.push(JSON.stringify(Array.isArray(body.tags) ? body.tags.slice(0, 20) : []));
  }

  args.push(id);
  database.prepare(`UPDATE knowledge_entries SET ${updates.join(', ')} WHERE id = ?`).run(...args);

  auditLog('knowledge', 'KNOWLEDGE_UPDATED', id, 'success', { updated_fields: Object.keys(body) });

  return getKnowledgeById(id);
}

// ── DELETE /api/knowledge/:id ───────────────────────────────────────────────
function deleteKnowledge(id: string) {
  const database = db.getDatabase();
  const existing = database.prepare('SELECT id FROM knowledge_entries WHERE id = ?').get(id);
  if (!existing) return false;

  database.prepare('DELETE FROM knowledge_links WHERE knowledge_id = ?').run(id);
  database.prepare('DELETE FROM knowledge_entries WHERE id = ?').run(id);

  auditLog('knowledge', 'KNOWLEDGE_DELETED', id, 'success', {});
  return true;
}

// ── POST /api/knowledge/link ─────────────────────────────────────────────────
function linkKnowledge(body: any) {
  const database = db.getDatabase();
  const { knowledge_id, target_type, target_id, relation_type } = body;

  if (!knowledge_id || !target_type || !target_id) {
    throw new Error('knowledge_id, target_type, and target_id are required');
  }

  const relType = VALID_RELATION_TYPES.includes(relation_type) ? relation_type : 'relates_to';
  const linkId = uuid();
  const ts = now();

  database.prepare(`
    INSERT OR IGNORE INTO knowledge_links (id, knowledge_id, target_type, target_id, relation_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(linkId, knowledge_id, target_type, target_id, relType, ts);

  auditLog('knowledge', 'KNOWLEDGE_LINKED', knowledge_id, 'success', {
    link_id: linkId, target_type, target_id, relation_type: relType,
  });

  return { ok: true, link_id: linkId };
}

// ── POST /api/knowledge/unlink ───────────────────────────────────────────────
function unlinkKnowledge(body: any) {
  const database = db.getDatabase();
  const { knowledge_id, target_type, target_id } = body;

  if (!knowledge_id || !target_type || !target_id) {
    throw new Error('knowledge_id, target_type, and target_id are required');
  }

  const info = database.prepare(`
    SELECT id FROM knowledge_links WHERE knowledge_id = ? AND target_type = ? AND target_id = ?
  `).get(knowledge_id, target_type, target_id) as any;

  if (!info) return { ok: false, error: 'Link not found' };

  database.prepare(`
    DELETE FROM knowledge_links WHERE knowledge_id = ? AND target_type = ? AND target_id = ?
  `).run(knowledge_id, target_type, target_id);

  auditLog('knowledge', 'KNOWLEDGE_UNLINKED', knowledge_id, 'success', { target_type, target_id });

  return { ok: true };
}

// ── GET /api/knowledge/by-entity/:type/:id ───────────────────────────────────
function getKnowledgeByEntity(type: string, id: string) {
  const database = db.getDatabase();

  const rows = database.prepare(`
    SELECT ke.*, kl.relation_type, kl.target_type, kl.target_id
    FROM knowledge_entries ke
    JOIN knowledge_links kl ON ke.id = kl.knowledge_id
    WHERE kl.target_type = ? AND kl.target_id = ?
    ORDER BY ke.created_at DESC
  `).all(type, id) as any[];

  return { entries: rows, count: rows.length };
}

// ── GET /api/knowledge/:id/links ─────────────────────────────────────────────
function getKnowledgeLinks(id: string) {
  const database = db.getDatabase();
  const links = database.prepare(`
    SELECT * FROM knowledge_links WHERE knowledge_id = ?
  `).all(id) as any[];
  return { links, count: links.length };
}

// ── GET /api/knowledge/categories ───────────────────────────────────────────
function getCategories() {
  return { categories: VALID_CATEGORIES };
}

// ── GET /api/knowledge/relation-types ───────────────────────────────────────
function getRelationTypes() {
  return { relation_types: VALID_RELATION_TYPES };
}

// ── Register Routes ──────────────────────────────────────────────────────────
export function registerKnowledgeRoutes(app: any) {
  // 列表 + 查询
  app.get('/api/knowledge', async (request: any, reply: any) => {
    const { category, source_type, source_id, tag, keyword, limit, offset } = request.query;
    const result = getKnowledgeList({
      category, source_type, source_id, tag, keyword,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    return { ok: true, ...result };
  });

  // 枚举
  app.get('/api/knowledge/categories', async (_: any, reply: any) => {
    return getCategories();
  });

  app.get('/api/knowledge/relation-types', async (_: any, reply: any) => {
    return getRelationTypes();
  });

  // 详情
  app.get('/api/knowledge/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const entry = getKnowledgeById(id);
    if (!entry) return reply.code(404).send({ ok: false, error: 'Knowledge entry not found' });
    return { ok: true, entry };
  });

  // 新增
  app.post('/api/knowledge', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.title) {
      return reply.code(400).send({ ok: false, error: 'title is required' });
    }
    const entry = createKnowledge(body);
    return reply.code(201).send({ ok: true, entry });
  });

  // 更新
  app.put('/api/knowledge/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const body = request.body || {};
    const entry = updateKnowledge(id, body);
    if (!entry) return reply.code(404).send({ ok: false, error: 'Knowledge entry not found' });
    return { ok: true, entry };
  });

  // 删除
  app.delete('/api/knowledge/:id', async (request: any, reply: any) => {
    const { id } = request.params;
    const deleted = deleteKnowledge(id);
    if (!deleted) return reply.code(404).send({ ok: false, error: 'Knowledge entry not found' });
    return { ok: true };
  });

  // 关联
  app.post('/api/knowledge/link', async (request: any, reply: any) => {
    const body = request.body || {};
    try {
      const result = linkKnowledge(body);
      return { ok: true, ...result };
    } catch (e: any) {
      return reply.code(400).send({ ok: false, error: e.message });
    }
  });

  app.post('/api/knowledge/unlink', async (request: any, reply: any) => {
    const body = request.body || {};
    const result = unlinkKnowledge(body);
    if (!result.ok) return reply.code(404).send({ ok: false, error: 'Link not found' });
    return { ok: true };
  });

  // 某条目的所有关联
  app.get('/api/knowledge/:id/links', async (request: any, reply: any) => {
    const { id } = request.params;
    return getKnowledgeLinks(id);
  });

  // 按实体查关联知识
  app.get('/api/knowledge/by-entity/:type/:id', async (request: any, reply: any) => {
    const { type, id } = request.params;
    const result = getKnowledgeByEntity(type, id);
    return { ok: true, ...result };
  });

  console.log('[Knowledge] Routes registered');
}
