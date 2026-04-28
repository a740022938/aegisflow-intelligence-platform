/**
 * v6.3.0 Feedback Loop API — minimum closure
 * Source/Trigger types: failed_case | low_confidence | manual_flag
 */

import fs from 'node:fs';
import path from 'node:path';
import { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';

type FeedbackType = 'failed_case' | 'low_confidence' | 'manual_flag';

const FEEDBACK_TYPES: FeedbackType[] = ['failed_case', 'low_confidence', 'manual_flag'];

function genId(prefix = 'fb'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function now(): string {
  return new Date().toISOString();
}

function parseJson(raw: any): any {
  if (!raw) return {};
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch { return {}; }
}

function toJsonString(v: any): string {
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v ?? {}); }
  catch { return '{}'; }
}

function normalizeType(value: any, fallback: FeedbackType): FeedbackType {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (FEEDBACK_TYPES.includes(raw as FeedbackType)) return raw as FeedbackType;
  if (raw === 'manual') return 'manual_flag';
  if (raw === 'evaluation') return fallback;
  return fallback;
}

function presentType(sourceType: any, triggerType: any): FeedbackType {
  const s = String(sourceType || '').trim();
  const t = String(triggerType || '').trim();
  if (FEEDBACK_TYPES.includes(s as FeedbackType)) return s as FeedbackType;
  if (FEEDBACK_TYPES.includes(t as FeedbackType)) return t as FeedbackType;
  if (s === 'manual') return 'manual_flag';
  if (s === 'evaluation') {
    if (t === 'low_confidence') return 'low_confidence';
    return 'failed_case';
  }
  return 'manual_flag';
}

function exportDirPath(): string {
  // local-api cwd is the api project root
  return path.resolve(process.cwd(), '../..', 'outputs', 'feedback_exports');
}

