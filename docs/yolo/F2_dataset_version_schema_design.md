# F2 数据集版本化 - 数据库设计

## 1. 设计目标

将 dataset_version 做成系统里的真实治理对象，具备：
- 版本化追踪
- 来源链追溯
- 质量链量化
- 治理链审批

## 2. 现有表分析

### 2.1 现有 datasets 表 (关键字段)
```sql
CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  dataset_code TEXT NOT NULL,
  name TEXT,
  version TEXT,
  status TEXT DEFAULT 'draft',
  task_type TEXT,
  label_format TEXT,
  sample_count INTEGER DEFAULT 0,
  train_count INTEGER DEFAULT 0,
  val_count INTEGER DEFAULT 0,
  test_count INTEGER DEFAULT 0,
  storage_path TEXT,
  description TEXT,
  created_at TEXT,
  updated_at TEXT,
  source_task_id TEXT,
  source_template_code TEXT,
  meta_json TEXT,
  label_map_json TEXT,
  tags_json TEXT
);
```

## 3. 扩展方案选择

### 方案 A: 扩展现有 datasets 表 (推荐)
在现有表中添加新列，兼容性好，但列数会增加

### 方案 B: 新建 dataset_versions 表
更清晰的数据模型，但需要关联查询

### 方案决策: 方案 B (新建表)
理由：
1. dataset_version 是独立治理对象，与 dataset 是 1:N 关系
2. 治理字段(source_chain, quality_chain, governance_chain)独立管理更清晰
3. 避免 meta_json 过于膨胀

## 4. 新表设计

### 4.1 主表: dataset_versions

```sql
CREATE TABLE dataset_versions (
  -- 核心字段
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL,           -- 关联 datasets.id
  version TEXT NOT NULL,               -- 版本号: v1_20260416_001
  status TEXT DEFAULT 'draft',        -- draft/pending_review/approved/rejected/active/deprecated
  task_type TEXT NOT NULL,             -- detection/classification/segmentation
  label_format TEXT NOT NULL,          -- yolo/coco/coco_person
  
  -- 来源链 (source_chain) - JSON 存储
  source_chain_json TEXT,              -- 完整来源追溯 JSON
  
  -- 质量链 (quality_chain) - JSON 存储
  quality_chain_json TEXT,             -- 质量指标 JSON
  
  -- 治理链 (governance_chain) - JSON 存储
  governance_chain_json TEXT,         -- 治理信息 JSON
  
  -- 数据统计 (冗余存储，便于查询)
  sample_count INTEGER DEFAULT 0,
  train_count INTEGER DEFAULT 0,
  val_count INTEGER DEFAULT 0,
  test_count INTEGER DEFAULT 0,
  class_count INTEGER DEFAULT 0,
  storage_path TEXT,
  split_manifest_path TEXT,
  dataset_yaml_path TEXT,
  
  -- 标准字段
  description TEXT,
  created_at TEXT,
  updated_at TEXT,
  created_by TEXT,
  
  -- 约束
  FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

CREATE INDEX idx_dataset_versions_dataset_id ON dataset_versions(dataset_id);
CREATE INDEX idx_dataset_versions_status ON dataset_versions(status);
CREATE INDEX idx_dataset_versions_version ON dataset_versions(version);
```

### 4.2 批次关联表: dataset_version_batches

记录 dataset_version 与各环节批次的关联

```sql
CREATE TABLE dataset_version_batches (
  id TEXT PRIMARY KEY,
  dataset_version_id TEXT NOT NULL,
  batch_type TEXT NOT NULL,           -- video/frame/yolo/classifier/sam/review
  batch_id TEXT NOT NULL,             -- 批次ID
  batch_status TEXT,                  -- 批次状态
  record_count INTEGER DEFAULT 0,     -- 记录数
  created_at TEXT,
  
  FOREIGN KEY (dataset_version_id) REFERENCES dataset_versions(id)
);

CREATE INDEX idx_dvb_dataset_version ON dataset_version_batches(dataset_version_id);
CREATE INDEX idx_dvb_batch_type ON dataset_version_batches(batch_type);
```

### 4.3 负样本池表: negative_pools

记录被过滤的样本，用于后续回流训练

```sql
CREATE TABLE negative_pools (
  id TEXT PRIMARY KEY,
  dataset_version_id TEXT NOT NULL,  -- 关联的 dataset_version
  pool_version TEXT NOT NULL,         -- 负样本池版本
  rejection_reason TEXT,              -- 拒绝原因: classifier_reject/human_reject/quality_fail
  source_batch_type TEXT,             -- 来源批次类型
  source_batch_id TEXT,              -- 来源批次ID
  sample_identifier TEXT NOT NULL,   -- 样本标识 (图片路径/帧ID)
  label_data TEXT,                   -- 原标签数据 (JSON)
  rejection_metadata TEXT,            -- 拒绝元数据 (JSON)
  reused_count INTEGER DEFAULT 0,    -- 已复用次数
  last_reused_at TEXT,
  created_at TEXT,
  
  FOREIGN KEY (dataset_version_id) REFERENCES dataset_versions(id)
);

CREATE INDEX idx_negative_pool_version ON negative_pools(pool_version);
CREATE INDEX idx_negative_pool_rejection_reason ON negative_pools(rejection_reason);
CREATE INDEX idx_negative_pool_sample ON negative_pools(sample_identifier);
```

