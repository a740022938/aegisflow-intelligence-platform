# M18 vision-sam 试点稳定性报告

## 范围
本轮仅观察 `vision-sam`、仅双开关显式开启、仅 `dry_run=true` 的受控试点行为。

## 连续观察结果
1. 共执行 13 次 execute 调用，其中 dry-run 10 次。
2. 成功/失败：8/5。
3. rollback：1 次，回退后立即拒绝执行。
4. 熔断拒绝：1 次（`circuit is open`）。
5. 双开关关闭后拒绝：1 次（`global switch is disabled`）。
6. 非 sam 能力（vision-yolo）仍为 503。

## 审计一致性
1. 本窗口 `plugin_execute_trial` 审计共 13 条。
2. 每条均含 `duration_ms`、`input_summary`、`output_summary`。
3. success/error 统计与接口观测一致。

## 主程序稳定性
1. `/api/health` 正常。
2. `/api/plugins` 正常。
3. `/api/plugins/status` 正常。
4. `/api/vision/catalog` 正常。

## 当前判断
1. 试点可继续保持 dry-run 运行。
2. 暂不建议扩大到其他能力。
3. 暂不建议取消 dry-run 限制。
