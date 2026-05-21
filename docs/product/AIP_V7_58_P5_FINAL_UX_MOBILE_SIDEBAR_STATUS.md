# AIP v7.58-P5 Final UX / Mobile / Sidebar Status

**Phase:** v7.58-P5
**Status:** FINAL

---

## 1. UX Consistency Sweep (P3)

| Page | Shell Status | Risk |
|---|---|---|
| Datasets | ✅ PageShell (adapter pilot) | Low |
| GovernanceCenter | ✅ PageShell (`safetyBoundary="readonly"`) | Low |
| Dashboard | Non-adapter | Medium |
| AssistantCenter | Non-adapter | Medium |
| CostRouting | Non-adapter | Medium |
| FactoryStatus | Non-adapter | Medium |
| ConnectorCenterReadonly | ⏸ Deferred | Low-Medium |
| PluginPool | Non-adapter | Low-Medium |
| WorkflowCanvas / Feedback | Non-adapter | Medium |

**2 of 9 pages** are shell-enabled. **7 remain non-adapter.**

---

## 2. Sidebar Resizer (P4)

| Aspect | Status |
|---|---|
| Event handlers | `mousedown`/`mousemove`/`mouseup` only |
| Touch/pointer support | ❌ MISSING |
| Width range | [220, 460] pixels, default 288px |
| Persistence | localStorage `agi_layout_v2:global:sidebar_width` |
| Mobile behavior | Overlay at <= 900px via hamburger toggle |

---

## 3. Breakpoints

| Breakpoint | Value | Behavior |
|---|---|---|
| Desktop | > 900px | Fixed sidebar, resizer functional (mouse) |
| Tablet | 768-900px | Overlay sidebar, no touch resizer |
| Mobile | < 768px | Overlay sidebar, narrow width (240-260px) |
| Layout editor gated | >= 1200px | `canUseLayoutEditor` |

---

## 4. Deferred Sidebar Items

17 sidebar entries with `recommendedExposure !== 'primary_nav'` have been deferred since v7.47-RC. These include routes for cost-routing, openaxiom-readonly, memory-hub, training-v2, and others that should be moved to advanced mode or governance center categories.

---

## 5. UX Implementation Status

| Item | Status |
|---|---|
| Mobile/sidebar implementation in v7.58 | NO |
| Viewport screenshots captured | NO (UI not running) |
| UX evidence checklist executed | NO (UI not running) |
| Future preconditions | Screenshots, viewport QA, pointer+mouse regression checks required |
