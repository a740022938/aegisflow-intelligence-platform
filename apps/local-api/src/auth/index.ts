import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { createHash, randomUUID } from 'node:crypto';

const AUTH_TABLE = `
  CREATE TABLE IF NOT EXISTS aip_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    display_name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    last_login_at TEXT
  );
  CREATE TABLE IF NOT EXISTS aip_api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at TEXT NOT NULL,
    expires_at TEXT
  );
`;

const ROLES = { admin: 100, operator: 50, developer: 30, viewer: 10 } as const;

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'aip-salt-v1').digest('hex');
}

function nowIso() { return new Date().toISOString(); }

export function registerAuthRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(AUTH_TABLE);

  // Seed default admin if not exists
  const adminExists = db.prepare("SELECT id FROM aip_users WHERE username = 'admin'").get();
  if (!adminExists) {
    db.prepare("INSERT INTO aip_users (id, username, password_hash, role, display_name, created_at) VALUES (?, 'admin', ?, 'admin', 'Administrator', ?)")
      .run(randomUUID(), hashPassword('aip-admin'), nowIso());
    console.log('[auth] Seeded default admin/admin account');
  }

  app.post('/api/auth/login', async (request: any, reply: any) => {
    const { username, password } = request.body || {};
    if (!username || !password) return reply.code(400).send({ ok: false, error: 'username and password required' });

    const user = db.prepare('SELECT * FROM aip_users WHERE username = ?').get(username) as any;
    if (!user || user.password_hash !== hashPassword(password)) {
      return reply.code(401).send({ ok: false, error: 'invalid credentials' });
    }

    db.prepare('UPDATE aip_users SET last_login_at = ? WHERE id = ?').run(nowIso(), user.id);

    const token = await reply.jwtSign({
      sub: user.id, username: user.username, role: user.role, display_name: user.display_name,
    }, { expiresIn: '24h' });

    return { ok: true, token, user: { id: user.id, username: user.username, role: user.role, display_name: user.display_name } };
  });

  app.post('/api/auth/api-key', async (request: any, reply: any) => {
    await request.jwtVerify();
    const { name, role } = request.body || {};
    const key = `aip_${randomUUID().replace(/-/g, '')}`;
    db.prepare('INSERT INTO aip_api_keys (id, user_id, key_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), request.user.sub, hashPassword(key), name || 'unnamed', role || 'viewer', nowIso());
    return { ok: true, api_key: key, warning: 'Save this key - it will not be shown again' };
  });

  app.get('/api/auth/me', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      const user = db.prepare('SELECT id, username, role, display_name, last_login_at FROM aip_users WHERE id = ?').get(request.user.sub) as any;
      return { ok: true, user };
    } catch {
      return reply.code(401).send({ ok: false, error: 'unauthorized' });
    }
  });

  app.get('/api/auth/users', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'admin') return reply.code(403).send({ ok: false, error: 'forbidden' });
      const users = db.prepare('SELECT id, username, role, display_name, last_login_at FROM aip_users').all();
      return { ok: true, users };
    } catch { return reply.code(401).send({ ok: false, error: 'unauthorized' }); }
  });
}

export function authMiddleware(app: FastifyInstance) {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch { reply.code(401).send({ ok: false, error: 'unauthorized' }); }
  });

  app.decorate('requireRole', (minRole: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const userRole = (request.user as any)?.role || 'viewer';
        const min = ROLES[minRole as keyof typeof ROLES] || 0;
        const actual = ROLES[userRole as keyof typeof ROLES] || 0;
        if (actual < min) return reply.code(403).send({ ok: false, error: 'insufficient permissions' });
      } catch { return reply.code(401).send({ ok: false, error: 'unauthorized' }); }
    };
  });
}
