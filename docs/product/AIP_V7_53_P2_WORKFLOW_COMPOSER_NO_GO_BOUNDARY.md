# AIP v7.53-P2 WorkflowComposer No-Go Boundary

**Date:** 2026-05-21
**Baseline:** v7.53-P2 Workflow Complexity Split Plan

---

## 1. Decision

**WorkflowComposer must not be migrated, rewritten, or modified in v7.53.**

It is classified as **NO-GO** and deferred to v7.54+.

---

## 2. Reasons

| # | Reason | Detail |
|---|---|---|
| R1 | Large multi-file structure | ~10,362 lines across 27 files in `workflow-composer/` directory |
| R2 | Canvas state machine | Uses `@xyflow/react` (ReactFlow) for interactive node graph with full DAG semantics |
| R3 | Drag/drop and node connection complexity | Nodes can be dragged, connected, grouped, aligned; edge validation via `ConnectionValidator.ts` |
| R4 | Workflow execution semantics | Supports dry-run, run-from-node, retry-node, subchain execution — changing shell could affect execution flow |
| R5 | High regression risk | Any structural change risks breaking node graph rendering, connection logic, layout, or execution |
| R6 | Not suitable for shell-only migration | No PageShell or standard layout; custom canvas shell with inline elements throughout |
| R7 | Custom error boundary | `ComposerErrorBoundary` with draft-clearing recovery mechanism — unique to this page |
| R8 | Draft persistence | `draftStorage.ts` manages save/load/recovery of workflow drafts — fragile state coupled to component lifecycle |

---

## 3. Forbidden Changes

Without a new explicit plan (new AIP task pack), the following are **forbidden**:

| Area | Forbidden |
|---|---|
| Canvas | Rewriting `ReactFlow` rendering, changing node rendering, modifying `ComfyNode.tsx`, `NodePalette.tsx` |
| Drag/drop | Changing node drag behavior, connection creation, alignment, grouping |
| Node graph state | Changing `useNodesState` / `useEdgesState` management, node selection, multi-select |
| Execution behavior | Changing dry-run, run-from-node, retry-node, subchain execution, `workflowCompiler.ts` |
| Persistence | Changing `draftStorage.ts` save/load/recovery, clearing recovery drafts |
| API calls | Changing compile/dry-run API endpoints or payloads in `CompilePreviewPanel.tsx` or `workflowCompiler.ts` |
| Shell/layout | Adding `PageShell` or `OuterShellAdapter` wrapping, changing root-level `div` elements |
| CSS | Modifying `WorkflowComposerUI2.css`, `ComfyNode.css`, or any canvas CSS files |

---

## 4. Allowed Work (Future)

The following are allowed in future task packs, **only after a new explicit plan is approved**:

| Activity | Condition |
|---|---|
| Review-only inventory | Must be explicitly documented as "review-only, no modifications" |
| Visual snapshot | Before/after screenshots for regression comparison |
| Component boundary map | Architectural diagram of component dependencies (read-only) |
| No-op shell adapter design | Design document proposing `OuterShellAdapter` integration with no runtime changes |

---

## 5. Future Prerequisites

Before WorkflowComposer can be migrated:

1. `OuterShellAdapter` must be validated on at least one successfully migrated non-entity page
2. A complete component boundary map of `workflow-composer/` must exist
3. Visual snapshot of all canvas states must be captured
4. A dedicated AIP task pack must be created for WorkflowComposer migration
5. The migration must be no-op (shell-only) — no canvas, drag/drop, execution, or persistence changes

---

## 6. Safety Note

WorkflowComposer is the most complex page in the application by file count, total line count,
and architectural sophistication. Treating it as a shell-migration target before the adapter
pattern is proven on simpler pages would introduce unacceptable risk to workflow execution
and node graph functionality.
