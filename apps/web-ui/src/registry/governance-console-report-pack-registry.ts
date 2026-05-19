export type ConsoleReportSection =
  | 'executive_summary'
  | 'registry_chain'
  | 'risk_dashboard'
  | 'decision_panel'
  | 'evidence_trace'
  | 'audit_trace'
  | 'rollback_readiness'
  | 'validation_results'
  | 'sidebar_boundary'
  | 'stage_c_readiness'
  | 'next_steps';

export type ConsoleReportStatus = 'preview_ready' | 'requires_review' | 'blocked' | 'future_stage_c';

export interface GovernanceConsoleReportPackItem {
  id: string;
  label: string;
  section: ConsoleReportSection;
  status: ConsoleReportStatus;
  allowedNow: boolean;
  generatesFile: boolean;
  writesDb: boolean;
  includesSecrets: boolean;
  requiresRedaction: boolean;
  requiresHumanReview: boolean;
  sourceRegistries: string[];
  sourceRoutes: string[];
  sourceDocs: string[];
  fields: string[];
  forbiddenFields: string[];
  gates: string[];
  blockedActions: string[];
  reason: string;
  nextAction: string;
}

const REPORT_ITEMS: GovernanceConsoleReportPackItem[] = [
  {
    id: 'executive-summary-preview',
    label: 'Executive Summary',
    section: 'executive_summary',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['governance-console-registry', 'governance-console-risk-registry', 'governance-console-decision-registry'],
    sourceRoutes: ['/governance-console-preview'],
    sourceDocs: ['AIP_GOVERNANCE_CONSOLE_AGGREGATOR_PREVIEW.md'],
    fields: ['phase', 'status', 'total_items', 'blocked', 'high_critical', 'stage_c_status'],
    forbiddenFields: [],
    gates: ['readonly_only'],
    blockedActions: ['export_file', 'write_database'],
    reason: 'Executive summary is preview-ready. No secrets or DB writes.',
    nextAction: 'Keep as preview. Do not generate real summary files.',
  },
  {
    id: 'registry-chain-summary-preview',
    label: 'Registry Chain Summary',
    section: 'registry_chain',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['governance-console-registry', 'permission-evaluator-registry', 'runtime-registry', 'dry-run-plan-registry', 'audit-log-registry', 'governance-state-registry', 'human-approval-registry', 'evidence-schema-registry', 'rollback-registry', 'navigation-exposure-registry', 'center-access-registry'],
    sourceRoutes: ['/governance-console-preview'],
    sourceDocs: ['AIP_GOVERNANCE_CONSOLE_REGISTRY_MAP.md'],
    fields: ['registry_id', 'label', 'domain', 'risk', 'readiness', 'exposure', 'in_sidebar', 'preview_route'],
    forbiddenFields: [],
    gates: ['readonly_only'],
    blockedActions: ['export_file', 'write_database'],
    reason: 'Registry chain summary is preview-ready. All data is static registry data.',
    nextAction: 'Keep as preview. Do not generate real registry chain files.',
  },
  {
    id: 'risk-dashboard-summary-preview',
    label: 'Risk Dashboard Summary',
    section: 'risk_dashboard',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['governance-console-risk-registry'],
    sourceRoutes: ['/governance-console-risk-dashboard-preview'],
    sourceDocs: ['AIP_GOVERNANCE_CONSOLE_RISK_DASHBOARD_PREVIEW.md'],
    fields: ['risk_id', 'label', 'source', 'category', 'severity', 'blocked', 'requires_stage_c', 'requires_db_write', 'requires_external_control'],
    forbiddenFields: [],
    gates: ['readonly_only'],
    blockedActions: ['export_file', 'write_database', 'execute_gate'],
    reason: 'Risk dashboard summary is preview-ready. No risk execution.',
    nextAction: 'Keep as preview. Do not implement risk gate execution.',
  },
  {
    id: 'decision-panel-summary-preview',
    label: 'Decision Panel Summary',
    section: 'decision_panel',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['governance-console-decision-registry'],
    sourceRoutes: ['/governance-console-decision-panel-preview'],
    sourceDocs: ['AIP_GOVERNANCE_CONSOLE_DECISION_PANEL_PREVIEW.md'],
    fields: ['decision_id', 'label', 'type', 'risk', 'recommended_now', 'allowed_now', 'decision_rationale'],
    forbiddenFields: [],
    gates: ['readonly_only'],
    blockedActions: ['approve', 'reject', 'execute', 'apply'],
    reason: 'Decision panel summary is preview-ready. No decision execution.',
    nextAction: 'Keep as preview. Do not implement decision execution.',
  },
  {
    id: 'evidence-trace-preview',
    label: 'Evidence Trace',
    section: 'evidence_trace',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['evidence-schema-registry', 'rollback-registry', 'human-approval-registry'],
    sourceRoutes: ['/evidence-schema-preview'],
    sourceDocs: ['AIP_EVIDENCE_SCHEMA_PREVIEW.md'],
    fields: ['evidence_type', 'source', 'sensitivity', 'retention', 'redaction_required', 'linked_items'],
    forbiddenFields: [],
    gates: ['readonly_only', 'no_evidence_capture'],
    blockedActions: ['capture_evidence', 'store_evidence', 'write_database'],
    reason: 'Evidence trace is preview-ready. No evidence capture or storage.',
    nextAction: 'Keep as preview. Do not implement evidence store.',
  },
  {
    id: 'audit-trace-preview',
    label: 'Audit Trace',
    section: 'audit_trace',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['audit-log-registry'],
    sourceRoutes: ['/audit-log-preview'],
    sourceDocs: [],
    fields: ['event_type', 'source', 'severity', 'timestamp_format', 'retention'],
    forbiddenFields: [],
    gates: ['readonly_only', 'no_audit_write'],
    blockedActions: ['write_audit_log', 'write_database'],
    reason: 'Audit trace is preview-ready. No audit log writer.',
    nextAction: 'Keep as preview. Do not implement audit logger.',
  },
  {
    id: 'rollback-readiness-preview',
    label: 'Rollback Readiness',
    section: 'rollback_readiness',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['rollback-registry'],
    sourceRoutes: ['/rollback-preview'],
    sourceDocs: ['AIP_ROLLBACK_PREVIEW.md'],
    fields: ['target', 'rollback_type', 'risk', 'allowed_now', 'preconditions', 'evidence_required', 'rollback_steps_preview'],
    forbiddenFields: [],
    gates: ['readonly_only', 'no_rollback_execution'],
    blockedActions: ['execute_rollback', 'restore_file', 'git_reset', 'git_revert'],
    reason: 'Rollback readiness is preview-ready. No rollback executor.',
    nextAction: 'Keep as preview. Do not implement rollback executor.',
  },
  {
    id: 'validation-results-preview',
    label: 'Validation Results',
    section: 'validation_results',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['governance-console-validator', 'governance-console-risk-validator', 'governance-console-decision-validator', 'governance-console-report-pack-validator'],
    sourceRoutes: ['/governance-console-preview', '/governance-console-risk-dashboard-preview', '/governance-console-decision-panel-preview', '/governance-console-report-pack-preview'],
    sourceDocs: [],
    fields: ['validator_name', 'blocking', 'warning', 'info', 'pass'],
    forbiddenFields: [],
    gates: ['readonly_only'],
    blockedActions: [],
    reason: 'Validation results are preview-ready. All validators pass.',
    nextAction: 'Keep as preview. Re-run validators when registries change.',
  },
  {
    id: 'sidebar-boundary-preview',
    label: 'Sidebar Boundary',
    section: 'sidebar_boundary',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['navigation-exposure-registry', 'center-access-registry'],
    sourceRoutes: [],
    sourceDocs: [],
    fields: ['entry_name', 'visible_in_sidebar', 'exposure', 'risk'],
    forbiddenFields: [],
    gates: ['readonly_only'],
    blockedActions: ['modify_sidebar', 'change_exposure'],
    reason: 'Sidebar boundary is preview-ready. No sidebar modification.',
    nextAction: 'Keep as preview. Do not modify sidebar configuration.',
  },
  {
    id: 'stage-c-readiness-preview',
    label: 'Stage C Readiness',
    section: 'stage_c_readiness',
    status: 'blocked',
    allowedNow: false,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: true,
    sourceRegistries: ['governance-state-registry', 'rollback-registry', 'permission-evaluator-registry'],
    sourceRoutes: [],
    sourceDocs: ['AIP_STAGE_C_READINESS_CHECKLIST.md'],
    fields: ['item', 'requires_stage_c', 'status', 'blocked_reason'],
    forbiddenFields: [],
    gates: ['stage_c_disabled', 'hold_for_human_review'],
    blockedActions: ['enable_stage_c', 'transition_stage', 'write_database', 'control_external'],
    reason: 'Stage C readiness is blocked. Stage C is permanently disabled.',
    nextAction: 'Keep Stage C readiness blocked. Do not include in report pack.',
  },
  {
    id: 'runtime-readiness-preview',
    label: 'Runtime Readiness',
    section: 'next_steps',
    status: 'future_stage_c',
    allowedNow: false,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: true,
    sourceRegistries: ['runtime-registry'],
    sourceRoutes: ['/runtime-registry-preview'],
    sourceDocs: ['AIP_RUNTIME_IMPLEMENTATION_READINESS_AUDIT.md'],
    fields: ['capability', 'can_implement_now', 'requires_stage_c', 'requires_human_approval'],
    forbiddenFields: [],
    gates: ['stage_c_disabled', 'hold_for_human_review'],
    blockedActions: ['implement_runtime', 'enable_stage_c', 'write_database'],
    reason: 'Runtime readiness is future Stage C only. 13 of 14 capabilities blocked.',
    nextAction: 'Keep as future consideration. Do not implement runtime.',
  },
  {
    id: 'next-steps-preview',
    label: 'Next Steps',
    section: 'next_steps',
    status: 'preview_ready',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['governance-console-decision-registry'],
    sourceRoutes: ['/governance-console-decision-panel-preview'],
    sourceDocs: ['AIP_V7_29_ROADMAP.md'],
    fields: ['decision_id', 'label', 'recommended_now', 'next_action'],
    forbiddenFields: [],
    gates: ['readonly_only'],
    blockedActions: ['execute_decision', 'apply_decision'],
    reason: 'Next steps are preview-ready. No decision execution.',
    nextAction: 'Keep as preview. Follow recommended next actions.',
  },
  {
    id: 'secret-redaction-required',
    label: 'Secret Redaction Required',
    section: 'registry_chain',
    status: 'requires_review',
    allowedNow: true,
    generatesFile: false,
    writesDb: false,
    includesSecrets: false,
    requiresRedaction: true,
    requiresHumanReview: true,
    sourceRegistries: ['evidence-schema-registry'],
    sourceRoutes: ['/evidence-schema-preview'],
    sourceDocs: [],
    fields: ['evidence_type', 'sensitivity', 'redaction_policy', 'forbidden_fields'],
    forbiddenFields: ['token', 'api_key', 'password', 'private_key', 'credential', 'secret'],
    gates: ['readonly_only', 'redaction_required'],
    blockedActions: ['export_file', 'store_report', 'write_database'],
    reason: 'Secret redaction is required if report is exported. Token, API key, password fields must never be included.',
    nextAction: 'Keep redaction requirement. Do not export without redaction.',
  },
  {
    id: 'db-write-report-store-blocked',
    label: 'DB Write Report Store Blocked',
    section: 'validation_results',
    status: 'blocked',
    allowedNow: false,
    generatesFile: false,
    writesDb: true,
    includesSecrets: false,
    requiresRedaction: false,
    requiresHumanReview: false,
    sourceRegistries: ['governance-console-registry'],
    sourceRoutes: [],
    sourceDocs: [],
    fields: [],
    forbiddenFields: [],
    gates: ['readonly_only', 'no_report_store'],
    blockedActions: ['write_database', 'store_report', 'export_file'],
    reason: 'DB write report store is blocked. No DB schema or write service.',
    nextAction: 'Keep DB write report store blocked. Do not implement report storage.',
  },
];

