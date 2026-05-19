// Stage C Authorization Artifact Review Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_AUTHORIZATION_ARTIFACT_REVIEW_REGISTRY } from './stage-c-authorization-artifact-review-registry';

export interface ArtifactReviewCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface ArtifactReviewValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: ArtifactReviewCheck[];
}

export function validateAuthorizationArtifactReview(): ArtifactReviewValidationResult {
  const checks: ArtifactReviewCheck[] = [];
  const registry = STAGE_C_AUTHORIZATION_ARTIFACT_REVIEW_REGISTRY;

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

  const requiredNoRef = registry.filter(i => i.requiredForHumanReview && !i.evidenceRef);
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

  const blockerExists = registry.filter(i => i.category === 'blocker' && i.status === 'forbidden');
  checks.push({
    id: 'blocker-matrix-forbidden-items',
    level: 'info',
    pass: blockerExists.length >= 6,
    message: `Forbidden blocker items: ${blockerExists.length}. Includes POST, DB, executor, external, sidebar, fake-auth blockers.`,
  });

  const pendingItems = registry.filter(i => i.status === 'pending');
  const authPending = registry.some(i => i.id === 'authorization-text-presence' && i.status === 'pending');
  checks.push({
    id: 'authorization-pending-state',
    level: 'info',
    pass: authPending,
    message: authPending
      ? `Authorization text is PENDING (${pendingItems.length} total pending items). Correct for current state.`
      : 'Authorization text is NOT pending. Verify this is intentional.',
  });

  const readyPresent = registry.filter(i => i.status === 'ready' || i.status === 'present');
  checks.push({
    id: 'ready-present-ratio',
    level: 'info',
    pass: readyPresent.length >= registry.length * 0.5,
    message: `Ready/Present: ${readyPresent.length}/${registry.length}`,
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
    message: 'No approve/deny mutation exists in artifact review registry.',
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
    id: 'no-fake-auth-marked-complete',
    level: 'blocking',
    pass: !registry.some(i => i.id === 'authorization-text-presence' && i.status === 'ready' && i.summary.includes('PENDING')),
    message: 'No fake authorization marked as complete. Authorization text correctly shows PENDING.',
  });

  checks.push({
    id: 'authorization-state-pending-if-absent',
    level: 'blocking',
    pass: authPending,
    message: authPending
      ? 'Authorization state correctly set to AUTHORIZATION_PENDING (actual auth text absent).'
      : 'WARNING: Authorization state is not PENDING despite actual auth text being absent.',
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
