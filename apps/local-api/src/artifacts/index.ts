import { z } from 'zod';
import { getDatabase } from '../db/builtin-sqlite.js';
import * as packages from '../packages/index.js';

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function parseJsonField(val: string | undefined | null, fieldName: string) {
  if (!val) return {};
  try {
    return JSON.parse(val);
  } catch {
    throw new Error(`Invalid JSON in ${fieldName}`);
  }
}

const createArtifactSchema = z.object({
  name: z.string().min(1, 'name is required'),
  artifact_type: z.enum(['model', 'checkpoint', 'weights', 'tokenizer', 'adapter', 'embedding_index', 'config', 'report', 'other']).default('model'),
  status: z.enum(['ready', 'draft', 'archived', 'deleted', 'failed']).default('draft'),
  source_type: z.enum(['training', 'evaluation', 'manual', 'imported', 'system']).default('manual'),
  training_job_id: z.string().default(''),
  evaluation_id: z.string().default(''),
  dataset_id: z.string().default(''),
  parent_artifact_id: z.string().default(''),
  model_family: z.string().default(''),
  framework: z.string().default(''),
  format: z.string().default(''),
  version: z.string().default(''),
  path: z.string().default(''),
  file_size_bytes: z.number().int().nonnegative().optional(),
  metadata_json: z.string().default('{}'),
  metrics_snapshot_json: z.string().default('{}'),
  notes: z.string().default(''),
});

const updateArtifactSchema = z.object({
  name: z.string().optional(),
  artifact_type: z.enum(['model', 'checkpoint', 'weights', 'tokenizer', 'adapter', 'embedding_index', 'config', 'report', 'other']).optional(),
  status: z.enum(['ready', 'draft', 'archived', 'deleted', 'failed']).optional(),
  source_type: z.enum(['training', 'evaluation', 'manual', 'imported', 'system']).optional(),
  training_job_id: z.string().optional(),
  evaluation_id: z.string().optional(),
  dataset_id: z.string().optional(),
  parent_artifact_id: z.string().optional(),
  model_family: z.string().optional(),
  framework: z.string().optional(),
  format: z.string().optional(),
  version: z.string().optional(),
  path: z.string().optional(),
  file_size_bytes: z.number().int().nonnegative().optional().catch(undefined),
  metadata_json: z.string().optional(),
  metrics_snapshot_json: z.string().optional(),
  notes: z.string().optional(),
});

// ── List ─────────────────────────────────────────────────────────────────────
export async function listArtifacts(query: any) {
  const dbInstance = getDatabase();
  const { q, status, artifact_type, source_type, training_job_id } = query;

  let sql = 'SELECT * FROM artifacts WHERE 1=1';
  const params: any[] = [];

  if (q) {
    sql += ' AND (name LIKE ? OR model_family LIKE ? OR framework LIKE ? OR format LIKE ? OR path LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (artifact_type) {
    sql += ' AND artifact_type = ?';
    params.push(artifact_type);
  }
  if (source_type) {
    sql += ' AND source_type = ?';
    params.push(source_type);
  }
  if (training_job_id) {
    sql += ' AND training_job_id = ?';
    params.push(training_job_id);
  }

  sql += ' ORDER BY updated_at DESC';

  const rows = dbInstance.prepare(sql).all(...params);
  return {
    ok: true,
    artifacts: rows.map(r => ({
      ...r,
      metadata_json: parseJsonField((r as any).metadata_json, 'metadata_json'),
      metrics_snapshot_json: parseJsonField((r as any).metrics_snapshot_json, 'metrics_snapshot_json'),
    })),
    total: rows.length,
  };
}

// ── Get One ──────────────────────────────────────────────────────────────────
export async function getArtifactById(id: string) {
  const dbInstance = getDatabase();
  const artifact = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
  if (!artifact) {
    return { ok: false, error: `Artifact ${id} not found` };
  }
  return {
    ok: true,
    artifact: {
      ...artifact,
      metadata_json: parseJsonField(artifact.metadata_json, 'metadata_json'),
      metrics_snapshot_json: parseJsonField(artifact.metrics_snapshot_json, 'metrics_snapshot_json'),
    },
  };
}

