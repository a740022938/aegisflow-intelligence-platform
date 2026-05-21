# AIP v7.59-D1 Candidate Implementation Queue

**Phase:** v7.59-D1
**Status:** DEFINED — no implementation

---

## Candidate Queue

### 1. GovernanceCenter Component-Level Splitting

| Field | Value |
|---|---|
| Problem | GovernanceCenter chunk is 930.88 kB due to ~142 eagerly imported sub-components |
| Evidence source | v7.58-P1 evidence inventory, v7.58-P2 no-code decision |
| Expected benefit | Reduce chunk size from 930.88 kB to estimated ~200-400 kB |
| Risk level | Low-Medium (all components are readonly, no mutation state) |
| Source code required later | YES — add dynamic imports at section boundaries |
| Build config required later | NO — component splitting does not require build config change |
| Visual QA required | YES — before/after screenshots, loading state verification |
| Release/restore authorization required | NO |
| Recommended future phase | v7.59-P2 |
| No-go conditions | No visual QA baseline, no rollback plan, no second-person review |

### 2. Sidebar Touch/Pointer Resizer Support

| Field | Value |
|---|---|
| Problem | Sidebar resizer uses mouse events only; no touch/pointer support |
| Evidence source | v7.58-P4 sidebar touch resizer evidence |
| Expected benefit | Tablet users can resize sidebar via touch/pointer |
| Risk level | Low |
| Source code required later | YES — add event handlers in Layout.tsx |
| Build config required later | NO |
| Visual QA required | YES — desktop/tablet/mobile viewport screenshots |
| Release/restore authorization required | NO |
| Recommended future phase | v7.59-P3 |
| No-go conditions | No viewport QA, no pointer+mouse regression checks |

### 3. Mobile Viewport QA and Layout Evidence Capture

| Field | Value |
|---|---|
| Problem | UX evidence checklist has 15 items; none executed (UI not running) |
| Evidence source | v7.58-P3 UX evidence checklist |
| Expected benefit | Visual evidence baseline for all high-traffic pages |
| Risk level | Low |
| Source code required later | NO (evidence capture only) |
| Build config required later | NO |
| Visual QA required | YES (this IS the task) |
| Release/restore authorization required | NO (but UI must be running) |
| Recommended future phase | When UI is running |
| No-go conditions | UI not running |

### 4. High-Traffic Non-Adapter Page Triage

| Field | Value |
|---|---|
| Problem | 7 of 9 high-traffic pages are non-adapter, no PageShell |
| Evidence source | v7.58-P3 UX consistency sweep |
| Expected benefit | Migrate high-value pages to PageShell |
| Risk level | Medium |
| Source code required later | YES — require adapter migration |
| Build config required later | NO |
| Visual QA required | YES — 5 viewport screenshots per page per adapter rulebook |
| Release/restore authorization required | NO |
| Recommended future phase | After adapter re-evaluation |
| No-go conditions | Adapter re-evaluation not passed |

### 5. GovernanceCenter Bundle-Budget Monitoring

| Field | Value |
|---|---|
| Problem | No formal policy for chunk-size warning monitoring |
| Evidence source | v7.58-P5 open optimization backlog |
| Expected benefit | Prevent new chunk-size warnings from going unnoticed |
| Risk level | Low |
| Source code required later | NO |
| Build config required later | Possible (chunkSizeWarningLimit adjustment) |
| Visual QA required | NO |
| Release/restore authorization required | NO |
| Recommended future phase | After optimization implementation |
| No-go conditions | Organizational agreement not obtained |

### 6. GovernanceHub / WorkflowComposer No-Go Re-Evaluation (Docs Only)

| Field | Value |
|---|---|
| Problem | Both pages are NO-GO for adapter migration; periodic re-evaluation needed |
| Evidence source | v7.54-P4 adapter rulebook, v7.58-D1 UX hardening backlog |
| Expected benefit | Determine if no-go status should change based on new evidence |
| Risk level | Low (docs only) |
| Source code required later | Conditional (if no-go is lifted) |
| Build config required later | NO |
| Visual QA required | NO (docs only) |
| Release/restore authorization required | NO |
| Recommended future phase | v7.59-D2 or later |
| No-go conditions | Implementation requires separate no-go review |

### 7. Desktop Task-Pack Archive Visibility Polish

| Field | Value |
|---|---|
| Problem | Task pack archive location may not be obvious to operators |
| Evidence source | v7.57-P3 hold mode docs polish |
| Expected benefit | Improved operator awareness of archive location |
| Risk level | Low |
| Source code required later | NO (docs only) |
| Build config required later | NO |
| Visual QA required | NO |
| Release/restore authorization required | NO |
| Recommended future phase | v7.59-D2 |
| No-go conditions | None |
