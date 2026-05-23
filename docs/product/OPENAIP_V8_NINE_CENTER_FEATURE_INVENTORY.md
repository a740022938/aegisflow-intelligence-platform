# OpenAIP v8 Nine-Center Feature Inventory

This inventory freezes the readonly product surface for the OpenAIP v8 Readonly Agent Control Plane MVP. The historical label is "nine-center"; the accepted route set contains 10 direct preview routes because Execution Gateway is the execution boundary governance page.

## Route List

| # | Center | Route |
|---|---|---|
| 1 | Command Center | `/openaip-v8-command-center-preview` |
| 2 | Agent Center | `/openaip-v8-agent-center-preview` |
| 3 | Task Center | `/openaip-v8-task-center-preview` |
| 4 | Provider Manager | `/openaip-v8-provider-manager-preview` |
| 5 | Integration Center | `/openaip-v8-integration-center-preview` |
| 6 | Local Apps Center | `/openaip-v8-local-apps-center-preview` |
| 7 | Memory + Knowledge Center | `/openaip-v8-memory-knowledge-center-preview` |
| 8 | Policy + Capability Center | `/openaip-v8-policy-capability-center-preview` |
| 9 | Audit Center | `/openaip-v8-audit-center-preview` |
| 10 | Execution Gateway | `/openaip-v8-execution-gateway-preview` |

## Center Details

| Center | Purpose | Main sections | Registry/data source | CLI linkage | Safety boundary | Current limitations | Next likely phase |
|---|---|---|---|---|---|---|---|
| Command Center | Hub and registry overview for the readonly control plane. | Summary status, center navigation, route inventory, safety posture. | `openAipv8CenterData.ts`, route smoke test, v8 CLI route list. | `aip`, `aip v8 status`, `aip v8 centers`. | Direct hidden route, Gate CLOSED, Stage C disabled, no runtime mutation. | Preview hub only, no sidebar exposure, no live orchestration. | Visual acceptance smoke and copy cleanup. |
| Agent Center | AI agent lifecycle, permission, capability, and readiness governance. | Agent registry, permission ladder, related centers, safety boundary. | `V8_AGENTS`, `docs/product/examples/agents.example.json`. | `aip agents`, `aip agents list`, `aip agents status`. | No agent execution, no OpenClaw launch, no browser control, no Gate opening. | Static/example registry, no live health binding, no task-agent dispatch. | Agent health dashboard and task-agent binding design. |
| Task Center | Task pack, receipt, review queue, and evidence discipline. | Task archetypes, lifecycle, receipt intake, review states, evidence requirements. | `V8_TASKS`, `docs/product/examples/tasks.example.json`. | `aip task`, `aip task list`, `aip task status`. | No task execution, no agent dispatch, no runtime mutation. | Intake is readonly, no parser/writer, no receipt DB. | Deeper task/receipt intake parsing, still readonly first. |
| Provider Manager | Provider profile and routing governance without config mutation. | Provider matrix, secret safety, routing preview, switcher reference. | `V8_PROVIDERS`, `docs/product/examples/providers.example.json`. | `aip providers`, `aip providers list`. | No provider switching, no model calls, no API key display, no config write. | Static/provider-example only, no live provider API calls. | Provider visibility and role-based gating plan. |
| Integration Center | External service and bridge governance. | Integration matrix, handshake matrix, legacy connector migration, action safety. | `V8_INTEGRATIONS`, `V8_CONNECTOR_MIGRATIONS`, `docs/product/examples/integrations.example.json`. | `aip integrations`, `aip integrations list`, `aip integrations matrix`. | No connector actions, no external calls, no config writes. | Static reference only, legacy Connector Center still exists. | Legacy entry cleanup plan and migration labels. |
| Local Apps Center | Local app and runtime-service inventory without launching apps. | Local apps matrix, app-provider relationships, OpenAxiom positioning, local runtime safety. | `V8_LOCAL_APPS`, relation matrix, `docs/product/examples/local-apps.example.json`. | `aip apps`, `aip apps list`. | No local app launch, no local app API call, no runtime mutation. | Installed/running values are static or unknown, not live probes. | Role-based visibility and local app launch authorization design. |
| Memory + Knowledge Center | Readonly memory, knowledge, reports, receipts, pitfalls, and access modes. | Source matrix, relation matrix, memory access modes, knowledge source registry, known pitfalls. | `V8_MEMORY_KNOWLEDGE`, relation rows, memory/knowledge docs. | No dedicated memory/knowledge CLI command confirmed in current source. Related through `aip v8 status`. | No memory write, no vector write, no indexing job, no external knowledge call. | Conceptual/index references only, no live indexing or memory DB access. | Audit index prototype and screenshot evidence workflow, readonly first. |
| Policy + Capability Center | Policy and capability governance before execution controls. | Policy list, capability catalog, core rules, blocked capabilities. | `V8_POLICIES`, `V8_CAPABILITIES`, CLI policy constants. | `aip policy`, `aip policy list`, `aip policy status`, `aip policy capabilities`. | No policy mutation, no capability enablement, no Gate opening, no Stage C enablement. | Static policy/capability catalog, no backend enforcement mutation. | Role-based visibility and human authorization packet design. |
| Audit Center | Acceptance, evidence, receipt, and rejection-rule governance. | Audit entries, receipt requirements, acceptance states, evidence levels. | `V8_AUDITS`, CLI audit static registry, product receipts. | `aip audit`, `aip audit list`, `aip audit status`, `aip audit requirements`. | No audit DB write, no receipt mutation, no approval mutation. | Static/example audit entries, no persistent audit index. | Readonly audit index prototype and evidence screenshot workflow. |
| Execution Gateway | Execution boundary governance with closed Gate and disabled Stage C. | Execution boundary matrix, approval chain, Gate + Stage C truth, blocked actions. | `V8_EXECUTION_BOUNDARIES`, `apps/aip-cli/src/commands/execution-gateway.ts`. | `aip execution-gateway status`, `aip v8 status`. | No execution controls, no Gate opening, no Stage C enablement, no DB write, no connector action. | Boundary model only, no dry-run runner and no execution runner. | Dry-run runner design only after explicit human authorization. |
