# OPENAIP_V8_OPTIMIZATION_EXECUTION_PACK

## Objective
在不触碰高风险边界（Gate/Stage C/Auth/DB/release/restart）的前提下，持续提升 AIP 的稳定性、可维护性、可信状态展示和执行效率。

## Optimization Principles
- readonly-first
- contract-first
- registry-first
- evidence-first
- small batch + reversible
- reduce human fatigue

## Phase O1: Baseline Triage (Readonly)
Target:
- 建立 Must Fix / Should Fix / Later 三层问题清单。

Actions:
- 盘点 CLI 状态一致性、文档分散度、示例与契约覆盖率、测试缺口。
- 建立统一的优化看板文件。

Acceptance:
- 有明确优先级和 owner 字段。
- 不引入运行时变更。

## Phase O2: Contract Consolidation
Target:
- v8 centers/kernels/registry/policy/task/audit 契约闭环。

Actions:
- 对齐 `v8Contracts.ts` 与 docs/product/examples。
- 增加契约一致性校验（shape + semantic checks）。

Acceptance:
- contract checks 可一键运行。
- 关键语义无冲突：configured!=online!=authorized!=gateOpen。

## Phase O3: CLI Readonly Usability
Target:
- 把 v8 CLI 从“展示 stub”升级到“可审计 readonly 控制台入口”。

Actions:
- 完善 `aip agents/providers/integrations/apps/runtime` 的 `list/status/help`。
- 输出统一字段：name/kind/lifecycle/permission/source/safety。

Acceptance:
- 命令输出稳定、测试覆盖、无文件写入副作用。

## Phase O4: Readonly Control Plane Preview (Optional)
Target:
- 单页 hidden preview，用于跨中心状态总览。

Actions:
- 仅在低风险范围内新增 hidden route。
- 明确显示安全边界文本：Gate CLOSED, Stage C disabled。

Acceptance:
- 不改 sidebar 导航。
- 不加执行按钮，不写配置。

## Phase O5: Evidence and Receipt Automation
Target:
- 降低人工回执成本。

Actions:
- 标准化 receipt 模板字段。
- 提供验证命令包（status/typecheck/lint/build/smoke/safety grep）。

Acceptance:
- 每次批次可复用同一模板。
- 关键信息自动可复制。

## Priority Backlog
Must Fix:
- CLI 输出契约与示例契约强绑定
- 契约语义校验（enabled/execution、authorized/gateOpen）
- 统一 final receipt 字段

Should Fix:
- hidden readonly command center preview
- docs index 与路线图互链完整性检查

Later:
- 高风险执行面（Gate/Stage C/runtime mutation）仅保留 plan-only

## Verification Standard (each batch)
- git status -sb
- npm --prefix apps/aip-cli run build (if CLI changed)
- node --test apps/aip-cli/tests/project-root-and-stubs.test.mjs (if CLI changed)
- npm run typecheck
- npm run lint
- npm run build
- npm test
- git diff --check

## Stop Conditions
- 任何需要 restart/DB/Gate/Stage C/Auth/release/restore 的动作
- 测试失败且无法在安全范围内修复
- 新增风险行为（token/jwt/localStorage/sessionStorage/exec mutation）
