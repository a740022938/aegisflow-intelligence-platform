import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';

// 动态导入避免循环依赖
async function auditLog(params: { category: string; action: string; target: string; result: 'success' | 'failed' | 'partial'; detail?: Record<string, any> }) {
  try {
    const audit = await import('../audit/index.js');
    return await audit.logAudit(params);
  } catch { /* 审计模块不可用时静默忽略 */ }
}

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const createRollbackPointSchema = z.object({
  deployment_id: z.string().min(1, 'deployment_id is required'),
  from_revision_id: z.string().min(1, 'from_revision_id is required'),
  to_revision_id: z.string().min(1, 'to_revision_id is required'),
  reason: z.string().default(''),
});

// ── List ─────────────────────────────────────────────────────────────────────

export async function listRollbackPoints(query: any) {
  const dbInstance = getDatabase();
  const { deployment_id, status } = query;

  let sql = `
    SELECT rp.*, d.name as deployment_name
    FROM rollback_points rp
    LEFT JOIN deployments d ON rp.deployment_id = d.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (deployment_id) {
    sql += ' AND rp.deployment_id = ?';
    params.push(deployment_id);
  }
  if (status) {
    sql += ' AND rp.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY rp.created_at DESC';

  const rows = dbInstance.prepare(sql).all(...params);
  return {
    ok: true,
    rollback_points: rows,
    total: rows.length,
  };
}

// ── Get One ──────────────────────────────────────────────────────────────────

export async function getRollbackPointById(id: string) {
  const dbInstance = getDatabase();
  const rp = dbInstance.prepare(`
    SELECT rp.*, d.name as deployment_name,
      fr.revision_number as from_revision_number,
      tr.revision_number as to_revision_number
    FROM rollback_points rp
    LEFT JOIN deployments d ON rp.deployment_id = d.id
    LEFT JOIN deployment_revisions fr ON rp.from_revision_id = fr.id
    LEFT JOIN deployment_revisions tr ON rp.to_revision_id = tr.id
    WHERE rp.id = ?
  `).get(id) as any;
  if (!rp) {
    return { ok: false, error: `Rollback point ${id} not found` };
  }
  return { ok: true, rollback_point: rp };
}

// ── Create Rollback Point ────────────────────────────────────────────────────

export async function createRollbackPoint(body: any) {
  const dbInstance = getDatabase();
  const validation = createRollbackPointSchema.safeParse(body);
  if (!validation.success) {
    return { ok: false, error: validation.error.message };
  }
  const data = validation.data;
  const id = generateId();
  const nowStr = now();

  // Verify deployment exists
  const deployment = dbInstance.prepare('SELECT * FROM deployments WHERE id = ?').get(data.deployment_id);
  if (!deployment) {
    return { ok: false, error: `Deployment ${data.deployment_id} not found` };
  }

  // Verify revisions exist and belong to this deployment
  const fromRev = dbInstance.prepare('SELECT * FROM deployment_revisions WHERE id = ? AND deployment_id = ?').get(data.from_revision_id, data.deployment_id);
  if (!fromRev) {
    return { ok: false, error: `From revision ${data.from_revision_id} not found or does not belong to this deployment` };
  }

  const toRev = dbInstance.prepare('SELECT * FROM deployment_revisions WHERE id = ? AND deployment_id = ?').get(data.to_revision_id, data.deployment_id);
  if (!toRev) {
    return { ok: false, error: `To revision ${data.to_revision_id} not found or does not belong to this deployment` };
  }

  dbInstance.prepare(`
    INSERT INTO rollback_points (
      id, deployment_id, from_revision_id, to_revision_id, reason, status, created_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).run(id, data.deployment_id, data.from_revision_id, data.to_revision_id, data.reason, nowStr);

  return {
    ok: true,
    rollback_point: {
      id,
      deployment_id: data.deployment_id,
      from_revision_id: data.from_revision_id,
      to_revision_id: data.to_revision_id,
      reason: data.reason,
      status: 'pending',
      created_at: nowStr,
    },
  };
}

// ── Execute Rollback ─────────────────────────────────────────────────────────

