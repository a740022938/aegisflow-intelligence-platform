# YOLO 十连发支线施工图纸 V1

## 1. 目标与定位
- 主线 AGI Model Factory 视为 `v6.5.0` 封板基线，本支线独立推进。
- 本文档仅定义支线施工图纸与接力规则，不做重实现。
- 原则：`不污染主线`、`分期推进`、`先接口后重活`、`可回退可审计`。

## 2. 三档路线图

### 2.1 五连发基础版（MVP）
1. YOLO（检测）
2. SAM（分割）
3. 分类模型（验证）
4. Tracker（时序追踪）
5. 规则引擎（一致性/业务约束）

目标：形成最小可演示视觉主链，保证“输入 -> 五段处理 -> 结果输出”闭环。

### 2.2 八连发增强版
在五连发基础上新增：
6. 置信度融合器（fused confidence）
7. 难样本记忆库（badcase memory）
8. OpenClaw 调度层（受控调度/任务分发）

目标：把“多模型结果整合 + 难样本沉淀 + 调度编排”接入同一治理面。

### 2.3 十连发终局版
在八连发基础上新增：
9. 自动回流（feedback loop）
10. 自动训练 / 自动评估 / 自动部署链路（auto train/eval/deploy）

目标：形成“发现问题 -> 回流 -> 再训练 -> 再评估 -> 再发布”的可控自动化链路。

## 3. 施工顺序（先后关系）

### 第一阶段（新助手立即施工）
- 只做五连发基础链路的“最小可用闭环”。
- 先完成统一输出契约（五段结果结构），再挂执行模块。
- 输出最小审计日志：每段输入摘要、输出摘要、状态、耗时。

### 第二阶段（接口预留）
- 给融合器、难样本库、OpenClaw 预留接口与事件点。
- 不强行实现复杂策略，只保留可扩展契约与空实现。

### 第三阶段（后续再做）
- 自动回流、自动训练/评估/部署联动。
- 加审批门禁、风险阈值、回滚保护，再逐步提高自动化等级。

### 现在明确不做
- 不在本轮直接做十连发完整重实现。
- 不做大规模 schema 改造。
- 不重做主线页面框架。
- 不引入重型新依赖栈。

## 4. 模块职责表

| 模块 | 职责 | 输入 | 输出 | 关系 | 当前阶段 |
|---|---|---|---|---|---|
| Ingest Gateway | 接收图像/视频与任务元数据 | 文件、source_id、task上下文 | 标准化输入对象 | 上游入口 | 是 |
| YOLO Detect | 目标检测 | 标准化图像帧 | detection result | 下游 SAM/分类 | 是 |
| SAM Segment | 目标分割 | 图像帧 + 检测框 | segmentation result | 下游分类/规则 | 是 |
| Classifier Verify | 类别验证/复核 | 裁剪图/掩码 | classification result | 下游融合/规则 | 是 |
| Tracker | 跨帧关联与时序稳定 | 连续帧 + 检测/分割结果 | track result | 下游规则 | 是 |
| Rule Engine | 规则校验与告警 | 五段结果汇总 | rule check result | 下游输出/审计 | 是 |
| Confidence Fuser | 跨模块置信度融合 | detection/classification/track | fused result | 下游badcase判断 | 否（预留） |
| Badcase Memory | 存储难样本与原因 | fused + rule失败项 | badcase item | 下游反馈回流 | 否（预留） |
| OpenClaw Scheduler | 任务调度与编排 | 任务请求 + 策略 | 调度决策/执行单 | 驱动各模块 | 否（预留） |
| Feedback Loop | 回流登记与导出 | badcase item | feedback item | 下游重训触发 | 否（后续） |
| Auto Train/Eval/Deploy | 自动再训练与发布链 | feedback/retrain trigger | deploy decision | 闭环终点 | 否（后续） |
| Audit Logger | 全链路留痕 | 各模块事件 | 审计记录 | 贯穿全链路 | 是（最小） |

## 5. 目录建议（设计级）

```text
repo/
  apps/
    local-api/
      src/
        vision-branch/
          ingest/
          yolo/
          sam/
          classifier/
          tracker/
          rules/
          contracts/
          orchestration/
          audit/
    web-ui/
      src/
        pages/
          VisionBranch/           # 仅后续需要时
        components/
          vision/
  workers/
    vision-branch/
      executors/
      schedulers/
  packages/
    vision-contracts/
      src/
        results/
        events/
  docs/
    yolo_ten_hit_blueprint_v1.md
    yolo_branch_scope_lock_v1.md
    yolo_branch_not_in_scope_v1.md
  audit/
    yolo_branch_handoff_pack_v1.md
outputs/
  vision_branch/
    runs/
    badcases/
datasets/
  badcase_pool/
reports/
  vision_branch/
```

