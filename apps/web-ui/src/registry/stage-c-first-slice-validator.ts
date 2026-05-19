// Stage C First Slice Validator — pure validation checks
// Stage C remains disabled.

import { STAGE_C_FIRST_SLICE_REGISTRY } from './stage-c-first-slice-registry';

export interface FirstSliceCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface FirstSliceValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: FirstSliceCheck[];
}

export function validateFirstSlice(): FirstSliceValidationResult {
  const checks: FirstSliceCheck[] = [];
  const registry = STAGE_C_FIRST_SLICE_REGISTRY;

  checks.push({
    id: 'registry-non-empty',
    level: 'blocking',
    pass: registry.length >= 20,
    message: registry.length >= 20 ? `Registry has ${registry.length} items` : `Registry has ${registry.length} items, expected >= 20`,
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

  const notFirstSlice = registry.filter(i => i.firstSlice !== true);
  checks.push({
    id: 'all-first-slice',
    level: 'blocking',
    pass: notFirstSlice.length === 0,
    message: notFirstSlice.length === 0 ? 'All items are firstSlice' : `Not firstSlice: ${notFirstSlice.map(i => i.id).join(', ')}`,
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
    message: canEnable.length === 0 ? 'No item can enable Stage C' : `Can enable: ${canEnable.map(i => i.id).join(', ')}`,
  });

  const noEvidence = registry.filter(i => !i.evidenceRef);
  checks.push({
    id: 'has-evidence-ref',
    level: 'blocking',
    pass: noEvidence.length === 0,
    message: noEvidence.length === 0 ? 'All items have evidenceRef' : `Missing evidenceRef: ${noEvidence.map(i => i.id).join(', ')}`,
  });

  const noForbid = registry.filter(i => !i.forbiddenAction);
  checks.push({
    id: 'forbidden-action-not-empty',
    level: 'blocking',
    pass: noForbid.length === 0,
    message: noForbid.length === 0 ? 'All items have forbiddenAction' : `Missing forbiddenAction: ${noForbid.map(i => i.id).join(', ')}`,
  });

  const hasDisabled = registry.some(i => i.id === 'stage-c-disabled' && i.status === 'implemented');
  checks.push({
    id: 'stage-c-disabled-item-exists',
    level: 'blocking',
    pass: hasDisabled,
    message: hasDisabled ? 'Stage C disabled item exists' : 'Stage C disabled item missing',
  });

  const hasFFDefaultOff = registry.some(i => i.id === 'feature-flag-default-off' && i.status === 'implemented');
  checks.push({
    id: 'feature-flag-default-off-exists',
    level: 'blocking',
    pass: hasFFDefaultOff,
    message: hasFFDefaultOff ? 'Feature flag default off item exists' : 'Feature flag default off item missing',
  });

  const hasKillSwitch = registry.some(i => i.id === 'kill-switch-not-executable');
  checks.push({
    id: 'kill-switch-non-executable-exists',
    level: 'blocking',
    pass: hasKillSwitch,
    message: hasKillSwitch ? 'Kill switch non-executable item exists' : 'Kill switch non-executable missing',
  });

  const categories = [...new Set(registry.map(i => i.category))].sort();
  checks.push({
    id: 'category-coverage',
    level: 'info',
    pass: categories.length >= 8,
    message: `Categories: ${categories.join(', ')}`,
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
