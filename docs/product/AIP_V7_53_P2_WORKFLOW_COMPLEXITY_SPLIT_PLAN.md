# AIP v7.53-P2 Workflow Complexity Split Plan

**Date:** 2026-05-21
**Baseline:** v7.53-P1 Entity Pages Refactor Plan (`e0b2817`)
**Package:** v7.53-D0→P5 Engineering Total Pack

---

## 1. Objective

Split workflow-related page complexity into clear categories (already-aligned / plan-only / no-go / hidden)
to prevent future UI-uniformity work from breaking canvas, task execution, or learned rules behavior.

This phase is **docs-first / plan-only**. No source code is modified.

---

## 2. Pages Reviewed

| Page | File(s) | Lines | Category |
|---|---|---|---|
| WorkflowComposer | `workflow-composer/` (27 files) | ~10,362 total | **NO-GO** |
| WorkflowJobs | `WorkflowJobs.tsx` | 1,232 | **PLAN-ONLY** |
| Tasks | `Tasks.tsx` | 822 | **PLAN-ONLY** |
| WorkflowCanvas | `WorkflowCanvas.tsx` | 284 | **ALREADY ALIGNED** |
| Feedback | `Feedback.tsx` (`.css`) | 325 (+ 55 CSS) | **ALREADY ALIGNED** |
| scheduler | — (ModulePage.tsx:105-112) | stub only | **HIDDEN / STUB** |

---

## 3. Detailed Page Records

### 3.1 WorkflowComposer — NO-GO

| Field | Value |
|---|---|
| **File path(s)** | `apps/web-ui/src/pages/workflow-composer/WorkflowComposer.tsx` (2,928 lines) + 26 supporting files (`.ts`, `.tsx`, `.css`) |
| **Total complexity** | ~10,362 lines across 27 files |
| **Current shell/layout** | Custom canvas shell (`comfy-workspace`, `comfy-toolbar`) — no PageShell |
| **contentRef usage** | None |
| **WorkspaceGrid usage** | None |
| **Workflow/canvas state machine** | ✅ — `@xyflow/react` (ReactFlow) for node graph, drag/drop, connections; `workflowSchema.ts` for DAG type definitions |
| **Runtime mutation / POST** | Workflow compilation (`compileWorkflow`), dry-run validation (`dryRunValidate`), draft persistence (`draftStorage`), workflow execution |
| **Task/job/learned rules mutation** | Node execution (dry-run single, run-from-node, retry-node, run-subchain) |
| **API calls** | `CompilePreviewPanel.tsx`, `workflowCompiler.ts` — compile and dry-run POST requests |
| **Hidden/stub/sidebar status** | Visible in navigation via `Route` entry for WorkflowComposer |
| **Classification** | **NO-GO** (deferred to v7.54+) |
| **Future migration prerequisite** | Complete `OuterShellAdapter` validation on Datasets first; then component-boundary map for WorkflowComposer; visual snapshot before any shell change; no-op shell adapter design only |
| **Safety notes** | Canvas state machine, drag/drop, node connection, execution semantics — high regression risk |

### 3.2 WorkflowJobs — PLAN-ONLY

| Field | Value |
|---|---|
| **File path(s)** | `apps/web-ui/src/pages/WorkflowJobs.tsx` |
| **Total complexity** | 1,232 lines |
| **Current shell/layout** | `page-root` div with inline styles (`flex: 1, overflowY: 'auto', padding: '16px 20px'`) + custom `summaryStrip` inside `PageHeader` |
| **contentRef usage** | None |
| **WorkspaceGrid usage** | None |
| **Workflow/canvas state machine** | None |
| **Runtime mutation / POST** | Job creation (`openCreate` → POST), learned rules mutation |
| **Task/job/learned rules mutation** | ✅ — learned rules POST, job CRUD |
| **API calls** | `fetchJobs`, job create, job detail, template fetch |
| **Hidden/stub/sidebar status** | Visible in navigation |
| **Classification** | **PLAN-ONLY** |
| **Future migration prerequisite** | Must wait for `OuterShellAdapter` validation; learned rules mutation must remain unchanged; job CRUD behavior must not change |
| **Safety notes** | Learned rules POST mutation is shell-safe per D1 mutation safety rules, but buttons and form submission must not be modified |

### 3.3 Tasks — PLAN-ONLY

| Field | Value |
|---|---|
| **File path(s)** | `apps/web-ui/src/pages/Tasks.tsx` |
| **Total complexity** | 822 lines |
| **Current shell/layout** | `page-root` div with `contentRef`, `PageHeader`, custom `tsk-root` CSS class |
| **contentRef usage** | ✅ — `useResponsiveLayoutMode()` at line 190, `ref={contentRef}` on `page-root` |
| **WorkspaceGrid usage** | ✅ — 8 workspace cards, layout editor toggle |
| **Workflow/canvas state machine** | None |
| **Runtime mutation / POST** | Task create via `apiService.POST` |
| **API calls** | `apiService.getTasks`, `apiService.POST` (create) |
| **Hidden/stub/sidebar status** | Visible in navigation |
| **Classification** | **PLAN-ONLY** (as established in P1) |
| **Future migration prerequisite** | `OuterShellAdapter` strategy ready; conditional pilot plan with layout editor safeguards |
| **Safety notes** | Already documented in P1; contentRef + WorkspaceGrid dependency |

