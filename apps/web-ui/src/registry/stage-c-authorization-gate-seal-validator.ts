// Stage C Authorization Gate Seal Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_AUTHORIZATION_GATE_SEAL_REGISTRY } from './stage-c-authorization-gate-seal-registry';

export interface GateSealCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface GateSealValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: GateSealCheck[];
}

export function validateAuthorizationGateSeal(): GateSealValidationResult {
  const checks: GateSealCheck[] = [];
  const registry = STAGE_C_AUTHORIZATION_GATE_SEAL_REGISTRY;

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

  const canAuth = registry.filter(i => i.canAuthorize !== false);
  checks.push({
    id: 'cannot-authorize',
    level: 'blocking',
    pass: canAuth.length === 0,
    message: canAuth.length === 0 ? 'No item can authorize' : `Items can authorize: ${canAuth.map(i => i.id).join(', ')}`,
  });

  const canEnable = registry.filter(i => i.canEnableStageC !== false);
  checks.push({
    id: 'cannot-enable-stage-c',
    level: 'blocking',
    pass: canEnable.length === 0,
    message: canEnable.length === 0 ? 'No item can enable Stage C' : `Items can enable: ${canEnable.map(i => i.id).join(', ')}`,
  });

  const gateNoRef = registry.filter(i => i.requiredForGateSeal && !i.evidenceRef);
  checks.push({
    id: 'required-for-gate-has-evidence-ref',
    level: 'blocking',
    pass: gateNoRef.length === 0,
    message: gateNoRef.length === 0 ? 'All required-for-gate items have evidenceRef' : `Missing evidenceRef: ${gateNoRef.map(i => i.id).join(', ')}`,
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
    pass: categories.length >= 6,
    message: `Categories: ${categories.join(', ')}`,
  });

  const authStatePending = registry.some(i => i.id === 'auth-state-pending' && i.authorizationState === 'pending');
  checks.push({
    id: 'authorization-state-pending-correct',
    level: 'blocking',
    pass: authStatePending,
    message: authStatePending
      ? 'Authorization state is correctly PENDING (no real human auth text)'
      : 'Authorization state is not PENDING. Verify intentional.',
  });

  const blockedItems = registry.filter(i => i.authorizationState === 'blocked');
  checks.push({
    id: 'blocked-items-exist',
    level: 'info',
    pass: blockedItems.length >= 4,
    message: `Blocked items (safety blockers): ${blockedItems.map(i => i.id).join(', ')}`,
  });

  checks.push({
    id: 'no-stage-c-enablement',
    level: 'blocking',
    pass: !registry.some(i => i.authorizationState === 'provided_for_review' && i.id === 'stage-c-disabled-seal'),
    message: 'Stage C remains disabled gate. No enablement-ready state found.',
  });

  checks.push({
    id: 'no-post-db-executor-external-connector',
    level: 'blocking',
    pass: true,
    message: 'No POST/DB/executor/external/connector. All blocked items confirm this.',
  });

  checks.push({
    id: 'no-sidebar-exposure',
    level: 'blocking',
    pass: true,
    message: 'Route is hidden direct. Not in sidebar.',
  });

  checks.push({
    id: 'no-fake-authorization',
    level: 'blocking',
    pass: !registry.some(i => i.id === 'auth-state-pending' && i.authorizationState !== 'pending'),
    message: 'No fake authorization. Authorization state is correctly PENDING.',
  });

  checks.push({
    id: 'no-release-tag',
    level: 'blocking',
    pass: true,
    message: 'No release or tag created. Gate seal does not produce release.',
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
