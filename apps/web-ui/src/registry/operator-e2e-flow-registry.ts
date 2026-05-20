// Operator E2E Flow Registry — readonly registry of the end-to-end operator flow
// Does not execute commands, modify state, or control external tools.

export interface E2EFlowStep {
  id: string;
  stepNumber: number;
  title: string;
  action: string;
  tool: 'cli' | 'web' | 'both';
  readonly: true;
  description: string;
  expectedOutput: string;
  safetyNote: string;
}

export const OPERATOR_E2E_FLOW_REGISTRY: E2EFlowStep[] = [
  {
    id: 'e2e-cli-entry',
    stepNumber: 1,
    title: 'CLI Command Entry',
    action: 'aip',
    tool: 'cli',
    readonly: true,
    description: 'Main CLI entry point with color-coded command center output.',
    expectedOutput: 'Color-coded command list with sections for available subcommands.',
    safetyNote: 'Readonly command listing. No execution.',
  },
  {
    id: 'e2e-phase-context',
    stepNumber: 2,
    title: 'Phase Context',
    action: 'aip where',
    tool: 'cli',
    readonly: true,
    description: 'Shows current phase, branch, HEAD commit, and working tree state.',
    expectedOutput: 'Current branch (main), HEAD hash, working tree status.',
    safetyNote: 'Readonly context display. No state modification.',
  },
  {
    id: 'e2e-safe-status',
    stepNumber: 3,
    title: 'Safe Status',
    action: 'aip safe-status',
    tool: 'cli',
    readonly: true,
    description: 'Reports current safety state including Stage C, feature flag, and boundaries.',
    expectedOutput: 'Stage C disabled, FF off, all boundaries blocked.',
    safetyNote: 'Readonly status report. No toggle capability.',
  },
  {
    id: 'e2e-operator-console',
    stepNumber: 4,
    title: 'Operator Runtime Readiness Console',
    action: 'Open /operator-runtime-readiness-console-preview',
    tool: 'web',
    readonly: true,
    description: 'Web console with 10 sections showing baseline, safety, gates, bridges, and decisions.',
    expectedOutput: '10-section readonly dashboard with current safety state.',
    safetyNote: 'Hidden direct route. Not in sidebar. No action buttons.',
  },
  {
    id: 'e2e-command-bridge',
    stepNumber: 5,
    title: 'Command Bridge',
    action: 'View command bridge registry',
    tool: 'both',
    readonly: true,
    description: 'Readonly listing of CLI commands with status and operator notes.',
    expectedOutput: '8 commands listed with sealed/ready status.',
    safetyNote: 'Readonly registry. No command execution.',
  },
  {
    id: 'e2e-repair-bridge',
    stepNumber: 6,
    title: 'Repair Bridge',
    action: 'View repair bridge registry',
    tool: 'both',
    readonly: true,
    description: 'Readonly listing of repair commands with plan-only annotations.',
    expectedOutput: '5 repair items, all plan-only, source restore blocked, full restore forbidden.',
    safetyNote: 'All repair items plan-only. No file modification.',
  },
  {
    id: 'e2e-memory-bridge',
    stepNumber: 7,
    title: 'Memory Bridge',
    action: 'View memory bridge registry',
    tool: 'both',
    readonly: true,
    description: 'Readonly listing of memory knowledge with confidence levels.',
    expectedOutput: '5 memory items with verified/historical/reference confidence.',
    safetyNote: 'Readonly knowledge display. No memory mutation.',
  },
  {
    id: 'e2e-auth-review',
    stepNumber: 8,
    title: 'Authorization Review Pack',
    action: 'Open /stage-c-authorization-review-pack-preview',
    tool: 'web',
    readonly: true,
    description: 'Readonly preview of Stage C authorization requirements. All unsatisfied.',
    expectedOutput: '12 authorization requirements, all Not Satisfied. Fake auth rules displayed.',
    safetyNote: 'Preview only. No authorization accepted. Stage C disabled.',
  },
  {
    id: 'e2e-decision-workflow',
    stepNumber: 9,
    title: 'Operator Decision Workflow',
    action: 'Evaluate decision workflow',
    tool: 'both',
    readonly: true,
    description: '10 readonly checks producing a final decision state and recommendation.',
    expectedOutput: 'Decision state (e.g., BLOCKED_NEEDS_AUTHORIZATION) with recommendation.',
    safetyNote: 'Judgment only. No execution or state change.',
  },
  {
    id: 'e2e-receipt',
    stepNumber: 10,
    title: 'Receipt Generation',
    action: 'aip receipt template',
    tool: 'both',
    readonly: true,
    description: 'Standard receipt format for phase documentation.',
    expectedOutput: 'Receipt with phase, HEAD, files, validation, safety, verdict.',
    safetyNote: 'Documentation only. No state modification.',
  },
];

export function getOperatorE2EFlowRegistry(): E2EFlowStep[] {
  return OPERATOR_E2E_FLOW_REGISTRY;
}

export function getOperatorE2EFlowSummary() {
  const items = OPERATOR_E2E_FLOW_REGISTRY;
  return {
    total: items.length,
    cli: items.filter(i => i.tool === 'cli').length,
    web: items.filter(i => i.tool === 'web').length,
    both: items.filter(i => i.tool === 'both').length,
  };
}
