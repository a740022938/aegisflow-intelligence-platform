# AIP Evidence Schema Preview

> **v7.28.0-P3** · 只读证据模型预览  
> 路径: `/evidence-schema-preview` · 隐藏直达 · 不入侧边栏  
> 核心口令: 证据是预览，不是证据库。能定义证据，不采集证据。能展示 attestation，不写 DB。不能保存 token/API key/password/private key。Stage C 继续锁死。

## 概述

Evidence Schema Preview 为 AIP 提供**只读证据模型预览**。它定义了未来审批、运行时、dry-run、审计和治理流程中可能使用的证据结构、脱敏策略、保留规则和门禁条件。

当前版本是纯前端静态模型。**没有证据采集器，没有 evidence store，没有 token/API key/secret 保存，没有 DB 写入，没有外部工具控制，没有 Stage C。**

## 设计原则

| 原则 | 说明 |
|------|------|
| 只读预览 | 不采集证据、不写 evidence store、不写 DB |
| 不保存 secret | forbidden_secret 类 evidence 永远 allowedNow=false、captureNow=false、writeNow=false |
| 脱敏优先 | redacted_sensitive evidence 必须 requiresRedaction=true |
| 禁止越权 | token/API key/password/private key 只能出现在 forbiddenFields / blockedActions 中 |
| 静态模型 | 所有数据为静态注册表数据，无运行时依赖 |

## 证据类型

| 类型 | 说明 |
|------|------|
| registry_snapshot | 注册表快照 |
| validator_summary | 验证摘要 |
| dry_run_plan | Dry-run 计划 |
| audit_preview | 审计日志预览 |
| approval_request | 审批请求 |
| human_note | 人工备注 |
| report_path | 报告路径 |
| git_commit | Git 提交 |
| screenshot | 截图 |
| validation_output | 验证输出 |
| rollback_plan | 回滚计划 |
| stage_gate_state | 阶段门禁状态 |

## Evidence Schema Registry

位置: `apps/web-ui/src/registry/evidence-schema-registry.ts`

### 统计

| 指标 | 值 |
|------|-----|
| 总项 | 23 |
| allowedNow | 20 |
| captureNow | 0 |
| writeNow | 0 |
| 需脱敏 | 6 |
| 需人工审核 | 4 |
| 需 Stage C | 0 |
| 需 DB 写 | 0 |
| forbidden_secret | 3 |
| high/critical | 3 |

### 核心项目

**允许查看 (allowedNow=true):**
- runtime-registry-snapshot, runtime-validator-summary
- dry-run-plan-preview-evidence, dry-run-validator-summary
- audit-log-preview-evidence (redacted), audit-validator-summary
- human-approval-request-preview (redacted), human-approval-validator-summary
- governance-state-snapshot, governance-state-validator-summary
- permission-evaluator-summary
- connector-center-readiness-snapshot
- report-path-reference, git-commit-reference
- validation-output-reference
- screenshot-reference (redacted)
- human-note-preview (redacted)
- rollback-plan-preview, stage-gate-state-preview

**禁止查看 (allowedNow=false):**
- token-secret-material-forbidden (critical, forbidden_secret)
- api-key-material-forbidden (critical, forbidden_secret)
- raw-password-material-forbidden (critical, forbidden_secret)

## Evidence Schema Validator

位置: `apps/web-ui/src/registry/evidence-schema-validator.ts`

校验规则:

1. 所有 item writeNow=false
2. containsSecretMaterial=true 不得 allowedNow/captureNow/writeNow
3. containsTokenLikeMaterial=true 不得 allowedNow/captureNow/writeNow
4. sensitivity=forbidden_secret 不得 allowedNow
5. retention=forbidden_no_store 不得 writeNow
6. requiresDbWrite=true 不得 writeNow
7. requiresStageC=true 不得 allowedNow
8. critical risk 不得 allowedNow
9. redacted_sensitive 必须 requiresRedaction=true
10. 每个 item 必须有 allowedFields / forbiddenFields
11. 每个 item 必须有 reason 和 nextAction
12. high/critical 必须有 gates 和 blockedActions
13. token/API key/password/private key 只允许在 forbiddenFields / blockedActions / docs 说明中

## 边界限制

| 能力 | 状态 |
|------|------|
| 证据采集 | 禁用 (所有 captureNow=false) |
| 证据写入 | 禁用 (所有 writeNow=false) |
| token/API key/secret 保存 | 禁用 |
| DB 写入 | 禁用 |
| 外部工具控制 | 禁用 |
| Stage C | 永久禁用 |
| 审批队列 | 禁用 |
| Candidate 处理 | 禁用 |
| 侧边栏 | 不入 |
| 标签/发布 | 不创建 |

## 相关页面

- [Human Approval Workflow Preview](/human-approval-workflow-preview)
- [Governance State Machine Preview](/governance-state-machine-preview)
- [Runtime Registry Preview](/runtime-registry-preview)
- [Audit Log Preview](/audit-log-preview)
- [Dry-Run Plan Preview](/dry-run-plan-preview)
- [Permission Evaluator Preview](/permission-evaluator-preview)

## v7.28.0-P4 Rollback Preview

**P4 Rollback Preview** is now established at /rollback-preview (hidden direct, readonly). It provides a static display of rollback states and idempotency keys as a readonly model — **no rollback executor, no file restore, no git mutation, no DB write, no external control, and Stage C disabled**. This P4 preview does not collect or write evidence; it follows the same readonly constraints as P3.

---

## v7.28+ Status

- **v7.28.0 SEAL:** PASS (V7_28_FINAL_SEAL_READY) — Commit `349b20a`, 2026-05-19
- **v7.29.0-D1 Governance Console:** See `AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md` — design-only, not implemented
- **Stage C:** Remains disabled. No DB write. No external control. No executor implementation.
- **Sidebar:** Governance Console will not enter sidebar until human decision after v7.29 Final Seal.
