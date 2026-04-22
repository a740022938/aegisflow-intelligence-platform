# YOLO Phase-A 当前可演示能力清单

- 状态: 可演示（基于 Phase-A 已封板基线）
- 版本口径: F1 ~ F5（最小范围版）

## A. 训练主链（Real）

1. 以 YOLO 数据集样板触发真实训练
2. 训练执行模式可见（`execution_mode=real`）
3. 产物路径可追踪:
   - `run_dir`
   - `best_pt`
   - `last_pt`
   - `checkpoint_path`
4. 实验记录可查看训练索引（`metrics_json.artifact_index`）

## B. 评估主链（Real）

1. 基于训练权重触发真实评估
2. 评估结果状态可查（completed/failed）
3. 报告与清单路径可追踪:
   - `report_path`
   - `eval_manifest_path`
   - `badcases_manifest_path`
   - `hardcases_manifest_path`
4. 实验记录可查看评估索引（`metrics_json.eval_index`）

## C. 工作流可观测性

1. Workflow job 级状态可追踪（pending/running/completed/failed）
2. Step 级执行日志可追踪
3. 失败原因可在 job/step 维度定位

## D. UI 最小可见能力

1. Training 详情可见 `output_dir`、`checkpoint_path`
2. Training 详情可见 artifact/eval index 关键字段
3. 空值文案已按最小口径收口（未产出/暂无记录）

## E. 演示建议路径

1. 创建/选择样板实验 -> 触发 train_model（real）
2. 验证 `best_pt/last_pt/checkpoint_path` 回写
3. 触发 evaluate_model（real）
4. 验证 evaluation 顶层路径与 experiment 索引同步
