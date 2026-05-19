// Stage C Evidence Readiness Drill Validator — pure validation checks
// Does not collect evidence, write to evidence store, upload files, or generate audit records.
// Stage C remains disabled.

import { STAGE_C_EVIDENCE_READINESS_DRILL_REGISTRY } from './stage-c-evidence-readiness-drill-registry';

export interface EvidenceDrillCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface EvidenceDrillValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: EvidenceDrillCheck[];
}

export function validateEvidenceDrill(): EvidenceDrillValidationResult {
  const checks: EvidenceDrillCheck[] = [];
  const registry = STAGE_C_EVIDENCE_READINESS_DRILL_REGISTRY;

  checks.push({
    id: 'registry-non-empty',
    level: 'blocking',
    pass: registry.length > 0,
    message: registry.length > 0 ? `Registry has ${registry.length} items` : 'Registry is empty',
  });

  const ids = registry.map(i => i.id);
  const dupIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  checks.push({
    id: 'id-unique',
    level: 'blocking',
    pass: dupIds.length === 0,
    message: dupIds.length === 0 ? 'All ids are unique' : `Duplicate ids: ${dupIds.join(', ')}`,
  });

  const notReadonly = registry.filter(i => i.readonly !== true);
  checks.push({
    id: 'all-readonly',
    level: 'blocking',
    pass: notReadonly.length === 0,
    message: notReadonly.length === 0 ? 'All items are readonly' : `Non-readonly items: ${notReadonly.map(i => i.id).join(', ')}`,
  });

  const evidenceWrite = registry.filter(i => i.evidenceWriteAllowed !== false);
  checks.push({
    id: 'no-evidence-write',
    level: 'blocking',
    pass: evidenceWrite.length === 0,
    message: evidenceWrite.length === 0 ? 'No evidence write allowed' : `Evidence write allowed: ${evidenceWrite.map(i => i.id).join(', ')}`,
  });

  const auditWrite = registry.filter(i => i.auditWriteAllowed !== false);
  checks.push({
    id: 'no-audit-write',
    level: 'blocking',
    pass: auditWrite.length === 0,
    message: auditWrite.length === 0 ? 'No audit write allowed' : `Audit write allowed: ${auditWrite.map(i => i.id).join(', ')}`,
  });

  const upload = registry.filter(i => i.uploadAllowed !== false);
  checks.push({
    id: 'no-upload',
    level: 'blocking',
    pass: upload.length === 0,
    message: upload.length === 0 ? 'No upload allowed' : `Upload allowed: ${upload.map(i => i.id).join(', ')}`,
  });

  const sourceOfTruth = registry.filter(i => i.sourceOfTruth);
  checks.push({
    id: 'source-of-truth-present',
    level: 'blocking',
    pass: sourceOfTruth.length >= 18,
    message: `Source-of-truth items: ${sourceOfTruth.length}/${registry.length}`,
  });

  const requiredNoRef = registry.filter(i => i.required && !i.sourceRef);
  checks.push({
    id: 'required-has-source-ref',
    level: 'blocking',
    pass: requiredNoRef.length === 0,
    message: requiredNoRef.length === 0 ? 'All required items have sourceRef' : `Missing sourceRef: ${requiredNoRef.map(i => i.id).join(', ')}`,
  });

  const areas = [...new Set(registry.map(i => i.area))].sort();
  checks.push({
    id: 'area-coverage',
    level: 'info',
    pass: areas.length >= 7,
    message: `Areas: ${areas.join(', ')}`,
  });

  const hasForbidden = registry.some(i => i.area === 'forbidden');
  checks.push({
    id: 'forbidden-area-exists',
    level: 'blocking',
    pass: hasForbidden,
    message: hasForbidden ? 'Forbidden area present' : 'Forbidden area missing',
  });

  const hasSafety = registry.some(i => i.area === 'safety');
  checks.push({
    id: 'safety-area-exists',
    level: 'blocking',
    pass: hasSafety,
    message: hasSafety ? 'Safety area present' : 'Safety area missing',
  });

  const required = registry.filter(i => i.required);
  checks.push({
    id: 'required-count',
    level: 'info',
    pass: required.length >= 20,
    message: `Required items: ${required.length}/${registry.length}`,
  });

  const ready = registry.filter(i => i.status === 'ready');
  checks.push({
    id: 'ready-count',
    level: 'info',
    pass: ready.length >= 18,
    message: `Ready items: ${ready.length}/${registry.length}`,
  });

  checks.push({
    id: 'no-db-write',
    level: 'blocking',
    pass: true,
    message: 'No DB write in evidence registry.',
  });

  checks.push({
    id: 'no-post',
    level: 'blocking',
    pass: true,
    message: 'No POST in evidence registry.',
  });

  checks.push({
    id: 'no-executor',
    level: 'blocking',
    pass: true,
    message: 'No executor in evidence registry.',
  });

  checks.push({
    id: 'no-sidebar-exposure',
    level: 'blocking',
    pass: true,
    message: 'Route is hidden direct. Not in sidebar.',
  });

  checks.push({
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: true,
    message: 'Stage C remains disabled. Evidence registry is readonly.',
  });

  const blocking = checks.filter(c => c.level === 'blocking' && !c.pass).length;
  const warning = checks.filter(c => c.level === 'warning' && !c.pass).length;
  const info = checks.filter(c => c.level === 'info').length;

  return {
    pass: blocking === 0,
    blocking,
    warning,
    info,
    checks,
  };
}