// ── Create ───────────────────────────────────────────────────────────────────
export async function createArtifact(body: any) {
  const dbInstance = getDatabase();
  const validation = createArtifactSchema.safeParse(body);
  if (!validation.success) {
    return { ok: false, error: validation.error.message };
  }
  const data = validation.data;
  const id = generateId();
  const nowStr = now();

  let metadataStr = data.metadata_json;
  if (typeof metadataStr === 'object') metadataStr = JSON.stringify(metadataStr);
  if (!metadataStr) metadataStr = '{}';

  let metricsStr = data.metrics_snapshot_json;
  if (typeof metricsStr === 'object') metricsStr = JSON.stringify(metricsStr);
  if (!metricsStr) metricsStr = '{}';

  try { JSON.parse(metadataStr); } catch {
    return { ok: false, error: 'metadata_json is not valid JSON' };
  }
  try { JSON.parse(metricsStr); } catch {
    return { ok: false, error: 'metrics_snapshot_json is not valid JSON' };
  }

  dbInstance.prepare(`
    INSERT INTO artifacts (
      id, name, artifact_type, status, source_type,
      training_job_id, evaluation_id, dataset_id, parent_artifact_id,
      model_family, framework, format, version, path, file_size_bytes,
      metadata_json, metrics_snapshot_json, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.artifact_type, data.status, data.source_type,
    data.training_job_id, data.evaluation_id, data.dataset_id, data.parent_artifact_id,
    data.model_family, data.framework, data.format, data.version, data.path,
    data.file_size_bytes ?? null,
    metadataStr, metricsStr, data.notes,
    nowStr, nowStr
  );

  const created = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
  return {
    ok: true,
    artifact: {
      ...created,
      metadata_json: parseJsonField(created.metadata_json, 'metadata_json'),
      metrics_snapshot_json: parseJsonField(created.metrics_snapshot_json, 'metrics_snapshot_json'),
    },
  };
}

// ── Update ───────────────────────────────────────────────────────────────────
export async function updateArtifact(id: string, body: any) {
  const dbInstance = getDatabase();
  const existing = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
  if (!existing) {
    return { ok: false, error: 'Artifact not found' };
  }

  const validation = updateArtifactSchema.safeParse(body);
  if (!validation.success) {
    return { ok: false, error: validation.error.message };
  }
  const data = validation.data;

  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      if (['metadata_json', 'metrics_snapshot_json'].includes(key)) {
        try { JSON.parse(String(val)); } catch {
          return { ok: false, error: `${key} is not valid JSON` };
        }
        fields.push(`${key} = ?`);
        values.push(String(val));
      } else {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
  }

  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(now());
    values.push(id);
    dbInstance.prepare(`UPDATE artifacts SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
  return {
    ok: true,
    artifact: {
      ...updated,
      metadata_json: parseJsonField(updated.metadata_json, 'metadata_json'),
      metrics_snapshot_json: parseJsonField(updated.metrics_snapshot_json, 'metrics_snapshot_json'),
    },
  };
}

// ── Archive ──────────────────────────────────────────────────────────────────
export async function archiveArtifact(id: string) {
  const dbInstance = getDatabase();
  const existing = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
  if (!existing) {
    return { ok: false, error: 'Artifact not found' };
  }
  dbInstance.prepare('UPDATE artifacts SET status = ?, updated_at = ? WHERE id = ?')
    .run('archived', now(), id);
  const updated = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
  return {
    ok: true,
    artifact: {
      ...updated,
      metadata_json: parseJsonField(updated.metadata_json, 'metadata_json'),
      metrics_snapshot_json: parseJsonField(updated.metrics_snapshot_json, 'metrics_snapshot_json'),
    },
  };
}

// ══ v4.8.0: Promotion Gate ══════════════════════════════════════════════════

/**
 * Resolve the exact model_id linked to an artifact via evaluation → experiment → model chain.
 * Returns null if no unique model can be determined.
 */
function resolveModelId(dbInstance: any, art: any): string | null {
  // Path 1: artifact.evaluation_id → evaluations.experiment_id → models.source_experiment_id
  if (art.evaluation_id) {
    const evalRow = dbInstance.prepare('SELECT experiment_id FROM evaluations WHERE id = ?').get(art.evaluation_id) as any;
    if (evalRow?.experiment_id) {
      const model = dbInstance.prepare('SELECT model_id FROM models WHERE source_experiment_id = ? LIMIT 1').get(evalRow.experiment_id) as any;
      if (model?.model_id) return model.model_id;
    }
    // Path 2: artifact.evaluation_id → models.latest_evaluation_id
    const model2 = dbInstance.prepare('SELECT model_id FROM models WHERE latest_evaluation_id = ? LIMIT 1').get(art.evaluation_id) as any;
    if (model2?.model_id) return model2.model_id;
  }
  // Path 3: model_family + evaluation_id combo (more precise than model_family alone)
  if (art.model_family && art.evaluation_id) {
    const model3 = dbInstance.prepare('SELECT model_id FROM models WHERE model_family = ? AND latest_evaluation_id = ? LIMIT 1').get(art.model_family, art.evaluation_id) as any;
    if (model3?.model_id) return model3.model_id;
  }
  return null;
}

export async function getPromotionReadiness(id: string) {
  const dbInstance = getDatabase();
  const art = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
  if (!art) return { ok: false, error: 'Artifact not found' };

  const hasEval = !!art.evaluation_id;
  const hasMetrics = !!art.metrics_snapshot_json && art.metrics_snapshot_json !== '{}';
  const hasModelFamily = !!art.model_family;
  const hasFormat = !!art.format;

  // Check for report in evaluation if linked
  let hasReport = false;
  if (art.evaluation_id) {
    const evalRow = dbInstance.prepare('SELECT result_summary_json FROM evaluations WHERE id = ?').get(art.evaluation_id) as any;
    if (evalRow?.result_summary_json) {
      try {
        const summary = JSON.parse(evalRow.result_summary_json);
        hasReport = !!(summary.report_path || summary.eval_manifest_path);
      } catch { /* safe */ }
    }
  }

  const promotionStatus = art.promotion_status || 'draft';
  const canPromote = promotionStatus === 'draft' || promotionStatus === 'rejected';
  const readinessScore = [hasEval, hasMetrics, hasModelFamily, hasFormat].filter(Boolean).length;

  return {
    ok: true,
    readiness: {
      artifact_id: art.id,
      artifact_name: art.name,
      promotion_status: promotionStatus,
      source_evaluation: art.evaluation_id || null,
      has_evaluation: hasEval,
      has_metrics: hasMetrics,
      has_model_family: hasModelFamily,
      has_format: hasFormat,
      has_report: hasReport,
      readiness_score: readinessScore,
      readiness_max: 4,
      can_promote: canPromote,
      blocking_issues: [
        !hasEval && 'No linked evaluation',
        !hasMetrics && 'No metrics snapshot',
      ].filter(Boolean) as string[],
    },
  };
}

export async function promoteArtifact(id: string, body: any = {}) {
  const dbInstance = getDatabase();
  const art = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
  if (!art) return { ok: false, error: 'Artifact not found' };

  const currentStatus = art.promotion_status || 'draft';
  if (currentStatus !== 'draft' && currentStatus !== 'rejected') {
    return { ok: false, error: `Cannot promote from status '${currentStatus}'. Only draft/rejected can be promoted.` };
  }

  const nowStr = now();
  const comment = body.comment || '';
  const requireApproval = body.require_approval !== false; // default true

  if (requireApproval) {
    // Transition to approval_required
    dbInstance.prepare(`UPDATE artifacts SET promotion_status = ?, promotion_comment = ?, updated_at = ? WHERE id = ?`)
      .run('approval_required', comment, nowStr, id);

    // Create approval record
    const approvalId = generateId();
    dbInstance.prepare(`INSERT INTO approvals (id, action, resource_type, resource_id, status, policy_type, created_at, updated_at)
      VALUES (?, 'promotion_review', 'artifact', ?, 'pending', 'manual', ?, ?)`)
      .run(approvalId, id, nowStr, nowStr);

    // Audit
    try {
      dbInstance.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
        VALUES (?, 'promotion', 'promote_to_candidate', ?, 'approval_required', ?, ?)`)
        .run(generateId(), id, JSON.stringify({ artifact_id: id, approval_id: approvalId, from_status: currentStatus, to_status: 'approval_required' }), nowStr);
    } catch { /* safe */ }

    return {
      ok: true,
      promotion_status: 'approval_required',
      approval_id: approvalId,
      message: 'Promotion submitted for approval',
    };
  }

  // Direct promotion (no approval required)
  dbInstance.prepare(`UPDATE artifacts SET promotion_status = ?, promotion_comment = ?, updated_at = ? WHERE id = ?`)
    .run('candidate', comment, nowStr, id);

  // v4.8.1: Update exact target model only (never by model_family alone)
  const targetModelId = resolveModelId(dbInstance, art);
  if (targetModelId) {
    dbInstance.prepare(`UPDATE models SET promotion_status = 'candidate', source_artifact_id = ?, updated_at = ? WHERE model_id = ?`)
      .run(id, nowStr, targetModelId);
  }

  // Audit
  try {
    dbInstance.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'promotion', 'promote_to_candidate', ?, 'candidate', ?, ?)`)
      .run(generateId(), id, JSON.stringify({ artifact_id: id, from_status: currentStatus, to_status: 'candidate', direct: true }), nowStr);
  } catch { /* safe */ }

  return {
    ok: true,
    promotion_status: 'candidate',
    message: 'Artifact promoted to candidate',
  };
}

export async function approvePromotion(artifactId: string, body: any = {}) {
  const dbInstance = getDatabase();
  const art = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) return { ok: false, error: 'Artifact not found' };
  if (art.promotion_status !== 'approval_required') {
    return { ok: false, error: `Artifact is not awaiting approval (status: ${art.promotion_status})` };
  }

  const nowStr = now();
  const reviewedBy = body.reviewed_by || 'system';
  const comment = body.comment || '';

  // Update artifact
  dbInstance.prepare(`UPDATE artifacts SET promotion_status = 'approved', approved_by = ?, approved_at = ?, promotion_comment = ?, updated_at = ? WHERE id = ?`)
    .run(reviewedBy, nowStr, comment, nowStr, artifactId);

  // v4.8.1: Update exact target model only (never by model_family alone)
  const targetModelId = resolveModelId(dbInstance, art);
  if (targetModelId) {
    dbInstance.prepare(`UPDATE models SET promotion_status = 'approved', source_artifact_id = ?, promotion_comment = ?, updated_at = ? WHERE model_id = ?`)
      .run(artifactId, comment, nowStr, targetModelId);
  }

  // Update related approval
  dbInstance.prepare(`UPDATE approvals SET status = 'approved', reviewed_by = ?, reviewed_at = ?, comment = ?, updated_at = ? WHERE resource_id = ? AND resource_type = 'artifact' AND action = 'promotion_review' AND status = 'pending'`)
    .run(reviewedBy, nowStr, comment, nowStr, artifactId);

  // Audit
  try {
    dbInstance.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'promotion', 'approve_promotion', ?, 'approved', ?, ?)`)
      .run(generateId(), artifactId, JSON.stringify({ artifact_id: artifactId, reviewed_by: reviewedBy, model_family: art.model_family }), nowStr);
  } catch { /* safe */ }

  return { ok: true, promotion_status: 'approved', message: 'Promotion approved' };
}

export async function rejectPromotion(artifactId: string, body: any = {}) {
  const dbInstance = getDatabase();
  const art = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) return { ok: false, error: 'Artifact not found' };
  if (art.promotion_status !== 'approval_required') {
    return { ok: false, error: `Artifact is not awaiting approval (status: ${art.promotion_status})` };
  }

  const nowStr = now();
  const reviewedBy = body.reviewed_by || 'system';
  const comment = body.comment || '';

  dbInstance.prepare(`UPDATE artifacts SET promotion_status = 'rejected', approved_by = ?, approved_at = ?, promotion_comment = ?, updated_at = ? WHERE id = ?`)
    .run(reviewedBy, nowStr, comment, nowStr, artifactId);

  dbInstance.prepare(`UPDATE approvals SET status = 'rejected', reviewed_by = ?, reviewed_at = ?, comment = ?, updated_at = ? WHERE resource_id = ? AND resource_type = 'artifact' AND action = 'promotion_review' AND status = 'pending'`)
    .run(reviewedBy, nowStr, comment, nowStr, artifactId);

  try {
    dbInstance.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'promotion', 'reject_promotion', ?, 'rejected', ?, ?)`)
      .run(generateId(), artifactId, JSON.stringify({ artifact_id: artifactId, reviewed_by: reviewedBy }), nowStr);
  } catch { /* safe */ }

  return { ok: true, promotion_status: 'rejected', message: 'Promotion rejected' };
}

