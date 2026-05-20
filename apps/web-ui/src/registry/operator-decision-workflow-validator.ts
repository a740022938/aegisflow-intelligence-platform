// Operator Decision Workflow Validator — validates decision workflow integrity
// Readonly validation. Does not execute actions or modify state.

import { evaluateDecisionWorkflow, DECISION_WORKFLOW_CHECKS } from './operator-decision-workflow-registry';

export interface DecisionWorkflowValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface DecisionWorkflowValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: DecisionWorkflowValidationCheck[];
}

export function validateDecisionWorkflow(): DecisionWorkflowValidationResult {
  const checks: DecisionWorkflowValidationCheck[] = [];

  // Registry must have checks
  checks.push({
    id: 'decision-workflow-checks-exist',
    pass: DECISION_WORKFLOW_CHECKS.length > 0,
    message: DECISION_WORKFLOW_CHECKS.length > 0
      ? `Decision workflow has ${DECISION_WORKFLOW_CHECKS.length} checks`
      : 'Decision workflow is empty',
    level: DECISION_WORKFLOW_CHECKS.length > 0 ? 'info' : 'blocking',
  });

  // Must have exactly 10 checks
  checks.push({
    id: 'decision-workflow-ten-checks',
    pass: DECISION_WORKFLOW_CHECKS.length === 10,
    message: DECISION_WORKFLOW_CHECKS.length === 10
      ? 'Decision workflow has the standard 10 checks'
      : `Decision workflow has ${DECISION_WORKFLOW_CHECKS.length} checks (expected 10)`,
    level: DECISION_WORKFLOW_CHECKS.length === 10 ? 'info' : 'warning',
  });

  // Check all items are readonly
  const nonReadonly = DECISION_WORKFLOW_CHECKS.filter(i => !i.readonly);
  checks.push({
    id: 'decision-workflow-all-readonly',
    pass: nonReadonly.length === 0,
    message: nonReadonly.length === 0
      ? 'All decision workflow items are readonly'
      : `${nonReadonly.length} item(s) are NOT readonly`,
    level: nonReadonly.length > 0 ? 'blocking' : 'info',
  });

  // Check order is sequential
  const orders = DECISION_WORKFLOW_CHECKS.map(c => c.checkOrder);
  const sequential = orders.every((o, i) => o === i + 1);
  checks.push({
    id: 'decision-workflow-sequential-order',
    pass: sequential,
    message: sequential
      ? 'Check order is sequential (1–10)'
      : 'Check order is NOT sequential',
    level: sequential ? 'info' : 'warning',
  });

  // Evaluate and verify result
  const result = evaluateDecisionWorkflow();
  checks.push({
    id: 'decision-workflow-evaluates',
    pass: result.totalChecks === DECISION_WORKFLOW_CHECKS.length,
    message: result.totalChecks === DECISION_WORKFLOW_CHECKS.length
      ? `Workflow evaluates correctly: ${result.state}`
      : 'Workflow evaluation mismatch',
    level: 'info',
  });

  // Result must have a non-empty recommendation
  checks.push({
    id: 'decision-workflow-recommendation',
    pass: !!result.recommendation,
    message: result.recommendation
      ? `Recommendation: ${result.recommendation.substring(0, 60)}...`
      : 'Missing recommendation',
    level: result.recommendation ? 'info' : 'blocking',
  });

  const vchecks: DecisionWorkflowValidationResult = {
    pass: true,
    total: checks.length,
    blocking: 0,
    warning: 0,
    info: 0,
    checks,
  };

  for (const c of checks) {
    if (!c.pass) {
      vchecks.pass = false;
      if (c.level === 'blocking') vchecks.blocking++;
      else if (c.level === 'warning') vchecks.warning++;
    }
    if (c.level === 'info') vchecks.info++;
  }

  return vchecks;
}
