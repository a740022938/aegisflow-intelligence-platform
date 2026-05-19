import { getGovernanceConsoleDecisionItems, GovernanceConsoleDecisionItem } from './governance-console-decision-registry';

export interface GovernanceConsoleDecisionValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

function checkBlocked(allowedNow: boolean, condition: boolean, item: GovernanceConsoleDecisionItem, field: string): string | null {
  if (condition && allowedNow) {
    return `${item.id}: ${field}=true but allowedNow=true — forbidden`;
  }
  return null;
}

export function validateGovernanceConsoleDecisionRegistry(): GovernanceConsoleDecisionValidationResult {
  const items = getGovernanceConsoleDecisionItems();
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  for (const item of items) {
    const checks = [
      checkBlocked(item.allowedNow, item.executesAction, item, 'executesAction'),
      checkBlocked(item.allowedNow, item.mutatesRegistry, item, 'mutatesRegistry'),
      checkBlocked(item.allowedNow, item.writesDb, item, 'writesDb'),
      checkBlocked(item.allowedNow, item.controlsExternalTool, item, 'controlsExternalTool'),
      checkBlocked(item.allowedNow, item.requiresStageC, item, 'requiresStageC'),
      checkBlocked(item.allowedNow, item.risk === 'critical', item, 'risk=critical'),
    ];
    for (const check of checks) {
      if (check) blocking.push(check);
    }

    if (item.id === 'blocked-enable-stage-c' && item.recommendedNow) {
      blocking.push('blocked-enable-stage-c: must not be recommendedNow');
    }

    if ((item.decisionType === 'blocked' || item.decisionType === 'future_stage_c_only') && (!item.gates || item.gates.length === 0)) {
      blocking.push(`${item.id}: decisionType=${item.decisionType} but no gates defined`);
    }

    if ((item.decisionType === 'blocked' || item.decisionType === 'future_stage_c_only') && (!item.blockedActions || item.blockedActions.length === 0)) {
      blocking.push(`${item.id}: decisionType=${item.decisionType} but no blockedActions defined`);
    }

    if (!item.decisionRationale) {
      blocking.push(`${item.id}: decisionRationale is empty`);
    }

    if (!item.reason) {
      blocking.push(`${item.id}: reason is empty`);
    }

    if (!item.nextAction) {
      blocking.push(`${item.id}: nextAction is empty`);
    }
  }

  if (blocking.length === 0) {
    info.push('All decision registry items pass validation');
  }

  return { blocking, warning, info };
}

export function getGovernanceConsoleDecisionValidationSummary() {
  const result = validateGovernanceConsoleDecisionRegistry();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
