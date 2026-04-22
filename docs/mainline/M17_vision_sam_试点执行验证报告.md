# M17 vision-sam 试点执行验证报告

## 验证范围
1. 单能力 execute 试点是否仅限 vision-sam。
2. 是否存在独立总开关与单能力开关。
3. 审计、熔断、回退是否生效。
4. 主程序核心接口是否稳定。

## 验证结果
1. 单能力范围
- `vision-sam` 可在双开关开启时触发 dry_run execute。
- `vision-yolo` execute 仍 503。

2. 双开关
- 总开关：`PLUGIN_EXECUTE_TRIAL_ENABLED`
- 单能力开关：`PLUGIN_EXECUTE_VISION_SAM_ENABLED`
- 两者任一关闭，vision-sam execute 返回 503。

3. 审计与熔断
- 每次 execute 写入 `audit_logs`（`plugin_execute_trial`）。
- 连续失败计数与阈值生效，可触发 circuit_open。

4. 回退
- 调用 rollback 接口后 circuit_open=true。
- 回退后 vision-sam execute 恢复 503。

5. 稳定性
- `GET /api/health` 正常。
- `GET /api/plugins` 正常。
- `GET /api/plugins/status` 正常。
- `GET /api/vision/catalog` 正常。

## 结论
M17 试点通过：vision-sam 进入“受控最小执行试点”，且仍可快速回退到 execute 关闭基线。