// ══ v4.9.0: Seal Release ══════════════════════════════════════════════════
export async function sealRelease(artifactId: string, body: any = {}) {
  const dbInstance = getDatabase();
  const art = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) return { ok: false, error: 'Artifact not found' };
  if (art.promotion_status !== 'approved') {
    return { ok: false, error: `Only approved artifacts can be sealed (current: ${art.promotion_status})` };
  }
  if (art.release_id) {
    return { ok: false, error: `Artifact already sealed (release_id: ${art.release_id})` };
  }

  const nowStr = now();
  const sealedBy = body.sealed_by || 'system';
  const releaseName = body.release_name || `${art.name}-release`;
  const releaseVersion = body.release_version || art.version || '1.0.0';

  // Resolve linked entities
  const targetModelId = resolveModelId(dbInstance, art);
  let sourceEvalId = art.evaluation_id || '';
  let sourceExpId = '';
  let sourceDatasetId = art.dataset_id || '';
  let metricsSnap = art.metrics_snapshot_json || '{}';
  let approvalId = '';
  let approvalStatus = '';

  if (sourceEvalId) {
    const evalRow = dbInstance.prepare('SELECT experiment_id, dataset_id FROM evaluations WHERE id = ?').get(sourceEvalId) as any;
    if (evalRow) {
      sourceExpId = evalRow.experiment_id || '';
      if (!sourceDatasetId) sourceDatasetId = evalRow.dataset_id || '';
    }
  }

  // Find the approval record for this artifact
  const approvalRow = dbInstance.prepare("SELECT id, status FROM approvals WHERE resource_id = ? AND resource_type = 'artifact' AND action = 'promotion_review' ORDER BY created_at DESC LIMIT 1").get(artifactId) as any;
  if (approvalRow) {
    approvalId = approvalRow.id;
    approvalStatus = approvalRow.status;
  }

  // Build release manifest
  const manifest = {
    release_name: releaseName,
    release_version: releaseVersion,
    sealed_at: nowStr,
    sealed_by: sealedBy,
    artifact: { id: art.id, name: art.name, type: art.artifact_type, source_type: art.source_type, model_family: art.model_family, framework: art.framework, format: art.format, version: art.version, storage_path: art.path },
    source_evaluation_id: sourceEvalId,
    source_experiment_id: sourceExpId,
    source_dataset_id: sourceDatasetId,
    source_model_id: targetModelId || '',
    metrics_snapshot: typeof metricsSnap === 'string' ? JSON.parse(metricsSnap || '{}') : metricsSnap,
    approval: { id: approvalId, status: approvalStatus, approved_by: art.approved_by, approved_at: art.approved_at },
    lineage: [
      ...(sourceEvalId ? [{ type: 'evaluation', id: sourceEvalId }] : []),
      { type: 'artifact', id: art.id },
      ...(targetModelId ? [{ type: 'model', id: targetModelId }] : []),
      ...(approvalId ? [{ type: 'approval', id: approvalId }] : []),
    ],
  };

  // Build release notes
  const metricsObj = typeof metricsSnap === 'string' ? JSON.parse(metricsSnap || '{}') : (metricsSnap || {});
  const metricsLines = Object.entries(metricsObj).map(([k, v]) => `- **${k}**: ${v}`).join('\n');
  const releaseNotes = `# Release: ${releaseName}\n\n` +
    `- **Version**: ${releaseVersion}\n` +
    `- **Sealed At**: ${nowStr}\n` +
    `- **Sealed By**: ${sealedBy}\n` +
    `- **Artifact**: ${art.name} (${art.id.slice(0, 12)}...)\n` +
    `- **Model Family**: ${art.model_family || 'N/A'}\n` +
    `- **Framework**: ${art.framework || 'N/A'}\n` +
    `- **Format**: ${art.format || 'N/A'}\n` +
    (sourceEvalId ? `- **Source Evaluation**: ${sourceEvalId.slice(0, 12)}...\n` : '') +
    (targetModelId ? `- **Source Model**: ${targetModelId}\n` : '') +
    (approvalId ? `- **Approval**: ${approvalId.slice(0, 12)}... (${approvalStatus})\n` : '') +
    (art.approved_by ? `- **Approved By**: ${art.approved_by}\n` : '') +
    (metricsLines ? `\n## Metrics\n\n${metricsLines}\n` : '');

  // Insert release record
  const releaseId = generateId();
  dbInstance.prepare(`INSERT INTO releases (id, artifact_id, model_id, release_name, release_version, status, sealed_by, sealed_at, release_notes, release_manifest_json, source_evaluation_id, source_experiment_id, source_dataset_id, metrics_snapshot_json, approval_id, approval_status, package_present, backup_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'sealed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)`)
    .run(releaseId, artifactId, targetModelId || '', releaseName, releaseVersion, sealedBy, nowStr,
         releaseNotes, JSON.stringify(manifest), sourceEvalId, sourceExpId, sourceDatasetId,
         typeof metricsSnap === 'string' ? metricsSnap : JSON.stringify(metricsSnap),
         approvalId, approvalStatus, nowStr, nowStr);

  // Update artifact
  dbInstance.prepare(`UPDATE artifacts SET promotion_status = 'sealed', sealed_at = ?, sealed_by = ?, release_id = ?, updated_at = ? WHERE id = ?`)
    .run(nowStr, sealedBy, releaseId, nowStr, artifactId);

  // Update model
  if (targetModelId) {
    dbInstance.prepare(`UPDATE models SET promotion_status = 'sealed', sealed_at = ?, sealed_by = ?, release_id = ?, updated_at = ? WHERE model_id = ?`)
      .run(nowStr, sealedBy, releaseId, nowStr, targetModelId);
  }

  // Audit
  try {
    dbInstance.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'release', 'seal_release', ?, 'sealed', ?, ?)`)
      .run(generateId(), artifactId, JSON.stringify({ release_id: releaseId, artifact_id: artifactId, model_id: targetModelId, sealed_by: sealedBy, release_name: releaseName }), nowStr);
  } catch { /* safe */ }

  // Audit: manifest created
  try {
    dbInstance.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'release', 'manifest_created', ?, 'success', ?, ?)`)
      .run(generateId(), releaseId, JSON.stringify({ release_id: releaseId, artifact_id: artifactId }), nowStr);
  } catch { /* safe */ }

  // Audit: release notes created
  try {
    dbInstance.prepare(`INSERT INTO audit_logs (id, category, action, target, result, detail_json, created_at)
      VALUES (?, 'release', 'release_notes_created', ?, 'success', ?, ?)`)
      .run(generateId(), releaseId, JSON.stringify({ release_id: releaseId, release_name: releaseName }), nowStr);
  } catch { /* safe */ }

  return {
    ok: true,
    release_id: releaseId,
    release_name: releaseName,
    release_version: releaseVersion,
    status: 'sealed',
    message: 'Release sealed successfully',
  };
}

