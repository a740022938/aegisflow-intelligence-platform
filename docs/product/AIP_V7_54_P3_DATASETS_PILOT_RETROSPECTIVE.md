# AIP v7.54-P3 Datasets Pilot Retrospective

**Date:** 2026-05-21
**Pre-HEAD:** `ef77934`
**Post-HEAD:** `ef77934` (no code changes in P3)

---

## 1. Overview

The Datasets shell pilot spanned three phases:

| Phase | Verdict | Key Action |
|---|---|---|
| D1 | `CONDITIONAL_GO_FOR_V7_54_P1_ONLY_IF_ALL_ACCEPTANCE_CRITERIA_PASS` | Inventory + acceptance criteria + rollback plan (docs only) |
| P1 | `V7_54_P1_DATASETS_SHELL_PILOT_READY_WITH_VISUAL_QA_DEFERRED` | Code migration: PageShell wrapper, StatusStrip, contentRef preservation |
| P2 | `V7_54_P2_DATASETS_VISUAL_QA_ACCEPTED_WITH_MANUAL_EVIDENCE_AND_STAGE_C_DISABLED` | Visual QA: 5 viewport screenshots + Playwright DOM analysis |

---

## 2. Evidence Table

| Evidence | Exists | Key Finding | Reusable? | Notes |
|---|---|---|---|---|
| D1 Readiness Pack | ✅ | Conditional go defined with 12 conditions | Partial — inventory method is reusable | Top-level framework doc |
| D1 Page Inventory | ✅ | Full audit: 4 POST, 5 GET, 8 cards, contentRef, layout editor | Yes — inventory template reusable for any page | 687-line source |
| D1 Shell Adapter Criteria | ✅ | 10 acceptance criteria + forbidden changes | Yes — criteria pattern reusable | Outer-shell-only constraint |
| D1 Visual QA Checklist | ✅ | 10 viewport/state combinations | Yes — matrix is reusable | Screenshot-based verification |
| D1 Rollback Plan | ✅ | 3-state rollback (uncommitted/committed/pushed) | Yes — rollback template reusable | No force push |
| D1 Go/No-Go Decision | ✅ | 12 go conditions, 7 no-go conditions | Yes — decision framework reusable | All conditions passed |
| D1 Pilot Report | ✅ | D1 deliverable summary | Partial — report style reusable | Contains key risk mapping |
| P1 Shell Pilot Report | ✅ | 4-line-import + 12-line-render change | Partial — migration pattern reusable | Only Datasets.tsx changed |
| P1 QA & Acceptance Result | ✅ | 9/10 criteria PASS, 1 deferred (A9 visual) | Yes — acceptance tracking method reusable | Deferred visual QA documented |
| P2 Visual QA Evidence | ✅ | 5 viewport screenshots + Playwright DOM | Yes — multi-viewport QA method reusable | Screenshots not committed |
| P2 Acceptance Seal | ✅ | All 21 acceptance criteria PASS | Process is reusable | Final acceptance document |

---

## 3. What Worked

### 3.1 D1 Inventory-first Approach

The D1 phase produced a complete page inventory before any code was changed. This caught:
- `contentRef` dependency on `page-root` div
- 4 POST mutations that could not be mistaken for readonly
- Layout editor integration with `WorkspaceGrid`
- Multiple loading states (loading, detailLoading, saving, creating, pipelineLoading)

**Lesson:** Never migrate without a full inventory first.

### 3.2 P1 Outer-shell-only Constraint

The P1 code change was strictly limited to:
- Wrapping the existing render tree with `<PageShell>`
- Removing the old `<PageHeader>` (absorbed by PageShell)
- Adding `<StatusStrip>` with 3 status items
- Preserving `<div className="page-root" ref={contentRef}>` as inner wrapper

No business logic, WorkspaceGrid, API calls, or mutation code was touched. The diff was **29 lines** (12 removed, 17 added).

**Lesson:** Outer-shell-only is the only safe migration morph for pilot pages.

### 3.3 P2 Multi-viewport Visual QA

Using headless Chrome + Playwright, 5 viewport screenshots were captured and DOM
structure was verified. This closed the deferred visual QA gap from P1.

