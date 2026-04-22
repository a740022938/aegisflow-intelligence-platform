# Phase-B / B2 真实评估与真实晋升 - 设计文档

**阶段**: Phase-B / B2  
**版本**: v1.0.0  
**日期**: 2026-04-16  

---

## 1. 目标

实现真实评估与晋升闭环：
1. 真实 evaluation runner - 调用 Python eval_runner.py 执行真实评估
2. 真实 promote gate - 基于真实指标判定 pass/fail
3. 真实 model 归档 - 从真实 artifact 生成 model 记录
4. 强链中间环节 - lineage 展示 classifier_filter / sam_refine / review_pack

---

## 2. 架构设计

### 2.1 评估流程

```
┌─────────────────┐
│  Create Eval    │
│  (artifact +    │
│   dataset_v)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Execute Eval   │
│  (spawn Python) │
│  eval_runner.py │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse Metrics  │
│  (mAP50 etc.)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Promote Gate   │
│  (4 checks)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐  ┌────────┐
│ PASS  │  │ FAIL   │
└───┬───┘  └────────┘
    │
    ▼
┌─────────────────┐
│  Create Model   │
│  (candidate)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Release Note   │
│  (auto-gen MD)  │
└─────────────────┘
```

### 2.2 数据来源链

```
video_batch
    ↓
frame_extraction
    ↓
yolo_annotation
    ↓
classifier_verification (filter)
    ↓
sam_segmentation (refine)
    ↓
review_pack (human review)
    ↓
dataset_version
    ↓
training_run
    ↓
artifact
    ↓
evaluation
    ↓
model (if gate passed)
```

---

## 3. API 设计

### 3.1 创建评估

```http
POST /api/evaluations
Content-Type: application/json

{
  "name": "B2_Real_Eval_001",
  "evaluation_type": "detection",
  "artifact_id": "<artifact_uuid>",
  "dataset_version_id": "<dataset_version_uuid>",
  "execution_mode": "yolo_eval",
  "yolo_eval_config_json": {
    "conf": 0.25,
    "iou": 0.45,
    "imgsz": 640,
    "split": "val"
  },
  "promote_gate_checks_json": {
    "mAP50_threshold": 0.85,
    "mAP50_95_threshold": 0.70,
    "precision_threshold": 0.80,
    "recall_threshold": 0.75
  }
}
```

### 3.2 执行评估

```http
POST /api/evaluations/:id/execute
```

**执行流程**:
1. 更新 status = running
2. Spawn Python: `eval_runner.py --weights <artifact_path> --data <dataset_yaml> ...`
3. 实时捕获 stdout/stderr 写入 evaluation_logs
4. 解析 output JSON 获取 metrics
5. 检查 promote gate
6. 更新 evaluation 记录
7. 如 gate passed，自动创建 model

### 3.3 获取 Lineage

```http
GET /api/evaluations/:id/lineage
```

**返回结构**:
```json
{
  "evaluation": {...},
  "artifact": {...},
  "run": {...},
  "data_chain": {
    "dataset_version": {...},
    "video_batch": {...},
    "frame_extraction": {...},
    "yolo_annotation": {...},
    "classifier_filter": [...],
    "sam_refine": [...],
    "review_pack": [...]
  },
  "model": {...}
}
```

---

## 4. Promote Gate 设计

### 4.1 检查项

| 指标 | 阈值 | 说明 |
|------|------|------|
| mAP50 | ≥ 0.85 | COCO mAP@IoU=0.5 |
| mAP50_95 | ≥ 0.70 | COCO mAP@IoU=0.5:0.95 |
| Precision | ≥ 0.80 | 精确率 |
| Recall | ≥ 0.75 | 召回率 |

### 4.2 判定逻辑

```typescript
const gateChecks = [
  { metric: 'mAP50', value, threshold: 0.85, passed: value >= 0.85 },
  { metric: 'mAP50_95', value, threshold: 0.70, passed: value >= 0.70 },
  { metric: 'precision', value, threshold: 0.80, passed: value >= 0.80 },
  { metric: 'recall', value, threshold: 0.75, passed: value >= 0.75 },
];

const allGatesPassed = gateChecks.every(g => g.passed);
const promoteGateStatus = allGatesPassed ? 'passed' : 'failed';
```

### 4.3 Model 状态映射

