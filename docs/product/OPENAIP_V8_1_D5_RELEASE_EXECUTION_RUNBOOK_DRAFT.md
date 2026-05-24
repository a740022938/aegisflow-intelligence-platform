# OpenAIP v8.1 — D6 Release Execution Runbook (DRAFT)

*This runbook defines the exact steps for executing the OpenAIP v8.1.0 release. It must NOT be executed until: (1) the human owner has signed the authorization form, and (2) the screenshot gate is satisfied or waived.*

---

## 0. Preconditions

| Condition | Status |
|-----------|--------|
| Owner authorization form signed | ☐ PENDING |
| Screenshot gate satisfied or waived | ☐ PENDING |
| Working tree clean | ☐ |
| Branch is `main` | ☐ |
| `origin/main` up to date | ☐ |
| Tag `v8.1.0` does not already exist | ☐ |

If any precondition is not met, **STOP** and do not proceed.

---

## 7.1 Pre-release Checks

Run the following commands in order. All must PASS before proceeding to release actions.

```powershell
# Git state
git status --short
git branch --show-current
git rev-parse HEAD
git tag --list v8.1.0

# Validation suite
npm run typecheck
npm run lint
npm run build
npm test --silent
node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs
```

---

## 7.2 Release Actions (only after authorization)

Only execute these if all pre-release checks pass AND owner authorization is confirmed in writing.

### Create and push the tag

```powershell
git tag -a v8.1.0 -m "OpenAIP v8.1 Readonly Control Plane"
git push origin v8.1.0
```

### Create GitHub Release

Use the approved release notes from `OPENAIP_V8_1_D5_RELEASE_NOTES_DRAFT_PENDING_AUTHORIZATION.md`.

```powershell
# Example gh command (verify content before running):
gh release create v8.1.0 `
  --title "OpenAIP v8.1 Readonly Control Plane" `
  --notes-file docs/product/RELEASE_NOTES_v8.1.0.md `
  --target main
```

If `gh` is not available, create the release manually at:
`https://github.com/a740022938/aegisflow-intelligence-platform/releases/new`

---

## 7.3 Post-release Verification

After tag push and GitHub Release creation, verify the following:

| Check | Verification Method | Result |
|-------|---------------------|--------|
| Tag exists locally | `git tag --list v8.1.0` | ☐ |
| Tag exists on origin | `git ls-remote --tags origin v8.1.0` | ☐ |
| GitHub Release URL captured | Confirm at `https://github.com/a740022938/aegisflow-intelligence-platform/releases/tag/v8.1.0` | ☐ |
| Release notes match approved draft | Visual comparison | ☐ |
| Gate still CLOSED | Source check in Layout.tsx / Gate config | ☐ |
| Stage C still disabled | Source check | ☐ |
| Execution still disabled | Source check | ☐ |
| Working tree clean | `git status --short` | ☐ |
| `origin/main` still synced | `git status` | ☐ |

---

## 7.4 Rollback Notes

| Scenario | Action |
|----------|--------|
| Release notes content wrong | Edit GitHub Release — do not rewrite tag unless owner explicitly authorizes |
| Tag content wrong | **STOP** — request human owner decision; do not delete/push --force without explicit authorization |
| Runtime stale after release | Do not restart without separate authorization (see `AIP_HUMAN_APPROVED_RESTART_CHECKLIST.md`) |
| Browser visual stale | Clear browser cache / Ctrl+F5 before declaring release failure |
| Post-release smoke tests fail | Git revert the release commit (see `OPENAIP_V8_1_D3_ROLLBACK_RECOVERY_PLAN.md`) |

---

## 8. Safety Reminder

```text
Gate: CLOSED
Stage C: disabled
Execution: disabled
No DB writes
No indexing
No provider/local-app/connector actions
```

If ANY of these safety properties changes during the release execution, **STOP IMMEDIATELY** and notify the human owner.

---

## 9. Release Notes Publication

The final release notes file should be saved as:

```
docs/product/RELEASE_NOTES_v8.1.0.md
```

This file should be the content of `OPENAIP_V8_1_D5_RELEASE_NOTES_DRAFT_PENDING_AUTHORIZATION.md` with the `DRAFT` and `PENDING_AUTHORIZATION` markers removed, and the actual release date and commit hash filled in.

---

*This is a DRAFT runbook. It has not been executed. No tag, release, or deployment action has been performed.*
