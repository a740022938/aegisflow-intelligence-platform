# AIP v7.54-P4 Page Candidate Queue

**Date:** 2026-05-21

---

## 1. Classification Matrix

| Page | Classification | Reason |
|---|---|---|
| Datasets | `SAFE_REFERENCE` | Proven through D1/P1/P2/P3 — outer-shell pilot verified with visual QA |
| MemoryHubReadonly | `SAFE_REFERENCE` | Already acceptable, read-only, modern UI, no migration needed |
| OpenAxiomReadonly | `SAFE_REFERENCE` | Already acceptable, read-only, modern UI, no migration needed |
| Models | `PLAN_ONLY` | Entity page with WorkspaceGrid + contentRef + mutations. Requires full D1 inventory before any pilot. Not currently scheduled. |
| PluginPool | `PLAN_ONLY` | Auth handling and install/remove interaction complexity. Requires mutation audit. |
| Tasks | `PLAN_ONLY` | WorkspaceGrid + contentRef + start/stop operational mutations. POST mutation concerns. |
| WorkflowJobs | `PLAN_ONLY` | Learned rules mutation complexity. Job control actions need careful audit. |
| GovernanceHub | `NO_GO` | Governance actions (recover, resolve, confirm), auto-sync risk, POST-heavy. Not suitable for shell adapter. |
| WorkflowComposer | `NO_GO` | Large ReactFlow canvas with state machine, undo/redo, node positioning. Cannot be wrapped by outer shell. |
| Scheduler stub | `HIDDEN_STUB` | Hidden/unused stub only. No action required. |

---

## 2. Recommended Queue

### Immediate (v7.54)
1. **Keep Datasets as `SAFE_REFERENCE`** — No further action. Document as reference for future pilots.
2. **Do not migrate `NO_GO` pages** — GovernanceHub and WorkflowComposer are not suitable for shell adapter.
3. **Leave `SAFE_REFERENCE` pages** — MemoryHubReadonly and OpenAxiomReadonly do not benefit from migration.

### Next Product Phase (v7.55+)
4. **Prefer release/install/restore hardening** over more UI migration. The product has improved visual consistency through v7.51–v7.54. The next highest-value work is making the project easier to install, restore, validate, and release safely.
5. **If UI migration continues** (explicitly authorized), select only one `PLAN_ONLY` candidate after a fresh D0-style inventory scan:
   - **Models** is the most Datasets-like candidate (WorkspaceGrid + contentRef + layout editor) but has a different mutation profile.
   - No `PLAN_ONLY` page should skip the full D1→P1→P2→P3 workflow.

---

## 3. Queue Rules

- A page cannot move from `PLAN_ONLY` to `CONDITIONAL_PILOT` without a completed D1 inventory
- A page cannot move from `CONDITIONAL_PILOT` to any code change without an acceptance criteria document
- A `NO_GO` page cannot be reconsidered unless the shell adapter pattern changes fundamentally
- At most one page can be in active pilot at any time
- The Datasets reference pattern must be consulted before any new pilot
