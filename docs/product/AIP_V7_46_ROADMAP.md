# AIP v7.46 — Roadmap

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Baseline:** AIP v7.45 Final Seal — HEAD `c4b89e3`
**D0 Verdict:** `NEEDS_POLISH_BEFORE_RC`
**Target Verdict:** `V7_46_FINAL_SEAL_READY_FOR_LOCAL_RC_WITH_STAGE_C_DISABLED`

---

## Phase Sequence

| Phase | Description | Expected Verdict |
|-------|-------------|------------------|
| D1 | Pre-RC Gap Closure Blueprint | `V7_46_D1_PRE_RC_GAP_CLOSURE_BLUEPRINT_READY` |
| P1 | CLI Completion + Ghost Command Cleanup | `V7_46_P1_CLI_COMPLETION_READY_WITH_NO_GHOST_COMMANDS` |
| P2 | Critical API Security Gap Closure | `V7_46_P2_SECURITY_GAP_CLOSURE_READY_WITH_STAGE_C_DISABLED` |
| P3 | Documentation Overhaul + START_HERE | `V7_46_P3_DOCUMENTATION_OVERHAUL_READY_FOR_PRE_RC` |
| P4 | Web UI Preview Consolidation + Polish | `V7_46_P4_WEB_UI_PREVIEW_POLISH_READY_WITH_STAGE_C_DISABLED` |
| P5 | Final Pre-RC Recheck | `V7_46_FINAL_SEAL_READY_FOR_LOCAL_RC_WITH_STAGE_C_DISABLED` |

## Safety Invariants (all phases)

- Stage C: DISABLED
- Feature flag: OFF
- POST runtime: BLOCKED / PROTECTED
- DB write: BLOCKED / NOT OCCURRED
- Executor: ABSENT
- External control: BLOCKED
- Connector action: BLOCKED
- Repair: PLAN-ONLY
- Memory: READONLY
- Authorization: PREVIEW-ONLY
- Sidebar: no hidden pages added
- No tag
- No GitHub Release

## Delivery Milestones

| Milestone | Phase | Evidence |
|-----------|-------|----------|
| CLI commands exist | P1 | `aip where`, `aip safe-status`, `aip receipt template` verified |
| No ghost commands | P1 | Help text verified |
| Security gaps closed | P2 | Tests + manual verification |
| Restore script safe | P2 | Default plan-only verified |
| START_HERE exists | P3 | File exists at project root |
| README accurate | P3 | Version updated |
| Docs index complete | P3 | All 22+ docs listed |
| Stage C primer exists | P3 | New doc created |
| Preview inventory done | P4 | Inventory doc created |
| Auth Review mapped | P4 | Canonical map created |
| Feature Flag mapped | P4 | Canonical map created |
| Final recheck pass | P5 | Report + receipt generated |

## Explicitly Out of Scope

- Stage C enablement
- Feature flag toggle
- Real restore execution
- New mutation API endpoints
- New hidden preview pages
- New sidebar entries
- GitHub Release or tag
- Service restart
