import { getDatabase } from '../db/builtin-sqlite.js';

function now() { return new Date().toISOString(); }

// ── Summary ──────────────────────────────────────────────────────────────────
export async function getDashboardSummary() {
  const db = getDatabase();

  const count = (table: string, where = '1=1') => {
    try { return (db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE ${where}`).get() as any)?.c ?? 0; }
    catch { return 0; }
  };

  return {
    ok: true,
    tasks_total: count('tasks'),
    templates_total: count('templates'),
    datasets_total: count('datasets'),
    experiments_total: count('experiments'),
    artifacts_total: count('artifacts'),
    evaluations_total: count('evaluations'),
    deployments_total: count('deployments'),
    // Status snapshots
    running_tasks: count('tasks', "status = 'running'"),
    running_experiments: count('experiments', "status = 'running'"),
    queued_experiments: count('experiments', "status = 'queued'"),
    failed_experiments: count('experiments', "status = 'failed'"),
    ready_artifacts: count('artifacts', "status = 'ready'"),
    failed_artifacts: count('artifacts', "status = 'failed'"),
    completed_evaluations: count('evaluations', "status = 'completed'"),
    failed_evaluations: count('evaluations', "status = 'failed'"),
    running_deployments: count('deployments', "status = 'running'"),
    // Dataset pipeline stats
    pipeline_runs_total: count('dataset_pipeline_runs'),
    pipeline_runs_success: count('dataset_pipeline_runs', "status = 'success'"),
    pipeline_runs_running: count('dataset_pipeline_runs', "status = 'running'"),
    pipeline_runs_failed: count('dataset_pipeline_runs', "status = 'failed'"),
    dataset_splits_total: count('dataset_splits'),
    stopped_deployments: count('deployments', "status = 'stopped'"),
    healthy_deployments: count('deployments', "health_status = 'healthy'"),
    unhealthy_deployments: count('deployments', "health_status = 'unhealthy'"),
    // Runs summary
    runs_total: count('runs'),
    queued_runs: count('runs', "status = 'queued'"),
    running_runs: count('runs', "status = 'running'"),
    success_runs: count('runs', "status = 'success'"),
    failed_runs: count('runs', "status = 'failed'"),
    cancelled_runs: count('runs', "status = 'cancelled'"),
  };
}

// ── Recent Activity ───────────────────────────────────────────────────────────
interface ActivityItem {
  type: string;        // 'experiment' | 'artifact' | 'evaluation' | 'deployment' | 'task'
  action: string;      // 'created' | 'started' | 'completed' | 'failed' | 'stopped'
  entity_id: string;
  entity_name: string;
  created_at: string;
}

export async function getRecentActivity(limit = 30) {
  const db = getDatabase();
  const rows: ActivityItem[] = [];

  const push = (type: string, id: string, name: string, ts: string, action = 'created') =>
    rows.push({ type, entity_id: id, entity_name: name, created_at: ts, action });

  const safe = (table: string, cols: string, where: string, type: string, actionMap: Record<string,string> = {}) => {
    try {
      const q = `SELECT ${cols} FROM ${table} WHERE ${where} ORDER BY updated_at DESC LIMIT ${limit}`;
      const r = db.prepare(q).all() as any[];
      r.forEach(row => {
        const a = actionMap[row.status] || 'created';
        push(type, row.id, row.name || row.title || row.experiment_name || row.deployment_name || type, row.updated_at || row.created_at, a);
      });
    } catch { /* safe */ }
  };

  safe('experiments', 'id, experiment_name as name, status, updated_at', "status != 'deleted'", 'experiment', {
    running: 'started', completed: 'completed', failed: 'failed', cancelled: 'cancelled',
  });
  safe('artifacts', 'id, name, status, updated_at', "status != 'deleted'", 'artifact', {
    ready: 'completed', failed: 'failed',
  });
  safe('evaluations', 'id, title, status, updated_at', "status != 'deleted'", 'evaluation', {
    completed: 'completed', failed: 'failed',
  });
  safe('deployments', 'id, name, status, updated_at', "status != 'deleted'", 'deployment', {
    running: 'started', stopped: 'stopped', failed: 'failed',
  });
  safe('tasks', 'id, title, status, updated_at', "status != 'deleted'", 'task', {
    running: 'started', completed: 'completed', failed: 'failed',
  });
  safe('runs', 'id, name, status, updated_at', "1=1", 'run', {
    running: 'started', success: 'completed', failed: 'failed', cancelled: 'cancelled',
  });

  // Deduplicate and sort by time descending
  const seen = new Set<string>();
  const deduped = rows.filter(r => {
    const key = r.type + ':' + r.entity_id;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  deduped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { ok: true, activities: deduped.slice(0, limit) };
}

// ── Enhanced detail helpers (called by index.ts) ─────────────────────────────

// Get related artifacts for an experiment
export function getRelatedArtifacts(experimentId: string) {
  const db = getDatabase();
  try {
    // artifacts table has 'path' not 'model_path'
    return (db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE training_job_id = ? ORDER BY created_at DESC LIMIT 10').all(experimentId) as any[]);
  } catch { return []; }
}

// Get related evaluations for an artifact (evaluations table has artifact_name, not artifact_id)
export function getRelatedEvaluations(artifactId: string) {
  const db = getDatabase();
  try {
    // First look up the artifact name
    const art = db.prepare('SELECT name FROM artifacts WHERE id = ?').get(artifactId) as any;
    if (!art?.name) return [];
    return (db.prepare('SELECT id, name as title, status, evaluation_type, created_at FROM evaluations WHERE artifact_name = ? ORDER BY created_at DESC LIMIT 10').all(art.name) as any[]);
  } catch { return []; }
}

// Get related deployments for an artifact
export function getRelatedDeployments(artifactId: string) {
  const db = getDatabase();
  try {
    return (db.prepare('SELECT id, name, deployment_type, status, health_status, host, port, created_at FROM deployments WHERE artifact_id = ? ORDER BY created_at DESC LIMIT 10').all(artifactId) as any[]);
  } catch { return []; }
}

// Get source training for an artifact
export function getSourceTraining(experimentId: string) {
  const db = getDatabase();
  try {
    // experiments table has 'name' column, not 'experiment_name'
    const row = db.prepare('SELECT id, name, status, created_at FROM experiments WHERE id = ?').get(experimentId) as any;
    return row || null;
  } catch { return null; }
}

// Get source artifact for an evaluation (artifactId = artifacts.id)
export function getSourceArtifact(artifactId: string) {
  const db = getDatabase();
  try {
    // artifacts table has 'path' not 'model_path'
    const row = db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE id = ?').get(artifactId) as any;
    return row || null;
  } catch { return null; }
}

// Get artifact by ID (used by deployment relations)
export function getArtifactByIdSimple(id: string) {
  const db = getDatabase();
  try {
    // artifacts table has 'path' not 'model_path'
    const row = db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE id = ?').get(id) as any;
    return row || null;
  } catch { return null; }
}

// Get source artifact/evaluation/training for a deployment
export function getDeploymentRelations(deploymentId: string) {
  const db = getDatabase();
  let artifact: any = null, evaluation: any = null, training: any = null;
  try {
    const row = db.prepare('SELECT artifact_id, training_job_id, evaluation_id FROM deployments WHERE id = ?').get(deploymentId) as any;
    if (!row) return { artifact: null, evaluation: null, training: null };
    if (row.artifact_id) {
      try { artifact = db.prepare('SELECT id, name, artifact_type, status, path, created_at FROM artifacts WHERE id = ?').get(row.artifact_id) as any; } catch { /* safe */ }
    }
    if (row.evaluation_id) {
      try { evaluation = db.prepare('SELECT id, name as title, status, evaluation_type, created_at FROM evaluations WHERE id = ?').get(row.evaluation_id) as any; } catch { /* safe */ }
    }
    if (row.training_job_id) {
      // experiments table has 'name' column, not 'experiment_name'
      try { training = db.prepare('SELECT id, name, status, created_at FROM experiments WHERE id = ?').get(row.training_job_id) as any; } catch { /* safe */ }
    }
    return { artifact, evaluation, training };
  } catch { return { artifact: null, evaluation: null, training: null }; }
}
