import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';

function generateId() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function parseJsonField(val) {
  if (!val) return {};
  try { return JSON.parse(val); } catch { return {}; }
}

const createDeploymentSchema = z.object({
  name: z.string().min(1, 'name is required'),
  deployment_type: z.enum(['local_api','model_service','batch_worker','evaluation_runner','custom']).default('local_api'),
  runtime: z.enum(['mock','python','fastapi','node','custom']).default('mock'),
  status: z.enum(['created','deploying','running','stopped','failed','archived','deleted']).default('created'),
  artifact_id: z.string().default(''),
  artifact_name: z.string().default(''),
  training_job_id: z.string().default(''),
  evaluation_id: z.string().default(''),
  host: z.string().default('localhost'),
  port: z.number().int().positive().optional(),
  base_url: z.string().default(''),
  entrypoint: z.string().default(''),
  model_path: z.string().default(''),
  config_json: z.string().default('{}'),
  health_status: z.enum(['unknown','healthy','unhealthy','starting','stopped']).default('unknown'),
  notes: z.string().default(''),
});

const updateDeploymentSchema = z.object({
  name: z.string().optional(),
  deployment_type: z.enum(['local_api','model_service','batch_worker','evaluation_runner','custom']).optional(),
  runtime: z.enum(['mock','python','fastapi','node','custom']).optional(),
  status: z.enum(['created','deploying','running','stopped','failed','archived','deleted']).optional(),
  artifact_id: z.string().optional(),
  artifact_name: z.string().optional(),
  training_job_id: z.string().optional(),
  evaluation_id: z.string().optional(),
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  base_url: z.string().optional(),
  entrypoint: z.string().optional(),
  model_path: z.string().optional(),
  config_json: z.string().optional(),
  health_status: z.enum(['unknown','healthy','unhealthy','starting','stopped']).optional(),
  notes: z.string().optional(),
});

// ── List ─────────────────────────────────────────────────────────────────────
export async function listDeployments(query: any = {}) {
  const db = getDatabase();
  const { q, status, deployment_type, runtime, artifact_id, limit, offset } = query;
  let sql = 'SELECT * FROM deployments WHERE 1=1';
  const params: any[] = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (deployment_type) { sql += ' AND deployment_type = ?'; params.push(deployment_type); }
  if (runtime) { sql += ' AND runtime = ?'; params.push(runtime); }
  if (artifact_id) { sql += ' AND artifact_id = ?'; params.push(artifact_id); }
  if (q) {
    sql += ' AND (name LIKE ? OR artifact_name LIKE ? OR host LIKE ? OR notes LIKE ?)';
    const p = '%' + q + '%';
    params.push(p, p, p, p);
  }

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRow = db.prepare(countSql).get(...params);

  const limitNum = limit ? parseInt(limit as string) : 100;
  const offsetNum = offset ? parseInt(offset as string) : 0;
  sql += ` ORDER BY updated_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

  const rows = db.prepare(sql).all(...params);
  return {
    ok: true,
    deployments: rows.map((r: any) => ({ ...r, config_json: parseJsonField(r.config_json) })),
    total: countRow?.total ?? rows.length,
  };
}

// ── Get by ID ────────────────────────────────────────────────────────────────
export async function getDeploymentById(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
  if (!row) return { ok: false, error: 'Deployment ' + id + ' not found' };
  return { ok: true, deployment: { ...row, config_json: parseJsonField(row.config_json) } };
}

// ── Create ───────────────────────────────────────────────────────────────────
export async function createDeployment(data) {
  const parsed = createDeploymentSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const d = parsed.data;
  const db = getDatabase();
  const id = generateId();
  const n = now();
  const port = d.port ?? (8000 + Math.floor(Math.random() * 1000));
  const baseUrl = d.base_url || 'http://' + d.host + ':' + port;
  db.prepare(`INSERT INTO deployments (
    id,name,deployment_type,runtime,status,artifact_id,artifact_name,
    training_job_id,evaluation_id,host,port,base_url,entrypoint,
    model_path,config_json,health_status,notes,created_at,updated_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id,d.name,d.deployment_type,d.runtime,d.status,d.artifact_id,d.artifact_name,
    d.training_job_id,d.evaluation_id,d.host,port,baseUrl,d.entrypoint,
    d.model_path,d.config_json,d.health_status,d.notes,n,n
  );
  return { ok: true, deployment: (await getDeploymentById(id)).deployment };
}

// ── Update ───────────────────────────────────────────────────────────────────
export async function updateDeployment(id, data) {
  const existing = await getDeploymentById(id);
  if (!existing.ok) return existing;
  const parsed = updateDeploymentSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const d = parsed.data;
  const db = getDatabase();
  const n = now();
  const fields = Object.keys(d).filter(k => d[k] !== undefined);
  if (fields.length === 0) return existing;
  const sets = fields.map(f => f + ' = ?').join(', ');
  const vals = fields.map(f => d[f]);
  db.prepare('UPDATE deployments SET ' + sets + ', updated_at = ? WHERE id = ?').run(...vals, n, id);
  return { ok: true, deployment: (await getDeploymentById(id)).deployment };
}

// ── Helper: write log ────────────────────────────────────────────────────────
function _writeLog(db, deploymentId, level, message) {
  const id = generateId();
  db.prepare('INSERT INTO deployment_logs (id, deployment_id, level, message, created_at) VALUES (?,?,?,?,?)')
    .run(id, deploymentId, level, message, now());
}

// ── Soft Delete ──────────────────────────────────────────────────────────────
export async function deleteDeployment(id) {
  const db = getDatabase();
  const existing = await getDeploymentById(id);
  if (!existing.ok) return existing;
  db.prepare('UPDATE deployments SET status = ?, updated_at = ? WHERE id = ?').run('deleted', now(), id);
  _writeLog(db, id, 'info', 'Deployment marked as deleted');
  return { ok: true, deployment: (await getDeploymentById(id)).deployment };
}

