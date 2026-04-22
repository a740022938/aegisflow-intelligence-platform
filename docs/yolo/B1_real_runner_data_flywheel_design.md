# B1 真实化施工 - 设计方案

**阶段**: Phase-B / B1  
**目标**: 把 sample/mock 最小飞轮升级成真实麻将数据飞轮  
**日期**: 2026-04-16

---

## 1. 背景与目标

### 1.1 当前状态
- Phase-A F1-F5: 最小飞轮已跑通 ✅
- 数据性质: sample/mock (模拟数据)
- Runner: mock training/evaluation

### 1.2 B1 核心目标
**真实化**: 接入真实 YOLO runner + 真实麻将数据链

---

## 2. 真实 YOLO Runner 接入

### 2.1 当前 Mock 实现
```typescript
// 当前: apps/local-api/src/training/index.ts
// _executeTrainingRun 中的 YOLO 分支是模拟执行
// 20 epochs 在 2 秒内完成，metrics 是随机生成
```

### 2.2 真实 Runner 架构

```
[API: POST /api/training/runs]
    ↓
[training/index.ts: createTrainingRun]
    ↓ execution_mode='yolo'
[training/index.ts: _executeTrainingRun]
    ↓
[Python: trainer_runner.py]
    ↓
[YOLOv8: ultralytics]
    ↓
[Outputs]
    - logs/ (训练日志)
    - checkpoints/ (epoch weights)
    - best.pt (最终产物)
    - metrics.json (指标)
```

### 2.3 Runner 调用协议

**Entry**: Python subprocess spawn
**Config**: JSON file passed via `--config`
**Input**: dataset_version path (images + labels YOLO format)
**Output**: structured logs + checkpoint files + metrics

```python
# trainer_runner.py 接口
python trainer_runner.py \
    --config /path/to/training_config.json \
    --dataset /path/to/dataset_version \
    --output /path/to/output_dir
```

### 2.4 Training Config Schema

```json
{
  "model_type": "yolov8n",
  "epochs": 100,
  "batch_size": 16,
  "imgsz": 640,
  "lr0": 0.01,
  "lrf": 0.01,
  "momentum": 0.937,
  "weight_decay": 0.0005,
  "warmup_epochs": 3.0,
  "box": 7.5,
  "cls": 0.5,
  "dfl": 1.5,
  "patience": 50,
  "save_period": 10,
  "device": "0",
  "workers": 8
}
```

### 2.5 Output Structure

```
/runs/train/{run_id}/
├── args.yaml              # 训练配置
├── results.csv            # 每 epoch 指标
├── train_batch*.jpg       # 训练样本可视化
├── val_batch*.jpg         # 验证样本可视化
├── labels.jpg             # 标签分布
├── confusion_matrix.png   # 混淆矩阵
├── F1_curve.png           # F1 曲线
├── PR_curve.png           # PR 曲线
├── P_curve.png            # Precision 曲线
├── R_curve.png            # Recall 曲线
├── weights/
│   ├── best.pt           # 最佳模型
│   ├── last.pt           # 最后模型
│   └── epoch_{n}.pt      # 每 save_period 保存
└── metrics.json          # 汇总指标
```

---

## 3. 真实麻将数据链接入

### 3.1 数据链完整流程

```
[视频批次]
    ↓ 视频接入 (S1)
[抽帧批次]
    ↓ 抽帧 (S2)
[帧图片]
    ↓ YOLO 粗标 (S3)
[YOLO 粗框]
    ↓ 分类器过滤 (S4)
[过滤后框]
    ↓ SAM 精修 (S5)
[精修框]
    ↓ 人工复核 (S6)
[review_pack]
    ↓ 发布 (S6)
[dataset_version]
```

### 3.2 数据库表扩展

