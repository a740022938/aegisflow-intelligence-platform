# AIP v7.49 — Release Candidate Evidence Hardening Blueprint

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Baseline:** AIP v7.48 Local RC Candidate Ready — HEAD `ec3c733`
**D0 Verdict:** `V7_48_LOCAL_RC_CANDIDATE_READY_WITH_STAGE_C_DISABLED`
**Target Verdict:** `V7_49_RELEASE_CANDIDATE_EVIDENCE_HARDENED_WITH_STAGE_C_DISABLED`

---

## 1. Objective

v7.49 is **not a release**. No tag. No GitHub Release. No Stage C enablement.

v7.49 performs the final round of **evidence hardening** before a potential real release. It reviews the 4 deferred items from v7.48-P5, hardens the evidence base, and clarifies the tag/release gate.

## 2. v7.48-P5 Deferred Items

| # | Deferred Item | Status in v7.48 | Plan for v7.49 |
|---|---------------|-----------------|----------------|
| 1 | `pnpm test` | API not running, no restart authorized | Review evidence; deferred or request auth |
| 2 | PowerShell codepage 936 | Out of scope | Reaffirm OOS; document decision |
| 3 | `.env.local` credential rotation | Doc-only, no rotation | Rotation readiness review; policy document |
| 4 | Full sidebar migration | Post-v7.47 tracking ticket | Exposure audit; migration decision |

## 3. Phase Overview

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| D1 | Blueprint | 7 blueprint docs + this file |
| P1 | Deferred Test Evidence Review | Review `pnpm test` deferral; API smoke authorization policy |
| P2 | Env / Secret Rotation Readiness | `.env.example` hardening; rotation checklist; policy |
| P3 | Sidebar Migration Decision | Exposure audit; migration no-go or deferral decision |
| P4 | Release Notes Draft + Gate Pack | Release notes draft; tag/release gate; authorization template |
| P5 | Final Recheck | Full sweep across all deferred items + hardening evidence |

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
| No secret capture | Do not print, log, or commit real secrets |

## 5. Out of Scope

- Stage C enablement
- Feature flag toggle
- Real restore execution
- New mutation API endpoints
- New sidebar entries or hidden preview pages
- GitHub Release or tag creation
- Service restart (unless human-authorized)
- Actual secret rotation (readiness review only)
- Actual sidebar migration (audit + decision only)
- PowerShell codepage fix
