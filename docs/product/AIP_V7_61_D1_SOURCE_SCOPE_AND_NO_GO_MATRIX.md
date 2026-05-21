# AIP v7.61-D1 Source Scope and No-Go Matrix

**Phase:** v7.61-D1
**Status:** DEFINED

---

## Allowed Changes (If Authorized)

| Change | Allowed? | Condition |
|---|---|---|
| Modify `GovernanceCenter.tsx` | ✅ YES | Only to add dynamic import for Registry+Validator |
| Add dynamic `import()` call | ✅ YES | Only for GOVERNANCE_REGISTRY + validator |
| Modify governance-registry file | ❌ NO | Registry is read-only data |
| Modify governance-registry-validator | ❌ NO | Validator is read-only logic |
| Modify build config | ❌ NO | Forbidden unless separately authorized |
| Add manualChunks | ❌ NO | Forbidden unless separately authorized |
| Modify route definitions | ❌ NO | Route stays at `/governance-center` |
| Modify Layout.tsx | ❌ NO | Sidebar resizer is sealed |
| Modify sidebar behavior | ❌ NO | Sidebar pointer work is complete |
| Modify Stage C / feature flag | ❌ NO | Forbidden |
| Modify release/restore code | ❌ NO | Forbidden |
| Expose hidden previews | ❌ NO | Forbidden |
| Expand sidebar entries | ❌ NO | Forbidden |

---

## No-Go Matrix

| Condition | Trigger | Action |
|---|---|---|
| Implementation requires build config change | `vite.config.ts` must be modified | ❌ STOP — not authorized |
| Implementation requires manualChunks | `rollupOptions.output.manualChunks` needed | ❌ STOP — not authorized |
| Implementation touches Stage C/feature flags | Any change to feature flag state | ❌ STOP — not authorized |
| Implementation touches release/restore | Any change to release/restore code | ❌ STOP — not authorized |
| Implementation modifies sidebar/Layout.tsx | Change to Layout.tsx | ❌ STOP — not authorized |
| Implementation alters route behavior globally | Route definitions change | ❌ STOP — not authorized |
| Implementation requires broad refactor | >3 source files need changes | ❌ STOP — scope creep |
| Implementation changes mutation/safety controls | Any readonly→writable change | ❌ STOP — safety violation |
| Implementation exposes hidden previews/sidebar | Hidden content becomes visible | ❌ STOP — safety violation |
| Implementation lacks visual QA | No screenshots before/after | ❌ STOP — evidence required |
| Rollback unclear | Revert produces errors | ❌ STOP — fix rollback first |
| Validation fails | typecheck/build/lint error | ❌ STOP — fix validation first |
| Target files unclear | Which file to edit is unknown | ❌ STOP — investigate first |

---

## Scope Boundaries

```
Repository boundary: apps/web-ui/src/pages/GovernanceCenter.tsx ONLY
└── May add: dynamic import for GOVERNANCE_REGISTRY + validator
└── May NOT change: any other file in the repository
```
