import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID, createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

type StorageBackend = 'local' | 's3' | 'minio';

interface StorageConfig {
  backend: StorageBackend;
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  localBase?: string;
}

function getConfig(): StorageConfig {
  return {
    backend: (process.env.STORAGE_BACKEND || 'local') as StorageBackend,
    endpoint: process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || '',
    bucket: process.env.S3_BUCKET || process.env.MINIO_BUCKET || 'aip-data',
    region: process.env.S3_REGION || 'us-east-1',
    accessKey: process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || '',
    localBase: process.env.STORAGE_LOCAL_BASE || path.resolve(process.cwd(), '../../data'),
  };
}

function nowIso() { return new Date().toISOString(); }

export function registerStorageRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS storage_datasets (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
      description TEXT, storage_path TEXT NOT NULL, backend TEXT NOT NULL DEFAULT 'local',
      file_count INTEGER DEFAULT 0, total_size_bytes INTEGER DEFAULT 0,
      checksum TEXT, parent_version_id TEXT, tags TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS storage_files (
      id TEXT PRIMARY KEY, dataset_id TEXT NOT NULL, path TEXT NOT NULL,
      size_bytes INTEGER NOT NULL, checksum TEXT, mime_type TEXT,
      metadata_json TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS storage_models (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, version TEXT NOT NULL,
      architecture TEXT, storage_path TEXT NOT NULL, backend TEXT NOT NULL,
      file_size_bytes INTEGER, checksum TEXT, metrics_json TEXT,
      source_job_id TEXT, source_dataset_id TEXT, tags TEXT,
      created_at TEXT NOT NULL
    );
  `);

  const config = getConfig();
  const dataDir = config.localBase;
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  app.get('/api/storage/v2/config', async (_request, reply) => {
    return { ok: true, backend: config.backend, bucket: config.bucket, localBase: config.localBase, endpoint: config.endpoint };
  });

  // Dataset versioning
  app.post('/api/storage/v2/datasets', async (request: any, reply: any) => {
    const body = request.body || {};
    const name = String(body.name || `ds_${Date.now()}`);
    const id = `ds_${randomUUID().slice(0, 12)}`;
    const dsDir = path.join(dataDir, 'datasets', id);
    fs.mkdirSync(dsDir, { recursive: true });
    db.prepare(`INSERT INTO storage_datasets (id, name, version, description, storage_path, backend, tags, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)`)
      .run(id, name, String(body.description || ''), dsDir, config.backend, JSON.stringify(body.tags || []), nowIso(), nowIso());
    return { ok: true, dataset: { id, name, version: 1, storage_path: dsDir } };
  });

  app.post('/api/storage/v2/datasets/:id/version', async (request: any, reply: any) => {
    const { id } = request.params;
    const parent = db.prepare('SELECT * FROM storage_datasets WHERE id = ?').get(id) as any;
    if (!parent) return reply.code(404).send({ ok: false, error: 'dataset not found' });
    const vId = `dsv_${randomUUID().slice(0, 12)}`;
    const vDir = path.join(dataDir, 'datasets', vId);
    fs.mkdirSync(vDir, { recursive: true });
    db.prepare(`INSERT INTO storage_datasets (id, name, version, storage_path, backend, parent_version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(vId, parent.name, parent.version + 1, vDir, config.backend, id, nowIso(), nowIso());
    return { ok: true, version: { id: vId, name: parent.name, version: parent.version + 1 } };
  });

  app.get('/api/storage/v2/datasets', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 100);
    const rows = db.prepare('SELECT * FROM storage_datasets ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, datasets: rows, count: rows.length };
  });

  // File upload registration
  app.post('/api/storage/v2/datasets/:id/files', async (request: any, reply: any) => {
    const { id } = request.params;
    const body = request.body || {};
    const files = Array.isArray(body.files) ? body.files : [body];
    const dsDir = path.join(dataDir, 'datasets', id);
    if (!fs.existsSync(dsDir)) return reply.code(404).send({ ok: false, error: 'dataset not found' });

    const results: any[] = [];
    for (const f of files) {
      const fId = randomUUID();
      const relPath = String(f.path || f.name || fId);
      const fullPath = path.join(dsDir, relPath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      if (f.content) { fs.writeFileSync(fullPath, Buffer.from(f.content, 'base64')); }
      const stat = fs.existsSync(fullPath) ? fs.statSync(fullPath) : null;
      db.prepare(`INSERT INTO storage_files (id, dataset_id, path, size_bytes, mime_type, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(fId, id, relPath, stat?.size || 0, f.mime_type || 'application/octet-stream', JSON.stringify(f.metadata || {}), nowIso());
      results.push({ id: fId, path: relPath });
    }
    const fileCount = (db.prepare('SELECT COUNT(*) as c FROM storage_files WHERE dataset_id = ?').get(id) as any)?.c || 0;
    db.prepare('UPDATE storage_datasets SET file_count = ?, updated_at = ? WHERE id = ?').run(fileCount, nowIso(), id);
    return { ok: true, files: results };
  });

  app.get('/api/storage/v2/datasets/:id/files', async (request: any, reply: any) => {
    const files = db.prepare('SELECT * FROM storage_files WHERE dataset_id = ? ORDER BY created_at').all(request.params.id);
    return { ok: true, files, count: files.length };
  });

  // Models
  app.post('/api/storage/v2/models', async (request: any, reply: any) => {
    const body = request.body || {};
    const id = `model_${randomUUID().slice(0, 12)}`;
    const modelDir = path.join(dataDir, 'models', id);
    fs.mkdirSync(modelDir, { recursive: true });
    db.prepare(`INSERT INTO storage_models (id, name, version, architecture, storage_path, backend, source_job_id, source_dataset_id, tags, metrics_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, String(body.name || `model_${Date.now()}`), body.version || '1.0', body.architecture || '', modelDir, config.backend, body.source_job_id || '', body.source_dataset_id || '', JSON.stringify(body.tags || []), JSON.stringify(body.metrics || {}), nowIso());
    if (body.weights) { fs.writeFileSync(path.join(modelDir, 'model.pt'), Buffer.from(body.weights, 'base64')); }
    return { ok: true, model: { id, name: body.name, storage_path: modelDir } };
  });

  app.get('/api/storage/v2/models', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 50), 100);
    const rows = db.prepare('SELECT * FROM storage_models ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, models: rows, count: rows.length };
  });
}
