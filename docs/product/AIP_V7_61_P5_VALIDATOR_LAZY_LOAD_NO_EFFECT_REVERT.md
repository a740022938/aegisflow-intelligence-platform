# AIP v7.61-P5 Validator Lazy-Load No-Effect Revert

**Phase:** v7.61-P5
**Status:** REVERTED
**Type:** Source revert (GovernanceCenter.tsx)

---

## 1. Summary

Reverted the P2 Validator-only lazy-load implementation in `GovernanceCenter.tsx` because it produced no chunk reduction and added +0.51 kB overhead.

## 2. Root Cause

The validator module (`governance-registry-validator.ts`) could not be removed from the GovernanceCenter chunk because `GovernanceCenterOverview.tsx` — in the same lazy chunk — still statically imports it.

## 3. Revert Actions

| Change | Restored |
|---|---|
| React import | `useState, useEffect` removed, back to `useMemo` only |
| Validator import | Static import `import { validateGovernanceRegistry, getGovernanceRegistrySummary }` restored |
| Component body | `useMemo` pattern restored; `useState` + `useEffect` + dynamic `import()` removed |

## 4. Result

GovernanceCenter chunk returned to **930.88 kB** (pre-P2 baseline), hash `-DWYW17e5` confirmed.
