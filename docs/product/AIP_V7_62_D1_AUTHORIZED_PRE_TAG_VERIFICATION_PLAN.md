# AIP v7.62-D1 Authorized Pre-Tag Verification Plan

**Status:** PLAN READY — NOT AUTHORIZED TO EXECUTE

---

## Pre-Tag Verification Checklist

This plan must only be used AFTER the release authorization form is filed.

| # | Check | Command / Method | Expected |
|---|---|---|---|
| 1 | Git status clean | `git status --short` | No unexpected modifications |
| 2 | Approved commit matches HEAD | `git rev-parse HEAD` | Matches approved commit hash |
| 3 | Tag name matches approval | `git tag -l <name>` | Tag name matches approval form |
| 4 | Typecheck PASS | `pnpm run typecheck` | Exit code 0 |
| 5 | Build PASS | `pnpm run build` | Exit code 0 |
| 6 | Lint PASS | `pnpm run lint` | Exit code 0 |
| 7 | Diff check clean | `git diff --check` | No whitespace errors |
| 8 | Tests PASS | `pnpm test` (if API running/authorized) | Exit code 0 |
| 9 | Release notes reviewed | Manual review | Accurate and complete |
| 10 | Stage C disabled | Code/config inspection | Not enabled |
| 11 | Feature flag off | Code/config inspection | Not toggled |
| 12 | No restore executed | Git log, status | Not executed |
| 13 | No DB write | Code review | Not performed |
| 14 | No .env.local changes | `git diff .env.local` | No changes |
| 15 | No unexpected tags at HEAD | `git tag --points-at HEAD` | Only approved tag |

## Execution Restrictions

- This plan must NOT be executed in v7.62-D1.
- Execute only as a separate task after release authorization is filed.
- Do not create tag/release until all checks pass.
- If any check fails: STOP, report, fix, re-verify.
