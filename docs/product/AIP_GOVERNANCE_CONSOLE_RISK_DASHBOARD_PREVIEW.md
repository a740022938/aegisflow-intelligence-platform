# Governance Console Risk Dashboard Preview

> **Version:** v7.29.0-P2
> **Status:** COMPLETED — Readonly Preview
> **Route:** `/governance-console-risk-dashboard-preview`
> **Hidden Direct:** Yes (not in sidebar)

## Overview

The Risk Dashboard Preview aggregates risks from 13 sources across the governance chain. It provides a unified view of all risk categories, severities, and gating requirements.

## Registry

**File:** `governance-console-risk-registry.ts` (20 items)

### Risk Sources (13)
permission_evaluator, runtime_registry, dry_run_plan, audit_log, governance_state, human_approval, evidence_schema, rollback, navigation, center_access, stage_c, database, external_control

### Risk Categories (10)
blocked_action, stage_c_gate, db_write_gate, external_control_gate, human_approval_gate, evidence_required, rollback_required, sidebar_exposure, secret_handling, execution_capability

## Validator

**File:** `governance-console-risk-validator.ts`
- Blocking: 0
- Warning: 0
- Info: 1
- Pass: ✓

Checks performed: critical severity allowedNow, requiresStageC allowedNow, requiresDbWrite allowedNow, requiresExternalControl allowedNow, execution_capability category check, blocked IDs must be blocked=true, high/critical severity must have gates and blockedActions, reason/nextAction must not be empty.

## Preview Page

**File:** `GovernanceConsoleRiskDashboardPreview.tsx`
**Sections:** 12 (A-L) covering overview, risk sources, categories, severity distribution, gating analysis, and aggregate risk totals.

## Route

`/governance-console-risk-dashboard-preview` — hidden direct, not in sidebar, not in Layout.tsx.

## Safety

- Readonly: ✓
- No risk execution: ✓
- No gate control: ✓
- No DB write: ✓
- No external control: ✓
- Stage C disabled: ✓

## Part Of

v7.29.0-P2/P3/P4 Governance Console Acceleration Pack
