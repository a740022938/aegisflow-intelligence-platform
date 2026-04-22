# F5 UI/API 收口与样板任务验收 - 设计方案

**阶段**: Phase-A / F5  
**目标**: 最小飞轮收口为可演示、可操作、可追溯的样板链路  
**日期**: 2026-04-16

---

## 1. 背景与目标

### 1.1 当前状态
- F1-F4: YOLO 链路注册 → 数据集版本化 → 训练闭环 → 评估与归档 ✅
- F5: UI/API 收口 ← 当前阶段

### 1.2 核心目标
将 F1-F4 跑通的最小飞轮，收口成**可演示、可操作、可追溯**的样板链路：

```
[UI/API Entry]
    ↓
dataset_version (approved)
    ↓
training_run (YOLO execution_mode)
    ↓
artifact (training output)
    ↓
evaluation (yolo_eval)
    ↓
promote_gate (threshold check)
    ↓
model (candidate - if passed)
    ↓
[Dashboard / Lineage View]
```

---

## 2. 样板任务定义

### 2.1 样板任务名称
**YOLO-Mahjong-Minimal-Flywheel-v1**

### 2.2 样板任务链路

| 阶段 | 实体 | 状态字段 | 关键输出 |
|------|------|----------|----------|
| 1. 数据 | dataset_version | `governance_status=approved` | version_id |
| 2. 训练 | training_run | `execution_mode=yolo, status=success` | artifact_id |
| 3. 评估 | evaluation | `execution_mode=yolo_eval, status=completed` | metrics |
| 4. 闸门 | promote_gate | `status=pased/failed` | gate_checks |
| 5. 归档 | model | `promotion_status=candidate` | model_id |

### 2.3 样板数据说明

**数据性质**: 样板/测试数据 (非生产级)
**指标来源**: 模拟训练/评估 (mock runner)
**用途**: 链路验证、冒烟测试、演示展示
**限制**: 不作为生产级模型发布依据

---

## 3. API 收口设计

### 3.1 样板任务创建接口

```http
POST /api/flywheel/sample-tasks
Content-Type: application/json

{
  "name": "YOLO-Mahjong-Minimal-Flywheel-v1",
  "dataset_version_id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
  "training_config": {
    "model_type": "yolov8n",
    "epochs": 20,
    "batch_size": 16
  },
  "eval_config": {
    "conf": 0.25,
    "iou": 0.45,
    "split": "val"
  },
  "promote_gate": {
    "mAP50_threshold": 0.85,
    "mAP50_95_threshold": 0.70
  }
}

Response: {
  "ok": true,
  "sample_task": {
    "id": "...",
    "name": "YOLO-Mahjong-Minimal-Flywheel-v1",
    "stages": {
      "dataset_version": { "id": "...", "status": "ready" },
      "training_run": { "id": "...", "status": "pending" },
      "artifact": { "id": null, "status": "waiting" },
      "evaluation": { "id": null, "status": "waiting" },
      "model": { "id": null, "status": "waiting" }
    },
    "lineage": {
      "dataset_version_id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
      "training_run_id": null,
      "artifact_id": null,
      "evaluation_id": null,
      "model_id": null
    }
  }
}
```

### 3.2 样板任务状态查询

```http
GET /api/flywheel/sample-tasks/:id

Response: {
  "ok": true,
  "sample_task": {
    "id": "...",
    "name": "YOLO-Mahjong-Minimal-Flywheel-v1",
    "overall_status": "running",  // pending | running | completed | failed
    "stages": {
      "dataset_version": {
        "id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
        "name": "v1_f2_test_001",
        "status": "approved",
        "ready": true
      },
      "training_run": {
        "id": "99182105-8eb7-4d21-a666-12db75b4be56",
        "name": "YOLOv8-mahjong-v1-training",
        "status": "success",
        "metrics": { "best_mAP50": 0.9172 },
        "ready": true
      },
      "artifact": {
        "id": "74dad608-6423-4f11-a1cf-e6a479cd1778",
        "name": "yolo_yolov8n_v1_f2_test_001_2026-04-15",
        "status": "ready",
        "ready": true
      },
      "evaluation": {
        "id": "84b9bbf2-4872-4b46-8c51-572e3ac5f927",
        "name": "YOLOv8-mahjong-v1-eval-F4",
        "status": "completed",
        "metrics": { "mAP50": 0.915, "mAP50_95": 0.778 },
        "promote_gate": { "status": "passed", "checks": [...] },
        "ready": true
      },
      "model": {
        "id": "78dd44a1-d3f8-471e-89d9-edc9598c1f8a",
        "name": "yolo_yolo_yolov8n_v1_f2_test_001_2026-04-15_v1",
        "status": "candidate",
        "ready": true
      }
    },
    "lineage": {
      "dataset_version_id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
      "training_run_id": "99182105-8eb7-4d21-a666-12db75b4be56",
      "artifact_id": "74dad608-6423-4f11-a1cf-e6a479cd1778",
      "evaluation_id": "84b9bbf2-4872-4b46-8c51-572e3ac5f927",
      "model_id": "78dd44a1-d3f8-471e-89d9-edc9598c1f8a"
    }
  }
}
```

