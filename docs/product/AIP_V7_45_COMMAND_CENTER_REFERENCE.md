# AIP v7.45 — Command Center Reference

**Status:** P1 Final
**Date:** 2026-05-20

---

## CLI Commands

| Command | Purpose | Safety |
|---------|---------|--------|
| `aip` | Main CLI entry point | Readonly |
| `aip where` | Phase context (branch, HEAD, tree) | Readonly |
| `aip safe-status` | Safety state summary | Readonly |
| `aip doctor encoding` | Encoding diagnostics | Readonly |
| `aip doctor env` | Environment diagnostics | Readonly |
| `aip doctor ports` | Port diagnostics | Readonly |
| `aip doctor stage-c` | Stage C status | Readonly |
| `aip repair` | Default repair (plan-only) | Plan-only |
| `aip repair check` | Repair readiness check | Plan-only |
| `aip repair plan` | Generate repair plan | Plan-only |
| `aip repair command-pack` | Assemble command pack | Plan-only |
| `aip repair restore-point` | View restore points | Plan-only |
| `aip receipt template` | Generate receipt template | Readonly |
| `aip check full` | Full validation check | Readonly |

## Web Routes

| Route | Page | Safety |
|-------|------|--------|
| `/operator-runtime-readiness-console-preview` | Operator Console | Readonly, hidden direct |
| `/stage-c-authorization-review-pack-preview` | Auth Review Pack | Preview-only, hidden direct |
| `/operator-end-to-end-flow-preview` | E2E Flow | Readonly, hidden direct |
| `/operator-usability-drill-preview` | Usability Drill | Readonly, hidden direct |
| `/restore-point-pack-preview` | Restore Point Pack | Plan-only, hidden direct |
| `/aip-memory-knowledge-preview` | Memory Knowledge | Readonly, hidden direct |

## Validation Commands

```powershell
npm run typecheck   # TypeScript typecheck
npm test            # Smoke tests (9/9)
npm run build       # Production build
git diff --check    # Whitespace check
```

## Live Smoke Commands

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/health
Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status
```
