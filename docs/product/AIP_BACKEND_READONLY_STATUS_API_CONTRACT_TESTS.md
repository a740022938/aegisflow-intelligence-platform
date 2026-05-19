# AIP Backend Readonly Status API Contract Tests

> **Phase:** v7.31.0-P2
> **Status:** IMPLEMENTED (part of P2/P3/P4 acceleration pack)
> **Date:** 2026-05-20

## Overview

Contract tests for the 4 readonly GET endpoints in `apps/local-api/src/runtime/readonly-status.ts`. Tests verify schema shape, security properties, header behavior, and POST blocking.

## Test Coverage

| Category | Assertions | File |
|----------|-----------|------|
| Module export | 2 | `runtime-readonly-status.test.ts` |
| Status schema | 12 | `runtime-readonly-status.test.ts` |
| Readiness schema | 11 | `runtime-readonly-status.test.ts` |
| Gates schema | 9 | `runtime-readonly-status.test.ts` |
| Blockers schema | 7 | `runtime-readonly-status.test.ts` |
| Route registration | 5 | `runtime-readonly-status.test.ts` |
| No POST routes | 1 | `runtime-readonly-status.test.ts` |
| No secret fields (status) | 5 | `runtime-readonly-status.test.ts` |
| No secret fields (readiness) | 5 | `runtime-readonly-status.test.ts` |
| No secret fields (gates) | 5 | `runtime-readonly-status.test.ts` |
| No secret fields (blockers) | 5 | `runtime-readonly-status.test.ts` |
| Cache-Control header (status) | 1 | `runtime-readonly-status.test.ts` |
| Cache-Control header (readiness) | 1 | `runtime-readonly-status.test.ts` |
| Cache-Control header (gates) | 1 | `runtime-readonly-status.test.ts` |
| Cache-Control header (blockers) | 1 | `runtime-readonly-status.test.ts` |

Total: **16 tests** (all pass)

## Test Framework

- **Framework:** Vitest v3.2.4 (existing)
- **Test file:** `apps/local-api/src/__tests__/runtime-readonly-status.test.ts`
- **No new dependencies added**

## Key Test Patterns

### Schema validation
Tests verify each endpoint returns expected contract fields including `contractVersion`, `readonly`, `stageCEnabled`, etc.

### Security validation
- No POST routes are registered by the module
- Response payloads do not contain `token`, `apiKey`, `password`, `privateKey`, or `credential`

### Header validation
All endpoints set `Cache-Control: no-store` response header
