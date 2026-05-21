# AIP v7.58-P2 GovernanceCenter Optimization Plan / No-Code Decision

**Phase:** v7.58-P2
**Status:** PLAN ONLY — no implementation

---

## 1. Current Evidence Summary

| Field | Value |
|---|---|
| Chunk | GovernanceCenter-Dl3qqZfx.js |
| Size | 930.88 kB (68.67 kB gzip) |
| Threshold | 500 kB |
| Classification | NON_BLOCKING_PRE_EXISTING + NEEDS_FUTURE_OPTIMIZATION |
| Route-level lazy loading | ✅ Already in place (React.lazy) |
| Component-level lazy loading | ❌ Not present |
| Sub-components | ~142 eagerly imported, all first-party |
| Third-party bloat | None identified |
| Build exit code | 0 |
| Warning stable since | v7.55-P5 |

---

## 2. Why Route-Level Lazy Loading Is Already Not Enough

The route is already lazy-loaded via `React.lazy()` in App.tsx:39. However, the chunk still reaches 930.88 kB because all 142 governance sub-components are **statically imported** at the top of `GovernanceCenter.tsx`. Vite bundles them into a single chunk because there is no further dynamic boundary within the component.

To reduce the chunk size, a **secondary splitting boundary** is needed:
- Component-level dynamic imports (lazy-loading groups of sub-components)
- Or `manualChunks` config to split governance components into a separate chunk

---

## 3. Component-Level Splitting Options

| Option | Description | Effort | Risk |
|---|---|---|---|
| Section-level lazy loading | Split the page into ~6 logical sections (Gate Design, Stage Coverage, Implementation Review, etc.) and lazy-load each | Medium | Low-Medium |
| Individual panel lazy loading | Lazy-load each of the ~142 sub-components individually | High | Low (all readonly) |
| Registry lazy loading | Lazy-load `GOVERNANCE_REGISTRY` and validator | Low | Low |

**Preferred:** Section-level lazy loading (groups of related panels).

---

## 4. ManualChunks Options

| Option | Description | Risk |
|---|---|---|
| `manualChunks` governance group | Move all `../components/governance/*` imports into a separate chunk | Medium — requires build config change |
| `manualChunks` vendor group | Separating React/vendor is already done. No additional vendor candidates identified | Low — but won't help |

**Risk:** manualChunks can cause:
- Duplicate code if overlapping dependencies exist
- Incorrect load order if chunks reference each other
- Caching regression (chunk hash changes more frequently)

---

## 5. Why P2 Does Not Implement Changes

P2 is a planning and decision phase. Per the v7.58 roadmap:
- P1: Evidence inventory (completed)
- P2: Optimization plan / no-code decision (this phase)
- Implementation requires a future task with full QA and rollback plan

No source code or build config changes are made in P2.

---

## 6. Future Preconditions for Implementation

Before any optimization implementation:

- [ ] Candidate split target is identified and documented
- [ ] Visual QA baseline screenshots are captured
- [ ] Visual QA plan exists (before/after comparison)
- [ ] Rollback command/plan exists
- [ ] Build baseline (current chunk size, warning text) is captured
- [ ] No hidden preview/sidebar routes are exposed
- [ ] No Stage C enablement or feature flag toggle in same phase
- [ ] No release or restore authorization in same phase

---

## 7. Visual QA Requirements

| Step | Requirement |
|---|---|
| Screenshot before | Full page render of GovernanceCenter |
| Screenshot after | Full page render after change |
| Loading state | Verify Suspense fallback renders correctly |
| Empty state | Verify no content is missing |
| Error state | Verify error boundaries work |
| Console | No new errors |
| Network waterfall | Verify chunk loading order is correct |

---

## 8. Rollback Plan

```
git revert <commit-hash>
pnpm run typecheck
pnpm run build
pnpm run lint
pnpm test
# Verify chunk returns to 930.88 kB
# Verify visual QA matches baseline
```

---

## 9. No-Go Conditions

| Condition | Severity |
|---|---|
| Rollback plan not defined | HARD NO-GO |
| Visual QA baseline not captured | HARD NO-GO |
| New build warnings or errors | HARD NO-GO |
| Console errors after change | HARD NO-GO |
| Tests fail | HARD NO-GO |
| Change not reviewed by second person | HARD NO-GO |
| Stage C enabled or release scheduled same phase | HARD NO-GO |
| Hidden preview or sidebar exposed | HARD NO-GO |

---

## 10. Recommendation

**P2 Decision: NO-CODE PLAN ONLY.**

Do not implement optimization yet. The warning is non-blocking, stable, and carries no security or runtime risk.

- If a low-risk split target is identified in future evidence: proceed to component-level section split plan
- If no low-risk target: adjust `chunkSizeWarningLimit` to suppress the warning
- Do not use `manualChunks` without further dependency analysis
- The 142 sub-components are read-only and safe to split, but the async overhead of 142 individual lazy imports may not be worth the complexity

**Recommended future path:** Section-level lazy loading (group panels into ~6 sections) after installation of bundle analysis tooling and capture of visual QA baseline.
