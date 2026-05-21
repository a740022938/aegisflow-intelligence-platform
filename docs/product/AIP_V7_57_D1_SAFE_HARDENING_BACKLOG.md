# AIP v7.57-D1 Safe Hardening Backlog

**Date:** 2026-05-21
**Phase:** D1
**Status:** Prioritized backlog — no execution in D1

---

## 1. P1 Items (High Priority)

| # | Item | Description | Risk | Source Code? | Auth Required? | Suggested Phase | No-Go Conditions |
|---|---|---|---|---|---|---|---|
| B1 | Repo hygiene: v7.52 untracked docs | Decide fate of 2 pre-existing untracked v7.52 docs | Low — stale docs may cause confusion | No (inspect only) | No (decision only) | v7.57-P1 | Do not delete without review; do not commit if obsolete |
| B2 | Build chunk-size warning review | Document the pre-existing GovernanceCenter chunk warning (>500 kB) | Low — cosmetic, non-blocking | No (review only) | No | v7.57-P2 | Do not change build config; do not introduce dynamic imports |
| B3 | Install path verification refresh | Verify START_HERE and README install instructions are current | Low | No | No | v7.57-P3 | No runtime changes |
| B4 | README/START_HERE release-hold wording | Ensure docs do not claim a release has occurred | Low | No | No | v7.57-P3 | No release claims |
| B5 | Desktop task pack archive standardization | Standardize the Phase -1 archive naming convention | Low | No | No | v7.57-P3 | None |

---

## 2. P2 Items (Medium Priority)

| # | Item | Description | Risk | Source Code? | Auth Required? | Suggested Phase | No-Go Conditions |
|---|---|---|---|---|---|---|---|
| B6 | Validation evidence refresh | Re-run typecheck/build/lint/tests if API already running | Low | No | No | v7.57-P4 | Do not start API; no restart authorized |
| B7 | Release notes draft polish | Polish D2 draft notes based on any new findings | Low | No | No | v7.57-P3 | Do not publish; draft only |
| B8 | Restore dry-run docs polish | Clarify D3 restore plan commands | Low | No | No | v7.57-P3 | Do not execute restore |
| B9 | NO_GO visibility docs | Document GovernanceHub / WorkflowComposer no-go status for future reference | Low | No | No | v7.57-P3 | None |

---

## 3. P3 Items (Lower Priority)

| # | Item | Description | Risk | Source Code? | Auth Required? | Suggested Phase | No-Go Conditions |
|---|---|---|---|---|---|---|---|
| B10 | UI consistency low-risk backlog | Plan minor UI polish items | Low | No | No | v7.57-P5 | No runtime changes |
| B11 | Page migration re-evaluation | Re-evaluate candidate page queue under adapter rulebook | Low | No | No | Future | No migration without separate authorization |
| B12 | Install/recovery automation plan-only | Design-only plan for improved install/recovery scripts | Low | No | No | Future | No script execution without review |
