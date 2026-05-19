# AIP Connector Runtime Design Spec (v7.27.0-D1)

> 设计文档，非实现。当前版本不实现 runtime，不控制外部工具，不写 DB。v7.27.0-P1 已创建 Runtime Registry 前端只读预览。

## 1. 目标

定义未来连接器运行时的架构蓝图，使 AIP 能够在受控的安全边界内与外部工具进行交互。

## 2. 非目标

- 当前版本不实现 runtime
- 当前版本不控制外部工具
- 当前版本不写 DB
- 当前版本不启用 Stage C

## 3. Runtime 组件分层

```
┌─────────────────────────────────────────┐
│            UI Layer (只读)               │
│  ConnectorCenterReadonly / Permission   │
│  EvaluatorPreview / Governance Center   │
└──────────────────┬──────────────────────┘
                   │ UI only
┌──────────────────▼──────────────────────┐
│        Runtime Registry (设计的)         │
│  - Connector instance metadata          │
│  - Capability map                       │
│  - Gate status                          │
│  - Audit log pointer                    │
└──────────────────┬──────────────────────┘
                   │ future
┌──────────────────▼──────────────────────┐
│       Connector Runtime (未来实现)       │
│  - Dry-run executor                     │
│  - Human approval queue                 │
│  - Execution engine                     │
│  - Rollback manager                     │
│  - Audit logger                         │
└─────────────────────────────────────────┘
```

## 4. Connector Registry vs Runtime Registry

| 维度 | Connector Registry (当前) | Runtime Registry (P1 已实现) |
|------|--------------------------|------------------------------|
| 状态 | 已实现 readonly metadata | P1 已实现 readonly preview |
| 数据源 | Static registry | Static registry (v7.27.0-D1 设计) |
| 功能 | 展示连接器信息 | 展示运行目标、动作等级、门禁 |
| DB 写入 | 否 | 否 (静态注册表) |
| Stage C | 否 | 需要 |

## 5. Dry-run 模式

Dry-run 是 runtime 第一阶段的门禁能力：

1. 用户发起 dry-run 请求
2. Permission Evaluator 检查是否允许
3. Human approval gate 检查（如需要）
4. Dry-run executor 生成模拟结果
5. Audit log 记录 dry-run 结果
6. 不执行真实外部操作

**当前状态：** CostRouting 已有模拟 dry-run。P1 已实现 Runtime Registry 只读预览（20 targets, 7 action levels, 5 gate types）。未来 connector dry-run 需要 runtime registry 扩展。

## 6. Human Approval 模式

Human approval 是执行前的强制门禁：

1. Action 提交到 Human Approval Queue
2. 审批人在 Governance Center 查看详情
3. 审批人 approve / reject
4. Approve 后执行
5. Reject 后记录

**当前状态：** 未实现。审批 UI 已由 Governance Center preview 预留。

## 7. Stage C 关系

| Runtime 功能 | Stage C 依赖 | 当前状态 |
|-------------|-------------|---------|
| 只读 UI preview | 否 | 已实现 |
| Dry-run 计划 | 否 | 设计阶段 |
| Dry-run 执行 | 是 (需要 runtime evaluator) | 禁止 |
| Human approval 执行 | 是 | 禁止 |
| 真实外部控制 | 是 | 禁止 |

## 8. Audit Log 设计

每次外部动作必须记录：

```json
{
  "action_id": "uuid",
  "connector": "openclaw",
  "action_type": "task_package_handoff",
  "initiator": "user@example.com",
  "timestamp": "2026-05-19T10:00:00Z",
  "dry_run": true,
  "human_approval": "user_2@example.com",
  "status": "completed",
  "rollback": null
}
```

## 9. Rollback 模型

| 动作类型 | 可回滚 | 回滚策略 |
|---------|--------|---------|
| Readonly 查看 | N/A | 无需回滚 |
| Task package 生成 | 是 | 删除生成的 package |
| Dry-run 执行 | 是 | 丢弃模拟结果 |
| 真实执行 | 视工具而定 | 需要工具原生回滚 |

## 10. 安全边界

- Permission Evaluator 只建议，不执行 gate
- Governance Center 仍 hold_review
- Stage C 仍 disabled
- 所有 runtime 组件默认 blocked
- Human approval 为可选的强制执行前门禁

## 11. 分阶段路线

| 阶段 | 内容 | 源码修改 | DB 写入 | 外部控制 | Stage C |
|------|------|---------|---------|---------|---------|
| v7.27.0-D1 | 设计 spec | 否 | 否 | 否 | 否 |
| v7.27.0-P1 | Runtime Registry Preview | 仅前端 registry + page + route | 否 | 否 | 否 |
| v7.27.0-P2 | Dry-run Plan Preview | 仅前端 UI | 否 | 否 | 否 |
| v7.28+ | 实现 dry-run + approval | 需要 | 需要 | 需要 | 需要 |
