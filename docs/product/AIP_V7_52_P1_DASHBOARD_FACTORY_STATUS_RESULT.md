# AIP v7.52-P1 Dashboard + FactoryStatus Standardization Result

**Date:** 2026-05-21  
**Phase:** P1 — Dashboard + FactoryStatus Limited Standardization  
**Baseline:** v7.52-D1 Blueprint (`8240c5a`)  
**Target Verdict:** `V7_52_P1_DASHBOARD_FACTORY_STATUS_STANDARDIZED_WITH_STAGE_C_DISABLED`

---

## Summary

Resolved D0 HIGH finding: **Dashboard homepage now has a shell**. Both Dashboard and FactoryStatus are wrapped in PageShell with StatusStrip.

## Dashboard Changes

| Aspect | Before | After |
|---|---|---|
| Shell | `.page-root` div + standalone `PageHeader` | `PageShell` wrapper |
| Status bar | None | `StatusStrip` with Track, Stage C, Feature Flag, Version, Services, Experiments |
| Title | `<PageHeader title={APP_META.appName}>` | `PageShell` title prop (same value) |
| Subtitle | `td.title` | Same |
| Actions | Refresh, layout edit, layout reset buttons | Same (moved to PageShell actions) |
| Content | Responsive card grid / WorkspaceGrid | Same (inside inner div with contentRef) |
| Version | Inline `<span className="dash-version">v{displayVersion}</span>` | Moved to `versionLabel` prop on PageShell |
| Runtime behavior | Fetch summary, activities, plugins, health | **Unchanged** |

## FactoryStatus Changes

| Aspect | Before | After |
|---|---|---|
| Shell | `.page-root` div + standalone `PageHeader` | `PageShell` wrapper |
| Status bar | None | `StatusStrip` with Time Range, Blocked Gates, Recent Failures, Recoveries |
| Title | `<PageHeader title="工厂运行态">` | `PageShell` title prop (same) |
| Subtitle | `Production Readashboard Dashboard · {timeRange}` | Same |
| Actions | Version filter, active toggle, time range, refresh, layout edit/reset | Same (moved to PageShell actions) |
| Content | Responsive grid / WorkspaceGrid + Drilldown panels | **Same** |
| Runtime behavior | Fetch status, drilldowns, incident, timeline | **Unchanged** |

## No Dangerous Buttons Added
- No release/tag buttons
- No Stage C enable buttons
- No feature flag toggle buttons
- No mutation buttons

## Validation

| Check | Result |
|---|---|
| `pnpm run typecheck` | ✅ Passed |
| `pnpm run build` | ✅ Passed |
| `pnpm run lint` | ✅ Passed (0 warnings) |
| `git diff --check` | ✅ Clean |
| `git status --short` | ✅ Clean after commit |

## Safety

| Boundary | Status |
|---|---|
| CostRouting migrated | No |
| ConnectorCenterReadonly migrated | No |
| AssistantCenter migrated | No |
| WorkflowComposer migrated | No |
| PluginPool migrated | No |
| All pages migrated | No |
| Sidebar rewritten | No |
| Runtime behavior changed | No |
| Release/tag buttons added | No |
| Stage C enabled | No |
| Feature flag toggled | No |
| DB write | No |
| Restore executed | No |
| Tag created | No |
| GitHub Release created | No |