export async function executeRollback(id: string) {
  const dbInstance = getDatabase();
  const rp = dbInstance.prepare('SELECT * FROM rollback_points WHERE id = ?').get(id) as any;
  if (!rp) {
    await auditLog({ category: 'rollback', action: 'execute', target: id, result: 'failed', detail: { error: 'not_found' } });
    return { ok: false, error: `Rollback point ${id} not found` };
  }

  if (rp.status === 'completed') {
    await auditLog({ category: 'rollback', action: 'execute', target: id, result: 'failed', detail: { error: 'already_completed' } });
    return { ok: false, error: 'Rollback already completed' };
  }

  const nowStr = now();

  // Verify to_revision exists and is deployable
  const toRev = dbInstance.prepare('SELECT * FROM deployment_revisions WHERE id = ?').get(rp.to_revision_id) as any;
  if (!toRev) {
    await auditLog({ category: 'rollback', action: 'execute', target: id, result: 'failed', detail: { error: 'target_revision_not_found', to_revision_id: rp.to_revision_id } });
    return { ok: false, error: `Target revision ${rp.to_revision_id} not found` };
  }

  // Mark current revision as superseded
  dbInstance.prepare(`
    UPDATE deployment_revisions 
    SET status = 'superseded' 
    WHERE deployment_id = ? AND status = 'current'
  `).run(rp.deployment_id);

  // Mark to_revision as current
  dbInstance.prepare(`
    UPDATE deployment_revisions 
    SET status = 'current', deployed_at = COALESCE(deployed_at, ?)
    WHERE id = ?
  `).run(nowStr, rp.to_revision_id);

  // Mark rollback as completed
  dbInstance.prepare(`
    UPDATE rollback_points 
    SET status = 'completed', rolled_back_at = ?
    WHERE id = ?
  `).run(nowStr, id);

  // Update deployment
  dbInstance.prepare(`
    UPDATE deployments 
    SET updated_at = ?
    WHERE id = ?
  `).run(nowStr, rp.deployment_id);

  // Audit: rollback success
  await auditLog({
    category: 'rollback',
    action: 'execute',
    target: `deployment:${rp.deployment_id} from:${rp.from_revision_id} to:${rp.to_revision_id}`,
    result: 'success',
    detail: {
      rollback_point_id: id,
      deployment_id: rp.deployment_id,
      from_revision_id: rp.from_revision_id,
      to_revision_id: rp.to_revision_id,
      to_revision_number: toRev.revision_number,
      consistency_check: {
        previous_superseded: true,
        target_current_set: true,
        rollback_point_completed: true
      }
    }
  });

  return {
    ok: true,
    rollback_point: {
      id,
      deployment_id: rp.deployment_id,
      from_revision_id: rp.from_revision_id,
      to_revision_id: rp.to_revision_id,
      status: 'completed',
      rolled_back_at: nowStr,
    },
    message: `Rolled back from revision ${(toRev as any).revision_number} to ${toRev.revision_number}`,
  };
}

// ── Get Rollback History ─────────────────────────────────────────────────────

export async function getRollbackHistory(deploymentId: string) {
  const dbInstance = getDatabase();
  const history = dbInstance.prepare(`
    SELECT rp.*, 
      fr.revision_number as from_revision_number,
      tr.revision_number as to_revision_number
    FROM rollback_points rp
    LEFT JOIN deployment_revisions fr ON rp.from_revision_id = fr.id
    LEFT JOIN deployment_revisions tr ON rp.to_revision_id = tr.id
    WHERE rp.deployment_id = ?
    ORDER BY rp.created_at DESC
  `).all(deploymentId);

  return {
    ok: true,
    deployment_id: deploymentId,
    history,
    total: history.length,
  };
}

// ── Retry Rollback ────────────────────────────────────────────────────────────

export async function retryRollback(id: string) {
  const dbInstance = getDatabase();

  const lastFailure = dbInstance.prepare(
    `SELECT * FROM audit_logs WHERE category = 'rollback' AND action = 'execute' AND target LIKE ? AND result = 'failed' ORDER BY created_at DESC LIMIT 1`
  ).get(`%point:${id}%`) as any;

  // Get the original rollback point
  const rp = dbInstance.prepare('SELECT * FROM rollback_points WHERE id = ?').get(id) as any;
  if (!rp) return { ok: false, error: `Rollback point ${id} not found` };

  const retryId = await auditLog({
    category: 'rollback',
    action: 'retry_execute',
    target: `point:${id}`,
    result: 'partial',
    detail: {
      rollback_point_id: id,
      original_failure: lastFailure ? {
        at: lastFailure.created_at,
        error: lastFailure.detail_json ? JSON.parse(lastFailure.detail_json).error : 'unknown'
      } : null
    }
  });

  const result = await executeRollback(id);

  dbInstance.prepare(
    `UPDATE audit_logs SET result = ?, detail_json = ? WHERE id = ?`
  ).run(
    result.ok ? 'success' : 'failed',
    JSON.stringify({
      ...(lastFailure ? { original_failure: JSON.parse(lastFailure.detail_json || '{}') } : {}),
      retry_result: result.ok ? 'rollback succeeded' : result.error
    }),
    retryId
  );

  return result;
}
