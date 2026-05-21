# AIP v7.61-P1 GovernanceCenter Source Inventory

**Phase:** v7.61-P1
**Status:** COMPLETE

---

## 1. Mission

Read-only inspect the GovernanceCenter Registry+Validator lazy-load target and confirm exact source files, import paths, dependencies, risk boundaries, and future implementation scope.

## 2. Source Files Identified

| # | File | Lines | Role |
|---|---|---|---|
| 1 | `apps/web-ui/src/pages/GovernanceCenter.tsx` | 1231 | Main page component (default export) |
| 2 | `apps/web-ui/src/App.tsx` | — | Lazy import (line 39) + route `/governance-center` (line 184) |
| 3 | `apps/web-ui/src/registry/governance-registry.ts` | 435 | Static data: `GOVERNANCE_REGISTRY` + type exports |
| 4 | `apps/web-ui/src/registry/governance-registry-validator.ts` | 303 | Validator functions: `validateGovernanceRegistry`, `getGovernanceRegistrySummary`, `getGovernanceModuleById`, `listGovernanceModulesByCategory`, `listGovernanceModulesByRiskLevel` |
| 5 | `apps/web-ui/src/components/governance/GovernanceCenterOverview.tsx` | — | Sub-component, also imports registry + validator |
| 6 | `apps/web-ui/src/components/governance/GovernanceGateMatrix.tsx` | — | Sub-component, imports `GOVERNANCE_REGISTRY` only |
| 7 | `apps/web-ui/src/pages/AdvancedModeReadonly.tsx` | — | Separate page, imports both registry + validator |

## 3. Import Summary

```
App.tsx:39 — const GovernanceCenter = lazy(() => import('./pages/GovernanceCenter'));
GovernanceCenter.tsx:
  import { GOVERNANCE_REGISTRY } from '../registry/governance-registry';
  import { validateGovernanceRegistry, getGovernanceRegistrySummary } from '../registry/governance-registry-validator';
  import type { GovernanceModuleDefinition } from '../registry/governance-registry';

governance-registry-validator.ts:
  import { GOVERNANCE_REGISTRY } from './governance-registry';  (line 5 — transitive dependency)
```

## 4. Registry/Validator Usage in GovernanceCenter.tsx

| Usage | Pattern | Location |
|---|---|---|
| `getGovernanceRegistrySummary()` | `useMemo(() => ..., [])` | Line ~373 |
| `validateGovernanceRegistry()` | `useMemo(() => ..., [])` | Line ~374 |
| `GOVERNANCE_REGISTRY.flatMap(m => m.gates)` | `useMemo(() => ..., [])` | Line ~375 |
| `GOVERNANCE_REGISTRY.length` | useMemo self-check | Lines 377-393 |
| `GOVERNANCE_REGISTRY.find(...)` | useMemo self-check | Lines 377-393 |
| `GOVERNANCE_REGISTRY.filter(...)` | useMemo self-check | Lines 377-393 |
| `GOVERNANCE_REGISTRY` passed as prop | JSX: `<ModuleCard modules={GOVERNANCE_REGISTRY}>` | JSX render |
| `GOVERNANCE_REGISTRY` passed as prop | JSX: `<ForbiddenActionsMatrix modules={GOVERNANCE_REGISTRY}>` | JSX render |

## 5. Side Effects

Both files are **side-effect-free at module load**:
- `governance-registry.ts`: Only type definitions + const array of 13 module objects
- `governance-registry-validator.ts`: Only pure functions; imports GOVERNANCE_REGISTRY as dependency
- No `console.log`, `fetch`, `localStorage`, `setTimeout`, `window`, `document` at module load
