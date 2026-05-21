# AIP v7.52 Page Type Taxonomy Blueprint

**Date:** 2026-05-21  
**Status:** D1 — Blueprint  
**Baseline:** v7.52-D0 Sweep Verdict: `V7_52_D0_VISUAL_QA_PAGE_TYPE_TAXONOMY_SWEEP_COMPLETE_WITH_FINDINGS`  
**Source:** v7.52-D0 Inventory (30 visible sidebar pages, 7 page types, 4 modern, ~10 partial, ~6 legacy, 13 stub hidden, 44+ preview)

---

## 1. Purpose

Define the formal page type taxonomy for OpenAIP. Every visible sidebar page belongs to exactly one type. Each type has defined shell, status information, allowed operations, prohibited operations, migration priority, and acceptance criteria.

## 2. The 7 Page Types

### 2.1 Dashboard Page

| Field | Value |
|---|---|
| Purpose | Homepage, global overview, next-step guidance, system status summary |
| Typical pages | `/` (Dashboard) |
| Shell variant | DashboardShell (PageShell + PageHeader + GlobalStatusStrip + PrimaryStatusGrid + OperatorNextStep + RecentEvidence + QuickActions) |
| Must display | System status, Stage C disabled/feature flag status, recent evidence count, next-step prompt |
| Allowed ops | Read-only status viewing, navigation to detail pages |
| Prohibited ops | Runtime mutation, deployment triggers, secret display, dangerous actions |
| Migration priority | **HIGH** (D0 finding: homepage lacks shell) |
| Acceptance | PageShell wrapper, GlobalStatusStrip visible, next-step area populated, no dangerous controls |

### 2.2 Operations Page

| Field | Value |
|---|---|
| Purpose | Factory status, assistant status, runtime state, service probes, task runs |
| Typical pages | `/factory-status`, `/assistant-center` |
| Shell variant | OperationsShell (PageShell + PageHeader + StatusStrip + ServiceGrid + HealthCards + TaskPanel + EvidenceFooter) |
| Must display | Current operational status, active services, recent failures, health summary |
| Allowed ops | Read-only monitoring, health check viewing, incident drill-down |
| Prohibited ops | Task creation/modification, deployment, runtime mutation, connector actions |
| Migration priority | **HIGH** (D0: AssistantCenter is reference, FactoryStatus is partial) |
| Acceptance | PageShell, StatusStrip with service status, HealthCards, no mutation entry points in read-only areas |

### 2.3 Governance Page

| Field | Value |
|---|---|
| Purpose | Cost routing, connector center, advanced mode, security boundaries, audit, release gates |
| Typical pages | `/cost-routing`, `/connector-center-readonly`, `/advanced-mode-readonly`, `/approvals`, `/governance-hub`, `/audit` |
| Shell variant | GovernanceShell (PageShell + PageHeader + ReadonlyBanner + StatusStrip + RiskMatrix + PolicySections + AuditPreview + SafetyBoundaryFooter) |
| Must display | Readonly/preview banner, current policy state, risk indicators, audit trail preview |
| Allowed ops | Read-only policy viewing, audit log browsing, risk assessment preview |
| Prohibited ops | Policy mutation, approval bypass, Stage C toggle, feature flag toggle, secret exposure |
| Migration priority | **MEDIUM** (D0: ConnectorCenterReadonly and CostRouting are reference; Approvals/GovernanceHub/Audit need shell) |
| Acceptance | ReadonlyBanner, PageShell, StatusStrip, no mutation buttons, clear governance boundary |

### 2.4 Workflow Tool Page

