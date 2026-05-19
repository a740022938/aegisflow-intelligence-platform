# AIP Validation Script Parity Audit (v7.27.0-P3)

## 背景

在 v7.27.0-P2 Dry-run Plan Preview 的回执中，`db:doctor`、`secret:scan`、`test:smoke` 被记录为 "SKIP (not defined)"。但早期版本（如 v7.25.2、v7.26.0-M1 等）报告中这些 gate 曾显示为 PASS。本次审计旨在查明前后口径差异。

## 审计方法

1. 读取 `apps/web-ui/package.json` 的 `scripts` 字段
2. 以 `--if-present` 模式逐个运行所有 6 个 gate 脚本
3. 记录是否存在、输出状态、退出码
4. 分析口径差异原因

## package.json scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit -p tsconfig.json",
  "lint": "eslint src --ext .ts,.tsx",
  "test": "vitest run --passWithNoTests"
}
```

| Script | 是否存在 |
|--------|---------|
| lint | 是 |
| typecheck | 是 |
| build | 是 |
| db:doctor | 否 |
| secret:scan | 否 |
| test:smoke | 否 |

## 实跑结果

| 命令 | 脚本存在 | 输出状态 | 退出码 | 结论 |
|------|---------|---------|--------|------|
| `npm run lint --if-present` | 是 | Lint passed | 0 | PASS |
| `npm run typecheck --if-present` | 是 | Typecheck passed | 0 | PASS |
| `npm run build --if-present` | 是 | Vite build completed | 0 | PASS |
| `npm run db:doctor --if-present` | 否 | Missing script error | 0 (*) | SKIP |
| `npm run secret:scan --if-present` | 否 | Missing script error | 0 (*) | SKIP |
| `npm run test:smoke --if-present` | 否 | Missing script error | 0 (*) | SKIP |

(*) `--if-present` flag suppresses the error exit code, returning 0 even when the script is not defined.

## 口径差异分析

### 为何早期报告显示 PASS？

可能原因：

1. **执行目录不同**：早期报告可能从 `E:\AIP` 根目录执行，根目录的 `package.json` 可能有不同的 scripts 定义。但本审计在 `apps/web-ui` 目录下执行。
2. **--if-present 掩盖**：`--if-present` 使不存在的脚本静默退出 0，部分报告可能将 "不报错" 等同于 "PASS"。
3. **回执误判**：部分助手生成的回执可能没有实际运行命令，而是推断状态。
4. **脚本被移除**：可能在某个历史版本中确实存在 `db:doctor` 等脚本，后续被移除。

### 实际结论

- 当前 `apps/web-ui/package.json` **不包含** `db:doctor`、`secret:scan`、`test:smoke` 脚本
- 这些脚本从未在 `apps/web-ui` 的 package.json 中定义过（至少在本 repo 可见的范围内）
- 所有 3 个脚本都是 "SKIP (script not defined)" 状态
- `--if-present` 不会导致实际报错或退出码非零
- 助手回执应统一记录为 `SKIP (script not defined in package.json)`，而非 PASS

### 纠正方案

| 版本 | 原记录 | 实际状态 |
|------|--------|---------|
| v7.27.0-P2 | SKIP (not defined) | **正确** |
| 早期版本 | 可能误标为 PASS | 实际应当为 SKIP |

## 是否需要 v7.27.0-P4 Validation Script Hardening

**不建议。** 原因：

1. `db:doctor`、`secret:scan`、`smoke` 在当前架构下没有实际需求
2. 盲目新增 script 只会增加维护成本
3. 当前验证门禁（lint/typecheck/build）已覆盖核心质量
4. 如需新增审核 gate，应在确定具体需求后再加入

## 建议

1. 所有未来回执中，对不存在的脚本统一使用 `SKIP (script not defined in package.json)` 
2. 如需要额外的安全扫描，可在后续版本中单独立项
3. 本审计记录可作为 v7.27 Final Seal 的参考依据
