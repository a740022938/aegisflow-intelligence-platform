# M19 vision-sam 阈值优化建议

## 结论摘要
1. 当前熔断阈值建议保持 3。
2. 继续维持“仅 vision-sam + 双开关 + dry_run=true”边界。
3. 下一阶段优先做审计字段结构化补强，再讨论任何范围扩大。

## 阈值建议
1. 维持阈值 3（当前不调）。
2. 建议在 M20-M21 追加对比实验：阈值 3 vs 4 的误触发率与恢复成本。
3. 当前不建议阈值=2（过敏风险高）。

## 审计字段补强建议（优先级）
1. P0: error_type（统一失败枚举）
2. P0: gate_reason（门禁拒绝原因）
3. P1: rollback_source（manual/auto）
4. P1: circuit_state_before / circuit_state_after
5. P1: dry_run_flag（布尔字段）

## 当前绝对不能放大的点
1. 不开放 vision-yolo execute。
2. 不开放 tracker/rule_engine/fusion execute。
3. 不取消 dry_run 限制。
4. 不改 workflow/index.ts。
5. 不改 task-execute/*。

## 是否进入 M20
建议进入 M20，范围限定为：
1. 审计字段结构化补强。
2. 不改执行范围，不增加可执行能力。
