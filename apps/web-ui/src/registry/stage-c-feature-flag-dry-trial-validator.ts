import { DRY_TRIAL_REGISTRY } from './stage-c-feature-flag-dry-trial-registry';

export interface DryTrialValidationResult {
  blocking: number;
  warning: number;
  pass: boolean;
  checks: { name: string; status: 'pass' | 'fail' | 'warning'; detail: string }[];
}

export function validateDryTrial(): DryTrialValidationResult {
  const checks: DryTrialValidationResult['checks'] = [];
  let blocking = 0;
  let warning = 0;

  checks.push({
    name: 'registry-non-empty',
    status: DRY_TRIAL_REGISTRY.length > 0 ? 'pass' : 'fail',
    detail: `Registry has ${DRY_TRIAL_REGISTRY.length} items (expected >= 18)`,
  });
  if (DRY_TRIAL_REGISTRY.length === 0) blocking++;

  const ids = DRY_TRIAL_REGISTRY.map(i => i.id);
  const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  if (dupes.length > 0) {
    checks.push({ name: 'id-unique', status: 'fail', detail: `Duplicate ids: ${dupes.join(', ')}` });
    blocking++;
  } else {
    checks.push({ name: 'id-unique', status: 'pass', detail: 'All ids unique' });
  }

  let allReadonly = true;
  let allDryTrialOnly = true;
  let allFlagOff = true;
  let allStageCDisabled = true;
  let allActionDisallowed = true;
  let allMutationDisallowed = true;
  let allCanNotEnable = true;

  for (const item of DRY_TRIAL_REGISTRY) {
    if (!item.readonly) allReadonly = false;
    if (!item.dryTrialOnly) allDryTrialOnly = false;
    if (item.featureFlagOfficiallyEnabled) allFlagOff = false;
    if (item.stageCEnabled) allStageCDisabled = false;
    if (item.actionAllowed) allActionDisallowed = false;
    if (item.mutationAllowed) allMutationDisallowed = false;
    if (item.canEnableStageC) allCanNotEnable = false;
  }

  const fieldChecks: { name: string; pass: boolean; detail: string }[] = [
    { name: 'all-readonly', pass: allReadonly, detail: allReadonly ? 'All items readonly=true' : 'Some items have readonly=false' },
    { name: 'all-dry-trial-only', pass: allDryTrialOnly, detail: allDryTrialOnly ? 'All items dryTrialOnly=true' : 'Some items have dryTrialOnly=false' },
    { name: 'all-flag-off', pass: allFlagOff, detail: allFlagOff ? 'All items featureFlagOfficiallyEnabled=false' : 'Some items have featureFlagOfficiallyEnabled=true' },
    { name: 'all-stage-c-disabled', pass: allStageCDisabled, detail: allStageCDisabled ? 'All items stageCEnabled=false' : 'Some items have stageCEnabled=true' },
    { name: 'all-action-disallowed', pass: allActionDisallowed, detail: allActionDisallowed ? 'All items actionAllowed=false' : 'Some items have actionAllowed=true' },
    { name: 'all-mutation-disallowed', pass: allMutationDisallowed, detail: allMutationDisallowed ? 'All items mutationAllowed=false' : 'Some items have mutationAllowed=true' },
    { name: 'all-cannot-enable-stage-c', pass: allCanNotEnable, detail: allCanNotEnable ? 'All items canEnableStageC=false' : 'Some items have canEnableStageC=true' },
  ];

  for (const fc of fieldChecks) {
    checks.push({ name: fc.name, status: fc.pass ? 'pass' : 'fail', detail: fc.detail });
    if (!fc.pass) blocking++;
  }

  const requiredIds = ['dt-authorization-captured', 'dt-dry-trial-requested', 'dt-dry-trial-completed', 'dt-flag-remains-off', 'dt-stage-c-disabled', 'dt-post-blocked', 'dt-rollback-plan-available', 'dt-smoke-plan-available', 'dt-hidden-direct-route', 'dt-no-tag-release', 'dt-next-gate-auth-required'];
  for (const rid of requiredIds) {
    const found = DRY_TRIAL_REGISTRY.some(i => i.id === rid);
    checks.push({
      name: `item-exists-${rid}`,
      status: found ? 'pass' : 'fail',
      detail: found ? `${rid} exists` : `${rid} missing`,
    });
    if (!found) blocking++;
  }

  const forbiddenItems = DRY_TRIAL_REGISTRY.filter(i => i.status === 'forbidden');
  checks.push({
    name: 'forbidden-items-count',
    status: forbiddenItems.length >= 4 ? 'pass' : 'warning',
    detail: `${forbiddenItems.length} forbidden items (expected >= 4)`,
  });
  if (forbiddenItems.length < 4) warning++;

  return { blocking, warning, pass: blocking === 0, checks };
}