function auditLog(action: string, target: string, result: 'success' | 'failed', detail: any) {
  try {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'feedback', ?, ?, ?, ?, ?)
    `).run(genId('audit'), action, target || 'feedback', result, toJsonString(detail || {}), now());
  } catch (e) {
    console.error('[Feedback Audit] write failed:', e);
  }
}

function fail(action: string, target: string, error: string, detail: any = {}) {
  auditLog('feedback_failed', target, 'failed', {
    action,
    error,
    ...detail,
  });
  return { ok: false, error };
}

// ── Feedback Batches ───────────────────────────────────────────────────────

function listBatches(query: {
  source?: string;
  trigger?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): any {
  try {
    const db = getDatabase();
    const limit = Math.min(Number(query.limit || 50), 200);
    const offset = Number(query.offset || 0);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.source) {
      const source = normalizeType(query.source, 'manual_flag');
      conditions.push('(source_type = ? OR trigger_type = ?)');
      params.push(source, source);
    }
    if (query.trigger) {
      const trigger = normalizeType(query.trigger, 'manual_flag');
      conditions.push('trigger_type = ?');
      params.push(trigger);
    }
    if (query.status) {
      conditions.push('status = ?');
      params.push(query.status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) as n FROM feedback_batches ${where}`).get(...params) as any)?.n || 0;
    const batches = db.prepare(`
      SELECT * FROM feedback_batches ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const mapped = batches.map((b: any) => ({
      id: b.id,
      name: b.title,
      source: presentType(b.source_type, b.trigger_type),
      source_ref: b.source_id,
      trigger: normalizeType(b.trigger_type, presentType(b.source_type, b.trigger_type)),
      status: b.status,
      item_count: b.item_count,
      notes: b.notes,
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));

    auditLog('feedback_view', 'feedback-batches', 'success', {
      route: 'list',
      filters: {
        source: query.source || '',
        trigger: query.trigger || '',
        status: query.status || '',
      },
      total,
      limit,
      offset,
    });

    return { ok: true, batches: mapped, total };
  } catch (e: any) {
    return fail('list_batches', 'feedback-batches', e.message || 'list failed');
  }
}

function getBatchById(id: string): any {
  try {
    const db = getDatabase();
    const b = db.prepare('SELECT * FROM feedback_batches WHERE id = ?').get(id) as any;
    if (!b) return fail('get_batch', id, 'Batch not found');

    const items = db.prepare('SELECT * FROM feedback_items WHERE batch_id = ? ORDER BY created_at DESC').all(id);
    const mappedItems = items.map((item: any) => ({
      id: item.id,
      batch_id: item.batch_id,
      source_ref: item.source_task_id,
      source_model: item.source_model_id,
      source_dataset: item.source_dataset_id,
      file_path: item.file_path,
      predicted_label: item.predicted_label,
      ground_truth: item.ground_truth,
      confidence: item.confidence,
      reason: item.reason,
      status: item.status,
      label_json: parseJson(item.label_json),
      reviewed_at: item.reviewed_at,
      reviewed_by: item.reviewed_by,
      created_at: item.created_at,
    }));

    auditLog('feedback_view', id, 'success', {
      route: 'detail',
      item_count: mappedItems.length,
    });

    return {
      ok: true,
      batch: {
        id: b.id,
        name: b.title,
        source: presentType(b.source_type, b.trigger_type),
        source_ref: b.source_id,
        trigger: normalizeType(b.trigger_type, presentType(b.source_type, b.trigger_type)),
        status: b.status,
        item_count: b.item_count,
        notes: b.notes,
        created_at: b.created_at,
        updated_at: b.updated_at,
        items: mappedItems,
      },
    };
  } catch (e: any) {
    return fail('get_batch', id, e.message || 'detail failed');
  }
}

function createBatch(body: {
  name: string;
  source?: string;
  trigger?: string;
  source_ref?: string;
  notes?: string;
}): any {
  try {
    const db = getDatabase();
    const name = String(body.name || '').trim();
    if (!name) return fail('create_batch', 'feedback-batches', 'name is required');

    const id = genId('fb');
    const source = normalizeType(body.source || body.trigger, 'manual_flag');
    const trigger = normalizeType(body.trigger || source, source);
    const nowStr = now();

    db.prepare(`
      INSERT INTO feedback_batches (id, title, source_type, source_id, trigger_type, status, item_count, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'open', 0, ?, ?, ?)
    `).run(id, name, source, body.source_ref || '', trigger, body.notes || '', nowStr, nowStr);

    auditLog('feedback_register', id, 'success', {
      source,
      trigger,
      source_ref: body.source_ref || '',
    });

    return {
      ok: true,
      batch: {
        id,
        name,
        source,
        trigger,
        status: 'open',
        item_count: 0,
      },
    };
  } catch (e: any) {
    return fail('create_batch', 'feedback-batches', e.message || 'create failed');
  }
}

function updateBatch(id: string, body: { name?: string; status?: string; notes?: string }): any {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM feedback_batches WHERE id = ?').get(id);
    if (!existing) return fail('update_batch', id, 'Batch not found');

    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now()];

    if (body.name) { updates.push('title = ?'); params.push(body.name); }
    if (body.status) { updates.push('status = ?'); params.push(body.status); }
    if (body.notes !== undefined) { updates.push('notes = ?'); params.push(body.notes); }

    params.push(id);
    db.prepare(`UPDATE feedback_batches SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    auditLog('feedback_register', id, 'success', {
      route: 'update_batch',
      updated_fields: Object.keys(body),
    });

    return getBatchById(id);
  } catch (e: any) {
    return fail('update_batch', id, e.message || 'update failed');
  }
}

function deleteBatch(id: string): any {
  try {
    const db = getDatabase();
    db.prepare('DELETE FROM feedback_items WHERE batch_id = ?').run(id);
    db.prepare('DELETE FROM feedback_batches WHERE id = ?').run(id);
    auditLog('feedback_register', id, 'success', { route: 'delete_batch' });
    return { ok: true };
  } catch (e: any) {
    return fail('delete_batch', id, e.message || 'delete failed');
  }
}

