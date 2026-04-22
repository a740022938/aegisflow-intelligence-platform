# dataset_version 第一版字段设计

## 完整字段清单

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | UUID | 是 | 主键 |
| dataset_id | UUID | 是 | 父数据集ID |
| version | string | 是 | 版本号，如 v1_20260416_001 |
| status | enum | 是 | draft/pending_review/approved/rejected/active/deprecated |
| task_type | string | 是 | detection/classification/segmentation |
| label_format | enum | 是 | yolo/coco/coco_person |

### 来源链 (source_chain)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| source_type | enum | flywheel_produced/manual_import/external_import |
| source_video_batch_id | UUID | 视频批次ID |
| source_frame_batch_id | UUID | 抽帧批次ID |
| prelabel_model_id | UUID | YOLO预标注模型ID |
| prelabel_model_version | string | YOLO模型版本 |
| classifier_model_id | UUID | 分类器模型ID |
| classifier_model_version | string | 分类器版本 |
| sam_version | string | SAM版本 |
| review_policy | enum | auto_approve/manual_review/reject_on_flag |
| production_chain | json | 完整链路追溯 |

### 质量链 (quality_chain)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| total_frames | int | 总帧数 |
| yolo_boxes | int | YOLO检测框数 |
| classifier_passed | int | 分类器通过数 |
| sam_refined | int | SAM精修数 |
| human_review_approved | int | 人工审核通过数 |
| human_review_rejected | int | 人工审核拒绝数 |
| negative_pool_count | int | 负样本池数量 |
| quality_metrics | json | 质量指标详情 |

### 治理链 (governance_chain)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| governance_status | enum | draft/pending_review/approved/rejected |
| approved_by | UUID | 审批人ID |
| approved_at | datetime | 审批时间 |
| approval_comment | string | 审批意见 |
| promotion_gate | enum | none/evaluation_ready/artifact_ready/promotion_ready |
| gate_checks | json | 闸门检查项 |

### 数据统计
| 字段名 | 类型 | 说明 |
|--------|------|------|
| sample_count | int | 样本总数 |
| train_count | int | 训练集数量 |
| val_count | int | 验证集数量 |
| test_count | int | 测试集数量 |
| class_count | int | 类别数 |
| storage_path | string | 存储路径 |
| split_manifest_path | string | 划分清单路径 |
| dataset_yaml_path | string | YAML配置文件路径 |

### 标准字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |
| created_by | UUID | 创建人 |
| description | string | 描述 |

## 完整 JSON 示例
```json
{
  "id": "dv-001",
  "dataset_id": "ds-mahjong-v1",
  "version": "v1_20260416_001",
  "status": "active",
  "task_type": "detection",
  "label_format": "yolo",
  
  "source_chain": {
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
  },
  
  "quality_chain": {
    "total_frames": 10000,
    "yolo_boxes": 45000,
    "classifier_passed": 42000,
    "sam_refined": 42000,
    "human_review_approved": 40000,
    "human_review_rejected": 2000,
    "negative_pool_count": 500,
    "quality_metrics": {
      "avg_boxes_per_frame": 4.5,
      "classifier_pass_rate": 0.933,
      "human_approval_rate": 0.952
    }
  },
  
  "governance_chain": {
    "governance_status": "approved",
    "approved_by": "user-001",
    "approved_at": "2026-04-16T10:00:00Z",
    "approval_comment": "质量达标，同意发布",
    "promotion_gate": "artifact_ready",
    "gate_checks": {
      "min_samples": 1000,
      "min_classes": 34,
      "quality_threshold": 0.85
    }
  },
  
  "sample_count": 40000,
  "train_count": 32000,
  "val_count": 5000,
  "test_count": 3000,
  "class_count": 34,
  "storage_path": "E:\\AGI_Factory\\datasets\\flywheel\\v1_20260416_001",
  "split_manifest_path": "E:\\AGI_Factory\\datasets\\flywheel\\v1_20260416_001\\splits.json",
  "dataset_yaml_path": "E:\\AGI_Factory\\datasets\\flywheel\\v1_20260416_001\\data.yaml",
  
  "created_at": "2026-04-16T08:00:00Z",
  "updated_at": "2026-04-16T10:00:00Z",
  "created_by": "user-001",
  "description": "麻将识别数据集 v1 - 飞轮生产首批"
}
```

---

*创建时间: 2026-04-16*
