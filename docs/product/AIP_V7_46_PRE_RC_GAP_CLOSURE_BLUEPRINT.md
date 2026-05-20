# AIP v7.46 — Pre-RC Gap Closure Blueprint

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Baseline:** AIP v7.45 Final Seal — HEAD `c4b89e3`
**D0 Verdict:** `NEEDS_POLISH_BEFORE_RC`
**Target Verdict:** `V7_46_FINAL_SEAL_READY_FOR_LOCAL_RC_WITH_STAGE_C_DISABLED`

---

## 1. Objective

v7.46 is **not a release**. No tag. No GitHub Release. No Stage C enablement.

v7.46 closes the 4 release blockers and ~20 polish gaps identified in the v7.46-D0 Pre-Release Recommendation Review, progressing AIP from `NEEDS_POLISH_BEFORE_RC` to `READY_FOR_LOCAL_RC`.

## 2. D0 Verdict Summary

| Area | Score | Critical Issue |
|------|-------|----------------|
| CLI UX | 4/10 | 3 missing core commands (`aip where`, `aip safe-status`, `aip receipt template`), 8 ghost commands |
| Web UI | 5/10 | 35 hidden previews > 28 real pages; duplicated Auth Review and Feature Flag pages |
| Documentation | 6/10 | No START_HERE; README claims v7.3.0 as current; 284 flat files in docs/product |
| Restore/Repair | 3/10 | Shell only; restore 6-step creation process has zero implementation; legacy scripts live |
| Safety | 7/10 | 2 critical API security gaps (master-switch public POST, token bootstrap bypass) |
| Release Readiness | 4/10 | 4 blockers prevent RC entry |

## 3. The 4 Release Blockers

1. `/api/openclaw/master-switch` — public POST writes to DB with no auth
2. `/api/openclaw/token` — bootstrap bypass allows unauthenticated admin token init
3. `aip where`, `aip safe-status`, `aip receipt template` — documented but not coded
4. 8 ghost commands in CLI help that do not exist

## 4. Safety Invariants (D1→P5)

| Invariant | Enforcement |
|-----------|-------------|
| Stage C disabled | Blocked at API, all registries, all validators |
| Feature flag off | Non-mutable from UI |
| No POST runtime | Blocked at safety boundary |
| No DB write | Blocked (except existing public endpoint to be fixed in P2) |
| No executor | No executor code in repository |
| No external control | Blocked at safety boundary |
| No connector action | Blocked at safety boundary |
| No sidebar hidden pages | Only 2 correct sidebar entries |
| No tag/GitHub Release | Manual prohibition |

## 5. Phase Map

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| D1 | Blueprint | This doc + 6 partner plans + roadmap |
| P1 | CLI Completion | `aip where`, `aip safe-status`, `aip receipt template`; remove ghost commands |
| P2 | Security Gap Closure | Fix master-switch, token bypass, JWT fallback, restore script |
| P3 | Documentation Overhaul | START_HERE, README fix, docs index, Stage C primer, pre-RC checklist |
| P4 | Web UI Polish | Preview inventory, Auth Review canonical map, Feature Flag canonical map |
| P5 | Final Pre-RC Recheck | Full recheck, report, receipt |

## 6. Exit Criteria

All of the following must pass:
- [ ] CLI: `aip where`, `aip safe-status`, `aip receipt template` exist and work
- [ ] CLI: no ghost commands in help
- [ ] Security: `master-switch` public POST no longer writes DB
- [ ] Security: token bootstrap bypass closed
- [ ] Security: JWT fallback fail-closed
- [ ] Security: `scripts/restore.mjs` plan-only / blocked-by-default
- [ ] Docs: START_HERE exists
- [ ] Docs: README no longer claims v7.3.0 as current
- [ ] Docs: docs index exists
- [ ] Docs: Stage C primer exists
- [ ] Docs: pre-RC checklist exists
- [ ] Web UI: preview inventory exists
- [ ] Web UI: Auth Review canonical map exists
- [ ] Web UI: Feature Flag canonical map exists
- [ ] Safety: Stage C disabled, feature flag off, all runtime blocked
- [ ] Validation: typecheck, test, build all pass
- [ ] Working tree: clean at P5 end

## 7. Out of Scope

- Stage C enablement
- Feature flag toggle
- Real restore execution
- Repair execution
- New mutation API endpoints
- New sidebar entries
- New hidden preview pages
- GitHub Release or tag creation
- Service restart
