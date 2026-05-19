// Governance State Validator — pure validation checks for governance state machine
// Does not modify state, call APIs, or write to databases.

import {
  GOVERNANCE_STATES,
  GOVERNANCE_TRANSITIONS,
  getGovernanceStateCount,
  getGovernanceTransitionCount,
  getGovernanceAllowedTransitions,
  getGovernanceBlockedTransitions,
  type GovernanceStateItem,
  type GovernanceTransitionItem,
} from './governance-state-registry';

export interface GovernanceStateValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateGovernanceStateMachine(): GovernanceStateValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  const futureStageCAllowed = GOVERNANCE_STATES.filter(s => s.state === 'future_stage_c' && s.allowedNow);
  for (const state of futureStageCAllowed) {
    blocking.push(`${state.id}: future_stage_c state must not be allowedNow`);
  }

  const stageCTransitions = GOVERNANCE_TRANSITIONS.filter(t => t.requiresStageC);
  const stageCAllowedNow = stageCTransitions.filter(t => t.allowedNow);
  for (const t of stageCAllowedNow) {
    blocking.push(`${t.id}: requiresStageC=true but allowedNow=true`);
  }

  const dbWriteTransitions = GOVERNANCE_TRANSITIONS.filter(t => t.requiresDbWrite);
  const dbWriteAllowedNow = dbWriteTransitions.filter(t => t.allowedNow);
  for (const t of dbWriteAllowedNow) {
    blocking.push(`${t.id}: requiresDbWrite=true but allowedNow=true`);
  }

  const extControlTransitions = GOVERNANCE_TRANSITIONS.filter(t => t.requiresExternalControl);
  const extControlAllowedNow = extControlTransitions.filter(t => t.allowedNow);
  for (const t of extControlAllowedNow) {
    blocking.push(`${t.id}: requiresExternalControl=true but allowedNow=true`);
  }

  const approveExecution = GOVERNANCE_TRANSITIONS.filter(t => t.kind === 'approve_execution');
  const approveExecutionAllowed = approveExecution.filter(t => t.allowedNow);
  for (const t of approveExecutionAllowed) {
    blocking.push(`${t.id}: approve_execution transition must not be allowedNow`);
  }

  const candidateProcessing = GOVERNANCE_TRANSITIONS.filter(t => t.id === 'blocked-candidate-processing');
  const candidateProcessingAllowed = candidateProcessing.filter(t => t.allowedNow);
  for (const t of candidateProcessingAllowed) {
    blocking.push(`${t.id}: candidate-processing transition must not be allowedNow`);
  }

  const hiddenDirectToSidebar = GOVERNANCE_TRANSITIONS.filter(t => t.id === 'blocked-hidden-direct-to-sidebar');
  const hiddenDirectAllowed = hiddenDirectToSidebar.filter(t => t.allowedNow);
  for (const t of hiddenDirectAllowed) {
    blocking.push(`${t.id}: hidden-direct-to-sidebar transition must not be allowedNow`);
  }

  const auditPreviewToWrite = GOVERNANCE_TRANSITIONS.filter(t => t.id === 'blocked-audit-preview-to-audit-write');
  const auditWriteAllowed = auditPreviewToWrite.filter(t => t.allowedNow);
  for (const t of auditWriteAllowed) {
    blocking.push(`${t.id}: audit-preview-to-write transition must not be allowedNow`);
  }

  const dryRunToReal = GOVERNANCE_TRANSITIONS.filter(t => t.id === 'blocked-dry-run-to-real-dry-run');
  const dryRunRealAllowed = dryRunToReal.filter(t => t.allowedNow);
  for (const t of dryRunRealAllowed) {
    blocking.push(`${t.id}: dry-run-to-real-dry-run transition must not be allowedNow`);
  }

  const criticalTransitions = GOVERNANCE_TRANSITIONS.filter(t => t.risk === 'critical');
  const criticalAllowedNow = criticalTransitions.filter(t => t.allowedNow);
  for (const t of criticalAllowedNow) {
    blocking.push(`${t.id}: critical risk transition must not be allowedNow`);
  }

  const highCriticalItems = [...GOVERNANCE_STATES, ...GOVERNANCE_TRANSITIONS].filter(
    i => i.risk === 'high' || i.risk === 'critical'
  );
  for (const item of highCriticalItems) {
    if (item.gates.length === 0) {
      warning.push(`${item.id}: high/critical risk item must have gates defined`);
    }
    if (item.blockedActions.length === 0) {
      warning.push(`${item.id}: high/critical risk item must have blockedActions defined`);
    }
  }

  for (const state of GOVERNANCE_STATES) {
    if (!state.reason) {
      warning.push(`${state.id}: state must have reason`);
    }
    if (!state.nextAction) {
      warning.push(`${state.id}: state must have nextAction`);
    }
  }

  for (const t of GOVERNANCE_TRANSITIONS) {
    if (!t.reason) {
      warning.push(`${t.id}: transition must have reason`);
    }
    if (!t.nextAction) {
      warning.push(`${t.id}: transition must have nextAction`);
    }
  }

  info.push(`Governance state machine has ${getGovernanceStateCount()} states`);
  info.push(`Governance state machine has ${getGovernanceTransitionCount()} transitions`);
  info.push(`Allowed transitions: ${getGovernanceAllowedTransitions().length}, Blocked: ${getGovernanceBlockedTransitions().length}`);

  return { blocking, warning, info };
}

export function getGovernanceStateValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const result = validateGovernanceStateMachine();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
