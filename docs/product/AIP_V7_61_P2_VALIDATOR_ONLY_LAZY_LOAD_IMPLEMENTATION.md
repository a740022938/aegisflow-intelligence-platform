# AIP v7.61-P2 Validator-Only Lazy-Load Implementation

**Phase:** v7.61-P2
**Status:** IMPLEMENTED — No-Effect Implementation
**Type:** Source change (Validator-only lazy-load in GovernanceCenter.tsx)

---

## 1. Summary

Replaced static import of validator functions in `GovernanceCenter.tsx` with a dynamic `import()` call inside a `useEffect` hook, using `useState` to hold the validator results.

## 2. What Changed

| Before | After |
|---|---|
| `import { validateGovernanceRegistry, getGovernanceRegistrySummary } from '../registry/governance-registry-validator'` | Removed static import |
| `const summary = useMemo(() => getGovernanceRegistrySummary(), [])` | `const [summary, setSummary] = useState({...defaults...})` |
| `const validator = useMemo(() => validateGovernanceRegistry(), [])` | `const [validator, setValidator] = useState({...defaults...})` |
| — | `useEffect(() => { import('../registry/...').then(mod => { ... }) }, [])` |
| `import React, { useMemo } from 'react'` | `import React, { useMemo, useState, useEffect } from 'react'` |

## 3. Why No Chunk Reduction

The validator functions are also statically imported by `GovernanceCenterOverview.tsx` (line 2), which is in the same lazy chunk. Therefore the validator code remains in the GovernanceCenter chunk regardless of how `GovernanceCenter.tsx` imports it.

## 4. Implementation Detail

Only `apps/web-ui/src/pages/GovernanceCenter.tsx` was modified. No build config, no other source files, no route changes.

## 5. Safety

- Registry lazy-load remains deferred (Strategy B)
- Existing behavior preserved
- No JSX changes
- No route changes
- No build config changes