### 4.4 治理审批表: dataset_version_approvals

```sql
CREATE TABLE dataset_version_approvals (
  id TEXT PRIMARY KEY,
  dataset_version_id TEXT NOT NULL,
  approval_status TEXT NOT NULL,      -- pending/approved/rejected
  approver_id TEXT,
  approver_name TEXT,
  approval_comment TEXT,
  gate_level TEXT,                   -- evaluation_ready/artifact_ready/promotion_ready
  gate_checks_json TEXT,             -- 闸门检查结果
  created_at TEXT,
  updated_at TEXT,
  
  FOREIGN KEY (dataset_version_id) REFERENCES dataset_versions(id)
);
```

## 5. JSON 字段结构

### 5.1 source_chain_json 结构
```json
{
  "source_type": "flywheel_produced",
  "source_video_batch_id": "vb-001",
  "source_frame_batch_id": "fb-001",
  "prelabel_model_id": "model-yolo-v1",
  "prelabel_model_version": "yolov8n-v1.0",
  "classifier_model_id": "model-classifier-v1",
  "classifier_model_version": "v1.0.0",
  "sam_version": "1.0",
  "review_policy": "manual_review",
  "production_chain": ["video_batch","frame_extract","yolo_prelabel","classifier_filter","sam_refine","human_review","dataset_version"]
}
```

### 5.2 quality_chain_json 结构
```json
{
  "total_frames": 10000,
  "yolo_boxes": 45000,
  "classifier_passed": 42000,
  "classifier_rejected": 3000,
  "sam_refined": 42000,
  "human_review_approved": 40000,
  "human_review_rejected": 2000,
  "negative_pool_count": 5000,
  "quality_metrics": {
    "avg_boxes_per_frame": 4.5,
    "classifier_pass_rate": 0.933,
    "human_approval_rate": 0.952,
    "precision_recall_by_class": {}
  }
}
```

### 5.3 governance_chain_json 结构
```json
{
  "governance_status": "approved",
  "approved_by": "user-001",
  "approved_at": "2026-04-16T10:00:00Z",
  "approval_comment": "质量达标，同意发布",
  "promotion_gate": "artifact_ready",
  "gate_checks": {
    "min_samples": 1000,
    "min_classes": 34,
    "quality_threshold": 0.85,
    "checks_passed": true
  },
  "version_history": [
    {"version": "v1_20260416_001", "status": "active", "created_at": "2026-04-16T10:00:00Z"}
  ]
}
```

## 6. 主链路关联设计

### 6.1 dataset_version 与 Tasks 关联
- 通过 `source_task_id` 关联到执行的任务
- 通过 `dataset_version_batches` 关联各环节批次

### 6.2 dataset_version 与 Training 关联
- Training 任务使用 `dataset_version_id` 作为输入
- 训练产出关联到 `dataset_version`

### 6.3 dataset_version 与 Models/Evaluations 关联
- Model 记录关联 `training_dataset_version_id`
- Evaluation 记录关联 `dataset_version_id` 和 `model_id`

## 7. 飞轮数据入口设计

```
视频批次 (video_batch)
    ↓
抽帧批次 (frame_batch) 
    ↓
YOLO粗框批次 (yolo_batch) - 使用 vision-yolo 插件
    ↓
分类器过滤批次 (classifier_batch) - 使用 vision-mahjong-classifier 插件
    ↓
SAM精修批次 (sam_batch) - 使用 vision-sam 插件
    ↓
review_pack (人工复核)
    ↓
dataset_version (发布版本)
    ↓
负样本池 (negative_pool) - 收集被过滤的样本
```

每个批次通过 `dataset_version_batches` 表关联到 `dataset_version`

## 8. 负样本池设计

### 8.1 样本沉淀
- 分类器过滤时被拒绝的样本 → 记录到 negative_pools
- 人工复核时被拒绝的样本 → 记录到 negative_pools
- 质量检查不通过的样本 → 记录到 negative_pools

### 8.2 回流机制
- negative_pool 积累一定数量后可发起回流任务
- 回流任务使用负样本重新训练
- 每次复用增加 reused_count

### 8.3 negative_pool_version
- 格式: `npv_{dataset_version_id}_{timestamp}`
- 例如: `npv_dv-001_20260416_1430`

---

*创建时间: 2026-04-16*
