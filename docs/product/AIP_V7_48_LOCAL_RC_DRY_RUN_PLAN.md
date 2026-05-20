# AIP v7.48 — Local RC Dry Run Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P3

---

## 1. Objective

Execute a dry run of the fresh-start flow from a clean clone perspective. This is a **rehearsal**, not a release. No tags, no GitHub Release, no Stage C enablement.

## 2. Dry Run Scope

Simulate a fresh clone experience:

1. START_HERE instructions are accurate and use `pnpm`
2. `pnpm install` resolves without errors
3. `pnpm run aip:cli:build` produces working CLI
4. `aip` displays OpenAIP banner
5. `aip where` reports correct project location
6. `aip safe-status` reports Stage C DISABLED
7. `aip receipt template` generates receipt
8. `aip next` shows recommended next step
9. `aip release-status` shows Local RC candidate state
10. `pnpm run typecheck` passes
11. `pnpm run build` produces web UI
12. Restore remains plan-only (no --execute)
13. No tag exists at HEAD
14. No GitHub Release exists
15. Working tree is clean

## 3. Out of Scope for Dry Run

- `pnpm test` — requires running API at localhost:8787
- Live API smoke tests — requires service running
- DB init (`pnpm run db:init`) — documented, not executed in dry run
- Real restore execution
- Service restart
- System PATH modification

## 4. Documentation Outputs

After dry run, generate:

- `docs/product/AIP_V7_48_LOCAL_RC_DRY_RUN_RESULT.md`
- `docs/product/AIP_V7_48_FRESH_START_REHEARSAL_RESULT.md`

Optional external report:

- `E:\_AIP_REPORTS\AIP_v7.48_P3_local_rc_dry_run_report_YYYYMMDD.md`

## 5. Test Dependency Note

If smoke tests require a live API at port 8787 and the service is not running:

- Do NOT restart the service
- Defer tests with a documented reason
- Record `tests: DEFERRED (API not running, no restart authorized)`
- Do NOT fake PASS results

## 6. Safety

- Plan-only restore only
- No `--execute` flag
- No `git tag`
- No `gh release create`
- No service restart
- No DB writes
- No Stage C changes
