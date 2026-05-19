// Runtime Dry-run Contract Validator — pure validation checks for dry-run contract registry
// Does not execute dry-runs, call APIs, modify state, or write to databases.

import {
  RUNTIME_DRY_RUN_CONTRACT_ITEMS,
  type RuntimeDryRunContractItem,
} from './runtime-dry-run-contract-registry';

export interface RuntimeDryRunContractValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateRuntimeDryRunContract(): RuntimeDryRunContractValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  const requiredForbiddenFields = ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'];

  for (const item of RUNTIME_DRY_RUN_CONTRACT_ITEMS) {
    if (item.executesDryRun && item.allowedNow) {
      blocking.push(`${item.id}: executesDryRun=true must not be allowedNow=true`);
    }
    if (item.callsExternalTool && item.allowedNow) {
      blocking.push(`${item.id}: callsExternalTool=true must not be allowedNow=true`);
    }
    if (item.writesDb && item.allowedNow) {
      blocking.push(`${item.id}: writesDb=true must not be allowedNow=true`);
    }
    if (item.requiresStageC && item.allowedNow) {
      blocking.push(`${item.id}: requiresStageC=true must not be allowedNow=true`);
    }
    if (item.risk === 'critical' && item.allowedNow) {
      blocking.push(`${item.id}: critical item must not be allowedNow=true`);
    }

    for (const field of requiredForbiddenFields) {
      if (item.forbiddenFields.length > 0 && !item.forbiddenFields.includes(field)) {
        blocking.push(`${item.id}: forbiddenFields must include '${field}'`);
        break;
      }
    }

    if (item.gates.length === 0) {
      warning.push(`${item.id}: must have gates defined`);
    }
    if (!item.reason) {
      warning.push(`${item.id}: must have reason`);
    }
    if (!item.nextAction) {
      warning.push(`${item.id}: must have nextAction`);
    }
    if ((item.risk === 'high' || item.risk === 'critical') && item.blockedActions.length === 0) {
      warning.push(`${item.id}: high/critical item must have blockedActions`);
    }
  }

  return { blocking, warning, info };
}
