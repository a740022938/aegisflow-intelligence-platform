// Operator Checklist Registry — static readonly checklist for operator decision support
// Does not execute API calls, modify state, write to databases, or control external tools.

export type OperatorChecklistCategory =
  | 'git'
  | 'seal'
  | 'validation'
  | 'safety'
  | 'evidence'
  | 'operator'
  | 'rollback'
  | 'release';

export type OperatorChecklistStatus =
  | 'pass'
  | 'ready'
  | 'deferred'
  | 'blocked'
  | 'not_applicable'
  | 'unknown';

export interface OperatorChecklistItem {
  id: string;
  title: string;
  category: OperatorChecklistCategory;
  status: OperatorChecklistStatus;
  readonly: true;
  required: boolean;
  evidenceRef: string;
  evidencePath?: string;
  linkedDoc?: string;
  operatorInterpretation: string;
  forbiddenAction: string;
}

export const OPERATOR_CHECKLIST: OperatorChecklistItem[] = [
  // ── Git ──
  {
    id: 'git-clean-state',
    title: 'Git working tree is clean',
    category: 'git',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'git status shows nothing to commit',
    operatorInterpretation: 'Working tree is clean. Ready for phase transitions.',
    forbiddenAction: 'Do not commit dirty state or bypass git checks.',
  },
  {
    id: 'latest-commit-verified',
    title: 'Latest commit verified',
    category: 'git',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'git log -1 shows expected HEAD',
    operatorInterpretation: 'HEAD is at the expected commit for the current phase.',
    forbiddenAction: 'Do not proceed with unverified or unknown commits.',
  },
  {
    id: 'origin-sync',
    title: 'origin/main synchronized',
    category: 'git',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'git status shows up to date with origin/main',
    operatorInterpretation: 'Local branch is synced with remote. No unpushed commits.',
    forbiddenAction: 'Do not force push or bypass sync checks.',
  },
  // ── Seal ──
  {
    id: 'v7-32-seal',
    title: 'v7.32 productization seal ready',
    category: 'seal',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'V7_32_PRODUCTIZATION_SEAL_READY verdict',
    evidencePath: 'E:\\_AIP_REPORTS\\AIP_v7.32.0_P2_productization_seal_recheck_report_20260519.md',
    operatorInterpretation: 'v7.32 seal confirmed. All safety fields disabled.',
    forbiddenAction: 'Do not skip seal recheck for phase transitions.',
  },
  {
    id: 'v7-33-d1-blueprint',
    title: 'v7.33 D1 blueprint ready',
    category: 'seal',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'V7_33_D1_OPERATOR_CONSOLE_BLUEPRINT_READY verdict',
    evidencePath: 'E:\\_AIP_REPORTS\\AIP_v7.33.0_D1_operator_console_productization_blueprint_report_20260520.md',
    operatorInterpretation: 'Operator Console blueprint defined. IA, workflow, status model, risk model complete.',
    forbiddenAction: 'Do not bypass blueprint to implementation.',
  },
  {
    id: 'v7-33-p1-registry',
    title: 'v7.33 P1 registry preview ready',
    category: 'seal',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'V7_33_P1_OPERATOR_CONSOLE_REGISTRY_PREVIEW_READY verdict',
    evidencePath: 'E:\\_AIP_REPORTS\\AIP_v7.33.0_P1_operator_console_registry_preview_report_20260520.md',
    operatorInterpretation: '20-item registry with validator. All items readonly.',
    forbiddenAction: 'Do not add mutable items to the registry.',
  },
  {
    id: 'v7-33-p2-readonly-ui',
    title: 'v7.33 P2 readonly UI preview ready',
    category: 'seal',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'V7_33_P2_OPERATOR_CONSOLE_READONLY_UI_PREVIEW_READY verdict',
    evidencePath: 'E:\\_AIP_REPORTS\\AIP_v7.33.0_P2_operator_console_readonly_ui_preview_report_20260520.md',
    operatorInterpretation: '8-section readonly UI preview for operator decision support.',
    forbiddenAction: 'Do not add action buttons or enable runtime from this UI.',
  },
  // ── Validation ──
  {
    id: 'typecheck-pass',
    title: 'Typecheck passes',
    category: 'validation',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'npm run typecheck exits with 0',
    operatorInterpretation: 'All TypeScript type checks pass.',
    forbiddenAction: 'Do not skip typecheck before phase transitions.',
  },
  {
    id: 'tests-pass',
    title: 'Tests pass',
    category: 'validation',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'npm test exits with 0 (38/38)',
    operatorInterpretation: 'All unit and integration tests pass.',
    forbiddenAction: 'Do not skip tests before phase transitions.',
  },
  {
    id: 'build-pass',
    title: 'Build passes',
    category: 'validation',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'npm run build exits with 0',
    operatorInterpretation: 'Production build succeeds without errors.',
    forbiddenAction: 'Do not skip build before phase transitions.',
  },
  {
    id: 'security-search-clean',
    title: 'Security search clean',
    category: 'validation',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'Safety search shows no dangerous patterns',
    operatorInterpretation: 'No Stage C enablement, POST implementation, DB write, executor, or secret leakage found.',
    forbiddenAction: 'Do not introduce dangerous patterns in future phases.',
  },
  // ── Safety ──
  {
    id: 'stage-c-disabled',
    title: 'Stage C disabled confirmed',
    category: 'safety',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'GET /api/runtime/status (stageCEnabled=false) + code audit',
    operatorInterpretation: 'Stage C is permanently disabled. No enablement code exists.',
    forbiddenAction: 'Do not enable Stage C, bypass Stage C gate, or implement Stage C executor.',
  },
  {
    id: 'post-blocked',
    title: 'POST runtime blocked confirmed',
    category: 'safety',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'GET /api/runtime/status (postEndpointsEnabled=false) + code audit',
    operatorInterpretation: 'All POST runtime endpoints are blocked. No POST route handlers exist.',
    forbiddenAction: 'Do not add POST route handlers or implement POST executors.',
  },
  {
    id: 'db-write-not-occurred',
    title: 'DB write not occurred confirmed',
    category: 'safety',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'GET /api/runtime/status (dbWriteEnabled=false) + code audit',
    operatorInterpretation: 'No DB write code exists in runtime module.',
    forbiddenAction: 'Do not write to database from runtime module.',
  },
  {
    id: 'external-control-not-occurred',
    title: 'External control not occurred confirmed',
    category: 'safety',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'GET /api/runtime/status (externalControlEnabled=false) + code audit',
    operatorInterpretation: 'No external control code exists.',
    forbiddenAction: 'Do not implement external control or call external APIs.',
  },
  {
    id: 'executor-absent',
    title: 'Executor absent confirmed',
    category: 'safety',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'Code audit — no runtime executor code found',
    operatorInterpretation: 'No runtime executor code exists.',
    forbiddenAction: 'Do not implement runtime executor or spawn processes.',
  },
  {
    id: 'sidebar-unchanged',
    title: 'Sidebar exposure unchanged',
    category: 'safety',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'center-access-registry.ts + navigation-exposure-registry.ts audit',
    operatorInterpretation: 'All Operator Console routes are hidden direct. No sidebar entry added.',
    forbiddenAction: 'Do not add Operator Console to sidebar without human approval.',
  },
  // ── Evidence ──
  {
    id: 'evidence-paths-present',
    title: 'Evidence report paths present',
    category: 'evidence',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'AIP reports directory contains expected phase reports',
    evidencePath: 'E:\\_AIP_REPORTS\\',
    operatorInterpretation: 'All phase reports exist in the reports directory.',
    forbiddenAction: 'Do not delete or overwrite historical reports.',
  },
  {
    id: 'receipt-paths-present',
    title: 'Receipt paths present',
    category: 'evidence',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'AIP receipts directory contains expected phase receipts',
    evidencePath: 'E:\\_AIP_RECEIPTS\\',
    operatorInterpretation: 'All phase receipts exist in the receipts directory.',
    forbiddenAction: 'Do not delete or overwrite historical receipts.',
  },
  // ── Operator ──
  {
    id: 'operator-next-step-defined',
    title: 'Operator next step defined',
    category: 'operator',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'Operator Console pages define next step recommendations',
    operatorInterpretation: 'All Operator Console pages include clear operator next step guidance.',
    forbiddenAction: 'Do not leave operator without clear next step instructions.',
  },
  {
    id: 'human-approval-restart',
    title: 'Human approval required for restart',
    category: 'operator',
    status: 'ready',
    readonly: true,
    required: true,
    evidenceRef: 'Restart policy defined in human restart checklist',
    linkedDoc: 'AIP_V7_32_D2_HUMAN_APPROVED_LIVE_SMOKE_PACK.md',
    operatorInterpretation: 'Server restart requires human approval and smoke checklist.',
    forbiddenAction: 'Do not restart server without human approval.',
  },
  // ── Rollback ──
  {
    id: 'rollback-docs-present',
    title: 'Rollback / recovery docs present',
    category: 'rollback',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'Rollback guide and recovery guide exist in docs',
    linkedDoc: 'AIP_READONLY_RUNTIME_API_ROLLBACK_AND_RECOVERY_GUIDE.md',
    operatorInterpretation: 'Rollback and recovery documentation is available.',
    forbiddenAction: 'Do not execute rollback without following documented procedure.',
  },
  // ── Release ──
  {
    id: 'no-release-performed',
    title: 'No release/tag performed',
    category: 'release',
    status: 'pass',
    readonly: true,
    required: true,
    evidenceRef: 'git tag shows no v7.33 tag',
    operatorInterpretation: 'No git tag or GitHub release has been created for v7.33.',
    forbiddenAction: 'Do not tag or release without explicit human approval.',
  },
];