export async function getRelease(id: string) {
  const dbInstance = getDatabase();
  const release = dbInstance.prepare('SELECT * FROM releases WHERE id = ?').get(id) as any;
  if (!release) return { ok: false, error: 'Release not found' };
  return {
    ok: true,
    release: {
      ...release,
      release_manifest_json: parseJsonField(release.release_manifest_json, 'release_manifest_json'),
      metrics_snapshot_json: parseJsonField(release.metrics_snapshot_json, 'metrics_snapshot_json'),
    },
  };
}

export async function listReleases(query: any = {}) {
  const dbInstance = getDatabase();
  const limit = Math.min(parseInt(query.limit) || 50, 200);
  const rows = dbInstance.prepare('SELECT * FROM releases ORDER BY sealed_at DESC LIMIT ?').all(limit) as any[];
  const total = (dbInstance.prepare('SELECT COUNT(*) as c FROM releases').get() as any).c;
  return {
    ok: true,
    releases: rows.map(r => ({
      ...r,
      release_manifest_json: parseJsonField(r.release_manifest_json, 'release_manifest_json'),
      metrics_snapshot_json: parseJsonField(r.metrics_snapshot_json, 'metrics_snapshot_json'),
    })),
    total,
  };
}

export async function getArtifactRelease(artifactId: string) {
  const dbInstance = getDatabase();
  const release = dbInstance.prepare('SELECT * FROM releases WHERE artifact_id = ? ORDER BY sealed_at DESC LIMIT 1').get(artifactId) as any;
  if (!release) return { ok: true, release: null };
  return {
    ok: true,
    release: {
      ...release,
      release_manifest_json: parseJsonField(release.release_manifest_json, 'release_manifest_json'),
      metrics_snapshot_json: parseJsonField(release.metrics_snapshot_json, 'metrics_snapshot_json'),
    },
  };
}

// ── Soft Delete ───────────────────────────────────────────────────────────────
export async function deleteArtifact(id: string) {
  const dbInstance = getDatabase();
  const existing = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
  if (!existing) {
    return { ok: false, error: 'Artifact not found' };
  }
  dbInstance.prepare('UPDATE artifacts SET status = ?, updated_at = ? WHERE id = ?')
    .run('deleted', now(), id);
  return { ok: true };
}

