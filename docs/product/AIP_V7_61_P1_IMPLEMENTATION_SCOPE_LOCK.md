# AIP v7.61-P1 Implementation Scope Lock

**Phase:** v7.61-P1
**Status:** DEFINED

---

## Files Allowed to Be Modified (If Authorized)

| # | File | Allowed Changes | Authorization Required? |
|---|---|---|---|
| 1 | `apps/web-ui/src/pages/GovernanceCenter.tsx` | Replace static imports of registry/validator with dynamic `import()` calls | ✅ YES — must file authorization form |
| 2 | `apps/web-ui/src/registry/governance-registry-validator.ts` | None — read-only data | ❌ NO — do not modify |
| 3 | `apps/web-ui/src/registry/governance-registry.ts` | None — read-only data | ❌ NO — do not modify |

Note: Only `GovernanceCenter.tsx` should be modified. The registry and validator files are read-only data/logic that should not change.

## Files Explicitly Forbidden

| File / Class | Reason |
|---|---|
| `vite.config.ts` (build config) | Build config change requires separate authorization |
| `rollupOptions.output.manualChunks` | Forbidden unless separately authorized |
| `App.tsx` (route definitions) | Route behavior must not change |
| `apps/web-ui/src/components/Layout.tsx` | Sidebar resizer is sealed |
| `apps/web-ui/src/components/governance/*` | Sub-components (will be loaded by lazy GovernanceCenter chunk, not main bundle) |
| `apps/web-ui/src/pages/AdvancedModeReadonly.tsx` | Separate page — must not be modified by this task |
| Stage C / feature flag / release / restore files | Forbidden |
| Hidden preview / sidebar entry files | Forbidden |

## Allowed Implementation Techniques

| Technique | Allowed? | Condition |
|---|---|---|
| Dynamic `import()` | ✅ YES | Only inside GovernanceCenter.tsx |
| `React.lazy()` | ❌ NO | Not needed — page-level lazy already exists |
| Async `useMemo` / `useEffect` | ✅ YES | Standard React pattern |
| Loading state (spinner/null) | ✅ YES | If JSX needs async data |
| `await import(...)` inside function | ✅ YES | Standard dynamic import pattern |

## Maximum Acceptable Scope

The implementation scope is bounded to:

```
ONE file changed: apps/web-ui/src/pages/GovernanceCenter.tsx
ZERO build config changes
ZERO other source files changed
ZERO route behavior changes
```

If the implementation requires changes to any file outside of `GovernanceCenter.tsx`, it is scope creep and should be stopped.
