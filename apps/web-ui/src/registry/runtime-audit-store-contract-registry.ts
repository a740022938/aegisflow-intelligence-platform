// Runtime Audit Store Contract Registry — static readonly contract model for audit store
// Does not create audit stores, write audit logs, modify state, or write to databases.

export type AuditStoreContractKind =
  | 'event_schema'
  | 'retention_policy'
  | 'redaction_policy'
  | 'write_policy'
  | 'query_policy'
  | 'blocked_store'
  | 'future_stage_c';

export type AuditStoreRisk = 'low' | 'medium' | 'high' | 'critical';

export interface RuntimeAuditStoreContractItem {
  id: string;
  label: string;
  kind: AuditStoreContractKind;
  risk: AuditStoreRisk;
  allowedNow: boolean;
  contractOnly: boolean;
  writesAuditStore: boolean;
  writesDb: boolean;
  readsSecretMaterial: boolean;
  requiresRedaction: boolean;
  requiresHumanApproval: boolean;
  requiresStageC: boolean;
  eventFields: string[];
  retentionFields: string[];
  forbiddenFields: string[];
  redactionRules: string[];
  gates: string[];
  blockedActions: string[];
  linkedDocs: string[];
  reason: string;
  nextAction: string;
}

export const RUNTIME_AUDIT_STORE_CONTRACT_ITEMS: RuntimeAuditStoreContractItem[] = [
  {
    id: 'audit-event-schema-contract',
    label: 'Audit Event Schema Contract',
    kind: 'event_schema',
    risk: 'low',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: ['eventId', 'eventType', 'source', 'timestamp', 'actor', 'target', 'action', 'result', 'metadata'],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['write_audit_log', 'create_audit_store', 'store_event', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md'],
    reason: 'Audit event schema contract defines the standard audit event structure. No audit store, no event writing, no Stage C.',
    nextAction: 'Keep contract_only. Do not implement audit store without Stage C.',
  },
  {
    id: 'audit-retention-policy-contract',
    label: 'Audit Retention Policy Contract',
    kind: 'retention_policy',
    risk: 'low',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: ['class', 'duration', 'archiveAfter', 'deleteAfter', 'storageLocation', 'complianceRequirement'],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['apply_retention_policy', 'archive_audit', 'delete_audit', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md'],
    reason: 'Audit retention policy contract defines retention classes and durations. No retention policy application, no archive, no delete, no Stage C.',
    nextAction: 'Keep contract_only. Do not implement retention without Stage C.',
  },
  {
    id: 'audit-redaction-policy-contract',
    label: 'Audit Redaction Policy Contract',
    kind: 'redaction_policy',
    risk: 'medium',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: true,
    requiresRedaction: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    redactionRules: ['mask_token', 'mask_apiKey', 'mask_password', 'hash_secret', 'drop_privateKey', 'drop_credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_secret_storage'],
    blockedActions: ['store_redacted_event', 'access_secret_material', 'write_redacted_to_db', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md', 'AIP_EVIDENCE_SCHEMA_PREVIEW.md'],
    reason: 'Audit redaction policy contract defines how sensitive fields are redacted. No secret material access, no redacted storage, no Stage C.',
    nextAction: 'Keep contract_only. Do not implement redaction without Stage C.',
  },
  {
    id: 'audit-write-policy-blocked',
    label: 'Audit Write Policy Blocked',
    kind: 'write_policy',
    risk: 'critical',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: true,
    writesDb: true,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_audit_write'],
    blockedActions: ['write_audit_log', 'write_to_audit_store', 'persist_event', 'enable_stage_c'],
    linkedDocs: ['AIP_PERMISSION_MATRIX.md', 'AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md'],
    reason: 'Audit write is permanently blocked. No audit log may be written. Audit store requires Stage C which is permanently disabled.',
    nextAction: 'Keep blocked. Do not allow audit write without Stage C.',
  },
  {
    id: 'audit-query-policy-contract',
    label: 'Audit Query Policy Contract',
    kind: 'query_policy',
    risk: 'medium',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: ['mask_secret_fields_on_query'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['query_audit_store', 'export_audit_results', 'access_raw_audit', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md'],
    reason: 'Audit query policy contract defines query restrictions. No audit store query, no export, no raw access, no Stage C.',
    nextAction: 'Keep contract_only. Do not implement audit queries without Stage C.',
  },
  {
    id: 'audit-db-store-blocked',
    label: 'Audit DB Store Blocked',
    kind: 'blocked_store',
    risk: 'critical',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: true,
    writesDb: true,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_audit_write'],
    blockedActions: ['create_audit_db', 'write_audit_to_db', 'migrate_audit_schema', 'enable_stage_c'],
    linkedDocs: ['AIP_STAGE_C_FINAL_GATE_POLICY.md'],
    reason: 'Audit DB store is permanently blocked. No database-based audit store may be created. DB write is permanently disabled.',
    nextAction: 'Keep blocked. Do not create audit DB store without Stage C.',
  },
  {
    id: 'audit-file-store-blocked',
    label: 'Audit File Store Blocked',
    kind: 'blocked_store',
    risk: 'high',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: true,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['create_audit_file_store', 'write_audit_to_file', 'archive_audit_file', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md'],
    reason: 'Audit file store is blocked. No file-based audit store may be created. File audit requires Stage C.',
    nextAction: 'Keep blocked. Do not create audit file store without Stage C.',
  },
  {
    id: 'audit-secret-material-blocked',
    label: 'Audit Secret Material Blocked',
    kind: 'blocked_store',
    risk: 'critical',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: true,
    requiresRedaction: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    redactionRules: ['mask_before_store', 'drop_if_irreversible'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'no_secret_storage'],
    blockedActions: ['store_secret_in_audit', 'access_raw_secret', 'write_secret_to_log', 'enable_stage_c'],
    linkedDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md'],
    reason: 'Audit secret material is permanently blocked. No secret material may be stored in audit logs. Secret storage requires Stage C.',
    nextAction: 'Keep blocked. Do not store secret material in audit logs.',
  },
  {
    id: 'audit-token-field-blocked',
    label: 'Audit Token Field Blocked',
    kind: 'blocked_store',
    risk: 'critical',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: true,
    requiresRedaction: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: ['token'],
    redactionRules: ['mask_token_field'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['store_token_in_audit', 'log_token_value', 'enable_stage_c'],
    linkedDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md'],
    reason: 'Token fields are blocked from audit storage. No token values may appear in audit events.',
    nextAction: 'Keep blocked. Do not log token values.',
  },
  {
    id: 'audit-api-key-field-blocked',
    label: 'Audit API Key Field Blocked',
    kind: 'blocked_store',
    risk: 'critical',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: true,
    requiresRedaction: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: ['apiKey'],
    redactionRules: ['mask_api_key_field'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['store_api_key_in_audit', 'log_api_key_value', 'enable_stage_c'],
    linkedDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md'],
    reason: 'API key fields are blocked from audit storage. No API key values may appear in audit events.',
    nextAction: 'Keep blocked. Do not log API key values.',
  },
  {
    id: 'audit-password-field-blocked',
    label: 'Audit Password Field Blocked',
    kind: 'blocked_store',
    risk: 'critical',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: true,
    requiresRedaction: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: ['password'],
    redactionRules: ['mask_password_field'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['store_password_in_audit', 'log_password_value', 'enable_stage_c'],
    linkedDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md'],
    reason: 'Password fields are blocked from audit storage. No password values may appear in audit events.',
    nextAction: 'Keep blocked. Do not log password values.',
  },
  {
    id: 'audit-stage-c-required',
    label: 'Audit Stage C Required',
    kind: 'future_stage_c',
    risk: 'critical',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: true,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'stage_c_required'],
    blockedActions: ['enable_stage_c', 'create_audit_store', 'write_audit', 'override_stage_c', 'bypass_gate'],
    linkedDocs: ['AIP_STAGE_C_FINAL_GATE_POLICY.md'],
    reason: 'Audit store implementation requires Stage C. Stage C is permanently disabled. No audit store creation without Stage C.',
    nextAction: 'Keep contract_only. Do not implement audit store without Stage C.',
  },
  {
    id: 'audit-human-approval-required',
    label: 'Audit Human Approval Required',
    kind: 'write_policy',
    risk: 'high',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    eventFields: [],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled', 'human_approval_required'],
    blockedActions: ['create_audit_store', 'write_audit', 'apply_retention', 'approve', 'reject', 'enable_stage_c'],
    linkedDocs: ['AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md'],
    reason: 'Audit store creation and audit write require human approval. No auto-creation, no auto-write, no Stage C.',
    nextAction: 'Keep contract_only. Do not implement audit without human approval.',
  },
  {
    id: 'audit-evidence-link-contract',
    label: 'Audit Evidence Link Contract',
    kind: 'event_schema',
    risk: 'medium',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: ['eventId', 'evidenceId', 'evidenceType', 'evidenceHash', 'linkTimestamp'],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['link_evidence_to_audit', 'store_evidence_link', 'verify_evidence_hash', 'enable_stage_c'],
    linkedDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md'],
    reason: 'Audit evidence link contract defines how audit events link to evidence. No evidence linking, no hash verification, no Stage C.',
    nextAction: 'Keep contract_only. Do not implement evidence linking without Stage C.',
  },
  {
    id: 'audit-rollback-link-contract',
    label: 'Audit Rollback Link Contract',
    kind: 'event_schema',
    risk: 'medium',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: ['eventId', 'rollbackId', 'rollbackStrategy', 'rollbackTimestamp', 'rollbackResult'],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['link_rollback_to_audit', 'store_rollback_link', 'execute_rollback', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_ROLLBACK_IDEMPOTENCY_SPEC.md'],
    reason: 'Audit rollback link contract defines how audit events link to rollback operations. No rollback linking, no rollback execution, no Stage C.',
    nextAction: 'Keep contract_only. Do not implement rollback linking without Stage C.',
  },
  {
    id: 'audit-final-seal-requirement',
    label: 'Audit Final Seal Requirement',
    kind: 'event_schema',
    risk: 'low',
    allowedNow: true,
    contractOnly: true,
    writesAuditStore: false,
    writesDb: false,
    readsSecretMaterial: false,
    requiresRedaction: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    eventFields: ['sealVersion', 'sealDate', 'blockingChecks', 'verdict', 'auditor'],
    retentionFields: [],
    forbiddenFields: [],
    redactionRules: [],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['create_tag', 'create_release', 'finalize_seal', 'enable_stage_c'],
    linkedDocs: ['AIP_VERSION_SEAL_HANDBOOK.md', 'AIP_VALIDATION_AND_SEAL_PROCESS.md'],
    reason: 'Audit final seal requirement defines seal event structure. No tag creation, no release, no seal finalization without human approval.',
    nextAction: 'Keep contract_only. Do not finalize seal without human approval.',
  },
];

export function getRuntimeAuditStoreContractItems(): RuntimeAuditStoreContractItem[] {
  return RUNTIME_AUDIT_STORE_CONTRACT_ITEMS;
}

export function getRuntimeAuditStoreContractSummary(): {
  total: number;
  byKind: Record<string, number>;
  byRisk: Record<string, number>;
  blocked: number;
  writesAuditStore: number;
  writesDb: number;
  readsSecretMaterial: number;
  requiresStageC: number;
} {
  const all = RUNTIME_AUDIT_STORE_CONTRACT_ITEMS;
  const byKind: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  for (const item of all) {
    byKind[item.kind] = (byKind[item.kind] || 0) + 1;
    byRisk[item.risk] = (byRisk[item.risk] || 0) + 1;
  }
  return {
    total: all.length,
    byKind,
    byRisk,
    blocked: all.filter(i => !i.allowedNow).length,
    writesAuditStore: all.filter(i => i.writesAuditStore).length,
    writesDb: all.filter(i => i.writesDb).length,
    readsSecretMaterial: all.filter(i => i.readsSecretMaterial).length,
    requiresStageC: all.filter(i => i.requiresStageC).length,
  };
}

export function getRuntimeAuditStoreItemsByKind(kind: AuditStoreContractKind): RuntimeAuditStoreContractItem[] {
  return RUNTIME_AUDIT_STORE_CONTRACT_ITEMS.filter(i => i.kind === kind);
}

export function getRuntimeAuditStoreItemsByRisk(risk: AuditStoreRisk): RuntimeAuditStoreContractItem[] {
  return RUNTIME_AUDIT_STORE_CONTRACT_ITEMS.filter(i => i.risk === risk);
}

export function getRuntimeAuditStoreBlockedItems(): RuntimeAuditStoreContractItem[] {
  return RUNTIME_AUDIT_STORE_CONTRACT_ITEMS.filter(i => !i.allowedNow || i.writesAuditStore || i.writesDb || i.readsSecretMaterial || i.requiresStageC);
}
