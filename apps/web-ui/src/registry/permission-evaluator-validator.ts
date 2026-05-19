// Permission Evaluator Validator — pure validation functions for permission evaluation rules
// Does not execute permissions, modify menus, write to databases, or control external tools.

import { PERMISSION_EVALUATION_RULES, type PermissionEvaluationRule } from './permission-evaluator-registry';

export interface PermissionEvaluatorValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validatePermissionEvaluatorRules(): PermissionEvaluatorValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  for (const rule of PERMISSION_EVALUATION_RULES) {
    // 1. Stage C must not be allowedNow
    if (rule.targetId === 'stage-c' && rule.allowedNow) {
      blocking.push(`Stage C (${rule.id}) must not be allowedNow=true.`);
    }

    // 2. db-write must not be allowedNow
    if (rule.targetId === 'db-write' && rule.allowedNow) {
      blocking.push(`DB write (${rule.id}) must not be allowedNow=true.`);
    }

    // 3. external-tool-control must not be allowedNow
    if (rule.targetId === 'external-tool-control' && rule.allowedNow) {
      blocking.push(`External tool control (${rule.id}) must not be allowedNow=true.`);
    }

    // 4. high risk must not be allowedNow
    if (rule.risk === 'high' && rule.allowedNow) {
      blocking.push(`High risk rule (${rule.id}: ${rule.label}) must not be allowedNow=true.`);
    }

    // 5. Lab/Governance/Navigation Preview must not be allow_primary_nav
    if (
      (rule.targetId === 'lab-center-readonly' ||
        rule.targetId === 'governance-center' ||
        rule.targetId === 'navigation-preview-readonly') &&
      (rule.recommendedDecision === 'allow_primary_nav' || rule.recommendedDecision === 'allow_sidebar_visible')
    ) {
      blocking.push(`${rule.label} (${rule.id}) must not have primary_nav or sidebar_visible decision.`);
    }

    // 6. Permission Evaluator must not be primary_nav
    if (rule.targetId === 'permission-evaluator' && rule.recommendedDecision === 'allow_primary_nav') {
      blocking.push(`Permission Evaluator (${rule.id}) must not have primary_nav decision.`);
    }

    // 7. deny/hold_review must have blockingConditions
    if (
      (rule.recommendedDecision === 'deny' || rule.recommendedDecision === 'hold_review') &&
      (!rule.blockingConditions || rule.blockingConditions.length === 0)
    ) {
      blocking.push(`${rule.label} (${rule.id}) is ${rule.recommendedDecision} but has no blockingConditions.`);
    }

    // 8. All rules must have reason
    if (!rule.reason || rule.reason.trim().length === 0) {
      blocking.push(`${rule.id} has no reason.`);
    }

    // 9. All rules must have nextAction
    if (!rule.nextAction || rule.nextAction.trim().length === 0) {
      warning.push(`${rule.id} has no nextAction.`);
    }

    // 10. Warning if low risk with blocking severity
    if (rule.risk === 'low' && rule.severity === 'blocking') {
      info.push(`${rule.id}: low risk but blocking severity — verify intentional.`);
    }

    // 11. Warning if high risk with info severity
    if (rule.risk === 'high' && rule.severity === 'info') {
      warning.push(`${rule.id}: high risk but info severity — consider upgrading.`);
    }
  }

  return { blocking, warning, info };
}

export function getPermissionEvaluatorValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const result = validatePermissionEvaluatorRules();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
