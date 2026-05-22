# OPENAIP_V8_RECEIPT_INTAKE_CONTRACT

Receipt parser required fields:
- verdict
- commit hash
- pushed
- working tree
- files changed
- verification summary
- safety summary

Reject conditions:
- missing commit/push/working tree evidence
- missing safety checks
- ambiguous mutation statements

Evidence checks:
- git status -sb
- git log evidence
- verification command outputs
