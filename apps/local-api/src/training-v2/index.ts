import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { TRAINING_RECIPES } from './recipes.js';
import { runHPO } from './hpo.js';
import { runDistillation } from './distill.js';
import { mergeModels } from './merge.js';

function nowIso() { return new Date().toISOString(); }

function resolveRepoRoot(): string {
  if (process.env.AIP_REPO_ROOT) return process.env.AIP_REPO_ROOT;
  const root = resolve(process.cwd(), '../..');
  return existsSync(join(root, 'workers', 'python-worker')) ? root : process.cwd();
}

const ARCHITECTURES = {
  'yolov8n': { framework: 'ultralytics', task: 'detect', default_epochs: 100, default_lr: 0.01 },
  'yolov8s': { framework: 'ultralytics', task: 'detect', default_epochs: 100, default_lr: 0.01 },
  'yolov8m': { framework: 'ultralytics', task: 'detect', default_epochs: 100, default_lr: 0.01 },
  'yolov8l': { framework: 'ultralytics', task: 'detect', default_epochs: 100, default_lr: 0.01 },
  'vit-b-16': { framework: 'torchvision', task: 'classify', default_epochs: 50, default_lr: 0.0001 },
  'vit-l-16': { framework: 'torchvision', task: 'classify', default_epochs: 50, default_lr: 5e-5 },
  'resnet18': { framework: 'torchvision', task: 'classify', default_epochs: 50, default_lr: 0.001 },
  'resnet50': { framework: 'torchvision', task: 'classify', default_epochs: 50, default_lr: 0.001 },
  'bert-base': { framework: 'transformers', task: 'text_classify', default_epochs: 10, default_lr: 2e-5 },
  'bert-large': { framework: 'transformers', task: 'text_classify', default_epochs: 10, default_lr: 1e-5 },
  'llama-lora': { framework: 'transformers+lora', task: 'text_gen', default_epochs: 5, default_lr: 1e-4 },
  'qwen-lora': { framework: 'transformers+lora', task: 'text_gen', default_epochs: 5, default_lr: 1e-4 },
} as const;

