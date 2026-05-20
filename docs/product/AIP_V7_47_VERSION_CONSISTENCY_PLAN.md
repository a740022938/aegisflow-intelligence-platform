# AIP v7.47 — Version Consistency Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P2

---

## 1. Objective

Fix the version mismatch between documentation, all `package.json` files, UI footer, and CLI version. The D0 sweep found that code reports `7.3.1` everywhere while documents correctly say `v7.46 Pre-RC`.

## 2. Current State

| File | Reports | Must Report |
|------|---------|-------------|
| `package.json` (root) | `7.3.1` | `7.46.0` |
| `apps/aip-cli/package.json` | `7.3.1` | `7.46.0` |
| `apps/local-api/package.json` | `7.3.1` | `7.46.0` |
| `apps/web-ui/package.json` | `7.3.1` | `7.46.0` |
| `apps/web-ui/src/constants/appVersion.ts` | `v7.3.1` | `v7.46.0` |
| `apps/web-ui/src/constants/appMeta.ts` | uses APP_VERSION | auto-fixed |
| `apps/web-ui/src/components/Layout.tsx:382` | `AIP {APP_VERSION}` | auto-fixed |
| CLI version (`aip version`) | reads aip-cli/package.json | auto-fixed |
| Docs (START_HERE, README, etc.) | `v7.46 Pre-RC` | `v7.46 Pre-RC` (correct) |

## 3. Migration Plan

### 3.1 Version Bump Order

1. Root `package.json` — `"version": "7.3.1"` → `"version": "7.46.0"`
2. `apps/aip-cli/package.json` — `"version": "7.3.1"` → `"version": "7.46.0"`
3. `apps/local-api/package.json` — `"version": "7.3.1"` → `"version": "7.46.0"`
4. `apps/web-ui/package.json` — `"version": "7.3.1"` → `"version": "7.46.0"`
5. `apps/web-ui/src/constants/appVersion.ts` — `'v7.3.1'` → `'v7.46.0'`

### 3.2 Auto-Fixed (no change needed)

- CLI `aip version` reads dynamically from `apps/aip-cli/package.json` via `getCliVersion()`
- UI footer `AIP {APP_VERSION}` reads from `appVersion.ts`
- `appMeta.ts` references `APP_VERSION` — auto-fixed

### 3.3 What NOT to Change

- Do NOT change `appMeta.ts` `releaseUrl` pointing to v7.3.0 — that's the actual last release tag
- Do NOT change legacy files referencing "v7.3.x" or "v7.3.1" in historical context
- Do NOT change CostRouting.tsx engine_version string — that's a UI display for routing engine, not AIP version

### 3.4 Verification

After bump, verify:

```powershell
aip version
# Output: AIP CLI v7.46.0

node -e "console.log(require('./package.json').version)"
# Output: 7.46.0

node -e "console.log(require('./apps/aip-cli/package.json').version)"
# Output: 7.46.0

node -e "console.log(require('./apps/local-api/package.json').version)"
# Output: 7.46.0

node -e "console.log(require('./apps/web-ui/package.json').version)"
# Output: 7.46.0
```

## 4. Docs Consistency Check

After version bump, verify all product docs:
- `START_HERE.md` — check "Current Version" table (line 23)
- `README.md` — check any version references
- `AIP_V7_46_*` docs — already reference v7.46 correctly
- New v7.47 docs — must reference v7.47

## 5. Safety

- No stage-c enablement
- No feature flag toggle
- No DB write
- No service restart
- Version bump only — no functional changes
