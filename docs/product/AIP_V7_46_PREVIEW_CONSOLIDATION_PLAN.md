# AIP v7.46 — Preview Consolidation Plan

**Status:** P4 Final
**Date:** 2026-05-20

---

## 1. Current State

| Category | Count | Issue |
|----------|-------|-------|
| Preview pages | 44 | Outnumber real pages (28) |
| Auth Review pages | 4 | Confusing naming, different facets |
| Feature Flag pages | 3 | Near-duplicate content |
| Operator Console pages | 7 | Internal phase naming (P1-P4) |
| Stage C pages | 17 | All design-only, but dominant |

## 2. v7.46 Actions

| Action | Scope | Rationale |
|--------|-------|-----------|
| Create inventory | DOCS ONLY | Map all 44 preview pages |
| Create Auth Review canonical map | DOCS ONLY | Specify canonical entry point and labels |
| Create Feature Flag canonical map | DOCS ONLY | Specify canonical entry point and labels |
| Mark historical pages in registry | REGISTRY | Add `current`/`historical`/`deprecated` badges |

## 3. Future Actions (Post-v7.46)

| Action | Effort | Impact |
|--------|--------|--------|
| Merge 4 Auth Review into 1 page | HIGH | Reduces confusion, preserves content |
| Merge 3 Feature Flag into 1 page | MEDIUM | Eliminates triplication |
| Merge 7 Operator Console into 1-2 pages | HIGH | Simplifies operator experience |
| Create route map document | LOW | Helps navigation |
| Archive deprecated registries | MEDIUM | Reduces maintenance burden |

## 4. Rules

- Do NOT delete historical pages with traceability value
- Do NOT add hidden pages to sidebar
- Do NOT add mutation buttons
- Do NOT change route structure
- Do NOT break existing links

## 5. Registry Updates

The following registry badges would help:

| Badge | Meaning |
|-------|---------|
| `[CURRENT]` | Currently recommended entry point |
| `[REFERENCE]` | Supplementary reference page |
| `[HISTORICAL]` | Kept for traceability, not actively maintained |
| `[PLAN-ONLY]` | Design/specification only, no implementation |
