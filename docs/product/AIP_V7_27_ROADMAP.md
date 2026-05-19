# AIP v7.27 Roadmap

## Overview

v7.27 是连接器运行时设计的起点。所有工作为只读设计，不实现 runtime，不控制外部工具，不写 DB，不启 Stage C。

## Phases

### v7.27.0-D1 Connector Runtime Design Spec (已完成)

| 项目 | 值 |
|------|-----|
| 源码修改 | 否 (仅 docs) |
| DB 写入 | 否 |
| 外部控制 | 否 |
| Human approval | 否 (仅设计) |
| 风险 | 低 (仅文档) |
| 允许 commit/push | 是 |

**结果：** 6 design docs created. Docs-only construction with no source code changes.

### v7.27.0-P1 Runtime Registry Preview (已完成)

| 项目 | 值 |
|------|-----|
| 源码修改 | 仅前端 registry + page + route |
| DB 写入 | 否 |
| 外部控制 | 否 |
| Human approval | 否 |
| 风险 | 低 |
| 允许 commit/push | 是 |
| Route | /runtime-registry-preview (hidden direct) |
| Commit | edbe7e1 |

**描述：** 新增 runtime-registry.ts (20 items)、runtime-registry-validator.ts、RuntimeRegistryPreview.tsx 隐藏直达页面。同步 Advanced Hub、Connector Center、Permission Evaluator。所有数据为静态注册表只读预览，不运行外部工具，不写 DB，不启用 Stage C。

### v7.27.0-P2 Dry-run Plan Preview (已完成)

| 项目 | 值 |
|------|-----|
| 源码修改 | 仅前端 UI |
| DB 写入 | 否 |
| 外部控制 | 否 |
| Human approval | 否 |
| 风险 | 低 |
| 允许 commit/push | 是 |
| Route | /dry-run-plan-preview (hidden direct) |
| Commit | 04481ff |

**描述：** 新增 dry-run-plan-registry.ts (16 plans)、dry-run-plan-validator.ts、DryRunPlanPreview.tsx 隐藏直达页面。不执行真实 dry-run。所有数据为静态注册表只读预览。

### v7.27.0-P3 Audit Log UI Preview (当前)

| 项目 | 值 |
|------|-----|
| 源码修改 | 仅前端 registry + validator + page + route |
| DB 写入 | 否 |
| 外部控制 | 否 |
| Human approval | 否 |
| 风险 | 低 |
| 允许 commit/push | 是 |
| Route | /audit-log-preview (hidden direct) |

**描述：** 新增 audit-log-registry.ts (18 items)、audit-log-validator.ts、AuditLogPreview.tsx 隐藏直达页面。同步 Dry-run/Runtime/Advanced/Connector/Permission Evaluator 页面。包含 Validation Script Parity Audit 记录。不写审计库，不写 DB，不控制外部工具。

### v7.27.0 Final Seal

### v7.27.0 Final Seal

| 项目 | 值 |
|------|-----|
| 源码修改 | 可能小修改 |
| DB 写入 | 否 |
| 外部控制 | 否 |
| Human approval | 否 |
| 风险 | 低 |
| 允许 commit/push | 是 |

**描述：** v7.27 全阶段 seal。确认所有设计文档和 UI preview 一致。

## 默认约束

- v7.27 不做真实外部控制
- v7.27 不启 Stage C
- v7.27 不写 DB
- v7.27 所有 runtime 为只读设计

## 延期到 v7.28+

| 功能 | 原因 |
|------|------|
| 真实 dry-run 执行 | 需要 Stage C + runtime evaluator |
| 真实 human approval | 需要 Governance Center ready |
| 真实审计日志 | 需要 DB 写入 |
| 真实外部控制 | 需要 Stage C + runtime |
| 回滚引擎 | 需要 runtime 基础 |
