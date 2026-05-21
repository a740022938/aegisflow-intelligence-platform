# AIP v7.53-P4 Conditional Pilot Criteria

**Date:** 2026-05-21
**Baseline:** v7.53-P4 Low-Risk Deferred Pilot Decision

---

## 1. Purpose

Define the explicit conditions under which a deferred page can be elevated to a pilot in a
future release (v7.54+).

---

## 2. Conditional Pilot Criteria

A page qualifies for **Conditional Future Pilot** when **all** of the following are satisfied:

| # | Criterion | Verification |
|---|---|---|
| CP1 | OuterShellAdapter validated | Must be validated on at least one successfully migrated non-entity page with no regression |
| CP2 | No POST behavior changes | All `apiService.POST` / `fetch POST` calls remain untouched — verified by `git diff` |
| CP3 | No API changes | All API endpoints and payloads remain unchanged — verified by code review |
| CP4 | No WorkspaceGrid rewrite | WorkspaceGrid rendering, card definitions, and layout persistence unchanged |
| CP5 | No contentRef rewrite | `useRef`, `contentRef`, and `ref={}` attributes preserved unchanged |
| CP6 | Layout editor path disabled or safeguarded | The layout editor toggle (`toggleEdit`, `setLayoutEdit`) must not be removed, but must be verified safe under shell migration |
| CP7 | Shell-only migration | The only change is wrapping content in `OuterShellAdapter` — no logic changes |
| CP8 | Visual-only or readonly-safe proof | Before/after visual comparison shows no rendering differences |
| CP9 | Rollback criteria defined | Explicit rollback triggers documented (e.g., layout persistence broken, POST fails, width measurement deviates) |
| CP10 | UI smoke test required | Must pass manual smoke test of all visible UI states |
| CP11 | Typecheck/build/lint/diff check required | Must pass all four validation gates |

---

## 3. Applicable to: Datasets

Datasets is the only page classified as **Conditional Future Pilot**. It must satisfy all 11
criteria above before any pilot migration is attempted.

Specific Datasets safeguards:

| Area | Safeguard |
|---|---|
| Layout editor | `toggleEdit` button at line 472 must remain functional; `WorkspaceGrid editable={layoutEdit}` at line 504 must remain unchanged |
| POST mutation | Dataset create flow at `apiService.POST` must not be modified |
| contentRef | `ref={contentRef}` on `page-root` at line 376 must be preserved or forwarded via OuterShellAdapter |
| WorkspaceGrid | `<WorkspaceGrid>` at line 504 must remain untouched |
| State management | All `useState`, `useCallback`, `useEffect` hooks must remain unchanged |
| CSS | All class names (`ds-root`, `ds-left`, `ds-right`, etc.) must remain unchanged |

---

## 4. Conditional Pilot Procedure

When Datasets is ready for conditional pilot:

1. Create a new AIP task pack (e.g., `v7.54-P1_DATASETS_CONDITIONAL_PILOT`)
2. Verify all 11 criteria are met
3. Implement `OuterShellAdapter` wrapping only
4. Run UI smoke test on all states: loading, loaded, detail, layout edit toggle, create form
5. Run full validation: typecheck, build, lint, diff
6. Run rollback drill: confirm rollback reverts to clean state
7. If any criterion fails during implementation: **stop and report** — do not force the pilot

---

## 5. Pages Not Applicable

These pages are excluded from Conditional Pilot consideration for v7.53:

| Page | Reason |
|---|---|
| Tasks | Same blockers as Datasets but larger — no advantage |
| PluginPool | Plugin toggle POST + auth state + layout editor — higher risk |
| WorkflowJobs | Learned rules POST + job execution context |
| GovernanceHub | 15 POST mutations + no RBAC — no-go |
| WorkflowComposer | Canvas state machine — no-go |
| Models | Largest risk + custom summaryStrip — v7.54+ |
| scheduler | No page exists |