// ── Create from Training Job ─────────────────────────────────────────────────
export async function createArtifactFromTraining(trainingJobId: string) {
  const dbInstance = getDatabase();

  // Try to get experiment by task_id (experiments.task_id == trainingJobId)
  const experiment = dbInstance.prepare(
    'SELECT * FROM experiments WHERE task_id = ? OR id = ? LIMIT 1'
  ).get(trainingJobId, trainingJobId) as any;

  const id = generateId();
  const nowStr = now();

  let name = 'Training Artifact';
  let sourceType = 'training';
  let modelFamily = '';
  let framework = '';
  let version = '1.0';
  let path = '';
  let notes = `Auto-created from training job: ${trainingJobId}`;
  let trainingJobIdFinal = trainingJobId;

  if (experiment) {
    name = `${experiment.name || 'Training Artifact'} (Checkpoint)`;
    modelFamily = experiment.template_code || '';
    path = experiment.checkpoint_path || experiment.output_dir || '';
    notes = `Auto-created from training job ${trainingJobId} (experiment: ${experiment.id})`;
    trainingJobIdFinal = experiment.task_id || experiment.id;
  }

  dbInstance.prepare(`
    INSERT INTO artifacts (
      id, name, artifact_type, status, source_type,
      training_job_id, evaluation_id, dataset_id, parent_artifact_id,
      model_family, framework, format, version, path, file_size_bytes,
      metadata_json, metrics_snapshot_json, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, 'checkpoint', 'ready', sourceType,
    trainingJobIdFinal, '', '', '',
    modelFamily, framework, 'pytorch', version, path, null,
    '{}', experiment ? JSON.stringify({
      experiment_id: experiment.id,
      experiment_code: experiment.experiment_code,
      dataset_version: experiment.dataset_version,
    }) : '{}',
    notes,
    nowStr, nowStr
  );

  const created = dbInstance.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
  return {
    ok: true,
    artifact: {
      ...created,
      metadata_json: parseJsonField(created.metadata_json, 'metadata_json'),
      metrics_snapshot_json: parseJsonField(created.metrics_snapshot_json, 'metrics_snapshot_json'),
    },
  };
}

// ── Create Evaluation from Artifact ─────────────────────────────────────────
export async function createEvaluationFromArtifact(artifactId: string, extraData: any = {}) {
  const artifact = await getArtifactById(artifactId);
  if (!artifact.ok || !artifact.artifact) {
    return { ok: false, error: `Artifact ${artifactId} not found` };
  }
  const a = artifact.artifact;

  // If artifact has evaluation_id already pointing to an evaluation, use that
  if (a.evaluation_id) {
    return {
      ok: false,
      error: `Artifact is already linked to evaluation: ${a.evaluation_id}. Use that evaluation directly.`,
    };
  }

  const dbInstance = getDatabase();

  // Try to look up the experiment/training job for dataset_id
  let datasetId = a.dataset_id || '';
  let datasetName = '';
  if (a.training_job_id) {
    const exp = dbInstance.prepare('SELECT * FROM experiments WHERE task_id = ? OR id = ? LIMIT 1')
      .get(a.training_job_id, a.training_job_id) as any;
    if (exp) {
      datasetId = exp.dataset_id || '';
      datasetName = exp.dataset_code || '';
    }
  }

  const id = generateId();
  const nowStr = now();

  // Determine evaluation type from artifact type or extraData
  const evalType = extraData.evaluation_type ||
    (a.artifact_type === 'model' || a.artifact_type === 'checkpoint' || a.artifact_type === 'weights' ? 'classification' : 'custom');

  dbInstance.prepare(`
    INSERT INTO evaluations (
      id, name, evaluation_type, status, model_name, artifact_name,
      dataset_name, dataset_id, training_job_id, notes,
      config_json, result_summary_json,
      created_at, updated_at, started_at, finished_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    `评估: ${a.name}`,
    evalType,
    'pending',
    a.model_family || a.framework || a.artifact_type,
    a.name,
    datasetName,
    datasetId,
    a.training_job_id,
    `从产物 ${a.id} 快速创建 | ${a.notes || ''}`.trim(),
    '{}', '{}',
    nowStr, nowStr, null, null
  );

  // Link artifact → evaluation
  dbInstance.prepare('UPDATE artifacts SET evaluation_id = ?, updated_at = ? WHERE id = ?')
    .run(id, nowStr, artifactId);

  const created = dbInstance.prepare('SELECT * FROM evaluations WHERE id = ?').get(id) as any;
  return {
    ok: true,
    evaluation: {
      ...created,
      config_json: parseJsonField(created.config_json, 'config_json'),
      result_summary_json: parseJsonField(created.result_summary_json, 'result_summary_json'),
    },
    artifact_id: artifactId,
  };
}

// ── F9: Release Package ─────────────────────────────────────────────────────

interface ReleasePackageStatus {
  ok: boolean;
  artifact_id: string;
  artifact_name: string;
  promotion_status: string;
  release_id: string | null;
  release_status: string | null;

  // Package readiness
  package_readiness: {
    has_model_family: boolean;
    has_format: boolean;
    has_metrics: boolean;
    has_evaluation: boolean;
    has_release: boolean;
    score: number;
    max: number;
    can_package: boolean;
    missing: string[];
  };

  // Linked entities
  model_id: string | null;
  evaluation_id: string | null;
  experiment_id: string | null;
  dataset_id: string | null;

  // Metrics snapshot
  metrics: Record<string, any>;

  // Artifact path
  artifact_path: string;
  artifact_size_bytes: number;

  // Release info if sealed
  release_info: {
    id: string;
    name: string;
    version: string;
    sealed_at: string | null;
    sealed_by: string | null;
    release_notes: string;
    package_storage_path: string | null;
    package_present: boolean;
  } | null;

  // Deliverable paths
  deliverable_paths: {
    role: string;
    path: string;
    description: string;
  }[];
}

/** Read JSON file safely */
function readJsonFile(path: string): any {
  if (!path) return null;
  try {
    const fs = require('fs');
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(path, 'utf-8'));
    }
  } catch { /* safe */ }
  return null;
}

