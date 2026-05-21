# AIP v7.61-P3 Build Metrics and Visual QA Evidence

**Phase:** v7.61-P3
**Status:** COLLECTED

---

## Build Metrics

| Metric | Before | After | Delta |
|---|---|---|---|
| GovernanceCenter chunk | 930.88 kB (68.67 kB gzip) | 931.39 kB (68.84 kB gzip) | +0.51 kB (+0.17 kB gzip) |
| Total modules | 740 | 740 | 0 |
| Build warnings | 1 (GovernanceCenter > 500 kB) | 1 (GovernanceCenter > 500 kB) | 0 |
| Build time | 9.20s | 10.16s / 17.72s | +0.96s / +8.52s |

## Validation Results

| Check | Result |
|---|---|
| `pnpm run typecheck` | PASS |
| `pnpm run build` | PASS |
| `pnpm run lint` | PASS (0 warnings) |
| `git diff --check` | PASS (only pre-existing CRLF warnings) |

## Visual QA

| Check | Status |
|---|---|
| Web UI running (5173) | ✅ YES — HTTP 200 |
| API running (8787) | ✅ YES — HTTP 200 |
| GovernanceCenter route | ✅ HTTP 200 |
| Dashboard route | ✅ HTTP 200 |
| Datasets route | ✅ HTTP 200 |
| PluginPool route | ✅ HTTP 200 |
| Full browser visual QA | DEFERRED — no headless browser available |
| Console errors check | DEFERRED — cannot verify from CLI |
| Hidden previews exposed | NOT CHANGED — no sidebar/nav changes |
| Stage C disabled | CONTINUED — not toggled |
| Feature flag off | CONTINUED — not toggled |
