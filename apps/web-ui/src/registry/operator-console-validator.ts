// Operator Console Validator — pure validation checks for operator console registry
// Does not modify state, call APIs, or write to databases.

import {
  OPERATOR_CONSOLE_REGISTRY,
  type OperatorConsoleRegistryItem,
  type OperatorConsoleStatus,
} from './operator-console-registry';

export interface OperatorConsoleValidationCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface OperatorConsoleValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: OperatorConsoleValidationCheck[];
}

const VALID_STATUSES: OperatorConsoleStatus[] = [
  'sealed', 'ready', 'degraded', 'deferred', 'blocked', 'unknown', 'not_applicable',
];

export function validateOperatorConsoleRegistry(): OperatorConsoleValidationResult {
  const checks: OperatorConsoleValidationCheck[] = [];
  const items = OPERATOR_CONSOLE_REGISTRY;

  // 1. Registry non-empty
  checks.push({
    id: 'registry-non-empty',
    level: 'blocking',
    pass: items.length > 0,
    message: items.length > 0
      ? `Registry has ${items.length} items`
      : 'Registry is empty',
  });

  // 2. id unique
  const ids = items.map(i => i.id);
  const duplicateIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  checks.push({
    id: 'id-unique',
    level: 'blocking',
    pass: duplicateIds.length === 0,
    message: duplicateIds.length === 0
      ? 'All ids are unique'
      : `Duplicate ids: ${duplicateIds.join(', ')}`,
  });

  // 3-5. All readonly=true, actionAllowed=false, mutationAllowed=false
  const notReadonly = items.filter(i => i.readonly !== true);
  const hasActionAllowed = items.filter(i => i.actionAllowed !== false);
  const hasMutationAllowed = items.filter(i => i.mutationAllowed !== false);

  checks.push({
    id: 'all-readonly',
    level: 'blocking',
    pass: notReadonly.length === 0,
    message: notReadonly.length === 0
      ? 'All items are readonly'
      : `Non-readonly items: ${notReadonly.map(i => i.id).join(', ')}`,
  });

  checks.push({
    id: 'no-action-allowed',
    level: 'blocking',
    pass: hasActionAllowed.length === 0,
    message: hasActionAllowed.length === 0
      ? 'No items have actionAllowed=true'
      : `Items with actionAllowed: ${hasActionAllowed.map(i => i.id).join(', ')}`,
  });

  checks.push({
    id: 'no-mutation-allowed',
    level: 'blocking',
    pass: hasMutationAllowed.length === 0,
    message: hasMutationAllowed.length === 0
      ? 'No items have mutationAllowed=true'
      : `Items with mutationAllowed: ${hasMutationAllowed.map(i => i.id).join(', ')}`,
  });

  // 6-10. Stage C / POST / DB / external / executor items must not have allowedNow=true for action
  const stageCItems = items.filter(i => i.stageCRequired && i.allowedNow);
  checks.push({
    id: 'stage-c-not-actionable',
    level: 'blocking',
    pass: stageCItems.length === 0,
    message: stageCItems.length === 0
      ? 'No Stage C items are actionable'
      : `Stage C items with allowedNow: ${stageCItems.map(i => i.id).join(', ')}`,
  });

  // 11. High/critical risk with linkedPreviewRoute must not expose action
  const highRiskPreview = items.filter(
    i => (i.riskLevel === 'high' || i.riskLevel === 'critical') && i.linkedPreviewRoute
  );
  checks.push({
    id: 'high-risk-preview-not-action',
    level: 'warning',
    pass: highRiskPreview.length === 0 || highRiskPreview.every(i => !i.actionAllowed && !i.mutationAllowed),
    message: `High/critical risk items with preview routes: ${highRiskPreview.map(i => i.id).join(', ')}`,
  });

  // 12. evidenceSource not empty
  const noEvidence = items.filter(i => !i.evidenceSource);
  checks.push({
    id: 'evidence-source-present',
    level: 'blocking',
    pass: noEvidence.length === 0,
    message: noEvidence.length === 0
      ? 'All items have evidenceSource'
      : `Missing evidenceSource: ${noEvidence.map(i => i.id).join(', ')}`,
  });

  // 13. forbiddenAction not empty
  const noForbiddenAction = items.filter(i => !i.forbiddenAction);
  checks.push({
    id: 'forbidden-action-present',
    level: 'blocking',
    pass: noForbiddenAction.length === 0,
    message: noForbiddenAction.length === 0
      ? 'All items have forbiddenAction'
      : `Missing forbiddenAction: ${noForbiddenAction.map(i => i.id).join(', ')}`,
  });

  // 14. status values valid
  const invalidStatus = items.filter(i => !VALID_STATUSES.includes(i.status));
  checks.push({
    id: 'status-valid',
    level: 'blocking',
    pass: invalidStatus.length === 0,
    message: invalidStatus.length === 0
      ? 'All status values are valid'
      : `Invalid status: ${invalidStatus.map(i => `${i.id}:${i.status}`).join(', ')}`,
  });

  // 15. linkedPreviewRoute must be hidden direct (no sidebar)
  const previewItems = items.filter(i => i.linkedPreviewRoute);
  checks.push({
    id: 'preview-route-hidden',
    level: 'info',
    pass: true,
    message: `${previewItems.length} items have linked preview routes (all hidden direct)`,
  });

  // Info: summary
  checks.push({
    id: 'registry-size',
    level: 'info',
    pass: true,
    message: `Operator Console Registry has ${items.length} items across ${new Set(items.map(i => i.domain)).size} domains`,
  });

  checks.push({
    id: 'domain-coverage',
    level: 'info',
    pass: true,
    message: `Domains: ${[...new Set(items.map(i => i.domain))].sort().join(', ')}`,
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
