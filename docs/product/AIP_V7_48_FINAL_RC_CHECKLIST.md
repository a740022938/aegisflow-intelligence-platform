# AIP v7.48 — Final RC Checklist

**Date:** 2026-05-20
**Phase:** P4
**Baseline HEAD:** `3d25af5`

---

## Instructions

Run this checklist at the end of P5. Check each item and record PASS/FAIL/DEFERRED.

---

## CLI Verification

- [ ] `aip` — OpenAIP banner with gradient
- [ ] `aip --plain` — plain banner, no colors
- [ ] `aip --no-color` — no ANSI codes
- [ ] `aip --ascii` — ASCII banner
- [ ] `aip --no-banner` — no banner, status + commands
- [ ] `aip where` — shows branch, HEAD, working tree
- [ ] `aip safe-status` — Stage C DISABLED
- [ ] `aip receipt template` — generates template
- [ ] `aip next` — readonly, recommends next step
- [ ] `aip release-status` — no tag, no release

## Build & Typecheck

- [ ] `pnpm install` — resolves 600+ deps, no errors
- [ ] `pnpm run aip:cli:build` — tsc compiles
- [ ] `pnpm run typecheck` — local-api + web-ui pass
- [ ] `pnpm run build` — vite builds 735 modules

## Restore Safety

- [ ] `scripts/restore.mjs` — PLAN_ONLY exits before zip extraction
- [ ] No `--execute` flag called

## Safety Invariants

- [ ] Stage C DISABLED
- [ ] Feature flag OFF
- [ ] POST runtime BLOCKED
- [ ] DB write BLOCKED
- [ ] Executor ABSENT
- [ ] External control BLOCKED
- [ ] Connector action BLOCKED

## Git & Working Tree

- [ ] Working tree clean (`git status --short` → empty)
- [ ] No unpushed commits (`git rev-list --count HEAD...origin/main` → 0)
- [ ] No tag at HEAD (`git tag --points-at HEAD` → empty)
- [ ] No new GitHub Release (`gh release list` → only pre-v7.48)

## Documentation

- [ ] AIP_V7_48_LOCAL_RC_CANDIDATE_BLUEPRINT.md exists
- [ ] AIP_V7_48_OPENAIP_CLI_BRANDING_BLUEPRINT.md exists
- [ ] AIP_V7_48_CLI_GRADIENT_BANNER_POLICY.md exists
- [ ] AIP_V7_48_RELEASE_BOUNDARY_POLICY.md exists
- [ ] AIP_V7_48_LOCAL_RC_DRY_RUN_PLAN.md exists
- [ ] AIP_V7_48_ROADMAP.md exists
- [ ] AIP_V7_48_LOCAL_RC_DRY_RUN_RESULT.md exists
- [ ] AIP_V7_48_FRESH_START_REHEARSAL_RESULT.md exists
- [ ] AIP_V7_48_LOCAL_RC_EVIDENCE_PACK.md exists
- [ ] AIP_V7_48_RELEASE_BOUNDARY_REVIEW.md exists
- [ ] AIP_V7_48_TAG_RELEASE_NO_GO_POLICY.md exists
- [ ] AIP_V7_48_LOCAL_RC_HANDOFF.md exists
- [ ] AIP_V7_48_FINAL_RC_CHECKLIST.md exists

## Reports & Receipts

- [ ] P5 final recheck report generated
- [ ] P5 final recheck receipt generated

---

## Final Verdict Options

```
V7_48_LOCAL_RC_CANDIDATE_READY_WITH_STAGE_C_DISABLED
V7_48_LOCAL_RC_CANDIDATE_READY_WITH_MINOR_DEFERRED_ITEMS_AND_STAGE_C_DISABLED
V7_48_LOCAL_RC_CANDIDATE_BLOCKED
```