#### video_batches (视频批次)
```sql
CREATE TABLE IF NOT EXISTS video_batches (
  id TEXT PRIMARY KEY,
  batch_code TEXT NOT NULL,
  source_type TEXT,  -- 'upload' | 'stream' | 'scrape'
  source_url TEXT,
  total_frames INTEGER,
  duration_seconds INTEGER,
  resolution TEXT,
  fps REAL,
  status TEXT DEFAULT 'pending',  -- pending | processing | completed | failed
  metadata_json TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

#### frame_extractions (抽帧批次)
```sql
CREATE TABLE IF NOT EXISTS frame_extractions (
  id TEXT PRIMARY KEY,
  video_batch_id TEXT,
  extraction_config_json TEXT,  -- {interval_sec, quality, resize}
  total_frames INTEGER,
  output_path TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT,
  updated_at TEXT
);
```

#### yolo_annotations (YOLO 粗框)
```sql
CREATE TABLE IF NOT EXISTS yolo_annotations (
  id TEXT PRIMARY KEY,
  frame_extraction_id TEXT,
  model_id TEXT,  -- 使用的 YOLO 模型
  annotation_data_json TEXT,  -- {image_id, boxes: [{class, x, y, w, h, conf}]}
  total_boxes INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TEXT,
  updated_at TEXT
);
```

#### classifier_verifications (分类器过滤)
```sql
-- 已有表: classifier_verifications (v3.9.0)
-- 扩展字段
ALTER TABLE classifier_verifications ADD COLUMN yolo_annotation_id TEXT;
ALTER TABLE classifier_verifications ADD COLUMN rejection_reason TEXT;
ALTER TABLE classifier_verifications ADD COLUMN confidence REAL;
```

#### sam_segmentations (SAM 精修)
```sql
-- 已有表: sam_segmentations (v3.8.0)
-- 扩展关联
ALTER TABLE sam_segmentations ADD COLUMN classifier_verification_id TEXT;
```

#### review_packs (人工复核包)
```sql
CREATE TABLE IF NOT EXISTS review_packs (
  id TEXT PRIMARY KEY,
  dataset_version_id TEXT,
  pack_type TEXT,  -- 'human_review' | 'auto_approved'
  total_samples INTEGER,
  reviewed_samples INTEGER DEFAULT 0,
  approved_samples INTEGER DEFAULT 0,
  rejected_samples INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',  -- pending | reviewing | completed
  reviewer_assignee TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### 3.3 数据链状态机

| 阶段 | 表 | 输入状态 | 输出状态 |
|------|-----|----------|----------|
| S1 视频接入 | video_batches | - | pending → processing → completed |
| S2 抽帧 | frame_extractions | video_batches.completed | pending → processing → completed |
| S3 YOLO 粗标 | yolo_annotations | frame_extractions.completed | pending → processing → completed |
| S4 分类器过滤 | classifier_verifications | yolo_annotations.completed | pending → verified/rejected |
| S5 SAM 精修 | sam_segmentations | classifier_verifications.verified | pending → completed |
| S6 人工复核 | review_packs | sam_segmentations.completed | pending → reviewing → completed |
| S6 发布 | dataset_versions | review_packs.completed | pending → approved |

---

## 4. 真实训练闭环

### 4.1 闭环流程

```
[dataset_version: approved]
    ↓
[POST /api/training/runs]
    ↓ execution_mode='yolo'
[training_run: pending]
    ↓
[Python: trainer_runner.py --dataset dataset_version_path]
    ↓
[training_run: running]
    ↓ epochs...
[training_run: success]
    ↓
[artifact: best.pt + metrics.json]
    ↓
[POST /api/evaluations]
    ↓ execution_mode='yolo_eval'
[evaluation: pending]
    ↓
[Python: eval_runner.py --model best.pt --dataset val_set]
    ↓
[evaluation: completed]
    ↓ promote_gate check
[model: candidate | rejected]
```

### 4.2 Dataset Version → YOLO Format

```python
# dataset_version 目录结构
/dataset_versions/{version_id}/
├── data.yaml          # YOLO 数据集配置
├── train/
│   ├── images/
│   │   └── *.jpg
│   └── labels/
│       └── *.txt      # YOLO format: class x_center y_center width height
├── val/
│   ├── images/
│   └── labels/
└── test/ (optional)
    ├── images/
    └── labels/
```

**data.yaml**:
```yaml
path: /dataset_versions/{version_id}
train: train/images
val: val/images
test: test/images

nc: 34
names: ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
        '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
        '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
        '1z', '2z', '3z', '4z', '5z', '6z', '7z']
```

---

## 5. Badcase / Negative Pool 回流

### 5.1 Badcase 来源

| 来源 | 类型 | 说明 |
|------|------|------|
| UI 误检 | false_positive | 用户标记的错误检测 |
| 假框 | fake_box | 分类器过滤掉的假框 |
| 漏检 | miss_detection | 未检测到的目标 |
| 冲突样本 | conflict | 多模型预测冲突 |
| 低置信度 | low_confidence | conf < threshold |

### 5.2 Negative Pool 表

```sql
-- 已有表: negative_pools (F2)
-- 扩展字段
ALTER TABLE negative_pools ADD COLUMN badcase_type TEXT;  -- false_positive | miss_detection | conflict | low_confidence
ALTER TABLE negative_pools ADD COLUMN source_image_id TEXT;
ALTER TABLE negative_pools ADD COLUMN source_box_json TEXT;  -- {x, y, w, h, class, conf}
ALTER TABLE negative_pools ADD COLUMN reviewed_by TEXT;
ALTER TABLE negative_pools ADD COLUMN reviewed_at TEXT;
ALTER TABLE negative_pools ADD COLUMN reuse_count INTEGER DEFAULT 0;
ALTER TABLE negative_pools ADD COLUMN last_reused_at TEXT;
```

### 5.3 回流流程

```
[Badcase 发现]
    ↓
[negative_pools 记录]
    ↓
[人工复核]
    ↓
[确认有效]
    ↓
[dataset_version 下一版本纳入]
    ↓
[训练时作为 hard negative]
```

---

## 6. 实施步骤

### Step 1: 数据库扩展
- [ ] 创建 video_batches 表
- [ ] 创建 frame_extractions 表
- [ ] 创建 yolo_annotations 表
- [ ] 扩展 classifier_verifications 表
- [ ] 扩展 sam_segmentations 表
- [ ] 创建 review_packs 表
- [ ] 扩展 negative_pools 表

### Step 2: Python Runner 实现
- [ ] 实现 trainer_runner.py
- [ ] 实现 eval_runner.py
- [ ] 实现 frame_extractor.py
- [ ] 实现 yolo_annotator.py
- [ ] 实现 classifier_filter.py
- [ ] 实现 sam_refiner.py

### Step 3: API 对接
- [ ] 修改 training/index.ts 调用真实 runner
- [ ] 修改 evaluations/index.ts 调用真实 eval
- [ ] 创建 video-batches API
- [ ] 创建 frame-extractions API
- [ ] 创建 data-pipeline API (S1-S6 编排)

### Step 4: 验证
- [ ] 1 个真实 video_batch 入链
- [ ] 1 个真实 dataset_version 生成
- [ ] 1 条真实 YOLO 训练启动
- [ ] 1 条真实 evaluation 生成
- [ ] 1 条真实 negative_pool 沉淀

---

## 7. 验证清单

### 7.1 数据链验证

| 验证项 | 通过标准 |
|--------|----------|
| video_batch 创建 | 返回 ID，状态 pending |
| frame_extraction 执行 | 生成帧图片，状态 completed |
| yolo_annotation 执行 | 生成粗框，状态 completed |
| classifier_verification 执行 | 过滤假框，状态 verified/rejected |
| sam_segmentation 执行 | 精修框，状态 completed |
| review_pack 完成 | 人工复核完成，状态 completed |
| dataset_version 发布 | governance_status=approved |

### 7.2 训练闭环验证

| 验证项 | 通过标准 |
|--------|----------|
| training_run 创建 | execution_mode=yolo，状态 pending |
| trainer_runner 启动 | Python 进程启动，日志输出 |
| checkpoint 生成 | epoch_{n}.pt 文件存在 |
| best.pt 生成 | 最终产物存在 |
| metrics.json 生成 | 包含 mAP50/mAP50-95 |
| evaluation 执行 | eval_runner 启动，生成报告 |
| promote_gate 判定 | passed/failed 状态正确 |
| model 归档 | promotion_status=candidate |

### 7.3 Negative Pool 验证

| 验证项 | 通过标准 |
|--------|----------|
| badcase 记录 | negative_pools 有记录 |
| 类型标记 | badcase_type 正确 |
| 复核流程 | reviewed_by/reviewed_at 记录 |
| 版本纳入 | 下一 dataset_version 包含 |

---

## 8. 风险与边界

### 8.1 技术风险
1. **GPU 依赖**: 真实训练需要 GPU，无 GPU 环境需降级为 CPU 模式
2. **数据量**: 真实视频数据量大，需考虑存储和传输
3. **训练时长**: 真实训练耗时数小时，需异步执行

### 8.2 边界约束
1. 单节点执行，分布式训练在 Phase-C 实现
2. 数据链各阶段串行执行，并行优化后续扩展
3. 人工复核环节先走简化流程，完整工作流后续扩展

---

**设计者**: Agent 代可行-1  
**日期**: 2026-04-16
