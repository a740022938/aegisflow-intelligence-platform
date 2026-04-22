# M17 vision-sam 回退方案说明

## 回退目标
在试点出现异常时，快速恢复到“execute 关闭 + 管理层桥接可见”基线。

## 一键回退路径
1. 立即调用接口：
- `POST /api/plugins/vision-sam/execute/rollback`
- body 示例：`{"reason":"manual rollback"}`

2. 配置层回退（建议同时执行）
- 设置 `PLUGIN_EXECUTE_TRIAL_ENABLED=false`
- 设置 `PLUGIN_EXECUTE_VISION_SAM_ENABLED=false`
- 重启 local-api 进程

## 回退触发条件
1. 连续失败达到阈值（自动熔断）。
2. 任一核心接口稳定性回归失败。
3. 人工判定风险升高（审计异常、行为不确定）。

## 回退后验证
1. `POST /api/plugins/vision-sam/execute` 返回 503。
2. `GET /api/health` 正常。
3. `GET /api/plugins` 正常。
4. `GET /api/plugins/status` 正常。
5. `GET /api/vision/catalog` 正常。

## 边界声明
1. 回退仅针对 vision-sam 试点执行入口。
2. 不涉及 workflow/index.ts 与 task-execute/*。
3. 不改变 yolo/tracker/rule_engine/fusion 的 execute 关闭状态。
