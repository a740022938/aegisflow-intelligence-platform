# AIP v7.33.0-P1 Operator Console Registry Preview

> **Date:** 2026-05-20
> **Status:** V7_33_P1_OPERATOR_CONSOLE_REGISTRY_PREVIEW_READY

## Summary

v7.33.0-P1 adds a readonly Operator Console registry preview. This is a pure frontend registry with validator and hidden direct route. No backend changes, no sidebar exposure, no Stage C.

## Deliverables

### Registry
- File: `apps/web-ui/src/registry/operator-console-registry.ts`
- 20 items across 12 domains: system, runtime, governance, approval, permission, evidence, audit, rollback, risk, boundary, operator, docs
- All items: `readonly: true`, `actionAllowed: false`, `mutationAllowed: false`
- 6 critical boundary items: Stage C, POST, DB write, external control, executor
- 3 sealed items: Readonly API Status, Smoke Evidence, Latest Seal Baseline
- Type: `OperatorConsoleRegistryItem` with domain, status, riskLevel, evidenceSource, linkedPreviewRoute, linkedDoc, forbiddenAction

### Validator
- File: `apps/web-ui/src/registry/operator-console-validator.ts`
- 15 validation checks covering: non-empty, id unique, readonly/actionAllowed/mutationAllowed constraints, Stage C/POST/DB/external/executor not actionable, high-risk preview safety, evidenceSource/forbiddenAction presence, status validity
- Target: blocking=0, warning<=1, info<=5, pass=true

### Preview Page
- File: `apps/web-ui/src/pages/OperatorConsoleRegistryPreview.tsx`
- Readonly PageShell page with 8 sections:
  - A. Seal Baseline (v7.32 + v7.33 D1 verdicts)
  - B. Validator Summary
  - C. Domain Coverage
  - D. Registry Overview
  - E. Critical Boundaries
  - F. Full Registry Table (grouped by domain)
  - G. Operator Next Step (includes link to P2 readonly UI preview)
  - H. Forbidden Actions Notice
- No action buttons, no POST forms, no execute controls

### Route
- Path: `/operator-console-registry-preview`
- Hidden direct route (not in sidebar, not in primary nav)
- Lazy loaded in App.tsx

### Registry Exposure
- `center-access-registry.ts`: entry added with `hidden_direct`, `visibleInSidebar: false`
- `navigation-exposure-registry.ts`: entry added with `direct_route`, `keep_direct_route` recommendation
- Validator checks ensure no sidebar exposure

## Safety

| Check | Status |
|-------|--------|
| Source code modified | Yes (registry, validator, preview, App.tsx, registries) |
| Backend modified | No |
| POST endpoint added | No |
| DB write enabled | No |
| External control enabled | No |
| Stage C enabled | No |
| Runtime executor added | No |
| Sidebar exposure | No (hidden direct only) |
| Layout/i18n/menu modified | No |

## Validation

| Check | Result |
|-------|--------|
| typecheck | (see Phase 8) |
| Tests | (see Phase 8) |
| git diff --check | (see Phase 8) |

## Final Verdict

```
V7_33_P1_OPERATOR_CONSOLE_REGISTRY_PREVIEW_READY
```
