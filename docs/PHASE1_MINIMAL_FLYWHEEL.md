# 第一阶段：最小飞轮样板施工文档

## 阶段状态

- [x] F1: YOLO 链路注册 (Task/Template/Audit) - 验收通过 ✅
- [x] F2: 数据集版本化 - 实现完成，验收通过 ✅
- [x] F3: YOLO 训练闭环 - 实现完成，验收通过 ✅
- [x] F4: 评估与归档 - 实现完成，验收通过 ✅
- [x] F5: UI/API 收口与样板任务验收 - 实现完成，验收通过 ✅

**Phase-A 状态**: F1-F5 全部完成 ✅

## 1. 最小飞轮链路

```
视频批次 → 抽帧 → YOLO粗框 → 分类器删假框 → SAM精修 → review_pack → dataset_version → YOLO训练 → 评估 → 模型晋升
```

## 2. 模板清单

### 2.1 现有可用模板
| 模板ID | 名称 | 状态 | 用途 |
|--------|------|------|------|
| tpl-vision-pipeline-e2e | Vision Pipeline E2E | active | 视觉链路主模板 |
| tpl-mahjong-detect | 麻将检测 | planned | YOLO检测 |
| tpl-mahjong-classify | 麻将分类 | planned | 分类器 |
| tpl-mahjong-fusion | 麻将联合识别 | planned | 融合推理 |

### 2.2 需要新建的模板
| 模板ID | 名称 | 用途 |
|--------|------|------|
| tpl-flywheel-minimal | 最小飞轮样板 | 视频→数据集→训练→评估→晋升 |

## 3. dataset_version 第一版字段设计

详见: `docs/yolo/dataset_version_fields_v1.md`

### 核心字段清单
| 字段 | 类型 | 说明 |
|------|------|------|
| source_type | enum | flywheel_produced/manual_import/external_import |
| source_video_batch_id | UUID | 视频批次ID |
| source_frame_batch_id | UUID | 抽帧批次ID |
| prelabel_model_id | UUID | YOLO预标注模型ID |
| classifier_model_id | UUID | 分类器模型ID |
| sam_version | string | SAM版本 |
| review_policy | enum | 审核策略 |
| governance_status | enum | 治理状态 |
| promotion_gate | enum | 当前闸门 |
| sample_count | int | 样本数 |
| storage_path | string | 存储路径 |

### 3.2 质量链 (quality_chain)
```json
{
  "total_frames": 1000,
  "yolo_boxes": 5000,
  "classifier_passed": 4500,
  "sam_refined": 4500,
  "human_review_approved": 4200,
  "human_review_rejected": 300,
  "rejected_frames": 300,
  "negative_pool_count": 500,
  "quality_metrics": {
    "avg_boxes_per_frame": 4.5,
    "classifier_pass_rate": 0.9,
    "human_approval_rate": 0.933
  }
}
```

### 3.3 治理链 (governance_chain)
```json
{
  "governance_status": "draft | pending_review | approved | rejected",
  "approved_by": "user_id",
  "approved_at": "ISO timestamp",
  "promotion_gate": "none | evaluation_ready | artifact_ready | promotion_ready",
  "gate_checks": {
    "min_samples": 1000,
    "min_classes": 34,
    "quality_threshold": 0.85
  }
}
```

### 3.4 完整 dataset_version 字段
```json
{
  "id": "uuid",
  "dataset_id": "父数据集ID",
  "version": "v1_20260416_001",
  "status": "draft | active | deprecated",
  
  // 来源链
  "source_chain": { ... },
  
  // 质量链  
  "quality_chain": { ... },
  
  // 治理链
  "governance_chain": { ... },
  
  // 标准字段
  "sample_count": 4200,
  "class_count": 34,
  "storage_path": "E:\\AGI_Factory\\datasets\\flywheel\\v1_20260416_001",
  
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

## 4. 插件清单与主程序边界

### 4.1 主程序保留 (飞轮主干)
| 模块 | 职责 |
|------|------|
| Tasks | 任务管理 |
| Templates | 模板管理 |
| Datasets | 数据集管理(含version) |
| Training | 模型训练 |
| Evaluations | 评估 |
| Models | 模型管理 |
| Audit | 审计 |
| Gates | 晋升闸门 |

### 4.2 插件层 (复杂能力)
| 插件ID | 名称 | 状态 | 职责 |
|--------|------|------|------|
| vision-yolo | YOLO粗标 | frozen | 目标检测初标 |
| vision-mahjong-classifier | 分类器 | active | 判断麻将/非麻将，删假框 |
| vision-sam | SAM精修 | active | 精细分割 |
| vision-tracker | Tracker | planned | 目标跟踪 |
| vision-rule-engine | 规则引擎 | planned | 业务规则 |
| vision-fusion | 融合 | planned | 多模型融合 |

### 4.3 待开发插件
| 插件ID | 名称 | 用途 |
|--------|------|------|
| video_ingest | 视频接入 | 视频批次管理 |
| frame_extract | 抽帧 | 视频转图片 |
| badcase_builder | 坏样本构建 | 负样本池管理 |
| report_enhancer | 报表增强 | 评估报告增强 |
| export_package | 导出打包 | 数据导出 |
| feedback_loop | 反馈回流 | 生产模型坏样本回流 |

## 5. 链路步骤定义

### 5.1 最小飞轮模板步骤
```json
{
  "workflow_steps": [
    {"step_key": "video_ingest", "step_name": "视频接入", "step_order": 1},
    {"step_key": "frame_extract", "step_name": "抽帧", "step_order": 2},
    {"step_key": "yolo_prelabel", "step_name": "YOLO粗框", "step_order": 3},
    {"step_key": "classifier_filter", "step_name": "分类器过滤", "step_order": 4},
    {"step_key": "sam_refine", "step_name": "SAM精修", "step_order": 5},
    {"step_key": "human_review", "step_name": "人工复核", "step_order": 6, "require_approval": true},
    {"step_key": "dataset_publish", "step_name": "发布数据集版本", "step_order": 7},
    {"step_key": "train_model", "step_name": "YOLO训练", "step_order": 8},
    {"step_key": "evaluate_model", "step_name": "评估", "step_order": 9},
    {"step_key": "model_promotion", "step_name": "模型晋升", "step_order": 10, "require_approval": true}
  ]
}
```

## 6. 下一步工作

- [ ] 创建 tpl-flywheel-minimal 模板
- [ ] 扩展 dataset_versions 表，添加 source_chain, quality_chain, governance_chain 字段
- [ ] 实现 video_ingest 插件 (或使用现有能力)
- [ ] 实现 frame_extract 插件
- [ ] 打通分类器过滤流程
- [ ] 打通 SAM 精修流程
- [ ] 实现人工复核 UI
- [ ] 实现 dataset_version 发布流程

---

*本文档为第一阶段施工指南，将持续更新*
*创建时间: 2026-04-16*
