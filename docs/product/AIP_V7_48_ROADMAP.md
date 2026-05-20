# AIP v7.48 — Roadmap

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Baseline:** AIP v7.47 Final Seal — HEAD `7096bb4`

---

## 1. Mission

Progress AIP from v7.47 Final Seal to a **Local RC Candidate** with polished OpenAIP CLI branding, read-only status commands, dry-run evidence, and clearly documented release boundary.

## 2. Phase Plan

```text
v7.48-D1 — Blueprint        (6 blueprint docs)
v7.48-P1 — CLI Branding     (OPENAIP banner, gradient, fallback)
v7.48-P2 — Status Commands  (aip next, aip release-status)
v7.48-P3 — Dry Run          (fresh start rehearsal + evidence)
v7.48-P4 — Evidence Pack    (documentation, boundary review, handoff)
v7.48-P5 — Final Recheck    (full sweep + report + receipt)
```

## 3. Key Deliverables by Phase

### D1 — Blueprint
- Local RC Candidate Blueprint
- OpenAIP CLI Branding Blueprint
- CLI Gradient Banner Policy
- Release Boundary Policy
- Local RC Dry Run Plan
- v7.48 Roadmap (this file)

### P1 — CLI Branding
- `apps/aip-cli/src/banner.ts` — banner rendering with gradient + fallback
- `apps/aip-cli/src/index.ts` — updated homepage with new banner
- `--no-banner` flag, `NO_COLOR`, `AIP_NO_BANNER` support
- All `AGI Production Command Center` references removed from CLI output

### P2 — Status Commands
- `aip next` — read-only recommended next step
- `aip release-status` — read-only release state summary
- Both commands: no side effects, no writes, no service calls

### P3 — Dry Run
- Execute fresh-start rehearsal
- Verify all CLI commands work
- Generate dry run result docs
- Defer smoke tests if API unavailable

### P4 — Evidence Pack
- Local RC Evidence Pack document
- Release Boundary Review document
- Tag/Release No-Go Policy reaffirmation
- Local RC Handoff document
- Final RC Checklist

### P5 — Final Recheck
- Full sweep across all 10 areas
- CLI, docs, safety, git, build, deps
- Generate report + receipt
- Final verdict

## 4. Safety Invariants (All Phases)

| Action | Status |
|--------|--------|
| Stage C | DISABLED |
| Feature flag | OFF |
| POST runtime | BLOCKED |
| DB write | BLOCKED |
| Executor | ABSENT |
| External control | BLOCKED |
| Connector action | BLOCKED |
| Restore | PLAN-ONLY |
| Tag | NOT CREATED |
| GitHub Release | NOT CREATED |
| Service restart | NOT AUTHORIZED |
| Sidebar changes | NONE |

## 5. Out of Scope

- Stage C enablement
- Feature flag toggle
- Real restore execution
- New mutation API endpoints
- New sidebar entries
- GitHub Release or tag
- Service restart
- System PATH modification
- Full sidebar migration (deferred)
- Telegram credential rotation (deferred)
- PowerShell codepage fix
