# AIP v7.43 — Command / Repair / Memory Bridge Blueprint

**Status:** Blueprint / D1
**Date:** 2026-05-20
**Baseline:** AIP v7.42 Final Seal

---

## 1. Purpose

Surface the Command Center, Repair plan-only, and Memory knowledge capabilities from v7.41/v7.42 into the Operator Console as readonly bridge registries.

## 2. Command Bridge

Showcase available CLI commands:

- `aip`
- `aip where`
- `aip safe-status`
- `aip receipt template`
- `aip doctor encoding`
- `aip check full`

All displayed as readonly reference. No execution from UI.

## 3. Repair Bridge

Showcase repair commands with safety annotations:

- `aip repair` (plan-only by default)
- `aip repair check`
- `aip repair plan`
- `aip repair command-pack`
- `aip repair restore-point`

Annotations:

- `default = plan-only`
- `source restore = blocked unless explicitly authorized`
- `full restore = forbidden by default`

## 4. Memory Bridge

Showcase memory knowledge:

- Current verified baseline
- v7.25–v7.40 verified sequence
- Pre-v7.25 historical confidence
- v7.43 future reference warning
- Desktop task packs = intent/input evidence only

## 5. Delivery

- `apps/web-ui/src/registry/operator-command-bridge-registry.ts`
- `apps/web-ui/src/registry/operator-repair-bridge-registry.ts`
- `apps/web-ui/src/registry/operator-memory-bridge-registry.ts`
- `apps/web-ui/src/registry/operator-bridge-validator.ts`

## 6. Safety

All bridge registries are readonly. No runtime execution, no repair execution, no memory writes.
