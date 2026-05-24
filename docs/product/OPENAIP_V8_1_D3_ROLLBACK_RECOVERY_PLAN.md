# OpenAIP v8.1 — Rollback and Recovery Plan

*This plan defines the steps to roll back a release if issues are discovered post-release. It assumes no DB migration, no Gate/Stage C/execution state change, and no provider actions were part of this release.*

---

## 1. Rollback Triggers

| Trigger | Severity | Action |
|---------|----------|--------|
| Build fails after release tag | Critical | Immediate rollback |
| v8 route smoke tests fail (108/108 not achieved) | Critical | Immediate rollback |
| Sidebar shows wrong labels or broken icons | High | Rollback or hotfix |
| Browser visual regressions in navigation | Medium | Evaluate hotfix vs rollback |
| Unintended Gate opening or Stage C enablement | Critical | Immediate rollback + safety review |
| Execution surface accidentally exposed | Critical | Immediate rollback + safety audit |
| v7 smoke tests fail (9/9 not achieved) | Critical | Rollback — core regression |
| New dangerous sidebar entry appears | High | Rollback |

---

## 2. Rollback Procedure

### Step 1: Identify the previous known-good state

```powershell
git log --oneline -5
# Identify the commit hash before the release tag
# e.g., the commit before v8.1.0 was tagged
```

### Step 2: Checkout previous state

```powershell
# Option A: Checkout previous commit
git checkout <previous-commit-hash>

# Option B: If a previous tag exists
git checkout <previous-tag>
```

### Step 3: Verify rollback

```powershell
npm run typecheck
npm run lint
npm run build
npm test --silent
node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs
```

### Step 4: Decide on permanent revert vs hotfix

```powershell
# If permanent revert is needed (not just a temporary rollback):
git revert <release-commit-hash> --no-edit
# OR
git reset --hard <previous-commit-hash>  # requires force push — use only with human authorization
```

### Step 5: Push the correction

```powershell
git push origin main
# If force push is needed (only with explicit human authorization):
# git push --force origin main
```

---

## 3. No DB / No Migration

This release involves:
- No database migrations
- No schema changes
- No data writes
- No indexing jobs

Therefore rollback is **purely a Git operation**. No data reconciliation is required.

---

## 4. Runtime Recovery

If the runtime (Vite dev server or production web server) has stale state after rollback:

```powershell
# Stop the running server (requires separate human authorization)
# Stop-Process -Id <PID> -Force   # NOT to be run automatically

# Restart (requires human authorization — see AIP_HUMAN_APPROVED_RESTART_CHECKLIST.md)
# npm run dev
```

The server must be restarted only with explicit human authorization and after confirming the working tree contains the correct rolled-back state.

---

## 5. Browser Cache Recovery

If visual regressions persist after rollback even with correct code:

```powershell
# Hard refresh to clear browser cache
# Windows: Ctrl + F5
# Mac: Cmd + Shift + R
# Or clear browser cache manually in DevTools → Network → Disable cache
```

If the issue persists, verify:
1. `vite` dev server is not serving stale cached output
2. `node_modules/.vite` cache may need clearing: `rm -rf node_modules/.vite`
3. Full clean: `npm run clean && npm install && npm run dev`

---

## 6. Post-Rollback Validation

After rollback, re-run the full validation suite:

```powershell
npm run typecheck
npm run lint
npm run build
npm test --silent
node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs
```

Only when all pass should the rollback be declared successful.

---

## 7. Rollback Communication

In case of rollback, document:
1. Release version that was rolled back
2. Commit hash of the release
3. Trigger reason (which test/check failed)
4. Rollback target (commit hash or tag)
5. Validation results after rollback
6. Human owner notified: yes/no

---

## 8. Key Principles

| Principle | Rule |
|-----------|------|
| No automatic restart | Runtime restart requires separate human authorization |
| No force push without authorization | Force push requires explicit human owner OK |
| No DB recovery needed | This release has no DB impact |
| Git is the source of truth | Rollback = checkout previous commit or tag |
| Validate after rollback | Run full validation suite before declaring success |
| Gate remains CLOSED | Rollback does not change Gate/Stage C/execution state |

---

*See also: AIP_HUMAN_APPROVED_RESTART_CHECKLIST.md for restart authorization procedure.*
