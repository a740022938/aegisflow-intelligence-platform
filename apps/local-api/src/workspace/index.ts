import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { randomUUID } from 'node:crypto';

function nowIso() { return new Date().toISOString(); }

export function registerWorkspaceRoutes(app: FastifyInstance) {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ws_teams (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ws_projects (
      id TEXT PRIMARY KEY, team_id TEXT, name TEXT NOT NULL, description TEXT,
      quota_gpu_hours REAL DEFAULT 100, quota_storage_gb REAL DEFAULT 50,
      used_gpu_hours REAL DEFAULT 0, used_storage_gb REAL DEFAULT 0,
      status TEXT DEFAULT 'active', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ws_members (
      id TEXT PRIMARY KEY, team_id TEXT, project_id TEXT, user_id TEXT,
      role TEXT DEFAULT 'member', joined_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ws_resource_usage (
      id TEXT PRIMARY KEY, project_id TEXT, resource_type TEXT NOT NULL,
      amount REAL NOT NULL, unit TEXT, source TEXT,
      recorded_at TEXT NOT NULL
    );
  `);

  // Teams
  app.post('/api/ws/teams', async (request: any, reply: any) => {
    const body = request.body || {};
    const id = `team_${randomUUID().slice(0, 8)}`;
    db.prepare('INSERT INTO ws_teams (id, name, description, created_at) VALUES (?, ?, ?, ?)')
      .run(id, String(body.name || 'Team'), String(body.description || ''), nowIso());
    return { ok: true, team: { id, name: body.name } };
  });

  app.get('/api/ws/teams', async (_request, reply) => {
    const rows = db.prepare('SELECT * FROM ws_teams ORDER BY created_at DESC').all();
    return { ok: true, teams: rows, count: rows.length };
  });

  // Projects
  app.post('/api/ws/projects', async (request: any, reply: any) => {
    const body = request.body || {};
    const id = `proj_${randomUUID().slice(0, 8)}`;
    db.prepare('INSERT INTO ws_projects (id, team_id, name, description, quota_gpu_hours, quota_storage_gb, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, String(body.team_id || ''), String(body.name || 'Project'), String(body.description || ''), Number(body.quota_gpu_hours || 100), Number(body.quota_storage_gb || 50), nowIso());
    return { ok: true, project: { id, name: body.name } };
  });

  app.get('/api/ws/projects', async (request: any, reply: any) => {
    const teamId = request.query?.team_id || '';
    const rows = teamId
      ? db.prepare('SELECT * FROM ws_projects WHERE team_id = ? ORDER BY created_at DESC').all(teamId)
      : db.prepare('SELECT * FROM ws_projects ORDER BY created_at DESC').all();
    return { ok: true, projects: rows, count: rows.length };
  });

  // Members
  app.post('/api/ws/members', async (request: any, reply: any) => {
    const body = request.body || {};
    db.prepare('INSERT INTO ws_members (id, team_id, project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), String(body.team_id || ''), String(body.project_id || ''), String(body.user_id || ''), String(body.role || 'member'), nowIso());
    return { ok: true };
  });

  // Resource usage
  app.post('/api/ws/usage', async (request: any, reply: any) => {
    const body = request.body || {};
    const projectId = String(body.project_id || '');
    const resourceType = String(body.resource_type || 'gpu_hours');
    const amount = Number(body.amount || 0);
    db.prepare('INSERT INTO ws_resource_usage (id, project_id, resource_type, amount, unit, source, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(randomUUID(), projectId, resourceType, amount, String(body.unit || 'hours'), String(body.source || 'manual'), nowIso());
    const field = resourceType === 'gpu_hours' ? 'used_gpu_hours' : 'used_storage_gb';
    db.prepare(`UPDATE ws_projects SET ${field} = ${field} + ?, updated_at = ? WHERE id = ?`)
      .run(amount, nowIso(), projectId);
    return { ok: true };
  });

  app.get('/api/ws/projects/:id/usage', async (request: any, reply: any) => {
    const proj = db.prepare('SELECT * FROM ws_projects WHERE id = ?').get(request.params.id) as any;
    if (!proj) return reply.code(404).send({ ok: false, error: 'project not found' });
    const usage = db.prepare('SELECT resource_type, SUM(amount) as total FROM ws_resource_usage WHERE project_id = ? GROUP BY resource_type').all(request.params.id);
    return { ok: true, project: proj, usage, gpu_hours_used: proj.used_gpu_hours, gpu_quota: proj.quota_gpu_hours, storage_gb_used: proj.used_storage_gb, storage_quota: proj.quota_storage_gb };
  });

  app.get('/api/ws/dashboard', async (_request, reply) => {
    const teams = (db.prepare('SELECT COUNT(*) as c FROM ws_teams').get() as any)?.c || 0;
    const projects = (db.prepare('SELECT COUNT(*) as c FROM ws_projects').get() as any)?.c || 0;
    const gpuTotal = (db.prepare('SELECT SUM(used_gpu_hours) as t FROM ws_projects').get() as any)?.t || 0;
    return { ok: true, summary: { teams, projects, total_gpu_hours_used: Math.round(gpuTotal * 100) / 100 } };
  });
}