function closeBatch(id: string): any {
  try {
    const db = getDatabase();
    db.prepare(`UPDATE feedback_batches SET status = 'closed', updated_at = ? WHERE id = ?`).run(now(), id);
    auditLog('feedback_register', id, 'success', { route: 'close_batch' });
    return getBatchById(id);
  } catch (e: any) {
    return fail('close_batch', id, e.message || 'close failed');
  }
}

function exportBatch(id: string): any {
  try {
    const db = getDatabase();
    const b = db.prepare('SELECT * FROM feedback_batches WHERE id = ?').get(id) as any;
    if (!b) return fail('export_batch', id, 'Batch not found');

    const items = db.prepare('SELECT * FROM feedback_items WHERE batch_id = ? ORDER BY created_at DESC').all(id) as any[];

    const source = presentType(b.source_type, b.trigger_type);
    const trigger = normalizeType(b.trigger_type, source);

    const manifest = {
      export_version: '1.0',
      batch_id: id,
      batch_name: b.title,
      source,
      trigger,
      exported_at: now(),
      item_count: items.length,
      items: items.map((item: any) => ({
        id: item.id,
        source_task_id: item.source_task_id,
        source_model_id: item.source_model_id,
        source_dataset_id: item.source_dataset_id,
        file_path: item.file_path,
        predicted_label: item.predicted_label,
        ground_truth: item.ground_truth,
        confidence: item.confidence,
        reason: item.reason,
        label_json: parseJson(item.label_json),
      })),
    };

    const outDir = exportDirPath();
    fs.mkdirSync(outDir, { recursive: true });
    const filename = `feedback_manifest_${id}_${Date.now()}.json`;
    const manifestPath = path.join(outDir, filename);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    db.prepare(`UPDATE feedback_batches SET status = 'exported', updated_at = ? WHERE id = ?`).run(now(), id);

    auditLog('feedback_export', id, 'success', {
      item_count: items.length,
      manifest_path: manifestPath,
    });

    return { ok: true, manifest, manifest_path: manifestPath };
  } catch (e: any) {
    return fail('export_batch', id, e.message || 'export failed');
  }
}

// ── Feedback Items ─────────────────────────────────────────────────────────

