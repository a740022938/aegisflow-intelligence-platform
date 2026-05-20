// Operator Runtime Safety Boundary Registry — static readonly safety boundary matrix
// Does not execute API calls, modify state, write to databases, or control external tools.

export type SafetyBoundaryItemStatus = 'blocked' | 'disabled' | 'absent' | 'plan_only' | 'readonly' | 'clean' | 'not_triggered' | 'non_executable';

export interface OperatorRuntimeSafetyBoundaryItem {
  id: string;
  title: string;
  status: SafetyBoundaryItemStatus;
  source: string;
  evidence: string;
  allowedNow: boolean;
  requiresHumanApproval: boolean;
  category: string;
  summary: string;
  operatorNextStep: string;
  forbiddenAction: string;
}

export const OPERATOR_RUNTIME_SAFETY_BOUNDARY_REGISTRY: OperatorRuntimeSafetyBoundaryItem[] = [
  {
    id: 'stage-c-enabled',
    title: 'Stage C Enabled',
    status: 'disabled',
    source: 'GET /api/stage-c/status',
    evidence: 'stageCEnabled: false, canEnableStageC: false',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'stage_c',
    summary: 'Stage C is DISABLED. Cannot be enabled from API or UI.',
    operatorNextStep: 'Stage C requires human owner authorization before any enablement planning.',
    forbiddenAction: 'Do not enable Stage C. Do not set stageCEnabled=true.',
  },
  {
    id: 'feature-flag-state',
    title: 'Feature Flag State',
    status: 'disabled',
    source: 'GET /api/stage-c/status',
    evidence: 'featureFlag.currentState: off, mutableFromUi: false',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'stage_c',
    summary: 'Feature flag is OFF and NOT mutable from UI.',
    operatorNextStep: 'Flag toggling requires human-approved plan with rollback.',
    forbiddenAction: 'Do not toggle feature flag. Do not set mutableFromUi=true.',
  },
  {
    id: 'post-runtime-blocked',
    title: 'POST Runtime Blocked',
    status: 'blocked',
    source: 'GET /api/stage-c/status, POST test',
    evidence: 'safetyBoundary.postRuntimeAllowed: false, POST /api/stage-c/status returns 404',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'runtime',
    summary: 'POST runtime endpoints are BLOCKED. No POST/PUT/PATCH/DELETE allowed.',
    operatorNextStep: 'Verify POST blocked before any phase transition.',
    forbiddenAction: 'Do not add POST endpoints. Do not enable runtime execution.',
  },
  {
    id: 'db-write-blocked',
    title: 'DB Write Blocked',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.dbWriteAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'runtime',
    summary: 'Database write operations are BLOCKED.',
    operatorNextStep: 'Verify DB write blocked before any phase transition.',
    forbiddenAction: 'Do not enable DB write. Do not add write operations.',
  },
  {
    id: 'executor-absent',
    title: 'Executor Absent',
    status: 'absent',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.executorAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'runtime',
    summary: 'Runtime executor is ABSENT. No execution capability.',
    operatorNextStep: 'Verify executor absent before any phase transition.',
    forbiddenAction: 'Do not add executor. Do not enable runtime execution.',
  },
  {
    id: 'external-control-blocked',
    title: 'External Control Blocked',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.externalControlAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'runtime',
    summary: 'External tool control is BLOCKED.',
    operatorNextStep: 'Verify external control blocked before any phase transition.',
    forbiddenAction: 'Do not enable external control.',
  },
  {
    id: 'connector-action-blocked',
    title: 'Connector Action Blocked',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.connectorActionAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'runtime',
    summary: 'Connector actions are BLOCKED.',
    operatorNextStep: 'Verify connector action blocked before any phase transition.',
    forbiddenAction: 'Do not enable connector actions.',
  },
  {
    id: 'kill-switch-state',
    title: 'Kill Switch State',
    status: 'non_executable',
    source: 'GET /api/stage-c/status',
    evidence: 'killSwitch.available: true, executableFromUi: false, state: not_triggered',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'stage_c',
    summary: 'Kill switch available but NOT executable from UI. Not triggered.',
    operatorNextStep: 'Verify kill switch remains non-executable.',
    forbiddenAction: 'Do not make kill switch executable from UI. Do not trigger kill switch.',
  },
  {
    id: 'repair-plan-only',
    title: 'Repair Plan-only',
    status: 'plan_only',
    source: 'aip repair, aip repair plan',
    evidence: 'v7.41 P3 — repair outputs only plans, no file modification',
    allowedNow: true,
    requiresHumanApproval: false,
    category: 'operator',
    summary: 'Repair system outputs plans only. No file modification occurs.',
    operatorNextStep: 'Use aip repair plan for repair planning.',
    forbiddenAction: 'Do not execute repair without plan review.',
  },
  {
    id: 'memory-preview-readonly',
    title: 'Memory Preview Readonly',
    status: 'readonly',
    source: 'AipMemoryKnowledgePreview, aip-memory-knowledge-registry.ts',
    evidence: 'v7.41 P4 — memory registry is readonly, no runtime mutation',
    allowedNow: true,
    requiresHumanApproval: false,
    category: 'memory',
    summary: 'Memory knowledge preview is readonly. No runtime memory mutation.',
    operatorNextStep: 'Review memory baseline through preview.',
    forbiddenAction: 'Do not mutate runtime memory from preview.',
  },
  {
    id: 'sidebar-exposure-clean',
    title: 'Hidden Preview Not in Sidebar',
    status: 'clean',
    source: 'Navigation exposure registry, center access registry',
    evidence: 'All hidden routes have visibleInSidebar=false, sidebarState=hidden_direct',
    allowedNow: true,
    requiresHumanApproval: false,
    category: 'navigation',
    summary: 'No hidden preview pages are exposed in sidebar.',
    operatorNextStep: 'Audit sidebar exposure on each new hidden preview.',
    forbiddenAction: 'Do not expose hidden preview pages in sidebar.',
  },
  {
    id: 'working-tree-state',
    title: 'Working Tree State',
    status: 'clean',
    source: 'git status --short',
    evidence: 'Working tree clean at HEAD 8a58408',
    allowedNow: true,
    requiresHumanApproval: false,
    category: 'system',
    summary: 'Git working tree is clean.',
    operatorNextStep: 'Keep working tree clean before any commit.',
    forbiddenAction: 'Do not commit with dirty working tree.',
  },
  {
    id: 'last-verified-commit',
    title: 'Last Verified Commit',
    status: 'clean',
    source: 'git rev-parse HEAD',
    evidence: 'HEAD at 8a58408 (v7.42 P2)',
    allowedNow: true,
    requiresHumanApproval: false,
    category: 'system',
    summary: 'Last verified commit: 8a58408 on main branch.',
    operatorNextStep: 'Update verified commit after each phase.',
    forbiddenAction: 'Do not proceed without verifying current HEAD.',
  },
  {
    id: 'audit-persistent-write',
    title: 'Audit Persistent Write',
    status: 'disabled',
    source: 'GET /api/stage-c/status',
    evidence: 'audit.persistentWriteEnabled: false, externalUploadEnabled: false',
    allowedNow: false,
    requiresHumanApproval: true,
    category: 'audit',
    summary: 'Audit persistent write is disabled. No audit data written.',
    operatorNextStep: 'Verify audit write remains disabled.',
    forbiddenAction: 'Do not enable audit persistent write.',
  },
];

