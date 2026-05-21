# AIP v7.58-P3 Risk and Deferred Items

**Phase:** v7.58-P3
**Status:** DEFINED

---

## 1. Deferred Items

| # | Item | Reason | Re-evaluation Trigger |
|---|---|---|---|
| D1 | UX screenshot evidence capture | UI not running (API requires restart/restore) | When API is running and restore authorization is filed |
| D2 | Empty/error/loading state visual verification | UI not running | When UI is running |
| D3 | Sidebar mobile/touch behavior review | UI not running | v7.58-P4 |
| D4 | Dashboard shell adapter migration | Not proven — requires adapter re-evaluation | After adapter gates are re-evaluated |
| D5 | ConnectorCenterReadonly / MemoryHubReadonly shell alignment | Deferred pending adapter re-evaluation | After adapter re-evaluation passes |
| D6 | WorkflowCanvas / Feedback shell migration | Not proven — canvas pattern | After adapter re-evaluation, separate D1 inventory |

---

## 2. Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | UX inconsistencies may exist in non-shell pages | Medium | Defer UX fix until adapter migration is planned |
| R2 | Mobile/sidebar behavior may be broken on some pages | Medium | Review in v7.58-P4 |
| R3 | Empty/error states may not render correctly | Low | Verify when UI is running |
| R4 | Loading skeleton may be missing on lazy-loaded pages | Low | Verify when UI is running |
| R5 | Screenshot evidence will be out of date if UI code changes | Low | Re-capture when UI is running |

---

## 3. Hard Boundaries Maintained

| Boundary | Status |
|---|---|
| Stage C disabled | ✅ Preserved |
| Feature flag off | ✅ Preserved |
| Hidden previews not exposed | ✅ Preserved |
| PageShell not retrofitted to new pages | ✅ Preserved |
| Source code not modified | ✅ Preserved |
| Build config not modified | ✅ Preserved |