function listItems(query: {
  batch_id?: string;
  source_model?: string;
  source_dataset?: string;
  source?: string;
  trigger?: string;
  limit?: number;
  offset?: number;
}): any {
  try {
    const db = getDatabase();
    const limit = Math.min(Number(query.limit || 50), 200);
    const offset = Number(query.offset || 0);
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.batch_id) { conditions.push('fi.batch_id = ?'); params.push(query.batch_id); }
    if (query.source_model) { conditions.push('fi.source_model_id = ?'); params.push(query.source_model); }
    if (query.source_dataset) { conditions.push('fi.source_dataset_id = ?'); params.push(query.source_dataset); }
    if (query.source) {
      const source = normalizeType(query.source, 'manual_flag');
      conditions.push('(fb.source_type = ? OR fb.trigger_type = ?)');
      params.push(source, source);
    }
    if (query.trigger) {
      const trigger = normalizeType(query.trigger, 'manual_flag');
      conditions.push('fb.trigger_type = ?');
      params.push(trigger);
    }

    const from = 'FROM feedback_items fi LEFT JOIN feedback_batches fb ON fi.batch_id = fb.id';
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = (db.prepare(`SELECT COUNT(*) as n ${from} ${where}`).get(...params) as any)?.n || 0;
    const items = db.prepare(`
      SELECT fi.*, fb.trigger_type, fb.source_type ${from}
      ${where}
      ORDER BY fi.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const mapped = items.map((item: any) => ({
      id: item.id,
      batch_id: item.batch_id,
      source: presentType(item.source_type, item.trigger_type),
      trigger: normalizeType(item.trigger_type, presentType(item.source_type, item.trigger_type)),
      source_ref: item.source_task_id,
      source_model: item.source_model_id,
      source_dataset: item.source_dataset_id,
      file_path: item.file_path,
      predicted_label: item.predicted_label,
      ground_truth: item.ground_truth,
      confidence: item.confidence,
      reason: item.reason,
      status: item.status,
      label_json: parseJson(item.label_json),
      reviewed_at: item.reviewed_at,
      reviewed_by: item.reviewed_by,
      created_at: item.created_at,
    }));

    auditLog('feedback_view', 'feedback-items', 'success', {
      route: 'list_items',
      filters: {
        batch_id: query.batch_id || '',
        source: query.source || '',
        trigger: query.trigger || '',
      },
      total,
      limit,
      offset,
    });

    return { ok: true, items: mapped, total };
  } catch (e: any) {
    return fail('list_items', 'feedback-items', e.message || 'list items failed');
  }
}

function getItemById(id: string): any {
  try {
    const db = getDatabase();
    const item = db.prepare('SELECT * FROM feedback_items WHERE id = ?').get(id) as any;
    if (!item) return fail('get_item', id, 'Item not found');

    auditLog('feedback_view', id, 'success', { route: 'item_detail' });
    return { ok: true, item };
  } catch (e: any) {
    return fail('get_item', id, e.message || 'item detail failed');
  }
}

function createItem(body: {
  batch_id: string;
  file_path?: string;
  predicted_label?: string;
  ground_truth?: string;
  confidence?: number;
  reason?: string;
  label_json?: any;
  source_task_id?: string;
  source_model_id?: string;
  source_dataset_id?: string;
}): any {
  try {
    if (!body.batch_id) return fail('create_item', 'feedback-items', 'batch_id is required');

    const db = getDatabase();
    const batch = db.prepare('SELECT id FROM feedback_batches WHERE id = ?').get(body.batch_id) as any;
    if (!batch) return fail('create_item', body.batch_id, 'Batch not found');

    const id = genId('fi');
    const nowStr = now();

    db.prepare(`
      INSERT INTO feedback_items (id, batch_id, file_path, predicted_label, ground_truth, confidence, reason,
        label_json, source_task_id, source_model_id, source_dataset_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      id,
      body.batch_id,
      body.file_path || '',
      body.predicted_label || '',
      body.ground_truth || '',
      body.confidence || 0,
      body.reason || '',
      toJsonString(body.label_json || {}),
      body.source_task_id || '',
      body.source_model_id || '',
      body.source_dataset_id || '',
      nowStr,
    );

    db.prepare('UPDATE feedback_batches SET item_count = item_count + 1, updated_at = ? WHERE id = ?').run(nowStr, body.batch_id);

    auditLog('feedback_register', id, 'success', {
      route: 'create_item',
      batch_id: body.batch_id,
    });

    return { ok: true, item: { id, ...body } };
  } catch (e: any) {
    return fail('create_item', body.batch_id || 'feedback-items', e.message || 'create item failed');
  }
}

