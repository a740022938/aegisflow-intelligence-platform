# AIP v7.44 — Acceptance Criteria (Blueprint)

**Status:** Blueprint / D1 (finalized in P4)
**Date:** 2026-05-20
**Baseline:** AIP v7.43 Final Seal

---

## 1. Purpose

Define the acceptance criteria for v7.44 integration seal. These criteria ensure that all capabilities connect correctly and safely.

## 2. Acceptance Criteria

### A1: CLI to Console Connection
- All CLI commands listed in the experience spec produce expected output
- Console maps each CLI command to a corresponding section

### A2: End-to-End Flow
- The flow preview page shows all 9 recommended sections
- Each section links to the relevant CLI command or console page

### A3: Usability Drill
- All 5 drill scenarios produce expected results
- No scenario requires mutation or authorization

### A4: Safety Boundaries
- Stage C: disabled
- Feature flag: off
- POST: blocked (404)
- DB write: blocked
- Executor: absent
- External control: blocked
- Connector action: blocked
- Repair: plan-only
- Memory: readonly
- Authorization: preview-only

### A5: Code Quality
- TypeScript typecheck: PASS
- Tests: PASS
- Build: PASS
- Git diff check: clean

### A6: Route Safety
- All preview routes: hidden_direct
- Not in sidebar: confirmed
- No sidebar exposure: confirmed

## 3. Verification

Each criterion is verified during P4 (evidence matrix) and P5 (final seal recheck).
