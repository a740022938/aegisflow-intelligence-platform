# AIP v7.61-P4 Open Limitations and Follow-Up

**Status:** DOCUMENTED

---

## Open Limitations

| # | Limitation | Impact | Suggested Follow-Up |
|---|---|---|---|
| 1 | `GovernanceCenterOverview.tsx` still statically imports validator | Prevents validator chunk split | Future: also convert GovernanceCenterOverview to dynamic import |
| 2 | `AdvancedModeReadonly.tsx` still statically imports validator | Prevents validator from being fully removed from other chunks | Low priority (separate page) |
| 3 | Registry lazy-load deferred | Registry remains in GovernanceCenter chunk | Requires async state plan (see Registry Strategy Decision) |
| 4 | GovernanceCenter chunk remains >900 kB | Build warning persists | Requires broader component-split strategy |
| 5 | No browser-level visual QA | Cannot verify UI behavior post-change | Requires headless browser or manual QA |
| 6 | No test execution | Cannot verify functional correctness | Requires authorized test runner |

## Recommended Next Steps

1. Close P2/P3/P4 with LOW_IMPACT / NO_EFFECT verdict
2. If chunk reduction is desired: plan a broader GovernanceCenter component-split (e.g., split the validator/registry sub-components into their own lazy chunks)
3. If stability is the goal: close the lazy-load track and focus on other optimization areas