// ── Create from Artifact ─────────────────────────────────────────────────────
export async function createDeploymentFromArtifact(artifactId: string, extraData: any = {}) {
  const db = getDatabase();
  const artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId);
  if (!artifact) return { ok: false, error: 'Artifact ' + artifactId + ' not found' };
  const id = generateId();
  const n = now();
  const host = extraData.host || 'localhost';
  const port = extraData.port || (9000 + Math.floor(Math.random() * 1000));
  const deploymentType = extraData.deployment_type || 'model_service';
  const runtime = extraData.runtime || 'mock';
  db.prepare(`INSERT INTO deployments (
    id,name,deployment_type,runtime,status,artifact_id,artifact_name,
    training_job_id,host,port,base_url,model_path,config_json,
    health_status,notes,created_at,updated_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, 'Deploy: ' + artifact.name, deploymentType, runtime, 'created',
    artifactId, artifact.name, artifact.training_job_id || '',
    host, port, 'http://' + host + ':' + port,
    artifact.model_path || artifact.path || '', '{}', 'unknown',
    'Auto-created from artifact ' + artifactId, n, n
  );
  _writeLog(db, id, 'info', 'Deployment auto-created from artifact: ' + artifact.name);
  return { ok: true, deployment: (await getDeploymentById(id)).deployment };
}

// ── Start (mock) ─────────────────────────────────────────────────────────────
export async function startDeployment(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
  if (!row) return { ok: false, error: 'Deployment ' + id + ' not found' };
  if (row.status === 'running') return { ok: false, error: 'Deployment already running' };
  if (row.status === 'deleted') return { ok: false, error: 'Cannot start a deleted deployment' };
  const n = now();
  db.prepare('UPDATE deployments SET status = ?, health_status = ?, started_at = ?, updated_at = ? WHERE id = ?')
    .run('deploying', 'starting', n, n, id);
  _writeLog(db, id, 'info', 'Deployment deploying...');
  await new Promise(r => setTimeout(r, 800));
  db.prepare('UPDATE deployments SET status = ?, health_status = ?, updated_at = ? WHERE id = ?')
    .run('running', 'healthy', now(), id);
  _writeLog(db, id, 'info', 'Deployment started successfully, health=healthy');
  return { ok: true, deployment: (await getDeploymentById(id)).deployment };
}

// ── Stop (mock) ──────────────────────────────────────────────────────────────
export async function stopDeployment(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
  if (!row) return { ok: false, error: 'Deployment ' + id + ' not found' };
  if (row.status === 'stopped') return { ok: false, error: 'Deployment already stopped' };
  if (row.status === 'deleted') return { ok: false, error: 'Cannot stop a deleted deployment' };
  db.prepare('UPDATE deployments SET status = ?, health_status = ?, stopped_at = ?, updated_at = ? WHERE id = ?')
    .run('stopped', 'stopped', now(), now(), id);
  _writeLog(db, id, 'info', 'Deployment stopped');
  return { ok: true, deployment: (await getDeploymentById(id)).deployment };
}

// ── Restart (mock) ──────────────────────────────────────────────────────────
export async function restartDeployment(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
  if (!row) return { ok: false, error: 'Deployment ' + id + ' not found' };
  if (row.status === 'deleted') return { ok: false, error: 'Cannot restart a deleted deployment' };
  _writeLog(db, id, 'info', 'Restarting deployment...');
  if (row.status === 'running') {
    db.prepare('UPDATE deployments SET status = ?, health_status = ?, stopped_at = ?, updated_at = ? WHERE id = ?')
      .run('stopped', 'stopped', now(), now(), id);
    await new Promise(r => setTimeout(r, 300));
  }
  await new Promise(r => setTimeout(r, 200));
  db.prepare('UPDATE deployments SET status = ?, health_status = ?, started_at = ?, updated_at = ? WHERE id = ?')
    .run('deploying', 'starting', now(), now(), id);
  _writeLog(db, id, 'info', 'Deployment restarting, entering deploying state...');
  await new Promise(r => setTimeout(r, 1000));
  db.prepare('UPDATE deployments SET status = ?, health_status = ?, updated_at = ? WHERE id = ?')
    .run('running', 'healthy', now(), id);
  _writeLog(db, id, 'info', 'Deployment restarted successfully, health=healthy');
  return { ok: true, deployment: (await getDeploymentById(id)).deployment };
}

// ── Logs ─────────────────────────────────────────────────────────────────────
export async function getDeploymentLogs(deploymentId: string, query: any = {}) {
  const db = getDatabase();
  const { level, limit = 100 } = query;
  let sql = 'SELECT * FROM deployment_logs WHERE deployment_id = ?';
  const params: any[] = [deploymentId];
  if (level) { sql += ' AND level = ?'; params.push(level); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));
  const rows = db.prepare(sql).all(...params);
  return { ok: true, logs: rows.reverse(), total: rows.length };
}

// ── Health ───────────────────────────────────────────────────────────────────
export async function getDeploymentHealth(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
  if (!row) return { ok: false, error: 'Deployment ' + id + ' not found' };
  // Mock health check: random latency
  await new Promise(r => setTimeout(r, 50 + Math.floor(Math.random() * 100)));
  const latencyMs = 50 + Math.floor(Math.random() * 100);
  const healthy = row.health_status === 'healthy' && row.status === 'running';
  return {
    ok: true,
    deployment_id: id,
    status: row.status,
    health_status: row.health_status,
    base_url: row.base_url,
    port: row.port,
    latency_ms: latencyMs,
    is_healthy: healthy,
    last_check: now(),
  };
}
