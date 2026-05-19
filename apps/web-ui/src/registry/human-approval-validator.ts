// Human Approval Validator — pure validation checks for human approval workflow preview
// Does not process candidates, execute actions, write DB, or control external tools.

import { HUMAN_APPROVAL_WORKFLOW_ITEMS } from './human-approval-registry';

export interface HumanApprovalValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateHumanApprovalWorkflow(): HumanApprovalValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];
  const items = HUMAN_APPROVAL_WORKFLOW_ITEMS;

  info.push(`Human approval workflow has ${items.length} items`);
  info.push(`Allowed now: ${items.filter(i => i.allowedNow).length}, Blocked: ${items.filter(i => !i.allowedNow).length}`);

  for (const item of items) {
    // approved_for_execution must not be allowedNow
    if (item.currentState === 'approved_for_execution' && item.allowedNow) {
      blocking.push(`${item.id}: approved_for_execution must not be allowedNow`);
    }

    // approve_execution decision must not be allowedNow
    if (item.decision === 'approve_execution' && item.allowedNow) {
      blocking.push(`${item.id}: approve_execution must not be allowedNow`);
    }

    // createsQueueItem=true must not be allowedNow
    if (item.createsQueueItem && item.allowedNow) {
      blocking.push(`${item.id}: createsQueueItem=true must not be allowedNow`);
    }

    // processesCandidate=true must not be allowedNow
    if (item.processesCandidate && item.allowedNow) {
      blocking.push(`${item.id}: processesCandidate=true must not be allowedNow`);
    }

    // executesAction=true must not be allowedNow
    if (item.executesAction && item.allowedNow) {
      blocking.push(`${item.id}: executesAction=true must not be allowedNow`);
    }

    // writesDb=true must not be allowedNow
    if (item.writesDb && item.allowedNow) {
      blocking.push(`${item.id}: writesDb=true must not be allowedNow`);
    }

    // controlsExternalTool=true must not be allowedNow
    if (item.controlsExternalTool && item.allowedNow) {
      blocking.push(`${item.id}: controlsExternalTool=true must not be allowedNow`);
    }

    // requiresStageC=true must not be allowedNow
    if (item.requiresStageC && item.allowedNow) {
      blocking.push(`${item.id}: requiresStageC=true must not be allowedNow`);
    }

    // critical risk must not be allowedNow
    if (item.risk === 'critical' && item.allowedNow) {
      blocking.push(`${item.id}: critical risk must not be allowedNow`);
    }

    // candidate reject/archive must not be allowedNow
    if ((item.id.startsWith('reject-candidate') || item.id.startsWith('archive-candidate')) && item.allowedNow) {
      blocking.push(`${item.id}: candidate reject/archive must not be allowedNow`);
    }

    // tag/release approval must not be allowedNow
    if (item.id.startsWith('git-tag-release') && item.allowedNow) {
      blocking.push(`${item.id}: tag/release approval must not be allowedNow`);
    }

    // high/critical items must have gates and blockedActions
    if ((item.risk === 'high' || item.risk === 'critical') && item.gates.length === 0) {
      blocking.push(`${item.id}: high/critical item must have gates`);
    }
    if ((item.risk === 'high' || item.risk === 'critical') && item.blockedActions.length === 0) {
      blocking.push(`${item.id}: high/critical item must have blockedActions`);
    }

    // every item must have reason and nextAction
    if (!item.reason) {
      warning.push(`${item.id}: item must have reason`);
    }
    if (!item.nextAction) {
      warning.push(`${item.id}: item must have nextAction`);
    }
  }

  return { blocking, warning, info };
}

export function getHumanApprovalValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const result = validateHumanApprovalWorkflow();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
