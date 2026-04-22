# Phase-C / C3 整改训练与再评估 - 设计文档

**阶段**: Phase-C / C3  
**版本**: v1.0.0  
**日期**: 2026-04-16  

---

## 1. 目标

基于 C2 的整改计划，执行实际整改并再评估：
1. 整改训练 - 基于 badcase 回流资产重新训练
2. 关键样本修正 - 处理 critical badcase
3. 再评估 - 新 artifact 真实 evaluation
4. Production gate 再判定 - ready_for_production 或 still_blocked
5. 回滚与晋升准备 - 保留 rollback_target，准备 production 晋升

---

## 2. 当前状态 (C2 结束)

### Model 信息

| 字段 | 值 |
|------|-----|
| model_id | 3fda2a52-2943-4e34-99ce-97a1428a7688 |
| promotion_status | shadow_validating |
| production_gate_status | failed |
| rollback_target_id | 78dd44a1-d3f8-471e-89d9-edc9598c1f8a |

### 阻塞项

| 阻塞项 | 详情 | 整改动作 |
|--------|------|----------|
| metrics regression | mAP50 -6.5%, Recall -4.7% | 重新训练 |
| critical badcase | 1 个 (frame_001) | 样本修正 |

### Badcase 资产

| 来源 | 样本 | 整改用途 |
|------|------|----------|
| negative_pool | frame_001, frame_002 | 训练数据增强 |
| review_pack | frame_001 | 人工修正 |
| retrain_candidates | frame_002 | 漏检补标 |

---

## 3. 整改训练方案

### 3.1 训练数据来源

```
原始训练数据 (B1)
    ↓
+ negative_pool 样本 (frame_001, frame_002)
    ↓
+ review_pack 修正样本 (frame_001 修正后)
    ↓
+ retrain_candidates 补标样本 (frame_002 补标后)
    ↓
新 dataset_version (v2_remediation)
```

### 3.2 训练参数调整

| 参数 | 原值 | 新值 | 原因 |
|------|------|------|------|
| epochs | 5 | 50 | 提升收敛 |
| batch_size | 2 | 4 | 稳定训练 |
| imgsz | 640 | 640 | 保持不变 |
| lr0 | 0.01 | 0.01 | 保持不变 |

### 3.3 训练执行

**API**: POST /api/runs
```json
{
  "name": "C3-Remediation-Training",
  "executor_type": "yolo",
  "dataset_version_id": "<new_dataset_version_id>",
  "yolo_config_json": {
    "model_type": "yolov8n",
    "epochs": 50,
    "batch_size": 4,
    "imgsz": 640
  },
  "execution_mode": "yolo"
}
```

---

## 4. 关键样本修正

### 4.1 frame_001 (UI误检)

**问题**: False positive, over-confident on background
**修正**: 
1. SAM 精修框位置
2. 人工确认框边界
3. 标记为 hard negative

**API**: POST /api/sam-segmentations
```json
{
  "sample_id": "frame_001",
  "correction_type": "box_refinement",
  "refined_box": [x1, y1, x2, y2],
  "confidence_adjustment": -0.3
}
```

### 4.2 frame_002 (漏检)

**问题**: False negative, missed detection in low light
**修正**:
1. 人工补标目标
2. 增加低光增强样本
3. 标记为 positive sample

**API**: POST /api/data-chain/yolo-annotations
```json
{
  "frame_extraction_id": "<frame_id>",
  "annotation_data_json": {
    "boxes": [[x1, y1, x2, y2]],
    "labels": ["mahjong_tile"],
    "confidence": 1.0
  },
  "is_manual": true
}
```

---

## 5. 再评估流程

### 5.1 评估对比矩阵

| 模型 | 状态 | mAP50 | Precision | Recall |
|------|------|-------|-----------|--------|
| Baseline | in_production | 0.915 | 0.8826 | 0.8466 |
| Blocked Candidate | failed | 0.85 | 0.85 | 0.80 |
| Retrained Candidate | evaluating | TBD | TBD | TBD |

### 5.2 Shadow Validation 重跑

**API**: POST /api/shadow-validations/:id/revalidate

**预期改善**:
- mAP50: 0.85 → 0.92 (+8.2%)
- Recall: 0.80 → 0.88 (+10%)

### 5.3 Production Gate 再判定

**通过标准**:
- shadow_validation: passed
- manual_approval: passed
- no_critical_badcases: passed
- rollback_ready: passed

**结果**: ready_for_production 或 still_blocked

---

## 6. API 设计

### 6.1 整改训练

```http
// 创建整改训练 run
POST /api/runs/remediation-training
{
  "base_model_id": "3fda2a52-2943-4e34-99ce-97a1428a7688",
  "dataset_version_id": "<new_version>",
  "remediation_config": {
    "include_negative_pool": true,
    "include_review_pack": true,
    "include_retrain_candidates": true,
    "epochs": 50
  }
}

// 获取训练进度
GET /api/runs/:id/remediation-status
```

### 6.2 样本修正

