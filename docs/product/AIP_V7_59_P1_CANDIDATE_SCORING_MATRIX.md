# AIP v7.59-P1 Candidate Scoring Matrix

**Phase:** v7.59-P1
**Status:** COMPLETED

---

## Scoring Dimensions (each 1-10)

| Dimension | Weight |
|---|---|
| Expected benefit | 2x |
| Implementation risk | 2x (inverted: lower risk = higher score) |
| Rollback simplicity | 1x |
| Visual QA complexity | 1x (inverted) |
| Source code complexity | 1x (inverted) |
| Safety risk | 2x (inverted) |
| User-visible value | 2x |
| Readiness evidence quality | 1x |

---

## Scoring Results

| Candidate | Benefit (x2) | Low Risk (x2) | Rollback (x1) | QA Simp (x1) | Code Simp (x1) | Safety (x2) | User Val (x2) | Evidence (x1) | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| **1. GovernanceCenter split** | 8→16 | 7→14 | 9 | 6 | 7 | 9→18 | 8→16 | 6 | **86** |
| 2. Sidebar touch resizer | 6→12 | 8→16 | 10 | 7 | 8 | 8→16 | 6→12 | 5 | **72** |
| 3. Mobile viewport QA | 5→10 | 5→10 | 10 | 7 | 10 | 10→20 | 5→10 | 6 | **61** |
| 4. Task-pack archive polish | 4→8 | 9→18 | 10 | 9 | 10 | 10→20 | 3→6 | 5 | **54** |
| 5. Non-adapter triage | 6→12 | 4→8 | 7 | 5 | 5 | 6→12 | 7→14 | 4 | **48** |
| 6. Bundle-budget policy | 4→8 | 6→12 | 10 | 9 | 9 | 9→18 | 3→6 | 3 | **40** |
| 7. GovernanceHub re-eval | 3→6 | 7→14 | 10 | 10 | 10 | 7→14 | 2→4 | 3 | **32** |

---

## Scoring Rationale

### 1. GovernanceCenter split (86) — SELECTED
- High benefit: reduces 930.88 kB chunk warning
- Low risk: all sub-components are readonly
- Moderate evidence quality: P1 collected dependency inventory but no bundle analysis tooling

### 2. Sidebar touch resizer (72) — DEFERRED
- Low risk: adding pointer events is straightforward
- User value moderate: only impacts tablet users who want to resize sidebar
- Deferred until after GovernanceCenter plan is established

### 3-7. Remaining candidates (32-61) — DEFERRED
- Mobile viewport QA blocked on UI not running
- Non-adapter triage blocked on adapter re-evaluation
- Others low priority or blocked
