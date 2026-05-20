// Operator Runtime Readiness Registry — static readonly registry for operator readiness
// Does not execute API calls, modify state, write to databases, or control external tools.

export type ReadinessCategory =
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
  | 'docs'
  | 'memory';

export type ReadinessStatus =
  | 'sealed'
  | 'ready'
  | 'degraded'
  | 'deferred'
  | 'blocked'
  | 'unknown'
  | 'not_applicable';

export type ReadinessRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface OperatorRuntimeReadinessItem {
  id: string;
  title: string;
  category: ReadinessCategory;
  riskLevel: ReadinessRiskLevel;
  status: ReadinessStatus;
  source: string;
  evidence: string;
  allowedNow: boolean;
  requiresHumanApproval: boolean;
  readonly: true;
  summary: string;
  operatorNextStep: string;
  forbiddenAction: string;
  linkedPreviewRoute?: string;
  linkedDoc?: string;
}

export const OPERATOR_RUNTIME_READINESS_REGISTRY: OperatorRuntimeReadinessItem[] = [
  // ── System ──
  {
    id: 'current-baseline',
    title: 'Current Baseline',
    category: 'system',
    riskLevel: 'low',
    status: 'sealed',
    source: 'git rev-parse HEAD, git status',
    evidence: 'HEAD at 557e4c6 (v7.42 D1), working tree clean',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'v7.42 D1 commit sealed. Main branch, working tree clean.',
    operatorNextStep: 'Verify baseline before any phase transition.',
    forbiddenAction: 'Do not reset, rebase, or force-push baseline.',
    linkedDoc: 'AIP_V7_42_ROADMAP.md',
  },
  {
    id: 'cli-command-center',
    title: 'CLI Command Center',
    category: 'system',
    riskLevel: 'low',
    status: 'sealed',
    source: 'aip --help, aip where',
    evidence: 'v7.41 P1 — 7-section AIP Command Center with color rules',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'CLI output upgraded to Command Center with Cyan/Green/Yellow/Red/Gray/White color roles.',
    operatorNextStep: 'Use aip --help to verify Command Center output.',
    forbiddenAction: 'Do not change CLI output format without human approval.',
    linkedDoc: 'AIP_CLI_COMMAND_CENTER_REFRESH_BLUEPRINT.md',
  },
  {
    id: 'safe-status',
    title: 'Safe Status',
    category: 'system',
    riskLevel: 'low',
    status: 'ready',
    source: 'aip safe-status, aip where',
    evidence: 'Safe-status command available in CLI',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'CLI safe-status command reports current safety state.',
    operatorNextStep: 'Run aip safe-status for current safety summary.',
    forbiddenAction: 'Do not skip safe-status check before phase transitions.',
  },
  {
    id: 'encoding-doctor',
    title: 'Encoding Doctor',
    category: 'system',
    riskLevel: 'low',
    status: 'sealed',
    source: 'aip doctor encoding',
    evidence: 'v7.41 P2 — Windows encoding doctor detects shell, codepage, color support, unicode, language',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Windows encoding/environment diagnostics command.',
    operatorNextStep: 'Run aip doctor encoding on Windows to verify console health.',
    forbiddenAction: 'Do not modify system encoding from CLI.',
    linkedDoc: 'AIP_WINDOWS_ENCODING_AND_COLOR_POLICY.md',
  },
  {
    id: 'cli-doctor-env',
    title: 'CLI Doctor Environment',
    category: 'system',
    riskLevel: 'low',
    status: 'sealed',
    source: 'aip doctor env',
    evidence: 'v7.41 P2 — environment variable diagnostics',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Environment variable diagnostics tool.',
    operatorNextStep: 'Use aip doctor env to verify environment.',
    forbiddenAction: 'Do not modify environment variables from CLI.',
  },
  {
    id: 'cli-doctor-ports',
    title: 'CLI Doctor Ports',
    category: 'system',
    riskLevel: 'low',
    status: 'sealed',
    source: 'aip doctor ports',
    evidence: 'v7.41 P2 — port availability diagnostics',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Port availability diagnostics tool.',
    operatorNextStep: 'Use aip doctor ports to verify port status.',
    forbiddenAction: 'Do not kill processes from CLI.',
  },
  {
    id: 'working-tree-state',
    title: 'Working Tree State',
    category: 'system',
    riskLevel: 'low',
    status: 'sealed',
    source: 'git status --short',
    evidence: 'Working tree clean at HEAD 557e4c6',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Git working tree is clean. No uncommitted changes.',
    operatorNextStep: 'Keep working tree clean before any commit or phase transition.',
    forbiddenAction: 'Do not commit with dirty working tree.',
  },
  // ── Governance ──
  {
    id: 'stage-c-status',
    title: 'Stage C Status',
    category: 'governance',
    riskLevel: 'medium',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'stageCEnabled: false, featureFlag: off, mutableFromUi: false',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'Stage C is DISABLED. Feature flag is OFF. Not mutable from UI.',
    operatorNextStep: 'Stage C requires human authorization before any enablement planning.',
    forbiddenAction: 'Do not enable Stage C, toggle feature flag, or set mutableFromUi=true.',
    linkedPreviewRoute: '/stage-c-readiness-dashboard-preview',
  },
  {
    id: 'feature-flag-status',
    title: 'Feature Flag Status',
    category: 'governance',
    riskLevel: 'medium',
    status: 'blocked',
    source: 'GET /api/health, GET /api/stage-c/status',
    evidence: 'currentState: off, mutableFromUi: false',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'Feature flag is OFF and not mutable from UI.',
    operatorNextStep: 'Flag toggling requires human-approved plan.',
    forbiddenAction: 'Do not toggle feature flag without human approval.',
    linkedPreviewRoute: '/stage-c-feature-flag-control-preview',
  },
  {
    id: 'authorization-gate',
    title: 'Authorization Gate',
    category: 'governance',
    riskLevel: 'high',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'authorizationState: GRANTED_FOR_FIRST_SLICE_IMPLEMENTATION_REVIEW',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'Authorization gate in review state. No enablement possible.',
    operatorNextStep: 'Review authorization gate state. No change without human authorization.',
    forbiddenAction: 'Do not change authorization state or bypass gate.',
    linkedDoc: 'AIP_STAGE_C_AUTHORIZATION_GATE_BLUEPRINT.md',
  },
  {
    id: 'kill-switch-state',
    title: 'Kill Switch State',
    category: 'governance',
    riskLevel: 'high',
    status: 'ready',
    source: 'GET /api/stage-c/status',
    evidence: 'killSwitch.available: true, executableFromUi: false, state: not_triggered',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'Kill switch available but NOT executable from UI. Not triggered.',
    operatorNextStep: 'Verify kill switch remains non-executable from UI.',
    forbiddenAction: 'Do not make kill switch executable from UI.',
  },
  {
    id: 'sidebar-exposure-state',
    title: 'Sidebar Exposure State',
    category: 'governance',
    riskLevel: 'high',
    status: 'sealed',
    source: 'Navigation exposure registry, center access registry',
    evidence: 'All hidden previews are hidden_direct, not in sidebar',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'All hidden direct routes are correctly excluded from sidebar.',
    operatorNextStep: 'Audit sidebar exposure on each new hidden preview page.',
    forbiddenAction: 'Do not expose hidden preview pages in sidebar.',
    linkedDoc: 'AIP_V7_42_SAFETY_BOUNDARY_AUDIT_PLAN.md',
  },
  {
    id: 'cli-doctor-stage-c',
    title: 'CLI Doctor Stage C',
    category: 'governance',
    riskLevel: 'low',
    status: 'sealed',
    source: 'aip doctor stage-c',
    evidence: 'v7.41 P2 — Stage C diagnostic subcommand',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'CLI subcommand to check Stage C status from terminal.',
    operatorNextStep: 'Use aip doctor stage-c for quick CLI-based Stage C check.',
    forbiddenAction: 'Do not add enable/disable capability to doctor command.',
  },
  // ── Boundary ──
  {
    id: 'post-runtime-status',
    title: 'POST Runtime Status',
    category: 'boundary',
    riskLevel: 'critical',
    status: 'blocked',
    source: 'GET /api/stage-c/status, POST test',
    evidence: 'POST /api/stage-c/status returns 404. safetyBoundary.postRuntimeAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'POST runtime is BLOCKED. All POST/PUT/PATCH/DELETE return 404.',
    operatorNextStep: 'Verify POST blocked before any phase transition.',
    forbiddenAction: 'Do not add POST endpoints or enable runtime execution.',
  },
  {
    id: 'db-write-status',
    title: 'DB Write Status',
    category: 'boundary',
    riskLevel: 'critical',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.dbWriteAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'DB write is BLOCKED. No write operations permitted.',
    operatorNextStep: 'Verify DB write blocked before any phase transition.',
    forbiddenAction: 'Do not enable DB write or add write operations.',
  },
  {
    id: 'executor-status',
    title: 'Executor Status',
    category: 'boundary',
    riskLevel: 'critical',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.executorAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'Executor is BLOCKED. No runtime execution permitted.',
    operatorNextStep: 'Verify executor blocked before any phase transition.',
    forbiddenAction: 'Do not add executor or enable runtime execution.',
  },
  {
    id: 'external-control-status',
    title: 'External Control Status',
    category: 'boundary',
    riskLevel: 'critical',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.externalControlAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'External control is BLOCKED.',
    operatorNextStep: 'Verify external control blocked before any phase transition.',
    forbiddenAction: 'Do not enable external control.',
  },
  {
    id: 'connector-action-status',
    title: 'Connector Action Status',
    category: 'boundary',
    riskLevel: 'critical',
    status: 'blocked',
    source: 'GET /api/stage-c/status',
    evidence: 'safetyBoundary.connectorActionAllowed: false',
    allowedNow: false,
    requiresHumanApproval: true,
    readonly: true,
    summary: 'Connector action is BLOCKED.',
    operatorNextStep: 'Verify connector action blocked before any phase transition.',
    forbiddenAction: 'Do not enable connector actions.',
  },
  // ── Operator ──
  {
    id: 'repair-mode',
    title: 'Repair Mode',
    category: 'operator',
    riskLevel: 'medium',
    status: 'ready',
    source: 'aip repair, aip repair plan',
    evidence: 'v7.41 P3 — repair is plan-only. No file modification.',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Repair is plan-only. Generates JSON+MD reports. No file modification.',
    operatorNextStep: 'Use aip repair plan to generate repair plans.',
    forbiddenAction: 'Do not execute repair without plan review.',
    linkedDoc: 'AIP_REPAIR_COMMAND_BLUEPRINT.md',
  },
  {
    id: 'restore-point-policy',
    title: 'Restore Point Policy',
    category: 'operator',
    riskLevel: 'medium',
    status: 'ready',
    source: 'aip repair restore-point',
    evidence: 'v7.41 P3 — restore point viewing available, no creation',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Restore point command is plan-only, view-only.',
    operatorNextStep: 'View available restore points with aip repair restore-point.',
    forbiddenAction: 'Do not create or apply restore points from CLI.',
    linkedDoc: 'AIP_RESTORE_POINT_POLICY.md',
  },
  {
    id: 'operator-next-step',
    title: 'Operator Next Step',
    category: 'operator',
    riskLevel: 'low',
    status: 'ready',
    source: 'Operator Runtime Readiness Console',
    evidence: 'Continue readonly productization, improve CLI/repair/memory, prepare Stage C review',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Next allowed steps: readonly productization, CLI ergonomics, repair/memory improvements.',
    operatorNextStep: 'Reference operator decision matrix for next phase planning.',
    forbiddenAction: 'Do not proceed to Stage C enablement without human authorization.',
    linkedDoc: 'AIP_V7_42_OPERATOR_DECISION_MATRIX.md',
  },
  // ── Memory ──
  {
    id: 'memory-baseline',
    title: 'Memory Baseline',
    category: 'memory',
    riskLevel: 'low',
    status: 'sealed',
    source: 'Memory Knowledge Registry',
    evidence: 'v7.41 P4 — memory knowledge baseline with verified/historical/unverified facts',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Project memory baseline with confidence tracking.',
    operatorNextStep: 'Review memory knowledge preview for current facts.',
    forbiddenAction: 'Do not mutate runtime memory from preview.',
    linkedPreviewRoute: '/aip-memory-knowledge-preview',
  },
  {
    id: 'memory-normalization',
    title: 'Memory Normalization',
    category: 'memory',
    riskLevel: 'low',
    status: 'ready',
    source: 'Memory Normalization Policy',
    evidence: 'v7.41 D1 — memory normalization policy defined',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Memory normalization policy defined for consistent memory management.',
    operatorNextStep: 'Apply normalization policy to new memory entries.',
    forbiddenAction: 'Do not skip normalization for new memory entries.',
    linkedDoc: 'AIP_MEMORY_NORMALIZATION_POLICY.md',
  },
  {
    id: 'memory-knowledge-registry',
    title: 'Memory Knowledge Registry',
    category: 'memory',
    riskLevel: 'low',
    status: 'sealed',
    source: 'aip-memory-knowledge-registry.ts',
    evidence: 'v7.41 P4 — 33 memory facts in readonly registry',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Readonly memory fact registry with confidence levels.',
    operatorNextStep: 'Use memory registry as baseline for new phases.',
    forbiddenAction: 'Do not modify memory registry at runtime.',
    linkedPreviewRoute: '/aip-memory-knowledge-preview',
  },
  {
    id: 'project-memory-baseline',
    title: 'Project Memory Baseline v7.41',
    category: 'memory',
    riskLevel: 'low',
    status: 'sealed',
    source: 'docs/product/AIP_PROJECT_MEMORY_BASELINE_V7_41.md',
    evidence: 'v7.41 D1 — memory baseline document',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'v7.41 project memory baseline documented.',
    operatorNextStep: 'Reference memory baseline for context continuity.',
    forbiddenAction: 'Do not overwrite baseline without version update.',
    linkedDoc: 'AIP_PROJECT_MEMORY_BASELINE_V7_41.md',
  },
  // ── Runtime ──
  {
    id: 'smoke-evidence',
    title: 'Smoke Evidence',
    category: 'runtime',
    riskLevel: 'low',
    status: 'sealed',
    source: 'npm test, API smoke',
    evidence: '9/9 tests passed, API health OK, POST blocked',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'All smoke tests pass. API health OK. POST blocked.',
    operatorNextStep: 'Run smoke tests before each phase commit.',
    forbiddenAction: 'Do not skip smoke testing.',
  },
  {
    id: 'build-typecheck-evidence',
    title: 'Build / Typecheck / Test Evidence',
    category: 'runtime',
    riskLevel: 'low',
    status: 'sealed',
    source: 'npm run typecheck, npm test, npm run build',
    evidence: 'Typecheck PASS, tests 9/9 PASS, build PASS',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'All validation checks pass for current baseline.',
    operatorNextStep: 'Run full validation before each phase commit.',
    forbiddenAction: 'Do not commit with failing validation.',
  },
  // ── Health ──
  {
    id: 'receipt-template',
    title: 'Receipt Template',
    category: 'docs',
    riskLevel: 'low',
    status: 'ready',
    source: 'aip receipt template',
    evidence: 'Receipt templates available in E:\\_AIP_RECEIPTS\\',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Receipt template system available for phase documentation.',
    operatorNextStep: 'Use receipt template for each phase completion.',
    forbiddenAction: 'Do not skip receipt generation for any phase.',
  },
  {
    id: 'command-pack',
    title: 'Command Pack',
    category: 'docs',
    riskLevel: 'low',
    status: 'sealed',
    source: 'docs/product/AIP_COMMAND_PACK_FULL_POWERSHELL.md',
    evidence: 'v7.41 D1 — full PowerShell command pack documented',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Full PowerShell command pack available for reference.',
    operatorNextStep: 'Reference command pack for CLI operations.',
    forbiddenAction: 'Do not execute commands without understanding their effect.',
    linkedDoc: 'AIP_COMMAND_PACK_FULL_POWERSHELL.md',
  },
  // ── Rollback ──
  {
    id: 'rollback-readiness',
    title: 'Rollback Readiness',
    category: 'rollback',
    riskLevel: 'medium',
    status: 'ready',
    source: 'Rollback preview, rollback spec docs',
    evidence: 'Rollback preview available, contract frozen',
    allowedNow: true,
    requiresHumanApproval: false,
    readonly: true,
    summary: 'Rollback readiness reviewed. Design contracts frozen.',
    operatorNextStep: 'Review rollback readiness before phase transitions.',
    forbiddenAction: 'Do not execute rollback from preview panel.',
    linkedPreviewRoute: '/rollback-preview',
  },
];

export function getOperatorRuntimeReadinessRegistry(): OperatorRuntimeReadinessItem[] {
  return OPERATOR_RUNTIME_READINESS_REGISTRY;
}

export function getOperatorRuntimeReadinessSummary(): {
  total: number;
  byCategory: Record<string, number>;
  byRisk: Record<string, number>;
  highOrCritical: number;
  allowedNow: number;
  blocked: number;
  requiresHumanApproval: number;
} {
  const items = OPERATOR_RUNTIME_READINESS_REGISTRY;
  const byCategory: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byRisk[item.riskLevel] = (byRisk[item.riskLevel] || 0) + 1;
  }
  return {
    total: items.length,
    byCategory,
    byRisk,
    highOrCritical: items.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length,
    allowedNow: items.filter(i => i.allowedNow).length,
    blocked: items.filter(i => !i.allowedNow).length,
    requiresHumanApproval: items.filter(i => i.requiresHumanApproval).length,
  };
}

export function getOperatorRuntimeReadinessByCategory(category: ReadinessCategory): OperatorRuntimeReadinessItem[] {
  return OPERATOR_RUNTIME_READINESS_REGISTRY.filter(i => i.category === category);
}
