# AIP v8.0-D1 Final Blocker and Risk Register

**Status:** DEFINED

---

## Blocker / Risk Table

| ID | Item | Severity | Status | Blocks Release? | Required Action |
|---|---|---|---|---|---|
| G1 | Human release authorization not filed | Critical | OPEN | YES | Fill authorization form (AIP_V7_62_D1_RELEASE_AUTHORIZATION_DECISION_FORM.md) |
| R1 | Restore authorization not filed | Critical for restore | OPEN | NO (unless restore needed) | Fill restore authorization only if restore is required |
| TQ1 | Physical touch-device QA not performed | Medium | OPEN | CONDITIONAL | Optional manual QA; conditionally blocking only if release owner requires touch verification |
| B1 | GovernanceCenter 930.88 kB chunk warning (>500 kB) | Low/Medium | OPEN | NO | Future broader optimization if desired; currently acceptable |
| GC1 | Registry lazy-load deferred | Low/Medium | DEFERRED | NO | Future larger component split if planned |
| V1 | Validator-only lazy-load no-effect | Closed | CLOSED | NO | Reverted; no further action needed |

## Risk Summary

- **1 release-blocking item:** G1 — human release authorization not filed
- **1 conditional blocker:** TQ1 — only if release owner requires physical touch QA
- **3 non-blocking items:** B1, GC1, V1
- **1 restore-blocking item:** R1 — only if restore required
