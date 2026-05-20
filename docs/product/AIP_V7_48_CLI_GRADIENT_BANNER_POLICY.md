# AIP v7.48 — CLI Gradient Banner Policy

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P1

---

## 1. Objective

Define the color gradient policy for the OpenAIP ASCII banner in the `aip` CLI. The gradient must be visually appealing on modern terminals while degrading gracefully on Windows PowerShell, codepage 936, and CI environments.

## 2. Gradient Model: Per-Line (Phase 1)

Phase 1 uses a **per-line linear gradient**. No per-character gradient.

The 5-line ASCII art + 1-line "OPENAIP" label each receive one color from the gradient sequence:

```
Line 1: Bright Cyan    \x1b[96m
Line 2: Cyan           \x1b[36m
Line 3: Blue-Cyan      \x1b[36;44m (cyan text on blue bg, or custom RGB)
Line 4: Green-Cyan     \x1b[32;46m (green text on cyan bg, or custom RGB)
Line 5: Green          \x1b[32m
OPENAIP: Bright Green  \x1b[92m or Cyan \x1b[36m
```

## 3. ANSI Compatibility

### 3.1 Supported Colors

- `\x1b[32m` — Green (8-color, widely compatible)
- `\x1b[36m` — Cyan (8-color, widely compatible)
- `\x1b[92m` — Bright Green (16-color, widely compatible)
- `\x1b[96m` — Bright Cyan (16-color, widely compatible)

### 3.2 Colors to AVOID (Phase 1)

- True color / 24-bit RGB (`\x1b[38;2;R;G;Bm`) — incompatible with Windows legacy console
- Blinking text — accessibility concern
- Reverse video — confusing on dark/light themes

## 4. Automatic Degradation

### 4.1 Detection

Check in order:

1. If `NO_COLOR` env is set → no color
2. If `--no-color` or `--plain` → no color
3. If `TERM` is `dumb` or `unknown` → no color
4. If Windows PowerShell and `$Host.UI.RawUI.ForegroundColor` is available → safe ANSI
5. Fallback → no color

### 4.2 Degradation Chain

```
Full gradient (6-line per-line color)
  → Flat single color (all lines same color, e.g., cyan)
    → No color (plain ASCII)
      → No banner (hide banner, show version line only)
```

Each step is triggered by terminal capability detection or explicit flag.

## 5. Explicit Override Flags

| Flag | Behavior |
|------|----------|
| `--plain` | No color, no complex styling |
| `--no-color` | Disable all ANSI color codes |
| `--ascii` | ASCII-art only, English fallback |
| `--no-banner` | Hide banner entirely |
| `NO_COLOR=1` | Equivalent to `--no-color` |
| `AIP_NO_BANNER=1` | Equivalent to `--no-banner` |

## 6. Testing Matrix

| Environment | Expected Behavior |
|-------------|------------------|
| Windows Terminal | Full gradient |
| VS Code integrated terminal | Full gradient |
| Windows PowerShell 5.1 (codepage 936) | Degraded to flat color or no color |
| Windows Command Prompt | No color, plain ASCII |
| CI / GitHub Actions | No color (TERM=dumb) |
| SSH / remote PowerShell | Depends on TERM setting |

## 7. Implementation Notes

- Banner art and colors must be in a single dedicated file (`banner.ts`)
- No external dependencies for color detection
- Color detection must be synchronous (runs before CLI output)
- Gradient must not slow down CLI startup
