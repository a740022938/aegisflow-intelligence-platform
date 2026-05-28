import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID, createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function now() { return new Date().toISOString(); }

const STORAGE_ROOT = 'E:\\_AIP_STORAGE';

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_ROOT)) fs.mkdirSync(STORAGE_ROOT, { recursive: true });
}

function computeChecksum(filePath: string): string {
  try {
    const data = fs.readFileSync(filePath);
    return createHash('sha256').update(data).digest('hex').slice(0, 16);
  } catch { return ''; }
}

export function registerObjectStorageRoutes(app: FastifyInstance) {
  const db = getDatabase();
  ensureStorageDir();
  db.exec(`
    CREATE TABLE IF NOT EXISTS storage_files (
      id TEXT PRIMARY KEY, original_name TEXT NOT NULL, stored_path TEXT NOT NULL,
      size_bytes INTEGER NOT NULL, mime_type TEXT DEFAULT 'application/octet-stream',
      checksum TEXT, created_at TEXT NOT NULL
    );
  `);

  app.post('/api/storage/upload', async (request: any, reply: any) => {
    const body = request.body || {};
    const filename = body.original_name || body.filename || `file_${Date.now()}`;
    const content = body.content_base64 || body.content || '';
    if (!content) return reply.code(400).send({ ok: false, error: 'content_base64 is required' });
    const buffer = Buffer.from(content, 'base64');
    const id = randomUUID();
    const ext = path.extname(filename) || '';
    const storedName = `${id}${ext}`;
    const storedPath = path.join(STORAGE_ROOT, storedName);
    fs.writeFileSync(storedPath, buffer);
    const checksum = computeChecksum(storedPath);
    db.prepare(`INSERT INTO storage_files (id, original_name, stored_path, size_bytes, mime_type, checksum, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(id, filename, storedPath, buffer.length, body.mime_type || 'application/octet-stream', checksum, now());
    return { ok: true, file: { id, original_name: filename, size_bytes: buffer.length, mime_type: body.mime_type, checksum, created_at: now() } };
  });

  app.get('/api/storage/files', async (request: any, reply: any) => {
    const rows = db.prepare('SELECT * FROM storage_files ORDER BY created_at DESC').all();
    return { ok: true, files: rows, count: rows.length };
  });

  app.get('/api/storage/files/:id/download', async (request: any, reply: any) => {
    const row = db.prepare('SELECT * FROM storage_files WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'file not found' });
    if (!fs.existsSync(row.stored_path)) return reply.code(404).send({ ok: false, error: 'file data missing' });
    const stream = fs.createReadStream(row.stored_path);
    reply.header('Content-Disposition', `attachment; filename="${row.original_name}"`);
    reply.header('Content-Type', row.mime_type || 'application/octet-stream');
    return reply.send(stream);
  });

  app.delete('/api/storage/files/:id', async (request: any, reply: any) => {
    const row = db.prepare('SELECT * FROM storage_files WHERE id = ?').get(request.params.id) as any;
    if (!row) return reply.code(404).send({ ok: false, error: 'file not found' });
    if (fs.existsSync(row.stored_path)) fs.unlinkSync(row.stored_path);
    db.prepare('DELETE FROM storage_files WHERE id = ?').run(request.params.id);
    return { ok: true, message: 'file deleted' };
  });
}
