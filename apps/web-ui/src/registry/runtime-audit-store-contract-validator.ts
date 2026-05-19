// Runtime Audit Store Contract Validator — pure validation checks for audit store contract registry
// Does not create audit stores, write audit logs, modify state, or write to databases.

import {
  RUNTIME_AUDIT_STORE_CONTRACT_ITEMS,
  type RuntimeAuditStoreContractItem,
} from './runtime-audit-store-contract-registry';

export interface RuntimeAuditStoreContractValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateRuntimeAuditStoreContract(): RuntimeAuditStoreContractValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  const requiredForbiddenFields = ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'];

  for (const item of RUNTIME_AUDIT_STORE_CONTRACT_ITEMS) {
    if (item.writesAuditStore && item.allowedNow) {
      blocking.push(`${item.id}: writesAuditStore=true must not be allowedNow=true`);
    }
    if (item.writesDb && item.allowedNow) {
      blocking.push(`${item.id}: writesDb=true must not be allowedNow=true`);
    }
    if (item.readsSecretMaterial && item.allowedNow) {
      blocking.push(`${item.id}: readsSecretMaterial=true must not be allowedNow=true`);
    }
    if (item.requiresStageC && item.allowedNow) {
      blocking.push(`${item.id}: requiresStageC=true must not be allowedNow=true`);
    }
    if (item.risk === 'critical' && item.allowedNow) {
      blocking.push(`${item.id}: critical item must not be allowedNow=true`);
    }

    if (item.requiresRedaction && item.redactionRules.length === 0) {
      blocking.push(`${item.id}: requiresRedaction=true must have redactionRules defined`);
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
  }

  return { blocking, warning, info };
}
