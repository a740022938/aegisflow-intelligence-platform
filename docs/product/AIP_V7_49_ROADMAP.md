# AIP v7.49 — Roadmap

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Baseline:** AIP v7.48 Local RC Candidate Ready — HEAD `ec3c733`

---

## 1. Mission

Harden the RC evidence base by reviewing all deferred items from v7.48-P5, preparing release notes draft, and clarifying the tag/release gate — without creating a release or tag.

## 2. Phase Plan

```text
v7.49-D1 — Blueprint        (7 blueprint docs)
v7.49-P1 — Test Evidence    (review pnpm test deferral, API smoke policy)
v7.49-P2 — Secret Rotation  (env handling policy, .env.example, rotation checklist)
v7.49-P3 — Sidebar Decision (exposure audit, migration decision, no-go policy)
v7.49-P4 — Release Gate     (release notes draft, tag/release gate, auth template)
v7.49-P5 — Final Recheck    (full sweep + report + receipt)
```

## 3. Key Deliverables by Phase

### D1 — Blueprint
- Release Candidate Evidence Hardening Blueprint
- Deferred Items Review Plan
- Test Evidence Review Plan
- Env / Secret Rotation Readiness Plan
- Sidebar Migration Decision Plan
- Release Notes and Gate Plan
- v7.49 Roadmap (this file)

### P1 — Test Evidence
- Deferred test decision document
- API runtime smoke authorization policy
- Test evidence result (if API is running)

### P2 — Secret Rotation
- `.env.example` update with safe placeholders
- Env/secret rotation readiness review
- `.env.local` handling policy
- Secret rotation checklist

### P3 — Sidebar Decision
- Sidebar exposure audit
- Hidden preview migration decision
- Canonical operator entrypoints
- Sidebar no-go policy

### P4 — Release Gate
- Release notes draft (v7.41–v7.49)
- Tag/release gate definition
- Release authorization template
- Release no-go matrix
- Local RC to Release checklist

### P5 — Final Recheck
- Full sweep across all deferred items + hardening evidence
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
| Secrets captured | NOT PERMITTED |
| Sidebar changes | NONE |

## 5. Out of Scope

- Stage C enablement
- Feature flag toggle
- Real restore execution
- New mutation API endpoints
- New sidebar entries
- GitHub Release or tag
- Service restart (unless authorized)
- Actual secret rotation
- Actual sidebar migration
- PowerShell codepage fix
