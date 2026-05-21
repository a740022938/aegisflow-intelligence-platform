# AIP v7.58-P3 Page Priority Matrix

**Phase:** v7.58-P3
**Type:** Prioritization Matrix
**Status:** COMPLETED

---

## Priority Matrix

| Page | UX Impact | Migration Feasibility | Current Shell Risk | Overall Priority |
|---|---|---|---|---|
| Datasets | High | ✅ Proven | Low | **P1** |
| GovernanceCenter | High | ✅ Done | Low | **P1** |
| Dashboard | Very High | Not proven | Medium | **P2** |
| AssistantCenter | High | Not proven | Medium | **P2** |
| CostRouting | Medium | Not proven | Medium | **P2** |
| FactoryStatus | Medium | Not proven | Medium | **P2** |
| ConnectorCenterReadonly | Medium | ⏸ Pending | Low-Medium | **P2** |
| PluginPool | Medium | PLAN_ONLY | Low-Medium | **P3** |
| WorkflowCanvas | Low | Not proven | Medium | **P3** |
| Feedback | Low | Not proven | Medium | **P3** |

---

## Classification

| Priority | Pages | Recommended Action |
|---|---|---|
| **P1 — Already Shell-Enabled** | Datasets, GovernanceCenter | UX consistency review when UI is running (post-restore or post-release) |
| **P2 — High Value, Not Yet Shell-Enabled** | Dashboard, AssistantCenter, CostRouting, FactoryStatus, ConnectorCenterReadonly | UX review after adapter gates pass |
| **P3 — Lower Value or Not Proven** | PluginPool, WorkflowCanvas, Feedback | Defer until higher-priority items are resolved |

---

## Decision

| Item | Value |
|---|---|
| Source code modified | NO |
| UI screenshots captured | NOT YET — UI not running |
| UX implementation performed | NO |
| Recommended next phase | v7.58-P4 Mobile / Sidebar Interaction Evidence Review |
