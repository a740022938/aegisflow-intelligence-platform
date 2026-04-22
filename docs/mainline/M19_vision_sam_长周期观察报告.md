# M19 vision-sam 长周期观察报告

## 范围
1. 仅 vision-sam execute 试点。
2. 仅双开关显式控制。
3. 仅 dry_run=true 为成功路径。
4. 不扩展到 vision-yolo / tracker / rule_engine / fusion。

## 长周期观测结果
1. execute 总调用：37
2. dry-run 调用：34
3. 成功/失败：30/7
4. rollback：1
5. 非 sam 拒绝：4（均 503）

## 失败分类
1. global switch off：1
2. capability switch off：1
3. circuit open：2
4. dry_run 不合法：3
5. 输入摘要异常：0
6. 其他系统错误：0

## 稳定性巡检
- 开关开启态：4 核心接口 6/6 轮全部通过。
- 开关关闭态：4 核心接口 4/4 轮全部通过。
- 4 核心接口：`/api/health`、`/api/plugins`、`/api/plugins/status`、`/api/vision/catalog`。

## 审计一致性
1. plugin_execute_trial 审计 37 条。
2. success/error 为 30/7，与接口观测一致。
3. duration/input/output 字段覆盖率均 100%。

## 结论
1. vision-sam dry-run 试点可长期维持当前形态。
2. 当前仍只建议 dry-run，不建议取消 dry_run 限制。
3. 当前绝对不能放大到其他能力。