function bulkCreateItems(items: any[]): any {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return fail('bulk_create_items', 'feedback-items', 'items is required');
    }

    const db = getDatabase();
    const nowStr = now();
    const created: any[] = [];
    const batchCounts: Record<string, number> = {};

    for (const body of items) {
      if (!body.batch_id) continue;
      const id = genId('fi');
      db.prepare(`
        INSERT INTO feedback_items (id, batch_id, file_path, predicted_label, ground_truth, confidence, reason,
          label_json, source_task_id, source_model_id, source_dataset_id, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(
        id,
        body.batch_id,
        body.file_path || '',
        body.predicted_label || '',
        body.ground_truth || '',
        body.confidence || 0,
        body.reason || '',
        toJsonString(body.label_json || {}),
        body.source_task_id || '',
        body.source_model_id || '',
        body.source_dataset_id || '',
        nowStr,
      );
      created.push({ id, ...body });
      batchCounts[body.batch_id] = (batchCounts[body.batch_id] || 0) + 1;
    }

    for (const [batchId, count] of Object.entries(batchCounts)) {
      db.prepare('UPDATE feedback_batches SET item_count = item_count + ?, updated_at = ? WHERE id = ?').run(count, nowStr, batchId);
    }

    auditLog('feedback_register', 'feedback-items', 'success', {
      route: 'bulk_create_items',
      created_count: created.length,
      batch_count: Object.keys(batchCounts).length,
    });

    return { ok: true, created_count: created.length, items: created };
  } catch (e: any) {
    return fail('bulk_create_items', 'feedback-items', e.message || 'bulk create failed');
  }
}

function updateItem(id: string, body: { status?: string; label_json?: any; reviewed_by?: string }): any {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM feedback_items WHERE id = ?').get(id);
    if (!existing) return fail('update_item', id, 'Item not found');

    const updates: string[] = [];
    const params: any[] = [];

    if (body.status) { updates.push('status = ?'); params.push(body.status); }
    if (body.label_json !== undefined) {
      updates.push('label_json = ?'); params.push(toJsonString(body.label_json));
      updates.push('reviewed_at = ?'); params.push(now());
      updates.push('reviewed_by = ?'); params.push(body.reviewed_by || 'system');
    }

    if (updates.length) {
      params.push(id);
      db.prepare(`UPDATE feedback_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    auditLog('feedback_register', id, 'success', {
      route: 'update_item',
      updated_fields: Object.keys(body),
    });

    return getItemById(id);
  } catch (e: any) {
    return fail('update_item', id, e.message || 'update item failed');
  }
}

function deleteItem(id: string): any {
  try {
    const db = getDatabase();
    const item = db.prepare('SELECT * FROM feedback_items WHERE id = ?').get(id) as any;
    if (!item) return fail('delete_item', id, 'Item not found');

    db.prepare('DELETE FROM feedback_items WHERE id = ?').run(id);
    db.prepare('UPDATE feedback_batches SET item_count = item_count - 1, updated_at = ? WHERE id = ?').run(now(), item.batch_id);

    auditLog('feedback_register', id, 'success', {
      route: 'delete_item',
      batch_id: item.batch_id,
    });

    return { ok: true };
  } catch (e: any) {
    return fail('delete_item', id, e.message || 'delete item failed');
  }
}

// ── Register Routes ────────────────────────────────────────────────────────

export async function registerFeedbackRoutes(_app: FastifyInstance): Promise<void> {
  _app.get('/api/feedback-batches', async (request: any) => listBatches(request.query || {}));
  _app.get('/api/feedback-batches/:id', async (request: any) => getBatchById(request.params.id));
  _app.post('/api/feedback-batches', async (request: any) => createBatch(request.body || {}));
  _app.put('/api/feedback-batches/:id', async (request: any) => updateBatch(request.params.id, request.body || {}));
  _app.delete('/api/feedback-batches/:id', async (request: any) => deleteBatch(request.params.id));
  _app.post('/api/feedback-batches/:id/close', async (request: any) => closeBatch(request.params.id));
  _app.post('/api/feedback-batches/:id/export', async (request: any) => exportBatch(request.params.id));

  _app.get('/api/feedback-items', async (request: any) => listItems(request.query || {}));
  _app.get('/api/feedback-items/:id', async (request: any) => getItemById(request.params.id));
  _app.post('/api/feedback-items', async (request: any) => createItem(request.body || {}));
  _app.post('/api/feedback-items/bulk', async (request: any) => bulkCreateItems(request.body?.items || []));
  _app.put('/api/feedback-items/:id', async (request: any) => updateItem(request.params.id, request.body || {}));
  _app.delete('/api/feedback-items/:id', async (request: any) => deleteItem(request.params.id));
}
