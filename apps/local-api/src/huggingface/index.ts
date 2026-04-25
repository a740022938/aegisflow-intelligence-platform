import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function nowIso() { return new Date().toISOString(); }
function getDataRoot(): string {
  return process.env.AGI_FACTORY_ROOT || process.env.AIP_REPO_ROOT || resolve(process.cwd(), '../..');
}

export function registerHuggingFaceRoutes(app: FastifyInstance) {
  const db = getDatabase();

  app.post('/api/hub/pull', async (request: any, reply: any) => {
    const body = request.body || {};
    const repoId = String(body.repo || body.model || '');
    const modelName = String(body.name || repoId.split('/').pop() || 'model');
    const task = String(body.task || 'detect');
    const modelId = `hf_${randomUUID().slice(0, 12)}`;
    const modelDir = join(getDataRoot(), 'models', 'huggingface', modelId);
    mkdirSync(modelDir, { recursive: true });

    if (!repoId) return reply.code(400).send({ ok: false, error: 'repo id required (e.g. ultralytics/yolov8n)' });

    try {
      const result = execSync(`python -c "
from huggingface_hub import snapshot_download
import json, sys
path = snapshot_download(repo_id='${repoId}', local_dir=r'${modelDir}')
sys.stdout.write(json.dumps({'path': path, 'ok': True}))
" 2>&1`, { encoding: 'utf-8', timeout: 120000 });
      const parsed = JSON.parse(result.trim().split('\n').filter(l => l.startsWith('{')).pop() || '{}');
      const now = nowIso();
      db.prepare(`INSERT INTO storage_models (id, name, version, architecture, storage_path, backend, tags, metrics_json, created_at) VALUES (?, ?, '1.0-hf', ?, ?, 'huggingface', ?, ?, ?)`)
        .run(modelId, modelName, task, modelDir, JSON.stringify({ repo: repoId, source: 'huggingface' }), JSON.stringify({}), now);
      return { ok: true, model_id: modelId, model_name: modelName, repo: repoId, path: modelDir };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  });

  app.post('/api/hub/search', async (request: any, reply: any) => {
    const query = String(request.body?.query || 'yolo');
    try {
      const result = execSync(`python -c "
from huggingface_hub import HfApi
import json
api = HfApi()
models = list(api.list_models(search='${query}', sort='downloads', direction=-1, limit=20))
output = [{'id': m.modelId, 'pipeline': m.pipeline_tag, 'downloads': m.downloads} for m in models]
print(json.dumps(output))
" 2>&1`, { encoding: 'utf-8', timeout: 30000 });
      const models = JSON.parse(result.trim().split('\n').filter(l => l.startsWith('[')).pop() || '[]');
      return { ok: true, query, models, count: models.length };
    } catch (err: any) {
      const fallback = [
        { id: 'ultralytics/yolov8n', pipeline: 'object-detection', downloads: '10M+' },
        { id: 'ultralytics/yolov8s', pipeline: 'object-detection', downloads: '5M+' },
        { id: 'facebook/sam-vit-base', pipeline: 'image-segmentation', downloads: '1M+' },
        { id: 'microsoft/resnet-50', pipeline: 'image-classification', downloads: '5M+' },
        { id: 'google/vit-base-patch16-224', pipeline: 'image-classification', downloads: '2M+' },
      ];
      return { ok: true, query, models: fallback, count: fallback.length, note: 'offline-fallback' };
    }
  });

  app.post('/api/hub/export', async (request: any, reply: any) => {
    const body = request.body || {};
    const modelId = String(body.model_id || '');
    const format = String(body.format || 'onnx');
    if (!modelId) return reply.code(400).send({ ok: false, error: 'model_id required' });

    const model = db.prepare('SELECT * FROM storage_models WHERE id = ?').get(modelId) as any;
    if (!model) return reply.code(404).send({ ok: false, error: 'model not found' });

    const exportDir = join(model.storage_path, format);
    mkdirSync(exportDir, { recursive: true });

    try {
      const weightPath = join(model.storage_path, 'model.pt');
      if (existsSync(weightPath)) {
        execSync(`python -c "
import torch
model = torch.load(r'${weightPath}', map_location='cpu')
torch.onnx.export(model, torch.randn(1,3,640,640), r'${join(exportDir, 'model.onnx')}')
print('ONNX export done')
" 2>&1`, { encoding: 'utf-8', timeout: 120000 });
      }
      return { ok: true, model_id: modelId, format, export_path: exportDir };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  });
}
