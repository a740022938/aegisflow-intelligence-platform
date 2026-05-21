# AIP v7.53-P4 Deferred Page No-Go Matrix

**Date:** 2026-05-21
**Baseline:** v7.53-P4 Low-Risk Deferred Pilot Decision

---

## 1. Matrix

| Page | Status | Reason | Future Entry Condition |
|---|---|---|---|
| **Datasets** | Conditional Future Pilot | Layout editor (toggleEdit), POST mutation (dataset create), contentRef + WorkspaceGrid involved | 1. OuterShellAdapter validated on non-entity page first; 2. Layout editor path disabled/safeguarded during migration; 3. POST behavior unchanged; 4. No WorkspaceGrid/contentRef rewrite; 5. Rollback criteria defined; 6. UI smoke test required |
| **Tasks** | Plan-Only / Deferred | contentRef + WorkspaceGrid, POST mutation, task/workflow context, 822 lines | OuterShellAdapter validated on Datasets first; same safeguards as Datasets |
| **PluginPool** | Plan-Only / Deferred | Plugin toggle POST, layout editor + layoutStorage, AuthRequiredState, inline styles on page-root | Auth/visual-only candidate only if plugin toggle path untouched; layout editor extraction required |
| **WorkflowJobs** | Plan-Only / Deferred | Learned rules POST mutation, job CRUD, not pure visual shell page (1,232 lines) | Learned rules mutation must remain untouched; shell migration only after non-mutation page validates |
| **GovernanceHub** | No-Go | 15 POST mutations requiring human authorization, 1 auto-triggered mutation (doSync + 120s interval), 5 HIGH risk actions lack confirmation, no RBAC, free-text operator field | 1. Confirmation dialogs added for HIGH risk actions; 2. RBAC/operator gating implemented; 3. Auto-sync lifecycle verified shell-safe; 4. Dedicated task pack for v7.54+ |
| **WorkflowComposer** | No-Go | ~10,362 lines across 27 files, ReactFlow canvas state machine, drag/drop, draft persistence (draftStorage.ts), execution semantics (dry-run, run-from-node, subchain), custom error boundary | 1. OuterShellAdapter validated on simpler page; 2. Component boundary map exists; 3. Visual snapshot captured; 4. Dedicated v7.54+ task pack |
| **scheduler** | Hidden / Stub Only | No dedicated page file; defined only in ModulePage.tsx (lines 105-112) with API endpoint `/api/scheduler/jobs` | Must be explicitly planned before any development; do not expose in sidebar without design review |
| **Models** | Plan-Only / Deferred | Largest entity page (1,273 lines), 16-card WorkspaceGrid, contentRef, layout editor, custom summaryStrip must be removed/replaced with StatusStrip | Deferred to v7.54+; Datasets pilot must validate first; summaryStrip replacement requires its own plan |

---

## 2. Summary Counts

| Category | Count | Pages |
|---|---|---|
| Conditional Future Pilot | 1 | Datasets |
| Plan-Only / Deferred | 4 | Tasks, PluginPool, WorkflowJobs, Models |
| No-Go | 2 | GovernanceHub, WorkflowComposer |
| Hidden / Stub Only | 1 | scheduler |

---

## 3. Key Safety Notes

- **No page in the "Plan-Only" category is blocked forever** — each has a clear future entry condition
- **No-Go pages require dedicated task packs** before any migration attempt
- **Hidden/Stub pages must remain hidden** unless explicitly planned
- **The strict criteria are not designed to be relaxed** — they exist to prevent unsafe migrations
