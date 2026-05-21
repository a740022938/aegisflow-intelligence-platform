# AIP v7.53-P3 GovernanceHub Deferred Decision

**Date:** 2026-05-21
**Baseline:** v7.53-P3 GovernanceHub Safety Boundary Review

---

## 1. Decision

**GovernanceHub remains deferred in v7.53.**

No shell migration, no source changes, and no UX modifications will be made to GovernanceHub
during the v7.53 cycle.

---

## 2. Reasons

| # | Reason | Detail |
|---|---|---|
| R1 | HIGH risk classification | Per D1 Risk Matrix: GovernanceHub has 6 incident POST mutations, custom governance layout, no PageShell |
| R2 | No immediate pilot available | No strict pilot candidate exists under P1 criteria; P2 established no-go for WorkflowComposer; GovernanceHub is not a viable pilot either |
| R3 | Complex action surface | 14+ distinct POST action types across 7 endpoints — any shell change risks breaking one or more mutation paths |
| R4 | Auth/actor gaps not resolved | Free-text operator field, no RBAC — shell migration must not be attempted before these are addressed |
| R5 | Auto-sync mutation | `doSync` auto-triggers on page load and every 120s — shell changes could interfere with lifecycle |
| R6 | No confirmation dialogs | HIGH risk actions (`resolve`, `ignore`, `playbook_start`, `playbook_abort`) lack confirmation — UX safety gaps must be resolved before migration |
| R7 | `page-root` shell dependency | Uses `page-root` (line 437) with no `PageShell` — same class of dependency as entity pages |

---

## 3. Deferred Rules

### Do not in v7.53:
- Shell-migrate GovernanceHub to `PageShell` or `OuterShellAdapter`
- Add, remove, or modify any POST action
- Add or modify confirmation dialogs
- Add or modify RBAC/authorization checks
- Change the `operator` or `assignee` input fields
- Modify auto-sync behavior or interval
- Split `GovernanceHubReadonly` out from the page

### Allowed in future (v7.54+):
- `GovernanceHubReadonly` split for non-operator roles (design-only phase)
- Confirmation dialog additions (after explicit UX review)
- RBAC gating for action buttons
- Shell migration **only after Datasets pilot validates `OuterShellAdapter`**

---

## 4. Future Prerequisites

Before GovernanceHub can be migrated or split:

1. `OuterShellAdapter` must be validated on at least one successfully migrated page (Datasets or similar)
2. Confirmation dialogs must be added for HIGH risk actions (`resolve`, `ignore`, `playbook_start`, `playbook_abort`, `openclaw recover`)
3. The `postAction` / `postPlaybookAction` / `sync` callbacks must be reviewed for lifecycle compatibility with `PageShell`
4. A `GovernanceHubReadonly` split plan must be created if a split is desired
5. The auto-sync lifecycle (`useEffect` with `setInterval`) must be verified to not conflict with shell unmount/remount

---

## 5. Risk Summary

| Factor | Value |
|---|---|
| Current classification | DEFERRED |
| Risk level | HIGH (per D1 Risk Matrix) |
| Page count | 991 lines |
| Shell | `page-root` (no PageShell) |
| POST endpoints | 7 distinct, 14+ action types |
| Auto-sync | 120s interval + page load trigger |
| Auth gating | None in client |
| Readonly split needed | Not urgent — future candidate |
