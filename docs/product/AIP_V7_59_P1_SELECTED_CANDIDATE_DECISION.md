# AIP v7.59-P1 Selected Candidate Decision

**Phase:** v7.59-P1
**Status:** DECISION FILED

---

## 1. Selected Candidate

**GovernanceCenter component-level section split** is selected as the first implementation candidate for future pilot planning.

| Field | Value |
|---|---|
| Candidate | GovernanceCenter component-level section split |
| Score | 86/100 |
| P2 action | Create detailed pilot plan (no-code) |
| Implementation in P1/P2 | NO |
| ManualChunks preference | Remains lower preference |

---

## 2. Why This Candidate

| Reason | Detail |
|---|---|
| Highest readiness evidence | P1 inventory, source map, dependency tree all exist |
| Lowest safety risk | All 142 sub-components are readonly — no mutation state |
| High user-visible value | Reduces chunk warning from 930.88 kB |
| No build config change | Dynamic imports at source level only |
| Clear rollback | Revert the commit |

---

## 3. Future Pilot Constraints

The future pilot must:
- Start with a **small, low-risk section split** (single section of ~10-15 components)
- Have pre-change baseline captured
- Have visual QA plan before implementation
- Have rollback command documented
- Not change route behavior
- Not expose hidden previews or expand sidebar
- Not enable Stage C or toggle feature flag
- Not couple with release/restore authorization

---

## 4. Deferred Candidates

| Candidate | Deferral Reason | Re-evaluation Trigger |
|---|---|---|
| Sidebar touch/pointer resizer | Lower score (72). After GovernanceCenter plan is clearer | After P2 pilot plan is filed |
| Mobile viewport QA | UI not running | When UI is running |
| Others | Low priority or blocked | Per roadmap |
