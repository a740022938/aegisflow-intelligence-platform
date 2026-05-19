# AIP Permission Matrix

## Permission Decisions

| Decision | Meaning | Example Targets |
|----------|---------|----------------|
| `allow_primary_nav` | Visible in left sidebar, accessible to all authenticated users | Advanced Mode, Connector Center, Cost Routing, Assistant Center |
| `allow_sidebar_visible` | Visible in sidebar but within a section group | Memory Hub, OpenAxiom |
| `allow_hidden_direct` | URL-accessible only, not in any menu | Lab Center, Navigation Preview, Permission Evaluator Preview |
| `allow_advanced_hub` | Visible only in Advanced Hub (future) | (reserved) |
| `allow_launchpad_card` | Visible as a card in Center Launchpad (future) | (reserved) |
| `hold_review` | Currently blocked pending review | Governance Center, Inference, Scheduler, Deploy v2 |
| `deny` | Permanently denied in current stage | Stage C, DB Write, External Tool Control, Candidate Processing |

## Allow Primary Nav / Sidebar Visible (6 targets)

| Target | Decision | Risk | Severity | Stage | Allowed Now |
|--------|----------|------|----------|-------|-------------|
| Advanced Mode Preview | allow_primary_nav | low | info | preview_only | Yes |
| Connector Center | allow_primary_nav | low | info | preview_only | Yes |
| Cost Routing | allow_primary_nav | low | info | preview_only | Yes |
| Assistant Center | allow_primary_nav | low | info | preview_only | Yes |
| Memory Hub Readonly | allow_sidebar_visible | low | info | preview_only | Yes |
| OpenAxiom Readonly | allow_sidebar_visible | low | info | preview_only | Yes |

## Hidden Direct / Internal Preview (5 targets)

| Target | Decision | Risk | Severity | Stage | Allowed Now |
|--------|----------|------|----------|-------|-------------|
| Lab Center | allow_hidden_direct | medium | notice | preview_only | No |
| Navigation Preview | allow_hidden_direct | low | info | preview_only | No |
| Permission Evaluator Preview | allow_hidden_direct | low | info | preview_only | No |
| Governance State Machine Preview | allow_hidden_direct | low | info | preview_only | Yes |
| Evidence Schema Preview | allow_hidden_direct | low | info | preview_only | Yes |
| Rollback Preview | allow_hidden_direct | low | info | preview_only | Yes |
| Runtime Readonly Status API Preview | allow_hidden_direct | medium | info | preview_only | Yes |

## Hold Review (3 targets)

| Target | Decision | Risk | Severity | Stage | Blocking Conditions |
|--------|----------|------|----------|-------|---------------------|
| Governance Center | hold_review | medium | warning | manual_review | governance_center_enabled not cleared, Stage C deferred |
| Inference Execution | hold_review | high | blocking | blocked | Stage C not enabled, No runtime evaluator |
| Scheduler Execution | hold_review | high | blocking | blocked | Stage C not enabled, No runtime evaluator |
| Deploy v2 Execution | hold_review | high | blocking | blocked | Stage C not enabled, Deployment Gate design-only |

## Denied (5 targets)

| Target | Decision | Risk | Severity | Stage | Blocking Conditions |
|--------|----------|------|----------|-------|---------------------|
| Stage C Enablement | deny | high | blocking | blocked | Stage C permanently disabled by policy |
| Memory Hub Candidate Processing | deny | high | blocking | blocked | Requires DB write, Stage C not enabled |
| External Tool Control | deny | high | blocking | blocked | Requires Stage C, No runtime authorization |
| Database Write | deny | high | blocking | blocked | Requires Stage C, No DB write authorization |

## Enforcement Stages

| Stage | Meaning | Targets |
|-------|---------|---------|
| `preview_only` | Readonly preview, safe to expose with bounds | 8 targets |
| `manual_review` | Needs human review before exposure change | Governance Center |
| `blocked` | Permanently blocked in v7.x | 6 targets |
| `future` | Reserved for future enablement | 0 targets |

## Severity Classification

| Severity | Meaning | Count |
|----------|---------|-------|
| `info` | No action needed, passive monitoring | 10 |
| `notice` | Awareness recommended | 1 |
| `warning` | Review recommended before changes | 1 |
| `blocking` | Must not be allowed | 6 |

## Connector Action Taxonomy (v7.27.0-D1)

