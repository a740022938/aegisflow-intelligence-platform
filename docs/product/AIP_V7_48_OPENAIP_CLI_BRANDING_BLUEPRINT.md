# AIP v7.48 — OpenAIP CLI Branding Blueprint

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P1

---

## 1. Objective

Replace the legacy `AGI Production Command Center` branding in the `aip` CLI homepage with **OpenAIP / AIP** branding. The `AGI` prefix is permitted only as a historical note, not as the primary brand identity.

## 2. Branding Rules

- CLI homepage header must show **OpenAIP** or **AIP Command Center**
- `AGI Production Command Center` must be **removed** from the main banner
- `AGI` may appear only in:
  - Historical/transition notes
  - Internal package names (e.g., `agi-model-factory` in package.json)
  - Backward-compatible config keys
- All user-facing text must prefer **AIP** or **OpenAIP**

## 3. CLI Banner

### 3.1 Primary Banner (ASCII, full width)

```
   ____  ____  _____ _   _    _    ___ ____  
  / __ \|  _ \| ____| \ | |  / \  |_ _|  _ \ 
 | |  | | |_) |  _| |  \| | / _ \  | || |_) |
 | |__| |  __/| |___| |\  |/ ___ \ | ||  __/ 
  \____/|_|   |_____|_| \_/_/   \_\___|_|    

              O P E N A I P
```

### 3.2 Narrow Terminal Fallback

When terminal width < 60 characters:

```
OPENAIP
AIP Command Center
```

### 3.3 No-Banner Mode

When `--no-banner` or `AIP_NO_BANNER=1`:

- No ASCII art
- Display only: `AIP CLI v{version}` followed by command list

## 4. Color Gradient Strategy (Phase 1)

First version uses **per-line gradient**, not per-character.

| Line | Color |
|------|-------|
| Banner line 1 | Bright Cyan |
| Banner line 2 | Cyan |
| Banner line 3 | Blue-Cyan |
| Banner line 4 | Green-Cyan |
| Banner line 5 | Green |
| `OPENAIP` line | Bright Green or Cyan |

### 4.1 Command Section Colors

| Element | Color |
|---------|-------|
| Section headers | Cyan |
| Safe/readonly commands | Green |
| High-risk commands (restart, repair source) | Yellow |
| Forbidden/failed/blocked | Red |
| Paths, descriptions, tips | Gray |
| Normal commands | White |

## 5. Fallback / Compatibility

| Flag/Env | Behavior |
|----------|----------|
| `--plain` | No color, no complex styling, minimal banner |
| `--no-color` | Disable all ANSI color codes |
| `--ascii` | ASCII banner only, English fallback |
| `--no-banner` | Hide banner, only version line + commands |
| `NO_COLOR=1` | Equivalent to `--no-color` |
| `AIP_NO_BANNER=1` | Equivalent to `--no-banner` |

## 6. Homepage Status Lines

After the banner, display:

```
AIP CLI v{version}
Track: v7.48 Local RC Candidate
Project: {cwd}
Git: {branch} @ {HEAD} / {CLEAN|DIRTY}
Mode: SAFE / Stage C DISABLED / Feature Flag OFF
Release: Local RC candidate / No tag / No GitHub Release
```

- Git info is read-only
- If Git unavailable, display `Git: unavailable` — do not fail

## 7. High-Risk Command Annotations

- `aip restart`: must show yellow, annotated as requiring human confirmation
- `aip gateway restart`: must show yellow, annotated as requiring human confirmation, no auto taskkill
- `aip repair source`: must show yellow/red, blocked by default, requires explicit CONFIRM text
- Do NOT display high-risk commands as green safe commands

## 8. Migration Path

1. Create `apps/aip-cli/src/banner.ts` for banner rendering logic
2. Update `apps/aip-cli/src/index.ts` to use new banner
3. Preserve all existing flags (`--plain`, `--no-color`, `--ascii`)
4. Add `--no-banner` flag
5. Add `NO_COLOR` and `AIP_NO_BANNER` env var support
6. Remove all `AGI Production Command Center` strings from CLI output
7. Verify in PowerShell with codepage 936
