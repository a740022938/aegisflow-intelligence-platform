# AIP v7.52 Workflow Tool Page Risk Split + Shell Plan

**Date:** 2026-05-21  
**Status:** D1 — Blueprint  
**Target Phase:** P3  
**Baseline Finding:** `WorkflowComposer 2400 lines — explicitly deferred`

---

## 1. Risk Assessment

| Page | Lines | DS Usage | Risk | Action |
|---|---|---|---|---|
| `/workflow-composer` | ~2400 | None | HIGH — 2400 lines, canvas/state machine | **DEFERRED** |
| `/workflow-jobs` | ~500 | Partial (SectionCard, StatusBadge) | MEDIUM | **P3 limited migration** |
| `/workflow-canvas` | ~200 | Partial (SectionCard) | LOW | **P3 limited migration** |
| `/tasks` | ~400 | Partial (SectionCard, StatusBadge, EmptyState) | LOW-MEDIUM | **P3 limited migration** |
| `/feedback` | ~300 | Partial (PageHeader, SectionCard, StatusBadge, EmptyState) | LOW | **P3 limited migration** |

## 2. WorkflowToolShell Definition

```
PageShell
  PageHeader (title + subtitle)
  ToolStatusStrip (tool state, mode, version)
  InputPanel (when applicable — search/filter area)
  WorkbenchPanel (main content area)
  ResultPanel (when applicable)
  EmptyState (for zero-state)
  EvidenceFooter
```

## 3. Migration Scope

### Do
- Define WorkflowToolShell in code or as pattern
- Add PageShell to WorkflowJobs, WorkflowCanvas, Tasks, Feedback
- Add StatusStrip to pages that lack it
- Add EmptyState for zero-state areas
- Add ErrorState for error conditions

### Do NOT
- Migrate WorkflowComposer
- Rewrite workflow editor
- Change drag/connect/state-machine logic
- Change task execution logic
- Add runtime mutation

## 4. Per-Page Plan

### Feedback `/feedback`
- Add PageShell wrapper
- Add ToolStatusStrip (feedback pool state)
- Already uses PageHeader + SectionCard + StatusBadge + EmptyState — minimal change

### WorkflowJobs `/workflow-jobs`
- Add PageShell wrapper
- Add ToolStatusStrip (workflow status)
- Already uses SectionCard + StatusBadge — minimal change

### WorkflowCanvas `/workflow-canvas`
- Add PageShell wrapper
- Add ToolStatusStrip (canvas status)
- Minimal, already uses SectionCard

### Tasks `/tasks`
- Add PageShell wrapper
- Add ToolStatusStrip (task status)
- Add EmptyState for no tasks
- Already uses SectionCard + StatusBadge + EmptyState

## 5. Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| PageShell wraps interactive canvas incorrectly | LOW | PageShell is flex only; canvas dimensions unaffected |
| EmptyState added to pages that never show zero | LOW | EmptyState renders nothing when data exists |
| Accidental WorkflowComposer change | MEDIUM | Do not touch WorkflowComposer source |

## 6. Acceptance Criteria

```
WorkflowJobs:
- PageShell: YES
- ToolStatusStrip: YES
- No changes to workflow logic: YES

WorkflowCanvas:
- PageShell: YES
- ToolStatusStrip: YES
- Canvas behavior unchanged: YES

Tasks:
- PageShell: YES
- ToolStatusStrip: YES
- EmptyState for no tasks: YES

Feedback:
- PageShell: YES
- ToolStatusStrip: YES
- EmptyState verified: YES

WorkflowComposer: DEFERRED
```
