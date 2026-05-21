# AIP v7.63-P1 Sidebar Empty Section Rendering Polish

**Phase:** v7.63-P1
**Status:** COMPLETE

---

## Problem

Sidebar rendered empty stub sections "智能增强" (intelligence) and "自动化" (automation) with no visible child items. These sections appeared as dark blocks with only a section label and no sub-items.

## Root Cause

`apps/web-ui/src/components/Layout.tsx` contained explicit stub section blocks (lines 313-327) with the comment `stub — all items hidden until implemented`. These sections had zero child NavItems but were still rendered as `nav-section-stub` elements.

## Fix

1. **Removed the two empty stub sections** from `Layout.tsx` — sections "智能增强" and "自动化" are now completely absent from the sidebar when they have no visible children.
2. **Cleaned up `DEFAULT_COLLAPSED`** — removed keys `'intelligence'` and `'automation'` that no longer reference existing sections.
3. **Removed dead CSS** — deleted `.nav-section-stub` and `.nav-section-label-stub` CSS rules from `Layout.css` that only existed for these removed sections.

## Files Changed

| File | Change |
|---|---|
| `apps/web-ui/src/components/Layout.tsx` | Removed 2 empty stub section blocks; cleaned DEFAULT_COLLAPSED |
| `apps/web-ui/src/components/Layout.css` | Deleted unused `.nav-section-stub` CSS rules |

## Verification

| Check | Result |
|---|---|
| Typecheck | ✅ PASS |
| Build | ✅ PASS (16.65s) |
| Lint | ✅ PASS (0 warnings) |

## Acceptance Criteria

| Criterion | Status |
|---|---|
| No empty section renders in sidebar | ✅ |
| "智能增强" / "自动化" no longer visible as dark blocks | ✅ |
| All existing menu entries unchanged | ✅ |
| Hidden preview/stub pages remain hidden | ✅ |
| No new sidebar entries added | ✅ |
| No Stage C / feature flag / release / restore / DB changes | ✅ |
| No opacity/dim/disabled visual tricks used | ✅ (sections simply removed) |
