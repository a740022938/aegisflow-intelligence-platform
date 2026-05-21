# AIP v7.52 Entity Management Page Alignment Plan

**Date:** 2026-05-21  
**Status:** D1 — Blueprint  
**Target Phase:** P4  
**Baseline Finding:** `MEDIUM — Entity Management pages inconsistent (legacy/partial/mixed)`

---

## 1. Scope

Entity Management is the largest type with **14 pages** across 3 sidebar groups:

| Page | Group | Current Tier | Lines |
|---|---|---|---|
| `/models` | Model & Release | Legacy | ~500 |
| `/datasets` | Data & Training | Legacy | ~400 |
| `/training` | Data & Training | Legacy | ~300 |
| `/runs` | Data & Training | Legacy | ~300 |
| `/templates` | Data & Training | Legacy | ~300 |
| `/artifacts` | Model & Release | Partial | ~300 |
| `/evaluations` | Model & Release | Partial | ~300 |
| `/deployments` | Model & Release | Partial | ~400 |
| `/module-center` | Capabilities | Partial | ~600 |
| `/plugin-pool` | Capabilities | Partial | ~842 |
| `/openaxiom-readonly` | Capabilities | Modern | ~400 |
| `/memory-hub` | Capabilities | Modern | ~200 |
| `/knowledge` | Knowledge | Partial | ~200 |
| `/outputs` | Output | Partial | ~200 |

## 2. EntityManagementShell Definition

```
PageShell
  PageHeader (title + subtitle)
  StatusStrip (entity count, filter state, last updated)
  FilterBar (search + filter controls)
  EntityList / EntityTable (sortable, paginated)
  DetailPanel (expandable or side panel)
  EmptyState / ErrorState / AuthRequiredState
```

## 3. Migration Strategy

Given the high volume (14 pages), migrate by subgroup in this order:

### Phase P4a: Existing modern pages — verify consistency
- `/plugin-pool`: Review PageShell + AuthRequiredState integration; no migration needed
- `/openaxiom-readonly`: Review PageShell; no migration needed  
- `/memory-hub`: Review PageShell; no migration needed

### Phase P4b: Partial pages — add PageShell + EmptyState
- `/module-center`: Add PageShell wrapper, verify EmptyState
- `/artifacts`: Add PageShell wrapper, add EmptyState
- `/evaluations`: Add PageShell wrapper, add EmptyState
- `/deployments`: Add PageShell wrapper, verify EmptyState

### Phase P4c: Legacy pages — add PageShell + StatusStrip + EmptyState
- `/models`: Legacy — add PageShell, StatusStrip, EmptyState
- `/datasets`: Legacy — add PageShell, StatusStrip, EmptyState
- `/training`: Legacy — add PageShell, StatusStrip, EmptyState
- `/runs`: Legacy — add PageShell, StatusStrip, EmptyState
- `/templates`: Legacy — add PageShell, StatusStrip, EmptyState

### Phase P4d: Remaining partial pages
- `/knowledge`: Add PageShell
- `/outputs`: Add PageShell

## 4. Not In Scope

```
- Model creation/deletion logic changes
- Dataset upload/download mutation
- Training task execution changes
- Deployment trigger changes
- PluginPool connector action changes
- OpenAxiom/MemoryHub external control
```

## 5. Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| Wrapping 14 pages may introduce regressions | MEDIUM | Migrate by subgroup; validate each group |
| Adding PageShell to legacy pages with custom layout | LOW | PageShell is flex-box; existing layout flows inside |
| EmptyState added breaks existing "no data" handling | LOW | EmptyState returns null when data exists |

## 6. Acceptance Criteria

```
Each migrated entity page:
- PageShell: YES
- StatusStrip: YES (entity count, filter state)
- EmptyState for zero results: YES
- ErrorState for API failures: YES
- Named entity operations unchanged: YES
```
