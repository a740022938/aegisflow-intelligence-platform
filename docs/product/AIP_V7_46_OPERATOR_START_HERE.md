# AIP v7.46 — Operator Start Here

**Status:** P3 Final
**Date:** 2026-05-20

---

This is an operator-specific quickstart for users who already have the project running.

## 1. Check Your Location

```powershell
aip where
```

This shows: project root, git branch, HEAD commit, and working tree state.

## 2. Check Safety

```powershell
aip safe-status
```

Verify: Stage C is `DISABLED`, Feature Flag is `OFF`, all runtime is `BLOCKED`.

## 3. Daily Commands

```powershell
aip                    # Show command center
aip health             # Check API health
aip doctor             # Quick diagnostics
aip repair plan        # Generate repair plan (readonly)
aip receipt template   # Generate receipt template
```

## 4. Operator Console (Web UI)

Open the web UI with `aip open` or navigate to `http://localhost:5173`.

The Operator Console pages are available at these direct URLs:

- `/operator-console-readonly-preview`
- `/operator-console-registry-preview`
- `/operator-checklist-evidence-preview`
- `/operator-console-seal-candidate-preview`
- `/operator-runtime-readiness-console-preview`
- `/operator-e2e-flow-preview`
- `/operator-usability-drill-preview`

## 5. Restore Point Pack (Plan-Only)

```text
/restore-point-pack-preview
```

10 items across design, policy, and safety. All plan-only. No restore execution.

## 6. Handoff Pack

```text
/handoff-pack-preview
```

Release evidence matrix + handoff pack registry + checker.

## 7. What NOT To Do

- Do NOT enable Stage C
- Do NOT toggle feature flag
- Do NOT execute `scripts/restore.mjs` without `--execute` and CONFIRM
- Do NOT restart services unless authorized
- Do NOT create tags or releases
