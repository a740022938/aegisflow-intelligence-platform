# AIP v7.43 — Operator Decision Workflow Hardening

**Status:** P4 Hardening
**Date:** 2026-05-20
**Baseline:** AIP v7.42 Final Seal

---

## 1. Purpose

Standardize the operator decision workflow into a readonly, judgment-based model that answers "can we proceed to the next step?" The workflow provides a clear recommendation without executing any actions.

## 2. Decision States

| State | Meaning |
|-------|---------|
| `READY` | All checks pass |
| `READY_WITH_DEFERRED_SMOKE` | All checks pass, smoke deferred |
| `BLOCKED_NEEDS_AUTHORIZATION` | Authorization required |
| `BLOCKED_DIRTY_WORKTREE` | Working tree not clean |
| `BLOCKED_VALIDATION_FAILURE` | Typecheck/test/build failure |
| `BLOCKED_SAFETY_BOUNDARY` | Safety boundary violation |

## 3. Decision Checks (10)

1. **Current Baseline Check** — Verify known git baseline
2. **Working Tree Check** — Confirm clean working tree
3. **Validation Check** — Typecheck, tests, build all pass
4. **Smoke Evidence Check** — Smoke tests pass or deferred
5. **Safety Boundary Check** — All boundaries intact
6. **Authorization Check** — Stage C requires explicit human authorization
7. **Repair State Check** — Repair remains plan-only
8. **Memory Confidence Check** — Memory adequate for operations
9. **Route Exposure Check** — No sidebar exposure of hidden pages
10. **Final Recommendation** — Synthesize all checks

## 4. Delivery

- `apps/web-ui/src/registry/operator-decision-workflow-registry.ts`
- `apps/web-ui/src/registry/operator-decision-workflow-validator.ts`

## 5. Updated Docs

- `docs/product/AIP_V7_42_STAGE_C_NO_GO_MATRIX.md` — updated for v7.43
- `docs/product/AIP_V7_42_OPERATOR_RECEIPT_TEMPLATE.md` — updated for v7.43
- `docs/product/AIP_V7_42_NEXT_STEP_POLICY.md` — updated for v7.43

## 6. Safety

The decision workflow is readonly. It provides judgment only — it does not execute any action, toggle any flag, or enable any capability.
