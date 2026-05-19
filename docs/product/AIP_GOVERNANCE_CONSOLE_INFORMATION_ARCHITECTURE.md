# Governance Console Information Architecture

> **v7.29.0-D1** · Design Specification · Not Implemented  
> **Core Tenet:** Read-only information architecture. No executable buttons. No DB writes.

---

## 1. Overview

The Governance Console is organized into 6 sections, each providing a distinct read-only view of governance data.

## 2. Section A — Overview

Displays:
- Overall system readiness score (derived from registry readiness fields)
- Blocker count and list (aggregated from all registries)
- Warning count and list
- Registry chain status (checkmark/cross for each registry)
- Stage C status indicator (always DISABLED)
- Last seal recheck reference

Read-only fields:
- Readiness: computed from registry data
- Blockers: read from registries
- Warnings: read from registries
- Stage C: hardcoded DISABLED

## 3. Section B — Registry Chain

Displays a table of all 7 governance registries plus Runtime/Dry-run/Audit:

| Registry | Items | allowedNow | Blocked | Validator | Preview Link |
|----------|-------|------------|---------|-----------|--------------|
| Runtime Registry | N | N | N | PASS/FAIL | /runtime-registry-preview |
| Dry-run Plan | N | N | N | PASS/FAIL | /dry-run-plan-preview |
| Audit Log | N | N | N | PASS/FAIL | /audit-log-preview |
| Governance State | N | N | N | PASS/FAIL | /governance-state-machine-preview |
| Human Approval | N | N | N | PASS/FAIL | /human-approval-workflow-preview |
| Evidence Schema | N | N | N | PASS/FAIL | /evidence-schema-preview |
| Rollback | N | N | N | PASS/FAIL | /rollback-preview |
| Permission Evaluator | N | N | N | PASS/FAIL | /permission-evaluator-preview |

All links open in same tab (hidden direct routes).

## 4. Section C — Risk Aggregation

Displays aggregated risk counts:
- Total items across all registries
- High/critical items
- Blocked items
- Items requiring Stage C
- Items requiring DB write
- Items requiring external control
- Items requiring human approval
- Items requiring evidence
- Items requiring rollback

See `AIP_GOVERNANCE_CONSOLE_RISK_AGGREGATION_SPEC.md` for details.

## 5. Section D — Decision Panel

Displays:
- Recommended next step text
- Cannot-execute notice
- Can-generate-report indication
- Can-open-readonly-previews links

See `AIP_GOVERNANCE_CONSOLE_DECISION_PANEL_SPEC.md` for details.

## 6. Section E — Evidence / Audit / Rollback Trace

Displays:
- Evidence availability across registries
- Audit event readiness
- Rollback readiness summary
- Links to Evidence Schema Preview, Audit Log Preview, Rollback Preview

## 7. Section F — Validation Panel

Displays:
- TypeScript compilation status
- ESLint status
- Build status
- db:doctor status (if available)
- secret:scan status (if available)
- smoke test status (if available)
- Script parity notes

## 8. Design Constraints

- No section has executable buttons
- No section writes to any data store
- No section controls external tools
- No section triggers real actions
- All sections are purely aggregative/display

---

## v7.29.0-P1 Governance Console Aggregator Preview

- **Status:** Established — v7.29.0-P1 complete, commit \`600a029\`
- **Route:** `/governance-console-preview` (hidden direct, not in sidebar)
- **Registry:** `governance-console-registry.ts` — 18 items across 10 domains
- **Validator:** `governance-console-validator.ts` — blocking checks enforced
- **Console does not:** mutate registries, execute actions, write DB, control external tools, enable Stage C
- **Stage C:** Remains disabled
- **Sidebar:** Governance Console Preview not in sidebar

## v7.29.0-P2/P3/P4 Acceleration Pack (completed)

- P2 Risk Dashboard Preview — \`/governance-console-risk-dashboard-preview\` (hidden direct)
- P3 Decision Panel Preview — \`/governance-console-decision-panel-preview\` (hidden direct)
- P4 Report Pack Preview — \`/governance-console-report-pack-preview\` (hidden direct)
- All 3 validators: blocking=0, all pass ✓
- Stage C: Remains disabled
- Total hidden preview routes: 15

## v7.29 Final Seal

- **Status:** V7_29_FINAL_SEAL_READY
- All v7.29 validators pass (0 blocking)
- No Stage C, no DB write, no external control, no executor
