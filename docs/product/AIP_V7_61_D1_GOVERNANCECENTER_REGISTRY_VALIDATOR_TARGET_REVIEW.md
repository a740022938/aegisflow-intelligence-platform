# AIP v7.61-D1 GovernanceCenter Registry+Validator Target Review

**Phase:** v7.61-D1
**Status:** TARGET CONFIRMED

---

## Why This Is the Second Candidate

The sidebar pointer resizer (v7.60) was selected as the first slice because it was the smallest change (~8 lines) with the highest visible UX value. The GovernanceCenter Registry+Validator lazy-load is the natural second candidate because:

1. **Smallest remaining change** — replace an eager import with a dynamic import for static data
2. **Validates the pattern** — proves component-level lazy loading works before attempting larger splits
3. **Lowest risk** — static data, no side effects, no mutation/safety controls
4. **Measurable benefit** — even 10-30 kB reduction is provable

## What Registry+Validator Means

From v7.58-P1 chunk source map:
- `GOVERNANCE_REGISTRY` — a static data registry imported from `../registry/governance-registry`
- `validateGovernanceRegistry` — validation logic from `../registry/governance-registry-validator`
- Both are used in a `useMemo` self-check that validates 11 assertions on the registry

The lazy-load target is not a UI component but a data import. It would be replaced with a dynamic `import()` call inside the existing `useMemo`, so the registry is loaded only when GovernanceCenter renders.

## Expected Benefit

| Metric | Before | After (estimate) |
|---|---|---|
| GovernanceCenter chunk | 930.88 kB | ~900-920 kB |
| Reduction | — | 10-30 kB |
| Warning count | 1 (GovernanceCenter) | 1 (still exceeds 500 kB) |

The 10-30 kB reduction is small but measurable. The primary value is **pattern validation**, not chunk size elimination.

## Expected Risk

| Risk | Severity | Mitigation |
|---|---|---|
| Dynamic import increases latency | Low | Registry is small (estimated <10 kB); negligible impact |
| `useMemo` with async import | Low | Wrap in useEffect + state; well-understood pattern |
| Rollback complexity | Very Low | Single-commit change; `git revert` |

## Why manualChunks Remains Forbidden

`manualChunks` in Vite config is a broader build-config change that would affect all chunking. Adding it would:
- Require build config modification (forbidden without explicit authorization)
- Affect chunking for all routes, not just GovernanceCenter
- Risk unintended side effects in production builds

The lazy-load approach targets a single file (`GovernanceCenter.tsx`) with a standard React pattern (`React.lazy` or dynamic `import()`), avoiding any build config changes.

## Why Broad Component Splitting Is Deferred

The full GovernanceCenter component split (~142 sub-components) would require:
- Multiple dynamic import boundaries
- Significant refactoring of the 1231-line file
- More extensive visual QA
- Higher rollback complexity

The Registry+Validator pilot validates the approach before committing to the larger effort.

## Missing Evidence Before Implementation

| Missing Evidence | Required Before Implementation |
|---|---|
| Exact file path for GOVERNANCE_REGISTRY import in GovernanceCenter.tsx | v7.61-P1 — read-only source inventory |
| Exact file path for validator import | v7.61-P1 — read-only source inventory |
| Current import syntax (static `import` vs re-export) | v7.61-P1 — read-only source inventory |
| Whether registry is used outside useMemo | v7.61-P1 — read-only source inventory |

## Before/After Measurements Required

| Measurement | Before | After |
|---|---|---|
| GovernanceCenter chunk size | ✓ | ✓ |
| Total build warning count | ✓ | ✓ |
| GovernanceCenter route render | ✓ | ✓ |
| Console errors | ✓ | ✓ |
| Viewport screenshots (5) | ✓ | ✓ |
