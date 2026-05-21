# AIP v7.54-P3 Next Candidate Page Decision

**Date:** 2026-05-21

---

## 1. Candidate Page Comparison

| Page | Current Risk | Similarity to Datasets | Mutation Risk | Layout Risk | Recommendation |
|---|---|---|---|---|---|
| **Models** | MEDIUM | High — also uses contentRef + WorkspaceGrid | MEDIUM — has create/update/delete mutations | MEDIUM — contentRef + layout editor | **Not yet.** Requires D1 inventory first. Similar risk profile to Datasets but not yet documented. |
| **PluginPool** | MEDIUM | Medium — partial WorkspaceGrid usage | MEDIUM — has install/remove actions | MEDIUM — layout editor may be used | **Not yet.** Requires D1 inventory. Mutation audit needed for install/remove endpoints. |
| **Tasks** | LOW-MEDIUM | High — likely contentRef + WorkspaceGrid | LOW — mostly readonly with start/stop | MEDIUM — WorkspaceGrid layout sensitive | **Not yet.** Requires D1 inventory. Tasks has operational actions (start/stop) that need mutation audit. |
| **WorkflowJobs** | MEDIUM | Medium — may use WorkspaceGrid | MEDIUM — job control actions | MEDIUM — WorkspaceGrid layout | **Not yet.** Requires D1 inventory. Job control mutations need careful audit. |
| **GovernanceHub** | HIGH | Low — custom recover/confirm dialogs | HIGH — recover, resolve, confirm actions | HIGH — custom dialog layout | **No-go.** Not suitable for shell pilot due to governance actions. Requires different migration strategy. |
| **WorkflowComposer** | VERY HIGH | Low — ReactFlow canvas with state machine | HIGH — pipeline creation/modification | VERY HIGH — canvas sizing, zoom, node positioning | **No-go.** Canvas/state-machine page. Requires split plan before any shell migration. |
| **MemoryHubReadonly** | LOW | Low — minimal UI, no WorkspaceGrid | LOW — readonly | LOW — no responsive layout dependency | **Acceptable as-is.** No need to migrate. Already meets modern UI patterns. |
| **OpenAxiomReadonly** | LOW | Low — minimal UI, no WorkspaceGrid | LOW — readonly | LOW — no responsive layout dependency | **Acceptable as-is.** No need to migrate. Already meets modern UI patterns. |

---

## 2. Classification Summary (per Rule E)

| Page | Class | Shell Pilot Status |
|---|---|---|
| Models | B (WorkspaceGrid) + C (Operational) | Conditional — requires D1 inventory |
| PluginPool | B (WorkspaceGrid) + C (Operational) | Conditional — requires D1 inventory |
| Tasks | B (WorkspaceGrid) + C (Operational) | Conditional — requires D1 inventory |
| WorkflowJobs | B (WorkspaceGrid) + C (Operational) | Conditional — requires D1 inventory |
| GovernanceHub | E (Governance) | No-go |
| WorkflowComposer | E (Canvas) | No-go |
| MemoryHubReadonly | A (Reference readonly) | No need to migrate |
| OpenAxiomReadonly | A (Reference readonly) | No need to migrate |

---

## 3. Decision

**No immediate shell migration should proceed for any candidate page.**

Rationale:

1. **No team capacity for broad migration** — The Datasets pilot was a single-page
   experiment. Scaling to Models, PluginPool, Tasks, or WorkflowJobs would
   require the same D1-level inventory, acceptance criteria, rollback plan,
   and visual QA for each page.

2. **High-risk pages remain no-go** — GovernanceHub and WorkflowComposer cannot
   be migrated with the current shell adapter pattern. They require fundamentally
   different strategies.

3. **Low-risk pages are already acceptable** — MemoryHubReadonly and
   OpenAxiomReadonly do not benefit from shell migration. Migrating them would
   create risk without reward.

4. **Pilot is reference, not template** — The Datasets pilot proved that
   constrained shell migration is possible with rigorous gating. It did not
   prove that all pages can or should be migrated.

---

## 4. Recommended Next Step

### Primary: v7.54-P4 Adapter Rulebook Finalization + Candidate Queue

```text
Purpose:  Convert P3 rules into a stable rulebook.
          Freeze no-go pages.
          Create a candidate queue for future UI migrations.
          Decide whether v7.55 should switch tracks to 
          release/install/restore hardening.
```

### Secondary: v7.55 Release / Install / Restore Hardening Track

```text
If P4 rulebook is deemed unnecessary, skip directly to hardening.
The Datasets pilot has been sealed. No further shell migrations are
urgent. The next track should focus on release reliability.
```

### Recommended Route

```text
v7.54-P4 Rulebook Finalization
    → v7.55 Release Hardening
    → (Future) Candidate page migrations
```

Do not proceed to broad code migration automatically. The Datasets pilot
demonstrated a safe process, not a safe shortcut.
