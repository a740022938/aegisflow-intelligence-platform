# Governance Console Risk Aggregation Spec

> **v7.29.0-D1** · Design Specification · Not Implemented  
> **Core Tenet:** Read-only risk aggregation. No risk modification.

---

## 1. Risk Sources

The Governance Console aggregates risk from:

| Source Registry | Items | Risk Levels |
|----------------|-------|-------------|
| Permission Evaluator | N | low/medium/high/critical |
| Runtime Registry | N | low/medium/high/critical |
| Dry-run Plan | N | low/medium/high/critical |
| Audit Log | N | low/medium/high/critical |
| Governance State | 27 | low/medium/high/critical |
| Human Approval | 21 | low/medium/high/critical |
| Evidence Schema | 23 | low/medium/high/critical |
| Rollback | 22 | low/medium/high/critical |

## 2. Risk Levels

| Level | Color | Meaning |
|-------|-------|---------|
| low | Green | Readonly preview, no dangerous actions |
| medium | Yellow | Requires attention but not blocking |
| high | Orange | Blocking or potentially dangerous |
| critical | Red | Must not be allowedNow, blocked by design |

## 3. Aggregation Fields

For each registry, aggregate:
- Total item count
- `allowedNow=true` count
- `allowedNow=false` (blocked) count
- High/critical item count
- Items requiring Stage C
- Items requiring DB write
- Items requiring external control
- Items requiring human approval
- Items requiring evidence
- Items requiring rollback

## 4. Cross-Registry Aggregation

Aggregate across all registries:
- Total items across all registries
- Total allowedNow items
- Total blocked items
- Total high/critical items
- Total items requiring Stage C
- Total items requiring DB write
- Total items requiring external control
- Total items requiring human approval
- Total items requiring evidence
- Total items requiring rollback

## 5. Risk Display

Display as a table or card grid:
```
Risk Source       │ Items │ allowedNow │ Blocked │ High/Critical │ StageC │ DB │ External │ Approval │ Evidence │ Rollback
──────────────────┼───────┼────────────┼─────────┼───────────────┼────────┼────┼──────────┼──────────┼──────────┼─────────
Governance State  │ 27    │ 13         │ 14      │ 7             │ 7      │ 7  │ 5        │ 8        │ 8        │ 8
Human Approval    │ 21    │ 13         │ 8       │ 5             │ 5      │ 0  │ 0        │ 21       │ 13       │ 8
Evidence Schema   │ 23    │ 20         │ 3       │ 3             │ 0      │ 0  │ 0        │ 0        │ 0        │ 0
Rollback          │ 22    │ 13         │ 9       │ 9             │ 3      │ 2  │ 3        │ 10       │ 10       │ 10
```

## 6. Constraints

- Risk aggregation is read-only
- No registry data is modified
- No gates are triggered by aggregation
- No actions are taken based on aggregation
- Aggregation is for display and report generation only

---

## v7.29.0-P1 Governance Console Aggregator Preview

- **Status:** Established — v7.29.0-P1 complete, commit \`600a029\`
- **Route:** `/governance-console-preview` (hidden direct, not in sidebar)
- **Registry:** `governance-console-registry.ts` — 18 items across 10 domains
- **Validator:** `governance-console-validator.ts` — blocking checks enforced
- **Console does not:** mutate registries, execute actions, write DB, control external tools, enable Stage C
- **Stage C:** Remains disabled
- **Sidebar:** Governance Console Preview not in sidebar

## v7.29.0-P2 Risk Dashboard Preview (completed)

- 20 risk items, 10 categories, 13 sources
- Route: \`/governance-console-risk-dashboard-preview\` (hidden direct, not in sidebar)
- Validator: blocking=0, pass ✓
- No gate execution, no DB write, no external control
- Stage C disabled
