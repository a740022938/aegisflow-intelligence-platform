# AIP Backend Readonly API Hardening

> **Phase:** v7.31.0-P4
> **Status:** IMPLEMENTED (part of P2/P3/P4 acceleration pack)
> **Date:** 2026-05-20

## Overview

Hardening applied to the 4 readonly GET endpoints in `apps/local-api/src/runtime/readonly-status.ts` to unify contract fields, security headers, and response structure.

## Changes

### Added Fields (all 4 endpoints)

| Field | Value |
|-------|-------|
| `contractVersion` | `v7.31.0-P1` |
| `readonly` | `true` |

### Updated GATES

Added 2 new gates to the gates array:

| Gate ID | Status |
|---------|--------|
| `get_only` | pass |
| `no_post` | pass |

Gates now include: `readonly_only`, `get_only`, `no_post`, `no_db_write`, `no_external_control`, `stage_c_disabled`

### Added Headers (all 4 endpoints)

| Header | Value |
|--------|-------|
| `Cache-Control` | `no-store` |

## Files Modified

| File | Change |
|------|--------|
| `apps/local-api/src/runtime/readonly-status.ts` | Added `contractVersion`, `readonly`, gates, and `Cache-Control: no-store` |

## Security Boundary

- No auth/secret/token added
- No DB read/write added
- No external status read added
- No POST endpoint added
