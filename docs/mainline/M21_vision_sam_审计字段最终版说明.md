# M21 vision-sam 审计字段最终版说明

## 目标
将 vision-sam dry-run 试点审计从“文本摘要”升级为“可分类、可复盘、可运营”的结构化格式。

## 最终字段定义
1. error_type
- 失败类型枚举，例如：switch_global_disabled / switch_capability_disabled / dry_run_invalid / circuit_open / rollback_triggered / system_error。

2. gate_reason
- 门禁拒绝原因分层，例如：gate_switch / gate_dry_run / gate_circuit / gate_manual_rollback / gate_runtime。

3. rollback_source
- 回退来源（manual/auto）。

4. circuit_state_before / circuit_state_after
- 审计记录发生前后熔断状态。

5. dry_run_flag
- 请求是否为 dry_run。

6. switch_state_snapshot
- 审计发生当时双开关与阈值快照：
  - execute_trial_global_enabled
  - execute_trial_vision_sam_enabled
  - failure_threshold

7. trial_scope
- 固定试点范围标识：vision-sam-only-dry-run。

8. actor_type
- 触发者类型（operator/ip/unknown/system）。

9. execution_mode
- 执行模式（vision-sam-trial-dry-run / vision-sam-trial-rollback）。

## 兼容性与边界
1. execute 范围不变：仅 vision-sam。
2. dry_run 限制不变。
3. 非 sam 能力不放开。
4. 不涉及 workflow/index.ts 与 task-execute/* 变更。
