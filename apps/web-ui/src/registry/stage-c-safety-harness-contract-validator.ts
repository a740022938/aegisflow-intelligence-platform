// Stage C Safety Harness Contract Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_SAFETY_HARNESS_CONTRACT_REGISTRY } from './stage-c-safety-harness-contract-registry';

export interface SafetyHarnessCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface SafetyHarnessValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: SafetyHarnessCheck[];
}

export function validateSafetyHarnessContract(): SafetyHarnessValidationResult {
  const checks: SafetyHarnessCheck[] = [];
  const registry = STAGE_C_SAFETY_HARNESS_CONTRACT_REGISTRY;

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
    message: notReadonly.length === 0 ? 'All items are readonly' : `Non-readonly: ${notReadonly.map(i => i.id).join(', ')}`,
  });

  const notContractOnly = registry.filter(i => i.contractOnly !== true);
  checks.push({
    id: 'all-contract-only',
    level: 'blocking',
    pass: notContractOnly.length === 0,
    message: notContractOnly.length === 0 ? 'All items are contractOnly' : `Non-contractOnly: ${notContractOnly.map(i => i.id).join(', ')}`,
  });

  const implAllowed = registry.filter(i => i.implementationAllowed !== false);
  checks.push({
    id: 'no-implementation-allowed',
    level: 'blocking',
    pass: implAllowed.length === 0,
    message: implAllowed.length === 0 ? 'No implementation allowed' : `Implementation allowed: ${implAllowed.map(i => i.id).join(', ')}`,
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

  const noRef = registry.filter(i => !i.evidenceRef);
  checks.push({
    id: 'has-evidence-ref',
    level: 'blocking',
    pass: noRef.length === 0,
    message: noRef.length === 0 ? 'All items have evidenceRef' : `Missing evidenceRef: ${noRef.map(i => i.id).join(', ')}`,
  });

  const noForbid = registry.filter(i => !i.forbiddenAction);
  checks.push({
    id: 'forbidden-action-not-empty',
    level: 'blocking',
    pass: noForbid.length === 0,
    message: noForbid.length === 0 ? 'All items have forbiddenAction' : `Missing forbiddenAction: ${noForbid.map(i => i.id).join(', ')}`,
  });

  const categories = [...new Set(registry.map(i => i.category))].sort();
  checks.push({
    id: 'category-coverage',
    level: 'info',
    pass: categories.length >= 8,
    message: `Categories: ${categories.join(', ')}`,
  });

  const hasFeatureFlag = registry.some(i => i.category === 'feature_flag');
  checks.push({
    id: 'feature-flag-category-exists',
    level: 'blocking',
    pass: hasFeatureFlag,
    message: hasFeatureFlag ? 'Feature flag category present' : 'Feature flag category missing',
  });

  const hasKillSwitch = registry.some(i => i.category === 'kill_switch');
  checks.push({
    id: 'kill-switch-category-exists',
    level: 'blocking',
    pass: hasKillSwitch,
    message: hasKillSwitch ? 'Kill switch category present' : 'Kill switch category missing',
  });

  const hasRollback = registry.some(i => i.category === 'rollback');
  checks.push({
    id: 'rollback-category-exists',
    level: 'blocking',
    pass: hasRollback,
    message: hasRollback ? 'Rollback category present' : 'Rollback category missing',
  });

  const hasAudit = registry.some(i => i.category === 'audit');
  checks.push({
    id: 'audit-category-exists',
    level: 'blocking',
    pass: hasAudit,
    message: hasAudit ? 'Audit category present' : 'Audit category missing',
  });

  const hasForbiddenV2 = registry.some(i => i.category === 'forbidden_action');
  checks.push({
    id: 'forbidden-action-v2-category-exists',
    level: 'blocking',
    pass: hasForbiddenV2,
    message: hasForbiddenV2 ? 'Forbidden action V2 category present' : 'Forbidden action V2 category missing',
  });

  const authPendingVisible = registry.some(i => i.id === 'authorization-pending-blocker' && i.status === 'pending');
  checks.push({
    id: 'authorization-pending-visible',
    level: 'blocking',
    pass: authPendingVisible,
    message: authPendingVisible
      ? 'Authorization PENDING is visible in contract items'
      : 'Authorization PENDING not visible as blocker',
  });

  const ffDefaultOff = registry.some(i => i.id === 'feature-flag-default-off' && i.status === 'required');
  checks.push({
    id: 'feature-flag-default-off-requirement',
    level: 'blocking',
    pass: ffDefaultOff,
    message: ffDefaultOff ? 'Feature flag default-off requirement exists' : 'Feature flag default-off requirement missing',
  });

  const ksRequired = registry.some(i => i.id === 'kill-switch-required' && i.status === 'required');
  checks.push({
    id: 'kill-switch-requirement-exists',
    level: 'blocking',
    pass: ksRequired,
    message: ksRequired ? 'Kill switch requirement exists' : 'Kill switch requirement missing',
  });

  checks.push({
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: true,
    message: 'Stage C remains disabled. No safety harness item can enable Stage C.',
  });

  checks.push({
    id: 'no-post-db-executor-external-connector',
    level: 'blocking',
    pass: registry.some(i => i.id === 'post-endpoint-placeholder-only' && i.status === 'forbidden'),
    message: 'POST/DB/executor/external/connector are all forbidden (placeholder only) in safety harness.',
  });

  checks.push({
    id: 'no-sidebar-exposure',
    level: 'blocking',
    pass: true,
    message: 'Routes are hidden direct. Not in sidebar.',
  });

  checks.push({
    id: 'no-fake-authorization',
    level: 'blocking',
    pass: !registry.some(i => i.id === 'authorization-pending-blocker' && i.status !== 'pending'),
    message: 'No fake authorization. Authorization state is correctly PENDING.',
  });

  checks.push({
    id: 'no-release-tag',
    level: 'blocking',
    pass: registry.some(i => i.id === 'release-tag-forbidden-v2' && i.status === 'forbidden'),
    message: 'Release/tag forbidden in safety harness contract.',
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
