# AIP v7.43 — UI Polish Guide

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** AIP v7.42 Final Seal

---

## 1. Goals

- Improve information hierarchy in the Operator Readiness Console
- Make safety status immediately visible
- Surface Stage C gate status at a glance
- Do **not** add any action buttons that trigger runtime behavior

## 2. Recommended Read-Only Sections

1. Current Seal Baseline
2. Safety Snapshot
3. Stage C Gate Status
4. Command Center Links
5. Repair Plan-only Status
6. Memory Baseline Status
7. Smoke Evidence Summary
8. No-go Matrix Summary
9. Operator Next Step
10. Forbidden Actions Strip

## 3. Allowed Button Labels

- "View details"
- "Copy command"
- "Open preview"
- "Generate plan"
- "Read policy"

All buttons must be readonly or clipboard-only. No runtime execution.

## 4. Forbidden UI Elements

- Enable Stage C button
- Toggle feature flag button
- Execute repair button
- Run external tool button
- DB write button
- Connector action button
- Kill switch execute button

## 5. Scope

Primary target files:

- `apps/web-ui/src/pages/*Operator*Console*.tsx`
- `apps/web-ui/src/pages/*Runtime*Readiness*.tsx`
- `apps/web-ui/src/registry/*operator*registry*.ts`
- `apps/web-ui/src/registry/*readiness*registry*.ts`
