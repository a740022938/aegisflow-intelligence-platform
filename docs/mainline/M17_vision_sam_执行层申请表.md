# M17 vision-sam 执行层申请表

## A. 基础信息
- capability 名称：vision-sam
- plugin_id：vision-sam
- 当前身份：builtin_official
- 当前状态：active（管理层桥接）
- 当前执行状态：disabled（试点前）
- 风险级别：MEDIUM
- managed_by：local-api-core

## B. 申请理由
- 作为 M16 首选能力，先做最小受控 execute 试点，验证执行层门禁制度可落地。

## C. 门禁自检
- 隔离门禁：通过
- 回归门禁：通过
- 审计门禁：通过
- 稳定性门禁：通过
- 单刀验收门禁：通过
- 回退门禁：通过

## D. 验收证据
- 基线关闭态：vision-sam execute=503。
- 开启试点：vision-sam dry_run 成功。
- 回退演练：rollback 后 execute 恢复 503。
- 审计记录：audit_logs category=plugin_execute_trial。

## E. 回退方案
- 回退触发阈值：连续失败达到阈值、或人工判定风险升级。
- 回退动作：调用 `/api/plugins/vision-sam/execute/rollback`，并关闭双开关。
- 回退后验证：health/plugins/status/catalog 正常，vision-sam execute=503。
- 责任人：local-api-core 当班维护人。

## F. 审批结论
- 结论：通过（M17 受控 dry-run 试点范围）
- 生效范围：仅 vision-sam，且仅 dry_run。
- 非范围声明：不涉及 yolo/tracker/rule_engine/fusion execute 开放。
