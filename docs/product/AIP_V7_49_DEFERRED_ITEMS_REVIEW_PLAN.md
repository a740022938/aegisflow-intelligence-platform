# AIP v7.49 — Deferred Items Review Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P1–P3 cross-cutting

---

## 1. Objective

Review the 4 deferred items from v7.48-P5 and determine for each:
- Is it blocking a real release?
- What evidence is needed to resolve it?
- Can it remain deferred?

## 2. Deferred Items Summary

| # | Item | v7.48 Status | v7.49 Review Phase | Blocking? |
|---|------|--------------|--------------------|-----------|
| 1 | `pnpm test` | API not running; no restart auth | P1 | Non-blocking (can be deferred with doc) |
| 2 | PowerShell codepage 936 | Out of scope | P1 | Non-blocking (known limitation, workaround exists) |
| 3 | `.env.local` credential rotation | Doc-only | P2 | Non-blocking (readiness review only) |
| 4 | Sidebar migration | Post-v7.47 tracking ticket | P3 | Non-blocking (audit + decision only) |

## 3. Decision Rules

### 3.1 pnpm test

- If API is already running at port 8787: execute `pnpm test`
- If API is not running: do NOT start/restart without explicit human authorization
- Document the deferral with reason
- Record as non-blocking for RC evidence hardening

### 3.2 PowerShell codepage 936

- Reaffirm as out of scope
- Document that `--plain` workaround exists and CLI is tested on codepage 936
- No code changes needed

### 3.3 .env.local credential rotation

- Do NOT read or print `.env.local` contents
- Do NOT commit real secrets
- `.env.example` may use placeholder values
- Create rotation readiness checklist (not actual rotation)
- Document handling policy

### 3.4 Sidebar migration

- Do NOT add hidden preview pages to sidebar
- Do exposure audit of current `navigation-exposure-registry.ts`
- Make migration decision (defer or plan)
- Create no-go policy for sidebar exposure during RC

## 4. Evidence Requirements

- All reviews must be documented in `docs/product/`
- External reports to `E:\_AIP_REPORTS` optional
- No code changes required for deferred item review
