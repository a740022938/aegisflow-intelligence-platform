# AIP v7.43 — Operator Decision Workflow Blueprint

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** AIP v7.42 Final Seal

---

## 1. Purpose

Standardize the operator decision workflow into a readonly, judgment-based model that answers "can we proceed to the next step?"

## 2. Decision Checks

1. Current Baseline Check
2. Working Tree Check
3. Validation Check (typecheck, tests, build)
4. Smoke Evidence Check
5. Safety Boundary Check
6. Authorization Check
7. Repair State Check
8. Memory Confidence Check
9. Route Exposure Check
10. Final Recommendation

## 3. Decision States

| State | Meaning |
|-------|---------|
| `READY` | All checks pass |
| `READY_WITH_DEFERRED_SMOKE` | All checks pass, smoke deferred |
| `BLOCKED_NEEDS_AUTHORIZATION` | Authorization required |
| `BLOCKED_DIRTY_WORKTREE` | Working tree not clean |
| `BLOCKED_VALIDATION_FAILURE` | Typecheck/test/build failure |
| `BLOCKED_SAFETY_BOUNDARY` | Safety boundary violation |

## 4. Delivery

- `apps/web-ui/src/registry/operator-decision-workflow-registry.ts`
- `apps/web-ui/src/registry/operator-decision-workflow-validator.ts`
- Updated no-go matrix and next-step policy docs

## 5. Safety

The decision workflow is readonly. It provides judgment only — it does not execute any action.
