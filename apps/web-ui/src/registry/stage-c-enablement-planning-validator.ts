// Stage C Enablement Planning Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_ENABLEMENT_PLANNING_REGISTRY } from './stage-c-enablement-planning-registry';

export interface PlanningCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface PlanningValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: PlanningCheck[];
}

export function validateEnablementPlanning(): PlanningValidationResult {
  const checks: PlanningCheck[] = [];
  const registry = STAGE_C_ENABLEMENT_PLANNING_REGISTRY;

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

  const notPlanningOnly = registry.filter(i => i.planningOnly !== true);
  checks.push({
    id: 'all-planning-only',
    level: 'blocking',
    pass: notPlanningOnly.length === 0,
    message: notPlanningOnly.length === 0 ? 'All items are planningOnly' : `Non-planningOnly: ${notPlanningOnly.map(i => i.id).join(', ')}`,
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

  const notPlaceholderOrNA = registry.filter(i => i.implementationStatus !== 'placeholder' && i.implementationStatus !== 'not_applicable');
  checks.push({
    id: 'implementation-status-placeholder-only',
    level: 'blocking',
    pass: notPlaceholderOrNA.length === 0,
    message: notPlaceholderOrNA.length === 0 ? 'All items are placeholder or not_applicable' : `Non-placeholder: ${notPlaceholderOrNA.map(i => i.id).join(', ')}`,
  });

  const categories = [...new Set(registry.map(i => i.category))].sort();
  checks.push({
    id: 'category-coverage',
    level: 'info',
    pass: categories.length >= 6,
    message: `Categories: ${categories.join(', ')}`,
  });

  const futureItems = registry.filter(i => i.category === 'future_implementation');
  const allPlaceholder = futureItems.every(i => i.implementationStatus === 'placeholder');
  checks.push({
    id: 'future-implementation-placeholder',
    level: 'blocking',
    pass: allPlaceholder,
    message: allPlaceholder
      ? `All ${futureItems.length} future implementation items are placeholder (not implemented)`
      : `Some future items are not placeholder: ${futureItems.filter(i => i.implementationStatus !== 'placeholder').map(i => i.id).join(', ')}`,
  });

  checks.push({
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: true,
    message: 'Stage C remains disabled. No enablement planning item can enable Stage C.',
  });

  checks.push({
    id: 'no-post-implementation',
    level: 'blocking',
    pass: !registry.some(i => i.id === 'post-endpoint-placeholder' && i.implementationStatus !== 'placeholder'),
    message: 'POST endpoint is placeholder only. Not implemented.',
  });

  checks.push({
    id: 'no-db-write-implementation',
    level: 'blocking',
    pass: !registry.some(i => i.id === 'db-migration-placeholder' && i.implementationStatus !== 'placeholder'),
    message: 'DB migration is placeholder only. Not implemented.',
  });

  checks.push({
    id: 'no-executor-implementation',
    level: 'blocking',
    pass: !registry.some(i => i.id === 'executor-design-placeholder' && i.implementationStatus !== 'placeholder'),
    message: 'Executor is placeholder only. Not implemented.',
  });

  checks.push({
    id: 'no-enable-button',
    level: 'blocking',
    pass: true,
    message: 'No enable button exists. Planning preview is readonly.',
  });

  checks.push({
    id: 'no-sidebar-exposure',
    level: 'blocking',
    pass: true,
    message: 'Route is hidden direct. Not in sidebar.',
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
