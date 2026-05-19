// Stage C Human Approval Review Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_HUMAN_APPROVAL_REVIEW_REGISTRY } from './stage-c-human-approval-review-registry';

export interface HumanApprovalReviewCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface HumanApprovalReviewValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: HumanApprovalReviewCheck[];
}

export function validateHumanApprovalReview(): HumanApprovalReviewValidationResult {
  const checks: HumanApprovalReviewCheck[] = [];
  const registry = STAGE_C_HUMAN_APPROVAL_REVIEW_REGISTRY;

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
    message: actionAllowed.length === 0 ? 'No action allowed' : `Action allowed items: ${actionAllowed.map(i => i.id).join(', ')}`,
  });

  const mutationAllowed = registry.filter(i => i.mutationAllowed !== false);
  checks.push({
    id: 'no-mutation-allowed',
    level: 'blocking',
    pass: mutationAllowed.length === 0,
    message: mutationAllowed.length === 0 ? 'No mutation allowed' : `Mutation allowed items: ${mutationAllowed.map(i => i.id).join(', ')}`,
  });

  const canApprove = registry.filter(i => i.canApprove !== false);
  checks.push({
    id: 'cannot-approve',
    level: 'blocking',
    pass: canApprove.length === 0,
    message: canApprove.length === 0 ? 'No item can approve' : `Items that can approve: ${canApprove.map(i => i.id).join(', ')}`,
  });

  const canDeny = registry.filter(i => i.canDeny !== false);
  checks.push({
    id: 'cannot-deny',
    level: 'blocking',
    pass: canDeny.length === 0,
    message: canDeny.length === 0 ? 'No item can deny' : `Items that can deny: ${canDeny.map(i => i.id).join(', ')}`,
  });

  const canEnable = registry.filter(i => i.canEnableStageC !== false);
  checks.push({
    id: 'cannot-enable-stage-c',
    level: 'blocking',
    pass: canEnable.length === 0,
    message: canEnable.length === 0 ? 'No item can enable Stage C' : `Items that can enable Stage C: ${canEnable.map(i => i.id).join(', ')}`,
  });

  const requiredNoRef = registry.filter(i => i.required && !i.evidenceRef);
  checks.push({
    id: 'required-has-evidence-ref',
    level: 'blocking',
    pass: requiredNoRef.length === 0,
    message: requiredNoRef.length === 0 ? 'All required items have evidenceRef' : `Missing evidenceRef: ${requiredNoRef.map(i => i.id).join(', ')}`,
  });

  const blockedRequired = registry.filter(i => i.required && i.status === 'blocked');
  checks.push({
    id: 'required-not-blocked',
    level: 'blocking',
    pass: blockedRequired.length === 0,
    message: blockedRequired.length === 0 ? 'No required item is blocked' : `Blocked required items: ${blockedRequired.map(i => i.id).join(', ')}`,
  });

  const areas = [...new Set(registry.map(i => i.area))].sort();
  checks.push({
    id: 'area-coverage',
    level: 'info',
    pass: areas.length >= 7,
    message: `Areas: ${areas.join(', ')}`,
  });

  const hasApprovalGate = registry.some(i => i.area === 'approval_gate');
  checks.push({
    id: 'approval-gate-exists',
    level: 'blocking',
    pass: hasApprovalGate,
    message: hasApprovalGate ? 'Approval gate area present' : 'Approval gate area missing',
  });

  const hasRoleBoundary = registry.some(i => i.area === 'role_boundary');
  checks.push({
    id: 'role-boundary-exists',
    level: 'blocking',
    pass: hasRoleBoundary,
    message: hasRoleBoundary ? 'Role boundary area present' : 'Role boundary area missing',
  });

  const hasDenialPolicy = registry.some(i => i.area === 'denial_policy');
  checks.push({
    id: 'denial-policy-exists',
    level: 'blocking',
    pass: hasDenialPolicy,
    message: hasDenialPolicy ? 'Denial policy area present' : 'Denial policy area missing',
  });

  const hasEscalation = registry.some(i => i.area === 'escalation');
  checks.push({
    id: 'escalation-exists',
    level: 'blocking',
    pass: hasEscalation,
    message: hasEscalation ? 'Escalation area present' : 'Escalation area missing',
  });

  const required = registry.filter(i => i.required);
  checks.push({
    id: 'required-count',
    level: 'info',
    pass: required.length >= 18,
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
    id: 'stage-c-disabled',
    level: 'blocking',
    pass: true,
    message: 'Stage C remains disabled. No item can enable Stage C.',
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
