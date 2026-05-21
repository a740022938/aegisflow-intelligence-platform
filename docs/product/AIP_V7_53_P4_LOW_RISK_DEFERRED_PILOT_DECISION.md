# AIP v7.53-P4 Low-Risk Deferred Pilot Decision

**Date:** 2026-05-21
**Baseline:** v7.53-P3 GovernanceHub Safety Boundary Review (`f6a473e`)
**Package:** v7.53-D0→P5 Engineering Total Pack

---

## 1. Decision

**No immediate low-risk deferred page pilot is available under strict criteria.**

All 8 candidate pages were evaluated against the strict pilot criteria. None qualifies for
immediate pilot. This is the expected outcome — the goal of v7.53 is to document risk, not
to force a migration.

---

## 2. Evaluation Summary

| Candidate | Decision | Key Blockers |
|---|---|---|
| Datasets | Conditional Future Pilot | Layout editor, POST mutation, contentRef + WorkspaceGrid |
| Tasks | Plan-Only / Deferred | contentRef + WorkspaceGrid, POST mutation, task/workflow context |
| PluginPool | Plan-Only / Deferred | Plugin toggle POST, layout editor, auth state |
| WorkflowJobs | Plan-Only / Deferred | Learned rules POST mutation, not pure visual shell |
| GovernanceHub | No-Go | 15 POST mutations, 1 auto-triggered, no RBAC, 5 HIGH risk actions lack confirmation |
| WorkflowComposer | No-Go | ReactFlow canvas, state machine, draft persistence, execution semantics |
| scheduler | Hidden / Stub Only | No dedicated page, stub in ModulePage.tsx only |
| Models | Plan-Only / Deferred | Largest entity page, contentRef + WorkspaceGrid, custom summaryStrip |

---

## 3. Strict Pilot Criteria Used

Every candidate was evaluated against all 13 criteria:

| # | Criterion | Purpose |
|---|---|---|
| C1 | No POST mutation | Prevent data loss from structural changes |
| C2 | No runtime execution | Avoid breaking running workflows |
| C3 | No DB write path | Prevent data corruption |
| C4 | No external control | Avoid side effects on external systems |
| C5 | No hidden preview exposure | Keep scope contained |
| C6 | No contentRef rewrite | Preserve layout measurement chain |
| C7 | No WorkspaceGrid rewrite | Keep grid internals untouched |
| C8 | No layout editor path | Avoid edit-mode state complexity |
| C9 | No auth/token behavior changes | Preserve security boundaries |
| C10 | No canvas / drag-drop / state machine | Avoid execution semantics risk |
| C11 | Shell-only migration possible | Scope limited to outer wrapping |
| C12 | Easy rollback | Low cost to undo if needed |
| C13 | Visual-only or readonly-safe | No behavior change |

No page satisfies all 13. The closest candidate (Datasets) fails C1, C6, C7, C8.

---

## 4. Per-Page Detail

### 4.1 Datasets — Conditional Future Pilot

| Criteria | Pass/Fail | Detail |
|---|---|---|
| C1: No POST | ❌ | dataset create via `apiService.POST` |
| C2: No runtime | ✅ | no runtime execution |
| C3: No DB write | ✅ | API-mediated CRUD, no direct DB |
| C4: No external control | ✅ | no external system control |
| C5: No hidden preview | ✅ | already visible in navigation |
| C6: No contentRef rewrite | ❌ | `contentRef` on `page-root` (line 376) |
| C7: No WkspcGrid rewrite | ❌ | `WorkspaceGrid` at line 504 |
| C8: No layout editor | ❌ | `toggleEdit` at line 472 |
| C9: No auth/token changes | ✅ | no auth changes needed |
| C10: No canvas/state machine | ✅ | no canvas usage |
| C11: Shell-only migration | ✅ | OuterShellAdapter compatible |
| C12: Easy rollback | ✅ | reversible |
| C13: Visual-only/readonly | ❌ | has POST mutation |

### 4.2 Tasks — Plan-Only / Deferred

Same blockers as Datasets (contentRef, WorkspaceGrid, POST, layout editor) plus larger size
(822 lines vs 687). No advantage over Datasets.

### 4.3 PluginPool — Plan-Only / Deferred

| Criteria | Fail | Detail |
|---|---|---|
| C1: No POST | ❌ | plugin toggle via `apiService.POST` |
| C8: No layout editor | ❌ | layout editor toggle + `layoutStorage` |
| C4: No external control | ❌ | plugin toggle can enable/disable external integrations |
| C9: No auth/token | ❌ | `AuthRequiredState` already exists — changing shell could affect auth flow |

### 4.4 WorkflowJobs — Plan-Only / Deferred

| Criteria | Fail | Detail |
|---|---|---|
| C1: No POST | ❌ | job creation, learned rules POST |
| C2: No runtime | ❌ | job execution context |

### 4.5 GovernanceHub — No-Go

| Criteria | Fail | Detail |
|---|---|---|
| C1: No POST | ❌ | 15+ POST mutations |
| C2: No runtime | ❌ | playbook execution, doSync auto-trigger |
| C4: No external control | ❌ | playbook actions may touch external systems |
| C9: No auth/token | ❌ | free-text operator field, no RBAC |

### 4.6 WorkflowComposer — No-Go

| Criteria | Fail | Detail |
|---|---|---|
| C10: No canvas/state machine | ❌ | ReactFlow DAG canvas |
| C2: No runtime | ❌ | dry-run, run-from-node, subchain execution |
| C1: No POST | ❌ | compile, dry-run, draft persistence |

### 4.7 Scheduler — Hidden / Stub Only

No page file exists. No evaluation needed beyond keeping it hidden.

### 4.8 Models — Plan-Only / Deferred

| Criteria | Fail | Detail |
|---|---|---|
| C1: No POST | ❌ | model create |
| C6: No contentRef rewrite | ❌ | uses `contentRef` |
| C7: No WkspcGrid rewrite | ❌ | 16-card WorkspaceGrid |
| C8: No layout editor | ❌ | layout editor toggle |
| C11: Shell-only migration | ❌ | custom `summaryStrip` requires removal |

---

## 5. Conclusion

| Verdict | Count | Pages |
|---|---|---|
| Eligible Pilot Now | 0 | — |
| Conditional Future Pilot | 1 | Datasets |
| Plan-Only / Deferred | 4 | Tasks, PluginPool, WorkflowJobs, Models |
| No-Go | 2 | GovernanceHub, WorkflowComposer |
| Hidden / Stub Only | 1 | scheduler |

**No immediate pilot will be executed in v7.53.** This is not a failure — it is the intended
outcome of the decision gate.
