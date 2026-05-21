# AIP v7.58-P2 ManualChunks Risk Plan

**Phase:** v7.58-P2
**Status:** PLAN ONLY — no build config changes

---

## 1. What ManualChunks Can Do

`manualChunks` in Vite's Rollup config can split the GovernanceCenter chunk into smaller pieces by grouping specific imports into named chunks. For example:

```ts
// vite.config.ts
build.rollupOptions.output.manualChunks(id => {
  if (id.includes('components/governance/')) return 'governance-vendor';
})
```

This would move all governance sub-components into a separate chunk, reducing GovernanceCenter from 930.88 kB to perhaps ~200 kB.

---

## 2. Risks

| Risk | Impact |
|---|---|
| **Code duplication** | If governance sub-components are imported elsewhere, the code may appear in both the split chunk and the main chunk |
| **Load order** | If chunks have implicit dependencies, incorrect load order can break page rendering |
| **Caching regression** | Split chunks change hash more frequently, reducing cache effectiveness |
| **Build config fragility** | Changes to Vite config affect all routes, not just GovernanceCenter |
| **False sense of improvement** | Splitting doesn't reduce total bytes downloaded — it only moves code between chunks |

---

## 3. Dependency Grouping Risks

| Group | Risk | Assessment |
|---|---|---|
| `../components/governance/*` | Low-Medium | Only imported by GovernanceCenter — safe to split |
| `../registry/governance-registry` | Low | Only used by GovernanceCenter and its sub-components |
| Shared UI (PageShell, SectionCard) | Already in separate chunks | No action needed |

---

## 4. Shared Chunk Risks

| Concern | Detail |
|---|---|
| Is governance-registry shared? | No — only GovernanceCenter uses it |
| Are governance sub-components shared? | No — only GovernanceCenter imports them |
| Could they be shared in future? | Possibly by GovernanceConsolePreview — would then cause duplication |

---

## 5. Vendor Chunk Risks

| Vendor | Current handling |
|---|---|
| React / ReactDOM | Already in `react-vendor` chunk |
| UI library (Mantine etc.) | Already in `ui-vendor` chunk |
| Charts (recharts etc.) | Already in `chart-vendor` chunk |
| GovernanceCenter-specific | No vendor code — all first-party |

No additional vendor chunk candidates identified.

---

## 6. Test Requirements Before ManualChunks

- [ ] Dependency tree analysis confirming governance components are NOT shared with other routes
- [ ] Build output verification — no new warnings or errors
- [ ] Visual QA (before/after screenshots)
- [ ] Network waterfall verification — correct chunk load order
- [ ] Rollback plan defined
- [ ] Second-person review

---

## 7. Criteria for NOT Using ManualChunks

| Criterion | Decision |
|---|---|
| Governance components are shared with other routes | Do NOT use manualChunks — causes duplication |
| Build produces new warnings | Do NOT use — fix or revert |
| Visual QA shows layout shift | Do NOT use — fix or revert |
| Chunk load order is wrong | Do NOT use — fix or revert |
| Rollback plan not defined | Do NOT use — not safe |

---

## 8. Recommendation

**Prefer component-level section split over manualChunks.**

Component-level splitting:
- Does not require build config changes
- Has a clear rollback path (revert commit)
- Can be done incrementally
- Does not affect other routes

manualChunks should only be considered after:
1. Component-level splitting is proven insufficient
2. Full dependency impact analysis is completed
3. Build config change is reviewed by a second person
