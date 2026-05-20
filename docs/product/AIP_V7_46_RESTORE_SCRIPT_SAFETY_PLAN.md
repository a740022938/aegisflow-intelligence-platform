# AIP v7.46 — Restore Script Safety Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P2 (alongside security gap closure)

---

## 1. Objective

Make `scripts/restore.mjs` and `scripts/rollback_pre_seal_repair.cmd` safe by default. These are legacy scripts from the AGI Model Factory era that perform real file operations outside the new plan-only restore point system.

## 2. Current State (from D0)

| Script | Location | Risk |
|--------|----------|------|
| `scripts/restore.mjs` | `E:\AIP\scripts\restore.mjs` | HIGH — copies from zip, overwrites files, writes to DB via Python SQLite |
| `scripts/rollback_pre_seal_repair.cmd` | `E:\AIP\scripts\rollback_pre_seal_repair.cmd` | MEDIUM — `git restore --worktree --staged` on 11 specific files |

## 3. Fix Rules

### 3.1 restore.mjs

Default mode must be plan-only (print what would be done, do nothing):

- Add `const PLAN_ONLY = true;` at top as default
- Real restore requires `--execute` flag
- `--execute` also requires explicit human confirmation prompt
- Clear warning banner at startup: "⚠ WARNING: This is a legacy restore script. Use the new restore point system instead."
- Do NOT modify files by default
- Do NOT write to DB by default
- All file operations gated behind PLAN_ONLY check

### 3.2 rollback_pre_seal_repair.cmd

- Add clear warning at batch start
- Add confirmation prompt before executing git restore
- Document as legacy, not part of new system

## 4. Verification

```powershell
node scripts/restore.mjs --help
node scripts/restore.mjs          # Should print plan-only, not execute
```

## 5. Safety

- Stage C remains disabled
- No new script functionality added
- Only default behavior made safer
