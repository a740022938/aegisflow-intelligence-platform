# AIP v7.62-D1 Closed / Deferred Optimization Register

**Status:** DEFINED

---

## Closed Items

| ID | Item | Status | Reason |
|---|---|---|---|
| C1 | Validator-only lazy-load (governance-registry-validator) | ✅ CLOSED | No chunk reduction; +0.51 kB overhead; reverted |
| C2 | Tiny lazy-load optimization path | ✅ CLOSED | Same root cause as C1; no viable small lazy-load candidate |

## Deferred Items

| ID | Item | Status | Reason |
|---|---|---|---|
| D1 | Registry async-state lazy-load (GOVERNANCE_REGISTRY) | ⏳ DEFERRED | Requires async state management; direct JSX usage; shared dependency |
| D2 | Broader GovernanceCenter component split | ⏳ DEFERRED | Requires planning new component architecture; not scope of v7.61 |
| D3 | manualChunks (Rollup config) | ⏳ DEFERRED | Requires separate evidence and authorization |
| D4 | Physical touch-device QA (sidebar) | ⏳ DEFERRED | Headless browser limitation; requires physical hardware |
| D5 | Official release authorization | ⏳ DEFERRED | Not filed; requires human owner action |
| D6 | Restore authorization | ⏳ DEFERRED | Not filed; required only if restore needed |

## Active / Non-Blocking Items

| ID | Item | Status | Impact |
|---|---|---|---|
| N1 | GovernanceCenter 930.88 kB chunk warning | 🔄 ACTIVE — non-blocking | Build warning persists; acceptable for release |
| N2 | True physical touch QA follow-up | 🔄 ACTIVE — conditional | Non-blocking unless release owner requires it |