| Gate Result | Model Status | Promotion Status |
|-------------|--------------|------------------|
| passed | candidate | ready_for_manual_promotion |
| failed | failed | failed |

---

## 5. Model 归档设计

### 5.1 自动创建触发

评估完成后，如 promote gate passed：
```typescript
await createModelFromEvaluation(evaluationId, evaluation, artifact, report);
```

### 5.2 Model 记录结构

```json
{
  "model_id": "<uuid>",
  "name": "yolo_<artifact_name>_v1",
  "source_experiment_id": "...",
  "source_artifact_id": "...",
  "latest_evaluation_id": "<evaluation_id>",
  "artifact_path": "...",
  "status": "candidate",
  "promotion_status": "ready_for_manual_promotion",
  "release_note_json": {
    "version": "v1.0.0",
    "title": "...",
    "lineage": {
      "dataset_version_id": "...",
      "training_run_id": "...",
      "artifact_id": "...",
      "evaluation_id": "..."
    },
    "evaluation_metrics": {...},
    "promote_gate_result": {...},
    "release_note_md": "# ..."
  }
}
```

### 5.3 Release Note Markdown 模板

```markdown
# {modelName} Release Notes

## Model Information
- **Name**: {modelName}
- **Architecture**: YOLOv8n
- **Input Size**: 640x640

## Lineage
| Stage | ID | Name/Version |
|-------|-----|--------------|
| Dataset Version | {id} | {version} |
| Training Run | {id} | {run_code} |
| Artifact | {id} | {name} |

## Evaluation Metrics
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| mAP50 | 91.72% | 85% | ✅ PASS |
...

## Promotion Gate
**Status**: 🟢 PASSED

This model is ready for manual promotion to production.
```

---

## 6. 强链中间环节

### 6.1 数据链查询

在 lineage 中，通过 `dataset_version.source_chain_json` 回查：

```typescript
const sourceChain = JSON.parse(datasetVersion.source_chain_json);
// {
//   video_batch_id: "...",
//   frame_extraction_id: "...",
//   yolo_annotation_id: "..."
// }
```

### 6.2 中间环节关联

| 环节 | 关联表 | 关联字段 |
|------|--------|----------|
| classifier_filter | classifier_verifications | yolo_annotation_id |
| sam_refine | sam_segmentations | classifier_verification_id |
| review_pack | review_packs | dataset_version_id |

### 6.3 Lineage 返回结构

```json
{
  "data_chain": {
    "dataset_version": {...},
    "source_chain": {
      "video_batch_id": "...",
      "frame_extraction_id": "...",
      "yolo_annotation_id": "..."
    },
    "video_batch": {...},
    "frame_extraction": {...},
    "yolo_annotation": {...},
    "classifier_filter": [
      { "id": "...", "status": "verified", "confidence": 0.95 }
    ],
    "sam_refine": [
      { "id": "...", "status": "completed", "mask_quality": 0.92 }
    ],
    "review_pack": [
      { "id": "...", "status": "completed", "approved_samples": 145 }
    ]
  }
}
```

---

## 7. 文件修改清单

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `apps/local-api/src/evaluations/index.ts` | 修改 | 真实 evaluation runner |
| | | Promote gate 判定 |
| | | Model 自动创建 |
| | | Lineage 增强 (data_chain) |
| | | Release note 生成 |

---

## 8. 验证清单

### 8.1 功能验证

- [ ] 创建 evaluation 成功
- [ ] 执行 evaluation 调用真实 Python runner
- [ ] 评估指标来自真实运行
- [ ] Promote gate 正确判定 pass/fail
- [ ] Gate passed 时自动创建 model
- [ ] Model 包含完整 lineage
- [ ] Release note 自动生成
- [ ] Lineage API 返回 data_chain

### 8.2 数据链验证

- [ ] video_batch 在 lineage 中可见
- [ ] frame_extraction 在 lineage 中可见
- [ ] yolo_annotation 在 lineage 中可见
- [ ] classifier_filter 在 lineage 中可见
- [ ] sam_refine 在 lineage 中可见
- [ ] review_pack 在 lineage 中可见

---

## 9. 待办

1. 实现真实 eval_runner.py 调用
2. 实现 promote gate 判定
3. 实现 model 自动创建
4. 实现 release note 生成
5. 增强 lineage 返回 data_chain
6. 验证完整链路

---

**设计完成**: 2026-04-16  
**设计者**: Agent 代可行-1
