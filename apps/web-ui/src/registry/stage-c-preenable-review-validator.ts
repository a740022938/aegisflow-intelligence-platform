// Stage C Pre-Enable Review Validator — pure validation checks for Stage C review registry
// Does not enable Stage C, modify configuration, execute actions, or write to databases.

import {
  STAGE_C_PREENABLE_REVIEW_ITEMS,
  type StageCPreEnableReviewItem,
} from './stage-c-preenable-review-registry';

export interface StageCPreEnableReviewValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateStageCPreEnableReview(): StageCPreEnableReviewValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  for (const item of STAGE_C_PREENABLE_REVIEW_ITEMS) {
    if (item.canEnableStageC) {
      blocking.push(`${item.id}: canEnableStageC must be false for all items`);
    }

    if (item.risk === 'critical' && item.allowedNow && item.canEnableStageC) {
      blocking.push(`${item.id}: critical item must not be allowedNow=true if canEnableStageC=true`);
    }

    if (item.requiresHumanOwnerApproval && !item.gates.includes('human_owner_required')) {
      blocking.push(`${item.id}: requiresHumanOwnerApproval=true must have 'human_owner_required' gate`);
    }

    if (item.requiredDocs.length === 0) {
      warning.push(`${item.id}: should have requiredDocs defined`);
    }

    if (item.requiredValidators.length === 0 && item.status !== 'blocked') {
      info.push(`${item.id}: non-blocked item should have requiredValidators for completeness`);
    }

    if (item.blockers.length === 0) {
      warning.push(`${item.id}: should have blockers defined`);
    }

    if (item.gates.length === 0) {
      warning.push(`${item.id}: must have gates defined`);
    }

    if (!item.reason) {
      warning.push(`${item.id}: must have reason`);
    }

    if (!item.nextAction) {
      warning.push(`${item.id}: must have nextAction`);
    }

    if (!item.blockedActions.includes('enable_stage_c') && item.area !== 'final_seal') {
      info.push(`${item.id}: should include 'enable_stage_c' in blockedActions`);
    }
  }

  return { blocking, warning, info };
}
