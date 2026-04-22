# OpenClaw V1.2 安全收口设计

## 目标
将 OpenClaw 从“开发可用”收口到“长期可控可管”，聚焦配置治理、权限控制、结构化作用域与状态一致性。

## 1. Token 配置治理
- 心跳 token 改为环境变量强制读取：`OPENCLAW_HEARTBEAT_TOKEN`。
- 恢复接口管理员 token：`OPENCLAW_ADMIN_TOKEN`。
- 不再依赖硬编码默认 token 作为长期方案。
- 当 `OPENCLAW_HEARTBEAT_TOKEN` 未配置：
  - `POST /api/openclaw/heartbeat` 返回 503 + `OpenClaw token 未配置`。
  - `GET /api/openclaw/master-switch` 返回 `token_configured=false` 和提示信息。

## 2. Recover 最小权限控制
- 接口：`POST /api/openclaw/circuit/recover`
- 鉴权：请求头 `x-openclaw-admin-token` 必须匹配 `OPENCLAW_ADMIN_TOKEN`。
- 未授权：403 拒绝。
- 授权：恢复成功并重置计数。
- 审计记录：
  - actor
  - reason
  - before state
  - after state
  - happened_at

## 3. 结构化 Scope 清队列
- 作用域字段升级：
  - `tenant_id`
  - `project_id`
  - `run_group`
- 总闸关闭 + 自动清队列时只按结构化字段精确匹配 queued run。
- 不再以关键词模糊匹配作为长期方案。

## 4. 总闸状态字段统一
`GET /api/openclaw/master-switch` 统一返回：
- `enabled`
- `circuit_state`
- `online_status`
- `heartbeat_at`
- `auto_cancel_queued_on_disable`
- `queued_cancel_scope`（tenant_id/project_id/run_group）
- `failure_count`
- `timeout_count`
- `last_action`
- `last_error`
- `token_configured`

## 5. 心跳在线判定规则
- 在线：`now - heartbeat_at <= heartbeat_timeout_sec`
- 离线：超过窗口或无心跳
- 心跳鉴权失败不更新状态
- 心跳缺失时不自动改总闸，仅标记离线（本版冻结）

## 6. 熔断状态机
- `normal`
- `triggered`
- `recovered`（通过 recover 接口将状态拉回 normal，并清计数）

计数规则：
- 失败计数：OpenClaw 执行失败累加
- 超时计数：错误信息匹配 timeout 累加
- recover 后：失败计数与超时计数重置为 0

## 7. 审计与可回滚
- 所有总闸切换、熔断恢复、执行失败熔断事件写入 audit。
- 审计字段保留前后状态快照，支持复盘和回滚策略制定。
