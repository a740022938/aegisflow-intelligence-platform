# AIP v7.59-P4 Viewport Matrix

**Phase:** v7.59-P4
**Status:** DEFINED

---

## Viewport Coverage

| Viewport | Device class | Sidebar mode | Resizer expected behavior |
|---|---|---|---|
| 1440×900 | Desktop wide | Fixed sidebar | Visible, mouse drag functional, touch drag functional (post-impl) |
| 1280×720 | Desktop standard | Fixed sidebar | Visible, mouse drag functional, touch drag functional (post-impl) |
| 1024×768 | Tablet landscape | Fixed sidebar (≥1024px) | Visible, mouse drag functional, touch drag functional (post-impl) |
| 768×1024 | Tablet portrait | Overlay sidebar (768-1024) | DOM present but hidden by overlay; pointer events fire but no visual effect |
| 390×844 | Mobile | Overlay sidebar (<768px) | DOM present but hidden by overlay; pointer events fire but no visual effect |

---

## CSS Breakpoints

| Breakpoint | Value | Behavior change |
|---|---|---|
| 1024px | `lg` (TypeScript) | `getBp()` returns `'lg'` |
| 900px | CSS | Sidebar switches from fixed to overlay |
| 768px | `md` (TypeScript/CSS) | `getBp()` returns `'md'`; sidebar narrows (260px → 240px internal) |
| 700px | CSS | Further sidebar adjustments |
| 480px | CSS | Minimum width adjustments |

---

## Routes to QA Per Viewport

| Route | Purpose |
|---|---|
| `/` (Dashboard) | Standard layout, non-adapter page |
| `/governance-center` | Complex page with many panels |
| `/datasets` | Adapter-pilot page |
| `/plugin-pool` | Non-adapter page with grid |

---

## Before/After Screenshot Plan

For each viewport × route combination, capture:
1. Full page — sidebar open
2. Full page — sidebar closed (overlay modes)
3. Resizer area close-up (desktop/tablet landscape)

If UI not running: document "DEFERRED — UI not running" for each.
