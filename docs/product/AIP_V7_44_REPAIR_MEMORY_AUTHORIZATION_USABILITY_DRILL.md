# AIP v7.44 — Repair / Memory / Authorization Usability Drill

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** AIP v7.43 Final Seal

---

## 1. Purpose

Define a readonly usability drill that exercises repair plan-only, memory baseline, and Stage C authorization review capabilities. The drill is documentation-only — no real repair, memory mutation, or authorization is performed.

## 2. Drill Scenarios

### Scenario 1: Repair Plan
**User action:** Suspects command pack is corrupted
**Drill:** `aip repair plan` generates a JSON+MD report
**Expected result:** Plan is generated without modifying any files
**Console equivalent:** Repair Plan-only Status section

### Scenario 2: Memory Baseline
**User action:** Forgets current progress
**Drill:** Open Memory Baseline Status section
**Expected result:** Current baseline, v7.25–v7.40 sequence, pre-v7.25 confidence shown
**Console equivalent:** Memory Baseline Status section

### Scenario 3: Stage C Authorization
**User action:** Wants to enable Stage C
**Drill:** Open Authorization Review Pack
**Expected result:** 12 authorization requirements shown, all unsatisfied. Fake auth detection rules displayed.
**Console equivalent:** Stage C Authorization Review Pack Preview

### Scenario 4: Next Step
**User action:** Wants to continue building
**Drill:** Open Operator Decision Workflow
**Expected result:** 10 checks evaluated, recommendation shown (BLOCKED_NEEDS_AUTHORIZATION for Stage C)
**Console equivalent:** Decision Workflow registry

### Scenario 5: Receipt
**User action:** Needs to document phase completion
**Drill:** Use receipt template
**Expected result:** Standard receipt format with phase, HEAD, files, validation, safety, verdict
**Console equivalent:** Receipt template doc

## 3. Safety Constraints

- All scenarios are readonly
- No repair execution, no memory write, no authorization acceptance
- All drills can be completed without modifying state
- Stage C remains disabled throughout

## 4. Delivery

- `apps/web-ui/src/pages/OperatorUsabilityDrillPreview.tsx` (P3)
- `apps/web-ui/src/registry/operator-usability-drill-registry.ts` (P3)
- `apps/web-ui/src/registry/operator-usability-drill-validator.ts` (P3)
