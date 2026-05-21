# AIP v7.60-D1 Validation, Visual QA, and Rollback Gates

**Phase:** v7.60-D1
**Status:** GATES DEFINED

---

## Universal Gates

These gates apply to ANY future source-code implementation.

| # | Gate | Required before impl | Required after impl |
|---|---|---|---|
| 1 | Desktop task pack saved | ✅ | — |
| 2 | Source implementation authorization form filed | ✅ | — |
| 3 | Target files listed in authorization form | ✅ | — |
| 4 | Pre-change `git status` clean | ✅ | — |
| 5 | Pre-change validation (typecheck, build, lint, diff-check) | ✅ | — |
| 6 | Pre-change visual QA baseline captured | ✅ | — |
| 7 | Pre-change HEAD recorded | ✅ | — |
| 8 | Post-change validation (typecheck, build, lint, diff-check) | — | ✅ |
| 9 | Post-change visual QA comparison | — | ✅ |
| 10 | Rollback command documented and tested | ✅ | ✅ |
| 11 | No hidden preview / sidebar expansion | ✅ | ✅ |
| 12 | No Stage C / feature flag / release / restore coupling | ✅ | ✅ |
| 13 | Post-change receipt lists exact source files changed | — | ✅ |
| 14 | Tests run if API already running (otherwise deferred) | — | ⏳ |

---

## Gate Status for Sidebar Pointer Implementation

| Gate | Status |
|---|---|
| 1-6 | ⏳ Must be completed in P1 |
| 7 | ⏳ Must be captured at P1 start |
| 8-14 | ⏳ Must be completed after P1 change |

---

## Gate Status for GovernanceCenter Lazy Load Implementation

| Gate | Status |
|---|---|
| 1-6 | ⏳ Must be completed in future implementation phase |
| 7 | ⏳ Must be captured at implementation start |
| 8-14 | ⏳ Must be completed after change |
