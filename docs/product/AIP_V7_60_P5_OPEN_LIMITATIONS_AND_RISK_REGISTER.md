# AIP v7.60-P5 Open Limitations and Risk Register

**Phase:** v7.60-P5
**Status:** DEFINED

---

## Risk Register

| ID | Risk | Severity | Status | Blocks Release? | Mitigation |
|---|---|---|---|---|---|
| TQ1 | True physical touch-device QA not performed | Medium | Open | No / conditional | Manual physical QA on real mobile browser (v7.61-D1 or user request) |
| G1 | Human release authorization not filed | Critical | Open | Yes | Fill release authorization form (AIP_V7_60_D1_AUTHORIZED_LOW_RISK_IMPLEMENTATION_BLUEPRINT blank form exists) |
| R1 | Restore authorization not filed | Critical | Open | Restore only | Fill restore authorization form (currently no restore needed) |
| GC1 | GovernanceCenter lazy-load not implemented | Low/Medium | Open | No | Future component split planning (v7.61-D1) |
| B1 | GovernanceCenter chunk 930.88 kB build warning | Low/Medium | Open | No | Resolved by GC1 implementation or chunk size limit adjustment |

## Open Limitations

| Limitation | Classification | Impact on Release |
|---|---|---|
| Touch pointer simulation limited to code review | NON_BLOCKING_LIMITED_EVIDENCE | Low — desktop resize verified, code path identical |
| API-dependent tests not run | NON_BLOCKING | Low — API not available, no restart authorized |
| Release/restore authorization unfiled | CRITICAL | Release and restore cannot proceed without authorization |