/** F9: Get comprehensive release package status for an artifact */
export function getArtifactReleasePackage(artifactId: string): ReleasePackageStatus | { ok: false; error: string } {
  const db = getDatabase();
  const art = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) return { ok: false, error: 'Artifact not found' };

  const promo = art.promotion_status || 'draft';
  const hasMF = !!art.model_family;
  const hasFmt = !!art.format;
  const hasMet = !!(art.metrics_snapshot_json && art.metrics_snapshot_json !== '{}');
  const hasEval = !!(art.evaluation_id);
  const hasRel = !!(art.release_id);
  const score = [hasMF, hasFmt, hasMet, hasEval].filter(Boolean).length;

  const missing: string[] = [];
  if (!hasMF) missing.push('model_family');
  if (!hasFmt) missing.push('format');
  if (!hasMet) missing.push('metrics_snapshot');
  if (!hasEval) missing.push('evaluation');

  // Resolve linked entities
  let evalId = art.evaluation_id || '';
  let expId = '';
  let dsId = art.dataset_id || '';

  if (evalId) {
    const ev = db.prepare('SELECT experiment_id, dataset_id FROM evaluations WHERE id = ?').get(evalId) as any;
    if (ev) {
      if (!expId) expId = ev.experiment_id || '';
      if (!dsId) dsId = ev.dataset_id || '';
    }
  }

  // Resolve model_id
  let modelId: string | null = null;
  if (expId) {
    const m = db.prepare('SELECT model_id FROM models WHERE source_experiment_id = ? LIMIT 1').get(expId) as any;
    modelId = m?.model_id || null;
  }

  // Parse metrics
  let metrics: Record<string, any> = {};
  if (art.metrics_snapshot_json) {
    try { metrics = JSON.parse(art.metrics_snapshot_json); } catch { /* safe */ }
  }

  // Release info
  let releaseInfo: ReleasePackageStatus['release_info'] = null;
  if (art.release_id) {
    const rel = db.prepare('SELECT * FROM releases WHERE id = ?').get(art.release_id) as any;
    if (rel) {
      releaseInfo = {
        id: rel.id,
        name: rel.release_name || rel.release_name || rel.id,
        version: rel.release_version || '1.0.0',
        sealed_at: rel.sealed_at || null,
        sealed_by: rel.sealed_by || null,
        release_notes: rel.release_notes || '',
        package_storage_path: null,
        package_present: !!rel.package_present,
      };

      // Check if package dir exists
      const pkgId = rel.release_manifest_json ? (() => {
        try {
          const m = JSON.parse(rel.release_manifest_json);
          return m?.package?.id;
        } catch { return null; }
      })() : null;
      if (pkgId) {
        const fs = require('fs');
        const baseStorage = 'apps/local-api/packages/storage/releases';
        const pkgDir = `${baseStorage}/${pkgId}`;
        try {
          if (fs.existsSync(pkgDir)) {
            releaseInfo.package_storage_path = pkgDir;
            releaseInfo.package_present = true;
          }
        } catch { /* safe */ }
      }
    }
  }

  // Deliverable paths
  const deliverablePaths: ReleasePackageStatus['deliverable_paths'] = [];

  // 1. Artifact checkpoint
  if (art.path) {
    deliverablePaths.push({ role: 'checkpoint', path: art.path, description: '训练权重检查点文件' });
  }

  // 2. Evaluation report
  if (art.evaluation_id) {
    const ev = db.prepare('SELECT report_path, eval_manifest_path FROM evaluations WHERE id = ?').get(art.evaluation_id) as any;
    if (ev?.report_path) {
      deliverablePaths.push({ role: 'metrics_json', path: ev.report_path, description: 'YOLO 验证指标 JSON' });
    }
    if (ev?.eval_manifest_path) {
      deliverablePaths.push({ role: 'eval_manifest', path: ev.eval_manifest_path, description: '评估执行清单 JSON' });
    }
  }

  // 3. Model package (if exists)
  if (modelId) {
    const pkg = db.prepare('SELECT storage_path, package_version, status FROM model_packages WHERE model_id = ? ORDER BY created_at DESC LIMIT 1').get(modelId) as any;
    if (pkg?.storage_path) {
      deliverablePaths.push({ role: 'model_package', path: pkg.storage_path, description: `模型发布包 v${pkg.package_version || '?'} (${pkg.status})` });
    }
  }

  // 4. Release package (if sealed)
  if (releaseInfo?.package_storage_path) {
    deliverablePaths.push({ role: 'release_package', path: releaseInfo.package_storage_path, description: '完整发布交付包（含 manifest/checksums/release-note）' });
  }

  return {
    ok: true,
    artifact_id: artifactId,
    artifact_name: art.name || art.id,
    promotion_status: promo,
    release_id: art.release_id || null,
    release_status: releaseInfo ? (releaseInfo.package_present ? 'packaged' : 'sealed') : null,

    package_readiness: {
      has_model_family: hasMF,
      has_format: hasFmt,
      has_metrics: hasMet,
      has_evaluation: hasEval,
      has_release: hasRel,
      score,
      max: 4,
      can_package: score >= 3 && promo === 'approved',
      missing,
    },

    model_id: modelId,
    evaluation_id: evalId || null,
    experiment_id: expId || null,
    dataset_id: dsId || null,

    metrics,
    artifact_path: art.path || '',
    artifact_size_bytes: art.file_size_bytes || 0,

    release_info: releaseInfo,

    deliverable_paths: deliverablePaths,
  };
}

// ── F9: Build Release Package for Artifact ───────────────────────────────────

interface BuildArtifactPackageResult {
  ok: boolean;
  artifact_id: string;
  model_id: string | null;
  package_id: string | null;
  package_storage_path: string | null;
  status: string;
  message: string;
  deliverables: { role: string; path: string }[];
}

/** F9: Trigger model package build for an artifact's model */
export async function buildArtifactReleasePackage(
  artifactId: string,
  options: { version?: string; release_note?: string } = {}
): Promise<BuildArtifactPackageResult> {
  const db = getDatabase();
  const art = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) return { ok: false, artifact_id: artifactId, model_id: null, package_id: null, package_storage_path: null, status: 'error', message: 'Artifact not found', deliverables: [] };

  // Resolve model_id
  let modelId: string | null = null;
  let expId = '';
  if (art.training_job_id) {
    const m = db.prepare('SELECT model_id FROM models WHERE source_experiment_id = ? ORDER BY created_at DESC LIMIT 1').get(art.training_job_id) as any;
    if (m) modelId = m.model_id;
  }

  if (!modelId) {
    return {
      ok: false, artifact_id: artifactId, model_id: null, package_id: null,
      package_storage_path: null, status: 'error',
      message: `No model found for artifact ${artifactId}. Ensure training completed and a model record exists.`,
      deliverables: [],
    };
  }

  // Get or create model package
  const existingPkg = db.prepare('SELECT id, status, storage_path FROM model_packages WHERE model_id = ? ORDER BY created_at DESC LIMIT 1').get(modelId) as any;

  if (existingPkg) {
    if (existingPkg.status === 'ready') {
      return {
        ok: true, artifact_id: artifactId, model_id: modelId,
        package_id: existingPkg.id, package_storage_path: existingPkg.storage_path,
        status: 'already_ready',
        message: `Package already exists and is ready: ${existingPkg.id}`,
        deliverables: [{ role: 'model_package', path: existingPkg.storage_path }],
      };
    }
    // Retry build
    if (existingPkg.status === 'building' || existingPkg.status === 'publishing') {
      return { ok: true, artifact_id: artifactId, model_id: modelId, package_id: existingPkg.id, package_storage_path: existingPkg.storage_path, status: existingPkg.status, message: `Package is currently ${existingPkg.status}`, deliverables: [] };
    }
  }

  // Create new package
  const pkgResult = await packages.createPackage({
    model_id: modelId,
    package_name: options.release_note || `release-${art.name || artifactId.slice(0, 8)}`,
    package_version: options.version || art.version || '1.0.0',
    release_note: options.release_note || '',
    artifact_ids: art.id ? [art.id] : [],
  });

  if (!pkgResult.ok) {
    return { ok: false, artifact_id: artifactId, model_id: modelId, package_id: null, package_storage_path: null, status: 'error', message: pkgResult.error || 'Failed to create package', deliverables: [] };
  }

  const pkgId = (pkgResult as any).package?.id;
  if (!pkgId) {
    return { ok: false, artifact_id: artifactId, model_id: modelId, package_id: null, package_storage_path: null, status: 'error', message: 'Package created but no ID returned', deliverables: [] };
  }

  // Trigger build
  const buildResult = await packages.buildPackage(pkgId);
  const pkg = db.prepare('SELECT storage_path FROM model_packages WHERE id = ?').get(pkgId) as any;

  return {
    ok: true, artifact_id: artifactId, model_id: modelId,
    package_id: pkgId, package_storage_path: pkg?.storage_path || null,
    status: (buildResult as any)?.status || 'building',
    message: `Package build triggered: ${pkgId}`,
    deliverables: pkg?.storage_path ? [{ role: 'model_package', path: pkg.storage_path }] : [],
  };
}

