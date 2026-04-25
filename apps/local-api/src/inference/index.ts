import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function nowIso() { return new Date().toISOString(); }

function resolveRepoRoot(): string {
  if (process.env.AIP_REPO_ROOT) return process.env.AIP_REPO_ROOT;
  const c = process.cwd();
  const candidates = [c, join(c, '..'), join(c, '../..'), resolve(__dirname, '../../../..')];
  for (const cand of candidates) {
    if (existsSync(join(cand, 'workers', 'python-worker'))) return cand;
  }
  return join(c, '../..');
}

export function registerInferenceRoutes(app: FastifyInstance) {
  const db = getDatabase();

  app.post('/api/infer', async (request: any, reply: any) => {
    const body = request.body || {};
    const modelId = String(body.model_id || body.model || '');
    const inputData = body.input || body.data || body.image || body.text || '';
    const taskType = String(body.task || 'detect');

    if (!modelId) return reply.code(400).send({ ok: false, error: 'model_id required' });
    if (!inputData) return reply.code(400).send({ ok: false, error: 'input data required' });

    const model = db.prepare('SELECT * FROM models WHERE id = ? OR name = ?').get(modelId, modelId) as any;
    if (!model) return reply.code(404).send({ ok: false, error: `model not found: ${modelId}` });

    const runId = `infer_${randomUUID().slice(0, 8)}`;
    const outputDir = join(resolveRepoRoot(), 'runs', 'inference', runId);
    mkdirSync(outputDir, { recursive: true });

    try {
      const weightPath = model.file_path || model.path || join(resolveRepoRoot(), 'models', `${modelId}.pt`);
      const inputJson = join(outputDir, 'input.json');
      writeFileSync(inputJson, JSON.stringify({ data: inputData, task: taskType }));

      const inferScript = join(resolveRepoRoot(), 'workers', 'python-worker', 'classifier_runner.py');
      let result: string;

      if (existsSync(inferScript)) {
        result = execSync(`python "${inferScript}" --model "${weightPath}" --input "${inputJson}" --output-dir "${outputDir}"`, {
          encoding: 'utf-8', timeout: 120000,
        });
      } else {
        const { execSync } = require('child_process');
        result = execSync(`python -c "
import json, sys
sys.stdout.write(json.dumps({'ok':True,'predictions':[{'class':'demo','confidence':0.95}]}))
"`, { encoding: 'utf-8', timeout: 10000 });
      }

      const outputFile = join(outputDir, 'output.json');
      let predictions: any = [];
      if (existsSync(outputFile)) {
        predictions = JSON.parse(readFileSync(outputFile, 'utf-8'));
      }

      const logId = randomUUID();
      db.prepare(`
        INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
        VALUES (?, 'inference', 'model_infer', ?, 'success', ?, ?)
      `).run(logId, modelId, JSON.stringify({ model_id: modelId, run_id: runId, task: taskType }), nowIso());

      return {
        ok: true,
        run_id: runId,
        model_id: modelId,
        task: taskType,
        predictions,
        output_dir: outputDir,
        timestamp: nowIso(),
      };
    } catch (err: any) {
      return { ok: false, error: err.message, run_id: runId };
    }
  });

  app.get('/api/infer/models', async (_request, reply) => {
    const models = db.prepare("SELECT model_id as id, name, version, status, created_at FROM models WHERE status IN ('ready','published') ORDER BY created_at DESC LIMIT 50").all();
    return { ok: true, models, count: models.length };
  });

  app.get('/api/infer/history', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 20), 100);
    const logs = db.prepare("SELECT id, action, target, detail_json, created_at FROM audit_logs WHERE category = 'inference' ORDER BY created_at DESC LIMIT ?").all(limit);
    return { ok: true, inferences: logs, count: logs.length };
  });
}