### 3.4 WorkflowCanvas — ALREADY ALIGNED

| Field | Value |
|---|---|
| **File path(s)** | `apps/web-ui/src/pages/WorkflowCanvas.tsx` |
| **Total complexity** | 284 lines |
| **Current shell/layout** | `PageShell` + `StatusStrip` (aligned in v7.52-P3) |
| **contentRef usage** | None |
| **WorkspaceGrid usage** | None |
| **Workflow/canvas state machine** | ✅ — `@xyflow/react` (ReactFlow) for read-only graph visualization of workflow jobs/steps |
| **Runtime mutation / POST** | None — read-only view |
| **API calls** | `fetch('/api/workflow/jobs')`, `fetch('/api/workflow/job/{id}/steps')` |
| **Hidden/stub/sidebar status** | Visible in navigation |
| **Classification** | **ALREADY ALIGNED** |
| **Future migration prerequisite** | None — no action needed |
| **Safety notes** | No further changes required; read-only graph view is shell-compatible |

### 3.5 Feedback — ALREADY ALIGNED

| Field | Value |
|---|---|
| **File path(s)** | `apps/web-ui/src/pages/Feedback.tsx`, `Feedback.css` |
| **Total complexity** | 325 lines (+ 55 CSS) |
| **Current shell/layout** | `PageShell` + `StatusStrip` (aligned in v7.52-P3) |
| **contentRef usage** | None |
| **WorkspaceGrid usage** | None |
| **Workflow/canvas state machine** | None |
| **Runtime mutation / POST** | None in current view (read-only batch/item display) |
| **API calls** | Fetch feedback batches and items |
| **Hidden/stub/sidebar status** | Visible in navigation |
| **Classification** | **ALREADY ALIGNED** |
| **Future migration prerequisite** | None — no action needed |
| **Safety notes** | Already uses PageShell; no further changes required |

### 3.6 Scheduler — HIDDEN / STUB

| Field | Value |
|---|---|
| **File path(s)** | Defined in `ModulePage.tsx` (lines 105–112) — no dedicated page file |
| **Total complexity** | Stub only — API endpoint `/api/scheduler/jobs` exists |
| **Current shell/layout** | No page shell (no page exists) |
| **contentRef usage** | N/A |
| **WorkspaceGrid usage** | N/A |
| **Workflow/canvas state machine** | N/A |
| **Runtime mutation / POST** | N/A (no page) |
| **API calls** | `/api/scheduler/jobs` (referenced in ModulePage.tsx) |
| **Hidden/stub/sidebar status** | Not exposed in sidebar by default; navigation route exists (`/scheduler`) |
| **Classification** | **HIDDEN / STUB** |
| **Future migration prerequisite** | Must be explicitly planned before any development |
| **Safety notes** | Do not expose in sidebar or routes without explicit plan; API endpoint may exist but no UI is implemented |

---

## 4. Decision Summary

| Category | Pages | Count |
|---|---|---|
| **NO-GO** | WorkflowComposer | 1 |
| **PLAN-ONLY** | WorkflowJobs, Tasks | 2 |
| **ALREADY ALIGNED** | WorkflowCanvas, Feedback | 2 |
| **HIDDEN / STUB** | scheduler | 1 |

---

## 5. Deferred Rules

### 5.1 NO-GO (WorkflowComposer)

- Do not modify any file in `workflow-composer/` during v7.53
- Do not rewrite canvas, change drag/drop, change node graph state, change execution behavior, change persistence, or change API calls
- See `AIP_V7_53_P2_WORKFLOW_COMPOSER_NO_GO_BOUNDARY.md`

### 5.2 PLAN-ONLY (WorkflowJobs, Tasks)

- Do not shell-migrate until `OuterShellAdapter` is validated on a non-entity page
- Do not change learned rules mutation behavior (WorkflowJobs)
- Do not change task CRUD behavior (WorkflowJobs, Tasks)
- Do not change layout editor behavior (Tasks)
- Do not change contentRef or WorkspaceGrid (Tasks)

### 5.3 ALREADY ALIGNED (WorkflowCanvas, Feedback)

- No further action required in v7.53
- If shell changes occur in later versions, visual regression must be confirmed

### 5.4 HIDDEN / STUB (scheduler)

- Do not expose scheduler in sidebar or navigation without explicit plan
- Do not create a scheduler page without explicit design review

---

## 6. Safety Boundaries

| Concern | Status |
|---|---|
| No source code modified in P2 | Confirmed |
| No canvas/drag/drop/execution changes | Confirmed |
| No learned rules mutation changes | Confirmed |
| No task CRUD behavior changes | Confirmed |
| No contentRef/WorkspaceGrid changes | Confirmed |
| No scheduler page exposure | Confirmed |
| No hidden route exposure | Confirmed |
| No GitHub Release / tag / Stage C / feature flag / DB write / restore / restart | Confirmed |