// ── F9: Release Delivery Manifest ─────────────────────────────────────────────

interface ReleaseDeliveryManifest {
  ok: boolean;
  release_id: string;
  release_name: string;
  release_version: string;
  status: string;
  sealed_at: string | null;
  sealed_by: string | null;

  // Structured release notes
  release_notes: {
    markdown: string;
    sections: {
      header: string;
      lines: string[];
    }[];
  };

  // All deliverables organized by category
  deliverables: {
    category: string;
    items: {
      name: string;
      path: string;
      type: string;
      size_bytes?: number;
      checksum?: string;
      description: string;
    }[];
  }[];

  // Package info
  package: {
    storage_path: string | null;
    present: boolean;
    total_size_mb: number;
    file_count: number;
    contents: string[];
  };

  // Audit record
  lineage: { type: string; id: string; name: string }[];
}

/** F9: Structured delivery manifest for a release */
export function getReleaseDeliveryManifest(releaseId: string): ReleaseDeliveryManifest | { ok: false; error: string } {
  const db = getDatabase();
  const rel = db.prepare('SELECT * FROM releases WHERE id = ?').get(releaseId) as any;
  if (!rel) return { ok: false, error: 'Release not found' };

  const manifestData = readJsonFile(rel.release_manifest_json);
  const metrics = readJsonFile(rel.metrics_snapshot_json) || {};

  // Build structured release notes sections
  const metricsLines: string[] = [];
  for (const [k, v] of Object.entries(metrics)) {
    if (v !== null && v !== undefined) {
      metricsLines.push(`- **${k}**: ${v}`);
    }
  }

  const ns = {
    header: '## Metrics',
    lines: metricsLines.length > 0 ? metricsLines : ['- No metrics available'],
  };

  const sections = [
    { header: '## Release Info', lines: [
      `- **Version**: ${rel.release_version || '1.0.0'}`,
      `- **Sealed At**: ${rel.sealed_at || rel.created_at}`,
      `- **Sealed By**: ${rel.sealed_by || 'system'}`,
      `- **Approval Status**: ${rel.approval_status || 'N/A'}`,
    ]},
    ns,
    { header: '## Source Lineage', lines: [
      rel.source_evaluation_id ? `- **Evaluation**: ${rel.source_evaluation_id}` : null,
      rel.source_experiment_id ? `- **Experiment**: ${rel.source_experiment_id}` : null,
      rel.source_dataset_id ? `- **Dataset**: ${rel.source_dataset_id}` : null,
    ].filter(Boolean) as string[]},
  ].filter(s => s.lines.length > 0);

  const releaseNotesMd = `# Release: ${rel.release_name || rel.id}\n\n` +
    sections.map(s => `${s.header}\n\n${s.lines.join('\n')}`).join('\n\n') +
    `\n\n---\n*Generated by AegisFlow Intelligence Platform v${manifestData?.generator?.replace(/[^0-9.]/g, '') || '6.x'}*`;

  // Resolve deliverables
  const deliverables: ReleaseDeliveryManifest['deliverables'] = [];

  // 1. Artifact
  if (rel.artifact_id) {
    const art = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(rel.artifact_id) as any;
    if (art) {
      deliverables.push({
        category: '训练产物',
        items: [{
          name: art.name || art.id,
          path: art.path || '',
          type: art.artifact_type || 'checkpoint',
          size_bytes: art.file_size_bytes || undefined,
          description: `模型检查点 | format=${art.format || 'N/A'} | framework=${art.framework || 'N/A'}`,
        }],
      });
    }
  }

  // 2. Evaluation report
  if (rel.source_evaluation_id) {
    const ev = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(rel.source_evaluation_id) as any;
    if (ev) {
      const evalItems = [];
      if (ev.report_path) evalItems.push({ name: 'metrics.json', path: ev.report_path, type: 'json', description: '验证指标 JSON' });
      if (ev.eval_manifest_path) evalItems.push({ name: 'eval_manifest.json', path: ev.eval_manifest_path, type: 'json', description: '评估执行清单' });
      if (evalItems.length > 0) {
        deliverables.push({ category: '评估报告', items: evalItems });
      }
    }
  }

  // 3. Model package
  const pkg = db.prepare('SELECT * FROM model_packages WHERE model_id = ? ORDER BY created_at DESC LIMIT 1').get(rel.model_id) as any;
  if (pkg) {
    deliverables.push({
      category: '发布包',
      items: [{
        name: `${pkg.package_name || pkg.id}.zip`,
        path: pkg.storage_path || '',
        type: 'package',
        size_bytes: pkg.file_size_bytes || undefined,
        description: `Model package | version=${pkg.package_version || '1.0.0'} | status=${pkg.status}`,
      }],
    });
  }

  // Package directory contents
  let pkgInfo: ReleaseDeliveryManifest['package'] = { storage_path: null, present: false, total_size_mb: 0, file_count: 0, contents: [] };
  if (rel.release_manifest_json) {
    const pkgId = manifestData?.package?.id;
    if (pkgId) {
      const fs = require('fs');
      const pkgDir = `apps/local-api/packages/storage/releases/${pkgId}`;
      try {
        if (fs.existsSync(pkgDir)) {
          const files: string[] = [];
          let totalSize = 0;
          const walk = (dir: string) => {
            try {
              for (const entry of fs.readdirSync(dir)) {
                const full = `${dir}/${entry}`;
                const stat = fs.statSync(full);
                if (stat.isDirectory()) {
                  walk(full);
                } else {
                  files.push(full.replace(pkgDir + '/', ''));
                  totalSize += stat.size;
                }
              }
            } catch { /* safe */ }
          };
          walk(pkgDir);
          pkgInfo = {
            storage_path: pkgDir,
            present: true,
            total_size_mb: +(totalSize / (1024 * 1024)).toFixed(3),
            file_count: files.length,
            contents: files,
          };
        }
      } catch { /* safe */ }
    }
  }

  // Lineage
  const lineage: { type: string; id: string; name: string }[] = [];
  if (rel.artifact_id) {
    const a = db.prepare('SELECT name FROM artifacts WHERE id = ?').get(rel.artifact_id) as any;
    lineage.push({ type: 'artifact', id: rel.artifact_id, name: a?.name || rel.artifact_id });
  }
  if (rel.source_evaluation_id) lineage.push({ type: 'evaluation', id: rel.source_evaluation_id, name: 'Evaluation' });
  if (rel.source_experiment_id) lineage.push({ type: 'experiment', id: rel.source_experiment_id, name: 'Experiment' });
  if (rel.model_id) lineage.push({ type: 'model', id: rel.model_id, name: rel.model_id });
  if (rel.approval_id) lineage.push({ type: 'approval', id: rel.approval_id, name: 'Approval' });

  return {
    ok: true,
    release_id: releaseId,
    release_name: rel.release_name || rel.id,
    release_version: rel.release_version || '1.0.0',
    status: rel.status || 'unknown',
    sealed_at: rel.sealed_at || rel.created_at,
    sealed_by: rel.sealed_by || 'system',
    release_notes: { markdown: releaseNotesMd, sections },
    deliverables,
    package: pkgInfo,
    lineage,
  };
}

