export type CommandRisk = 'SAFE' | 'READ' | 'PROC' | 'ASK' | 'BLOCK' | 'INFO';

export interface CommandCatalogItem {
  id: string;
  command: string;
  category: string;
  risk: CommandRisk;
  summary: string;
  example: string;
  aliases?: string[];
  detail?: string;
}

export const COMMAND_CATALOG: CommandCatalogItem[] = [
  { id: 'status', command: 'aip status', category: 'Quick Start', risk: 'SAFE', summary: 'Runtime overview for API, Web, PID, and ports.', example: 'aip status' },
  { id: 'health', command: 'aip health', category: 'Quick Start', risk: 'SAFE', summary: 'Read-only API health check.', example: 'aip health' },
  { id: 'open', command: 'aip open', category: 'Quick Start', risk: 'SAFE', summary: 'Open the Web UI console.', example: 'aip open' },
  { id: 'next', command: 'aip next', category: 'Quick Start', risk: 'SAFE', summary: 'Read-only next-step guidance.', example: 'aip next' },

  { id: 'start', command: 'aip start', category: 'Service Control', risk: 'PROC', summary: 'Start AIP services.', example: 'aip start' },
  { id: 'stop', command: 'aip stop', category: 'Service Control', risk: 'PROC', summary: 'Stop AIP services.', example: 'aip stop' },
  { id: 'restart', command: 'aip restart', category: 'Service Control', risk: 'ASK', summary: 'Restart AIP services with human awareness.', example: 'aip restart' },
  { id: 'logs', command: 'aip logs api', category: 'Service Control', risk: 'READ', summary: 'Read service logs. Also supports web and gateway.', example: 'aip logs api' },

  { id: 'version', command: 'aip version', category: 'Diagnostics', risk: 'READ', summary: 'Show CLI and product version information.', example: 'aip version' },
  { id: 'doctor', command: 'aip doctor [env|encoding|ports|stage-c]', category: 'Diagnostics', risk: 'READ', summary: 'Run read-only diagnostics.', example: 'aip doctor ports' },
  { id: 'release-status', command: 'aip release-status', category: 'Diagnostics', risk: 'SAFE', summary: 'Show release state summary.', example: 'aip release-status' },
  { id: 'safe-status', command: 'aip safe-status', category: 'Diagnostics', risk: 'SAFE', summary: 'Show safety boundary summary.', example: 'aip safe-status' },
  { id: 'where', command: 'aip where', category: 'Diagnostics', risk: 'SAFE', summary: 'Show resolved project root and Git state.', example: 'aip where' },

  { id: 'config', command: 'aip config get', category: 'Config', risk: 'ASK', summary: 'Read or update CLI configuration. Also supports init and set.', example: 'aip config get' },
  { id: 'gateway', command: 'aip gateway status', category: 'Gateway & ML', risk: 'ASK', summary: 'Inspect or control OpenClaw gateway wrapper. Start/stop/restart require care.', example: 'aip gateway status' },
  { id: 'execution-gateway', command: 'aip execution-gateway status', category: 'Gateway & ML', risk: 'READ', summary: 'Show v8 execution gateway boundary summary.', example: 'aip execution-gateway status' },
  { id: 'ml', command: 'aip ml', category: 'Gateway & ML', risk: 'SAFE', summary: 'Print the machine-local command manual.', example: 'aip ml', aliases: ['manual'] },

  { id: 'repair', command: 'aip repair plan', category: 'Repair', risk: 'SAFE', summary: 'Plan-only repair system; source writes remain blocked by default.', example: 'aip repair plan' },
  { id: 'receipt', command: 'aip receipt template', category: 'Utilities', risk: 'SAFE', summary: 'Generate a receipt template.', example: 'aip receipt template' },
  { id: 'commands', command: 'aip commands [query]', category: 'Utilities', risk: 'SAFE', summary: 'Searchable command catalog with safety tags.', example: 'aip commands gateway' },

  { id: 'agents', command: 'aip agents [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Agent Center readonly registry view.', example: 'aip agents list' },
  { id: 'integrations', command: 'aip integrations [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Integration Center readonly registry view.', example: 'aip integrations list' },
  { id: 'providers', command: 'aip providers [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Provider Manager readonly registry view.', example: 'aip providers list' },
  { id: 'apps', command: 'aip apps [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Local Apps Center readonly registry view.', example: 'aip apps list' },
  { id: 'runtime', command: 'aip runtime [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Runtime Kernel readonly registry view.', example: 'aip runtime status' },
  { id: 'task', command: 'aip task [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Task Center readonly registry view.', example: 'aip task list' },
  { id: 'audit', command: 'aip audit [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Audit Center readonly registry view.', example: 'aip audit status' },
  { id: 'policy', command: 'aip policy [list|status]', category: 'OpenAIP v8', risk: 'READ', summary: 'Policy and capability readonly registry view.', example: 'aip policy list' },
  { id: 'v8', command: 'aip v8 <centers|status>', category: 'OpenAIP v8', risk: 'READ', summary: 'OpenAIP v8 foundation status and center routes.', example: 'aip v8 centers' },
];

export function commandIds() {
  return new Set(COMMAND_CATALOG.flatMap((item) => [item.id, ...(item.aliases || [])]));
}

export function getCommandHelp(command: string) {
  const item = COMMAND_CATALOG.find((entry) => entry.id === command || entry.aliases?.includes(command));
  if (!item) return null;
  return [
    item.command,
    `  ${item.summary}`,
    `  Category: ${item.category}`,
    `  Safety:   [${item.risk}]`,
    `  Example:  ${item.example}`,
    item.aliases?.length ? `  Aliases:  ${item.aliases.join(', ')}` : '',
  ].filter(Boolean).join('\n');
}

function distance(a: string, b: string) {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

export function suggestCommands(input: string) {
  const names = Array.from(commandIds());
  return names
    .map((name) => ({ name, score: distance(input.toLowerCase(), name.toLowerCase()) }))
    .filter((item) => item.score <= Math.max(2, Math.floor(input.length / 2)))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map((item) => item.name);
}
