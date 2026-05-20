# AIP v7.46 — Feature Flag Page Canonical Map

**Status:** P4 Final
**Date:** 2026-05-20

---

## 1. The Problem

There are 3 page files with "Feature Flag" in their name. All show similar content: feature flag is OFF, Stage C is DISABLED, no toggle is possible.

## 2. Current Pages

| # | Route | Lines | Phase | Focus |
|---|-------|-------|-------|-------|
| 1 | `/stage-c-feature-flag-control-preview` | 84 | v7.39 | Control console — 28 items, all disabled |
| 2 | `/stage-c-feature-flag-toggle-trial-preview` | 127 | v7.39 | Toggle trial plan — 21 items, all toggleExecuted=false |
| 3 | `/stage-c-feature-flag-dry-trial-preview` | 117 | v7.39 | Dry trial — 20 items, all not enabled |

## 3. Canonical Map

| Role | Page | Rationale |
|------|------|-----------|
| **Canonical entry point** | `/stage-c-feature-flag-control-preview` | Most comprehensive (28 items). Shows all feature flags with state. |
| **Toggle trial (historical)** | `/stage-c-feature-flag-toggle-trial-preview` | Historical — trial plan that was not executed. Keep for traceability. |
| **Dry trial (historical)** | `/stage-c-feature-flag-dry-trial-preview` | Historical — dry trial that was completed. Keep for traceability. |

## 4. Labels for Clarity

If labels are updated in the future:

```
Feature Flag Control       [CURRENT]     ← entry point, 28 items
Feature Flag Toggle Trial  [HISTORICAL]  ← trial plan, not executed
Feature Flag Dry Trial     [HISTORICAL]  ← dry trial, completed
```

## 5. Important Note

All 3 pages show the same bottom line: **Stage C is DISABLED. Feature flag is OFF. No toggle is possible from the UI.** The historical pages should be clearly marked as historical.

## 6. Duplicate Assessment

The 3 pages are effectively duplicates of the same information. The control page (28 items) covers the full set. The historical pages (21 and 20 items) cover subsets. For v7.46, they should be kept for traceability but clearly marked.