// ── F9: Full Release Pipeline Readiness ───────────────────────────────────────

interface ReleasePipelineReadiness {
  ok: boolean;
  artifact_id: string;
  stage: 'draft' | 'candidate' | 'approved' | 'sealed';
  stages: {
    name: string;
    label: string;
    status: 'pending' | 'ready' | 'blocked' | 'done';
    blockers: string[];
    data: Record<string, any>;
  }[];
  next_action: {
    action: string;
    label: string;
    endpoint: string;
    body?: Record<string, any>;
  } | null;
  deliverables_summary: {
    checkpoint_path: string | null;
    evaluation_report: string | null;
    model_package: string | null;
    release_package: string | null;
    release_note_path: string | null;
  };
}

/** F9: Full release pipeline readiness for an artifact */
export function getReleasePipelineReadiness(artifactId: string): ReleasePipelineReadiness | { ok: false; error: string } {
  const db = getDatabase();
  const art = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) return { ok: false, error: 'Artifact not found' };

  const promo = art.promotion_status || 'draft';
  const stages: ReleasePipelineReadiness['stages'] = [];

  // Stage 1: Candidate readiness
  const hasMF = !!art.model_family;
  const hasFmt = !!art.format;
  const hasMet = !!(art.metrics_snapshot_json && art.metrics_snapshot_json !== '{}');
  const evalBlockers: string[] = [];
  if (!hasMF) evalBlockers.push('缺少 model_family');
  if (!hasFmt) evalBlockers.push('缺少 format');

  stages.push({
    name: 'candidate',
    label: '晋升候选',
    status: promo !== 'draft' ? 'done' : (evalBlockers.length === 0 ? 'ready' : 'blocked'),
    blockers: evalBlockers,
    data: { model_family: art.model_family, format: art.format, has_metrics: hasMet },
  });

  // Stage 2: Evaluation
  let evalReport: string | null = null;
  let evalPassed = false;
  if (art.evaluation_id) {
    const ev = db.prepare('SELECT status, report_path, eval_manifest_path FROM evaluations WHERE id = ?').get(art.evaluation_id) as any;
    evalReport = ev?.report_path || ev?.eval_manifest_path || null;
    evalPassed = ev?.status === 'completed';
  }
  stages.push({
    name: 'evaluation',
    label: '评估验证',
    status: !art.evaluation_id ? 'pending' : (evalPassed ? 'done' : 'blocked'),
    blockers: art.evaluation_id && !evalPassed ? ['评估尚未完成或失败'] : [],
    data: { evaluation_id: art.evaluation_id, report_path: evalReport, passed: evalPassed },
  });

  // Stage 3: Approval
  const hasApproval = promo === 'approved';
  let approvalStatus = 'none';
  if (promo === 'approval_required') approvalStatus = 'pending';
  else if (promo === 'approved') approvalStatus = 'approved';
  else if (promo === 'rejected') approvalStatus = 'rejected';
  stages.push({
    name: 'approval',
    label: '发布审批',
    status: promo === 'draft' ? 'pending' : (hasApproval ? 'done' : (approvalStatus === 'rejected' ? 'blocked' : 'pending')),
    blockers: approvalStatus === 'rejected' ? ['审批被拒绝'] : [],
    data: { promotion_status: promo, approval_status: approvalStatus },
  });

  // Stage 4: Seal
  const isSealed = !!art.release_id;
  stages.push({
    name: 'seal',
    label: '版本封板',
    status: !isSealed ? (promo === 'approved' ? 'ready' : 'pending') : 'done',
    blockers: isSealed ? [] : (promo !== 'approved' ? ['需要先完成审批'] : []),
    data: { release_id: art.release_id, sealed_at: art.sealed_at },
  });

  // Next action
  let nextAction: ReleasePipelineReadiness['next_action'] = null;
  if (promo === 'draft' && evalBlockers.length === 0) {
    nextAction = { action: 'promote', label: '晋升为候选', endpoint: 'POST /api/artifacts/:id/promote' };
  } else if (promo === 'approval_required') {
    nextAction = { action: 'approve', label: '完成发布审批', endpoint: 'POST /api/artifacts/:id/approve' };
  } else if (promo === 'approved' && !art.release_id) {
    nextAction = { action: 'seal', label: '封板发布', endpoint: 'POST /api/artifacts/:id/seal' };
  }

  // Deliverables summary
  let pkgPath: string | null = null;
  if (art.release_id) {
    const rel = db.prepare('SELECT release_manifest_json FROM releases WHERE id = ?').get(art.release_id) as any;
    if (rel?.release_manifest_json) {
      const m = readJsonFile(rel.release_manifest_json);
      pkgPath = m?.package?.storage_path || null;
    }
  }

  return {
    ok: true,
    artifact_id: artifactId,
    stage: promo === 'draft' ? 'draft' : promo === 'approval_required' ? 'candidate' : promo === 'approved' ? 'approved' : 'sealed',
    stages,
    next_action: nextAction,
    deliverables_summary: {
      checkpoint_path: art.path || null,
      evaluation_report: evalReport,
      model_package: pkgPath,
      release_package: art.release_id ? `releases/${art.release_id}` : null,
      release_note_path: art.release_id ? null : null,
    },
  };
}
