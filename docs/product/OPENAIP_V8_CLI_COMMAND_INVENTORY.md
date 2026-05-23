# OpenAIP v8 CLI Command Inventory

This inventory reflects source-level inspection of `apps/aip-cli/src/index.ts` and the relevant command modules at acceptance-pack time. Commands not present in the current source are marked `not confirmed`.

| Command | Purpose | Readonly | Source | Runtime action | Safety notes | Future direction |
|---|---|---:|---|---:|---|---|
| `aip` | Prints command center homepage and grouped command list. | yes | `apps/aip-cli/src/index.ts` | no | Shows process-affecting commands but does not run them by itself. | Keep copy clear and mark process commands distinctly. |
| `aip where` | Shows project root and Git summary. | yes | `commands/where.ts` | no | Reads filesystem/Git status only. | Keep as first diagnostic for operator context. |
| `aip status` | Shows runtime status overview. | yes | `commands/status.ts` | no mutation | May inspect local runtime status. | Keep as safe runtime overview. |
| `aip health` | Checks local API health. | yes | `commands/health.ts` | local read/probe only | Should not start or restart services. | Keep as health evidence command. |
| `aip v8 status` | Shows v8 foundation status, registry-backed center coverage, Gate CLOSED, Stage C disabled. | yes | `commands/v8.ts` | no | Explicitly prints no runtime mutation, DB write, restart, release/tag. | Keep as product acceptance status summary. |
| `aip v8 centers` | Lists all 10 hidden readonly v8 preview routes. | yes | `commands/v8.ts` | no | States routes are direct/hidden and not exposed in sidebar. | Keep route inventory in sync with route smoke test. |
| `aip agents` | Shows Agent Center summary and subcommands. | yes | `commands/agents.ts` | no | Static/example registry, no agent execution. | Add richer live health only after Gate policy exists. |
| `aip agents list` | Lists agent lifecycle, permission, risk, and capabilities. | yes | `commands/agents.ts` | no | Execution blocked for all agents; Gate CLOSED; Stage C disabled. | Future task-agent binding should stay gated. |
| `aip task` | Shows Task Center summary and subcommands. | yes | `commands/task.ts` | no | No task execution or agent dispatch. | Future intake parser should start readonly. |
| `aip task list` | Lists task archetypes with lifecycle, risk, review state, and evidence. | yes | `commands/task.ts` | no | Static/example registry only. | Add receipt parsing after readonly acceptance. |
| `aip audit` | Shows Audit Center summary and subcommands. | yes | `commands/audit.ts` | no | No audit DB write or receipt mutation. | Future readonly audit index can consolidate receipts. |
| `aip audit list` | Lists audit entries with acceptance state, evidence, commit, push, and tree status. | yes | `commands/audit.ts` | no | Static/example audit entries. | Add docs-backed index before any DB-backed index. |
| `aip policy` | Shows Policy + Capability summary. | yes | `commands/policy.ts` | no | No policy mutation or capability enablement. | Add role-based visibility only after design review. |
| `aip policy list` | Lists policies with permission, scope, approval/Gate/audit requirements. | yes | `commands/policy.ts` | no | No Gate opening. | Keep policy-before-buttons rule visible. |
| `aip providers` | Shows Provider Manager summary. | yes | `commands/providers.ts` | no | No provider switching, model call, config write, or secret display. | Add provider profile refinement, not config mutation. |
| `aip providers list` | Lists provider profiles and readonly state. | yes | `commands/providers.ts` | no | Static/example registry. | Future provider routing must require authorization. |
| `aip integrations` | Shows Integration Center summary. | yes | `commands/integrations.ts` | no | No connector action, external call, or config write. | Legacy connector migration labels can be refined. |
| `aip integrations list` | Lists integrations with mode, auth state, action state, readonly flag. | yes | `commands/integrations.ts` | no | Static/example registry. | Future connector action remains high-risk and gated. |
| `aip apps` | Shows Local Apps Center summary. | yes | `commands/apps.ts` | no | No app launch or local API call. | Future launch plan requires human authorization. |
| `aip apps list` | Lists local apps with configured/running/launch/readonly state. | yes | `commands/apps.ts` | no | Running state is registry data, not a live launch. | Future local app probes should be readonly first. |
| `aip execution-gateway status` | Shows execution boundary counts and closed Gate state. | yes | `commands/execution-gateway.ts` | no | No execution, no Gate opening, no Stage C enablement. | Dry-run runner only after explicit authorization. |
| memory/knowledge commands | Dedicated memory/knowledge CLI command. | not confirmed | `apps/aip-cli/src/index.ts` | not confirmed | No dedicated command found in current source inspection. | Consider `aip memory` or `aip knowledge` only after readonly command design. |

## Non-Readonly Commands Visible In CLI Help

The CLI also contains service/process commands such as `aip start`, `aip stop`, `aip restart`, `aip gateway start`, `aip gateway stop`, and config setters. They are outside this acceptance pack. This pack did not run or change them.
