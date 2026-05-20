# AIP v7.45 — Restore Point Validation Policy

**Status:** P2 Policy
**Date:** 2026-05-20

---

## Pre-Restore Validation

Before any restore operation, the following validations are required:

| # | Validation | Description | Blocking |
|---|------------|-------------|----------|
| 1 | Restore point exists | The specified restore point directory must exist | Yes |
| 2 | Manifest exists | `source-manifest.json` must be present and valid JSON | Yes |
| 3 | Hash file exists | `source-sha256.txt` must be present | Yes |
| 4 | SHA256 verification | All file hashes must match | Yes |
| 5 | Working tree clean | Git working tree must be clean | Yes |
| 6 | No uncommitted changes | No dirty files in the working directory | Yes |
| 7 | Backup current state | Current state must be backed up before restore | Yes (auto) |
| 8 | Human confirmation | Operator must type explicit confirmation | Yes |
| 9 | Receipt generated | Receipt must be generated after restore | Yes |

## Post-Restore Validation

| # | Validation | Description |
|---|------------|-------------|
| 1 | SHA256 re-verification | All restored files must match expected hashes |
| 2 | Git status check | Working tree must be in expected state |
| 3 | Typecheck | `npm run typecheck` must pass |
| 4 | Tests | `npm test` must pass |
| 5 | Build | `npm run build` must pass |

## Failure Handling

If any pre-restore validation fails:
- Restore is BLOCKED
- Operator must investigate
- No automatic retry

If any post-restore validation fails:
- Restore is considered FAILED
- Operator must investigate
- Rollback to backup may be required
