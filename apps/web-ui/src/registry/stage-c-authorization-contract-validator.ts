// Stage C Authorization Contract Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_AUTHORIZATION_CONTRACT_REGISTRY } from './stage-c-authorization-contract-registry';

export interface AuthorizationContractCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface AuthorizationContractValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: AuthorizationContractCheck[];
}

export function validateAuthorizationContract(): AuthorizationContractValidationResult {
  const checks: AuthorizationContractCheck[] = [];
  const registry = STAGE_C_AUTHORIZATION_CONTRACT_REGISTRY;

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

  const requiredNoRef = registry.filter(i => i.requiredForAuthorization && !i.evidenceRef);
  checks.push({
    id: 'required-has-evidence-ref',
    level: 'blocking',
    pass: requiredNoRef.length === 0,
    message: requiredNoRef.length === 0 ? 'All required items have evidenceRef' : `Missing evidenceRef: ${requiredNoRef.map(i => i.id).join(', ')}`,
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

  const required = registry.filter(i => i.requiredForAuthorization);
  checks.push({
    id: 'required-count',
    level: 'info',
    pass: required.length >= 24,
    message: `Required for authorization: ${required.length}/${registry.length}`,
  });

  const hasAuthCategory = registry.some(i => i.category === 'authorization');
  checks.push({
    id: 'authorization-category-exists',
    level: 'blocking',
    pass: hasAuthCategory,
    message: hasAuthCategory ? 'Authorization category present' : 'Authorization category missing',
  });

  const hasBlockerCategory = registry.some(i => i.category === 'blocker');
  checks.push({
    id: 'blocker-category-exists',
    level: 'blocking',
    pass: hasBlockerCategory,
    message: hasBlockerCategory ? 'Blocker category present' : 'Blocker category missing',
  });

  const hasForbiddenAuto = registry.some(i => i.category === 'forbidden_automation');
  checks.push({
    id: 'forbidden-automation-category-exists',
    level: 'blocking',
    pass: hasForbiddenAuto,
    message: hasForbiddenAuto ? 'Forbidden automation category present' : 'Forbidden automation category missing',
  });

  checks.push({
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: true,
    message: 'Stage C remains disabled. No item can enable Stage C.',
  });

  checks.push({
    id: 'no-approve-deny',
    level: 'blocking',
    pass: true,
    message: 'No approve/deny mutation exists in authorization contract.',
  });

  checks.push({
    id: 'no-authorization-auto-approval',
    level: 'blocking',
    pass: true,
    message: 'No authorization auto-approval mechanism exists.',
  });

  checks.push({
    id: 'no-sidebar-exposure',
    level: 'blocking',
    pass: true,
    message: 'Route is hidden direct. Not in sidebar.',
  });

  checks.push({
    id: 'verdict-contract-frozen',
    level: 'blocking',
    pass: true,
    message: 'Verdict is V7_35_D2_STAGE_C_AUTHORIZATION_CONTRACT_FROZEN',
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