export function getOperatorRuntimeSafetyBoundary(): OperatorRuntimeSafetyBoundaryItem[] {
  return OPERATOR_RUNTIME_SAFETY_BOUNDARY_REGISTRY;
}

export function getOperatorRuntimeSafetyBoundaryByCategory(category: string): OperatorRuntimeSafetyBoundaryItem[] {
  return OPERATOR_RUNTIME_SAFETY_BOUNDARY_REGISTRY.filter(i => i.category === category);
}

export function getOperatorRuntimeSafetyBoundarySummary(): {
  total: number;
  blocked: number;
  disabled: number;
  planOnly: number;
  readonly: number;
  clean: number;
  non_executable: number;
  absent: number;
  requiresApproval: number;
} {
  const items = OPERATOR_RUNTIME_SAFETY_BOUNDARY_REGISTRY;
  return {
    total: items.length,
    blocked: items.filter(i => i.status === 'blocked').length,
    disabled: items.filter(i => i.status === 'disabled').length,
    planOnly: items.filter(i => i.status === 'plan_only').length,
    readonly: items.filter(i => i.status === 'readonly').length,
    clean: items.filter(i => i.status === 'clean').length,
    non_executable: items.filter(i => i.status === 'non_executable').length,
    absent: items.filter(i => i.status === 'absent').length,
    requiresApproval: items.filter(i => i.requiresHumanApproval).length,
  };
}
