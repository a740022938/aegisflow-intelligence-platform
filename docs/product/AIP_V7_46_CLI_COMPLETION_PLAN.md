# AIP v7.46 — CLI Completion Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P1

---

## 1. Objective

Deliver `aip where`, `aip safe-status`, and `aip receipt template` as real, readonly CLI commands. Remove 8 ghost commands from CLI help.

## 2. Current State

From D0 review:
- 3 critical commands are documented across 7+ registries but have zero implementation
- 8 commands display in `aip` help but fall through to the default case (silent failure)
- `aip help <cmd>` only handles 9 of 25+ commands

## 3. Deliverables

### 3.1 `aip where`

Readonly command showing project location and working tree state. No API dependency. No file writes.

Output fields: AIP Home, Branch, HEAD, Working Tree, Reports path, Receipts path, Restore Points path, Config path.

### 3.2 `aip safe-status`

Readonly command showing safety posture. Prefer live API check (`GET /api/stage-c/status`); fall back to static evidence with explicit "Runtime API: unavailable" note.

Output fields: Stage C, Feature Flag, POST Runtime, DB Write, Executor, External Control, Connector Action, Repair, Memory, Authorization, Working Tree.

### 3.3 `aip receipt template`

Readonly command outputting a standard receipt template. No file writes, no file creation.

### 3.4 Ghost Command Cleanup

For each of these 8 commands, either implement as a real stub with clear "not available" message or remove from help text:

- `aip check` / `aip check full`
- `aip smoke` / `aip smoke stage-c`
- `aip seal status`
- `aip stage-c status` / `aip stage-c gate` / `aip stage-c auth-template`

## 4. Implementation Rules

- All new commands must be readonly
- No new file writes
- No new API mutations
- No new service dependencies
- `aip help <cmd>` must work for all real commands
- Help text must not contain ghost commands
- `aip restart` must have confirmation prompt matching its help text claim

## 5. Verification

```powershell
aip where
aip safe-status
aip receipt template
aip --plain
aip --no-color
aip help
aip help where
aip help safe-status
aip help receipt
```

## 6. Safety

- No stage-c enablement
- No feature flag toggle
- No DB write
- No POST runtime
- No executor
