import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

function nowIso() { return new Date().toISOString(); }
function getDataRoot(): string {
  return process.env.AGI_FACTORY_ROOT || process.env.AIP_REPO_ROOT || resolve(process.cwd(), '../..');
}

export function registerAnnotationRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS annotation_projects (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      task_type TEXT NOT NULL DEFAULT 'detection', dataset_id TEXT,
      status TEXT DEFAULT 'active', num_images INTEGER DEFAULT 0,
      num_annotated INTEGER DEFAULT 0, num_classes INTEGER DEFAULT 0,
      classes_json TEXT DEFAULT '[]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS annotation_images (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL, filename TEXT NOT NULL,
      width INTEGER, height INTEGER, file_path TEXT NOT NULL,
      annotated INTEGER DEFAULT 0, annotations_json TEXT DEFAULT '[]',
      skipped INTEGER DEFAULT 0, created_at TEXT NOT NULL
    );
  `);

  app.post('/api/annotation/projects', async (request: any, reply: any) => {
    const body = request.body || {};
    const id = `ann_${randomUUID().slice(0, 12)}`;
    const now = nowIso();
    db.prepare(`INSERT INTO annotation_projects (id, name, description, task_type, dataset_id, classes_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, String(body.name || 'Unnamed'), String(body.description || ''), String(body.task_type || 'detection'), String(body.dataset_id || ''), JSON.stringify(body.classes || ['object']), now, now);
    return { ok: true, project: { id, name: body.name } };
  });

  app.get('/api/annotation/projects', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM annotation_projects ORDER BY created_at DESC').all();
    return { ok: true, projects: rows, count: rows.length };
  });

  app.get('/api/annotation/projects/:id', async (request: any, reply: any) => {
    const proj = db.prepare('SELECT * FROM annotation_projects WHERE id = ?').get(request.params.id) as any;
    if (!proj) return reply.code(404).send({ ok: false, error: 'project not found' });
    const images = db.prepare('SELECT * FROM annotation_images WHERE project_id = ? ORDER BY created_at').all(request.params.id);
    return { ok: true, project: proj, images, total: images.length, annotated: images.filter((i: any) => i.annotated).length };
  });

  app.post('/api/annotation/projects/:id/import', async (request: any, reply: any) => {
    const { id } = request.params;
    const body = request.body || {};
    const imageDir = String(body.image_dir || '');
    const dataRoot = getDataRoot();
    const importPath = imageDir || join(dataRoot, 'datasets', body.dataset_id || '', 'images');

    if (!existsSync(importPath)) return reply.code(400).send({ ok: false, error: `path not found: ${importPath}` });

    const exts = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
    const files = require('fs').readdirSync(importPath).filter((f: string) => exts.some(e => f.toLowerCase().endsWith(e)));
    let imported = 0;
    for (const file of files) {
      const fPath = join(importPath, file);
      const imgId = `img_${randomUUID().slice(0, 8)}`;
      db.prepare(`INSERT INTO annotation_images (id, project_id, filename, file_path, created_at) VALUES (?, ?, ?, ?, ?)`)
        .run(imgId, id, file, fPath, nowIso());
      imported++;
    }
    db.prepare('UPDATE annotation_projects SET num_images = num_images + ?, updated_at = ? WHERE id = ?').run(imported, nowIso(), id);
    return { ok: true, imported, total_files: files.length };
  });

  // SAM auto-annotate
  app.post('/api/annotation/:image_id/sam', async (request: any, reply: any) => {
    const { image_id } = request.params;
    const img = db.prepare('SELECT * FROM annotation_images WHERE id = ?').get(image_id) as any;
    if (!img) return reply.code(404).send({ ok: false, error: 'image not found' });

    const body = request.body || {};
    const points = body.points || [{ x: 100, y: 100 }];
    let samResult: any[] = [];

    const samScript = join(getDataRoot(), 'workers', 'python-worker', 'sam_runner.py');
    if (existsSync(samScript)) {
      try {
        const result = execSync(`python "${samScript}" --image "${img.file_path}" --points '${JSON.stringify(points)}'`, { encoding: 'utf-8', timeout: 30000 });
        samResult = JSON.parse(result);
      } catch { }
    }

    return { ok: true, image_id, masks: samResult, points };
  });

  // Save annotation
  app.post('/api/annotation/:image_id/save', async (request: any, reply: any) => {
    const { image_id } = request.params;
    const body = request.body || {};
    const annotations = body.annotations || body.labels || [];
    const now = nowIso();
    db.prepare(`UPDATE annotation_images SET annotated = 1, annotations_json = ?, updated_at = ? WHERE id = ?`)
      .run(JSON.stringify(annotations), now, image_id);
    const img = db.prepare('SELECT project_id, file_path FROM annotation_images WHERE id = ?').get(image_id) as any;
    if (img) {
      // Export YOLO format
      const labelPath = img.file_path.replace(/\.(jpg|jpeg|png|bmp|webp)$/i, '.txt');
      const yoloLines = annotations.map((a: any) => {
        const cls = a.class_id || 0;
        const [cx, cy, w, h] = [a.x || a.cx || 0, a.y || a.cy || 0, a.w || 0, a.h || 0];
        return `${cls} ${cx} ${cy} ${w} ${h}`;
      }).join('\n');
      writeFileSync(labelPath, yoloLines);
      db.prepare('UPDATE annotation_projects SET num_annotated = (SELECT COUNT(*) FROM annotation_images WHERE project_id = ? AND annotated = 1), updated_at = ? WHERE id = ?')
        .run(img.project_id, now, img.project_id);
    }
    return { ok: true, image_id, annotations_count: annotations.length };
  });
}
