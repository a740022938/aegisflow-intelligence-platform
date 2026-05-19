# Governance Console Decision Panel Spec

> **v7.29.0-D1** · Design Specification · Not Implemented  
> **Core Tenet:** Display recommendations. Never execute.

---

## 1. Decision Types

| Type | Meaning | Display |
|------|---------|---------|
| `continue_preview` | System is in preview state; continue readonly evaluation | Green indicator |
| `run_final_seal_recheck` | Consider running a full seal recheck | Yellow indicator |
| `hold_for_human_review` | Human review required before any next step | Red indicator |
| `generate_report` | System can generate an aggregated report | Blue indicator |
| `blocked` | A blocking condition prevents progress | Red indicator with reason |
| `future_stage_c_only` | Capability requires Stage C which is disabled | Gray indicator |

## 2. Display Fields

Each decision displays:
- Decision type label
- Reason (computed from registry data)
- Recommended next step (human-readable text)
- Blocking reason (if blocked)
- Rollback requirement (if any)
- Human approval requirement (if any)

## 3. Prohibited Display Elements

The Decision Panel must NOT display:
- Approve / Reject buttons
- Execute / Apply buttons
- Stage transition buttons
- DB write buttons
- External control buttons
- Any form input fields
- Any token/API key fields

## 4. How Recommendations Are Computed

Recommendations are computed from registry data:
- If any registry has `allowedNow=false` items → recommendation considers blocking
- If any item requires human approval → `hold_for_human_review`
- If all registries are consistent → `continue_preview`
- If any critical risk exists → `blocked`
- If Stage C is required → `future_stage_c_only`

## 5. Blocking Reason Display

When blocked, display:
1. Which registry item is blocking
2. Why it is blocked
3. What condition must change (e.g., "Stage C must be enabled" — but Stage C is permanently disabled)
4. That no automatic unblocking is possible

## 6. Rollback Requirement Display

When rollback is required:
1. Display rollback readiness from Rollback Registry
2. Link to Rollback Preview
3. Note that rollback executor is not implemented

## 7. Human Approval Requirement Display

When human approval is required:
1. Display which items require approval
2. Link to Human Approval Workflow Preview
3. Note that approval queue is not implemented

---

## v7.29.0-P1 Governance Console Aggregator Preview

- **Status:** Established — v7.29.0-P1 complete, commit `pending`
- **Route:** `/governance-console-preview` (hidden direct, not in sidebar)
- **Registry:** `governance-console-registry.ts` — 18 items across 10 domains
- **Validator:** `governance-console-validator.ts` — blocking checks enforced
- **Console does not:** mutate registries, execute actions, write DB, control external tools, enable Stage C
- **Stage C:** Remains disabled
- **Sidebar:** Governance Console Preview not in sidebar
