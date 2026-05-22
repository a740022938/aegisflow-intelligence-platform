# Receipt: OpenAIP v8 Policy + Capability Center Readonly MVP

**Commit:** TBD after push
**Parent:** a504138
**Date:** 2026-05-23

## Files Changed

| File | Type |
|------|------|
| apps/web-ui/src/registry/openAipv8CenterData.ts | Extended (V8CapabilityEntry + V8PolicyEntry full fields; 10 capabilities; 7 policies; upgraded summaries) |
| apps/web-ui/src/pages/OpenAIPv8PolicyCapabilityCenterPreview.tsx | Rewritten (standalone MVP page from config-based shared component) |
| apps/aip-cli/src/commands/policy.ts | Rewritten (list/status/capabilities with full fields) |
| apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs | Extended (71 total, +15 new) |
| docs/product/examples/capabilities.example.json | Rewritten (10 entries with full fields) |
| docs/product/examples/policies.example.json | Rewritten (7 entries with full fields) |
| docs/product/OPENAIP_V8_POLICY_CAPABILITY_CENTER_READONLY_MVP_REPORT.md | New (this report) |
| docs/product/receipts/OPENAIP_V8_POLICY_CAPABILITY_CENTER_READONLY_MVP_RECEIPT.md | New (this receipt) |

## Registry Additions

- V8CapabilityEntry: +9 new fields (name, category, defaultPolicy, approvalRequired, gateRequired, stageCRequired, auditRequired, allowedInPreview, blockedReason, examples, relatedCenters)
- V8PolicyEntry: +12 new fields (name, permissionLevel, scope, allowedCapabilities[], blockedCapabilities[], approvalRequired, gateRequired, stageCRequired, auditRequired, defaultState, appliesTo[], enforcementPhase)
- 10 capabilities across 6 categories (read, write, execute, launch, release, gate)
- 7 policies covering L0-L5 permission ladder

## UI Panels

- Capability Matrix (11 columns), Policy Matrix (10 columns), Permission Ladder, Core Rules, Center Linkage, Safety Boundary

## Test Results

- 71/71 tests pass (28 old + 14 Agent + 15 Task + 13 Audit + 15 Policy/Capability)
- 0 tsc errors, 0 build errors

## Safety

- All gateOpen: false, stageCEnabled: false
- No actionable controls added
- No policy mutation, no capability enablement, no Gate opening, no Stage C enablement, no release/tag/restore

## Signature

`OPENAIP_V8_POLICY_CAPABILITY_CENTER_READONLY_MVP_READY_WITH_GATE_CLOSED`
