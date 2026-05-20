# AIP v7.44 — Roadmap

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** v7.43 Final Seal (`a1a91a8`)

---

## Phase Sequence

```text
v7.44-D1: Integration Seal Blueprint                              ← you are here
v7.44-P1: End-to-End Operator Flow Preview
v7.44-P2: CLI-to-Console Command Experience Pack
v7.44-P3: Repair / Memory / Authorization Usability Drill
v7.44-P4: Integration Evidence Matrix + Acceptance Pack
v7.44-P5: Final Seal Recheck
```

## Safety Throughout

```text
Stage C:       DISABLED
Feature flag:  OFF
POST runtime:  BLOCKED
DB write:      NOT PERMITTED
Repair:        plan-only
Memory:        readonly
Authorization: preview-only
All mutations: NOT PERMITTED
```

## Delivery

7 blueprint docs (D1) → E2E flow preview (P1) → CLI-to-console pack (P2) → Usability drill (P3) → Evidence matrix (P4) → Final seal (P5).

## Complete Operator Flow (v7.44 target)

```
aip → aip where → aip safe-status
  → Operator Runtime Readiness Console
  → Command / Repair / Memory Bridges
  → Stage C Authorization Review Pack
  → Operator Decision Workflow
  → Receipt Template
  → Final Seal
```

## After v7.44

v7.44 delivers an integration seal across all v7.41–v7.44 capabilities. The codebase is in a state where an operator can:
- Start from CLI and navigate to Web Console
- Understand safety state at a glance
- Review repair plans without executing them
- Reference memory baselines
- Preview authorization requirements
- Get decision recommendations
- Generate receipts

Stage C remains disabled pending explicit human authorization through the Authorization Review Pack process.
