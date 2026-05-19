// Operator Console Registry — static readonly registry for Operator Console modules
// Does not execute API calls, modify state, write to databases, or control external tools.

export type OperatorConsoleDomain =
  | 'system'
  | 'runtime'
  | 'governance'
  | 'approval'
  | 'permission'
  | 'evidence'
  | 'audit'
  | 'rollback'
  | 'risk'
  | 'boundary'
  | 'operator'
  | 'docs';

export type OperatorConsoleStatus =
  | 'sealed'
  | 'ready'
  | 'degraded'
  | 'deferred'
  | 'blocked'
  | 'unknown'
  | 'not_applicable';

export type OperatorConsoleRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface OperatorConsoleRegistryItem {
  id: string;
  title: string;
  domain: OperatorConsoleDomain;
  status: OperatorConsoleStatus;
  readonly: true;
  allowedNow: boolean;
  actionAllowed: false;
  mutationAllowed: false;
  stageCRequired: boolean;
  riskLevel: OperatorConsoleRiskLevel;
  evidenceSource: string;
  linkedPreviewRoute?: string;
  linkedDoc?: string;
  summary: string;
  operatorNextStep: string;
  forbiddenAction: string;
}

export const OPERATOR_CONSOLE_REGISTRY: OperatorConsoleRegistryItem[] = [
  // ── System ──
  {
    id: 'system-overview',
    title: 'System Overview',
    domain: 'system',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'GET /api/health',
    summary: 'System health, uptime, version, database status, worker pool state.',
    operatorNextStep: 'View system status. No action required.',
    forbiddenAction: 'Do not restart, modify config, or change state from this panel.',
    linkedDoc: 'AIP_READONLY_RUNTIME_API_OPERATOR_GUIDE.md',
  },
  // ── Runtime ──
  {
    id: 'runtime-status',
    title: 'Runtime Status',
    domain: 'runtime',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'GET /api/runtime/status',
    summary: 'Readonly skeleton mode, contract version, runtime implementation status.',
    operatorNextStep: 'Verify runtime is in readonly_skeleton mode.',
    forbiddenAction: 'Do not execute runtime, write DB, or enable Stage C from this panel.',
    linkedPreviewRoute: '/runtime-readonly-status-api-preview',
  },
  {
    id: 'readonly-api-status',
    title: 'Readonly API Status',
    domain: 'runtime',
    status: 'sealed',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'GET /api/runtime/readiness, GET /api/runtime/gates, GET /api/runtime/blockers',
    summary: '4 GET readonly endpoints sealed at v7.31.0-P1. All POST blocked.',
    operatorNextStep: 'Confirm all GET endpoints return 200, all POST return 401.',
    forbiddenAction: 'Do not add POST endpoints or bypass auth blocking.',
  },
  {
    id: 'smoke-evidence',
    title: 'Smoke Evidence',
    domain: 'runtime',
    status: 'sealed',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'P1 live smoke report, P2 seal recheck report',
    summary: 'Latest live smoke: GET PASS (4/4), POST blocked (4/4). Stale server 401 resolved.',
    operatorNextStep: 'Review latest smoke report before phase transitions.',
    forbiddenAction: 'Do not skip smoke before phase transitions.',
    linkedDoc: 'AIP_V7_32_P1_CONTROLLED_LIVE_SMOKE_REPORT.md',
  },
  // ── Governance ──
  {
    id: 'governance-readiness',
    title: 'Governance Readiness',
    domain: 'governance',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'medium',
    evidenceSource: 'Governance console registries, state machine preview, decision panel preview',
    summary: 'Governance gates, state machine, decision panel, report pack, risk dashboard.',
    operatorNextStep: 'Review governance readiness. No governance mutations are possible.',
    forbiddenAction: 'Do not approve, reject, or process governance candidates from this panel.',
    linkedPreviewRoute: '/governance-console-preview',
  },
  // ── Approval ──
  {
    id: 'human-approval-readiness',
    title: 'Human Approval Readiness',
    domain: 'approval',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'medium',
    evidenceSource: 'Human approval workflow registry, approval queue state',
    summary: 'Approval workflow spec, pending approvals state (readonly).',
    operatorNextStep: 'Review pending approvals. Do not approve/reject from this panel.',
    forbiddenAction: 'Do not approve, reject, or process approval candidates.',
    linkedPreviewRoute: '/human-approval-workflow-preview',
  },
  // ── Permission ──
  {
    id: 'permission-evaluator-readiness',
    title: 'Permission Evaluator Readiness',
    domain: 'permission',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'medium',
    evidenceSource: 'Permission evaluator registry, permission matrix',
    summary: 'Permission evaluation model, gate model, connector permission model.',
    operatorNextStep: 'Review permission model. No permission changes are possible.',
    forbiddenAction: 'Do not modify permissions, bypass gates, or elevate access.',
    linkedPreviewRoute: '/permission-evaluator-preview',
  },
  // ── Evidence ──
  {
    id: 'evidence-schema-readiness',
    title: 'Evidence Schema Readiness',
    domain: 'evidence',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'Evidence schema registry, evidence schema preview spec',
    summary: 'Evidence schema design, no evidence capture implemented.',
    operatorNextStep: 'Review evidence schema. No evidence collection can be triggered.',
    forbiddenAction: 'Do not capture, store, or upload evidence from this panel.',
    linkedPreviewRoute: '/evidence-schema-preview',
  },
  // ── Audit ──
  {
    id: 'audit-readiness',
    title: 'Audit Readiness',
    domain: 'audit',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'Audit store contract registry, audit log preview',
    summary: 'Audit store contract, no audit write implemented.',
    operatorNextStep: 'Review audit contract. No audit write can be triggered.',
    forbiddenAction: 'Do not write audit logs, modify audit store, or bypass audit.',
    linkedPreviewRoute: '/audit-log-preview',
  },
  // ── Rollback / Recovery ──
  {
    id: 'rollback-recovery-readiness',
    title: 'Rollback / Recovery Readiness',
    domain: 'rollback',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'medium',
    evidenceSource: 'Rollback registry, rollback/recovery guide, rollback preview',
    summary: 'Rollback plan, rollback idempotency spec, recovery guide.',
    operatorNextStep: 'Review rollback/recovery docs. Do not execute rollback from this panel.',
    forbiddenAction: 'Do not execute rollback, restore files, or mutate git state.',
    linkedPreviewRoute: '/rollback-preview',
    linkedDoc: 'AIP_READONLY_RUNTIME_API_ROLLBACK_AND_RECOVERY_GUIDE.md',
  },
  // ── Risk / Blocker ──
  {
    id: 'risk-blocker-matrix',
    title: 'Risk / Blocker Matrix',
    domain: 'risk',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'high',
    evidenceSource: 'GET /api/runtime/blockers, risk model docs, implementation blocker matrix',
    summary: '4 critical/high blockers: Stage C disabled, DB write blocked, external control blocked, POST blocked.',
    operatorNextStep: 'Review blockers. All blockers are intentional and permanent.',
    forbiddenAction: 'Do not bypass, override, or disable blockers.',
  },
  // ── Boundary: Stage C ──
  {
    id: 'stage-c-boundary',
    title: 'Stage C Boundary',
    domain: 'boundary',
    status: 'blocked',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: true,
    riskLevel: 'critical',
    evidenceSource: 'Stage C policy, GET /api/runtime/status (stageCEnabled=false)',
    summary: 'Stage C is permanently disabled. No enablement is possible in current architecture.',
    operatorNextStep: 'Acknowledge Stage C is disabled. Do not attempt to enable.',
    forbiddenAction: 'Do not enable Stage C, bypass Stage C gate, or implement Stage C executor.',
    linkedPreviewRoute: '/stage-c-preenable-review-preview',
    linkedDoc: 'AIP_STAGE_C_FINAL_GATE_POLICY.md',
  },
  // ── Boundary: POST Runtime ──
  {
    id: 'post-runtime-boundary',
    title: 'POST Runtime Boundary',
    domain: 'boundary',
    status: 'blocked',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'critical',
    evidenceSource: 'Runtime registry, GET /api/runtime/status (postEndpointsEnabled=false)',
    summary: 'All POST runtime endpoints are blocked. No POST route handlers exist.',
    operatorNextStep: 'Confirm POST blocked via smoke. Do not implement POST handlers.',
    forbiddenAction: 'Do not add POST route handlers, bypass auth blocking, or implement POST executors.',
  },
  // ── Boundary: DB Write ──
  {
    id: 'db-write-boundary',
    title: 'DB Write Boundary',
    domain: 'boundary',
    status: 'blocked',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'critical',
    evidenceSource: 'Runtime registry, GET /api/runtime/status (dbWriteEnabled=false)',
    summary: 'No DB write code exists in runtime module. All writes are blocked.',
    operatorNextStep: 'Confirm DB write disabled. Do not add DB write paths.',
    forbiddenAction: 'Do not write to database from runtime module.',
  },
  // ── Boundary: External Control ──
  {
    id: 'external-control-boundary',
    title: 'External Control Boundary',
    domain: 'boundary',
    status: 'blocked',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'critical',
    evidenceSource: 'Runtime registry, GET /api/runtime/status (externalControlEnabled=false)',
    summary: 'No external control code exists. All external control is blocked.',
    operatorNextStep: 'Confirm external control disabled. Do not add external control paths.',
    forbiddenAction: 'Do not control external tools, call external APIs, or implement connectors.',
  },
  // ── Boundary: Executor ──
  {
    id: 'executor-boundary',
    title: 'Executor Boundary',
    domain: 'boundary',
    status: 'blocked',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'critical',
    evidenceSource: 'Code audit, runtime module search',
    summary: 'No runtime executor code exists. All execution is blocked.',
    operatorNextStep: 'Confirm executor absent. Do not create executor paths.',
    forbiddenAction: 'Do not implement runtime executor, spawn processes, or trigger actions.',
  },
  // ── Operator ──
  {
    id: 'operator-checklist',
    title: 'Operator Checklist',
    domain: 'operator',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'Operator console workflow, operator guide',
    summary: 'Readonly checklist for operator decision support. No action execution.',
    operatorNextStep: 'Review checklist items. Execute items manually outside this console.',
    forbiddenAction: 'Do not auto-execute checklist items from this panel.',
    linkedDoc: 'AIP_OPERATOR_CONSOLE_READONLY_WORKFLOW.md',
  },
  // ── Docs / Reports / Receipts ──
  {
    id: 'docs-reports-receipts',
    title: 'Docs / Reports / Receipts',
    domain: 'docs',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'docs/product/, E:\\_AIP_REPORTS\\, E:\\_AIP_RECEIPTS\\',
    summary: 'Complete product documentation, phase reports, and seal receipts.',
    operatorNextStep: 'Browse relevant docs before phase transitions.',
    forbiddenAction: 'Do not modify docs from this panel.',
  },
  // ── Latest Seal Baseline ──
  {
    id: 'latest-seal-baseline',
    title: 'Latest Seal Baseline',
    domain: 'docs',
    status: 'sealed',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'low',
    evidenceSource: 'AIP_V7_32_FINAL_PRODUCTIZATION_BASELINE.md',
    summary: 'V7_32_PRODUCTIZATION_SEAL_READY. All safety fields confirmed disabled.',
    operatorNextStep: 'Reference seal baseline for current architecture invariants.',
    forbiddenAction: 'Do not skip seal recheck for phase transitions.',
    linkedDoc: 'AIP_V7_32_FINAL_PRODUCTIZATION_BASELINE.md',
  },
  // ── Version Drift / Git State ──
  {
    id: 'version-drift-git-state',
    title: 'Version Drift / Git State',
    domain: 'docs',
    status: 'ready',
    readonly: true,
    allowedNow: true,
    actionAllowed: false,
    mutationAllowed: false,
    stageCRequired: false,
    riskLevel: 'medium',
    evidenceSource: 'git status, git log, origin/main sync check',
    summary: 'Working tree should be clean, branch on main, synced with origin/main.',
    operatorNextStep: 'Check git status before phase transitions. Commit and push before seal.',
    forbiddenAction: 'Do not commit dirty state, bypass git checks, or force push.',
  },
];

