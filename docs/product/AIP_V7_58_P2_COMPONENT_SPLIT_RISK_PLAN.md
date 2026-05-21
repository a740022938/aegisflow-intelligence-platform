# AIP v7.58-P2 Component Split Risk Plan

**Phase:** v7.58-P2
**Status:** PLAN ONLY — no implementation

---

## 1. Candidate Sub-Component Categories

| Category | Components | Approx count | Estimated size contribution |
|---|---|---|---|
| Gate/Model Design Panels | StageCPreviewPanel, GovernanceGateMatrix, GovernanceBoundaryPanel, etc. | ~40 | ~200 kB |
| Stage Coverage Components (P1-P12) | GateCoverageOverview, StageCReadinessBlockerMatrix, GoNoGoDecisionMatrix, etc. | ~70 | ~350 kB |
| Implementation Review Components (P7-P12) | P7SchemaImplementationPlan, AuthorizationApiImplementationPlanReview, etc. | ~30 | ~150 kB |
| Registry + Validator | GOVERNANCE_REGISTRY, governance-registry-validator | 2 | Variable |
| Inline JSX + useMemo + SectionCards | PageShell integration + rendering | — | ~100 kB |

---

## 2. Likely Low-Risk Areas

| Category | Risk | Reason |
|---|---|---|
| Registry lazy loading | **Low** | Static data, no side effects, already validated at render time |
| Section-level lazy loading (top-level panels) | **Low-Medium** | All components are readonly, no mutation state to lose |
| Individual panel lazy loading (large panels) | **Low** | Each panel is self-contained; no cross-panel state dependencies |

---

## 3. Likely High-Risk Areas

| Category | Risk | Reason |
|---|---|---|
| Inline JSX + useMemo self-check | **High** | Contains the 11-assertion registry validation and GoNoGoDecisionMatrix rendering — breaking this would affect the entire page |
| Shared UI components (PageShell, SectionCard) | **Low but shared** | Already in separate chunks — no need to split |
| manualChunks governance group | **Medium** | Requires build config change and dependency impact analysis |

---

## 4. Dependency Isolation Requirements

| Requirement | Detail |
|---|---|
| No circular imports | All governance sub-components import from registry, not from each other |
| Registry must load before panels that use it | Dynamic import must ensure registry resolves before panel rendering |
| Panel groups must be independent | Section-level groups (Gate Design, Stage Coverage, Review) are naturally isolated |

---

## 5. Behavior Preservation Requirements

| Behavior | Must preserve |
|---|---|
| Full page render | All 142 panels must render in the same order and layout |
| Registry validation | 11-assertion useMemo must still execute |
| Empty/error states | Each section's empty/error state must render correctly |
| Scroll position | Page scroll position must not reset on section lazy load |
| Console errors | No new console errors after split |

---

## 6. State / Mutation Safety Review

| Concern | Assessment |
|---|---|
| Mutation state | All panels are readonly — no mutation state exists |
| Form state | No forms exist in GovernanceCenter |
| URL query params | Not used by GovernanceCenter |
| Scroll restoration | Native browser behavior — verify after split |

**Conclusion:** Zero mutation safety risk. All 142 sub-components are readonly design-spec panels.

---

## 7. Visual QA Matrix

| Check | Pre-split | Post-split |
|---|---|---|
| Screenshot full page | ✅ Required | ✅ Verify match |
| Loading state (Suspense) | N/A (all eager) | ✅ Verify fallback renders |
| Panel order | Verified | Verify unchanged |
| Console errors | None | Verify none added |
| Network tab | Single chunk | Verify sections load in order |

---

## 8. Rollback Plan

```
# Revert the specific commit
git revert <commit-hash>

# Verify build
pnpm run typecheck && pnpm run build && pnpm run lint

# Verify chunk returns to 930.88 kB
# Compare screenshot with pre-split baseline
# Verify no console errors
```
