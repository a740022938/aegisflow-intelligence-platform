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
const LEGACY_DEFAULT_ADMIN_PASSWORD = ['aip', 'admin'].join('-');
const MIN_BOOTSTRAP_ADMIN_PASSWORD_LENGTH = 16;

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'aip-salt-v1').digest('hex');
}

function nowIso() { return new Date().toISOString(); }

function getBootstrapAdminConfig() {
  const password = String(process.env.AIP_BOOTSTRAP_ADMIN_PASSWORD || '').trim();
  if (!password) return null;
  if (password === LEGACY_DEFAULT_ADMIN_PASSWORD || password.length < MIN_BOOTSTRAP_ADMIN_PASSWORD_LENGTH) {
    console.warn('[auth] Ignoring insecure bootstrap admin password. Use a non-default value with at least 16 characters.');
    return null;
  }

  const username = String(process.env.AIP_BOOTSTRAP_ADMIN_USERNAME || 'admin').trim() || 'admin';
  const displayName = String(process.env.AIP_BOOTSTRAP_ADMIN_DISPLAY_NAME || 'Bootstrap Administrator').trim() || 'Bootstrap Administrator';
  return { username, password, displayName };
}

function neutralizeLegacyDefaultAdmin(db: ReturnType<typeof getDatabase>) {
  const legacy = db.prepare("SELECT id, password_hash FROM aip_users WHERE username = 'admin'").get() as any;
  if (!legacy || legacy.password_hash !== hashPassword(LEGACY_DEFAULT_ADMIN_PASSWORD)) return;

  db.prepare('UPDATE aip_users SET password_hash = ?, role = ?, display_name = ? WHERE id = ?')
    .run(hashPassword(`legacy-disabled-${randomUUID()}`), 'viewer', 'Legacy default admin disabled', legacy.id);
  console.warn('[auth] Disabled legacy admin/aip-admin credentials. Set AIP_BOOTSTRAP_ADMIN_PASSWORD to create an explicit bootstrap admin.');
}

export function registerAuthRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(AUTH_TABLE);

  neutralizeLegacyDefaultAdmin(db);

  const bootstrapAdmin = getBootstrapAdminConfig();
  if (bootstrapAdmin) {
    const adminExists = db.prepare('SELECT id FROM aip_users WHERE username = ?').get(bootstrapAdmin.username);
    if (!adminExists) {
      db.prepare('INSERT INTO aip_users (id, username, password_hash, role, display_name, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), bootstrapAdmin.username, hashPassword(bootstrapAdmin.password), 'admin', bootstrapAdmin.displayName, nowIso());
      console.log(`[auth] Seeded bootstrap admin account "${bootstrapAdmin.username}" from explicit environment configuration`);
    }
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

  app.get('/api/auth/status', async (request: any, reply: any) => {
    let jwtUser = null;
    try {
      await request.jwtVerify();
      jwtUser = { username: request.user.username, role: request.user.role };
    } catch { /* not authenticated */ }

    const tokenConfigured = !!String(process.env.OPENCLAW_HEARTBEAT_TOKEN || '').trim();

    let online: boolean | null = null;
    let masterSwitchEnabled = false;
    let lastHeartbeatAt: string | null = null;
    try {
      const row = db.prepare('SELECT * FROM openclaw_control WHERE id = 1').get() as any;
      if (row) {
        masterSwitchEnabled = !!row.enabled;
        lastHeartbeatAt = row.last_heartbeat_at || null;
        if (lastHeartbeatAt) {
          const hbTime = new Date(lastHeartbeatAt).getTime();
          const timeoutSec = Number(row.heartbeat_timeout_sec || 25);
          online = (Date.now() - hbTime) <= timeoutSec * 1000;
        }
      }
    } catch { /* openclaw_control table not available */ }

    return {
      ok: true,
      jwt: { authenticated: !!jwtUser, username: jwtUser?.username || null, role: jwtUser?.role || null },
      openclaw: { tokenConfigured, online, masterSwitchEnabled, lastHeartbeatAt },
    };
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
