# AIP v7.60-D1 First Implementation Slice Decision

**Phase:** v7.60-D1
**Status:** DECISION DRAFTED — no implementation authorized

---

## Decision Options

| Option | Description | Recommended? |
|---|---|---|
| **A** | Future P1 = Sidebar pointer-event resizer implementation | ⭐ **Recommended** |
| B | Future P1 = GovernanceCenter Registry+Validator lazy load implementation | Acceptable alternative |
| C | Future P1 = no implementation; more evidence first | Conservative default |

---

## Selected: Option A — Sidebar Pointer-Event Resizer (Recommended)

| Field | Value |
|---|---|
| Rationale | Smallest source change (~8 lines additive, no removal). Highest visible UX value (tablet touch resize). Clearest rollback. Fully release-independent. |
| Risk | Low-to-moderate |
| Pre-condition | Implementation authorization form must be filed before P1 |
| Authorization filed in D1 | ❌ NO |
| Code changes in D1 | ❌ NO |

---

## Option B — GovernanceCenter Lazy Load (Alternative)

| Field | Value |
|---|---|
| When to switch | If user prioritizes bundle performance evidence over UX improvement |
| Risk | Moderate |
| Deferred to | v7.60-P3 or later |

---

## Option C — No Implementation (Conservative Default)

| Field | Value |
|---|---|
| Risk | None |
| Cost | No progress on either candidate |
| Only recommended if | User wants to halt acceleration |

---

## Implementation Authorization Gate

Before any future P1 code change:
1. Implementation authorization form must be filled, signed, and filed
2. Form must specify exact target files
3. Form must bind the implementation to the selected slice
4. Any change outside approved scope invalidates authorization
