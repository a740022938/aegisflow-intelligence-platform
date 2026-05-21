# AIP v7.52-P3 Workflow Tool Page Risk Split Result

**Date:** 2026-05-21  
**Phase:** P3 — Workflow Tool Page Risk Split + Limited Shell Alignment  
**Baseline:** v7.52-P2 Governance Standardization (`0567f4e`)

---

## 1. Reviewed Pages

| Page | Route | Lines | Current DS | Risk | Action |
|---|---|---|---|---|---|
| WorkflowComposer | `/workflow-composer` | ~2400 (18 files) | None | HIGH | **DEFERRED** (canvas, state machine, drag/drop) |
| WorkflowJobs | `/workflow-jobs` | 1232 | SectionCard, StatusBadge, PageHeader, EmptyState | MEDIUM | **DEFERRED** (1232 lines, complex layout, learned rules mutation) |
| Tasks | `/tasks` | 822 | SectionCard, StatusBadge, PageHeader, EmptyState, WorkspaceGrid | MEDIUM | **DEFERRED** (822 lines, task creation, layout editor) |
| Feedback | `/feedback` | 320 | PageHeader, SectionCard, StatusBadge, EmptyState | LOW | **ALIGNED** (PageShell + StatusStrip) |
| WorkflowCanvas | `/workflow-canvas` | 282 | PageHeader, SectionCard, StatusBadge, EmptyState | LOW | **ALIGNED** (PageShell + StatusStrip) |
| scheduler | `/scheduler` | ModulePage stub | None | LOW | **DEFERRED** (ModulePage stub, hidden) |

## 2. Risk Assessment Details

### HIGH RISK — Do Not Migrate
**WorkflowComposer** (`/workflow-composer`)
- 2400+ lines across 18 files (ComfyNode, NodePalette, NodeParamPanel, CompilePreviewPanel, ContextMenu, etc.)
- React Flow canvas with drag/drop, zoom, connection validation
- State machine: draft storage, compile preview, node search
- Migrating shell would risk breaking canvas interactions
- **Verdict: DEFERRED (v7.53+)**

### MEDIUM RISK — Deferred
**WorkflowJobs** (`/workflow-jobs`)
- 1232 lines, learned rules (enable/disable mutation), detail panels, gate drilldown
- Moderately complex, but shell wrapping is technically bounded
- **Verdict: DEFERRED (v7.53 — safe to shell wrap, but not this phase)**

**Tasks** (`/tasks`)
- 822 lines, WorkspaceGrid layout editor, task creation (POST mutation)
- Layout editor needs accurate contentRef width detection — shell wrapping could affect this
- **Verdict: DEFERRED (v7.53 — test contentRef compatibility first)**

### LOW RISK — Aligned in P3
**Feedback** (`/feedback`)
- 320 lines, simple list/detail/create pattern
- Already uses PageHeader + SectionCard + EmptyState
- PageShell wrapping is clearly bounded and safe
- API calls (create/export feedback) unchanged

**WorkflowCanvas** (`/workflow-canvas`)
- 282 lines, simple job list + ReactFlow canvas + node detail
- No contentRef or WorkspaceGrid dependency
- PageShell wrapping is clearly bounded and safe

### ModulePage Stub
**scheduler** (`/scheduler`)
- ModulePage placeholder, hidden in stub section
- No migration needed

## 3. P3 Alignments

### Feedback
- `page-root` + `PageHeader` → `PageShell`
- Added `StatusStrip` with batch counts (total, fail case, low conf, manual)
- EmptyState already used — preserved
- No behavior change

### WorkflowCanvas
- `page-root` + `PageHeader` → `PageShell`
- Added `StatusStrip` with job count + last refresh
- EmptyState already used — preserved
- ReactFlow canvas dimensions unaffected (PageShell is flex-only wrapper)

## 4. No Dangerous Buttons Added
- No release/tag buttons
- No Stage C enable buttons
- No feature flag toggle buttons
- No mutation buttons