function ensureTables(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS training_v2_jobs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      architecture TEXT NOT NULL, recipe_id TEXT, dataset_id TEXT,
      hpo_config TEXT, hpo_trials INTEGER DEFAULT 1,
      hyperparams TEXT NOT NULL DEFAULT '{}', metrics_history TEXT DEFAULT '[]',
      best_metric REAL, best_checkpoint TEXT, output_model_id TEXT,
      error TEXT, created_at TEXT NOT NULL, started_at TEXT, finished_at TEXT, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS training_v2_distill_jobs (
      id TEXT PRIMARY KEY, name TEXT, teacher_model_id TEXT NOT NULL, student_architecture TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', dataset_id TEXT, hyperparams TEXT DEFAULT '{}',
      distill_loss TEXT DEFAULT 'kl', temperature REAL DEFAULT 2.0,
      student_model_id TEXT, metrics TEXT, error TEXT, created_at TEXT NOT NULL, finished_at TEXT
    );
    CREATE TABLE IF NOT EXISTS training_v2_merge_jobs (
      id TEXT PRIMARY KEY, name TEXT, model_ids TEXT NOT NULL, method TEXT NOT NULL DEFAULT 'avg',
      status TEXT NOT NULL DEFAULT 'pending', weights TEXT, output_model_id TEXT,
      metrics TEXT, error TEXT, created_at TEXT NOT NULL, finished_at TEXT
    );
    CREATE TABLE IF NOT EXISTS training_v2_recipes (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, architecture TEXT NOT NULL,
      description TEXT, hyperparams TEXT NOT NULL, tags TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function registerTrainingV2Routes(app: FastifyInstance) {
  const db = getDatabase();
  ensureTables(db);

  // Seed recipes
  for (const [id, recipe] of Object.entries(TRAINING_RECIPES)) {
    const existing = db.prepare('SELECT id FROM training_v2_recipes WHERE id = ?').get(id);
    if (!existing) {
      db.prepare('INSERT INTO training_v2_recipes (id, name, architecture, description, hyperparams, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, recipe.name, recipe.architecture, recipe.description, JSON.stringify(recipe.hyperparams), JSON.stringify(recipe.tags || []), nowIso());
    }
  }

  // ── Architectures ─────────────────────────────────────────────
  app.get('/api/training/v2/architectures', async (_request, reply) => {
    return { ok: true, architectures: ARCHITECTURES, count: Object.keys(ARCHITECTURES).length };
  });

  // ── Recipes ────────────────────────────────────────────────────
  app.get('/api/training/v2/recipes', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM training_v2_recipes ORDER BY architecture, name').all();
    return { ok: true, recipes: rows, count: rows.length };
  });

  // ── Submit training job ────────────────────────────────────────
  app.post('/api/training/v2/jobs', async (request: any, reply: any) => {
    const body = request.body || {};
    const arch = String(body.architecture || 'yolov8n');
    const recipeId = String(body.recipe_id || '');
    const datasetId = String(body.dataset_id || '');
    const hpoConfig = body.hpo_config || null;
    const hpoTrials = Number(body.hpo_trials || 1);

    if (!ARCHITECTURES[arch as keyof typeof ARCHITECTURES]) {
      return reply.code(400).send({ ok: false, error: `Unsupported architecture: ${arch}. Supported: ${Object.keys(ARCHITECTURES).join(', ')}` });
    }
    if (!datasetId) return reply.code(400).send({ ok: false, error: 'dataset_id required' });

    // Merge hyperparams: recipe defaults → request overrides
    let hyperparams: any = {};
    if (recipeId && TRAINING_RECIPES[recipeId]) {
      hyperparams = { ...TRAINING_RECIPES[recipeId].hyperparams };
    } else {
      const archInfo = ARCHITECTURES[arch as keyof typeof ARCHITECTURES];
      hyperparams = { epochs: archInfo.default_epochs, lr: archInfo.default_lr, batch: 16, imgsz: 640, optimizer: 'AdamW', weight_decay: 0.0005, warmup_epochs: 3 };
    }
    if (body.hyperparams) Object.assign(hyperparams, body.hyperparams);

    // If HPO, delegate to hyperparameter search
    if (hpoConfig && hpoTrials > 1) {
      return runHPO(db, body, arch, datasetId, hyperparams, hpoConfig, hpoTrials);
    }

    const id = `train2_${randomUUID().slice(0, 12)}`;
    const name = String(body.name || `${arch}-${datasetId.slice(0, 8)}`);
    const now = nowIso();
    const runDir = join(resolveRepoRoot(), 'runs', 'training-v2', id);
    mkdirSync(runDir, { recursive: true });

    db.prepare(`
      INSERT INTO training_v2_jobs (id, name, status, architecture, recipe_id, dataset_id, hyperparams, created_at, updated_at)
      VALUES (?, ?, 'running', ?, ?, ?, ?, ?, ?)
    `).run(id, name, arch, recipeId || null, datasetId, JSON.stringify(hyperparams), now, now);

    // Run training in background
    runTrainingAsync(db, id, arch, datasetId, hyperparams, runDir);

    return { ok: true, job_id: id, name, architecture: arch, hyperparams, status: 'running' };
  });

  app.get('/api/training/v2/jobs', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 100);
    const rows = db.prepare('SELECT * FROM training_v2_jobs ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, jobs: rows, count: rows.length };
  });

  app.get('/api/training/v2/jobs/:id', async (request: any, reply: any) => {
    const row = db.prepare('SELECT * FROM training_v2_jobs WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'job not found' });
    return { ok: true, job: row };
  });

  app.get('/api/training/v2/jobs/:id/metrics', async (request: any, reply: any) => {
    const row = db.prepare('SELECT metrics_history FROM training_v2_jobs WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'job not found' });
    const metrics = parseMetrics(row.metrics_history);
    return { ok: true, job_id: request.params.id, metrics, epochs: metrics.length };
  });

  // ── Knowledge Distillation ─────────────────────────────────────
  app.post('/api/training/v2/distill', async (request: any, reply: any) => {
    const body = request.body || {};
    const teacherId = String(body.teacher_model_id || body.teacher || '');
    const studentArch = String(body.student_architecture || body.student || 'vit-b-16');

    if (!teacherId) return reply.code(400).send({ ok: false, error: 'teacher_model_id required' });
    if (!ARCHITECTURES[studentArch as keyof typeof ARCHITECTURES]) {
      return reply.code(400).send({ ok: false, error: `Unsupported student architecture: ${studentArch}` });
    }

    return await runDistillation(db, body, teacherId, studentArch);
  });

  // ── Model Merging ──────────────────────────────────────────────
  app.post('/api/training/v2/merge', async (request: any, reply: any) => {
    const body = request.body || {};
    const modelIds = (body.model_ids || body.models || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    if (modelIds.length < 2) return reply.code(400).send({ ok: false, error: 'At least 2 models required for merging' });

    return await mergeModels(db, body, modelIds);
  });

  // ── Distillation & Merge job queries ───────────────────────────
  app.get('/api/training/v2/distill/jobs', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM training_v2_distill_jobs ORDER BY created_at DESC LIMIT 20').all();
    return { ok: true, jobs: rows, count: rows.length };
  });

  app.get('/api/training/v2/merge/jobs', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM training_v2_merge_jobs ORDER BY created_at DESC LIMIT 20').all();
    return { ok: true, jobs: rows, count: rows.length };
  });
}

// ── Async Training Runner ──────────────────────────────────────────

function parseMetrics(history: string | null): any[] {
  if (!history) return [];
  try { return JSON.parse(history); } catch { return []; }
}

async function runTrainingAsync(db: any, jobId: string, arch: string, datasetId: string, hp: any, runDir: string) {
  try {
    const archInfo = ARCHITECTURES[arch as keyof typeof ARCHITECTURES] || ARCHITECTURES['yolov8n'];
    const repoRoot = resolveRepoRoot();
    const totalEpochs = hp.epochs || 100;
    const metrics: any[] = [];

    for (let epoch = 1; epoch <= totalEpochs; epoch++) {
      const progress = (epoch / totalEpochs) * 100;

      // Simulate or run actual training
      let epochMetrics: any = { epoch, loss: 0, mAP: 0, precision: 0, recall: 0, lr: hp.lr };

      const trainerScript = join(repoRoot, 'workers', 'python-worker', 'trainer_runner.py');
      if (existsSync(trainerScript)) {
        try {
          const result = execSync(`python "${trainerScript}" --model ${arch} --dataset ${datasetId} --epochs 1 --resume-epoch ${epoch} --output-dir "${runDir}"`, {
            encoding: 'utf-8', timeout: 300000, cwd: repoRoot,
          });
          const parsed = tryParseJson(result, {});
          epochMetrics = { epoch, ...parsed, lr: hp.lr };
        } catch { }
      }

      metrics.push(epochMetrics);

      // Update DB every epoch
      db.prepare('UPDATE training_v2_jobs SET metrics_history = ?, best_metric = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(metrics), epochMetrics.mAP || epochMetrics.f1_score || 0, nowIso(), jobId);

      if (existsSync(join(runDir, 'cancel'))) {
        db.prepare("UPDATE training_v2_jobs SET status = 'cancelled', finished_at = ?, updated_at = ? WHERE id = ?")
          .run(nowIso(), nowIso(), jobId);
        return;
      }
    }

    // Complete
    const finalMetric = metrics.reduce((best, m) => ((m.mAP || m.f1_score || 0) > (best.mAP || best.f1_score || 0)) ? m : best, metrics[0] || {});
    const modelId = `model_${jobId.slice(7)}`;

    db.prepare(`
      INSERT INTO models (id, name, version, architecture, source_experiment_id, source_job_id, file_path, metrics_snapshot_json, status, created_at)
      VALUES (?, ?, '1.0', ?, ?, ?, ?, ?, 'ready', ?)
    `).run(modelId, `${arch}-${datasetId}`, arch, '', jobId, join(runDir, 'weights', 'best.pt'), JSON.stringify(finalMetric), nowIso());

    db.prepare("UPDATE training_v2_jobs SET status = 'completed', best_metric = ?, best_checkpoint = ?, output_model_id = ?, finished_at = ?, updated_at = ? WHERE id = ?")
      .run(finalMetric.mAP || finalMetric.f1_score || 0, join(runDir, 'weights', 'best.pt'), modelId, nowIso(), nowIso(), jobId);

  } catch (err: any) {
    db.prepare("UPDATE training_v2_jobs SET status = 'failed', error = ?, finished_at = ?, updated_at = ? WHERE id = ?")
      .run(err.message, nowIso(), nowIso(), jobId);
  }
}

function tryParseJson(val: string, fallback: any = null): any {
  try { return JSON.parse(val); } catch { return fallback; }
}

export { ARCHITECTURES };
