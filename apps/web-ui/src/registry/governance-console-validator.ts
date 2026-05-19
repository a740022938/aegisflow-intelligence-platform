import { getGovernanceConsoleRegistryItems, GovernanceConsoleRegistryItem } from './governance-console-registry';

export interface GovernanceConsoleValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

function checkBlocked(allowedNow: boolean, condition: boolean, item: GovernanceConsoleRegistryItem, field: string): string | null {
  if (condition && allowedNow) {
    return `${item.id}: ${field}=true but allowedNow=true — forbidden`;
  }
  return null;
}

function checkInSidebar(item: GovernanceConsoleRegistryItem, shouldBeInSidebar: boolean): string | null {
  if (item.inSidebar !== shouldBeInSidebar) {
    return `${item.id}: inSidebar should be ${shouldBeInSidebar}`;
  }
  return null;
}

export function validateGovernanceConsoleRegistry(): GovernanceConsoleValidationResult {
  const items = getGovernanceConsoleRegistryItems();
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  for (const item of items) {
    const checks = [
      checkBlocked(item.allowedNow, item.supportsExecution, item, 'supportsExecution'),
      checkBlocked(item.allowedNow, item.writesData, item, 'writesData'),
      checkBlocked(item.allowedNow, item.requiresStageC, item, 'requiresStageC'),
      checkBlocked(item.allowedNow, item.requiresDbWrite, item, 'requiresDbWrite'),
      checkBlocked(item.allowedNow, item.requiresExternalControl, item, 'requiresExternalControl'),
      checkBlocked(item.allowedNow, item.risk === 'critical', item, 'risk=critical'),
    ];

    for (const check of checks) {
      if (check) blocking.push(check);
    }

    if (item.exposure === 'hidden_direct' && item.inSidebar) {
      blocking.push(`${item.id}: exposure=hidden_direct but inSidebar=true — forbidden`);
    }

    if (item.exposure === 'blocked' && item.allowedNow) {
      blocking.push(`${item.id}: exposure=blocked but allowedNow=true — forbidden`);
    }

    if ((item.risk === 'high' || item.risk === 'critical') && (!item.gates || item.gates.length === 0)) {
      blocking.push(`${item.id}: risk=${item.risk} but no gates defined`);
    }

    if ((item.risk === 'high' || item.risk === 'critical') && (!item.blockedActions || item.blockedActions.length === 0)) {
      blocking.push(`${item.id}: risk=${item.risk} but no blockedActions defined`);
    }

    if (!item.reason) {
      blocking.push(`${item.id}: reason is empty`);
    }

    if (!item.nextAction) {
      blocking.push(`${item.id}: nextAction is empty`);
    }
  }

  const previewItems = items.filter(i => i.previewRoute && i.domain !== 'center_access');
  for (const item of previewItems) {
    const sidebarCheck = checkInSidebar(item, false);
    if (sidebarCheck) blocking.push(sidebarCheck);
  }

  const advanced = items.find(i => i.id === 'advanced-mode');
  if (advanced) {
    const check = checkInSidebar(advanced, true);
    if (check) warning.push(check);
  }

  const connector = items.find(i => i.id === 'connector-center');
  if (connector) {
    const check = checkInSidebar(connector, true);
    if (check) warning.push(check);
  }

  const stageC = items.find(i => i.id === 'stage-c');
  if (stageC && stageC.allowedNow) {
    blocking.push('stage-c: Stage C must be blocked');
  }

  const dbWrite = items.find(i => i.id === 'db-write');
  if (dbWrite && dbWrite.allowedNow) {
    blocking.push('db-write: DB write must be blocked');
  }

  const extCtrl = items.find(i => i.id === 'external-control');
  if (extCtrl && extCtrl.allowedNow) {
    blocking.push('external-control: External control must be blocked');
  }

  if (blocking.length === 0) {
    info.push('All governance console registry items pass validation');
  }

  const sidebarItems = items.filter(i => i.inSidebar);
  const onlySidebarIds = sidebarItems.map(i => i.id);
  if (onlySidebarIds.length === 2 && onlySidebarIds.includes('advanced-mode') && onlySidebarIds.includes('connector-center')) {
    info.push('Only advanced-mode and connector-center are in sidebar — correct');
  } else if (onlySidebarIds.length > 2) {
    warning.push(`Found ${onlySidebarIds.length} sidebar items: ${onlySidebarIds.join(', ')}. Expected only advanced-mode and connector-center.`);
  }

  return { blocking, warning, info };
}

export function getGovernanceConsoleValidationSummary() {
  const result = validateGovernanceConsoleRegistry();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
