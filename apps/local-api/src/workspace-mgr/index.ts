import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function nowIso() { return new Date().toISOString(); }

const DEFAULT_PINNED: Array<{ name: string; path: string; icon: string }> = [
  { name: 'AIP', path: 'E:\\AIP', icon: 'folder' },
  { name: 'Axiom', path: 'E:\\Axiom', icon: 'folder' },
  { name: 'Memory Hub', path: 'E:\\_AIP_MEMORY_HUB', icon: 'database' },
];

function isSafe(base: string, target: string): boolean {
  const resolvedBase = path.resolve(base);
  const resolvedTarget = path.resolve(target);
  return resolvedTarget.startsWith(resolvedBase) || resolvedTarget === resolvedBase;
}

function safeResolve(requestPath: string): string {
  const cleaned = requestPath.replace(/\\/g, '/').replace(/\.\./g, '');
  if (process.platform === 'win32') {
    return path.resolve(cleaned);
  }
  return path.resolve('/', cleaned);
}

export function registerWorkspaceMgrRoutes(app: FastifyInstance) {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS workspace_shortcuts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'folder',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default shortcuts
  for (const s of DEFAULT_PINNED) {
    const existing = db.prepare('SELECT id FROM workspace_shortcuts WHERE name = ?').get(s.name) as any;
    if (!existing) {
      db.prepare('INSERT INTO workspace_shortcuts (id, name, path, icon, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), s.name, s.path, s.icon, DEFAULT_PINNED.indexOf(s), nowIso(), nowIso());
    }
  }

  // ── Shortcuts ──
  app.get('/api/workspace/shortcuts', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM workspace_shortcuts ORDER BY position ASC, name ASC').all();
    return { ok: true, shortcuts: rows };
  });

  app.post('/api/workspace/shortcut', async (request: any, reply: any) => {
    const body = request.body || {};
    if (!body.name || !body.path) return reply.code(400).send({ ok: false, error: 'name and path required' });
    const id = randomUUID();
    const maxPos = (db.prepare('SELECT MAX(position) as mp FROM workspace_shortcuts').get() as any)?.mp ?? 0;
    const now = nowIso();
    db.prepare('INSERT INTO workspace_shortcuts (id, name, path, icon, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, String(body.name), String(body.path), String(body.icon || 'folder'), Number(maxPos) + 1, now, now);
    const shortcut = db.prepare('SELECT * FROM workspace_shortcuts WHERE id = ?').get(id);
    return { ok: true, shortcut };
  });

  app.delete('/api/workspace/shortcut/:id', async (request: any, reply: any) => {
    db.prepare('DELETE FROM workspace_shortcuts WHERE id = ?').run(request.params.id);
    return { ok: true };
  });

  // ── Directory tree ──
  app.get('/api/workspace/tree', async (request: any, reply: any) => {
    const rawPath = String(request.query?.path || 'E:\\AIP');
    const dirPath = safeResolve(rawPath);
    if (!fs.existsSync(dirPath)) {
      return reply.code(404).send({ ok: false, error: 'Path not found' });
    }
    try {
      const stat = fs.statSync(dirPath);
      if (!stat.isDirectory()) {
        return reply.code(400).send({ ok: false, error: 'Path is not a directory' });
      }
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const children = entries
        .filter(e => !e.name.startsWith('.'))
        .map(e => ({
          name: e.name,
          type: e.isDirectory() ? 'directory' : 'file',
          path: path.join(dirPath, e.name),
        }))
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      return { ok: true, path: dirPath, name: path.basename(dirPath), children };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });

  // ── Read file ──
  app.get('/api/workspace/file', async (request: any, reply: any) => {
    const rawPath = String(request.query?.path || '');
    if (!rawPath) return reply.code(400).send({ ok: false, error: 'path required' });
    const filePath = safeResolve(rawPath);
    if (!fs.existsSync(filePath)) return reply.code(404).send({ ok: false, error: 'File not found' });
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) return reply.code(400).send({ ok: false, error: 'Path is a directory' });
      const ext = path.extname(filePath).toLowerCase();
      const isBinary = ['.exe', '.dll', '.pdb', '.bin', '.dat', '.db', '.sqlite', '.zip', '.tar', '.gz', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.avi', '.pt', '.pth', '.onnx', '.safetensors', '.pickle'].includes(ext);
      const maxSize = 2 * 1024 * 1024;
      if (stat.size > maxSize) {
        return { ok: true, path: filePath, name: path.basename(filePath), size: stat.size, size_formatted: formatSize(stat.size), truncated: true, content: `[File too large: ${formatSize(stat.size)}, max preview: ${formatSize(maxSize)}]` };
      }
      const content = fs.readFileSync(filePath, isBinary ? 'base64' : 'utf8');
      return {
        ok: true,
        path: filePath,
        name: path.basename(filePath),
        size: stat.size,
        size_formatted: formatSize(stat.size),
        modified_at: stat.mtime.toISOString(),
        binary: isBinary,
        content: isBinary ? `[Binary file: ${formatSize(stat.size)}]` : content,
      };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });

  // ── Create directory ──
  app.post('/api/workspace/mkdir', async (request: any, reply: any) => {
    const body = request.body || {};
    const parentPath = String(body.parent || 'E:\\AIP');
    const name = String(body.name || '').trim();
    if (!name) return reply.code(400).send({ ok: false, error: 'name is required' });
    const fullPath = path.join(parentPath, name);
    if (fs.existsSync(fullPath)) return reply.code(409).send({ ok: false, error: 'Directory already exists' });
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      return { ok: true, path: fullPath, name };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err.message });
    }
  });
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}
