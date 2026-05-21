# AIP v7.59-P2 Pre-Change Baseline Requirements

**Phase:** v7.59-P2
**Status:** DEFINED

---

## Baseline Checklist

Before any implementation, the following baseline must be captured and documented.

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | `git status` clean | ⏳ Future | Must be clean before implementation commit |
| 2 | Pre-change HEAD recorded | ⏳ Future | Recorded in the implementation receipt |
| 3 | Current build warning text | ✅ DONE | `GovernanceCenter-Dl3qqZfx.js: 930.88 kB` |
| 4 | Current chunk size | ✅ DONE | 930.88 kB (68.67 kB gzip) |
| 5 | Target file list identified | ✅ DONE | `apps/web-ui/src/pages/GovernanceCenter.tsx` (registry imports) |
| 6 | Current route behavior documented | ✅ DONE | Route: `/governance-center`, lazy-loaded, PageShell-wrapped, readonly |
| 7 | Visual QA plan ready | ✅ DONE | See P2 Visual QA and Rollback Plan |
| 8 | `pnpm run typecheck` passing | ✅ DONE | Confirmed in P1/P2 validation |
| 9 | `pnpm run build` passing | ✅ DONE | Exit 0 |
| 10 | `pnpm run lint` passing | ✅ DONE | 0 warnings |
| 11 | `git diff --check` passing | ✅ DONE | Clean |
| 12 | Tests passing (if API running) | ⏳ DEFERRED | API not running |
| 13 | Rollback command documented | ✅ DONE | `git revert <commit-hash>` + validation re-run |
| 14 | No release/restore/Stage C/feature flag coupling | ✅ DONE | All preserved |

---

## Baseline Documented

All known baseline evidence is captured in prior phases:
- P1 dependency inventory: `AIP_V7_58_P1_GOVERNANCECENTER_DEPENDENCY_AND_ROUTE_INVENTORY.md`
- P1 source map: `AIP_V7_58_P1_GOVERNANCECENTER_CHUNK_SOURCE_MAP.md`
- P2 no-code decision: `AIP_V7_58_P2_NO_CODE_DECISION.md`
