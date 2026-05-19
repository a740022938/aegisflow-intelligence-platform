// Dry-run Plan Validator — pure validation checks for dry-run plan registry
// Does not modify state, call APIs, or write to databases.

import {
  DRY_RUN_PLANS,
  getDryRunPlanCount,
  getDryRunPlansByMode,
  getDryRunPlanAllowedNowItems,
  getDryRunPlanBlockedItems,
} from './dry-run-plan-registry';

export interface DryRunPlanValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateDryRunPlans(): DryRunPlanValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  const forbiddenPlans = getDryRunPlansByMode('forbidden');
  const forbiddenAllowedNow = forbiddenPlans.filter(p => p.allowedNow);
  for (const plan of forbiddenAllowedNow) {
    blocking.push(`${plan.id}: forbidden mode must not be allowedNow`);
  }

  const stageCPlans = DRY_RUN_PLANS.filter(p => p.requiresStageC);
  const stageCAllowedNow = stageCPlans.filter(p => p.allowedNow);
  for (const plan of stageCAllowedNow) {
    blocking.push(`${plan.id}: requiresStageC=true but allowedNow=true`);
  }

  const externalSystemPlans = DRY_RUN_PLANS.filter(p => p.requiresExternalSystem);
  const externalSystemAllowedNow = externalSystemPlans.filter(p => p.allowedNow);
  for (const plan of externalSystemAllowedNow) {
    blocking.push(`${plan.id}: requiresExternalSystem=true but allowedNow=true`);
  }

  const runtimePlans = DRY_RUN_PLANS.filter(p => p.requiresRuntime);
  const runtimeAllowedNow = runtimePlans.filter(p => p.allowedNow);
  for (const plan of runtimeAllowedNow) {
    blocking.push(`${plan.id}: requiresRuntime=true but allowedNow=true`);
  }

  const dbWrite = DRY_RUN_PLANS.find(p => p.id === 'db-write-blocked');
  if (dbWrite && dbWrite.allowedNow) {
    blocking.push('db-write-blocked must not be allowedNow');
  }

  const stageCTransition = DRY_RUN_PLANS.find(p => p.id === 'stage-c-transition-blocked');
  if (stageCTransition && stageCTransition.allowedNow) {
    blocking.push('stage-c-transition-blocked must not be allowedNow');
  }

  const tagRelease = DRY_RUN_PLANS.find(p => p.id === 'git-tag-release-blocked');
  if (tagRelease && tagRelease.allowedNow) {
    blocking.push('git-tag-release-blocked must not be allowedNow');
  }

  const realExecutePlans = DRY_RUN_PLANS.filter(p =>
    p.id.includes('execute') || p.id.includes('upload') || p.id.includes('write')
  ).filter(p => p.mode === 'forbidden' || p.mode === 'human_approval_required');
  const executeAllowedNow = realExecutePlans.filter(p => p.allowedNow);
  for (const plan of executeAllowedNow) {
    blocking.push(`${plan.id}: real execution plan must not be allowedNow`);
  }

  const highCriticalPlans = DRY_RUN_PLANS.filter(p =>
    (p.risk === 'high' || p.risk === 'critical') && p.allowedNow && p.mode !== 'static_preview'
  );
  for (const plan of highCriticalPlans) {
    blocking.push(`${plan.id}: high/critical risk plan must not be allowedNow unless static_preview`);
  }

  const blockedOrHigh = DRY_RUN_PLANS.filter(p => p.status === 'blocked' || p.risk === 'high' || p.risk === 'critical');
  for (const plan of blockedOrHigh) {
    if (plan.gates.length === 0) {
      warning.push(`${plan.id}: blocked/high/critical plan must have gates defined`);
    }
    if (plan.blockedActions.length === 0) {
      warning.push(`${plan.id}: blocked/high/critical plan must have blockedActions defined`);
    }
  }

  for (const plan of DRY_RUN_PLANS) {
    if (!plan.reason) {
      warning.push(`${plan.id}: must have reason`);
    }
    if (!plan.nextAction) {
      warning.push(`${plan.id}: must have nextAction`);
    }
    if (plan.planSteps.length === 0 && plan.mode !== 'forbidden') {
      warning.push(`${plan.id}: non-forbidden plan should have planSteps`);
    }
  }

  info.push(`Dry-run plan registry has ${getDryRunPlanCount()} plans`);
  info.push(`Allowed now: ${getDryRunPlanAllowedNowItems().length}`);
  info.push(`Blocked: ${getDryRunPlanBlockedItems().length}`);

  return { blocking, warning, info };
}

export function getDryRunPlanValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const result = validateDryRunPlans();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