export function getOperatorChecklist(): OperatorChecklistItem[] {
  return OPERATOR_CHECKLIST;
}

export function getOperatorChecklistByCategory(category: OperatorChecklistCategory): OperatorChecklistItem[] {
  return OPERATOR_CHECKLIST.filter(item => item.category === category);
}

export function getOperatorChecklistByStatus(status: OperatorChecklistStatus): OperatorChecklistItem[] {
  return OPERATOR_CHECKLIST.filter(item => item.status === status);
}

export function getOperatorChecklistSummary(): {
  total: number;
  byCategory: Record<OperatorChecklistCategory, number>;
  byStatus: Record<OperatorChecklistStatus, number>;
  requiredCount: number;
  requiredPass: number;
  requiredReady: number;
  requiredDeferred: number;
} {
  const items = OPERATOR_CHECKLIST;
  const byCategory = {} as Record<OperatorChecklistCategory, number>;
  const byStatus = {} as Record<OperatorChecklistStatus, number>;
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
  }
  const required = items.filter(i => i.required);
  return {
    total: items.length,
    byCategory,
    byStatus,
    requiredCount: required.length,
    requiredPass: required.filter(i => i.status === 'pass').length,
    requiredReady: required.filter(i => i.status === 'ready').length,
    requiredDeferred: required.filter(i => i.status === 'deferred').length,
  };
}