| Field | Value |
|---|---|
| Purpose | Workflow execution, task orchestration, feedback pool, flow composition |
| Typical pages | `/workflow-jobs`, `/workflow-composer`, `/workflow-canvas`, `/tasks`, `/feedback` |
| Shell variant | WorkflowToolShell (PageShell + PageHeader + ToolStatusStrip + InputPanel + WorkbenchPanel + ResultPanel + EmptyState + EvidenceFooter) |
| Must display | Current tool state, input area, result area when applicable, empty state for no-data |
| Allowed ops | Task viewing, workflow monitoring, feedback browsing (read-only where possible) |
| Prohibited ops | Mutation of running workflows, deletion of active tasks, execution of unapproved operations |
| Migration priority | **LOW** (D0: WorkflowComposer 2400 lines deferred; WorkflowJobs and Feedback are partial) |
| Acceptance | PageShell, EmptyState for zero state, clear read-only boundaries; WorkflowComposer explicitly deferred |

### 2.5 Entity Management Page

| Field | Value |
|---|---|
| Purpose | Model registry, datasets, training runs, plugin pool, knowledge base, standard outputs, connectors |
| Typical pages | `/models`, `/datasets`, `/training`, `/runs`, `/templates`, `/artifacts`, `/evaluations`, `/deployments`, `/module-center`, `/plugin-pool`, `/knowledge`, `/outputs`, `/openaxiom-readonly`, `/memory-hub` |
| Shell variant | EntityManagementShell (PageShell + PageHeader + StatusStrip + FilterBar + EntityList/EntityTable + DetailPanel + EmptyState + ErrorState + AuthRequiredState) |
| Must display | Entity list, filter/search capability, detail view, empty state, error state, auth state |
| Allowed ops | Entity listing, detail viewing, filtering, sorting; mutation ops gated behind confirmations |
| Prohibited ops | Bulk unconfirmed deletion, direct secret/token exposure, unauthorized connector actions |
| Migration priority | **MEDIUM** (D0: PluginPool modern; ~6 entity pages legacy; high volume — migrate by subgroup) |
| Acceptance | PageShell, FilterBar, EntityList with pagination, EmptyState for no-results, ErrorState for failures |

### 2.6 Legacy / Historical / Preview-like Page

| Field | Value |
|---|---|
| Purpose | Historical evidence, old-stage previews, read-only evidence pages, non-current main entries |
| Typical pages | 44+ Preview files (GovernanceCenter, StageC*, Operator*, etc.), some readonly previews |
| Shell variant | None required. Keep existing. Do not promote. |
| Must display | "Preview" or "Historical" label if user-facing |
| Allowed ops | Read-only historical browsing |
| Prohibited ops | Promotion to main sidebar, mutation, execution |
| Migration priority | **DEFERRED** — do not promote, do not migrate to main shell |
| Acceptance | Not in sidebar, clearly labeled if accessed via direct URL |

### 2.7 Broken / Stub / No-go Page

| Field | Value |
|---|---|
| Purpose | Placeholder stubs, empty shells, broken UI states |
| Typical pages | 13 ModulePage routes (digital-employee, training-v2, hpo, distill, model-merge, inference, annotation, huggingface, backflow-v2, scheduler, alerting, model-monitor, deploy-v2) |
| Shell variant | None. Keep hidden. |
| Must display | (hidden) |
| Allowed ops | None while hidden |
| Prohibited ops | Exposure to unauthenticated/unapproved users, sidebar exposure without Advanced Mode |
| Migration priority | Do not migrate. Keep stub-hidden. |
| Acceptance | Stub sections (Intelligence, Automation) remain as `nav-section-stub` |

---

## 3. Current Mapping: Pages → Types

