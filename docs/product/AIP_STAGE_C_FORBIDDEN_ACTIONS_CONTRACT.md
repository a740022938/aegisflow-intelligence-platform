# Stage C Forbidden Actions Contract

> **Date:** 2026-05-20
> **Phase:** v7.34.0-D2

## Forbidden Actions

The following actions are FORBIDDEN during the Stage C readiness process:

| # | Action | Reason | Violation Consequence |
|---|--------|--------|----------------------|
| 1 | Enable Stage C without human approval | Safety boundary | Immediate denial |
| 2 | Implement POST runtime endpoint | Safety boundary | Contract violation |
| 3 | Write to production DB | Data integrity | Contract violation |
| 4 | Control external tools | Security boundary | Contract violation |
| 5 | Execute rollback without procedure | Recovery integrity | Contract violation |
| 6 | Restart server without human approval | Stability boundary | Contract violation |
| 7 | Capture evidence from dashboard | Evidence integrity | Contract violation |
| 8 | Write audit records from dashboard | Audit integrity | Contract violation |
| 9 | Expose hidden routes to sidebar | Access boundary | Contract violation |
| 10 | Create tag or release without final seal | Release integrity | Contract violation |
| 11 | Skip validator before enablement | Validation boundary | Automatic denial |
| 12 | Use stale evidence (>24h) | Freshness boundary | Automatic denial |
| 13 | Bypass human owner review | Governance boundary | Automatic denial |
| 14 | Self-approve Stage C enablement | Role boundary | Automatic denial |
| 15 | Modify forbidden actions contract | Contract integrity | Requires re-freeze |
| 16 | Implement approve/deny in preview | Role boundary | Contract violation |
| 17 | Collect evidence from preview page | Evidence integrity | Contract violation |
| 18 | Upload files from preview page | Evidence integrity | Contract violation |
| 19 | Treat seal candidate as final enablement | Governance boundary | Contract violation |

## Contract Enforcement

- Forbidden actions are documented in all registries and preview pages
- Validators check for forbidden action words in interpretations
- Safety searches scan for forbidden patterns
- No enforcement code executes forbidden actions
- P2/P3/P4 expanded forbidden actions cover: approve/deny, evidence collect, upload, seal candidate misuse

## Invariant

```
Stage C remains disabled.
No runtime executor is implemented.
No POST runtime action is implemented.
No DB write is permitted.
No external control is permitted.
```
