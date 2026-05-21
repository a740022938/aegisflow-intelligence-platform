# AIP v7.61-P4 Registry Strategy Decision

**Status:** DECISION RECORDED

---

## Options Considered

| Option | Description |
|---|---|
| **A. Defer Registry lazy-load** | Do not implement because Registry is used directly in JSX/props and requires async state management |
| **B. Plan Registry async-state strategy later** | Create a separate plan for Registry lazy-load with async state and loading fallback |
| **C. Do not pursue Registry lazy-load** | Limited benefit relative to risk; Registry is data-only (~8 kB after gzip) |
| **D. Proceed only with dedicated visual QA** | Requires full state-loading plan and browser QA before implementation |

## Recommendation

**Option A + B (Defer now, plan later)**

### Rationale

1. **Registry is used in JSX** — `GOVERNANCE_REGISTRY` is passed directly as props to child components (`ModuleCard`, `ForbiddenActionsMatrix`, `GovernanceCenterOverview`, etc.)
2. **Async state required** — Lazy-loading Registry would require loading state, fallback UI, and null/undefined guards
3. **Limited benefit** — Registry is ~5-10 kB raw, ~2-3 kB gzip; even less after compression
4. **Validator lazy-load produced no effect** — The same shared-dependency issue likely applies to Registry as well (also imported by `GovernanceCenterOverview`, `AdvancedModeReadonly`)
5. **Higher risk** — Registry loading failure would break the entire GovernanceCenter page

### When to Reconsider

- If GovernanceCenterOverview and other sub-components are refactored to use dynamic imports
- If a dedicated async-state loading pattern (skeleton/spinner) is implemented
- If the GovernanceCenter chunk is split into smaller sub-chunks via Route-based splitting
