# AIP v7.61-P6 Future Component Split Strategy

**Status:** RECOMMENDATIONS

---

## Options

| Option | Description | Risk | Effort |
|---|---|---|---|
| **A. Stop GovernanceCenter lazy-load track** | Accept the current state; move to other priorities | None | None |
| **B. Broader component split** | Split GovernanceCenter sub-components into separate lazy chunks via route-based splitting | Medium | High |
| **C. Registry async-state refactor** | Lazy-load registry with loading state/skeleton UI | Medium | Medium |
| **D. manualChunks** | Add Rollup manualChunks after separate evidence | Low | Low |
| **E. Accept warning** | 930 kB is large but not critical; move to release-readiness | None | None |

## Recommendation

**Option A + E** — Close the lazy-load track. The GovernanceCenter warning (930 kB > 500 kB) is non-blocking and acceptable. Move focus to release-readiness or final product hardening.

If future optimization is needed, **Option B** (broader component split including `GovernanceCenterOverview`) is the correct approach — it would require planning a new component architecture and is outside the scope of this narrow optimization pack.