```http
// 修正 badcase
POST /api/badcases/:id/correct
{
  "correction_type": "box_refinement|missed_detection|classifier_conflict",
  "corrected_data": {},
  "verified_by": "admin_001"
}

// 批量修正
POST /api/shadow-validations/:id/badcases/bulk-correct
{
  "corrections": [
    { "sample_id": "frame_001", "type": "box_refinement" },
    { "sample_id": "frame_002", "type": "missed_detection" }
  ]
}
```

### 6.3 再评估

```http
// 创建再评估 evaluation
POST /api/evaluations/remediation
{
  "base_evaluation_id": "39507d48-be15-42e7-aa17-4dda3381879f",
  "new_artifact_id": "<new_artifact_id>",
  "comparison_mode": true
}

// 获取对比报告
GET /api/evaluations/:id/comparison-report
```

### 6.4 Production Gate 最终判定

```http
// 最终 production gate 检查
POST /api/models/:id/final-production-gate

// 返回结果
{
  "status": "ready_for_production" | "still_blocked",
  "blockers": [],
  "recommendation": "..."
}
```

---

## 7. 报告格式

### 7.1 整改训练报告

```json
{
  "remediation_run_id": "...",
  "base_model_id": "3fda2a52-2943-4e34-99ce-97a1428a7688",
  "dataset_changes": {
    "original_samples": 2,
    "added_from_negative_pool": 2,
    "added_from_review_pack": 1,
    "added_from_retrain_candidates": 1,
    "total_samples": 6
  },
  "training_config_changes": {
    "epochs": { "from": 5, "to": 50 },
    "batch_size": { "from": 2, "to": 4 }
  },
  "training_result": {
    "status": "success",
    "best_mAP50": 0.92,
    "total_epochs": 50,
    "artifact_id": "..."
  }
}
```

### 7.2 样本修正报告

```json
{
  "correction_summary": {
    "total_corrected": 2,
    "by_type": {
      "box_refinement": 1,
      "missed_detection": 1
    }
  },
  "details": [
    {
      "sample_id": "frame_001",
      "type": "box_refinement",
      "before": { "box": [100, 100, 200, 200], "confidence": 0.95 },
      "after": { "box": [105, 98, 195, 202], "confidence": 0.85 },
      "verified_by": "admin_001"
    },
    {
      "sample_id": "frame_002",
      "type": "missed_detection",
      "before": { "detected": false },
      "after": { "detected": true, "box": [300, 300, 400, 400] },
      "verified_by": "admin_001"
    }
  ]
}
```

### 7.3 再评估对比报告

```json
{
  "comparison": {
    "baseline": {
      "model_id": "78dd44a1-d3f8-471e-89d9-edc9598c1f8a",
      "mAP50": 0.915,
      "precision": 0.8826,
      "recall": 0.8466
    },
    "blocked_candidate": {
      "model_id": "3fda2a52-2943-4e34-99ce-97a1428a7688",
      "mAP50": 0.85,
      "precision": 0.85,
      "recall": 0.80
    },
    "retrained_candidate": {
      "model_id": "<new_model_id>",
      "mAP50": 0.92,
      "precision": 0.90,
      "recall": 0.88
    }
  },
  "improvement": {
    "vs_blocked": {
      "mAP50": +0.07,
      "precision": +0.05,
      "recall": +0.08
    },
    "vs_baseline": {
      "mAP50": +0.005,
      "precision": +0.0174,
      "recall": +0.0334
    }
  },
  "conclusion": "ready_for_production"
}
```

### 7.4 Production Gate 最终判定报告

```json
{
  "model_id": "<new_model_id>",
  "final_status": "ready_for_production",
  "gate_checks": {
    "shadow_validation": { "passed": true, "detail": "mAP50 0.92 > baseline 0.915" },
    "manual_approval": { "passed": true, "detail": "approved_by=admin_001" },
    "no_critical_badcases": { "passed": true, "detail": "0 critical badcases" },
    "rollback_ready": { "passed": true, "detail": "rollback_target set" }
  },
  "blockers": [],
  "recommendation": "Ready for production deployment",
  "next_steps": [
    "Execute promote-to-production",
    "Monitor production metrics",
    "Collect production feedback"
  ]
}
```

---

## 8. 实现计划

### 8.1 API 实现

1. `runs/index.ts` - 添加 remediation training API
2. `shadow-validations/index.ts` - 添加 bulk correction API
3. `evaluations/index.ts` - 添加 comparison report API
4. `models/index.ts` - 添加 final production gate API

### 8.2 报告生成

1. 整改训练报告
2. 样本修正报告
3. 再评估对比报告
4. Production gate 最终判定报告

---

## 9. 验证清单

- [ ] 整改训练成功
- [ ] Critical badcase 被处理
- [ ] 真实再评估成功
- [ ] Production gate 再判定
- [ ] 最终状态明确: ready_for_production 或 still_blocked

---

## 10. 验收标准

| 验收项 | 标准 | 状态 |
|--------|------|------|
| 整改训练 | 新 run 成功，artifact 生成 | 待验证 |
| 样本修正 | 2 个 badcase 被修正 | 待验证 |
| 再评估 | 指标对比报告 | 待验证 |
| Gate 判定 | 明确二选一结果 | 待验证 |
| 回滚准备 | rollback_target 保留 | 待验证 |

---

**设计完成**: 2026-04-16  
**设计者**: Agent 代可行-1
