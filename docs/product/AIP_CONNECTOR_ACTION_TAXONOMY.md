# AIP Connector Action Taxonomy (v7.27.0-D1)

> 设计文档，非实现。定义动作级别与当前允许范围。

## Action 级别

| 级别 | 名称 | 描述 | 示例 |
|------|------|------|------|
| L0 | view_static | 查看静态元数据 | 连接器列表、描述、版本 |
| L1 | view_runtime_status | 查看运行时状态 | 连接器在线状态、上次同步时间 |
| L2 | generate_task_package | 生成任务包 | 生成 OpenClaw task package JSON |
| L3 | dry_run_plan | 模拟执行计划 | 生成 dry-run 结果但不执行 |
| L4 | human_approved_execute | 经审批的执行 | 执行经审批的 task package |
| L5 | autonomous_execute | 自动执行 | 无需审批的自动执行 |
| L6 | destructive_or_external_write | 破坏性或外部写入 | 删除、覆盖、推送更改 |

## 当前允许范围

| 级别 | 当前允许 | 条件 |
|------|---------|------|
| L0 | 是 | 无限制 |
| L1 | 部分 | 仅当不调用外部 API 时 |
| L2 | 是 | 仅生成文本/JSON，不执行 |
| L3 | 否 (设计阶段) | 需要 Permission Evaluator + dry-run gate |
| L4 | 否 | 需要 Stage C + human approval |
| L5 | 否 | 需要 Stage C + runtime evaluator |
| L6 | 否 | 永久禁止当前阶段 |

## 未来路线

| 级别 | v7.27 | v7.28+ | Stage C 后 |
|------|-------|--------|-----------|
| L0 | 允许 | 允许 | 允许 |
| L1 | 设计 | 允许 | 允许 |
| L2 | 允许 | 允许 | 允许 |
| L3 | 设计 | 开发 | 允许 |
| L4 | 不允许 | 设计 | 允许 |
| L5 | 不允许 | 不允许 | 设计 |
| L6 | 不允许 | 不允许 | 需政策讨论 |

## 各工具当前支持级别

| 工具 | L0 | L1 | L2 | L3+ |
|------|----|----|----|-----|
| OpenClaw | 是 | 是 (本地) | 生成 package | 否 |
| ComfyUI | 是 | 否 | 否 | 否 |
| OpenAxiom | 是 | 是 | 否 | 否 |
| Hugging Face | 是 | 否 | 否 | 否 |
| Hermes | 否 | 否 | 否 | 否 |
| CC Switch | 是 | 是 (本地) | 否 | 否 |
| Claude Proxy | 是 | 是 (本地) | 否 | 否 |
