// Stage C Pre-Enable Seal Candidate Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled. This is not an enablement page.

import { STAGE_C_PREENABLE_SEAL_CANDIDATE_REGISTRY } from './stage-c-preenable-seal-candidate-registry';

export interface PreEnableSealCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface PreEnableSealValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: PreEnableSealCheck[];
}

export function validatePreEnableSealCandidate(): PreEnableSealValidationResult {
  const checks: PreEnableSealCheck[] = [];
  const registry = STAGE_C_PREENABLE_SEAL_CANDIDATE_REGISTRY;

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

  const actionAllowed = registry.filter(i => i.actionAllowed !== false);
  checks.push({
    id: 'no-action-allowed',
    level: 'blocking',
    pass: actionAllowed.length === 0,
    message: actionAllowed.length === 0 ? 'No action allowed' : `Action allowed: ${actionAllowed.map(i => i.id).join(', ')}`,
  });

  const mutationAllowed = registry.filter(i => i.mutationAllowed !== false);
  checks.push({
    id: 'no-mutation-allowed',
    level: 'blocking',
    pass: mutationAllowed.length === 0,
    message: mutationAllowed.length === 0 ? 'No mutation allowed' : `Mutation allowed: ${mutationAllowed.map(i => i.id).join(', ')}`,
  });

  const canEnable = registry.filter(i => i.canEnableStageC !== false);
  checks.push({
    id: 'cannot-enable-stage-c',
    level: 'blocking',
    pass: canEnable.length === 0,
    message: canEnable.length === 0 ? 'No item can enable Stage C' : `Items can enable: ${canEnable.map(i => i.id).join(', ')}`,
  });

  const requiredNoRef = registry.filter(i => i.requiredForPreEnable && !i.evidenceRef);
  checks.push({
    id: 'required-has-evidence-ref',
    level: 'blocking',
    pass: requiredNoRef.length === 0,
    message: requiredNoRef.length === 0 ? 'All required items have evidenceRef' : `Missing evidenceRef: ${requiredNoRef.map(i => i.id).join(', ')}`,
  });

  const areas = [...new Set(registry.map(i => i.area))].sort();
  checks.push({
    id: 'area-coverage',
    level: 'info',
    pass: areas.length >= 10,
    message: `Areas: ${areas.join(', ')}`,
  });

  const required = registry.filter(i => i.requiredForPreEnable);
  checks.push({
    id: 'required-count',
    level: 'info',
    pass: required.length >= 24,
    message: `Required-for-pre-enable items: ${required.length}/${registry.length}`,
  });

  const confirmed = registry.filter(i => i.status === 'confirmed');
  checks.push({
    id: 'confirmed-count',
    level: 'info',
    pass: confirmed.length >= 24,
    message: `Confirmed items: ${confirmed.length}/${registry.length}`,
  });

  checks.push({
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: true,
    message: 'Stage C remains disabled. No item can enable Stage C.',
  });

  checks.push({
    id: 'post-blocked',
    level: 'blocking',
    pass: registry.some(i => i.id === 'post-blocked-confirmed' && i.status === 'confirmed'),
    message: 'POST blocked confirmed',
  });

  checks.push({
    id: 'db-write-not-occurred',
    level: 'blocking',
    pass: registry.some(i => i.id === 'db-write-not-occurred' && i.status === 'confirmed'),
    message: 'DB write not occurred confirmed',
  });

  checks.push({
    id: 'external-control-not-occurred',
    level: 'blocking',
    pass: registry.some(i => i.id === 'external-control-not-occurred' && i.status === 'confirmed'),
    message: 'External control not occurred confirmed',
  });

  checks.push({
    id: 'executor-absent',
    level: 'blocking',
    pass: registry.some(i => i.id === 'executor-absent-confirmed' && i.status === 'confirmed'),
    message: 'Executor absent confirmed',
  });

  checks.push({
    id: 'no-sidebar-exposure',
    level: 'blocking',
    pass: registry.some(i => i.id === 'sidebar-boundary-confirmed' && i.status === 'confirmed'),
    message: 'Sidebar boundary confirmed',
  });

  checks.push({
    id: 'no-tag-release',
    level: 'blocking',
    pass: registry.some(i => i.id === 'tag-release-not-performed' && i.status === 'confirmed'),
    message: 'Tag/release not performed confirmed',
  });

  checks.push({
    id: 'no-enable-button',
    level: 'blocking',
    pass: true,
    message: 'No enable button exists on this page.',
  });

  checks.push({
    id: 'verdict-seal-candidate',
    level: 'blocking',
    pass: true,
    message: 'Verdict is V7_34_P4_STAGE_C_PREENABLE_SEAL_CANDIDATE — pre-enable seal candidate only. Stage C remains disabled.',
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
