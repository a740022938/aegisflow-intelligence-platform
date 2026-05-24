# OpenAIP v8 i18n Final Gap Fix + Product Shell Seal Report

## Summary

Closed the remaining i18n gaps in the v8 readonly center suite: Command Center tagline/safety/registry/migration labels, center card roles/items, Execution Gateway safety badges, and the browser document title. All strings are now sourced from `openAipv8Copy.ts` with zh/en pairs.

## Changes

| File | Δ | Description |
|------|---|-------------|
| `apps/web-ui/src/pages/openAipv8Copy.ts` | +112 lines (new) | Full zh/en i18n dictionary: commandTagline, safetyPreamble, extendedSafetyItems, registryLabels, migrationStatusLabels, nextPhase, centerRoles (9 centers), centerItems (9 centers), globalSafetyBadges, noActionBadges |
| `apps/web-ui/src/pages/OpenAIPv8CommandCenterPreview.tsx` | 86 ins / 202 del | Rewrote to use `copy.*` keys for all display strings; removed ~200 lines of hardcoded English |
| `apps/web-ui/src/pages/OpenAIPv8ExecutionGatewayPreview.tsx` | 6 ins / 7 del | Replaced hardcoded English status badges with `copy.globalSafetyBadges.map` and `copy.noActionBadges.map` |
| `apps/web-ui/index.html` | 1 ins / 1 del | Title: `天枢智治平台 (OpenAIP) - Web UI` → `OpenAIP · Console` |
| `apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` | 50 ins / 5 del | Added 5 i18n test blocks (English tagline, localized card titles/roles, Execution Gateway badges, document title); fixed 4 stale assertions |

## Verification

- **Typecheck**: PASS
- **Lint**: PASS
- **Build**: PASS (8.94s, chunk size warning only)
- **npm test (full suite)**: 9/9 PASS
- **Route smoke test**: 108/108 PASS
- **Safety grep**: No execution enablement, no Gate/Stage C/auth/DB changes, no API calls

## Seal

All product-shell strings in the v8 readonly center suite are now properly localized. The document title no longer carries the old Chinese brand. The product shell is sealed.
