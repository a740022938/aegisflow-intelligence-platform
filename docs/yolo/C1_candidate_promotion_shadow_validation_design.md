# Phase-C / C1 候选模型人工晋升与影子验证 - 设计文档

**阶段**: Phase-C / C1  
**版本**: v1.0.0  
**日期**: 2026-04-16  

---

## 1. 目标

实现候选模型的人工晋升流程与影子验证：
1. 人工晋升流程 - candidate → ready_for_manual_promotion → promoted_to_production/rejected
2. 影子验证 - candidate 与旧模型并行跑同一批数据，对比指标
3. Production Gate - 人工确认 + shadow compare 过线才允许 production
4. 回滚准备 - 记录 rollback_target，支持回滚到 last_production_model
5. Badcase 回流 - 沉淀误检/漏检样本到 negative_pool

---

## 2. 状态流转

```
                    ┌─────────────────┐
                    │     draft       │
                    └────────┬────────┘
                             │ auto (eval passed)
                             ▼
                    ┌─────────────────┐
                    │    candidate    │
                    │ ready_for_manual│
                    │  _promotion     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   rejected  │  │   shadow    │  │   rolled    │
    │             │  │  _validate  │  │    _back    │
    └─────────────┘  └──────┬──────┘  └─────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ shadow_compare  │
                   │    passed?      │
                   └────────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │  shadow_failed  │         │promoted_to_pro- │
    │  (back to       │         │    duction      │
    │   candidate)    │         │                 │
    └─────────────────┘         └────────┬────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │  in_production  │
                                └─────────────────┘
```

---

## 3. 数据模型

### 3.1 Model 状态扩展

```typescript
// 新增状态
enum ModelStatus {
  draft = 'draft',
  candidate = 'candidate',
  ready_for_manual_promotion = 'ready_for_manual_promotion',
  shadow_validating = 'shadow_validating',
  shadow_failed = 'shadow_failed',
  promoted_to_production = 'promoted_to_production',
  in_production = 'in_production',
  rejected = 'rejected',
  rolled_back = 'rolled_back',
}

// 新增字段
interface Model {
  // ... existing fields
  
  // C1: 人工晋升
  approved_by: string;           // 审批人
  approved_at: string;           // 审批时间
  approval_note: string;         // 审批意见
  
  // C1: 影子验证
  shadow_validation_id: string;  // 关联的影子验证任务
  shadow_compare_report: string; // shadow compare JSON
  
  // C1: 回滚
  rollback_target_id: string;    // 回滚目标 model_id
  last_production_model_id: string; // 上一个生产模型
  
  // C1: Production Gate
  production_gate_status: string; // pending/passed/failed
  production_gate_checks: string; // JSON
}
```

### 3.2 Shadow Validation 表

```sql
CREATE TABLE shadow_validations (
  id TEXT PRIMARY KEY,
  candidate_model_id TEXT,
  baseline_model_id TEXT,
  test_video_batch_id TEXT,
  status TEXT, -- pending/running/completed/failed
  
  // 对比结果
  candidate_metrics_json TEXT,
  baseline_metrics_json TEXT,
  compare_result_json TEXT,
  
  // 详细对比
  false_positive_diff INTEGER,
  false_negative_diff INTEGER,
  classifier_reject_diff INTEGER,
  review_pack_pressure_diff INTEGER,
  
  // 沉淀的 badcases
  badcases_json TEXT,
  
  created_at TEXT,
  updated_at TEXT
);
```

### 3.3 Production Gate 检查项

| 检查项 | 阈值 | 说明 |
|--------|------|------|
| shadow_compare_passed | true | 影子验证通过 |
| manual_approved | true | 人工审批通过 |
| no_critical_badcases | true | 无严重 badcase |
| rollback_ready | true | 回滚目标已记录 |

---

## 4. API 设计

### 4.1 人工晋升

