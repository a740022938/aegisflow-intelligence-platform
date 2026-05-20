# AIP v7.46 — Web UI Polish Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P4

---

## 1. Objective

Address D0 findings on Web UI: 35 hidden previews > 28 real pages, duplicate Auth Review and Feature Flag pages, confusing labels, no canonical maps.

## 2. Current State (from D0)

| Issue | Count | Detail |
|-------|-------|--------|
| Total page files | 81 | In `pages/` directory |
| Real production pages | 28 | Dashboard, Tasks, Templates, etc. |
| Hidden preview pages | 35 | Operator Console, Stage C, Governance, etc. |
| Placeholder pages | 14 | All using generic ModulePage component |
| Auth Review pages | 4 | Console, Artifact, Gate Seal, Review Pack |
| Feature Flag pages | 3 | Control, Toggle Trial, Dry Trial |
| Operator Console pages | 7 | P1-P4 naming leaks to operator view |

## 3. Deliverables

### 3.1 Inventory Docs

| File | Purpose |
|------|---------|
| `docs/product/AIP_V7_46_WEB_UI_PREVIEW_INVENTORY.md` | Complete inventory of all 81 page files |
| `docs/product/AIP_V7_46_AUTH_REVIEW_PAGE_CANONICAL_MAP.md` | Canonical map for 4 Auth Review pages |
| `docs/product/AIP_V7_46_FEATURE_FLAG_PAGE_CANONICAL_MAP.md` | Canonical map for 3 Feature Flag pages |
| `docs/product/AIP_V7_46_PREVIEW_CONSOLIDATION_PLAN.md` | Plan for future consolidation |

### 3.2 Registry Updates (if needed)

- Add `historical` / `current` / `deprecated` badges where appropriate
- Add `no-action` warning strip to duplicate pages
- Update route map docs

### 3.3 Label Fixes

- "Advanced Mode Preview" — if permanently in sidebar, drop "Preview"
- Remove version numbers from page titles (e.g., "(v7.39)")
- Replace internal phase naming (P1-P4) with operator-facing descriptions

## 4. What NOT To Do

- Do NOT delete historical pages with evidence value
- Do NOT add hidden pages to sidebar
- Do NOT add mutation buttons
- Do NOT enable toggles
- Do NOT change route structure

## 5. Safety

- Stage C remains disabled
- Feature flag remains off
- No new POST behavior
- No sidebar exposure changes
