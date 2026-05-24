# OpenAIP v8 Sidebar Brand & i18n Mega Polish Report

## Baseline

| Field | Value |
|-------|-------|
| Baseline HEAD | `21f77cd` |
| Base commit message | `feat(ui): promote OpenAIP v8 readonly centers sidebar entries` |
| Working tree before | Dirty (16 modified + 2 untracked) |
| Branch | `main` |

## Brand Residue Audit

| Term | File | Classification |
|------|------|---------------|
| `AG` (logo initials) | `Layout.tsx` | Replaced with SVG node icon |
| `天枢智治平台（OpenAIP社区版）总览` | `i18n.ts` dashboard subtitle zh | Replaced |
| `OpenAIP (AIP Community Edition) Overview` | `i18n.ts` dashboard subtitle en | Replaced |
| `AIP {APP_VERSION}` footer | `Layout.tsx` | Replaced with `OpenAIP v8 Readonly MVP` |
| `getAipTrackLabel / getAipStageCStatusLabel / getAipFeatureFlagLabel` | `Layout.tsx` footer imports | Removed, replaced with hardcoded safety status |
| `供应商管理` (sidebar) | `i18n.ts`, `menu-registry.ts` | Changed to `供应商管理中心` |
| `AIP 版本` | `Layout.tsx` footer | Removed |

## Logo Change Summary

- **Before**: `<div className="topbar-logo">AG</div>`
- **After**: Abstract OpenAIP node icon rendered via inline SVG
  - Central node + 3 connected satellite nodes
  - Green/cyan gradient background
  - Dark-theme compatible
  - No letters, no font dependency, no external assets
  - Accessible label: `OpenAIP control plane`

## Sidebar IA Changes

| Area | Before | After |
|------|--------|-------|
| Group label (zh) | `OpenAIP v8 指挥中心` | `OpenAIP v8 控制平面` |
| Group label (en) | `OpenAIP v8 指挥中心` (was Chinese) | `OpenAIP v8 Control Plane` |
| Provider Manager (zh) | `供应商管理` | `供应商管理中心` |
| Legacy Connector | In bottom "Legacy" group | Moved into main v8 group below memory |
| Sidebar order | Legacy in bottom group | All 11 entries in v8 group |

## i18n Consistency Changes

### Top brand subtitle
- zh: `OpenAIP 社区版 · 控制台`
- en: `OpenAIP Community Edition · Console`

### Dashboard title
- zh: `OpenAIP 控制台`
- en: `OpenAIP Console`

### Page titles (shared via `openAipv8Copy.ts`)
All 10 v8 centers now use canonical zh/en titles from the shared copy module.

### Safety badges (shared)
- `只读预览` / `Readonly Preview`
- `无运行时突变` / `No runtime mutation`
- `大门关闭` / `Gate CLOSED`
- `C 阶段已禁用` / `Stage C disabled`
- `注册表支持的数据` / `Registry-backed data`
- `不执行` / `No execution`

### Page-specific no-action badges
- Agent: `不调度智能体` / `No agent dispatch`
- Task: `不执行任务` / `No task execution`
- Audit: `无审计写入` / `No audit write`
- Policy: `无策略变更` / `No policy mutation`
- Execution Gateway: `无执行控制` / `No execution controls`
- Provider: `无供应商切换` / `No provider switching`
- Integration: `无连接器动作` / `No connector actions`
- Local Apps: `无本地应用启动` / `No local app launch`
- Memory: `无记忆写入` / `No memory write` + `无索引任务` / `No indexing job`

## Footer Copy Change

| Before | After |
|--------|-------|
| `AIP {APP_VERSION}` | `OpenAIP v8 Readonly MVP` |
| `Build {BUILD_DATE}` | `Core {APP_VERSION} · Build {BUILD_DATE}` |
| `{track} · {stageC} · {featureFlag}` | `Gate CLOSED · Stage C disabled` |

## Tests Updated

- `v8-center-readonly-route-smoke.test.mjs`: Added 6 new test cases:
  1. Topbar brand subtitle uses OpenAIP wording
  2. No AG initials in logo
  3. Footer uses OpenAIP v8 Readonly MVP display wording
  4. v8 product copy has canonical localized titles and safety badges
  5. Old Chinese v8 title variants absent from visible files
  6. Updated Command Center link/safety assertions
- All existing route/sidebar tests preserved.

## Verification Results

| Check | Result |
|-------|--------|
| `git diff --check` | PASS |
| Route smoke (100/100) | PASS |
| Project root + stubs | PASS |
| Registry validators | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm test --silent` | PASS (9/9) |
| Safety grep | PASS — no risky hits |

## Visual Smoke

Screenshots captured:
- `command-center-zh.png`
- `execution-gateway-zh.png`
- `provider-manager-zh.png`

Location: `docs/product/screenshots/openaip-v8-sidebar-brand-i18n-mega-polish/`

## Safety Result

- Gate remains CLOSED
- Stage C remains disabled
- No runtime mutation
- No DB/memory DB/vector DB writes
- No indexing jobs
- No Auth/Gate changes
- No connector/provider/local-app/API calls
- No release/tag/restore
- No restart/taskkill
- No execution enablement
- All changed files are UI source/copy/label/icon only

## Final Verdict

**OPENAIP_V8_SIDEBAR_BRAND_I18N_MEGA_POLISH_READY_WITH_GATE_CLOSED**
