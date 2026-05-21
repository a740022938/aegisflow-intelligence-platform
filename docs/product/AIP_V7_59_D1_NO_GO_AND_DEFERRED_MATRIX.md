# AIP v7.59-D1 No-Go and Deferred Matrix

**Phase:** v7.59-D1
**Status:** DEFINED

---

## No-Go Items

| # | Item | Reason | Severity |
|---|---|---|---|
| 1 | GovernanceHub implementation without safety review | GovernanceHub has mutation controls; safety review required before any change | HARD NO-GO |
| 2 | WorkflowComposer implementation without no-go boundary review | Canvas/state-machine pattern; separate no-go review required | HARD NO-GO |
| 3 | manualChunks without dependency impact analysis | Build config change affects all routes; risk of code duplication | HARD NO-GO |
| 4 | Sidebar behavior change without viewport QA | Must verify desktop, tablet, and mobile behavior before change | HARD NO-GO |
| 5 | Component split without rollback plan | Must have documented revert command before any implementation | HARD NO-GO |
| 6 | Any Stage C / feature flag / release / restore coupling | Optimization must not enable Stage C, toggle feature flag, or trigger release/restore | HARD NO-GO |
| 7 | Any DB write / migration | No database changes allowed in hardening/optimization phases | HARD NO-GO |
| 8 | Any hidden preview / sidebar expansion | No exposing hidden routes or adding sidebar entries | HARD NO-GO |

---

## Deferred Items

| # | Item | Deferral Reason | Re-evaluation Trigger |
|---|---|---|---|
| D1 | Mobile viewport evidence capture | UI not running (API requires restart/restore) | When UI is running |
| D2 | High-traffic non-adapter page migration | Adapter re-evaluation not passed | After adapter gates pass |
| D3 | GovernanceHub / WorkflowComposer no-go re-evaluation | Low priority; no new evidence to change status | Periodic review |
| D4 | Bundle budget / warning monitoring policy | Requires organizational agreement | After optimization implementation |
| D5 | 17 sidebar entries (wrong exposure category) | Deferred since v7.47-RC; no change in priority | Post-restore or post-release |