export function getOperatorConsoleRegistry(): OperatorConsoleRegistryItem[] {
  return OPERATOR_CONSOLE_REGISTRY;
}

export function getOperatorConsoleByDomain(domain: OperatorConsoleDomain): OperatorConsoleRegistryItem[] {
  return OPERATOR_CONSOLE_REGISTRY.filter(item => item.domain === domain);
}

export function getOperatorConsoleByStatus(status: OperatorConsoleStatus): OperatorConsoleRegistryItem[] {
  return OPERATOR_CONSOLE_REGISTRY.filter(item => item.status === status);
}

export function getOperatorConsoleSummary(): {
  total: number;
  byDomain: Record<OperatorConsoleDomain, number>;
  byStatus: Record<OperatorConsoleStatus, number>;
  highOrCritical: number;
  stageCRequired: number;
  allowedNow: number;
  blocked: number;
  sealed: number;
} {
  const items = OPERATOR_CONSOLE_REGISTRY;
  const byDomain = {} as Record<OperatorConsoleDomain, number>;
  const byStatus = {} as Record<OperatorConsoleStatus, number>;
  for (const item of items) {
    byDomain[item.domain] = (byDomain[item.domain] || 0) + 1;
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
  }
  return {
    total: items.length,
    byDomain,
    byStatus,
    highOrCritical: items.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length,
    stageCRequired: items.filter(i => i.stageCRequired).length,
    allowedNow: items.filter(i => i.allowedNow).length,
    blocked: items.filter(i => !i.allowedNow).length,
    sealed: items.filter(i => i.status === 'sealed').length,
  };
}