### 3.3 来源链回查接口

```http
GET /api/flywheel/lineage/:model_id

Response: {
  "ok": true,
  "lineage": {
    "model": {
      "id": "78dd44a1-d3f8-471e-89d9-edc9598c1f8a",
      "name": "yolo_yolo_yolov8n_v1_f2_test_001_2026-04-15_v1",
      "promotion_status": "candidate",
      "created_at": "2026-04-15T18:51:47.778Z"
    },
    "evaluation": {
      "id": "84b9bbf2-4872-4b46-8c51-572e3ac5f927",
      "name": "YOLOv8-mahjong-v1-eval-F4",
      "metrics": { "mAP50": 0.915, "mAP50_95": 0.778 },
      "promote_gate": { "status": "passed", "checks": [...] }
    },
    "artifact": {
      "id": "74dad608-6423-4f11-a1cf-e6a479cd1778",
      "name": "yolo_yolov8n_v1_f2_test_001_2026-04-15",
      "path": "/runs/train/.../weights/best.pt"
    },
    "training_run": {
      "id": "99182105-8eb7-4d21-a666-12db75b4be56",
      "name": "YOLOv8-mahjong-v1-training",
      "execution_mode": "yolo",
      "epochs": 20,
      "best_mAP50": 0.9172
    },
    "dataset_version": {
      "id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
      "version": "v1_f2_test_001",
      "governance_status": "approved"
    }
  },
  "chain": [
    { "type": "dataset_version", "id": "5bd446ad...", "name": "v1_f2_test_001" },
    { "type": "training_run", "id": "99182105...", "name": "YOLOv8-mahjong-v1-training" },
    { "type": "artifact", "id": "74dad608...", "name": "yolo_yolov8n_v1_f2_test_001" },
    { "type": "evaluation", "id": "84b9bbf2...", "name": "YOLOv8-mahjong-v1-eval-F4" },
    { "type": "model", "id": "78dd44a1...", "name": "yolo_yolo_yolov8n_v1_f2_test_001_v1" }
  ]
}
```

### 3.4 Dashboard 聚合接口

```http
GET /api/flywheel/dashboard

Response: {
  "ok": true,
  "dashboard": {
    "summary": {
      "total_sample_tasks": 1,
      "completed": 1,
      "running": 0,
      "failed": 0
    },
    "latest_sample_task": {
      "id": "...",
      "name": "YOLO-Mahjong-Minimal-Flywheel-v1",
      "overall_status": "completed",
      "completed_stages": 5,
      "total_stages": 5,
      "model_promotion_status": "candidate"
    },
    "metrics_summary": {
      "avg_training_mAP50": 0.9172,
      "avg_eval_mAP50": 0.915,
      "promote_gate_pass_rate": "100%"
    }
  }
}
```

---

## 4. Release Note 格式

### 4.1 样板任务 Release Note

