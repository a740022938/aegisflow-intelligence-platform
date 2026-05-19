# AIP Runtime Audit and Rollback Plan (v7.27.0-D1)

> 设计文档，非实现。当前阶段不实现，只设计。

## 1. 审计日志要求

每次外部动作必须记录：

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| action_id | UUID | 动作唯一 ID | 是 |
| connector | string | 连接器名称 | 是 |
| action_type | string | 动作类型 | 是 |
| initiator | string | 发起人 | 是 |
| timestamp | ISO 8601 | 发起时间 | 是 |
| dry_run | boolean | 是否为 dry-run | 是 |
| human_approval | string | 审批人 | 否 |
| approval_timestamp | ISO 8601 | 审批时间 | 否 |
| status | string | 完成状态 | 是 |
| result | JSON | 执行结果 | 否 |
| rollback | JSON | 回滚记录 | 否 |

## 2. Dry-run 记录格式

```json
{
  "action_id": "a1b2c3d4-...",
  "connector": "openclaw",
  "action_type": "task_package_handoff",
  "initiator": "user@example.com",
  "timestamp": "2026-05-19T10:00:00Z",
  "dry_run": true,
  "status": "completed",
  "result": {
    "simulated_output": "task_package.json",
    "warnings": ["参数 X 未指定"],
    "estimated_duration": "30s"
  }
}
```

## 3. Human Approval 记录格式

```json
{
  "action_id": "e5f6g7h8-...",
  "connector": "openclaw",
  "action_type": "controlled_execution",
  "initiator": "user@example.com",
  "timestamp": "2026-05-19T10:00:00Z",
  "dry_run": false,
  "human_approval": "approver@example.com",
  "approval_timestamp": "2026-05-19T10:05:00Z",
  "status": "approved",
  "execution_timestamp": "2026-05-19T10:06:00Z",
  "result": {
    "output": "...",
    "errors": null
  },
  "rollback": null
}
```

## 4. Rollback 前置条件

1. 动作必须可回滚（L0/L1 不需要，L2 可选，L4+ 必须评估）
2. Rollback 计划必须在执行前定义
3. Rollback 必须在规定时间内执行
4. Rollback 后必须验证一致性

## 5. 不可逆动作禁止策略

以下动作视为不可逆，当前阶段禁止：

| 动作 | 原因 |
|------|------|
| DB 写入 | 数据不可逆 |f
| 外部系统删除 | 数据丢失风险 |
| Git push | 仓库变更不可逆 |
| Release/tag 创建 | 版本污染 |
| 覆盖文件 | 数据丢失风险 |

## 6. Git 操作记录

所有 Git 相关操作（commit/push/tag/release）必须：

1. 记录到 audit log
2. 需要 human approval
3. 记录操作前的 HEAD
4. 记录操作后的 HEAD
5. 记录操作人

当前：所有 Git 操作由 assistant 手动执行，未接入 audit log。

## 7. DB 写入记录

DB 写入操作必须：

1. 通过 stage_c_gate
2. 记录到 audit log
3. 支持事务回滚
4. 记录变更前后的值

当前：DB 写入永久禁止。

## 8. 外部工具执行记录

外部工具执行必须：

1. 通过 dry_run_gate
2. 通过 human_approval_gate
3. 通过 audit_log_gate
4. 定义 rollback 计划
5. 记录所有执行细节

当前：外部工具执行永久禁止。

## 9. 当前阶段实现范围

| 功能 | 当前 | 设计 | 实现 |
|------|------|------|------|
| CostRouting 模拟日志 | 已实现 | — | — |
| 完整 audit log 框架 | 未实现 | v7.27-D1 | v7.28+ |
| Human approval 队列 | 未实现 | v7.27-D1 | v7.28+ |
| Rollback 引擎 | 未实现 | v7.27-D1 | 待定 |
| DB 事务日志 | 未实现 | 待定 | Stage C 后 |
| 外部工具审计 | 未实现 | 待定 | Stage C 后 |
