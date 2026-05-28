import { afterEach, describe, expect, it, vi } from 'vitest';
import fastify from 'fastify';
import jwt from '@fastify/jwt';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

async function createAuthHarness(env: Record<string, string | undefined> = {}) {
  vi.resetModules();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aip-auth-test-'));
  process.env.SQLITE_DB_PATH = path.join(tmpDir, 'auth.sqlite');
  delete process.env.AIP_BOOTSTRAP_ADMIN_USERNAME;
  delete process.env.AIP_BOOTSTRAP_ADMIN_PASSWORD;
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  const dbModule = await import('../db/builtin-sqlite.js');
  const authModule = await import('../auth/index.js');
  const app = fastify({ logger: false });
  await app.register(jwt, { secret: 'test-jwt-secret-minimum-length' });
  authModule.authMiddleware(app);
  authModule.registerAuthRoutes(app);
  await app.ready();

  return {
    app,
    db: dbModule.getDatabase(),
    dbPath: dbModule.getDatabasePath(),
    close: async () => {
      await app.close();
      dbModule.closeDatabase();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    },
  };
}

describe('P0 hardening: auth bootstrap and test database isolation', () => {
  it('uses a temporary SQLite path by default under NODE_ENV=test', async () => {
    vi.resetModules();
    delete process.env.SQLITE_DB_PATH;
    process.env.NODE_ENV = 'test';

    const dbModule = await import('../db/builtin-sqlite.js');
    const dbPath = dbModule.getDatabasePath();

    expect(dbPath.toLowerCase()).toContain(os.tmpdir().toLowerCase());
    expect(dbPath).not.toContain('packages');
    expect(dbPath).not.toMatch(/agi_factory\.db$/);
  });

  it('does not seed the legacy admin/aip-admin account without explicit bootstrap env', async () => {
    const harness = await createAuthHarness();
    try {
      const admin = harness.db.prepare("SELECT username FROM aip_users WHERE username = 'admin'").get();
      expect(admin).toBeUndefined();

      const response = await harness.app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { username: 'admin', password: 'aip-admin' },
      });
      expect(response.statusCode).toBe(401);
    } finally {
      await harness.close();
    }
  });

  it('seeds an admin only from an explicit strong bootstrap password', async () => {
    const harness = await createAuthHarness({
      AIP_BOOTSTRAP_ADMIN_USERNAME: 'owner-admin',
      AIP_BOOTSTRAP_ADMIN_PASSWORD: 'owner-admin-bootstrap-strong-secret',
    });
    try {
      const admin = harness.db.prepare("SELECT username, role FROM aip_users WHERE username = 'owner-admin'").get() as any;
      expect(admin?.role).toBe('admin');

      const response = await harness.app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { username: 'owner-admin', password: 'owner-admin-bootstrap-strong-secret' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json().ok).toBe(true);
    } finally {
      await harness.close();
    }
  });

  it('refuses to bootstrap with the legacy aip-admin password', async () => {
    const harness = await createAuthHarness({
      AIP_BOOTSTRAP_ADMIN_PASSWORD: 'aip-admin',
    });
    try {
      const admin = harness.db.prepare("SELECT username FROM aip_users WHERE username = 'admin'").get();
      expect(admin).toBeUndefined();
    } finally {
      await harness.close();
    }
  });
});
