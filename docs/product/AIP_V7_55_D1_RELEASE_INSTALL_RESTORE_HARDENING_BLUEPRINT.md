# AIP v7.55-D1 Release / Install / Restore Hardening Blueprint

**Date:** 2026-05-21
**Pre-HEAD:** `03dedef`
**Phase:** D1 Blueprint
**Stage C:** DISABLED

---

## 1. Executive Verdict

```text
V7_55_D1_RELEASE_INSTALL_RESTORE_HARDENING_BLUEPRINT_READY_WITH_STAGE_C_DISABLED
```

The v7.55-D1 blueprint is submitted. No release, tag, restore, or source
mutation has been executed. This document defines the hardening plan for
fresh install, restore artifacts, release gates, and documentation consistency.
It closes the v7.54 Datasets pilot loop and transitions AIP from UI migration
to release hardening.

---

## 2. Current Baseline

| Field | Value |
|---|---|
| Git HEAD | `03dedef79af987ac6d6f70deb8d2ce0ca4389ab0` |
| Branch | `main` |
| package.json version | `7.46.0` |
| Package manager | `pnpm@9.15.0` |
| Stage C | DISABLED |
| Feature flag | OFF |
| Last git tag | `v7.3.0` (historical) |
| GitHub Release | NOT CREATED (beyond v7.3.0) |

---

## 3. Why v7.55 Should Shift Away From Page Migration

- v7.51–v7.54 completed the Datasets shell pilot (D1→P1→P2→P3→P4) — the UI
  migration loop is closed
- The adapter rulebook and candidate queue are finalized (P4)
- `NO_GO` pages (GovernanceHub, WorkflowComposer) have no viable migration path
  under the current shell adapter pattern
- `PLAN_ONLY` pages (Models, PluginPool, Tasks, WorkflowJobs) require full
  D1-style inventories before any code change — no scheduled capacity
- The product's core value proposition (installability, recoverability,
  release reliability) has not been hardened since v7.47

---

## 4. Release Readiness Gaps

| # | Gap | Severity | Evidence |
|---|---|---|---|
| RG1 | START_HERE.md still references v7.47 — stale | HIGH | Inconsistent with v7.54 HEAD |
| RG2 | README.md still references v7.46 Pre-RC — stale | HIGH | No mention of v7.47–v7.54 work |
| RG3 | package.json version `7.46.0` not updated through v7.54 | MEDIUM | Version should reflect current phase |
| RG4 | No unified evidence pack standard for release | MEDIUM | v7.48 precedent exists but not codified |
| RG5 | Restore dry-run artifact not defined | MEDIUM | Only plan-only mode exists |
| RG6 | Release gate conditions not fully met | MEDIUM | 5 of 9 conditions unmet per v7.49 gate |
| RG7 | No smoke test run for current HEAD | MEDIUM | Last test evidence from v7.49 |
| RG8 | `.env.local` handling not documented for fresh install | LOW | `.env.example` exists but secret guidance is minimal |

---

## 5. Fresh Install Hardening Plan

See `AIP_V7_55_D1_FRESH_INSTALL_HARDENING_PLAN.md` for full plan.

Key deliverables:
- Audit START_HERE.md for stale version references
- Audit README.md for stale version references
- Verify `pnpm install` / `pnpm run db:init` / `pnpm run dev` still work
- Verify `pnpm run typecheck` / `pnpm run build` / `pnpm run lint` pass
- Verify CLI commands (`aip safe-status`, `aip where`, etc.) work
- Identify npm/pnpm lock file consistency
- Document `.env.local` guidance

---

## 6. Restore Artifact Hardening Plan

See `AIP_V7_55_D1_RESTORE_HARDENING_PLAN.md` for full plan.

Key deliverables:
- Define restore dry run standard
- Define restore exclusion audit
- Document restore danger boundary
- No real restore executed in D1

---

## 7. Release Gate Hardening Plan

See `AIP_V7_55_D1_RELEASE_GATE_HARDENING_PLAN.md` for full plan.

Key deliverables:
- Define tag creation conditions
- Define release notes conditions
- Define evidence pack requirements
- Define human authorization template
- No tag or release created in D1

---

## 8. Documentation / START_HERE / README Hardening Plan

Key deliverables:
- Document stale version fields in START_HERE and README
- Propose v7.55-P1 fixes (no auto-fix in D1)
- Define documentation review cadence

---

## 9. Evidence Pack Standard

Required for any tag/release decision:

1. `pnpm run typecheck` — PASS
2. `pnpm run build` — PASS
3. `pnpm run lint` — PASS
4. `pnpm test` — PASS (all smoke tests)
5. `pnpm run secret:scan` — PASS
6. Fresh install dry run — PASS (clean clone → install → build → typecheck)
7. Restore dry run — PASS (plan-only)
8. Authorization receipt — FILED (human owner signature)
9. Release notes draft — REVIEWED
10. Rollback command — DOCUMENTED

---

## 10. Human Authorization Boundaries

| Action | Authorization Required | v7.55-D1 Status |
|---|---|---|
| Create git tag | Human owner written authorization | ❌ NOT AUTHORIZED |
| Create GitHub Release | Human owner written authorization | ❌ NOT AUTHORIZED |
| Enable Stage C | Separate gate + human authorization | ❌ NOT AUTHORIZED |
| Execute real restore | Human owner confirmation | ❌ NOT AUTHORIZED |
| Toggle feature flag | Human owner authorization | ❌ NOT AUTHORIZED |
| Write to production DB | Human owner authorization | ❌ NOT AUTHORIZED |
| Restart production services | Human owner authorization | ❌ NOT AUTHORIZED |

---

## 11. Safety Invariants

Throughout v7.55, the following must remain true:

- Stage C: DISABLED
- Feature flag: OFF
- No new tags created
- No GitHub Release created
- No real restore executed
- No DB writes beyond dev/test
- No production services restarted
- No hidden preview exposed
- No sidebar entries added
- No new POST mutations in source

---

## 12. Proposed v7.55 Phase Plan

| Phase | Focus | Est. Docs |
|---|---|---|
| D1 | This blueprint + sub-plans | 5 |
| P1 | Fresh install / docs consistency fix | 3 |
| P2 | Restore artifact dry pack | 2 |
| P3 | Release gate evidence pack | 3 |
| P4 | Local RC verification recheck | 2 |
| P5 | Final release decision gate | 2 |

---

## 13. Go / No-Go Criteria

**Go** (all must pass):
- All 5 D1 blueprint docs created and committed
- Validation gates pass
- Safety boundaries confirmed
- No source code modified
- Unrelated v7.52 docs untouched

**No-Go** (any triggers revert):
- Source code modified without authorization
- Tag or release accidentally created
- Real restore executed
- Stage C enabled
- Feature flag toggled

---

## 14. Final D1 Verdict

```text
V7_55_D1_RELEASE_INSTALL_RESTORE_HARDENING_BLUEPRINT_READY_WITH_STAGE_C_DISABLED
```

This blueprint does not authorize any tag, release, restore, or source
mutation. It is a planning document only.
