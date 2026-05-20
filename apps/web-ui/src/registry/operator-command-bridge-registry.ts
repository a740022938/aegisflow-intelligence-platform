// Operator Command Bridge Registry — readonly registry of CLI commands
// Does not execute commands, modify state, or control external tools.

export interface CommandBridgeItem {
  id: string;
  command: string;
  title: string;
  status: 'sealed' | 'ready' | 'blocked';
  readonly: true;
  summary: string;
  operatorNote: string;
}

export const OPERATOR_COMMAND_BRIDGE_REGISTRY: CommandBridgeItem[] = [
  {
    id: 'cmd-aip',
    command: 'aip',
    title: 'Main CLI Entry',
    status: 'sealed',
    readonly: true,
    summary: 'Main CLI entry point with phase awareness and color-coded output.',
    operatorNote: 'Use aip --help to list all subcommands.',
  },
  {
    id: 'cmd-aip-where',
    command: 'aip where',
    title: 'Phase Context',
    status: 'sealed',
    readonly: true,
    summary: 'Shows current phase, working tree state, and last commit.',
    operatorNote: 'Run before any phase transition to verify context.',
  },
  {
    id: 'cmd-safe-status',
    command: 'aip safe-status',
    title: 'Safety State',
    status: 'ready',
    readonly: true,
    summary: 'Reports current safety state including Stage C, feature flag, boundaries.',
    operatorNote: 'Run before and after each phase to confirm safety.',
  },
  {
    id: 'cmd-receipt-template',
    command: 'aip receipt template',
    title: 'Receipt Template',
    status: 'ready',
    readonly: true,
    summary: 'Generates a phase completion receipt template.',
    operatorNote: 'Use at end of each phase for documentation.',
  },
  {
    id: 'cmd-doctor-encoding',
    command: 'aip doctor encoding',
    title: 'Encoding Doctor',
    status: 'sealed',
    readonly: true,
    summary: 'Detects shell, codepage, color support, unicode, and language settings.',
    operatorNote: 'Use on Windows to verify console encoding health.',
  },
  {
    id: 'cmd-doctor-env',
    command: 'aip doctor env',
    title: 'Environment Doctor',
    status: 'sealed',
    readonly: true,
    summary: 'Environment variable diagnostics tool.',
    operatorNote: 'Use to verify environment variable configuration.',
  },
  {
    id: 'cmd-doctor-ports',
    command: 'aip doctor ports',
    title: 'Ports Doctor',
    status: 'sealed',
    readonly: true,
    summary: 'Port availability diagnostics tool.',
    operatorNote: 'Use to verify port availability before starting services.',
  },
  {
    id: 'cmd-check-full',
    command: 'aip check full',
    title: 'Full Validation Check',
    status: 'ready',
    readonly: true,
    summary: 'Runs full validation suite: typecheck, tests, build, git check.',
    operatorNote: 'Use before any phase commit to ensure quality.',
  },
];

export function getOperatorCommandBridgeRegistry(): CommandBridgeItem[] {
  return OPERATOR_COMMAND_BRIDGE_REGISTRY;
}

export function getOperatorCommandBridgeSummary() {
  const items = OPERATOR_COMMAND_BRIDGE_REGISTRY;
  return {
    total: items.length,
    sealed: items.filter(i => i.status === 'sealed').length,
    ready: items.filter(i => i.status === 'ready').length,
    blocked: items.filter(i => i.status === 'blocked').length,
  };
}
