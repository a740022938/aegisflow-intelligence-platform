# OpenAIP v8 Agent Center Readonly MVP Report

## Baseline

| Item | Value |
|------|-------|
| Starting commit | ef84811 (formal seal recheck) |
| Starting tree | clean |
| Branch | main |
| Prior verdict | OPENAIP_V8_DATA_QUALITY_NAV_FORMAL_SEAL_RECHECK_PASS_WITH_GATE_CLOSED |

## Agent Data Audit (Phase 1)

**Current agent entries before upgrade (in registry):**
- OpenClaw (enabled, L1, runtime_service) — 3 fields, no capabilities/taskReadiness/auditReadiness
- Codex (registered, L1, coding_agent) — same limitations
- Future Agent (disabled, L0, pending) — same limitations

**Missing before upgrade:**
- Claude Code-like coding agent (required)
- Reviewer Agent (required)
- `capabilities` field
- `taskReadiness` / `auditReadiness` fields
- `memoryAccess` / `knowledgeAccess` fields
- `risk` field
- `status` field (separate from lifecycle)
- Permission levels needed bump: OpenClaw→L2, Codex→L3

## Agent Registry Improvements (Phase 2)

- Extended `V8AgentEntry` interface: `status`, `capabilities[]`, `risk`, `taskReadiness`, `auditReadiness`, `memoryAccess`, `knowledgeAccess`
- Added `'planned'` to `V8Lifecycle` type
- **5 agent entries now**: OpenClaw (L2), Claude Code (L3), Codex (L3), Reviewer Agent (L2), Future Agent (L0)
- Every entry has: dataSource, safetyNote, blockedActions, futurePhase, risk, capabilities, taskReadiness, auditReadiness, memoryAccess, knowledgeAccess
- All `gateOpen: false`, all `stageCEnabled: false`
- Summary function upgraded with `planned`, `riskHigh/Medium/Low`, `l0-l5`, `taskReady/Partial/NotReady`, `auditReady/Partial/NotReady` counts
- `agents.example.json` upgraded to mirror all 5 entries with full fields

## Agent Center UI (Phase 3)

Upgraded from config-based shared preview to a full standalone MVP page:

- **Header**: Title, subtitle, 5 badges (Readonly Preview, No runtime mutation, Gate CLOSED, Stage C disabled, Registry-backed)
- **Global Status Strip**: 7 safety badges
- **Agent Summary Strip**: Counts for Total/Enabled/Registered/Planned/Disabled/L0/L1/L2/L3/High Risk/Blocked
- **Agent Registry Table**: 10-column table (Name, Kind, Lifecycle, Permission, Risk, Capabilities, Task, Audit, Memory, Knowledge) with color-coded badges
- **Lifecycle Panel**: All 6 lifecycle states with descriptions
- **Permission Ladder**: L0-L5 with descriptions and explicit "This preview does not grant L4/L5 actions"
- **Task + Audit Linkage**: Safe links to Task Center, Audit Center, Policy/Capability Center, Execution Gateway
- **Safety Boundary**: 8-item list (no execution, no OpenClaw launch, no browser control, etc.)
- **Related Centers**: Task Center, Policy/Capability Center
- **Footer**: Standard safety text
- **Back link**: "← Back to OpenAIP v8 Command Center"

## CLI Changes (Phase 4)

Enhanced `aip agents` command:
- Shows agent count breakdown (enabled/registered/planned/disabled/high risk/execution blocked)
- `aip agents list` and `aip agents status` show per-agent: name, lifecycle, permission, risk, capabilities
- Explicit: "Execution is blocked for all agents. Gate CLOSED. Stage C disabled."
- No runtime/execution capability added

## Test Results (Phase 5)

- Added 14 new tests specific to Agent Center MVP
- Total: 30 tests, 30/30 pass
- Covers: route existence, agent entries, lifecycle/permission labels, Gate/Stage C/no-mutation, related center links, safety boundary, permission ladder, summary strip, CLI agents output, example JSON completeness, OpenClaw not-executing, no risky labels

## Safety Boundary

All Gate/Stage C/Launch/Execute/Release/Restore hits are readonly safety text, blockedActions lists, test assertions, or data fields (all gateOpen: false, stageCEnabled: false). No actionable controls added. No sidebar exposure. No runtime/DB/config changes.

## Final Verdict

**OPENAIP_V8_AGENT_CENTER_READONLY_MVP_READY_WITH_GATE_CLOSED**
