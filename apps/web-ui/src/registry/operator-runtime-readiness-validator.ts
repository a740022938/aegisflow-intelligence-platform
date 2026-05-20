// Operator Runtime Readiness Validator — pure validation checks for readiness registry
// Does not modify state, call APIs, or write to databases.

import {
  getOperatorRuntimeReadinessRegistry,
  type OperatorRuntimeReadinessItem,
} from './operator-runtime-readiness-registry';

export interface ReadinessValidationCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface ReadinessValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: ReadinessValidationCheck[];
}

const HIGH_RISK_ACTIONS = [
  'stage-c', 'feature-flag', 'post-runtime', 'db-write',
  'executor', 'external-control', 'connector-action',
];

export function validateOperatorRuntimeReadiness(): ReadinessValidationResult {
  const checks: ReadinessValidationCheck[] = [];
  const items = getOperatorRuntimeReadinessRegistry();

  // 1. Registry non-empty
  checks.push({
    id: 'registry-non-empty',
    level: 'blocking',
    pass: items.length >= 24,
    message: items.length >= 24
      ? `Registry has ${items.length} items (minimum 24)`
      : `Registry has only ${items.length} items, minimum 24 required`,
  });

  // 2. All items are readonly
  const notReadonly = items.filter(i => i.readonly !== true);
  checks.push({
    id: 'all-readonly',
    level: 'blocking',
    pass: notReadonly.length === 0,
    message: notReadonly.length === 0
      ? 'All items are readonly'
      : `Non-readonly items: ${notReadonly.map(i => i.id).join(', ')}`,
  });

  // 3. No item enables Stage C (allowedNow must be false for Stage C items)
  const stageCItems = items.filter(i =>
    i.id.includes('stage-c') || i.id === 'feature-flag-status'
  );
  const stageCAllowed = stageCItems.filter(i => i.allowedNow);
  checks.push({
    id: 'stage-c-not-actionable',
    level: 'blocking',
    pass: stageCAllowed.length === 0,
    message: stageCAllowed.length === 0
      ? 'No Stage C / feature flag items are actionable'
      : `Actionable Stage C items: ${stageCAllowed.map(i => i.id).join(', ')}`,
  });

  // 4. No DB write item is allowed
  const dbWriteItems = items.filter(i => i.id === 'db-write-status');
  const dbWriteAllowed = dbWriteItems.filter(i => i.allowedNow);
  checks.push({
    id: 'db-write-not-allowed',
    level: 'blocking',
    pass: dbWriteAllowed.length === 0,
    message: dbWriteAllowed.length === 0
      ? 'DB write is not allowed'
      : 'DB write item has allowedNow=true',
  });

  // 5. No executor item is allowed
  const executorItems = items.filter(i => i.id === 'executor-status');
  const executorAllowed = executorItems.filter(i => i.allowedNow);
  checks.push({
    id: 'executor-not-allowed',
    level: 'blocking',
    pass: executorAllowed.length === 0,
    message: executorAllowed.length === 0
      ? 'Executor is not allowed'
      : 'Executor item has allowedNow=true',
  });

  // 6. No external control item is allowed
  const externalControlItems = items.filter(i => i.id === 'external-control-status');
  const externalControlAllowed = externalControlItems.filter(i => i.allowedNow);
  checks.push({
    id: 'external-control-not-allowed',
    level: 'blocking',
    pass: externalControlAllowed.length === 0,
    message: externalControlAllowed.length === 0
      ? 'External control is not allowed'
      : 'External control item has allowedNow=true',
  });

  // 7. No connector action item is allowed
  const connectorActionItems = items.filter(i => i.id === 'connector-action-status');
  const connectorActionAllowed = connectorActionItems.filter(i => i.allowedNow);
  checks.push({
    id: 'connector-action-not-allowed',
    level: 'blocking',
    pass: connectorActionAllowed.length === 0,
    message: connectorActionAllowed.length === 0
      ? 'Connector action is not allowed'
      : 'Connector action item has allowedNow=true',
  });

  // 8. All high/critical risk items have allowedNow=false
  const highRiskAllowed = items.filter(i =>
    (i.riskLevel === 'high' || i.riskLevel === 'critical') && i.allowedNow
  );
  checks.push({
    id: 'high-risk-not-actionable',
    level: 'blocking',
    pass: highRiskAllowed.length === 0,
    message: highRiskAllowed.length === 0
      ? 'All high/critical risk items have allowedNow=false'
      : `High risk items with allowedNow=true: ${highRiskAllowed.map(i => i.id).join(', ')}`,
  });

  // 9. At least one item references memory normalization
  const memoryNormalizationRef = items.filter(i =>
    i.summary.toLowerCase().includes('normalization') ||
    i.title.toLowerCase().includes('normalization')
  );
  checks.push({
    id: 'references-memory-normalization',
    level: 'warning',
    pass: memoryNormalizationRef.length >= 1,
    message: memoryNormalizationRef.length >= 1
      ? `Memory normalization referenced in ${memoryNormalizationRef.length} items`
      : 'No item references memory normalization',
  });

  // 10. At least one item references repair plan-only
  const repairPlanRef = items.filter(i =>
    i.summary.toLowerCase().includes('plan-only') ||
    i.title.toLowerCase().includes('repair')
  );
  checks.push({
    id: 'references-repair-plan-only',
    level: 'warning',
    pass: repairPlanRef.length >= 1,
    message: repairPlanRef.length >= 1
      ? `Repair plan-only referenced in ${repairPlanRef.length} items`
      : 'No item references repair plan-only',
  });

  // 11. At least one item references encoding doctor
  const encodingRef = items.filter(i =>
    i.summary.toLowerCase().includes('encoding') ||
    i.title.toLowerCase().includes('encoding')
  );
  checks.push({
    id: 'references-encoding-doctor',
    level: 'warning',
    pass: encodingRef.length >= 1,
    message: encodingRef.length >= 1
      ? `Encoding doctor referenced in ${encodingRef.length} items`
      : 'No item references encoding doctor',
  });

  // 12. At least one item references safe-status
  const safeStatusRef = items.filter(i =>
    i.summary.toLowerCase().includes('safe-status') ||
    i.title.toLowerCase().includes('safe-status')
  );
  checks.push({
    id: 'references-safe-status',
    level: 'warning',
    pass: safeStatusRef.length >= 1,
    message: safeStatusRef.length >= 1
      ? `Safe-status referenced in ${safeStatusRef.length} items`
      : 'No item references safe-status',
  });

  // 13. IDs are unique
  const ids = items.map(i => i.id);
  const duplicateIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  checks.push({
    id: 'id-unique',
    level: 'blocking',
    pass: duplicateIds.length === 0,
    message: duplicateIds.length === 0
      ? 'All IDs are unique'
      : `Duplicate IDs: ${duplicateIds.join(', ')}`,
  });

  // 14. Boundary category items have allowedNow=false
  const boundaryItems = items.filter(i => i.category === 'boundary');
  const boundaryAllowed = boundaryItems.filter(i => i.allowedNow);
  checks.push({
    id: 'boundary-not-actionable',
    level: 'blocking',
    pass: boundaryAllowed.length === 0,
    message: boundaryAllowed.length === 0
      ? 'All boundary items have allowedNow=false'
      : `Boundary items with allowedNow: ${boundaryAllowed.map(i => i.id).join(', ')}`,
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

export function getReadinessValidationSummaryText(result: ReadinessValidationResult): string {
  if (result.pass) {
    return `All checks pass. Blocking: ${result.blocking}, Warning: ${result.warning}, Items: ${result.info}`;
  }
  const failed = result.checks.filter(c => !c.pass);
  return `Validation FAILED: ${failed.map(c => c.message).join('; ')}`;
}
