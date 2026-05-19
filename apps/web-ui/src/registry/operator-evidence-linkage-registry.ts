// Operator Evidence Linkage Registry — static readonly evidence linkage for operator console
// Does not execute API calls, read/upload/write evidence stores, or expose secrets.

export type OperatorEvidenceType =
  | 'report'
  | 'receipt'
  | 'json'
  | 'doc'
  | 'roadmap'
  | 'rollback'
  | 'smoke'
  | 'validation';

export interface OperatorEvidenceLinkageItem {
  id: string;
  title: string;
  evidenceType: OperatorEvidenceType;
  version: string;
  path: string;
  readonly: true;
  existsExpected: boolean;
  sourceOfTruth: boolean;
  summary: string;
  linkedPreviewRoute?: string;
  forbiddenAction: string;
}

export const OPERATOR_EVIDENCE_LINKAGE: OperatorEvidenceLinkageItem[] = [
  // ── Reports ──
  {
    id: 'ev-v7-32-p2-seal-report',
    title: 'v7.32 P2 Productization Seal Recheck Report',
    evidenceType: 'report',
    version: 'v7.32.0-P2',
    path: 'E:\\_AIP_REPORTS\\AIP_v7.32.0_P2_productization_seal_recheck_report_20260519.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Final productization seal recheck report. All safety fields confirmed disabled.',
    forbiddenAction: 'Do not modify or overwrite this report.',
  },
  {
    id: 'ev-v7-32-p1-smoke-report',
    title: 'v7.32 P1 Controlled Live Smoke Report',
    evidenceType: 'smoke',
    version: 'v7.32.0-P1',
    path: 'E:\\_AIP_REPORTS\\AIP_v7.32.0_P1_controlled_live_smoke_report_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Live smoke results: GET PASS 4/4, POST blocked 4/4. Stale server 401 resolved.',
    forbiddenAction: 'Do not re-run smoke from Operator Console.',
  },
  {
    id: 'ev-v7-33-d1-blueprint-report',
    title: 'v7.33 D1 Operator Console Blueprint Report',
    evidenceType: 'report',
    version: 'v7.33.0-D1',
    path: 'E:\\_AIP_REPORTS\\AIP_v7.33.0_D1_operator_console_productization_blueprint_report_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Operator Console blueprint with IA, workflow, status model, risk model, evidence panel, rollback panel.',
    forbiddenAction: 'Do not modify or overwrite this report.',
  },
  {
    id: 'ev-v7-33-p1-registry-report',
    title: 'v7.33 P1 Operator Console Registry Preview Report',
    evidenceType: 'report',
    version: 'v7.33.0-P1',
    path: 'E:\\_AIP_REPORTS\\AIP_v7.33.0_P1_operator_console_registry_preview_report_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: '20-item registry with validator. P1 registry preview ready.',
    forbiddenAction: 'Do not modify or overwrite this report.',
  },
  {
    id: 'ev-v7-33-p2-readonly-ui-report',
    title: 'v7.33 P2 Operator Console Readonly UI Preview Report',
    evidenceType: 'report',
    version: 'v7.33.0-P2',
    path: 'E:\\_AIP_REPORTS\\AIP_v7.33.0_P2_operator_console_readonly_ui_preview_report_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: '8-section readonly UI preview. P2 ready.',
    forbiddenAction: 'Do not modify or overwrite this report.',
  },
  // ── Receipts ──
  {
    id: 'ev-v7-32-p2-seal-receipt',
    title: 'v7.32 P2 Productization Seal Recheck Receipt',
    evidenceType: 'receipt',
    version: 'v7.32.0-P2',
    path: 'E:\\_AIP_RECEIPTS\\AIP_v7.32.0_P2_productization_seal_recheck_receipt_20260519.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Seal recheck receipt with key metrics.',
    forbiddenAction: 'Do not modify or overwrite this receipt.',
  },
  {
    id: 'ev-v7-32-p1-smoke-receipt',
    title: 'v7.32 P1 Controlled Live Smoke Receipt',
    evidenceType: 'receipt',
    version: 'v7.32.0-P1',
    path: 'E:\\_AIP_RECEIPTS\\AIP_v7.32.0_P1_controlled_live_smoke_receipt_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Live smoke receipt with smoke results summary.',
    forbiddenAction: 'Do not modify or overwrite this receipt.',
  },
  {
    id: 'ev-v7-33-d1-blueprint-receipt',
    title: 'v7.33 D1 Operator Console Blueprint Receipt',
    evidenceType: 'receipt',
    version: 'v7.33.0-D1',
    path: 'E:\\_AIP_RECEIPTS\\AIP_v7.33.0_D1_operator_console_productization_blueprint_receipt_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Blueprint receipt with IA, workflow, status model, risk model metrics.',
    forbiddenAction: 'Do not modify or overwrite this receipt.',
  },
  {
    id: 'ev-v7-33-p1-registry-receipt',
    title: 'v7.33 P1 Operator Console Registry Preview Receipt',
    evidenceType: 'receipt',
    version: 'v7.33.0-P1',
    path: 'E:\\_AIP_RECEIPTS\\AIP_v7.33.0_P1_operator_console_registry_preview_receipt_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Registry preview receipt with registry and validator metrics.',
    forbiddenAction: 'Do not modify or overwrite this receipt.',
  },
  {
    id: 'ev-v7-33-p2-readonly-ui-receipt',
    title: 'v7.33 P2 Operator Console Readonly UI Preview Receipt',
    evidenceType: 'receipt',
    version: 'v7.33.0-P2',
    path: 'E:\\_AIP_RECEIPTS\\AIP_v7.33.0_P2_operator_console_readonly_ui_preview_receipt_20260520.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Readonly UI preview receipt with UI sections and safety metrics.',
    forbiddenAction: 'Do not modify or overwrite this receipt.',
  },
  // ── JSON Reports ──
  {
    id: 'ev-v7-33-p2-readonly-ui-json',
    title: 'v7.33 P2 Readonly UI Preview JSON',
    evidenceType: 'json',
    version: 'v7.33.0-P2',
    path: 'E:\\_AIP_REPORTS\\AIP_v7.33.0_P2_operator_console_readonly_ui_preview_20260520.json',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: false,
    summary: 'Structured JSON report for P2 phase.',
    forbiddenAction: 'Do not modify or overwrite this JSON report.',
  },
  // ── Docs ──
  {
    id: 'ev-v7-33-roadmap',
    title: 'v7.33 Roadmap',
    evidenceType: 'roadmap',
    version: 'v7.33.0',
    path: 'docs/product/AIP_V7_33_ROADMAP.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Complete v7.33 roadmap with phase definitions and status.',
    forbiddenAction: 'Do not modify roadmap without phase scope change.',
    linkedPreviewRoute: '/operator-console-readonly-preview',
  },
  {
    id: 'ev-rollback-guide',
    title: 'Rollback and Recovery Guide',
    evidenceType: 'rollback',
    version: 'v7.31.0',
    path: 'docs/product/AIP_READONLY_RUNTIME_API_ROLLBACK_AND_RECOVERY_GUIDE.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Rollback plan, rollback idempotency spec, recovery guide.',
    forbiddenAction: 'Do not execute rollback without following this guide.',
  },
  {
    id: 'ev-restart-checklist',
    title: 'Human Restart Checklist',
    evidenceType: 'doc',
    version: 'v7.32.0-D2',
    path: 'docs/product/AIP_V7_32_D2_HUMAN_APPROVED_LIVE_SMOKE_PACK.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Human-approved restart checklist. Server restart requires human approval.',
    forbiddenAction: 'Do not restart server without following this checklist.',
  },
  {
    id: 'ev-readonly-workflow',
    title: 'Operator Console Readonly Workflow',
    evidenceType: 'doc',
    version: 'v7.33.0-D1',
    path: 'docs/product/AIP_OPERATOR_CONSOLE_READONLY_WORKFLOW.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Readonly workflow for operator decision support.',
    forbiddenAction: 'Do not convert workflow steps to auto-execution.',
  },
  {
    id: 'ev-status-model',
    title: 'Operator Console Status Model',
    evidenceType: 'doc',
    version: 'v7.33.0-D1',
    path: 'docs/product/AIP_OPERATOR_CONSOLE_STATUS_MODEL.md',
    readonly: true,
    existsExpected: true,
    sourceOfTruth: true,
    summary: 'Status definitions and transition rules for Operator Console items.',
    forbiddenAction: 'Do not transition status without following defined rules.',
  },
];

