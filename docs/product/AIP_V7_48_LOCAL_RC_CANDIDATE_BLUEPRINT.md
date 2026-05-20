# AIP v7.48 — Local RC Candidate Blueprint

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Baseline:** AIP v7.47 Final Seal — HEAD `7096bb4`
**D0 Verdict:** `V7_47_FINAL_SEAL_READY_FOR_LOCAL_RC_WITH_STAGE_C_DISABLED`
**Target Verdict:** `V7_48_LOCAL_RC_CANDIDATE_READY_WITH_STAGE_C_DISABLED`

---

## 1. Objective

v7.48 is **not a release**. No tag. No GitHub Release. No Stage C enablement.

v7.48 progresses AIP from v7.47 Final Seal to a **Local RC Candidate** state — a locally evaluable candidate pack with polished OpenAIP CLI branding, read-only status commands, dry-run evidence, and a clearly documented release boundary.

## 2. What Local RC Means

- Local RC = local release candidate package for evaluation
- Can be installed, tested, and verified locally
- **Not** a GitHub Release
- **Not** tagged
- **Not** published to any registry
- Stage C remains **DISABLED** throughout

## 3. Phase Overview

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| D1 | Blueprint | 6 blueprint docs + this file |
| P1 | OpenAIP CLI Branding | Replace AGI banner, add OPENAIP ASCII banner with gradient + fallback, update help text |
| P2 | Local RC Status Commands | Add `aip next`, `aip release-status` read-only commands |
| P3 | Local RC Dry Run | Rehearse fresh start per START_HERE, verify all commands |
| P4 | Evidence Pack + Release Boundary | Document evidence, boundary policy, no-go policy for tag/release |
| P5 | Final Recheck | Full sweep + report + receipt |

## 4. Safety Invariants (D1 → P5)

| Invariant | Enforcement |
|-----------|-------------|
| Stage C disabled | Blocked at API, all registries, all validators |
| Feature flag off | Non-mutable from UI |
| No POST runtime | Blocked at safety boundary |
| No DB write | Blocked (except existing public endpoints) |
| No executor | No executor code in repository |
| No external control | Blocked at safety boundary |
| No connector action | Blocked at safety boundary |
| No tag/GitHub Release | Manual prohibition |
| No restart/taskkill | Unless explicitly authorized by human owner |

## 5. Out of Scope

- Stage C enablement
- Feature flag toggle
- Real restore execution
- Repair execution
- New mutation API endpoints
- New sidebar entries or hidden preview pages
- GitHub Release or tag creation
- Service restart
- Full sidebar migration (deferred from v7.47)
- Telegram credential rotation (deferred from v7.47)
- PowerShell codepage fix (out of scope)
- System PATH modification
