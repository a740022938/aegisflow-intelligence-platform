import { getGovernanceConsoleReportPackItems, GovernanceConsoleReportPackItem } from './governance-console-report-pack-registry';

export interface GovernanceConsoleReportPackValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateGovernanceConsoleReportPackRegistry(): GovernanceConsoleReportPackValidationResult {
  const items = getGovernanceConsoleReportPackItems();
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  for (const item of items) {
    if (item.writesDb && item.allowedNow) {
      blocking.push(`${item.id}: writesDb=true but allowedNow=true — forbidden`);
    }

    if (item.includesSecrets && item.allowedNow) {
      blocking.push(`${item.id}: includesSecrets=true but allowedNow=true — forbidden`);
    }

    if (item.status === 'future_stage_c' && item.allowedNow) {
      blocking.push(`${item.id}: status=future_stage_c but allowedNow=true — forbidden`);
    }

    if (item.requiresRedaction && (!item.gates || item.gates.length === 0)) {
      blocking.push(`${item.id}: requiresRedaction=true but no gates defined`);
    }

    if (item.includesSecrets && item.forbiddenFields.length === 0) {
      blocking.push(`${item.id}: includesSecrets=true but no forbiddenFields defined`);
    }

    if (item.includesSecrets && !item.forbiddenFields.some(f =>
      f.includes('token') || f.includes('api_key') || f.includes('password') || f.includes('private_key')
    )) {
      blocking.push(`${item.id}: includesSecrets=true but forbiddenFields missing token/api_key/password/private_key`);
    }

    if (!item.reason) {
      blocking.push(`${item.id}: reason is empty`);
    }

    if (!item.nextAction) {
      blocking.push(`${item.id}: nextAction is empty`);
    }
  }

  if (blocking.length === 0) {
    info.push('All report pack registry items pass validation');
  }

  return { blocking, warning, info };
}

export function getGovernanceConsoleReportPackValidationSummary() {
  const result = validateGovernanceConsoleReportPackRegistry();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
