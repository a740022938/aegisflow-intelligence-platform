import { getGovernanceConsoleRiskItems, GovernanceConsoleRiskItem } from './governance-console-risk-registry';

export interface GovernanceConsoleRiskValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

function checkBlocked(allowedNow: boolean, condition: boolean, item: GovernanceConsoleRiskItem, field: string): string | null {
  if (condition && allowedNow) {
    return `${item.id}: ${field}=true but allowedNow=true — forbidden`;
  }
  return null;
}

export function validateGovernanceConsoleRiskRegistry(): GovernanceConsoleRiskValidationResult {
  const items = getGovernanceConsoleRiskItems();
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  for (const item of items) {
    const checks = [
      checkBlocked(item.allowedNow, item.severity === 'critical', item, 'severity=critical'),
      checkBlocked(item.allowedNow, item.requiresStageC, item, 'requiresStageC'),
      checkBlocked(item.allowedNow, item.requiresDbWrite, item, 'requiresDbWrite'),
      checkBlocked(item.allowedNow, item.requiresExternalControl, item, 'requiresExternalControl'),
    ];
    for (const check of checks) {
      if (check) blocking.push(check);
    }

    if (item.category === 'execution_capability' && item.allowedNow && !item.id.includes('preview')) {
      blocking.push(`${item.id}: execution_capability category but allowedNow=true`);
    }

    const blockedIds = ['stage-c-disabled-risk', 'db-write-blocked-risk', 'external-control-blocked-risk',
      'rollback-executor-blocked-risk', 'evidence-store-blocked-risk', 'approval-queue-blocked-risk',
      'candidate-processing-blocked-risk', 'secret-capture-blocked-risk'];
    if (blockedIds.includes(item.id) && !item.blocked) {
      blocking.push(`${item.id}: must be blocked=true`);
    }

    if ((item.severity === 'high' || item.severity === 'critical') && (!item.gates || item.gates.length === 0)) {
      blocking.push(`${item.id}: severity=${item.severity} but no gates defined`);
    }

    if ((item.severity === 'high' || item.severity === 'critical') && (!item.blockedActions || item.blockedActions.length === 0)) {
      blocking.push(`${item.id}: severity=${item.severity} but no blockedActions defined`);
    }

    if (!item.reason) {
      blocking.push(`${item.id}: reason is empty`);
    }

    if (!item.nextAction) {
      blocking.push(`${item.id}: nextAction is empty`);
    }
  }

  if (blocking.length === 0) {
    info.push('All risk registry items pass validation');
  }

  return { blocking, warning, info };
}

export function getGovernanceConsoleRiskValidationSummary() {
  const result = validateGovernanceConsoleRiskRegistry();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
