# OpenAIP v8 Policy + Capability Center Readonly MVP Report

## Baseline

| Item | Value |
|------|-------|
| Starting commit | a504138 (Audit Center MVP) |
| Starting tree | clean |
| Branch | main |
| Prior verdict | OPENAIP_V8_AUDIT_CENTER_READONLY_MVP_READY_WITH_GATE_CLOSED |

## Capability Data Audit (Phase 1)

**Current capability entries before upgrade:**
- 8 entries with minimal fields: id, kind, risk, permissionLevel, requiresGate?, requiresStageC?
- No name, category, defaultPolicy, approvalRequired, gateRequired (dedicated), stageCRequired, auditRequired, allowedInPreview, blockedReason, examples, relatedCenters
- `V8CapabilityEntry` interface: 5 data fields + V8BaseEntry
- `capabilities.example.json`: 2 entries
- No capability matrix display

**Current policy entries before upgrade:**
- 3 entries with minimal fields: id, gateOpen, stageCEnabled, rule
- No name, permissionLevel, scope, allowedCapabilities[], blockedCapabilities[], approvalRequired, gateRequired, stageCRequired, auditRequired, defaultState, appliesTo, enforcementPhase
- `V8PolicyEntry` interface: 4 data fields + V8BaseEntry
- `policies.example.json`: 1 entry
- No policy matrix display

## Registry Improvements (Phase 2-3)

- Extended `V8CapabilityEntry` with: name, category, defaultPolicy, approvalRequired, gateRequired, stageCRequired, auditRequired, allowedInPreview, blockedReason, examples[], relatedCenters[]
- Extended `V8PolicyEntry` with: name, permissionLevel, scope, allowedCapabilities[], blockedCapabilities[], approvalRequired, gateRequired, stageCRequired, auditRequired, defaultState, appliesTo[], enforcementPhase
- **10 capability entries**: Read Repository (low), Draft Patch (medium), Edit Files (high), Run Tests (medium), Call Model (medium), Write Memory (high), Launch Local App (high), Execute Command (critical), Create Release/Tag (critical), Open Gate (critical)
- **7 policy entries**: Read-only Observer (L1), Suggest Planner (L2), Draft Worker (L3), Apply Approval (L4), Gated Execution (L5), Memory Draft (L3), Release Boundary (L0)
- Summary functions upgraded with counts for approval/Gate/Stage C/audit requirements, preview blocking, L0-L5 coverage

## Policy + Capability Center UI (Phase 4)

Upgraded from config-based shared preview to standalone MVP page:

- **Header**: Title, subtitle, 6 badges (Readonly, No runtime mutation, Gate CLOSED, Stage C disabled, Registry-backed, No policy mutation)
- **Global Status Strip**: 7 safety badges including No policy mutation
- **Summary Strip**: Counts for Capabilities/Low/Medium/High/Critical/Blocked/Approval/Gate/Audit/Policies
- **Capability Matrix**: 11-column table (Name, Category, Risk, Default, Permission, Approval, Gate, Stage C, Audit, Preview, Blocked Reason)
- **Policy Matrix**: 10-column table (Name, Level, Scope, Default, Approval, Gate, Audit, Enforcement, Allowed Caps, Blocked Caps)
- **Permission Ladder**: L0-L5 with descriptions, L4/L5 warning
- **Rules Panel**: 8 core rules (capability != permission, config != permission, etc.)
- **Center Linkage**: Links to Agent, Task, Audit, Execution Gateway, Command Center
- **Safety Boundary**: 8 forbidden actions

## CLI Changes (Phase 5)

Enhanced `aip policy` command:
- Shows policy + capability counts, risk distribution, approval/Gate/audit requirements
- `aip policy list` shows per-policy: id, level, scope, approval/gate/audit, state
- `aip policy status` shows capability summary with risk, perms, block status
- `aip policy capabilities` shows capability catalog with name, category, risk, preview status
- Explicit: "No policy mutation. No capability enablement. No Gate opening."

## Test Results (Phase 6)

- Added 15 new tests specific to Policy + Capability Center MVP
- Total: 71 tests, 71/71 pass
- Covers: route existence, Capability Matrix/Policy Matrix/Permission Ladder panels, risk levels, L0-L5, safety phrases, center links, CLI output, example JSONs, critical capabilities blocked, Core Rules panel, safety boundary, no risky labels

## Safety Boundary

All risky label hits are safety text, blocked/rule text, data fields (all gateOpen: false, stageCEnabled: false), or safe navigation links. No actionable controls added.

## Final Verdict

**OPENAIP_V8_POLICY_CAPABILITY_CENTER_READONLY_MVP_READY_WITH_GATE_CLOSED**
