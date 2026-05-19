# AIP Readonly Runtime API Human-Approved Restart Policy

> **Phase:** v7.32.0-D1 (design)
> **Status:** Policy only — no restart executed
> **Date:** 2026-05-20

## 1. Core Principle

No automatic restart. No taskkill. All restart operations require explicit human project owner approval.

## 2. Before Restart

Before any restart, the operator must:
1. Confirm human project owner has explicitly approved the restart
2. Record current server status (aip status, aip health)
3. Confirm no pending work that would be lost
4. Confirm the approved code is checked out (git log -1)

## 3. Allowed Restart Paths

Only these scripts may be used:
- `npm run dev` (in project root or apps/local-api)
- Standard OS process management (taskkill only if explicitly approved)

## 4. After Restart

After restart, the operator must:
1. Wait for server to be ready (aip status / aip health)
2. Run endpoint smoke (see live smoke policy)
3. Record results
4. Report to human owner

## 5. Prohibited Actions

| Action | Reason |
|--------|--------|
| Automatic restart | No auto-recovery without human approval |
| taskkill without approval | Destructive |
| Config change during restart | Keep existing config |
| Stage C enablement | Permanently disabled |
| DB write | Prohibited |
| Port change | Must use existing 8787 |

## 6. Failure During Restart

| Failure | Action |
|---------|--------|
| Server fails to start | Check logs. Revert code if needed. Report. |
| Smoke fails | Report immediately. Do not continue. |
| Unexpected behavior | Stop. Report. Do not proceed. |
