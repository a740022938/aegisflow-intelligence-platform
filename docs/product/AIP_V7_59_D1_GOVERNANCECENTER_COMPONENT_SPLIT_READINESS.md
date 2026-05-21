# AIP v7.59-D1 GovernanceCenter Component Split Readiness

**Phase:** v7.59-D1
**Status:** READINESS PLAN — no implementation

---

## 1. Current State

| Aspect | Status |
|---|---|
| Route-level lazy loading | ✅ Already in place (`React.lazy()` in App.tsx:39) |
| Component-level lazy loading | ❌ Not present |
| `manualChunks` | ❌ Not configured |
| Chunk size | 930.88 kB (68.67 kB gzip) |
| Sub-components | ~142 eagerly imported, all first-party, all readonly |
| Third-party bloat | None identified |

---

## 2. Why Component Splitting Is Preferred

Component-level dynamic imports (lazy loading sections of panels) is the preferred path because:

| Reason | Detail |
|---|---|
| No build config change | Dynamic imports are a source-level change, not a build config change |
| Incremental | Can split one section at a time |
| Low risk | All 142 sub-components are readonly design-spec panels — no mutation state |
| Clear rollback | Revert the specific commit |
| No cross-route impact | Governance sub-components are not shared with other routes |

---

## 3. Why ManualChunks Is Lower Preference

| Reason | Detail |
|---|---|
| Build config change | Affects all routes, not just GovernanceCenter |
| Dependency analysis required | Must confirm governance components are not shared |
| Code duplication risk | If components are imported elsewhere |
| Caching regression | Split chunks change hash more frequently |

---

## 4. Missing Evidence Before Implementation

| Evidence | Status | Required for |
|---|---|---|
| Bundle analysis output | ❌ Not installed | Measuring exact section sizes |
| Section size estimates | ⏸ Estimated (~200 kB per section) | Choosing first target |
| Visual QA baseline screenshots | ❌ Not captured (UI not running) | Before/after comparison |
| Rollback plan (documented) | ⏸ Draft exists | Safety net |

---

## 5. Choosing First Low-Risk Split Target

Recommended approach: start with the **smallest section** (fewest components) to validate the pattern:

1. **Registry lazy loading** (lowest risk) — lazy-load `GOVERNANCE_REGISTRY` and validator
2. **Single gate section** — pick one Gate Design section with ~10-15 components
3. **Measure** chunk size reduction, console errors, render behavior
4. **Scale** to remaining sections if successful

---

## 6. Pre-Change Baseline Requirements

- [ ] Build warning text and chunk size captured
- [ ] Console errors (if any) recorded
- [ ] Screenshot of full GovernanceCenter page captured
- [ ] Network waterfall showing current chunk load behavior
- [ ] Current localStorage keys and values documented

---

## 7. Post-Change Validation Requirements

- [ ] `pnpm run typecheck` PASS
- [ ] `pnpm run build` PASS (new chunk size recorded)
- [ ] `pnpm run lint` PASS
- [ ] `git diff --check` PASS
- [ ] Screenshot comparison (no visual regression)
- [ ] Console errors: NONE
- [ ] Network waterfall: correct chunk load order

---

## 8. Visual QA Requirements

| Check | Pre-split | Post-split |
|---|---|---|
| Full page screenshot | ✅ Capture | ✅ Compare |
| Loading states | N/A (all eager) | ✅ Verify Suspense fallback |
| Panel order | ✅ Document | ✅ Verify unchanged |
| Empty/error states | ✅ Document | ✅ Verify unchanged |

---

## 9. Rollback Plan

```
git revert <commit-hash>
pnpm run typecheck && pnpm run build && pnpm run lint
# Verify chunk returns to 930.88 kB
# Compare screenshot with pre-split baseline
# Verify no console errors
```

---

## 10. No-Go Conditions

| Condition | Severity |
|---|---|
| Bundle analysis tooling not installed | HARD NO-GO |
| Visual QA baseline not captured | HARD NO-GO |
| Rollback plan not documented | HARD NO-GO |
| New build warnings or errors | HARD NO-GO |
| Console errors after change | HARD NO-GO |
| Tests fail | HARD NO-GO |
| Change not reviewed by second person | HARD NO-GO |
| Stage C enabled or release scheduled same phase | HARD NO-GO |
