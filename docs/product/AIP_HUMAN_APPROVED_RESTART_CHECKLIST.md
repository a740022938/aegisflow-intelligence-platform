# AIP Human-Approved Restart Checklist

> **Phase:** v7.32.0-D2
> **Date:** 2026-05-20
> **Status:** Checklist only — no restart executed

## 1. Before Restart

- [ ] Human project owner has explicitly approved restart
- [ ] Current commit recorded: `git rev-parse --short HEAD`
- [ ] Current server status recorded: `Invoke-RestMethod http://127.0.0.1:8787/api/health`
- [ ] No pending work that would be lost by restart
- [ ] Working tree is clean: `git status --short`
- [ ] All changes are committed and pushed

## 2. Restart Commands (do not execute automatically)

These commands are for the operator to run manually after human approval:

```powershell
# Option A: Kill existing process and restart
# (Only if explicitly approved by human owner)
# taskkill /F /PID <PID>   (DO NOT RUN WITHOUT APPROVAL)

# Option B: Stop and restart via npm
# cd E:\AIP
# npm run dev   (starts both web-ui and local-api)

# Option C: Restart local-api only
# cd E:\AIP\apps\local-api
# npm run dev
```

## 3. After Restart

- [ ] Server is listening: `Invoke-RestMethod http://127.0.0.1:8787/api/health` returns 200
- [ ] Runtime endpoints return 200: `Invoke-RestMethod http://127.0.0.1:8787/api/runtime/status`
- [ ] POST endpoints return non-200
- [ ] Response schema matches contract
- [ ] Cache-Control: no-store header present
- [ ] All safety fields correct (stageCEnabled=false, dbWriteEnabled=false, etc.)

## 4. Rollback Path

If restart fails or smoke reveals issues:

```powershell
# Revert to previous commit
git revert HEAD --no-edit

# Verify
npm run typecheck
cd apps/local-api && npm run test
```

## 5. Prohibited Actions

| Action | Reason |
|--------|--------|
| Enable Stage C | Permanently prohibited |
| Write DB | No DB write code exists |
| Run executor | No executor exists |
| Trigger connector action | No connector control |
| Execute external control | No external control code |
| Add POST runtime endpoint | Requires human + Stage C |
| Modify package.json | Not scoped for this restart |
| Modify Layout/sidebar/i18n | Not scoped for this restart |
