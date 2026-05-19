# AIP Rollback Preview

> **v7.28.0-P4** · 只读回滚风险评估预览  
> 路径: `/rollback-preview` · 隐藏直达 · 不入侧边栏  
> 核心口令: Rollback 是预览，不是真实恢复器。能评估风险，不执行恢复。能展示 rollback plan，不改文件、不写 DB、不控制外部系统。Stage C 继续锁死。

## 概述

Rollback Preview 为 AIP 提供**只读回滚风险评估预览**。它定义了未来运行时、审批、证据、审计等链路的回滚风险模型、幂等性检查、前置条件、证据需求和阻断边界。

当前版本是纯前端静态模型。**没有 rollback executor，没有 file restore，没有 Git reset/revert/tag/release，没有 DB 写入，没有外部工具控制，没有 Stage C。**

## 设计原则

| 原则 | 说明 |
|------|------|
| 只读风险评估 | 不执行回滚、不恢复文件、不修改 Git |
| 阻断不可逆操作 | blocked_irreversible 类型永远 allowedNow=false |
| 幂等性优先 | idempotency_key_required 项必须有唯一 key 才能执行 |
| 证据驱动 | 回滚必须有所需证据链支持 |
| 静态模型 | 所有数据为静态注册表数据，无运行时依赖 |

## 回滚目标

| 目标 | 说明 |
|------|------|
| runtime_registry | 运行时注册表 |
| dry_run_plan | Dry-run 计划 |
| audit_log | 审计日志 |
| human_approval | 人工审批 |
| governance_state | 治理状态 |
| evidence_schema | 证据模型 |
| permission_evaluator | 权限评估器 |
| connector_center | 连接器中心 |
| git | Git |
| database | 数据库 |
| external_tool | 外部工具 |
| stage_c | Stage C |
| local_file | 本地文件 |

## 回滚类型

| 类型 | 说明 |
|------|------|
| preview_only | 只读预览，可查看 |
| idempotency_check | 检查幂等性 key，可查看 |
| risk_assessment | 风险评估，可查看 |
| manual_recovery_plan | 人工恢复计划，仅设计阶段 |
| human_approved_rollback | 需人工审批的回滚 |
| blocked_irreversible | 不可逆阻断，不可查看 |
| future_stage_c | 未来 Stage C 回滚，不可查看 |

## Rollback Registry

位置: `apps/web-ui/src/registry/rollback-registry.ts`

### 统计

| 指标 | 值 |
|------|-----|
| 总项 | 22 |
| allowedNow | 13 |
| blocked | 9 |
| high/critical | 9 |
| irreversible | 10 |
| executesRollback | 1 (blocked) |
| 需人工审批 | 10 |
| 需证据 | 10 |
| 需审计 | 10 |
| 需 DB 写 | 3 |
| 需外部控制 | 3 |
| 需 Stage C | 3 |
| 改文件 | 3 |
| 改 Git | 2 |

### 核心项目

**允许查看 (allowedNow=true):**
- 8 preview-only rollbacks (runtime, dry-run, audit, approval, governance, evidence, permission, connector)
- manual-recovery-plan-preview, idempotency-key-check-preview
- rollback-evidence-requirement-preview, rollback-audit-trace-preview
- git-commit-push-rollback-plan

**禁止查看 (allowedNow=false):**
- git-tag-release-rollback-blocked (critical, irreversible, modifiesGit)
- db-write-rollback-blocked (critical, irreversible, requiresDbWrite)
- external-tool-control-rollback-blocked (critical, irreversible, requiresExternalControl)
- stage-c-transition-rollback-blocked (critical, irreversible, requiresStageC)
- candidate-processing-rollback-blocked (high, irreversible)
- local-file-overwrite-rollback-blocked (critical, irreversible, modifiesFiles)
- secret-capture-rollback-blocked (critical, irreversible)
- runtime-execution-rollback-blocked (critical, irreversible)
- irreversible-action-blocked (critical, irreversible, executesRollback)

## Rollback Validator

位置: `apps/web-ui/src/registry/rollback-validator.ts`

校验规则:
1. executesRollback=true 不得 allowedNow=true
2. irreversible=true 不得 allowedNow=true
3. requiresDbWrite=true 不得 allowedNow=true
4. requiresExternalControl=true 不得 allowedNow=true
5. requiresStageC=true 不得 allowedNow=true
6. modifiesFiles=true 不得 allowedNow=true
7. modifiesGit=true 不得 allowedNow=true
8. critical risk 不得 allowedNow=true
9. blocked_irreversible 不得 allowedNow=true
10. future_stage_c 不得 allowedNow=true
11. high/critical 必须有 gates 和 blockedActions
12. 每个 item 必须有 preconditions / evidenceRequired / rollbackStepsPreview / failureModes
13. 每个 item 必须有 reason 和 nextAction

## 边界限制

| 能力 | 状态 |
|------|------|
| Rollback 执行 | 禁用 |
| File restore | 禁用 |
| Git reset/revert | 禁用 |
| Git tag/release | 禁用 |
| DB 写入 | 禁用 |
| 外部工具控制 | 禁用 |
| Stage C | 永久禁用 |
| 侧边栏 | 不入 |
| 标签/发布 | 不创建 |

## 相关页面

- [Evidence Schema Preview](/evidence-schema-preview)
- [Human Approval Workflow Preview](/human-approval-workflow-preview)
- [Governance State Machine Preview](/governance-state-machine-preview)
- [Runtime Registry Preview](/runtime-registry-preview)
- [Audit Log Preview](/audit-log-preview)
- [Dry-Run Plan Preview](/dry-run-plan-preview)
- [Permission Evaluator Preview](/permission-evaluator-preview)

---

## v7.28+ Status

- **v7.28.0 SEAL:** PASS (V7_28_FINAL_SEAL_READY) — Commit `349b20a`, 2026-05-19
- **v7.29.0-D1 Governance Console:** See `AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md` — design-only, not implemented
- **Stage C:** Remains disabled. No DB write. No external control. No executor implementation.
- **Sidebar:** Governance Console will not enter sidebar until human decision after v7.29 Final Seal.