**Lesson:** Visual QA must not be assumed pass. Execute at least 5 viewport checks.

### 3.4 contentRef Preservation

The `contentRef` was kept on an inner `<div className="page-root">` within
PageShell, preserving `contentWidth` measurement from `useResponsiveLayoutMode()`.
The inline style override (`display:block; height:auto; overflow:visible`)
prevented double-scroll while keeping the CSS class for descendant selectors.

**Lesson:** contentRef must stay on the same logical element. Moving it breaks
responsive layout mode selection.

### 3.5 Layout Editor Not Touched

The layout editor (`toggleEdit`, `WorkspaceGrid editable`, layout save/load)
was left completely unchanged. This avoided a significant regression vector.

**Lesson:** Do not migrate layout-sensitive components during shell pilot.

---

## 4. What Was Risky

### 4.1 POST Mutations Present

Datasets has 4 POST mutations:
- `createDataset` — creates a new dataset
- `updateDataset` — updates an existing dataset
- `createDatasetNewVersion` — creates a new version
- `createPipelineRun` — starts a pipeline run

A shell migration that accidentally breaks any of these would be catastrophic.
The outer-shell-only constraint prevented this, but the risk was real.

**Mitigation relied on:** D1 inventory identifying all 4 calls, P1 git diff
verification, and acceptance criteria A2/A3 mandating API call identity.

### 4.2 WorkspaceGrid + contentRef Layout Sensitivity

WorkspaceGrid depends on `contentWidth` from `useResponsiveLayoutMode()`, which
depends on `contentRef` being on the correct DOM element. If the ref were moved
or the element's sizing context changed, the layout mode (`lg`/`md`/`sm`) could
change, causing cards to render in wrong columns.

**Mitigation relied on:** Keeping `contentRef` on inner `page-root` div,
same CSS class, same DOM depth, width-neutral inline style override.

### 4.3 Visual QA Deferred in P1

P1 passed without any visual QA (deferred verdict). If P2 had not been executed,
the pilot would carry unknown visual regression risk.

**Mitigation relied on:** P2 being planned as a mandatory follow-up. Never seal
a shell pilot without visual evidence.

### 4.4 Small Code Change, Non-zero Impact

Even though only 29 lines changed, the P1 code modification could still:
- Affect responsive layout (if `contentRef` width changed)
- Affect scroll behavior (overflow change from `auto` to `visible`)
- Affect CSS selector matching (class `page-root` still on inner div, but
  PageShell may add outer classes)

**Mitigation relied on:** P2 visual QA confirming no catastrophic regression.

---

## 5. What Must NOT Be Generalized

### 5.1 Datasets ≠ WorkflowComposer

WorkflowComposer uses ReactFlow with a state-machine-based undo/redo system.
A shell migration there would need to account for canvas sizing, node
positioning, and zoom behavior. The outer-shell-only pattern from Datasets
does not apply.

### 5.2 Datasets ≠ GovernanceHub

GovernanceHub has recover/resolve/confirm actions that may depend on specific
DOM layout for interactive confirmation flows. Shell migration could break
these dialogs.

### 5.3 Datasets ≠ All WorkspaceGrid Pages

Other WorkspaceGrid pages (Models, Tasks, etc.) use the same contentRef +
WorkspaceGrid pattern but may have different:
- Card counts and layouts
- Inline editing behaviors
- Layout persistence requirements

Each must be individually inventoried.

### 5.4 Mandatory Pre-migration Steps

Every future candidate page still requires:
- D1-style full page inventory
- Acceptance criteria document
- Rollback plan
- Visual QA checklist
- Go/No-Go decision

---

## 6. Retrospective Verdict

```text
V7_54_P3_DATASETS_PILOT_RETROSPECTIVE_READY_WITH_LIMITED_REUSABLE_RULES
```

The Datasets shell pilot was successful because it was constrained, gated, and
verified at every step. The key reusable patterns are:
1. Inventory-first approach (D1)
2. Outer-shell-only code change (P1)
3. Multi-viewport visual QA (P2)
4. contentRef preservation strategy
5. No-touch policy for WorkspaceGrid, layout editor, and mutations

These rules are limited in scope. They apply only to outer-shell migration of
non-canvas, non-governance pages with documented low mutation risk.
