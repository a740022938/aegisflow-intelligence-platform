# AIP v7.59-P5 Selected Implementation Candidates

**Phase:** v7.59-P5
**Status:** FINAL

---

## Candidate A: GovernanceCenter Registry+Validator Lazy Loading / Component Split

| Field | Value |
|---|---|
| Priority | Top (score 86/100 in P1) |
| Status | **READY FOR FUTURE IMPLEMENTATION PILOT PLANNING** |
| Implemented in v7.59 | ❌ NO |
| Source code changed | ❌ NO |
| Pre-change baseline | ✅ Defined in P2 |
| Visual QA plan | ✅ Defined in P2 |
| Rollback plan | ✅ Defined in P2 |
| No-go matrix | ✅ Defined in P2 |
| ManualChunks preference | Lower preference (dynamic import preferred) |
| Estimated chunk reduction | ~10-30 kB (Registry validator) |
| Implementation requires | Separate task pack, user authorization for code changes |

---

## Candidate B: Sidebar Pointer-Event Resizer Support

| Field | Value |
|---|---|
| Priority | Second (score 72/100 in P1) |
| Status | **READY FOR FUTURE IMPLEMENTATION PILOT PLANNING** |
| Implemented in v7.59 | ❌ NO |
| Source code changed | ❌ NO |
| Recommended approach | Option A — Add pointer events (P3) |
| Pre-change baseline | ✅ Defined in P3 |
| Visual QA plan | ✅ Defined in P4 (5 viewports, 23 checks) |
| Rollback plan | ✅ Defined in P3 |
| No-go matrix | ✅ Defined in P3 |
| Lines likely changed | ~8 lines in Layout.tsx |
| Implementation requires | Separate task pack, user authorization for code changes |

---

## Deferred Candidates

| Candidate | Reason | Re-evaluation Trigger |
|---|---|---|
| manualChunks / build config | Lower preference | After dynamic import pilot succeeds |
| Broad component splitting (non-GovernanceCenter) | Not evaluated | Future candidate evaluation needed |
| GovernanceHub / WorkflowComposer implementation | NO-GO in D1 | Separate safety review required |
| Hidden preview / sidebar expansion | NO-GO in D1 | Organizational decision required |
| Release / Restore-related changes | HOLD / NO-GO | Human authorization forms must be filed first |
