# AIP v7.60-P4 Open Limitations and Follow-up

**Phase:** v7.60-P4
**Status:** DOCUMENTED

---

## Open Limitations

| # | Limitation | Classification | Recommended Action |
|---|---|---|---|
| 1 | True touch-device pointer resize not tested on physical hardware | NON_BLOCKING_LIMITED_EVIDENCE | Physical touchscreen or real mobile browser manual QA |
| 2 | GovernanceCenter chunk (930.88 kB) exceeds 500 kB warning threshold | NON_BLOCKING | Future lazy-load implementation via Registry+Validator split |
| 3 | API-dependent tests not run (API not available) | NON_BLOCKING | Run tests when API is available |

---

## Follow-up Items

| # | Follow-up | Priority | Suggested Phase |
|---|---|---|---|
| 1 | Physical touchscreen or real mobile browser manual QA for sidebar pointer resize | Medium | v7.60-P5 or v7.61-D1 |
| 2 | GovernanceCenter Registry+Validator lazy-load implementation | Low | Future implementation phase |
| 3 | Sidebar pointer refinement (only if physical QA finds issues) | Low | Conditional on follow-up #1 |
| 4 | Release authorization decision for tag/release | Low | v7.60-P5 or v7.61-D1 |
| 5 | Restore authorization decision | Low | v7.60-P5 or v7.61-D1 |

---

## Non-Follow-up Items (Closed)

| Item | Closure Reason |
|---|---|
| Desktop mouse resize regression | ✅ PASS — no regression found |
| Layout breakage | ✅ NONE — all viewports clean |
| Hidden preview exposure | ✅ NONE — confirmed |
| Stage C enablement | ❌ NOT AUTHORIZED — remains disabled |
| Feature flag toggle | ❌ NOT AUTHORIZED — remains off |