| Page | Current Type | Current Tier | Target Type | Priority |
|---|---|---|---|---|
| Dashboard | Dashboard | Legacy | Dashboard | P1 |
| FactoryStatus | Operations | Partial | Operations | P1 |
| AssistantCenter | Operations | Modern | Operations | Reference |
| Datasets | Entity Mgmt | Legacy | Entity Mgmt | P4 |
| Training | Entity Mgmt | Legacy | Entity Mgmt | P4 |
| Runs | Entity Mgmt | Legacy | Entity Mgmt | P4 |
| Templates | Entity Mgmt | Legacy | Entity Mgmt | P4 |
| Models | Entity Mgmt | Legacy | Entity Mgmt | P4 |
| Artifacts | Entity Mgmt | Partial | Entity Mgmt | P4 |
| Evaluations | Entity Mgmt | Partial | Entity Mgmt | P4 |
| Deployments | Entity Mgmt | Partial | Entity Mgmt | P4 |
| WorkflowJobs | Workflow Tool | Partial | Workflow Tool | P3 |
| WorkflowComposer | Workflow Tool | Legacy | Workflow Tool | Deferred |
| WorkflowCanvas | Workflow Tool | Partial | Workflow Tool | P3 |
| ModuleCenter | Entity Mgmt | Partial | Entity Mgmt | P4 |
| PluginPool | Entity Mgmt | Partial | Entity Mgmt | P4 |
| Tasks | Workflow Tool | Partial | Workflow Tool | P3 |
| CostRouting | Governance | Modern | Governance | P2 |
| OpenAxiomReadonly | Entity Mgmt | Modern | Entity Mgmt | P4 |
| MemoryHubReadonly | Entity Mgmt | Modern | Entity Mgmt | P4 |
| ConnectorCenterReadonly | Governance | Modern | Governance | Reference |
| MahjongDebug | Lab | Legacy | Legacy | Deferred |
| Approvals | Governance | Partial | Governance | P2 |
| GovernanceHub | Governance | Partial | Governance | P2 |
| Audit | Governance | Partial | Governance | P2 |
| Feedback | Workflow Tool | Partial | Workflow Tool | P3 |
| AdvancedModeReadonly | Governance | Modern | Governance | Reference |
| Knowledge | Entity Mgmt | Partial | Entity Mgmt | P4 |
| Outputs | Entity Mgmt | Partial | Entity Mgmt | P4 |

---

## 4. Shell Variant Definitions

### 4.1 DashboardShell
```
PageShell
  PageHeader (title + subtitle)
  GlobalStatusStrip (API health, Stage C, feature flag, track)
  PrimaryStatusGrid (running tasks, experiments, active services)
  OperatorNextStep (prominent "next action" area)
  RecentEvidence (last 3-5 evidence entries)
  QuickActions (navigation shortcuts — no mutation)
```

### 4.2 OperationsShell
```
PageShell
  PageHeader (title + subtitle)
  StatusStrip (service statuses, health indicators)
  ServiceGrid / HealthCards (per-service health)
  TaskPanel (running and recent tasks)
  IncidentDetail (if failures present)
  EvidenceFooter
```

### 4.3 GovernanceShell
```
PageShell
  PageHeader (title + subtitle)
  ReadonlyBanner (yellow banner: "Read-only preview. No mutation.")
  StatusStrip (governance state flags)
  RiskMatrix / PolicySections
  AuditPreview
  SafetyBoundaryFooter
```

### 4.4 WorkflowToolShell
```
PageShell
  PageHeader (title + subtitle)
  ToolStatusStrip (tool state, version, mode)
  InputPanel (when applicable)
  WorkbenchPanel (main interactive area)
  ResultPanel (when applicable)
  EmptyState (for zero-state)
  EvidenceFooter
```

### 4.5 EntityManagementShell
```
PageShell
  PageHeader (title + subtitle)
  StatusStrip (entity count, filter active, last updated)
  FilterBar (search + filters)
  EntityList / EntityTable (sortable, paginated)
  DetailPanel (expandable or side panel)
  EmptyState / ErrorState / AuthRequiredState
```

---

## 5. Migration Rules

See `AIP_V7_52_CANONICAL_PAGE_MIGRATION_RULES.md` for the full rule set.

## 6. References

- v7.52-D0 Sweep Report
- v7.51 Design System Foundation (PageShell, SectionCard, StatusStrip, StatsGrid, StatusBadge, EmptyState, ErrorState, AuthRequiredState)
- v7.51 Reference Pages: ConnectorCenterReadonly, AssistantCenter, CostRouting