说明：本轮只设计目录，不要求一次性全部创建。

## 6. 数据流 / 状态流

### 6.1 主链数据流
1. 图像/视频进入 Ingest Gateway，生成 `ingest_payload`。
2. YOLO 输出 `detection result`。
3. SAM 基于检测框生成 `segmentation result`。
4. Classifier 基于裁剪图/掩码输出 `classification result`。
5. Tracker 聚合跨帧输出 `track result`。
6. Rule Engine 读取前述结果输出 `rule check result`。
7.（后续）Confidence Fuser 汇总得到 `fused result`。

### 6.2 badcase 与回流状态流
1. 规则失败或低置信条件触发 `badcase item`。
2. 写入难样本记忆库并打标签（原因、优先级、来源）。
3. 进入回流池生成 `feedback item`。
4. 满足策略阈值后形成 `retrain trigger payload`。
5. 触发自动训练/评估，最终产出 `deploy decision payload`。

### 6.3 状态建议
`queued -> running -> completed / failed / skipped`，并保留 `retriable` 标记。

## 7. 接口契约建议（文档级）

```ts
// detection result
interface DetectionResult {
  frame_id: string;
  boxes: Array<{ id: string; cls: string; score: number; xyxy: [number, number, number, number] }>;
  model_id: string;
  elapsed_ms: number;
}

// segmentation result
interface SegmentationResult {
  frame_id: string;
  segments: Array<{ det_id: string; mask_ref: string; area: number; score: number }>;
  model_id: string;
  elapsed_ms: number;
}

// classification result
interface ClassificationResult {
  frame_id: string;
  predictions: Array<{ target_id: string; label: string; score: number; topk?: Array<{ label: string; score: number }> }>;
  model_id: string;
  elapsed_ms: number;
}

// track result
interface TrackResult {
  sequence_id: string;
  tracks: Array<{ track_id: string; target_ids: string[]; stability: number; start_frame: string; end_frame: string }>;
  tracker_id: string;
  elapsed_ms: number;
}

// rule check result
interface RuleCheckResult {
  sequence_id: string;
  passed: boolean;
  violations: Array<{ code: string; level: 'warn' | 'error'; message: string; target_ref?: string }>;
  elapsed_ms: number;
}

// fused result
interface FusedResult {
  sequence_id: string;
  fused_items: Array<{ target_id: string; label: string; fused_score: number; evidence: string[] }>;
  confidence_policy: string;
}

// badcase item
interface BadcaseItem {
  id: string;
  source_type: 'rule_fail' | 'low_confidence' | 'manual_flag';
  source_ref: string;
  reason: string;
  payload_ref: string;
  priority: 'p0' | 'p1' | 'p2';
  created_at: string;
}

// feedback item
interface FeedbackItem {
  id: string;
  badcase_id: string;
  dataset_candidate_ref: string;
  status: 'new' | 'reviewed' | 'exported' | 'consumed';
  created_at: string;
}

// retrain trigger payload
interface RetrainTriggerPayload {
  trigger_id: string;
  model_family: string;
  dataset_refs: string[];
  reason: string;
  min_expected_gain?: number;
  require_approval: boolean;
}

// deploy decision payload
interface DeployDecisionPayload {
  decision_id: string;
  model_id: string;
  eval_report_ref: string;
  gate_passed: boolean;
  rollout_strategy: 'manual' | 'canary' | 'full';
  require_approval: boolean;
}
```

## 8. 风险项与控制

### 8.1 为什么不能污染主线
- 主线已封板，混入支线会破坏可回退性与可审计性。
- 支线迭代快，变更频繁，必须隔离风险。

### 8.2 为什么不能一口气上十连发
- 自动回流 + 自动训练/部署是高耦合高风险链。
- 无分期会导致定位困难、回归成本指数上升。

### 8.3 容易失控的模块
- 融合器阈值策略（误报/漏报平衡）。
- OpenClaw 调度（队列拥塞、任务风暴）。
- 自动部署决策（错误模型放量风险）。

### 8.4 必须人工审批的动作
- 训练数据入池合并。
- 自动训练触发（生产资源消耗）。
- 自动部署（任何非测试环境）。

### 8.5 必须先预留接口再施工的点
- badcase -> feedback -> retrain trigger 事件链。
- fuse result 与 rule result 的统一引用键。
- scheduler 执行状态回写契约。

## 9. 交付结论
- 本轮完成：蓝图、边界、职责、目录、数据流、契约、风险与接力设计。
- 本轮不做：五连发完整实现、自动闭环重开发、主线重构。
