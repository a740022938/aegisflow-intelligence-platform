# Stage C Authorization Blocker Matrix

> **Phase:** v7.35.0-D2

## Blockers

| # | Blocker | Type | Severity | Resolution |
|---|---------|------|----------|------------|
| 1 | Dirty working tree | git | blocking | Commit or stash |
| 2 | Origin drift | git | blocking | git pull --rebase |
| 3 | Validator blocking > 0 | validation | blocking | Fix type errors |
| 4 | Test failures | validation | blocking | Fix tests |
| 5 | Build failures | validation | blocking | Fix build |
| 6 | Stage C already enabled | safety | blocking | N/A — cannot proceed |
| 7 | POST runtime implemented | safety | blocking | Remove POST |
| 8 | DB write occurred | safety | blocking | Investigate and revert |
| 9 | Executor present | safety | blocking | Remove executor |
| 10 | External control active | safety | blocking | Disconnect and remove |
| 11 | Hidden preview in sidebar | safety | blocking | Remove from sidebar |
| 12 | Missing evidence | evidence | blocking | Collect and document |
| 13 | Missing rollback docs | evidence | blocking | Create and review |
| 14 | Missing human owner | governance | blocking | Assign human owner |
| 15 | Authorization text incomplete | governance | blocking | Fill all fields |
| 16 | Route smoke not run | validation | blocking | Run or document deferral |
| 17 | AI-generated fake authorization | governance | blocking | Reject |
| 18 | Authorization expired | governance | blocking | Re-authorize |