Connector actions are classified into 7 levels. See `AIP_CONNECTOR_ACTION_TAXONOMY.md` for full details.

| Level | Name | Current State |
|-------|------|---------------|
| L0 | view_static | Allowed |
| L1 | view_runtime_status | Partially allowed (no external API calls) |
| L2 | generate_task_package | Allowed (text/JSON only) |
| L3 | dry_run_plan | Design only, not implemented |
| L4 | human_approved_execute | Blocked (needs Stage C) |
| L5 | autonomous_execute | Blocked (needs Stage C) |
| L6 | destructive_or_external_write | Permanently denied |

## Permission Gate Model

See `AIP_CONNECTOR_PERMISSION_GATE_MODEL.md` for full gate model design.

Gates: readonly_gate, dry_run_gate, human_approval_gate, audit_log_gate, rollback_gate, stage_c_gate.

**Permission Evaluator** only recommends, does not execute gates. Gates are a separate execution layer.

## Key Rules

1. **Stage C is permanently disabled.** No activation package exists. All v7.24.0+ work is planning/design-only.
2. **High risk allowedNow must be 0.** Currently 0 high-risk targets are allowed.
3. **Lab/Governance/Navigation Preview must not be primary_nav.** They are hidden direct routes only.
4. **Permission Evaluator is hidden direct only.** Not in sidebar, not primary_nav.
5. **All denied and hold_review rules have documented blocking conditions.**
6. **All rules have a reason and nextAction.**
7. **Connector runtime is design-only in v7.27.** No real execution, no external tool control, no DB write.

## v7.27 Final Seal Status

**v7.27.0 Final Seal: READY** (commit `8f8242a`)
- Runtime Preview Trilogy complete
- All routes hidden direct, not in sidebar
- All high-risk items blocked
- Permission Evaluator unchanged

## v7.28 Governance Preview Reference

v7.28.0-P1 governance state machine preview adds 1 new hidden direct target:
- Governance State Machine Preview added as preview_only hidden direct target (low risk, info, allowed now)
- No changes to existing allow/deny/hold_review decisions
- All v7.28 P1 work is readonly preview — no state transitions, no approval processing, no DB write

v7.28.0-P3 evidence schema preview adds 1 new hidden direct target:
- Evidence Schema Preview added as preview_only hidden direct target (low risk, info, allowed_now=true, no evidence writer, no evidence store, no secret capture, no DB write, no external control, Stage C disabled)

v7.28.0-P4 rollback preview adds 1 new hidden direct target:
- Rollback Preview added as preview_only hidden direct target (low risk, info, allowed_now=true, no rollback executor, no file restore, no git mutation, no DB write, no external control, Stage C disabled)

---

## v7.28+ Status

- **v7.28.0 SEAL:** PASS (V7_28_FINAL_SEAL_READY) — Commit `349b20a`, 2026-05-19
- **v7.29.0-D1 Governance Console:** See `AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md` — design-only, not implemented
- **Stage C:** Remains disabled. No DB write. No external control. No executor implementation.
- **Sidebar:** Governance Console will not enter sidebar until human decision after v7.29 Final Seal.

---

## v7.29.0-P1 Governance Console Aggregator Preview

- **Status:** Established — v7.29.0-P1 complete, commit `pending`
- **Route:** `/governance-console-preview` (hidden direct, not in sidebar)
- **Registry:** `governance-console-registry.ts` — 18 items across 10 domains
- **Validator:** `governance-console-validator.ts` — blocking checks enforced
- **Console does not:** mutate registries, execute actions, write DB, control external tools, enable Stage C
- **Stage C:** Remains disabled
- **Sidebar:** Governance Console Preview not in sidebar

## v7.30.0-D2 Runtime API Contract Freeze — Permission Matrix Impact

v7.30.0-D2 is docs-only and does not change any permission decisions:
- All allow/deny/hold_review decisions unchanged
- Stage C remains permanently disabled
- No execution permission granted
- All blocked capabilities remain blocked (12 total)

## v7.29.0 Final Seal — Permission Matrix Status

- Permission evaluator: PASS (0 blocking)
- All 4 governance console validators: PASS (0 blocking)
- Total PE rules: Updated with 3 new entries (risk dashboard, decision panel, report pack)
- Stage C: Permanently disabled
- No execution permission granted for any capability
