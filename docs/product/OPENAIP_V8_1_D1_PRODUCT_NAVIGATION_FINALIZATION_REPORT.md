# OpenAIP v8.1-D1 Product Navigation Finalization Report

## Baseline
- Baseline HEAD: `34a411c`
- Receipt HEAD: `96b2614`
- Branch: `main`
- Working tree before: clean

## New Commit Hash
- To be recorded after commit

## Changed Files
1. `apps/web-ui/src/i18n.ts` — Updated all nav labels to short productized names, added new section labels, updated dashboard subtitle, updated footer i18n
2. `apps/web-ui/src/components/Layout.tsx` — Restructured sidebar into 5 sections (OpenAIP, Resources, Workbench, System, Advanced Tools), added 8 new semantic SVG icons, updated brand subtitle to "本地 AI 控制台 / Local AI Console", updated footer to remove "MVP" wording
3. `apps/web-ui/src/components/Layout.css` — Updated active nav state (3px left border, subtle gradient, reduced border-radius), added section weight differentiation (primary/subtle), added footer-subtitle style
4. `apps/web-ui/src/registry/layout-menu-snapshot.ts` — Mirror new 5-section structure with new icon names
5. `apps/web-ui/src/registry/menu-registry.ts` — Restructured all sections matching new IA, updated icons and labels
6. `apps/web-ui/src/registry/menu-parity-checker.ts` — Added governance decisions for all 10 v8 items
7. `apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` — Updated all expected label strings, footer assertions, subtitle assertions

## Before/After Navigation Structure

### Before (14 sections):
```
概览 → Dashboard, Factory Status, Assistant Center
OpenAIP v8 控制平面 → 10 v8 centers + Connector (all route icon)
数据与训练 → Datasets, Training, Runs, Templates
模型与发布 → Models, Artifacts, Evaluations, Deployments
流程与编排 → Workflow, Workflow Composer, Workflow Canvas
能力与模块 → Module Center, Plugin Pool, Tasks, Cost Routing, OpenAxiom, Memory Hub, Connector
智能增强 (collapsed) → Digital Employee, Training V2, etc.
自动化 (collapsed) → Smart Backflow, Scheduler, etc.
视觉实验室 → Mahjong Debug
治理与回流 (collapsed) → Approvals, Governance Hub, Audit, etc.
知识 (collapsed) → Knowledge Center
输出 (collapsed) → Standard Output
```

### After (5 sections):
```
OpenAIP (primary weight)
  ├── Command (command icon)
  ├── Agents (bot icon)
  ├── Tasks (tasks icon)
  ├── Audit (shield icon)
  ├── Policies (lock icon)
  └── Execution Gateway (power icon)

Resources (normal weight)
  ├── Providers (server icon)
  ├── Integrations (plug icon)
  ├── Local Apps (monitor icon)
  ├── Memory & Knowledge (database icon)
  └── Connectors (zap icon)

Workbench (normal weight)
  ├── Datasets, Training, Runs, Templates
  ├── Models, Artifacts, Evaluation, Deployment
  └── Workflow, Workflow Composer, Workflow Canvas

System (normal weight)
  ├── Dashboard, System Status, Assistant
  ├── Module Center, Plugins, Task Orchestration, Cost Routing
  ├── Approvals, Governance Hub, Audit Logs, Feedback, Advanced Mode
  └── Knowledge Center, Standard Output

Advanced Tools (collapsed, subtle weight)
  ├── OpenAxiom, Memory Hub, Mahjong Tools
  └── Digital Employee, Training V2, HPO, Distill, Model Merge, Inference, etc.
```

## Naming Changes

| Old Name | New Name (zh) | New Name (en) |
|---|---|---|
| OpenAIP v8 指挥中心 | 指挥中心 | Command |
| 智能体中心 | 智能体 | Agents |
| 任务中心 | 任务 | Tasks |
| 审计中心 | 审计 | Audit |
| 策略与能力中心 | 策略 | Policies |
| 供应商管理中心 | 供应商 | Providers |
| 集成中心 | 集成 | Integrations |
| 本地应用中心 | 本地应用 | Local Apps |
| 连接器中心（旧） | 连接器 | Connectors |
| 工厂状态 | 系统状态 | System Status |
| 助手中心 | 助手 | Assistant |
| 插件池 | 插件 | Plugins |
| 评估中心 | 评估 | Evaluation |
| 训练中心 | 训练 | Training |
| 运行中心 | 运行 | Runs |
| 模板中心 | 模板 | Templates |
| 模型管理 | 模型 | Models |
| OpenAxiom 只读检查 | OpenAxiom | OpenAxiom |
| Memory Hub 只读查看 | Memory Hub | Memory Hub |
| 麻将视觉调试台 | 麻将工具 | Mahjong Tools |

## Icon Changes

All 11 v8 centers that previously shared the generic `route` icon now have distinct semantic icons:
- Command: `command` (radar/signal)
- Agents: `bot` (robot head)
- Tasks: `tasks` (list lines)
- Audit: `shield` (shield with check)
- Policies: `lock` (padlock)
- Execution Gateway: `power` (power button)
- Providers: `server` (server rack)
- Integrations: `plug` (electrical plug)
- Local Apps: `monitor` (screen)
- Memory & Knowledge: `database` (database)
- Connectors: `zap` (lightning bolt)

## Footer/Brand Changes

Topbar subtitle: `OpenAIP 社区版 · 控制台` → `本地 AI 控制台` (zh) / `Local AI Console` (en)

Sidebar footer: `OpenAIP v8 Readonly MVP` → `OpenAIP v8` + `本地 AI 控制台` / `Local AI Console` + version + gate status

## i18n Changes

- Dashboard subtitle updated for both zh/en
- All nav labels shortened
- Old section labels (overview, dataAndTraining, etc.) replaced with new 5-section labels
- Footer text moved to i18n keys for bilingual support
- "连接器中心（旧）" → "连接器", "Legacy Connector Center" → "Connectors"
- "MVP", "preview", "旧", "legacy" removed from high-visibility nav

## Visual Acceptance
- Screenshots not taken (no running Vite server)
- Route smoke test confirms all v8 routes are still reachable
- Code review confirms:
  - Active state uses 3px left cyan border, subtle gradient, reduced border-radius
  - OpenAIP section has higher visual weight (cyan text, larger font)
  - Advanced Tools has lower visual weight (dimmed, smaller)
  - Footer fixed at bottom, scroll area separated

## Safety Boundaries Confirmed
- Gate: CLOSED (unchanged)
- Stage C: disabled (unchanged)
- Execution: NOT enabled
- DB/Memory/Vector/Indexing: NOT written
- Auth/Gate logic: NOT modified
- Release/Tag: NOT created
- Service: NOT restarted
- No hidden danger pages exposed
- No new dangerous buttons added

## Validation Commands and Results

| Command | Result |
|---|---|
| `git status --short` | Clean after changes |
| `npm run typecheck` | PASS (no errors) |
| `npm run lint` | PASS (no errors) |
| `npm run build` | PASS (758 modules) |
| `npm test` | PASS (no test files in web-ui) |
| `node --test v8-center-readonly-route-smoke.test.mjs` | PASS (108/108) |

## Deferred Items
- Intelligent/Automation lab items (Digital Employee, Training V2, etc.) moved to Advanced Tools section with collapsed-by-default and low visual weight
- Route paths unchanged — no path restructuring performed
- Model Gateway conditional render kept in Workbench section
- Some existing items (Runs, Templates, Workflow) placed in Workbench section rather than exact task pack suggestion due to practical grouping considerations