export function getOperatorEvidenceLinkage(): OperatorEvidenceLinkageItem[] {
  return OPERATOR_EVIDENCE_LINKAGE;
}

export function getOperatorEvidenceByType(evidenceType: OperatorEvidenceType): OperatorEvidenceLinkageItem[] {
  return OPERATOR_EVIDENCE_LINKAGE.filter(item => item.evidenceType === evidenceType);
}

export function getOperatorEvidenceSourceOfTruth(): OperatorEvidenceLinkageItem[] {
  return OPERATOR_EVIDENCE_LINKAGE.filter(item => item.sourceOfTruth);
}

export function getOperatorEvidenceLinkageSummary(): {
  total: number;
  byType: Record<OperatorEvidenceType, number>;
  sourceOfTruthCount: number;
  reportsCount: number;
  receiptsCount: number;
} {
  const items = OPERATOR_EVIDENCE_LINKAGE;
  const byType = {} as Record<OperatorEvidenceType, number>;
  for (const item of items) {
    byType[item.evidenceType] = (byType[item.evidenceType] || 0) + 1;
  }
  return {
    total: items.length,
    byType,
    sourceOfTruthCount: items.filter(i => i.sourceOfTruth).length,
    reportsCount: items.filter(i => i.evidenceType === 'report').length,
    receiptsCount: items.filter(i => i.evidenceType === 'receipt').length,
  };
}
