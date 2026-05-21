# AIP v7.55-P2 Restore Dry Pack Checklist

**Date:** 2026-05-21
**Phase:** P2

---

## 1. Purpose

Checklist for verifying a restore artifact is safe, complete, and usable.
This should be executed before any restore point is created or used.

---

## 2. Checklist

| # | Check | Method | Status |
|---|---|---|---|
| 1 | Fresh clone readiness | Verify `README.md` and `START_HERE.md` are present in the restore point | ⬜ Pending |
| 2 | `pnpm install` readiness | Verify `pnpm-lock.yaml` and `package.json` are present | ⬜ Pending |
| 3 | CLI build readiness | Verify `apps/aip-cli/` source and `pnpm run aip:cli:build` works | ⬜ Pending |
| 4 | DB init instructions | Verify DB setup is documented in restore point or START_HERE | ⬜ Pending |
| 5 | `.env` template readiness | Verify `.env.example` is present (not `.env.local`) | ⬜ Pending |
| 6 | Include/exclude compliance | Verify manifest Must Include / Must Exclude rules | ⬜ Pending |
| 7 | No secret leakage | Verify no `.env.local`, `*.key`, `*.token` in restore point | ⬜ Pending |
| 8 | No destructive script auto-execution | Verify restore point does not auto-run any script on extraction | ⬜ Pending |
| 9 | No current workspace overwrite | Verify restore operation targets a clean directory, not in-place | ⬜ Pending |
| 10 | No tag/release side effect | Verify restore process does not create tags or GitHub Releases | ⬜ Pending |
| 11 | Post-restore validation commands documented | Verify typecheck, build, lint, safe-status commands in post-restore guide | ⬜ Pending |
| 12 | Rollback / abort condition documented | Verify user can abort before extraction and rollback after partial restore | ⬜ Pending |

---

## 3. No-Go Conditions

If any of the following are true, the restore point must NOT be used:

- Secrets found in the archive
- No `.env.example` (user would lack configuration template)
- No `pnpm-lock.yaml` (dependency resolution not reproducible)
- Archive contains destructive auto-execute scripts
- Archive overwrites workspace without `.pre-restore-` backup

---

## 4. Post-Restore Verification Commands

After applying a restore point:

```powershell
# 1. Install dependencies
pnpm install

# 2. Verify TypeScript
pnpm run typecheck

# 3. Verify build
pnpm run build

# 4. Verify lint
pnpm run lint

# 5. Initialize database
pnpm run db:init

# 6. Start services
pnpm run dev
# In a new terminal:

# 7. Check safety posture
node apps/aip-cli/dist/index.js safe-status

# 8. Verify Stage C disabled
Expected: Stage C DISABLED
```
