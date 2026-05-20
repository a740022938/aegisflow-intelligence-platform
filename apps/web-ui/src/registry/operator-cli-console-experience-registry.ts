// Operator CLI-Console Experience Registry — readonly registry mapping CLI to Console
// Does not execute commands, modify state, or control external tools.

export interface CLIConsoleExperienceItem {
  id: string;
  cliCommand: string;
  consoleSection: string;
  consoleRoute: string;
  readonly: true;
  description: string;
  cliOutputSummary: string;
  consoleLabel: string;
}

export const OPERATOR_CLI_CONSOLE_EXPERIENCE_REGISTRY: CLIConsoleExperienceItem[] = [
  {
    id: 'cli-console-stage-c',
    cliCommand: 'aip safe-status (Stage C)',
    consoleSection: 'Safety Snapshot',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps Stage C status from CLI to console.',
    cliOutputSummary: 'Stage C: DISABLED',
    consoleLabel: 'Stage C: Disabled',
  },
  {
    id: 'cli-console-ff',
    cliCommand: 'aip safe-status (Feature Flag)',
    consoleSection: 'Safety Snapshot',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps feature flag state from CLI to console.',
    cliOutputSummary: 'Feature Flag: OFF',
    consoleLabel: 'Feature Flag: OFF',
  },
  {
    id: 'cli-console-post',
    cliCommand: 'aip safe-status (POST Runtime)',
    consoleSection: 'Safety Snapshot',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps POST runtime status from CLI to console.',
    cliOutputSummary: 'POST Runtime: BLOCKED',
    consoleLabel: 'POST Runtime: Blocked',
  },
  {
    id: 'cli-console-db',
    cliCommand: 'aip safe-status (DB Write)',
    consoleSection: 'Safety Snapshot',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps DB write status from CLI to console.',
    cliOutputSummary: 'DB Write: BLOCKED',
    consoleLabel: 'DB Write: Blocked',
  },
  {
    id: 'cli-console-executor',
    cliCommand: 'aip safe-status (Executor)',
    consoleSection: 'Safety Snapshot',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps executor status from CLI to console.',
    cliOutputSummary: 'Executor: ABSENT',
    consoleLabel: 'Executor: Absent',
  },
  {
    id: 'cli-console-external',
    cliCommand: 'aip safe-status (External Control)',
    consoleSection: 'Safety Snapshot',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps external control status from CLI to console.',
    cliOutputSummary: 'External Control: BLOCKED',
    consoleLabel: 'External Control: Blocked',
  },
  {
    id: 'cli-console-connector',
    cliCommand: 'aip safe-status (Connector Action)',
    consoleSection: 'Safety Snapshot',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps connector action status from CLI to console.',
    cliOutputSummary: 'Connector Action: BLOCKED',
    consoleLabel: 'Connector Action: Blocked',
  },
  {
    id: 'cli-console-worktree',
    cliCommand: 'aip safe-status (Working Tree)',
    consoleSection: 'Current Seal Baseline',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps working tree status from CLI to console.',
    cliOutputSummary: 'Working Tree: CLEAN',
    consoleLabel: 'Working Tree: Clean',
  },
  {
    id: 'cli-console-entry',
    cliCommand: 'aip',
    consoleSection: 'Command Center Links',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps main CLI entry to console command links.',
    cliOutputSummary: 'Color-coded command center with available subcommands.',
    consoleLabel: 'aip — Main CLI Entry',
  },
  {
    id: 'cli-console-repair',
    cliCommand: 'aip repair plan',
    consoleSection: 'Repair Plan-only Status',
    consoleRoute: '/operator-runtime-readiness-console-preview',
    readonly: true,
    description: 'Maps repair plan command to console repair section.',
    cliOutputSummary: 'Generates JSON+MD repair plan. No file modification.',
    consoleLabel: 'Repair Plan-only',
  },
];

export function getOperatorCLIConsoleExperienceRegistry(): CLIConsoleExperienceItem[] {
  return OPERATOR_CLI_CONSOLE_EXPERIENCE_REGISTRY;
}

export function getOperatorCLIConsoleExperienceSummary() {
  const items = OPERATOR_CLI_CONSOLE_EXPERIENCE_REGISTRY;
  return {
    total: items.length,
  };
}
