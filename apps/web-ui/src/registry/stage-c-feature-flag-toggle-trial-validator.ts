import { TOGGLE_TRIAL_REGISTRY, StageCFeatureFlagToggleTrialItem } from './stage-c-feature-flag-toggle-trial-registry';

export interface ToggleTrialValidationResult {
  blocking: number;
  warning: number;
  pass: boolean;
  checks: { name: string; status: 'pass' | 'fail' | 'warning'; detail: string }[];
}

export function validateToggleTrial(): ToggleTrialValidationResult {
  const checks: ToggleTrialValidationResult['checks'] = [];
  let blocking = 0;
  let warning = 0;

  // registry non-empty
  checks.push({
    name: 'registry-non-empty',
    status: TOGGLE_TRIAL_REGISTRY.length > 0 ? 'pass' : 'fail',
    detail: `Registry has ${TOGGLE_TRIAL_REGISTRY.length} items (expected >= 20)`,
  });
  if (TOGGLE_TRIAL_REGISTRY.length === 0) blocking++;

  // id unique
  const ids = TOGGLE_TRIAL_REGISTRY.map(i => i.id);
  const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  if (dupes.length > 0) {
    checks.push({ name: 'id-unique', status: 'fail', detail: `Duplicate ids: ${dupes.join(', ')}` });
    blocking++;
  } else {
    checks.push({ name: 'id-unique', status: 'pass', detail: 'All ids unique' });
  }

  // field checks
  let allReadonly = true;
  let allTrialPlanOnly = true;
  let allToggleExecuted = true;
  let allToggleAllowedNow = true;
  let allActionAllowed = true;
  let allMutationAllowed = true;
  let allCanEnableStageC = true;

  for (const item of TOGGLE_TRIAL_REGISTRY) {
    if (!item.readonly) { allReadonly = false; }
    if (!item.trialPlanOnly) { allTrialPlanOnly = false; }
    if (item.toggleExecuted) { allToggleExecuted = false; }
    if (item.toggleAllowedNow) { allToggleAllowedNow = false; }
    if (item.actionAllowed) { allActionAllowed = false; }
    if (item.mutationAllowed) { allMutationAllowed = false; }
    if (item.canEnableStageC) { allCanEnableStageC = false; }
  }

  checks.push({
    name: 'all-readonly',
    status: allReadonly ? 'pass' : 'fail',
    detail: allReadonly ? 'All items readonly=true' : 'Some items have readonly=false',
  });
  if (!allReadonly) blocking++;

  checks.push({
    name: 'all-trial-plan-only',
    status: allTrialPlanOnly ? 'pass' : 'fail',
    detail: allTrialPlanOnly ? 'All items trialPlanOnly=true' : 'Some items have trialPlanOnly=false',
  });
  if (!allTrialPlanOnly) blocking++;

  checks.push({
    name: 'all-toggle-not-executed',
    status: allToggleExecuted ? 'pass' : 'fail',
    detail: allToggleExecuted ? 'All items toggleExecuted=false' : 'Some items have toggleExecuted=true',
  });
  if (!allToggleExecuted) blocking++;

  checks.push({
    name: 'all-toggle-not-allowed-now',
    status: allToggleAllowedNow ? 'pass' : 'fail',
    detail: allToggleAllowedNow ? 'All items toggleAllowedNow=false' : 'Some items have toggleAllowedNow=true',
  });
  if (!allToggleAllowedNow) blocking++;

  checks.push({
    name: 'all-action-not-allowed',
    status: allActionAllowed ? 'pass' : 'fail',
    detail: allActionAllowed ? 'All items actionAllowed=false' : 'Some items have actionAllowed=true',
  });
  if (!allActionAllowed) blocking++;

  checks.push({
    name: 'all-mutation-not-allowed',
    status: allMutationAllowed ? 'pass' : 'fail',
    detail: allMutationAllowed ? 'All items mutationAllowed=false' : 'Some items have mutationAllowed=true',
  });
  if (!allMutationAllowed) blocking++;

  checks.push({
    name: 'all-cannot-enable-stage-c',
    status: allCanEnableStageC ? 'pass' : 'fail',
    detail: allCanEnableStageC ? 'All items canEnableStageC=false' : 'Some items have canEnableStageC=true',
  });
  if (!allCanEnableStageC) blocking++;

  // specific items exist
  const requiredIds = ['tt-human-approval-required', 'tt-rollback-plan-required', 'tt-kill-switch-required', 'tt-smoke-plan-required'];
  for (const rid of requiredIds) {
    const found = TOGGLE_TRIAL_REGISTRY.some(i => i.id === rid);
    checks.push({
      name: `item-exists-${rid}`,
      status: found ? 'pass' : 'fail',
      detail: found ? `${rid} exists in registry` : `${rid} is missing from registry`,
    });
    if (!found) blocking++;
  }

  // forbidden categories
  const forbiddenActions = TOGGLE_TRIAL_REGISTRY.filter(i => i.category === 'forbidden_action');
  const forbiddenCurrentState = TOGGLE_TRIAL_REGISTRY.filter(i => i.category === 'current_state');

  checks.push({
    name: 'forbidden-actions-defined',
    status: forbiddenActions.length >= 7 ? 'pass' : 'warning',
    detail: `${forbiddenActions.length} forbidden action items defined (expected >= 7)`,
  });
  if (forbiddenActions.length < 7) warning++;

  checks.push({
    name: 'current-state-defined',
    status: forbiddenCurrentState.length >= 3 ? 'pass' : 'warning',
    detail: `${forbiddenCurrentState.length} current state items defined (expected >= 3)`,
  });
  if (forbiddenCurrentState.length < 3) warning++;

  return {
    blocking,
    warning,
    pass: blocking === 0,
    checks,
  };
}
