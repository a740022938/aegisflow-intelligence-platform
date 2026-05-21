# AIP v7.61-P6 Registry Async-State Deferred Decision

**Status:** DEFERRED — NOT IMPLEMENTED

---

## Decision

Registry lazy-load remains **deferred** (no change from P1/P2/P3/P4).

## Rationale

| Reason | Detail |
|---|---|
| Direct JSX usage | `GOVERNANCE_REGISTRY` is passed as props to child components |
| Async state required | Would require loading state + null/undefined guards |
| Limited benefit | Registry is data-only, ~5-10 kB raw, ~2-3 kB gzip |
| Shared dependency | Also imported by `GovernanceCenterOverview`, `AdvancedModeReadonly`, `GovernanceGateMatrix` |
| Validator pilot confirmed no benefit | Same shared-dependency issue applies |

## When to Reconsider

- If child components (`GovernanceCenterOverview`, `GovernanceGateMatrix`) are refactored to pass registry data via props or context
- If a dedicated async-state loading pattern is implemented
- If the GovernanceCenter is further component-split at the route level
