# AIP v7.54-D1 Datasets Go/No-Go Decision

**Date:** 2026-05-21

---

## 1. Decision

```text
CONDITIONAL_GO_FOR_V7_54_P1_ONLY_IF_ALL_ACCEPTANCE_CRITERIA_PASS
```

---

## 2. Go Conditions (All 12 Must Pass)

| # | Condition | Verification |
|---|---|---|
| G1 | No high-risk mutation refactoring needed | Datasets mutations are CRUD-only (`createDataset`, `updateDataset`, `createDatasetNewVersion`, `createPipelineRun`) — no workflow execution or external system control |
| G2 | Wrapper shell sufficient (no WorkspaceGrid rewrite) | `WorkspaceGrid` rendering and card definitions remain untouched |
| G3 | contentRef behavior preserved | `ref={contentRef}` forwarded to inner content div within `PageShell` |
| G4 | Responsive layout unchanged | `useResponsiveLayoutMode()` + `contentWidth` produce same values |
| G5 | Visual QA checklist defined | `AIP_V7_54_D1_DATASETS_VISUAL_QA_CHECKLIST.md` with 10 viewport/state combinations |
| G6 | Rollback plan defined | `AIP_V7_54_D1_DATASETS_ROLLBACK_PLAN.md` with procedures for all commit states |
| G7 | No Stage C required | Pilot is purely presentational shell migration |
| G8 | No DB write required | All mutations go through `apiService.*` (client → API → DB) — no direct DB access |
| G9 | No new backend endpoint required | All API calls pre-exist |
| G10 | No sidebar expansion required | Datasets is already visible in navigation |
| G11 | All 10 shell adapter acceptance criteria pass | Per `AIP_V7_54_D1_DATASETS_SHELL_ADAPTER_ACCEPTANCE_CRITERIA.md` |
| G12 | All validation gates pass | `typecheck`, `build`, `lint`, `git diff --check` — all errors = 0 |

---

## 3. No-Go Conditions (Any One Blocks P1)

| # | Condition | Detail |
|---|---|---|
| N1 | Migration requires changing business data flow | e.g., altering `fetchList` / `fetchDetail` / mutation callbacks |
| N2 | Migration requires rewriting WorkspaceGrid | e.g., changing card definitions, layout config, or grid component |
| N3 | Migration requires changing mutation semantics | e.g., altering POST request payloads or response handling |
| N4 | Migration requires new POST / backend endpoint | e.g., adding a new `apiService.*` call or backend route |
| N5 | Migration cannot preserve contentRef behavior | e.g., `contentWidth` readings change after migration |
| N6 | Visual QA cannot be executed and risk is unconfirmed | e.g., no UI testing capability and manual comparison is infeasible |
| N7 | Any validation gate fails | `typecheck`, `build`, `lint`, `git diff --check` — any error blocks |

---

## 4. D1 Recommendation

Datasets is a **CONDITIONAL GO** for v7.54-P1. The page has manageable risks:

- 4 POST mutations but all are shell-safe CRUD
- WorkspaceGrid with 8 cards but no rewrite needed
- Layout editor but can be preserved without changes
- contentRef but can be forwarded through shell

The go decision for P1 depends entirely on meeting all 12 Go Conditions above.
If any condition is not satisfied, P1 must be deferred again.
