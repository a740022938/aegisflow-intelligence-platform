# AIP v7.54-P4 Visual QA Evidence Standard

**Date:** 2026-05-21
**Derived from:** v7.54-P2 Datasets Visual QA Evidence

---

## 1. Required Viewports

| ID | Viewport | Target Layout | Rationale |
|---|---|---|---|
| V1 | 1440 × 900 | `lg` (desktop) | Primary design target |
| V2 | 1280 × 720 | `lg` (laptop) | Common laptop resolution |
| V3 | 1024 × 768 | `md` (tablet landscape) | Breakpoint transition |
| V4 | 768 × 1024 | `md`/`sm` (tablet portrait) | Narrow layout verification |
| V5 | 390 × 844 | `sm` (mobile) | Minimum supported width |

---

## 2. Required Inspection Items (All Viewports)

| # | Check | Method |
|---|---|---|
| 1 | PageShell root visible (`page-shell-root`) | DOM query or screenshot |
| 2 | PageShell content area visible (`page-shell-content`) | DOM query |
| 3 | PageHeader title matches expected | Visual inspection or DOM query |
| 4 | PageHeader not duplicated | Verify only one `<h1>` equivalent |
| 5 | StatusStrip visible and not overflowing | DOM query + visual inspection |
| 6 | Inner `page-root` div preserved with `ref={contentRef}` | DOM attribute check |
| 7 | WorkspaceGrid renders without visible breakage | Visual inspection |
| 8 | Card layout matches expected column count for viewport | Visual inspection |
| 9 | Filters/search controls usable | Visual inspection (not clipped) |
| 10 | Scroll behavior acceptable | Test scroll on content area |
| 11 | No horizontal overflow at any viewport | Visual inspection |
| 12 | Console errors = 0 or explicitly justified | Browser dev tools |
| 13 | No debug leaks (stale placeholders, `contentRef_raw`, raw metric labels) | DOM query |

---

## 3. State-Specific Requirements

| State | Viewport | Check |
|---|---|---|
| Normal (data loaded) | All V1–V5 | All cards visible, layout correct |
| Loading | V1 (1440×900) | Skeleton or spinner, no broken layout |
| Error | V1 (1440×900) | Error banner visible and readable |
| Empty (no data) | V1 (1440×900) | EmptyState message renders correctly |
| Layout edit mode | V1 (1440×900) | `toggleEdit` works, cards show edit handles |

---

## 4. Evidence Documentation

- Screenshots must be saved as PNG files
- File naming convention: `{page}_{width}x{height}.png` (e.g., `datasets_1440x900.png`)
- Screenshots should be stored externally (not committed to repo)
- A DOM analysis summary must accompany the screenshots
- The QA evidence document must include:
  - Screenshot table with status per viewport
  - DOM analysis results table
  - Console error count
  - Any known limitations

---

## 5. Acceptance Criteria

Visual QA is accepted when:

1. All V1–V5 screenshots are captured
2. DOM analysis shows all required structural elements present
3. Console errors = 0 (or explicitly documented and justified)
4. No catastrophic layout regression detected
5. No unexpected POST calls introduced
6. No destructive buttons introduced

---

## 6. Deferred QA Policy

- If visual QA cannot be executed (no UI automation, no browser access),
  the verdict must be `VISUAL_QA_DEFERRED`
- A deferred verdict prevents final acceptance — the phase cannot be sealed
- A follow-up phase (P2-equivalent) must be planned to execute visual QA
- Deferred QA is only acceptable for internal/development phases, never for
  release candidates
