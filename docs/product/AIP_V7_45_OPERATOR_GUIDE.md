# AIP v7.45 — Operator Guide

**Status:** P1 Final
**Date:** 2026-05-20
**Baseline:** AIP v7.44 Final Seal

---

## 1. Project Location

```
E:\AIP
```

## 2. First Commands

```powershell
PS C:\Users\74002> Set-Location E:\AIP
PS E:\AIP> aip
PS E:\AIP> aip where
PS E:\AIP> aip safe-status
```

## 3. Safety Status

Run `aip safe-status` to check:
- Stage C is disabled
- Feature flag is off
- All runtime boundaries are blocked

## 4. Web Console

Open in browser (hidden direct routes):

```
/operator-runtime-readiness-console-preview
/stage-c-authorization-review-pack-preview
/operator-end-to-end-flow-preview
/operator-usability-drill-preview
/restore-point-pack-preview
/aip-memory-knowledge-preview
```

## 5. Repair (Plan-Only)

```powershell
aip repair
aip repair check
aip repair plan
aip repair command-pack
aip repair restore-point
```

All repair commands are plan-only. No file modification.

## 6. Receipt

```powershell
aip receipt template
```

## 7. Forbidden Operations

- Do NOT enable Stage C
- Do NOT toggle feature flag
- Do NOT write to database
- Do NOT execute runtime
- Do NOT control external tools
- Do NOT execute connector actions
- Do NOT execute full repair or source restore
- Do NOT restart services without authorization
- Do NOT create tags or releases without authorization

## 8. Reports and Receipts

- Reports: `E:\_AIP_REPORTS\`
- Receipts: `E:\_AIP_RECEIPTS\`
