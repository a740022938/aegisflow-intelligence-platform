# Stage C Authorization Required Fields Matrix

> **Phase:** v7.35.0-D2

## Required Fields

| # | Field | Spec | Must Be Filled By |
|---|-------|------|-------------------|
| 1 | Human owner name | Full name of authorizer | Human owner |
| 2 | Authorization timestamp | YYYY-MM-DD HH:MM TZ | Human owner |
| 3 | Authorization scope | planning only / planning + preparation / other | Human owner |
| 4 | Acknowledged contracts | List of reviewed contracts | Human owner |
| 5 | Acknowledged forbidden actions | Confirmation of review | Human owner |
| 6 | Signature | Electronic signature or verified commit | Human owner |
| 7 | Authorization text | Full template with all fields | Human owner |

## Rules

- Fields 1-7 must be filled by human owner. AI cannot fill any field.
- Empty fields block authorization.
- Partial fills block authorization.
- Authorization without timestamp expires after 7 days.
