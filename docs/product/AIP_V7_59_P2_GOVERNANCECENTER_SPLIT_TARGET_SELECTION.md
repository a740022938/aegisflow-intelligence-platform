# AIP v7.59-P2 GovernanceCenter Split Target Selection

**Phase:** v7.59-P2
**Status:** COMPLETED — target identified

---

## 1. Candidate Section Categories

From the P1 dependency inventory, the GovernanceCenter sub-components fall into three natural section categories:

| Category | Components | Approx count | Coupling | Safety risk |
|---|---|---|---|---|
| **A. Gate/Model Design Panels** | StageCPreviewPanel, GovernanceGateMatrix, GovernanceBoundaryPanel, DeferredControlPath, GovernanceDataModelPanel, etc. | ~40 | Low (all independent) | None (readonly) |
| **B. Stage Coverage Components (P1-P12)** | GateCoverageOverview, StageCReadinessBlockerMatrix, GoNoGoDecisionMatrix, etc. | ~70 | Low (all independent) | None (readonly) |
| **C. Implementation Review Components (P7-P12)** | P7SchemaImplementationPlan, AuthorizationApiImplementationPlanReview, etc. | ~30 | Low (all independent) | None (readonly) |
| **D. Registry + Validator** | GOVERNANCE_REGISTRY, governance-registry-validator | 2 | Low (used by all panels but no cyclic dependency) | None (static data) |

---

## 2. Selection Criteria

| Criterion | Target must satisfy |
|---|---|
| Low coupling | Components are independent, no cross-component state |
| Minimal state dependencies | No shared React state between components in different sections |
| No mutation/safety control changes | All components are readonly |
| Easy visual QA | Section renders in isolation, easy to compare before/after |
| Easy rollback | Simple `git revert` |
| No route behavior change | Route stays at `/governance-center` |
| No hidden preview/sidebar exposure | No changes to navigation |

---

## 3. Selected Pilot Target

**Category D — Registry + Validator lazy loading**

| Field | Value |
|---|---|
| Target | `GOVERNANCE_REGISTRY` and `validateGovernanceRegistry` |
| Reason | Smallest change, lowest risk, validates the lazy-loading pattern |
| Expected size reduction | ~10-30 kB (small but measurable) |
| Code change | Replace `import { GOVERNANCE_REGISTRY }` with dynamic import in `useMemo` |
| Risk | Extremely low — static data, no side effects |

**Secondary target (for follow-up if pilot succeeds):**
**Category A — Gate/Model Design Panels** (~40 components, ~200 kB estimated)

---

## 4. Fallback

If Registry lazy loading proves infeasible (e.g., the registry is too intertwined with rendering), defer to:
- Category A — Gate/Model Design Panels section split
- Or document the full deferral of optimization

---

## 5. No Safe Target Contingency

A safe target IS identifiable. Registry + Validator satisfies all selection criteria. Proceed with pilot plan.
