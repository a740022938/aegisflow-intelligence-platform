# AIP v7.61-P1 Registry+Validator Target Confirmation

**Phase:** v7.61-P1
**Status:** **B — TARGET PARTIALLY CONFIRMED**

---

## Confirmation Result

**`TARGET_PARTIALLY_CONFIRMED`** — Files are identifiable and bounded, but lazy-loading strategy differs from initial assumption.

---

## What Changed from D1 Assumption

| Assumption (D1) | Actual (P1 inventory) | Impact |
|---|---|---|
| Registry used only in `useMemo` | Registry used in `useMemo` **AND directly in JSX** as props | Cannot simply replace with dynamic import in useMemo if registry is passed to child components |
| Validator functions called once | Validator functions called once in useMemo (correct) | Validator lazy-load is straightforward |
| Both in same chunk | Both are **eagerly imported** → included in main bundle, NOT in GovernanceCenter chunk | Lazy-loading either would remove them from main bundle |
| Registry import only in GovernanceCenter | Registry also imported by `GovernanceCenterOverview`, `GovernanceGateMatrix`, `AdvancedModeReadonly` | Other callers must be considered |

## Recommended Lazy-Loading Strategy

### Strategy A: Lazy-Load Validator Only (Simplest)
Replace `static import` of `governance-registry-validator.ts` with dynamic `import()` inside the `useMemo(() => ..., [])` hooks in GovernanceCenter.tsx only.

- **Risk:** Very low (pure functions, no side effects)
- **Reduction:** ~5-10 kB (validator file is small)
- **Complexity:** Low — standard async pattern inside useMemo

### Strategy B: Lazy-Load Both Registry + Validator (Full Target)
Replace static imports of both files with dynamic imports:
- For validator: dynamic import inside useMemo
- For registry: dynamic import with async state + loading state (because registry is used in JSX)

- **Risk:** Low-Medium (need to handle async loading state for JSX)
- **Reduction:** ~10-30 kB (registry is larger data file)
- **Complexity:** Medium — requires async state management + loading fallback

### Strategy C: No Lazy Load (Defer)
Keep current imports, defer to full component split in the future.

- **Risk:** None
- **Reduction:** 0 kB

## Recommendation

**Strategy A** (Validator-only lazy load) is the safest first slice because:
1. Pure functions in useMemo with no JSX dependency
2. Validates the dynamic-import-in-useMemo pattern
3. Does not require async state management for JSX rendering
4. Rollback is trivial

Strategy B can follow in a future phase if the Validator-only pilot succeeds.
