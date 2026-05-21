# AIP v7.60-D1 Candidate Comparison Decision

**Phase:** v7.60-D1
**Status:** DECISION DRAFTED

---

## Candidate Comparison

| Dimension | Candidate A: GC Lazy Load | Candidate B: Sidebar Pointer |
|---|---|---|
| **Expected benefit** | 10-30 kB bundle reduction | Touch/pointer resize UX for tablet users |
| **Risk** | Moderate (dynamic import may affect render timing) | Low-to-moderate (mouse + pointer coexistence) |
| **Source impact** | GovernanceCenter.tsx (plus possibly import file) | Layout.tsx (~8 lines additive) |
| **Source files** | `apps/web-ui/src/pages/GovernanceCenter.tsx` | `apps/web-ui/src/components/Layout.tsx` |
| **Visual QA** | GovernanceCenter route renders correctly | Desktop mouse + tablet touch + mobile overlay |
| **Rollback** | `git revert` | `git revert` |
| **Build impact** | Measurable chunk size change | No build-size change (handler code is tiny) |
| **User-visible value** | Low (behind-the-scenes perf improvement) | Medium (tablet users gain resize capability) |
| **Validation difficulty** | Low (typecheck + build pass/fail) | Low (typecheck + build + manual QA) |
| **Rollback simplicity** | High (single commit revert) | High (single commit revert) |
| **Release/restore independence** | Fully independent | Fully independent |
| **Ability to prove success** | Build output shows reduced chunk | Manual QA shows touch resize works |

---

## Decision Criteria

| Criterion | Weight | Winner |
|---|---|---|
| Smallest source change | High | B (8 lines vs import change) |
| Highest visible UX value | High | B (touch support) |
| Lowest risk | Medium | B (additive handlers, no removal) |
| Easiest to validate | Medium | Tie (both straightforward) |
| Fastest rollback | Medium | Tie (both single revert) |

---

## Recommended Decision

| Field | Value |
|---|---|
| **Selected first implementation slice** | **Candidate B — Sidebar pointer-event resizer** |
| Rationale | Smallest source change (~8 lines additive), highest visible UX value for tablet users, clearest rollback, fully release-independent |
| Alternative | Candidate A is deferred to second slice (v7.60-P3 or later) |
