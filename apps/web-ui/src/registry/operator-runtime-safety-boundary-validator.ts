// Operator Runtime Safety Boundary Validator — pure validation checks for safety boundary registry
// Does not modify state, call APIs, or write to databases.

import {
  getOperatorRuntimeSafetyBoundary,
  type OperatorRuntimeSafetyBoundaryItem,
} from './operator-runtime-safety-boundary-registry';

export interface SafetyBoundaryValidationCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface SafetyBoundaryValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: SafetyBoundaryValidationCheck[];
}

export function validateOperatorRuntimeSafetyBoundary(): SafetyBoundaryValidationResult {
  const checks: SafetyBoundaryValidationCheck[] = [];
  const items = getOperatorRuntimeSafetyBoundary();

  // 1. Stage C is disabled
  const stageCItem = items.find(i => i.id === 'stage-c-enabled');
  checks.push({
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: stageCItem?.status === 'disabled',
    message: stageCItem?.status === 'disabled'
      ? 'Stage C is disabled'
      : `Stage C status is ${stageCItem?.status}, expected disabled`,
  });

  // 2. Feature flag is off
  const ffItem = items.find(i => i.id === 'feature-flag-state');
  checks.push({
    id: 'feature-flag-off',
    level: 'blocking',
    pass: ffItem?.status === 'disabled',
    message: ffItem?.status === 'disabled'
      ? 'Feature flag is off and not mutable from UI'
      : `Feature flag status is ${ffItem?.status}, expected disabled`,
  });

  // 3. POST runtime blocked
  const postItem = items.find(i => i.id === 'post-runtime-blocked');
  checks.push({
    id: 'post-runtime-blocked',
    level: 'blocking',
    pass: postItem?.status === 'blocked',
    message: postItem?.status === 'blocked'
      ? 'POST runtime is blocked'
      : `POST runtime status is ${postItem?.status}, expected blocked`,
  });

  // 4. DB write blocked
  const dbItem = items.find(i => i.id === 'db-write-blocked');
  checks.push({
    id: 'db-write-blocked',
    level: 'blocking',
    pass: dbItem?.status === 'blocked',
    message: dbItem?.status === 'blocked'
      ? 'DB write is blocked'
      : `DB write status is ${dbItem?.status}, expected blocked`,
  });

  // 5. Executor absent
  const execItem = items.find(i => i.id === 'executor-absent');
  checks.push({
    id: 'executor-absent',
    level: 'blocking',
    pass: execItem?.status === 'absent',
    message: execItem?.status === 'absent'
      ? 'Executor is absent'
      : `Executor status is ${execItem?.status}, expected absent`,
  });

  // 6. External control blocked
  const extItem = items.find(i => i.id === 'external-control-blocked');
  checks.push({
    id: 'external-control-blocked',
    level: 'blocking',
    pass: extItem?.status === 'blocked',
    message: extItem?.status === 'blocked'
      ? 'External control is blocked'
      : `External control status is ${extItem?.status}, expected blocked`,
  });

  // 7. Connector action blocked
  const connItem = items.find(i => i.id === 'connector-action-blocked');
  checks.push({
    id: 'connector-action-blocked',
    level: 'blocking',
    pass: connItem?.status === 'blocked',
    message: connItem?.status === 'blocked'
      ? 'Connector action is blocked'
      : `Connector action status is ${connItem?.status}, expected blocked`,
  });

  // 8. Kill switch non-executable
  const ksItem = items.find(i => i.id === 'kill-switch-state');
  checks.push({
    id: 'kill-switch-non-executable',
    level: 'blocking',
    pass: ksItem?.status === 'non_executable',
    message: ksItem?.status === 'non_executable'
      ? 'Kill switch is non-executable from UI'
      : `Kill switch status is ${ksItem?.status}, expected non_executable`,
  });

  // 9. Repair plan-only
  const repairItem = items.find(i => i.id === 'repair-plan-only');
  checks.push({
    id: 'repair-plan-only',
    level: 'blocking',
    pass: repairItem?.status === 'plan_only',
    message: repairItem?.status === 'plan_only'
      ? 'Repair is plan-only'
      : `Repair status is ${repairItem?.status}, expected plan_only`,
  });

  // 10. Memory preview readonly
  const memItem = items.find(i => i.id === 'memory-preview-readonly');
  checks.push({
    id: 'memory-preview-readonly',
    level: 'blocking',
    pass: memItem?.status === 'readonly',
    message: memItem?.status === 'readonly'
      ? 'Memory preview is readonly'
      : `Memory preview status is ${memItem?.status}, expected readonly`,
  });

  // 11. Hidden preview not in sidebar
  const sidebarItem = items.find(i => i.id === 'sidebar-exposure-clean');
  checks.push({
    id: 'sidebar-exposure-clean',
    level: 'blocking',
    pass: sidebarItem?.status === 'clean',
    message: sidebarItem?.status === 'clean'
      ? 'No hidden preview in sidebar'
      : `Sidebar exposure status is ${sidebarItem?.status}, expected clean`,
  });

  // 12. Working tree clean
  const wtItem = items.find(i => i.id === 'working-tree-state');
  checks.push({
    id: 'working-tree-clean',
    level: 'warning',
    pass: wtItem?.status === 'clean',
    message: wtItem?.status === 'clean'
      ? 'Working tree is clean'
      : `Working tree status is ${wtItem?.status}`,
  });

  // 13. All items have allowedNow=false for blocked/disabled/absent
  const actionableDangerous = items.filter(i =>
    (i.status === 'blocked' || i.status === 'disabled' || i.status === 'absent') && i.allowedNow
  );
  checks.push({
    id: 'dangerous-not-actionable',
    level: 'blocking',
    pass: actionableDangerous.length === 0,
    message: actionableDangerous.length === 0
      ? 'All blocked/disabled items have allowedNow=false'
      : `Dangerous items with allowedNow: ${actionableDangerous.map(i => i.id).join(', ')}`,
  });

  // 14. All items requiring human approval have allowedNow=false
  const approvalAllowed = items.filter(i => i.requiresHumanApproval && i.allowedNow);
  checks.push({
    id: 'approval-required-not-actionable',
    level: 'blocking',
    pass: approvalAllowed.length === 0,
    message: approvalAllowed.length === 0
      ? 'All items requiring human approval have allowedNow=false'
      : `Items needing approval with allowedNow: ${approvalAllowed.map(i => i.id).join(', ')}`,
  });

  const blocking = checks.filter(c => c.level === 'blocking' && !c.pass).length;
  const warning = checks.filter(c => c.level === 'warning' && !c.pass).length;
  const info = checks.filter(c => c.level === 'info' && !c.pass).length;

  return {
    pass: blocking === 0,
    blocking,
    warning,
    info: items.length,
    checks,
  };
}
