// Runtime Registry Validator — pure validation checks for runtime registry
// Does not modify state, call APIs, or write to databases.

import {
  RUNTIME_REGISTRY,
  getRuntimeRegistryCount,
  getRuntimeRegistryByActionLevel,
  getRuntimeRegistryByRisk,
  getRuntimeRegistryAllowedNowItems,
  getRuntimeRegistryBlockedItems,
  type RuntimeRegistryItem,
} from './runtime-registry';

export interface RuntimeRegistryValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateRuntimeRegistry(): RuntimeRegistryValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  const advancedLevels = ['L4_HUMAN_APPROVED_EXECUTE', 'L5_AUTONOMOUS_EXECUTE', 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE'] as const;
  for (const level of advancedLevels) {
    const items = getRuntimeRegistryByActionLevel(level);
    const allowedNowItems = items.filter(i => i.allowedNow);
    for (const item of allowedNowItems) {
      blocking.push(`${item.id}: ${item.actionLevel} must not be allowedNow`);
    }
  }

  const stageCItems = RUNTIME_REGISTRY.filter(i => i.requiresStageC);
  const stageCAllowedNow = stageCItems.filter(i => i.allowedNow);
  for (const item of stageCAllowedNow) {
    blocking.push(`${item.id}: requiresStageC=true but allowedNow=true`);
  }

  const dbWrite = RUNTIME_REGISTRY.find(i => i.id === 'db-write');
  if (dbWrite && dbWrite.allowedNow) {
    blocking.push('db-write must not be allowedNow');
  }

  const stageCTransition = RUNTIME_REGISTRY.find(i => i.id === 'stage-c-transition');
  if (stageCTransition && stageCTransition.allowedNow) {
    blocking.push('stage-c-transition must not be allowedNow');
  }

  const tagRelease = RUNTIME_REGISTRY.find(i => i.id === 'git-tag-release');
  if (tagRelease && tagRelease.allowedNow) {
    blocking.push('git-tag-release must not be allowedNow');
  }

  const externalControlItems = RUNTIME_REGISTRY.filter(i =>
    i.targetKind === 'connector' || i.targetKind === 'external_tool'
  );
  const controlAllowedNow = externalControlItems.filter(i => i.allowedNow && i.actionLevel !== 'L0_VIEW_STATIC');
  for (const item of controlAllowedNow) {
    blocking.push(`${item.id}: external control/connector action must not be allowedNow beyond L0_VIEW_STATIC`);
  }

  const candidateProcess = RUNTIME_REGISTRY.find(i => i.id === 'memory-hub-candidate-process');
  if (candidateProcess && candidateProcess.allowedNow) {
    blocking.push('memory-hub-candidate-process must not be allowedNow');
  }

  const highCriticalAllowedNow = RUNTIME_REGISTRY.filter(i =>
    (i.risk === 'high' || i.risk === 'critical') && i.allowedNow && i.actionLevel !== 'L0_VIEW_STATIC'
  );
  for (const item of highCriticalAllowedNow) {
    blocking.push(`${item.id}: high/critical risk item must not be allowedNow unless L0_VIEW_STATIC`);
  }

  const blockedItems = RUNTIME_REGISTRY.filter(i => i.readiness === 'blocked' || i.risk === 'high' || i.risk === 'critical');
  for (const item of blockedItems) {
    if (item.gates.length === 0) {
      warning.push(`${item.id}: blocked/high/critical item must have gates defined`);
    }
    if (item.blockedActions.length === 0) {
      warning.push(`${item.id}: blocked/high/critical item must have blockedActions defined`);
    }
  }

  for (const item of RUNTIME_REGISTRY) {
    if (!item.reason) {
      warning.push(`${item.id}: must have reason`);
    }
    if (!item.nextAction) {
      warning.push(`${item.id}: must have nextAction`);
    }
  }

  info.push(`Runtime registry has ${getRuntimeRegistryCount()} items`);
  info.push(`Allowed now: ${getRuntimeRegistryAllowedNowItems().length}`);
  info.push(`Blocked: ${getRuntimeRegistryBlockedItems().length}`);

  return { blocking, warning, info };
}

export function getRuntimeRegistryValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const result = validateRuntimeRegistry();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
