# AIP v7.56-D3 Restore Evidence Template

**Date:** 2026-05-21
**Phase:** D3
**Status:** Blank template — no restore evidence has been recorded

---

## 1. Instructions

This template must be filled after any future-authorized restore verification
execution. All fields in Section 2 must be completed.

---

## 2. Restore Evidence Record

| Field | Value |
|---|---|
| **Record Information** | |
| Evidence record ID | |
| Date recorded | |
| Recorded by | |
| | |
| **Authorization** | |
| Authorization form path | |
| Authorization filed by | |
| Authorization timestamp | |
| | |
| **Backup Artifact** | |
| Backup artifact path | |
| Backup artifact filename | |
| Backup checksum (SHA-256) | |
| Backups directory exists (`E:\_AIP_BACKUPS`) | YES / NO |
| | |
| **Target** | |
| Target restore path | |
| Target path is live workspace (`E:\AIP`) | YES / NO |
| Live workspace overwrite authorized | YES / NO |
| | |
| **Execution** | |
| Dry-run executed | YES / NO |
| Dry-run output summary | |
| Live extraction executed | YES / NO |
| Commands executed (full list) | |
| | |
| **Post-Restore State** | |
| Live workspace overwritten | YES / NO |
| DB restored/written | YES / NO |
| `.env.local` restored/modified | YES / NO |
| Service restart executed | YES / NO |
| Stage C state after restore | |
| Feature flag state after restore | |
| Git working tree clean | YES / NO |
| Current branch | |
| Post-restore HEAD commit | |
| | |
| **Validation** | |
| `pnpm run typecheck` | PASS / FAIL / NOT RUN |
| `pnpm run build` | PASS / FAIL / NOT RUN |
| `pnpm run lint` | PASS / FAIL / NOT RUN |
| `pnpm test` | PASS / FAIL / NOT RUN / DEFERRED |
| UI/API smoke test | PASS / FAIL / NOT RUN |
| `git diff --check` | PASS / FAIL / NOT RUN |
| | |
| **Abort / Rollback** | |
| Abort triggered | YES / NO |
| Abort condition (if triggered) | |
| Rollback executed | YES / NO |
| Rollback action taken | |
| Incident report filed | YES / NO |
| | |
| **Final Verdict** | |
| Restore verification result | PASS / FAIL / ABORTED |
| Notes | |
