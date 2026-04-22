# Legacy YOLO Line Freeze Note (v6.5.0)

## 1. 冻结目的
- 当前主线已封板，历史 YOLO 线为不可插拔实现，继续默认开放会污染主线。
- 采用“冻结而不删除”策略：保留回看能力，禁止默认执行。

## 2. 冻结策略
- 默认状态：`frozen`。
- 仅在人工明确需要时，通过环境变量临时解冻。

### 解冻开关
- 环境变量：`ENABLE_LEGACY_YOLO=true`
- 未设置或非 `true`：YOLO 相关路径返回受控阻断错误。

## 3. 已冻结入口
1. `workflow.executeTrainModel` 中 `task_type=vision_detect && model_family=yolo`
2. `workflow.executeEvaluateModel` 中 `task_type=vision_detect && model_family=yolo`
3. `workflow.executeYoloDetect`（vision pipeline e2e 第一步）

## 4. 阻断行为
- 返回错误前缀：`[legacy-yolo-frozen]`
- 写入 job log（warn）
- 写入 audit log：`legacy_yolo_frozen_block`

## 5. 兼容性说明
- 未删除历史代码与数据结构。
- 非 YOLO 路径不受影响。
- 该冻结用于过渡期，后续由可插拔 YOLO 支线替代。

## 6. 对新助手要求
- 不要在主线直接解冻并扩展 legacy YOLO。
- 新开发统一走支线蓝图：
  - `docs/yolo_ten_hit_blueprint_v1.md`
  - `docs/yolo_branch_scope_lock_v1.md`
  - `docs/yolo_branch_not_in_scope_v1.md`
  - `audit/yolo_branch_handoff_pack_v1.md`
