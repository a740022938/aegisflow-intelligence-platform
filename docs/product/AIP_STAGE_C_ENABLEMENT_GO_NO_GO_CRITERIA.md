# Stage C Enablement Go/No-Go Criteria

**Date:** 2026-05-20
**Status:** Policy document — not code

## Go Criteria (ALL must pass)

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | Human owner authorization granted | Authorization text provided, not AUTHORIZATION_PENDING |
| 2 | typecheck PASS | `npm run typecheck` |
| 3 | All tests PASS | `npm test` |
| 4 | Build PASS | `npm run build` |
| 5 | Safety search: 0 issues | Automated safety scan |
| 6 | git diff --check clean | No whitespace errors |
| 7 | Feature flag defaults to `false` | Registry check |
| 8 | Kill switch defaults to `false` | Registry check |
| 9 | Blocked actions list complete | Validator check |
| 10 | No sidebar exposure | `visibleInSidebar: false` |
| 11 | No fake authorization | No hardcoded signer names |
| 12 | Audit events defined | Event registry check |
| 13 | Rollback plan documented | Plan exists |
| 14 | Smoke tests defined and PASS | Test run |

## No-Go Criteria (ANY triggers stop)

| # | Criterion | Action |
|---|-----------|--------|
| 1 | Authorization is PENDING | Stop — cannot proceed |
| 2 | Kill switch is active | Stop — resolve incident first |
| 3 | Safety search finds issues | Stop — fix before proceeding |
| 4 | typecheck fails | Stop — fix before proceeding |
| 5 | Tests fail | Stop — fix before proceeding |
| 6 | Build fails | Stop — fix before proceeding |
| 7 | Unauthorized enablement detected | Stop — rollback and investigate |
| 8 | Fake authorization detected | Stop — rollback and investigate |
| 9 | Sidebar exposure detected | Stop — remove before proceeding |

## Decision Flow

```
Authorization Received?
  ├── No → STOP (remain AUTHORIZATION_PENDING)
  └── Yes → Validation Gates
              ├── Any FAIL → STOP (fix and retry)
              └── All PASS → Go/No-Go Review
                              ├── No-Go → STOP (document reason)
                              └── Go → Proceed to Implementation
```

## Post-Enablement Verification

| Check | Timing |
|-------|--------|
| Feature flag reads expected state | Immediately after toggle |
| Status API returns correct state | Immediately after toggle |
| Audit event logged | Within 1 minute |
| Kill switch overrides flag | Tested on each deployment |
| Rollback plan executable | Tested quarterly |
