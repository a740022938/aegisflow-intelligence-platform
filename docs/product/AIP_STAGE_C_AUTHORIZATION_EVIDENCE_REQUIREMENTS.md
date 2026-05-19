# Stage C Authorization Evidence Requirements

## Purpose

Define what evidence must accompany any human authorization for Stage C enablement planning.

## Required Evidence

| # | Evidence | Source | Must Be Fresh |
|---|----------|--------|---------------|
| 1 | v7.34 Final Seal Recheck doc | AIP_V7_34_FINAL_SEAL_RECHECK.md | Latest version |
| 2 | Stage C Readiness Contract v1 | AIP_STAGE_C_READINESS_CONTRACT_V1.md | Latest version |
| 3 | Forbidden Actions Contract | AIP_STAGE_C_FORBIDDEN_ACTIONS_CONTRACT.md | Latest version |
| 4 | Human Review Blueprint | AIP_V7_34_D1 doc set | Latest version |
| 5 | Authorization Text Spec | This document | Latest version |
| 6 | Authorization Blocker Checklist | AIP_STAGE_C_AUTHORIZATION_BLOCKER_CHECKLIST.md | Resolved |
| 7 | Validator output (all 7) | npm run typecheck + npm test + npm run build | Within 24h |
| 8 | Safety search report | _AIP_REPORTS | Within 24h |
| 9 | Smoke test results | npm test | Within 24h |
| 10 | git status (clean tree) | git status | At authorization time |
| 11 | origin/main sync status | git status | At authorization time |

## Evidence Freshness

- Docs: latest committed version
- Validator output: within 24h of authorization
- Smoke tests: within 24h of authorization
- Safety search: within 24h of authorization
- git status: at authorization time
