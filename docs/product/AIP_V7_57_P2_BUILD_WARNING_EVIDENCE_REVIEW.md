# AIP v7.57-P2 Build Warning Evidence Review

**Date:** 2026-05-21
**Phase:** P2
**Pre-HEAD:** `56d1fe8`
**Status:** Build warning evidence captured; non-blocking
**Verdict:** `V7_57_P2_BUILD_WARNING_EVIDENCE_REVIEW_READY_NON_BLOCKING`

---

## 1. Purpose

Capture, classify, and document the pre-existing build chunk-size warning
without changing source code, build config, or runtime behavior.

---

## 2. Build Command

```powershell
pnpm run build
```

---

## 3. Build Result

| Property | Value |
|---|---|
| Build exit code | 0 ✅ PASS |
| Build duration | 9.14s |
| Chunks generated | ~120 |
| Warnings | 1 (chunk-size) |

## 4. Warning Evidence

```
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

### Chunks exceeding 500 kB

| Chunk | Size (min) | Size (gzip) | Threshold |
|---|---|---|---|
| `GovernanceCenter-Dl3qqZfx.js` | **930.88 kB** | 68.67 kB | 500 kB |

Only one chunk exceeds the default Vite 500 kB threshold. No other warnings.

---

## 5. Top 10 Largest Chunks

| Rank | Chunk | Raw Size | Gzip |
|---|---|---|---|
| 1 | GovernanceCenter | 930.88 kB | 68.67 kB |
| 2 | index (main entry) | 467.18 kB | 128.35 kB |
| 3 | center-access-registry | 419.06 kB | 56.38 kB |
| 4 | AdvancedModeReadonly | 308.32 kB | 31.59 kB |
| 5 | WorkflowComposer | 211.65 kB | 47.48 kB |
| 6 | chart-vendor | 183.15 kB | 59.68 kB |
| 7 | CostRouting | 176.64 kB | 22.54 kB |
| 8 | GovernanceHub | 90.70 kB | 11.51 kB |
| 9 | FactoryStatus | 71.98 kB | 11.19 kB |
| 10 | OpenAxiomReadonly | 72.34 kB | 10.70 kB |

---

## 6. Classification

See `AIP_V7_57_P2_BUILD_WARNING_CLASSIFICATION.md` for full classification.

**Classification:** `NON_BLOCKING_PRE_EXISTING` + `NEEDS_FUTURE_OPTIMIZATION`
