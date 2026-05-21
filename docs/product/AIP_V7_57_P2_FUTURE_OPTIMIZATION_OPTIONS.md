# AIP v7.57-P2 Future Optimization Options

**Date:** 2026-05-21
**Phase:** P2
**Status:** Options only — no implementation

---

## 1. Options

| # | Option | Risk | Complexity | Source Change? | Build Config Change? | Recommended Phase |
|---|---|---|---|---|---|---|
| 1 | Review dependency and route-level bundle contributors with visualizer | None | Low | No | No (plan-only) | P2+ or P3 |
| 2 | Add route-level code-splitting for GovernanceCenter sub-pages | Low | Medium | Yes | No | Future authorized UI task |
| 3 | Use dynamic imports for low-risk preview/info components | Low | Low | Yes | No | Future authorized UI task |
| 4 | Consider Rollup `manualChunks` to split GovernanceCenter | Low | Medium | No | Yes | Future after evidence review |
| 5 | Track bundle budget and regression criteria | None | Low | No | Yes (config only) | Future |
| 6 | Increase `chunkSizeWarningLimit` to suppress warning | None | Low | No | Yes (config only) | Fallback if no optimization desired |

---

## 2. Prohibited Approaches (Without Authorization)

| Approach | Why Prohibited |
|---|---|
| Splitting WorkflowComposer | NO_GO per adapter rulebook |
| Splitting GovernanceHub | NO_GO per adapter rulebook |
| Any source change without separate task | Source code not authorized in P2 |
| Any build config change without separate review | Build config not authorized in P2 |

---

## 3. Recommended Path

1. **Short term:** Accept warning as-is. Track in backlog.
2. **Medium term:** Run `vite-bundle-visualizer` to identify optimization candidates.
3. **Long term:** Implement code-splitting only after a separate authorized UI performance task, avoiding NO_GO pages.

---

## 4. No-Go Conditions

| Condition | Action |
|---|---|
| Warning becomes a build error | Escalate to BLOCKING status |
| GovernanceCenter user impact reported | Prioritize optimization |
| Release authorization filed | Document warning in release notes; do not block |
