// Operator Integration Evidence Registry — readonly registry of integration evidence
// Does not execute commands, modify state, or control external tools.

export interface IntegrationEvidenceItem {
  id: string;
  title: string;
  capabilityVersion: string;
  source: string;
  verified: boolean;
  readonly: true;
  evidence: string;
  safetyNote: string;
}

export const OPERATOR_INTEGRATION_EVIDENCE_REGISTRY: IntegrationEvidenceItem[] = [
  {
    id: 'evidence-cli-command-center',
    title: 'CLI Command Center',
    capabilityVersion: 'v7.41+',
    source: 'aip --help, aip where, command bridge registry',
    verified: true,
    readonly: true,
    evidence: 'Command bridge registry has 8 items. All sealed or ready. Color-coded output confirmed.',
    safetyNote: 'Readonly command listing. No execution.',
  },
  {
    id: 'evidence-encoding-doctor',
    title: 'Encoding Doctor',
    capabilityVersion: 'v7.41+',
    source: 'aip doctor encoding',
    verified: true,
    readonly: true,
    evidence: 'Encoding doctor detects shell, codepage, color support, unicode, language.',
    safetyNote: 'Readonly diagnostics. No system modification.',
  },
  {
    id: 'evidence-safe-status',
    title: 'Safe-status',
    capabilityVersion: 'v7.41+',
    source: 'aip safe-status, safety snapshot section',
    verified: true,
    readonly: true,
    evidence: 'Stage C disabled, FF off, all boundaries blocked. CLI and console match.',
    safetyNote: 'Readonly status report. No toggle capability.',
  },
  {
    id: 'evidence-operator-console',
    title: 'Operator Console',
    capabilityVersion: 'v7.42+',
    source: 'OperatorRuntimeReadinessConsolePreview',
    verified: true,
    readonly: true,
    evidence: '30 registry items, 10 sections, all readonly. Stage C disabled, FF off.',
    safetyNote: 'Hidden direct route. No action buttons.',
  },
  {
    id: 'evidence-repair-plan-only',
    title: 'Repair Plan-only',
    capabilityVersion: 'v7.41+',
    source: 'aip repair plan, repair bridge registry',
    verified: true,
    readonly: true,
    evidence: '5 repair items, all planOnly=true. Source restore blocked. Full restore forbidden.',
    safetyNote: 'Plan-only. No file modification.',
  },
  {
    id: 'evidence-memory-baseline',
    title: 'Memory Baseline',
    capabilityVersion: 'v7.41+',
    source: 'Memory bridge registry',
    verified: true,
    readonly: true,
    evidence: '5 memory items with verified/historical/reference confidence levels.',
    safetyNote: 'Readonly knowledge display. No memory mutation.',
  },
  {
    id: 'evidence-auth-review-pack',
    title: 'Authorization Review Pack',
    capabilityVersion: 'v7.43+',
    source: 'StageCAuthorizationReviewPackPreview',
    verified: true,
    readonly: true,
    evidence: '12 authorization requirements, all unsatisfied. Fake auth rules displayed.',
    safetyNote: 'Preview only. No authorization accepted.',
  },
  {
    id: 'evidence-decision-workflow',
    title: 'Decision Workflow',
    capabilityVersion: 'v7.43+',
    source: 'Operator decision workflow registry',
    verified: true,
    readonly: true,
    evidence: '10 checks, all readonly. Evaluates to appropriate decision state.',
    safetyNote: 'Judgment only. No execution or state change.',
  },
  {
    id: 'evidence-receipt-template',
    title: 'Receipt Template',
    capabilityVersion: 'v7.41+',
    source: 'aip receipt template, receipt template docs',
    verified: true,
    readonly: true,
    evidence: 'Standard receipt format available. Used for v7.42–v7.44 phases.',
    safetyNote: 'Documentation only. No state modification.',
  },
  {
    id: 'evidence-safety-boundary',
    title: 'Safety Boundary',
    capabilityVersion: 'v7.42+',
    source: 'Live smoke, boundary registry',
    verified: true,
    readonly: true,
    evidence: 'POST blocked (404), Stage C disabled, FF off, all boundaries intact.',
    safetyNote: 'Safety boundaries enforced. No boundary modification from UI.',
  },
  {
    id: 'evidence-e2e-flow',
    title: 'End-to-End Flow',
    capabilityVersion: 'v7.44+',
    source: 'OperatorEndToEndFlowPreview',
    verified: true,
    readonly: true,
    evidence: '10 flow steps connecting CLI to Web Console. All readonly.',
    safetyNote: 'Hidden direct route. Not in sidebar.',
  },
  {
    id: 'evidence-usability-drill',
    title: 'Usability Drill',
    capabilityVersion: 'v7.44+',
    source: 'OperatorUsabilityDrillPreview',
    verified: true,
    readonly: true,
    evidence: '5 drill scenarios verified. Repair/memory/authorization all readonly.',
    safetyNote: 'All scenarios completed without mutation or authorization.',
  },
];

export function getOperatorIntegrationEvidenceRegistry(): IntegrationEvidenceItem[] {
  return OPERATOR_INTEGRATION_EVIDENCE_REGISTRY;
}

export function getOperatorIntegrationEvidenceSummary() {
  const items = OPERATOR_INTEGRATION_EVIDENCE_REGISTRY;
  return {
    total: items.length,
    verified: items.filter(i => i.verified).length,
  };
}
