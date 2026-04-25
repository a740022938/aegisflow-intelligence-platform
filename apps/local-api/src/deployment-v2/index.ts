import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

export function registerDeploymentV2Routes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS deploy_endpoints (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, model_id TEXT NOT NULL,
      endpoint_url TEXT, status TEXT DEFAULT 'creating',
      strategy TEXT DEFAULT 'recreate', traffic_weight INTEGER DEFAULT 100,
      min_replicas INTEGER DEFAULT 1, max_replicas INTEGER DEFAULT 3,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deploy_canaries (
      id TEXT PRIMARY KEY, endpoint_id TEXT NOT NULL, model_id TEXT NOT NULL,
      traffic_weight INTEGER DEFAULT 10, status TEXT DEFAULT 'testing',
      metrics_json TEXT, started_at TEXT, finished_at TEXT
    );
    CREATE TABLE IF NOT EXISTS deploy_rollbacks (
      id TEXT PRIMARY KEY, endpoint_id TEXT NOT NULL, from_model_id TEXT,
      to_model_id TEXT, reason TEXT, status TEXT DEFAULT 'completed',
      created_at TEXT
    );
  `);

  app.post('/api/deploy/v2/endpoints', async (request: any, reply: any) => {
    const body = request.body || {};
    const id = `deploy_${randomUUID().slice(0, 8)}`;
    db.prepare(`INSERT INTO deploy_endpoints (id, name, model_id, status, strategy, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?, ?)`)
      .run(id, String(body.name || 'endpoint'), String(body.model_id || ''), String(body.strategy || 'recreate'), nowIso(), nowIso());
    return { ok: true, endpoint: { id, name: body.name, model_id: body.model_id } };
  });

  app.get('/api/deploy/v2/endpoints', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM deploy_endpoints ORDER BY created_at DESC').all();
    return { ok: true, endpoints: rows, count: rows.length };
  });

  app.delete('/api/deploy/v2/endpoints/:id', async (request: any, reply: any) => {
    db.prepare('DELETE FROM deploy_endpoints WHERE id = ?').run(request.params.id);
    return { ok: true };
  });

  // Canary release
  app.post('/api/deploy/v2/canary', async (request: any, reply: any) => {
    const body = request.body || {};
    const endpointId = String(body.endpoint_id || '');
    const modelId = String(body.model_id || '');
    if (!endpointId || !modelId) return reply.code(400).send({ ok: false, error: 'endpoint_id and model_id required' });

    const canaryId = `canary_${randomUUID().slice(0, 8)}`;
    db.prepare(`INSERT INTO deploy_canaries (id, endpoint_id, model_id, traffic_weight, status, started_at) VALUES (?, ?, ?, ?, 'testing', ?)`)
      .run(canaryId, endpointId, modelId, Number(body.traffic_weight || 10), nowIso());
    db.prepare('UPDATE deploy_endpoints SET strategy = ?, updated_at = ? WHERE id = ?').run('canary', nowIso(), endpointId);
    return { ok: true, canary: { id: canaryId, endpoint_id: endpointId, model_id: modelId, traffic: body.traffic_weight || 10 } };
  });

  app.post('/api/deploy/v2/canary/:id/promote', async (request: any, reply: any) => {
    const canary = db.prepare('SELECT * FROM deploy_canaries WHERE id = ?').get(request.params.id) as any;
    if (!canary) return reply.code(404).send({ ok: false, error: 'canary not found' });
    db.prepare('UPDATE deploy_canaries SET status = ?, finished_at = ? WHERE id = ?').run('promoted', nowIso(), request.params.id);
    db.prepare('UPDATE deploy_endpoints SET model_id = ?, strategy = ?, updated_at = ? WHERE id = ?').run(canary.model_id, 'active', nowIso(), canary.endpoint_id);
    return { ok: true, endpoint_id: canary.endpoint_id, new_model_id: canary.model_id };
  });

  app.post('/api/deploy/v2/rollback', async (request: any, reply: any) => {
    const body = request.body || {};
    const endpointId = String(body.endpoint_id || '');
    const endpoint = db.prepare('SELECT * FROM deploy_endpoints WHERE id = ?').get(endpointId) as any;
    if (!endpoint) return reply.code(404).send({ ok: false, error: 'endpoint not found' });

    const rollbackId = randomUUID();
    db.prepare(`INSERT INTO deploy_rollbacks (id, endpoint_id, from_model_id, to_model_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(rollbackId, endpointId, endpoint.model_id, String(body.to_model_id || ''), String(body.reason || 'manual'), nowIso());
    if (body.to_model_id) {
      db.prepare('UPDATE deploy_endpoints SET model_id = ?, updated_at = ? WHERE id = ?').run(body.to_model_id, nowIso(), endpointId);
    }
    return { ok: true, rollback_id: rollbackId };
  });

  app.get('/api/deploy/v2/rollbacks', async (request: any, reply: any) => {
    const limit = Math.min(Number(request.query?.limit || 20), 100);
    const rows = db.prepare('SELECT * FROM deploy_rollbacks ORDER BY created_at DESC LIMIT ?').all(limit);
    return { ok: true, rollbacks: rows, count: rows.length };
  });
}
