# OpenClaw V1 受控执行设计

## 设计目标
将 OpenClaw 接入为“受控执行官”，先满足安全、可控、可回滚、可审计。

## 设计原则
- 总闸先于执行（master switch first）
- 熔断先于执行（circuit first）
- 高风险默认拒绝（deny by default）
- 白名单执行（allow-list only）
- 全链路留痕（logs + audit）

## 执行入口
- `POST /api/runs/:id/start`
- 当 `executor_type=openclaw` 时先过门禁：
  - master switch
  - circuit
  - high-risk

## V1 动作模型
`run.config_json.actions[]`
- `read_file`
  - 读取指定文件并回传 preview
- `run_script`
  - 仅允许 `script_key=check_dataset_version`
  - 映射固定脚本路径（不可注入任意路径）

## 落盘与审计
- run_steps: 每个动作一条 step
- run_logs: 每步开始/成功/失败
- audit_logs:
  - 总闸: `master_switch_enable|disable`
  - 执行: `openclaw_v1_execute`

## 失败策略
- 任一步失败 -> run 失败
- 错误写入 `run_steps.error_message` / `runs.error_message`
- 审计记录失败详情

## 安全边界
V1 明确不做：
- 任意脚本运行
- 文件写入/批量改写
- 高风险自动放行

## 后续扩展（V1.1+）
- 脚本签名校验
- 动作级 RBAC
- 自动熔断执行器
- 队列中 OpenClaw 任务自动冻结/取消策略
