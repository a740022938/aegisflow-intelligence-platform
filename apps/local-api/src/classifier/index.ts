// apps/local-api/src/classifier/index.ts
// v3.9.x Classifier Verification — CRUD 入口 + workflow 回调
import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { getDatabase } from '../db/builtin-sqlite.js';
import {
  ClassifierVerification,
  ClassifierManifest,
  CreateClassifierVerificationBody,
  UpdateClassifierVerificationBody,
} from './types.js';

const now = () => new Date().toISOString();

// ─── 辅助：安全解析 JSON 字段 ──────────────────────────────────────
function parseJsonField(raw: any): any {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
}

// ─── 辅助：加载 manifest JSON ─────────────────────────────────────
function loadManifest(manifestPath: string): ClassifierManifest | null {
  if (!manifestPath || !existsSync(manifestPath)) return null;
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8')) as ClassifierManifest;
  } catch { return null; }
}

// ─── 辅助：注册 classifier_result artifact ────────────────────────
function registerArtifact(
  db: any,
  verificationId: string,
  manifest: ClassifierManifest,
): string {
  const artifactId = `cv-artifact-${uuidv4().slice(0, 8)}`;
  try {
    db.prepare(`
      INSERT INTO artifacts (artifact_id, type, source_type, source_id, path, metadata, created_at)
      VALUES (?, 'classifier_result', 'segmentation', ?, ?, ?, ?)
    `).run(
      artifactId,
      manifest.source_segmentation_id,
      manifest.model_info?.checkpoint || '',
      JSON.stringify({
        verification_id: verificationId,
        ...manifest.summary,
        weight_load_strategy: manifest.model_info?.weight_load_strategy,
      }),
      now(),
    );
  } catch(e: any) {
    console.warn('[classifier] artifact registration failed:', e.message);
  }
  return artifactId;
}

// ─── 辅助：写 audit log ─────────────────────────────────────────────
function logAudit(db: any, action: string, detail: Record<string, any>): void {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'classifier', ?, ?, 'success', ?, ?)
    `).run(
      uuidv4(),
      action,
      detail['verification_id'] || '',
      JSON.stringify(detail),
      now(),
    );
  } catch(e: any) {
    console.warn('[classifier] audit log failed:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────────
// POST /api/vision/classifier-verifications — 从 segmentation 发起
// ─────────────────────────────────────────────────────────────────
async function createHandler(body: CreateClassifierVerificationBody) {
  const db = getDatabase();
  const {
    segmentation_id,
    classifier_model_type = 'resnet18',
    classifier_model_path = '',
    device = 'cpu',
    max_items = 0,
  } = body;

  if (!segmentation_id) return { ok: false, error: 'segmentation_id required' };

  // ① 校验 segmentation_id 存在且已完成
  const seg = db.prepare('SELECT * FROM sam_segmentations WHERE segmentation_id = ?').get(segmentation_id) as any;
  if (!seg) return { ok: false, error: 'segmentation not found' };
  if (seg.status !== 'completed') return { ok: false, error: `segmentation not completed: status=${seg.status}` };

  // ② 幂等：复用已有记录
  const existing = db.prepare(
    'SELECT verification_id FROM classifier_verifications WHERE source_segmentation_id = ?',
  ).get(segmentation_id) as any;
  if (existing) {
    return { ok: true, verification_id: existing.verification_id, reused: true };
  }

  const verification_id = `verif-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const ts = now();

  db.prepare(`
    INSERT INTO classifier_verifications
      (verification_id, name, status, source_segmentation_id, source_handoff_id,
       source_experiment_id, source_model_id, source_dataset_id,
       manifest_path, model_type, classifier_model_path, execution_mode,
       created_at, updated_at)
    VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, '', ?, ?, 'real', ?, ?)
  `).run(
    verification_id,
    `Classifier Verify — ${segmentation_id}`,
    segmentation_id,
    seg.source_handoff_id || '',
    seg.source_experiment_id || '',
    seg.source_model_id || '',
    seg.source_dataset_id || '',
    classifier_model_type,
    classifier_model_path,
    ts, ts,
  );

  logAudit(db, 'classifier_verification_created', {
    verification_id,
    segmentation_id,
    source_experiment_id: seg.source_experiment_id,
    model_type: classifier_model_type,
  });

  return { ok: true, verification_id, status: 'pending' };
}

// ─────────────────────────────────────────────────────────────────
// GET /api/vision/classifier-verifications/:id — 单条详情
// ─────────────────────────────────────────────────────────────────
async function getByIdHandler(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id) as any;
  if (!row) return { ok: false, error: 'not found' };

  let item_results: any[] = [];
  let model_info: any = null;

  if (row.manifest_path && row.status === 'completed') {
    const manifest = loadManifest(row.manifest_path);
    if (manifest) {
      item_results = manifest.item_results || [];
      model_info = manifest.model_info || null;
    }
  }

  return { ok: true, verification: row, item_results, model_info };
}

// ─────────────────────────────────────────────────────────────────
// PATCH /api/vision/classifier-verifications/:id — 状态更新（人工 override）
// ─────────────────────────────────────────────────────────────────
async function updateHandler(id: string, body: UpdateClassifierVerificationBody) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: 'not found' };

  const { status, name } = body;
  const before_status = existing.status;
  const updates: string[] = ['updated_at = ?'];
  const params: any[] = [now()];

  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (name !== undefined)  { updates.push('name = ?');   params.push(name); }

  params.push(id);
  db.prepare(`UPDATE classifier_verifications SET ${updates.join(', ')} WHERE verification_id = ?`).run(...params);

  logAudit(db, 'classifier_verification_updated', {
    verification_id: id,
    before_status,
    after_status: status || before_status,
  });

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// DELETE /api/vision/classifier-verifications/:id — 软删
// ─────────────────────────────────────────────────────────────────
async function deleteHandler(id: string) {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM classifier_verifications WHERE verification_id = ?').get(id) as any;
  if (!existing) return { ok: false, error: 'not found' };

  db.prepare(
    `UPDATE classifier_verifications SET status = 'deleted', updated_at = ? WHERE verification_id = ?`,
  ).run(now(), id);

  logAudit(db, 'classifier_verification_deleted', {
    verification_id: id,
    original_segmentation_id: existing.source_segmentation_id,
  });

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// 路由注册（由 index.ts 在启动时调用）
// ─────────────────────────────────────────────────────────────────
export function registerClassifierRoutes(app: FastifyInstance): void {
  // POST create
  app.post('/api/vision/classifier-verifications', async (req, reply) => {
    const result = await createHandler(req.body as CreateClassifierVerificationBody);
    if (!result.ok) reply.code(400);
    return result;
  });

  // GET detail
  app.get('/api/vision/classifier-verifications/:id', async (req, reply) => {
    const result = await getByIdHandler((req.params as any).id);
    if (!result.ok) reply.code(404);
    return result;
  });

  // PATCH update
  app.patch('/api/vision/classifier-verifications/:id', async (req, reply) => {
    const result = await updateHandler((req.params as any).id, req.body as UpdateClassifierVerificationBody);
    if (!result.ok) reply.code(404);
    return result;
  });

  // DELETE soft-delete
  app.delete('/api/vision/classifier-verifications/:id', async (req, reply) => {
    const result = await deleteHandler((req.params as any).id);
    if (!result.ok) reply.code(404);
    return result;
  });
}
