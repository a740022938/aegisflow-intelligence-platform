# Governance Console Decision Panel Preview

> **Version:** v7.29.0-P3
> **Status:** COMPLETED — Readonly Preview
> **Route:** `/governance-console-decision-panel-preview`
> **Hidden Direct:** Yes (not in sidebar)

## Overview

The Decision Panel Preview displays 14 decision items across 8 decision types. It provides a readonly view of recommended actions, blocked decisions, and future-stage-C-only decisions.

## Registry

**File:** `governance-console-decision-registry.ts` (14 items)

### Decision Types (8)
continue_preview, run_final_seal_recheck, hold_for_human_review, generate_report_preview, blocked, future_stage_c_only, documentation_polish, readiness_audit

## Validator

**File:** `governance-console-decision-validator.ts`
- Blocking: 0
- Warning: 0
- Info: 1
- Pass: ✓

Checks performed: executesAction allowedNow, mutatesRegistry allowedNow, writesDb allowedNow, controlsExternalTool allowedNow, requiresStageC allowedNow, risk=critical allowedNow, blocked/future_stage_c_only must have gates and blockedActions, decisionRationale/reason/nextAction must not be empty.

## Preview Page

**File:** `GovernanceConsoleDecisionPanelPreview.tsx`
**Sections:** 8 covering decision types, risk distribution, recommended actions, blocked decisions, and decision details.

## Route

`/governance-console-decision-panel-preview` — hidden direct, not in sidebar, not in Layout.tsx.

## Safety

- Readonly: ✓
- No decision execution: ✓
- No approve/reject: ✓
- No DB write: ✓
- No external control: ✓
- Stage C disabled: ✓

## Part Of

v7.29.0-P2/P3/P4 Governance Console Acceleration Pack