```http
// 提交晋升申请（candidate → ready_for_manual_promotion）
POST /api/models/:id/request-promotion
{
  "requested_by": "user_001",
  "reason": "mAP50 improved by 5%"
}

// 审批晋升（ready_for_manual_promotion → shadow_validating）
POST /api/models/:id/approve-promotion
{
  "approved_by": "admin_001",
  "approval_note": "Approved for shadow validation",
  "action": "approve" // or "reject"
}

// 驳回
POST /api/models/:id/reject-promotion
{
  "rejected_by": "admin_001",
  "rejection_reason": "Precision below threshold"
}
```

### 4.2 影子验证

```http
// 创建影子验证任务
POST /api/shadow-validations
{
  "candidate_model_id": "...",
  "baseline_model_id": "...", // last_production_model
  "test_video_batch_id": "...",
  "config_json": {
    "compare_metrics": ["mAP50", "precision", "recall"],
    "badcase_threshold": 0.5
  }
}

// 执行影子验证
POST /api/shadow-validations/:id/execute

// 获取 shadow compare 报告
GET /api/shadow-validations/:id/report
```

### 4.3 Production Gate

```http
// 检查 production gate
GET /api/models/:id/production-gate

// 执行 production gate 检查
POST /api/models/:id/production-gate/check

// 晋升到 production（通过 production gate 后）
POST /api/models/:id/promote-to-production
{
  "promoted_by": "admin_001",
  "note": "Shadow validation passed"
}
```

### 4.4 回滚

```http
// 记录回滚目标
POST /api/models/:id/set-rollback-target
{
  "rollback_target_id": "last_production_model_id"
}

// 执行回滚
POST /api/models/:id/rollback
{
  "rolled_back_by": "admin_001",
  "reason": "Production issues detected"
}

// 获取回滚目标
GET /api/models/:id/rollback-target
```

### 4.5 Badcase 回流

```http
// 从 shadow validation 沉淀 badcases
POST /api/shadow-validations/:id/reflux-badcases

// 手动添加 badcase
POST /api/models/:id/badcases
{
  "sample_id": "...",
  "badcase_type": "false_positive",
  "severity": "high",
  "description": "..."
}
```

---

## 5. Shadow Compare 报告格式

```json
{
  "summary": {
    "candidate_model_id": "...",
    "baseline_model_id": "...",
    "test_samples": 1000,
    "status": "passed"
  },
  "metrics_comparison": {
    "mAP50": { "candidate": 0.85, "baseline": 0.82, "diff": +0.03, "passed": true },
    "precision": { "candidate": 0.85, "baseline": 0.88, "diff": -0.03, "passed": false },
    "recall": { "candidate": 0.80, "baseline": 0.75, "diff": +0.05, "passed": true }
  },
  "quality_comparison": {
    "false_positives": { "candidate": 50, "baseline": 60, "diff": -10 },
    "false_negatives": { "candidate": 30, "baseline": 40, "diff": -10 },
    "classifier_rejects": { "candidate": 20, "baseline": 25, "diff": -5 },
    "review_pack_pressure": { "candidate": 0.15, "baseline": 0.18, "diff": -0.03 }
  },
  "badcases": [
    {
      "sample_id": "frame_001",
      "type": "false_positive",
      "severity": "high",
      "candidate_confidence": 0.95,
      "baseline_confidence": 0.45,
      "description": "Candidate over-confident on background"
    }
  ],
  "recommendation": "APPROVE_WITH_CAUTION"
}
```

---

## 6. 实现计划

### 6.1 数据库变更

1. models 表添加 C1 字段
2. 创建 shadow_validations 表

### 6.2 API 实现

1. models/index.ts - 扩展晋升流程
2. 新建 shadow-validations/index.ts - 影子验证
3. 新增 production gate 检查
4. 新增回滚 API

### 6.3 Badcase 回流

1. shadow validation 完成后自动沉淀 badcases
2. 写入 negative_pool 表
3. 关联到 review_pack

---

## 7. 验证清单

- [ ] candidate model 可人工晋升/驳回
- [ ] shadow compare 报告生成
- [ ] production gate 判定结果
- [ ] rollback_target 记录成功
- [ ] badcase 回流记录成功沉淀

---

**设计完成**: 2026-04-16  
**设计者**: Agent 代可行-1
