# Stage C Authorization Blocker Checklist

## Purpose

Conditions that BLOCK authorization. All must be resolved before human owner can authorize.

## Blockers

| # | Blocker | Condition | Resolution |
|---|---------|-----------|------------|
| 1 | Dirty working tree | git status shows uncommitted changes | Commit or stash changes |
| 2 | origin/main drift | git status shows behind origin | git pull --rebase |
| 3 | Validator blocking > 0 | npm run typecheck fails | Fix type errors |
| 4 | Test failures | npm test shows any failure | Fix failing tests |
| 5 | Build failures | npm run build fails | Fix build errors |
| 6 | Stage C already enabled | Dashboard shows Stage C enabled | N/A — cannot proceed |
| 7 | POST runtime implemented | Any POST endpoint exists | Remove POST endpoint |
| 8 | DB write occurred | Any DB write in preview phases | Investigate and revert |
| 9 | Executor present | Any runtime executor exists | Remove executor |
| 10 | External control active | Any external tool control exists | Disconnect and remove |
| 11 | Hidden preview in sidebar | Any Stage C route in sidebar | Remove from sidebar |
| 12 | Missing evidence | Required evidence not found | Collect and document |
| 13 | Missing rollback docs | Rollback/recovery docs missing | Create and review |
| 14 | Missing human owner | No named human owner identified | Assign human owner |
| 15 | Authorization text incomplete | Required template fields empty | Fill all fields |
| 16 | Route smoke not run | Route smoke tests not executed | Run route smoke or document deferred policy |
| 17 | AI-generated fake authorization | Authorization signed by AI | Reject — human owner only |
| 18 | Authorization expired | >7 days since authorization | Re-authorize |

## Blocker Severity

- Blockers 1-15: MUST be resolved (blocking)
- Blockers 16-18: MUST be resolved (blocking) — route smoke can be deferred with documented policy
