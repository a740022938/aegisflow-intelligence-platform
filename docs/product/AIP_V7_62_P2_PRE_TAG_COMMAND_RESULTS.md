# AIP v7.62-P2 Pre-Tag Command Results

**Phase:** v7.62-P2
**Date:** 2026-05-21

---

## Baseline Commands

```text
$ git status --short
 M apps/aip-cli/src/index.ts
 M apps/local-api/src/index.ts
 M apps/web-ui/src/App.tsx
 M apps/web-ui/src/components/Layout.tsx
 M docs/product/AIP_V7_59_P5_RECEIPT.md
 M docs/product/AIP_V7_60_P1_RECEIPT.md
 M docs/product/AIP_V7_60_P2_RECEIPT.md
 M docs/product/AIP_V7_60_P4_RECEIPT.md
 M docs/product/AIP_V7_60_P5_RECEIPT.md
 M docs/product/AIP_V7_61_D1_REPORT.md
?? apps/local-api/src/model-gateway/
?? apps/web-ui/src/pages/ModelGateway.css
?? apps/web-ui/src/pages/ModelGateway.tsx
?? docs/superpowers/
?? taskpack_v759_p3_p4.txt
?? taskpack_v759_p5.txt
?? taskpack_v760_d1.txt
?? taskpack_v760_p1.txt

$ git branch --show-current
main

$ git rev-parse HEAD
e6be1636bf16a758bebddf7d70e3f6483f8990ff

$ git tag --points-at HEAD
(no output)
```

## Validation Commands

```text
$ pnpm run typecheck
(exit 0 — no output, no errors)

$ pnpm run build
✓ built in 13.87s
742 modules
GovernanceCenter 930.88 kB (1 non-blocking warning)

$ pnpm run lint
(exit 0 — no warnings)

$ git diff --check
warning: LF will be replaced by CRLF (10 files, pre-existing)
(no whitespace errors)
```

## Test Results

```text
$ pnpm test
=== AIP v7.0.0 Smoke Tests ===
PASS: health
PASS: auth-login
PASS: tasks
PASS: queue-recovery
PASS: worker-timeout
PASS: openclaw-circuit
PASS: workflow-minimal
PASS: plugin-registry
PASS: db-diagnostics
=== Results: 9 passed, 0 failed ===
```

## Safety Checks

```text
$ git diff .env.local
(no output — no changes)

$ git log --oneline -5
e6be163 docs(product): refresh final release readiness decision
36240e1 fix(ui): revert no-effect governance validator lazy load
78e0d12 feat(ui): lazy load governance validator helpers
3381fdb docs(product): inventory governance lazy load target
b20969c docs(product): blueprint governance lazy load hardening
```
