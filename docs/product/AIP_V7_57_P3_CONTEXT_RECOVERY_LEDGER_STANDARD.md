# AIP v7.57-P3 Context Recovery Ledger Standard

**Date:** 2026-05-21
**Phase:** P3
**Status:** Standard — applies to all work ledger snapshots

---

## 1. Required Ledger Fields

Every work ledger snapshot must include:

| Field | Required | Example |
|---|---|---|
| Latest completed phase | ✅ | v7.57-P2 Build Warning Evidence Review |
| Latest confirmed commit | ✅ | ff1b06c |
| Latest verdict | ✅ | V7_57_P2_BUILD_WARNING_EVIDENCE_REVIEW_READY_NON_BLOCKING |
| Release decision | ✅ | HOLD / NO-GO (until human release authorization filed) |
| Restore decision | ✅ | HOLD / NO-GO (until restore execution authorization filed) |
| Stage C state | ✅ | DISABLED |
| Feature flag state | ✅ | OFF |
| Last validation status | ✅ | typecheck PASS, build PASS, lint PASS, tests deferred |
| Open blockers | ✅ | G1 (release auth), R1 (restore auth) |
| Next recommended task | ✅ | v7.57-P3 Hold-Mode Docs Polish |
| Forbidden actions reminder | ✅ | No tag, release, restore, Stage C, feature flag |
| Desktop archive rule | ✅ | Every task pack includes Phase -1 |

---

## 2. When to Generate a Ledger

| Trigger | Action |
|---|---|
| After every D-phase (decision/planning) | ✅ Generate new ledger |
| After every seal or recheck (P5) | ✅ Generate new ledger |
| After any release/restore decision change | ✅ Generate new ledger |
| When ChatGPT context gets long | ✅ Generate new ledger to reset context |
| When user asks "what have we done?" | ✅ Provide latest ledger or regenerate |
| Before starting a new major phase | ✅ Reference latest ledger to confirm state |

---

## 3. Ledger Format

Ledgers should be concise (15–25 lines) and follow this structure:

```
AIP / OpenAIP Current Work Ledger after <PHASE>

Latest confirmed state:
- Latest completed phase: <phase>
- Latest confirmed commit: <hash>
- Latest verdict: <verdict>
- Release decision: <decision>
- Restore decision: <decision>
- Stage C: <state>
- Feature flag: <state>
- Validation: <summary>

Current recommended next step:
<next phase>
```

---

## 4. Ledger Location

| Location | Purpose |
|---|---|
| Conversation (user-facing) | Current session reference |
| `E:\_AIP_RECEIPTS\` | Persistent external archive |
| `docs/product/` | Only if ledger is a formal phase deliverable |
