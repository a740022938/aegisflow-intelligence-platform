// Audit Log Validator — pure validation checks for audit log preview registry
// Does not modify state, call APIs, or write to databases.

import {
  AUDIT_LOG_PREVIEW_ITEMS,
  getAuditLogPreviewCount,
  getAuditLogPreviewWriteNowItems,
  getAuditLogPreviewBlockedItems,
} from './audit-log-registry';

export interface AuditLogValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateAuditLogPreview(): AuditLogValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  // All items must have writeNow=false
  const writeNowItems = getAuditLogPreviewWriteNowItems();
  for (const item of writeNowItems) {
    blocking.push(`${item.id}: writeNow must be false (all items readonly preview)`);
  }

  // requiresDbWrite=true must not have allowedNow=true
  const dbWriteAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.requiresDbWrite && p.allowedNow);
  for (const item of dbWriteAllowed) {
    blocking.push(`${item.id}: requiresDbWrite=true but allowedNow=true`);
  }

  // requiresExternalControl=true must not have allowedNow=true
  const extControlAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.requiresExternalControl && p.allowedNow);
  for (const item of extControlAllowed) {
    blocking.push(`${item.id}: requiresExternalControl=true but allowedNow=true`);
  }

  // requiresStageC=true must not have allowedNow=true
  const stageCAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.requiresStageC && p.allowedNow);
  for (const item of stageCAllowed) {
    blocking.push(`${item.id}: requiresStageC=true but allowedNow=true`);
  }

  // critical risk must not have allowedNow=true
  const criticalAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.risk === 'critical' && p.allowedNow);
  for (const item of criticalAllowed) {
    blocking.push(`${item.id}: critical risk but allowedNow=true`);
  }

  // tag_release_attempt must not have allowedNow=true
  const tagReleaseAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'tag_release_attempt' && p.allowedNow);
  for (const item of tagReleaseAllowed) {
    blocking.push(`${item.id}: tag_release_attempt but allowedNow=true`);
  }

  // stage_c_transition_attempt must not have allowedNow=true
  const stageTransitionAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'stage_c_transition_attempt' && p.allowedNow);
  for (const item of stageTransitionAllowed) {
    blocking.push(`${item.id}: stage_c_transition_attempt but allowedNow=true`);
  }

  // db_write_attempt must not have allowedNow=true
  const dbWriteAttemptAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'db_write_attempt' && p.allowedNow);
  for (const item of dbWriteAttemptAllowed) {
    blocking.push(`${item.id}: db_write_attempt but allowedNow=true`);
  }

  // external_control_attempt must not have allowedNow=true
  const extControlAttemptAllowed = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'external_control_attempt' && p.allowedNow);
  for (const item of extControlAttemptAllowed) {
    blocking.push(`${item.id}: external_control_attempt but allowedNow=true`);
  }

  // high/critical items must have gates and blockedActions defined
  const highCriticalItems = AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.risk === 'high' || p.risk === 'critical');
  for (const item of highCriticalItems) {
    if (item.gates.length === 0) {
      warning.push(`${item.id}: high/critical risk item must have gates defined`);
    }
    if (item.blockedActions.length === 0) {
      warning.push(`${item.id}: high/critical risk item must have blockedActions defined`);
    }
  }

  // Each item must have reason and nextAction
  for (const item of AUDIT_LOG_PREVIEW_ITEMS) {
    if (!item.reason) {
      warning.push(`${item.id}: must have reason`);
    }
    if (!item.nextAction) {
      warning.push(`${item.id}: must have nextAction`);
    }
  }

  info.push(`Audit log preview registry has ${getAuditLogPreviewCount()} items`);
  info.push(`Write now: ${getAuditLogPreviewWriteNowItems().length}`);
  info.push(`Blocked: ${getAuditLogPreviewBlockedItems().length}`);

  return { blocking, warning, info };
}

export function getAuditLogValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const result = validateAuditLogPreview();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
