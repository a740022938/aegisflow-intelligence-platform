# AIP v7.52 Canonical Page Migration Rules

**Date:** 2026-05-21  
**Status:** D1 — Blueprint

---

## 1. Core Principle

Every page migration must be **type-aware**. Pages of the same type must share the same shell, status display, empty state, and error state patterns.

## 2. Five Rules

### Rule 1: Always Start From Type

Before migrating any page, determine its page type from `AIP_V7_52_PAGE_TYPE_TAXONOMY_BLUEPRINT.md`. Select the corresponding shell. Do not invent a new layout for a page that has an existing type.

### Rule 2: Reference Pages Are Frozen

ConnectorCenterReadonly, AssistantCenter, and CostRouting are v7.52 reference pages. Do not rewrite them. Do not change their shell. Only minor visual adjustments (color, spacing) are allowed if they improve consistency.

### Rule 3: Stubs Stay Hidden

The 13 ModulePage placeholders in Intelligence and Automation stub sections must remain hidden. Do not expose them to the sidebar. Do not migrate them.

### Rule 4: Preview Pages Stay Preview

The 44+ preview-only pages (GovernanceCenter, StageC*, Operator*, etc.) must not be promoted to the main sidebar. They remain accessible via direct URL only. Do not add them to Layout.tsx.

### Rule 5: One Phase, One Type

Each v7.52 phase (P1–P5) targets exactly one page type. Do not mix types in a single phase. Exception: P1 targets Dashboard + Operations as a combined home/factory standardization.

## 3. Migration Procedure

```
1. Identify page type
2. Select corresponding shell variant
3. Add PageShell wrapper (or use existing)
4. Add StatusStrip (or align existing)
5. Add PageHeader if missing
6. Replace custom empty states with EmptyState component
7. Replace custom error states with ErrorState component
8. Replace custom auth states with AuthRequiredState component
9. Remove redundant CSS (style attributes, duplicate classes)
10. Run validation (typecheck, build, lint, diff)
```

## 4. Prohibited Operations

```
- Do not add mutation buttons to read-only shells
- Do not expose secrets, tokens, API keys
- Do not toggle feature flags or Stage C
- Do not create new dangerous execution pathways
- Do not change runtime behavior
- Do not migrate WorkflowComposer (deferred)
- Do not expose hidden ModulePage stubs
- Do not promote preview pages to sidebar
- Do not create GitHub Release or tags
```

## 5. Acceptance Criteria Template

```
- PageShell: YES/NO
- PageHeader: YES/NO
- StatusStrip: YES/NO
- ReadonlyBanner (governance only): YES/NO/NA
- EmptyState used: YES/NO/NA
- ErrorState used: YES/NO/NA
- AuthRequiredState used: YES/NO/NA
- No dangerous buttons: YES
- No sidebar expansion: YES
- Runtime behavior unchanged: YES
- Typecheck: PASS
- Build: PASS
- Lint: PASS
```

## 6. Version Contract

Each migrated page carries the **current app version**, not a historical version label. If a page references "v7.25.2" in its versionLabel, it should be updated to display the actual app version or use a clear "Page contract:" prefix to distinguish from app version.
