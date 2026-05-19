import { getRollbackRegistryItems } from './rollback-registry';

export interface RollbackValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateRollbackRegistry(): RollbackValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];
  const items = getRollbackRegistryItems();

  for (const item of items) {
    if (item.executesRollback && item.allowedNow) {
      blocking.push(`${item.id}: executesRollback=true but allowedNow=true — forbidden`);
    }
    if (item.irreversible && item.allowedNow) {
      blocking.push(`${item.id}: irreversible=true but allowedNow=true — forbidden`);
    }
    if (item.requiresDbWrite && item.allowedNow) {
      blocking.push(`${item.id}: requiresDbWrite=true but allowedNow=true — forbidden`);
    }
    if (item.requiresExternalControl && item.allowedNow) {
      blocking.push(`${item.id}: requiresExternalControl=true but allowedNow=true — forbidden`);
    }
    if (item.requiresStageC && item.allowedNow) {
      blocking.push(`${item.id}: requiresStageC=true but allowedNow=true — forbidden`);
    }
    if (item.modifiesFiles && item.allowedNow) {
      blocking.push(`${item.id}: modifiesFiles=true but allowedNow=true — forbidden`);
    }
    if (item.modifiesGit && item.allowedNow) {
      blocking.push(`${item.id}: modifiesGit=true but allowedNow=true — forbidden`);
    }
    if (item.risk === 'critical' && item.allowedNow) {
      blocking.push(`${item.id}: risk=critical but allowedNow=true — forbidden`);
    }
    if (item.rollbackType === 'blocked_irreversible' && item.allowedNow) {
      blocking.push(`${item.id}: rollbackType=blocked_irreversible but allowedNow=true — forbidden`);
    }
    if (item.rollbackType === 'future_stage_c' && item.allowedNow) {
      blocking.push(`${item.id}: rollbackType=future_stage_c but allowedNow=true — forbidden`);
    }
    if ((item.risk === 'high' || item.risk === 'critical') && (!item.gates || item.gates.length === 0)) {
      blocking.push(`${item.id}: risk=${item.risk} but gates is empty — high/critical items must have gates`);
    }
    if ((item.risk === 'high' || item.risk === 'critical') && (!item.blockedActions || item.blockedActions.length === 0)) {
      blocking.push(`${item.id}: risk=${item.risk} but blockedActions is empty — high/critical items must have blockedActions`);
    }
    if (!item.preconditions || item.preconditions.length === 0) {
      warning.push(`${item.id}: preconditions is empty — consider documenting preconditions`);
    }
    if (!item.evidenceRequired || item.evidenceRequired.length === 0) {
      warning.push(`${item.id}: evidenceRequired is empty — consider documenting required evidence`);
    }
    if (!item.rollbackStepsPreview || item.rollbackStepsPreview.length === 0) {
      warning.push(`${item.id}: rollbackStepsPreview is empty — consider documenting rollback steps`);
    }
    if (!item.failureModes || item.failureModes.length === 0) {
      warning.push(`${item.id}: failureModes is empty — consider documenting failure modes`);
    }
    if (!item.reason) {
      blocking.push(`${item.id}: reason is required but empty`);
    }
    if (!item.nextAction) {
      blocking.push(`${item.id}: nextAction is required but empty`);
    }
  }

  return { blocking, warning, info };
}

export function getRollbackValidationSummary(): { blocking: number; warning: number; info: number; pass: boolean } {
  const result = validateRollbackRegistry();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
