// v5.0.0 — Gate Check Module
import { getDatabase } from '../db/builtin-sqlite.js';

function generateId() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function parseJson(v: string | null | undefined): any {
  if (!v) return [];
  try { return JSON.parse(v); } catch { return []; }
}

export interface GateCheckResult {
  check: string;
  passed: boolean;
  reason?: string;
}

export interface GateResult {
  gate_name: string;
  stage_name: string;
  entity_id: string;
  entity_type: string;
  status: 'passed' | 'blocked' | 'pending' | 'failed';
  required_inputs: string[];
  required_checks: string[];
  check_results: GateCheckResult[];
  fail_reasons: string[];
  pass_result?: string;
  audit_record: string;
  blocking_status?: string;
  checked_at: string;
}

// ── Gate 1: Evaluation Ready ────────────────────────────────────────────────
export function checkEvaluationReadyGate(evalId: string): GateResult {
  const db = getDatabase();
  const ev = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(evalId) as any;
  if (!ev) {
    return { gate_name: 'evaluation_ready', stage_name: 'evaluation', entity_id: evalId, entity_type: 'evaluation', status: 'failed', required_inputs: ['evaluation_id'], required_checks: ['status_completed'], check_results: [{ check: 'exists', passed: false, reason: 'Evaluation not found' }], fail_reasons: ['Evaluation not found'], audit_record: '', checked_at: now() };
  }

  const checks: GateCheckResult[] = [
    { check: 'status_completed', passed: ev.status === 'completed', reason: ev.status !== 'completed' ? `Status is ${ev.status}` : undefined },
    { check: 'has_model', passed: !!(ev.model_name || ev.model_id), reason: !ev.model_name && !ev.model_id ? 'No model linked' : undefined },
    { check: 'has_dataset', passed: !!ev.dataset_id, reason: !ev.dataset_id ? 'No dataset linked' : undefined },
    { check: 'has_metrics', passed: !!(ev.result_summary_json && Object.keys(parseJson(ev.result_summary_json)).length > 0), reason: !ev.result_summary_json ? 'No metrics recorded' : undefined },
    { check: 'no_error', passed: !ev.error_message, reason: ev.error_message ? `Error: ${ev.error_message.slice(0, 100)}` : undefined },
  ];

  const failReasons = checks.filter(c => !c.passed).map(c => c.reason || c.check);
  const status: GateResult['status'] = failReasons.length === 0 ? 'passed' : 'blocked';

  // Record gate check
  const gateId = generateId();
  db.prepare(`INSERT INTO gate_checks (id, gate_name, stage_name, entity_id, entity_type, status, check_results_json, fail_reasons_json, pass_result, checked_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(gateId, 'evaluation_ready', 'evaluation', evalId, 'evaluation', status, JSON.stringify(checks), JSON.stringify(failReasons), status === 'passed' ? 'Evaluation ready for artifact generation' : '', now(), now());

  // Update evaluation gate_status
  db.prepare(`UPDATE evaluations SET gate_status = ? WHERE id = ?`).run(status, evalId);

  return {
    gate_name: 'evaluation_ready',
    stage_name: 'evaluation',
    entity_id: evalId,
    entity_type: 'evaluation',
    status,
    required_inputs: ['evaluation_id', 'model_id', 'dataset_id'],
    required_checks: ['status_completed', 'has_model', 'has_dataset', 'has_metrics', 'no_error'],
    check_results: checks,
    fail_reasons: failReasons,
    pass_result: status === 'passed' ? 'Evaluation ready for artifact generation' : undefined,
    audit_record: gateId,
    blocking_status: status === 'blocked' ? failReasons.join('; ') : undefined,
    checked_at: now(),
  };
}

// ── Gate 2: Artifact Ready ──────────────────────────────────────────────────
export function checkArtifactReadyGate(artifactId: string): GateResult {
  const db = getDatabase();
  const art = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) {
    return { gate_name: 'artifact_ready', stage_name: 'artifact', entity_id: artifactId, entity_type: 'artifact', status: 'failed', required_inputs: ['artifact_id'], required_checks: ['exists'], check_results: [{ check: 'exists', passed: false, reason: 'Artifact not found' }], fail_reasons: ['Artifact not found'], audit_record: '', checked_at: now() };
  }

  const checks: GateCheckResult[] = [
    { check: 'has_path', passed: !!(art.path || art.storage_path), reason: !art.path && !art.storage_path ? 'No storage path' : undefined },
    { check: 'has_model_family', passed: !!art.model_family, reason: !art.model_family ? 'No model family' : undefined },
    { check: 'has_format', passed: !!art.format, reason: !art.format ? 'No format specified' : undefined },
    { check: 'status_ready', passed: art.status === 'ready' || art.status === 'draft', reason: art.status !== 'ready' && art.status !== 'draft' ? `Status is ${art.status}` : undefined },
    { check: 'source_valid', passed: ['training', 'evaluation', 'manual', 'imported', 'system'].includes(art.source_type), reason: !art.source_type ? 'No source type' : undefined },
    { check: 'evaluation_valid', passed: art.source_type !== 'evaluation' || !!art.evaluation_id, reason: art.source_type === 'evaluation' && !art.evaluation_id ? 'Missing source evaluation' : undefined },
  ];

  const failReasons = checks.filter(c => !c.passed).map(c => c.reason || c.check);
  const status: GateResult['status'] = failReasons.length === 0 ? 'passed' : 'blocked';

  const gateId = generateId();
  db.prepare(`INSERT INTO gate_checks (id, gate_name, stage_name, entity_id, entity_type, status, check_results_json, fail_reasons_json, pass_result, checked_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(gateId, 'artifact_ready', 'artifact', artifactId, 'artifact', status, JSON.stringify(checks), JSON.stringify(failReasons), status === 'passed' ? 'Artifact ready for promotion' : '', now(), now());

  db.prepare(`UPDATE artifacts SET gate_status = ? WHERE id = ?`).run(status, artifactId);

  return {
    gate_name: 'artifact_ready',
    stage_name: 'artifact',
    entity_id: artifactId,
    entity_type: 'artifact',
    status,
    required_inputs: ['artifact_id', 'source_type'],
    required_checks: ['has_path', 'has_model_family', 'has_format', 'status_ready', 'source_valid'],
    check_results: checks,
    fail_reasons: failReasons,
    pass_result: status === 'passed' ? 'Artifact ready for promotion' : undefined,
    audit_record: gateId,
    blocking_status: status === 'blocked' ? failReasons.join('; ') : undefined,
    checked_at: now(),
  };
}

// ── Gate 3: Promotion Ready ─────────────────────────────────────────────────
export function checkPromotionReadyGate(artifactId: string): GateResult {
  const db = getDatabase();
  const art = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) {
    return { gate_name: 'promotion_ready', stage_name: 'promotion', entity_id: artifactId, entity_type: 'artifact', status: 'failed', required_inputs: ['artifact_id'], required_checks: ['exists'], check_results: [{ check: 'exists', passed: false, reason: 'Artifact not found' }], fail_reasons: ['Artifact not found'], audit_record: '', checked_at: now() };
  }

  const checks: GateCheckResult[] = [
    { check: 'status_promotable', passed: art.promotion_status === 'draft' || art.promotion_status === 'rejected', reason: art.promotion_status !== 'draft' && art.promotion_status !== 'rejected' ? `Already promoted (${art.promotion_status})` : undefined },
    { check: 'has_evaluation', passed: !!art.evaluation_id, reason: !art.evaluation_id ? 'No linked evaluation' : undefined },
    { check: 'has_metrics', passed: !!(art.metrics_snapshot_json && Object.keys(parseJson(art.metrics_snapshot_json)).length > 0), reason: !art.metrics_snapshot_json ? 'No metrics snapshot' : undefined },
    { check: 'has_model_family', passed: !!art.model_family, reason: !art.model_family ? 'No model family' : undefined },
    { check: 'has_format', passed: !!art.format, reason: !art.format ? 'No format specified' : undefined },
  ];

  const failReasons = checks.filter(c => !c.passed).map(c => c.reason || c.check);
  const status: GateResult['status'] = failReasons.length === 0 ? 'passed' : 'blocked';

  const gateId = generateId();
  db.prepare(`INSERT INTO gate_checks (id, gate_name, stage_name, entity_id, entity_type, status, check_results_json, fail_reasons_json, pass_result, checked_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(gateId, 'promotion_ready', 'promotion', artifactId, 'artifact', status, JSON.stringify(checks), JSON.stringify(failReasons), status === 'passed' ? 'Artifact ready for promotion' : '', now(), now());

  return {
    gate_name: 'promotion_ready',
    stage_name: 'promotion',
    entity_id: artifactId,
    entity_type: 'artifact',
    status,
    required_inputs: ['artifact_id', 'evaluation_id', 'model_family'],
    required_checks: ['status_promotable', 'has_evaluation', 'has_metrics', 'has_model_family', 'has_format'],
    check_results: checks,
    fail_reasons: failReasons,
    pass_result: status === 'passed' ? 'Artifact ready for promotion' : undefined,
    audit_record: gateId,
    blocking_status: status === 'blocked' ? failReasons.join('; ') : undefined,
    checked_at: now(),
  };
}

// ── Gate 4: Release Ready ───────────────────────────────────────────────────
export function checkReleaseReadyGate(artifactId: string): GateResult {
  const db = getDatabase();
  const art = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(artifactId) as any;
  if (!art) {
    return { gate_name: 'release_ready', stage_name: 'release', entity_id: artifactId, entity_type: 'artifact', status: 'failed', required_inputs: ['artifact_id'], required_checks: ['exists'], check_results: [{ check: 'exists', passed: false, reason: 'Artifact not found' }], fail_reasons: ['Artifact not found'], audit_record: '', checked_at: now() };
  }

  // Find approval
  const approval = db.prepare("SELECT id, status FROM approvals WHERE resource_id = ? AND resource_type = 'artifact' AND action = 'promotion_review' ORDER BY created_at DESC LIMIT 1").get(artifactId) as any;

  // Find target model
  let targetModelId = '';
  if (art.evaluation_id) {
    const evalRow = db.prepare('SELECT experiment_id FROM evaluations WHERE id = ?').get(art.evaluation_id) as any;
    if (evalRow?.experiment_id) {
      const model = db.prepare('SELECT model_id FROM models WHERE source_experiment_id = ? LIMIT 1').get(evalRow.experiment_id) as any;
      if (model?.model_id) targetModelId = model.model_id;
    }
  }

  // Check recent backup
  const recentBackup = db.prepare("SELECT id FROM audit_logs WHERE category = 'system' AND action = 'backup_created' AND created_at > datetime('now', '-7 days') LIMIT 1").get() as any;

  const checks: GateCheckResult[] = [
    { check: 'status_approved', passed: art.promotion_status === 'approved', reason: art.promotion_status !== 'approved' ? `Not approved (${art.promotion_status})` : undefined },
    { check: 'has_approval', passed: !!(approval && approval.status === 'approved'), reason: !approval ? 'No approval record' : approval.status !== 'approved' ? `Approval status: ${approval.status}` : undefined },
    { check: 'has_model_or_family', passed: !!targetModelId || !!art.model_family, reason: !targetModelId && !art.model_family ? 'No model or family linked' : undefined },
    { check: 'not_sealed', passed: !art.release_id, reason: art.release_id ? 'Already sealed' : undefined },
    { check: 'backup_exists', passed: !!recentBackup, reason: !recentBackup ? 'No backup record in last 7 days' : undefined },
  ];

  const failReasons = checks.filter(c => !c.passed).map(c => c.reason || c.check);
  const status: GateResult['status'] = failReasons.length === 0 ? 'passed' : 'blocked';

  const gateId = generateId();
  db.prepare(`INSERT INTO gate_checks (id, gate_name, stage_name, entity_id, entity_type, status, check_results_json, fail_reasons_json, pass_result, checked_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(gateId, 'release_ready', 'release', artifactId, 'artifact', status, JSON.stringify(checks), JSON.stringify(failReasons), status === 'passed' ? 'Artifact ready for seal' : '', now(), now());

  return {
    gate_name: 'release_ready',
    stage_name: 'release',
    entity_id: artifactId,
    entity_type: 'artifact',
    status,
    required_inputs: ['artifact_id', 'approval_id', 'model_id'],
    required_checks: ['status_approved', 'has_approval', 'has_model', 'not_sealed', 'backup_exists'],
    check_results: checks,
    fail_reasons: failReasons,
    pass_result: status === 'passed' ? 'Artifact ready for seal' : undefined,
    audit_record: gateId,
    blocking_status: status === 'blocked' ? failReasons.join('; ') : undefined,
    checked_at: now(),
  };
}

// ── Gate 5: Seal Ready ──────────────────────────────────────────────────────
export function checkSealReadyGate(releaseId: string): GateResult {
  const db = getDatabase();
  const rel = db.prepare('SELECT * FROM releases WHERE id = ?').get(releaseId) as any;
  if (!rel) {
    return { gate_name: 'seal_ready', stage_name: 'seal', entity_id: releaseId, entity_type: 'release', status: 'failed', required_inputs: ['release_id'], required_checks: ['exists'], check_results: [{ check: 'exists', passed: false, reason: 'Release not found' }], fail_reasons: ['Release not found'], audit_record: '', checked_at: now() };
  }

  const manifest = parseJson(rel.release_manifest_json);
  const metrics = parseJson(rel.metrics_snapshot_json);

  // Check audit for seal events
  const sealAudit = db.prepare("SELECT id FROM audit_logs WHERE category = 'release' AND action = 'seal_release' AND target = ? LIMIT 1").get(rel.artifact_id) as any;

  const checks: GateCheckResult[] = [
    { check: 'manifest_valid', passed: !!manifest && Object.keys(manifest).length > 0, reason: !manifest ? 'Invalid manifest' : undefined },
    { check: 'has_lineage', passed: !!(manifest.lineage && manifest.lineage.length > 0), reason: !manifest.lineage ? 'No lineage recorded' : undefined },
    { check: 'has_metrics', passed: Object.keys(metrics).length > 0, reason: Object.keys(metrics).length === 0 ? 'No metrics snapshot' : undefined },
    { check: 'has_notes', passed: !!(rel.release_notes && rel.release_notes.trim()), reason: !rel.release_notes ? 'No release notes' : undefined },
    { check: 'audit_logged', passed: !!sealAudit, reason: !sealAudit ? 'No audit record' : undefined },
  ];

  const failReasons = checks.filter(c => !c.passed).map(c => c.reason || c.check);
  const status: GateResult['status'] = failReasons.length === 0 ? 'passed' : 'blocked';

  const gateId = generateId();
  db.prepare(`INSERT INTO gate_checks (id, gate_name, stage_name, entity_id, entity_type, status, check_results_json, fail_reasons_json, pass_result, checked_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(gateId, 'seal_ready', 'seal', releaseId, 'release', status, JSON.stringify(checks), JSON.stringify(failReasons), status === 'passed' ? 'Release properly sealed' : '', now(), now());

  return {
    gate_name: 'seal_ready',
    stage_name: 'seal',
    entity_id: releaseId,
    entity_type: 'release',
    status,
    required_inputs: ['release_id', 'artifact_id', 'manifest_json'],
    required_checks: ['manifest_valid', 'has_lineage', 'has_metrics', 'has_notes', 'audit_logged'],
    check_results: checks,
    fail_reasons: failReasons,
    pass_result: status === 'passed' ? 'Release properly sealed' : undefined,
    audit_record: gateId,
    blocking_status: status === 'blocked' ? failReasons.join('; ') : undefined,
    checked_at: now(),
  };
}

// ── List Gate Checks ────────────────────────────────────────────────────────
export function listGateChecks(query: any = {}) {
  const db = getDatabase();
  const limit = Math.min(parseInt(query.limit) || 50, 200);
  let sql = 'SELECT * FROM gate_checks ORDER BY checked_at DESC LIMIT ?';
  const rows = db.prepare(sql).all(limit) as any[];
  return {
    ok: true,
    checks: rows.map(r => ({
      ...r,
      check_results: parseJson(r.check_results_json),
      fail_reasons: parseJson(r.fail_reasons_json),
    })),
  };
}

// ── Get Gate Check by ID ────────────────────────────────────────────────────
export function getGateCheck(id: string) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM gate_checks WHERE id = ?').get(id) as any;
  if (!row) return { ok: false, error: 'Gate check not found' };
  return {
    ok: true,
    check: {
      ...row,
      check_results: parseJson(row.check_results_json),
      fail_reasons: parseJson(row.fail_reasons_json),
    },
  };
}