export function getGovernanceConsoleReportPackItems(): GovernanceConsoleReportPackItem[] {
  return REPORT_ITEMS;
}

export function getGovernanceConsoleReportPackSummary() {
  const items = REPORT_ITEMS;
  return {
    total: items.length,
    previewReady: items.filter(i => i.status === 'preview_ready').length,
    blocked: items.filter(i => i.status === 'blocked').length,
    generatesFile: items.filter(i => i.generatesFile).length,
    writesDb: items.filter(i => i.writesDb).length,
    includesSecrets: items.filter(i => i.includesSecrets).length,
    requiresRedaction: items.filter(i => i.requiresRedaction).length,
    requiresHumanReview: items.filter(i => i.requiresHumanReview).length,
  };
}

export function getGovernanceConsoleReportItemsBySection(section: ConsoleReportSection): GovernanceConsoleReportPackItem[] {
  return REPORT_ITEMS.filter(i => i.section === section);
}

export function getGovernanceConsoleReportItemsByStatus(status: ConsoleReportStatus): GovernanceConsoleReportPackItem[] {
  return REPORT_ITEMS.filter(i => i.status === status);
}

export function getBlockedGovernanceConsoleReportItems(): GovernanceConsoleReportPackItem[] {
  return REPORT_ITEMS.filter(i => i.status === 'blocked' || !i.allowedNow);
}
