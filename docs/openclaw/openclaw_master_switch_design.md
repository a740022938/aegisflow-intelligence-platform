# OpenClaw 总闸设计说明

## 目标
在首页第一屏提供 OpenClaw 执行层总闸（急停），并由后端强制门禁，不是纯 UI 装饰。

## 本次实现范围
- 首页增加 `OpenClaw 总闸` 滑块开关（开启/关闭）。
- 后端新增总闸状态接口：`GET /api/openclaw/master-switch`。
- 后端新增总闸切换接口：`POST /api/openclaw/master-switch`。
- OpenClaw 启动门禁接入：`POST /api/runs/:id/start`。

## 关闭态行为
当 `enabled=false` 时：
- 拒绝 OpenClaw 新启动（返回 503，`OPENCLAW_MASTER_SWITCH_DISABLED`）。
- 拒绝继续下发排队到执行入口（`/api/runs/:id/start` 阶段拦截）。
- UI 显示：`OpenClaw 执行层已关闭`。

## 开启态行为
当 `enabled=true` 时：
- 允许 OpenClaw 启动入口继续执行。
- 高风险动作仍可单独拒绝（`OPENCLAW_HIGH_RISK_BLOCKED`）。

## 状态展示字段
`GET /api/openclaw/master-switch` 返回：
- switch: enabled / status_text / updated_at / updated_by
- status: online_status / execution_status / last_action / last_error / circuit_status
- circuit: fail_count / fail_threshold / timeout_window_count / timeout_threshold / auto_circuit_reserved / high_risk_auto_disable

## 审计留痕
每次开/关写两类记录：
- `openclaw_control_events`：结构化切换事件
- `audit_logs`：category=`openclaw`，action=`master_switch_enable|disable`

审计字段包含：
- 操作人 actor
- 操作时间 happened_at
- 动作 action
- 原因 reason
- 状态快照 snapshot（before/after/runtime）

## 熔断预留
当前先做字段与接口预留，未开启自动熔断策略执行：
- circuit_fail_count
- circuit_fail_threshold
- timeout_window_count
- timeout_threshold
- high_risk_auto_disable
- auto_circuit_reserved

后续可基于这些字段实现：连续失败自动关闭、超时过多自动关闭、高风险异常自动关闭。

## 数据结构
### openclaw_control
- enabled
- init_failed
- error_reason
- circuit_state(normal/triggered)
- runtime_online
- circuit_fail_count / circuit_fail_threshold
- timeout_window_count / timeout_threshold
- high_risk_auto_disable
- auto_circuit_reserved
- updated_at / updated_by

### openclaw_control_events
- actor
- action(enable/disable)
- reason
- snapshot_json
- created_at
