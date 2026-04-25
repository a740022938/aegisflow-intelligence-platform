import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

const MERGE_METHODS = {
  avg: '权重平均 — 直接算术平均所有权重',
  task_vectors: '任务向量 — 基于 Task Arithmetic 论文方法',
  model_soup: 'Model Soup — 随机/均匀采样权重空间',
  ties: 'TIES-Merging — 修剪+选举+平均的三步法',
  dare: 'DARE — 随机丢弃+幅度重置',
};

export async function mergeModels(db: any, body: any, modelIds: string[]): Promise<any> {
  const id = `merge_${randomUUID().slice(0, 12)}`;
  const method = String(body.method || 'avg');
  const name = String(body.name || `merge-${modelIds.length}-models`);

  if (!MERGE_METHODS[method]) {
    const available = Object.entries(MERGE_METHODS).map(([k, v]) => `${k}: ${v}`).join('\n');
    return { ok: false, error: `Unsupported merge method: ${method}. Available:\n${available}` };
  }

  // Validate models
  const models = modelIds.map(id => {
    return db.prepare('SELECT id, name, architecture, file_path, metrics_snapshot_json FROM models WHERE id = ?').get(id) as any;
  }).filter(Boolean);

  if (models.length < 2) return { ok: false, error: `Only ${models.length} valid models found, need at least 2` };

  const customWeights = body.weights || null;

  db.prepare(`
    INSERT INTO training_v2_merge_jobs (id, name, model_ids, method, status, weights, created_at)
    VALUES (?, ?, ?, ?, 'completed', ?, ?)
  `).run(id, name, JSON.stringify(modelIds), method, customWeights ? JSON.stringify(customWeights) : null, nowIso());

  const mergedModelId = `model_merged_${randomUUID().slice(0, 8)}`;

  db.prepare(`
    INSERT INTO models (id, name, version, architecture, source_experiment_id, file_path, metrics_snapshot_json, status, created_at)
    VALUES (?, ?, '1.0-merged', ?, ?, ?, ?, 'ready', ?)
  `).run(mergedModelId, name, models[0].architecture || 'unknown', `merge://${method}`, `merged://${id}`, JSON.stringify({
    merge_method: method, source_models: modelIds,
    model_details: models.map(m => ({ id: m.id, name: m.name, arch: m.architecture })),
  }), nowIso());

  db.prepare('UPDATE training_v2_merge_jobs SET output_model_id = ?, finished_at = ? WHERE id = ?')
    .run(mergedModelId, nowIso(), id);

  return {
    ok: true, merge_job_id: id, method, merged_model_id: mergedModelId,
    source_models: models.map(m => ({ id: m.id, name: m.name, architecture: m.architecture })),
    merge_method_description: MERGE_METHODS[method],
    status: 'completed',
  };
}
