# AIP v7.61-P1 Import Chain and Dependency Map

**Phase:** v7.61-P1
**Status:** COMPLETE

---

## Import Chain

```
Route (/governance-center)
└── App.tsx: lazy(() => import('./pages/GovernanceCenter'))
    └── GovernanceCenter.tsx (default export)
        ├── import { GOVERNANCE_REGISTRY } from '../registry/governance-registry'
        │   └── governance-registry.ts (435 lines)
        │       ├── export const GOVERNANCE_REGISTRY: GovernanceModuleDefinition[]
        │       ├── export type GovernanceModuleId
        │       ├── export type GovernanceModuleCategory
        │       ├── export type GovernanceStatus
        │       ├── export type GovernanceRiskLevel
        │       ├── export type GovernanceMaturity
        │       ├── export type SafetyBoundaryTag
        │       ├── export type GovernanceOwnerCenter
        │       ├── export type IssueSeverity
        │       ├── export type GovernanceActionPolicy
        │       ├── export type GovernanceGate
        │       └── export type GovernanceModuleDefinition
        │
        ├── import { validateGovernanceRegistry, getGovernanceRegistrySummary }
        │      from '../registry/governance-registry-validator'
        │   └── governance-registry-validator.ts (303 lines)
        │       ├── import { GOVERNANCE_REGISTRY } from './governance-registry'  ← transitive
        │       ├── export function validateGovernanceRegistry()
        │       ├── export function getGovernanceRegistrySummary()
        │       ├── export function getGovernanceModuleById(id)
        │       ├── export function listGovernanceModulesByCategory(category)
        │       └── export function listGovernanceModulesByRiskLevel(level)
        │
        └── import type { GovernanceModuleDefinition } from '../registry/governance-registry'
```

## Other Importers (Registry/Validator Consumers Outside GovernanceCenter)

```
GovernanceCenterOverview.tsx
  └── import { GOVERNANCE_REGISTRY } from '../../registry/governance-registry'
  └── import { getGovernanceRegistrySummary, validateGovernanceRegistry }
         from '../../registry/governance-registry-validator'

GovernanceGateMatrix.tsx
  └── import { GOVERNANCE_REGISTRY } from '../../registry/governance-registry'

AdvancedModeReadonly.tsx
  └── import { GOVERNANCE_REGISTRY } from '../registry/governance-registry'
  └── import { validateGovernanceRegistry } from '../registry/governance-registry-validator'
```

## Barrel Exports

**No barrel exports** — no `index.ts` in `src/registry/` or `src/components/governance/`. All imports use explicit relative paths.

## Module-Init Side Effects

Both files are **pure at module load** — no side effects, no top-level function calls.

However, there is a **transitive dependency:** loading `governance-registry-validator` always also loads `governance-registry` (via its top-level import), which instantiates the `GOVERNANCE_REGISTRY` const array.

## Lazy-Load Safety Assessment

| File | Side Effects | JSX Dependency | Safe for Lazy Load? | Strategy |
|---|---|---|---|---|
| `governance-registry-validator.ts` | None | No (called in useMemo) | ✅ YES | Dynamic import inside useMemo |
| `governance-registry.ts` | None | Yes (passed as props to child components) | ✅ YES (with async state) | Requires async state + loading fallback |
