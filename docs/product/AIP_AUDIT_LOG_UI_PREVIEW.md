# AIP Audit Log UI Preview (v7.27.0-P3)

> 只读审计日志预览。不写审计库。不写 DB。不控制外部工具。不启用 Stage C。

## 状态

| 项目 | 值 |
|------|-----|
| 版本 | v7.27.0-P3 |
| 源码修改 | 仅前端 registry + validator + page + route |
| DB 写入 | 否 |
| 外部控制 | 否 |
| Stage C | 否 |
| 风险 | 低（仅只读预览） |
| Route | `/audit-log-preview` (hidden direct，不入 sidebar) |
| 是否 commit/push | 是 |

## 文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `audit-log-registry.ts` | Registry | 18 个审计事件模型，10 个来源，10 种事件类型 |
| `audit-log-validator.ts` | Validator | 10 个纯校验检查 |
| `AuditLogPreview.tsx` | Page | 隐藏直达只读页面 |
| `App.tsx` | Route | `/audit-log-preview` 路由 |

## Registry

### 类型

- `AuditEventSource`: runtime_registry / dry_run_plan / permission_evaluator / connector_center / advanced_hub / governance_center / git / database / external_tool / stage_c
- `AuditEventType`: view / plan_generated / dry_run_preview / permission_evaluated / human_approval_required / blocked_action / external_control_attempt / db_write_attempt / stage_c_transition_attempt / tag_release_attempt
- `AuditRetentionClass`: ephemeral_preview / report_only / future_db_audit / blocked_no_write

### 事件列表 (18 个)

| ID | 来源 | 风险 | allowedNow | writeNow |
|----|------|------|-----------|----------|
| runtime-registry-view | runtime_registry | low | true | false |
| dry-run-plan-view | dry_run_plan | low | true | false |
| dry-run-plan-generated-preview | dry_run_plan | medium | false | false |
| permission-evaluator-view | permission_evaluator | low | true | false |
| permission-rule-evaluated | permission_evaluator | medium | false | false |
| connector-center-runtime-snapshot-view | connector_center | low | true | false |
| advanced-hub-runtime-link-view | advanced_hub | low | true | false |
| human-approval-required-preview | governance_center | high | false | false |
| blocked-external-control-attempt | external_tool | critical | false | false |
| blocked-db-write-attempt | database | critical | false | false |
| blocked-stage-c-transition-attempt | stage_c | critical | false | false |
| blocked-tag-release-attempt | git | high | false | false |
| blocked-candidate-process-attempt | governance_center | high | false | false |
| git-commit-push-report-only | git | low | true | false |
| git-tag-release-blocked | git | high | false | false |
| memory-hub-candidate-review-preview | governance_center | low | true | false |
| comfyui-dry-run-preview-blocked | connector_center | high | false | false |
| openclaw-task-package-preview-audit | connector_center | medium | false | false |

### 强制规则

- 所有 item `writeNow=false`
- `requiresDbWrite=true` => `allowedNow=false`
- `requiresExternalControl=true` => `allowedNow=false`
- `requiresStageC=true` => `allowedNow=false`
- `critical` risk => `allowedNow=false`

## Validator (10 checks)

| Check | 类型 |
|-------|------|
| All items writeNow=false | Blocking |
| requiresDbWrite=true and allowedNow=true | Blocking |
| requiresExternalControl=true and allowedNow=true | Blocking |
| requiresStageC=true and allowedNow=true | Blocking |
| critical risk and allowedNow=true | Blocking |
| tag_release_attempt and allowedNow=true | Blocking |
| stage_c_transition_attempt and allowedNow=true | Blocking |
| db_write_attempt and allowedNow=true | Blocking |
| external_control_attempt and allowedNow=true | Blocking |
| high/critical items must have gates and blockedActions | Warning |

所有检查当前 blocking=0。

## 安全边界

| 约束 | 状态 |
|------|------|
| 写审计库 | 否 |
| 写 DB | 否 |
| 外部工具控制 | 否 |
| 外部 API 调用 | 否 |
| Stage C 启用 | 否 |
| Sidebar 修改 | 否 |
| Layout/i18n/menu-registry 修改 | 否 |
| 后端修改 | 否 |

## 跨页面同步

| 页面 | 同步内容 |
|------|---------|
| DryRunPlanPreview | 审计日志预览快照 + 链接 |
| RuntimeRegistryPreview | 审计日志预览快照 + 链接 |
| AdvancedModeReadonly | 审计日志摘要 + 链接 |
| ConnectorCenterReadonly | 审计日志预览快照 + 链接 |
| PermissionEvaluatorPreview | 审计规则参考 + audit-write-now deny |
| permission-evaluator-registry | pe-audit-log-preview + pe-audit-write-now 规则 |
| navigation-exposure-registry | audit-log-preview hidden direct 条目 |
| center-access-registry | audit-log-preview 条目 + sidebar 校验 |