```json
{
  "version": "v1.0.0-sample",
  "title": "YOLO Mahjong Detection - Minimal Flywheel Sample",
  "description": "Phase-A 最小飞轮样板任务，用于链路验证和演示",
  "created_at": "2026-04-16T02:56:00Z",
  "data_quality": {
    "type": "sample/mock",
    "note": "指标来自模拟训练/评估，仅供链路验证，不作为生产级参考"
  },
  "lineage": {
    "dataset_version": {
      "id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
      "version": "v1_f2_test_001",
      "sample_count": 3214,
      "classes": 34
    },
    "training_run": {
      "id": "99182105-8eb7-4d21-a666-12db75b4be56",
      "execution_mode": "yolo",
      "config": {
        "model_type": "yolov8n",
        "epochs": 20,
        "batch_size": 16,
        "imgsz": 640
      },
      "duration_seconds": 2
    },
    "artifact": {
      "id": "74dad608-6423-4f11-a1cf-e6a479cd1778",
      "name": "yolo_yolov8n_v1_f2_test_001_2026-04-15",
      "path": "/runs/train/99182105-8eb7-4d21-a666-12db75b4be56/weights/best.pt",
      "best_mAP50": 0.9172
    },
    "evaluation": {
      "id": "84b9bbf2-4872-4b46-8c51-572e3ac5f927",
      "execution_mode": "yolo_eval",
      "metrics": {
        "mAP50": 0.915,
        "mAP50_95": 0.778,
        "precision": 0.883,
        "recall": 0.847
      },
      "promote_gate": {
        "status": "passed",
        "thresholds": {
          "mAP50": 0.85,
          "mAP50_95": 0.70,
          "precision": 0.80,
          "recall": 0.75
        },
        "results": {
          "mAP50": { "value": 0.915, "passed": true },
          "mAP50_95": { "value": 0.778, "passed": true },
          "precision": { "value": 0.883, "passed": true },
          "recall": { "value": 0.847, "passed": true }
        }
      }
    },
    "model": {
      "id": "78dd44a1-d3f8-471e-89d9-edc9598c1f8a",
      "name": "yolo_yolo_yolov8n_v1_f2_test_001_2026-04-15_v1",
      "promotion_status": "candidate",
      "note": "Auto-promoted via promote gate (passed)"
    }
  },
  "capabilities": [
    "34-class mahjong tile detection",
    "YOLOv8n architecture",
    "640x640 input resolution"
  ],
  "limitations": [
    "Sample data only - not production grade",
    "Mock training/evaluation",
    "Candidate status - requires manual promotion to production"
  ]
}
```

---

## 5. 实施步骤

### Step 1: 创建 Flywheel 路由模块
- [ ] 创建 `apps/local-api/src/flywheel/index.ts`
- [ ] 实现 POST /api/flywheel/sample-tasks
- [ ] 实现 GET /api/flywheel/sample-tasks/:id
- [ ] 实现 GET /api/flywheel/lineage/:model_id
- [ ] 实现 GET /api/flywheel/dashboard

### Step 2: 注册路由
- [ ] 在 `apps/local-api/src/index.ts` 注册 flywheel 路由

### Step 3: 验证样板链路
- [ ] 查询现有样板数据
- [ ] 验证来源链完整性
- [ ] 生成 release note

### Step 4: 验收文档
- [ ] 创建 `audit/F5_ui_api_acceptance.md`

---

## 6. 验证清单

### 6.1 API 验证

| 接口 | 方法 | 验证内容 |
|------|------|----------|
| /api/flywheel/sample-tasks | POST | 创建样板任务 |
| /api/flywheel/sample-tasks/:id | GET | 查询样板任务状态 |
| /api/flywheel/lineage/:model_id | GET | 来源链回查 |
| /api/flywheel/dashboard | GET | Dashboard 聚合 |

### 6.2 数据验证

| 验证项 | 通过标准 |
|--------|----------|
| dataset_version 可查询 | ✅ 返回 approved 状态 |
| training_run 可查询 | ✅ 返回 success 状态 + metrics |
| artifact 可查询 | ✅ 返回 path + metrics |
| evaluation 可查询 | ✅ 返回 metrics + promote_gate |
| model 可查询 | ✅ 返回 candidate 状态 |
| 来源链完整 | ✅ 5 个节点全部关联 |

---

## 7. 风险与边界

### 7.1 已知限制
1. **数据性质**: 样板数据仅供演示，非生产级
2. **Model 状态**: candidate，需手动晋升到 production
3. **Runner**: 当前为 mock，真实 runner 在 Phase-B 实现

### 7.2 边界约束
1. 单条样板链路验证，批量任务后续扩展
2. Dashboard 为只读聚合，实时更新后续扩展

---

**设计者**: Agent 代可行-1  
**日期**: 2026-04-16
