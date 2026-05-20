# AIP v7.49 — Sidebar Migration Decision Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P3

---

## 1. Objective

Audit the current sidebar exposure state in `navigation-exposure-registry.ts` and make a migration decision. Do NOT move hidden preview pages into the sidebar during this phase.

## 2. Scope

- Audit all entries in `navigation-exposure-registry.ts`
- Classify each entry's exposure status
- Document the current sidebar boundary
- Decide: migrate now, defer, or never expose

## 3. Entry Classification

| Category | Description | Action |
|----------|-------------|--------|
| Canonical entrypoint | Currently shown in sidebar, should remain | Document as canonical |
| Hidden direct | Accessible via direct route, NOT in sidebar | Keep hidden; do not add to sidebar |
| Historical preview | Evidence/preview from prior phases | Keep as historical evidence |
| Deprecated preview | No longer recommended | Document deprecation; keep traceability |
| No-go | Must never appear in sidebar | Enforce no-go policy |

## 4. Decision Rules

- **Do NOT** add any `hidden_direct` or preview page to the sidebar during v7.49
- **Do NOT** change `currentExposure` or `recommendedExposure` values
- **Do NOT** remove or delete any existing registry entries
- **DO** document the current state and reasoning
- **DO** create a no-go policy for sidebar exposure during RC

## 5. Deliverables

- `docs/product/AIP_V7_49_SIDEBAR_EXPOSURE_AUDIT.md` — full audit of registry
- `docs/product/AIP_V7_49_HIDDEN_PREVIEW_MIGRATION_DECISION.md` — migration decision
- `docs/product/AIP_V7_49_CANONICAL_OPERATOR_ENTRYPOINTS.md` — canonical entry list
- `docs/product/AIP_V7_49_SIDEBAR_NO_GO_POLICY.md` — no-go policy

## 6. Default Recommendation

```
v7.49 does NOT execute sidebar migration.
Hidden direct entries remain hidden.
Local RC retains current sidebar boundary.
Formal release may include a separate migration sprint.
```

## 7. Safety

- No sidebar entries added or removed
- No hidden preview pages exposed
- No UI component changes
