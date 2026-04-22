# Phase-C / C2 生产就绪整改与再验证 - 设计文档

**阶段**: Phase-C / C2  
**版本**: v1.0.0  
**日期**: 2026-04-16  

---

## 1. 目标

解决 C1 中 production gate 失败的问题，完成生产就绪整改：
1. 失败原因拆解 - 详细分析 production gate 失败根因
2. Badcase 整改闭环 - 分桶处理 critical badcases
3. 再验证 - 整改后重新执行 shadow validation
4. Production gate 再判定 - 确认 ready_for_production 或 still_blocked
5. 回滚就绪补齐 - 验证 rollback 机制完整可用

---

## 2. 当前状态

### 2.1 C1 Production Gate 结果

| 检查项 | 状态 | 详情 |
|--------|------|------|
| shadow_validation | ❌ FAILED | status=failed, recommendation=REJECT |
| manual_approval | ✅ PASSED | approved_by=admin_001 |
| no_critical_badcases | ❌ FAILED | 1 critical badcase found |
| rollback_ready | ❌ FAILED | No rollback target |

**总体结果**: 🔴 **FAILED** (1/4 项通过)

### 2.2 Shadow Validation 失败分析

**指标对比**:

| 指标 | Candidate | Baseline | Diff | 阈值 | 状态 |
|------|-----------|----------|------|------|------|
| mAP50 | 0.85 | 0.915 | -0.065 | ±0.02 | ❌ FAIL |
| Precision | 0.85 | 0.8826 | -0.033 | ±0.05 | ✅ PASS |
| Recall | 0.80 | 0.8466 | -0.047 | ±0.03 | ❌ FAIL |

**失败原因**:
1. mAP50 下降 6.5%，超过 2% 容忍阈值
2. Recall 下降 4.7%，超过 3% 容忍阈值

---

## 3. 整改方案

### 3.1 失败原因拆解

#### 根因 1: Shadow Validation 失败

**问题**: Candidate 模型指标低于 baseline

**可能原因**:
- 训练数据不足 (B1 仅 1 train + 1 val 样本)
- 训练 epoch 过少 (仅 5 epochs)
- 数据集与评估数据集不匹配 (mahjong vs yolo-test-ds)

**整改动作**:
1. 使用真实麻将数据集重新训练
2. 增加训练 epoch 至 50+
3. 确保评估数据集与训练数据集同分布

#### 根因 2: Critical Badcase 存在

**问题**: Shadow validation 生成 1 critical badcase

**整改动作**:
1. 分析 badcase 类型
2. 分桶处理
3. 写入 review_pack / negative_pool

#### 根因 3: Rollback Target 未设置

**问题**: 未明确 last_production_model

**整改动作**:
1. 指定 baseline model 为 rollback_target
2. 验证 rollback API 可用

### 3.2 Badcase 分桶策略

| 分桶 | 定义 | 处理动作 |
|------|------|----------|
| UI误检 | 框位置偏移/大小错误 | 精修样本 → SAM |
| 漏检 | 未检测到目标 | 补充样本 → 训练集 |
| 分类冲突 | 类别判断错误 | 人工标注 → review_pack |
| 精修失败 | SAM 分割质量差 | 重新精修 → SAM |
| review高压 | 人工复核压力大 | 优先级标记 → negative_pool |

### 3.3 再验证流程

```
整改前状态 (C1)
    ↓
Badcase 分桶处理
    ↓
Negative Pool 沉淀
    ↓
重新训练 (可选)
    ↓
重新评估
    ↓
Shadow Validation 重跑
    ↓
Production Gate 再判定
    ↓
┌─────────────┬─────────────┐
│  still      │  ready_for  │
│  _blocked   │  _production│
└─────────────┴─────────────┘
```

---

## 4. API 设计

### 4.1 失败分析

```http
// 获取 production gate 失败分析
GET /api/models/:id/production-gate/analysis

// 获取 badcase 分桶结果
GET /api/shadow-validations/:id/badcases/buckets
```

### 4.2 Badcase 整改

```http
// 分桶 badcases
POST /api/shadow-validations/:id/badcases/bucket
{
  "buckets": ["ui_misdetect", "missed_detection", "classifier_conflict", "sam_failure", "review_pressure"]
}

// 写入 review_pack
POST /api/shadow-validations/:id/badcases/to-review-pack
{
  "dataset_version_id": "..."
}
```

### 4.3 再验证

```http
// 重新执行 shadow validation
POST /api/shadow-validations/:id/revalidate

// 获取 before/after 对比
GET /api/shadow-validations/:id/compare?baseline_id=...
```

### 4.4 回滚就绪检查

```http
// 检查 rollback 就绪状态
GET /api/models/:id/rollback-readiness

// 验证 rollback 可用
POST /api/models/:id/rollback/validate
```

---

## 5. 报告格式

### 5.1 Production Gate 失败分析报告

```json
{
  "model_id": "...",
  "gate_status": "failed",
  "failed_checks": ["shadow_validation", "no_critical_badcases", "rollback_ready"],
  "analysis": {
    "shadow_validation": {
      "status": "failed",
      "root_cause": "metrics_regression",
      "details": {
        "mAP50": { "candidate": 0.85, "baseline": 0.915, "regression": 0.065 },
        "recall": { "candidate": 0.80, "baseline": 0.8466, "regression": 0.047 }
      },
      "recommendation": "retrain_with_more_data"
    },
    "no_critical_badcases": {
      "status": "failed",
      "root_cause": "1_critical_badcase_found",
      "details": {
        "total_badcases": 2,
        "critical_count": 1,
        "high_count": 0,
        "medium_count": 1
      },
      "recommendation": "bucket_and_remediate"
    },
    "rollback_ready": {
      "status": "failed",
      "root_cause": "rollback_target_not_set",
      "recommendation": "set_rollback_target"
    }
  },
  "remediation_plan": {
    "priority": "high",
    "actions": [
      { "id": 1, "action": "set_rollback_target", "status": "pending" },
      { "id": 2, "action": "bucket_badcases", "status": "pending" },
      { "id": 3, "action": "retrain_model", "status": "pending" },
      { "id": 4, "action": "revalidate", "status": "pending" }
    ]
  }
}
```

### 5.2 Badcase 分桶报告

```json
{
  "shadow_validation_id": "...",
  "total_badcases": 2,
  "buckets": {
    "ui_misdetect": { "count": 0, "samples": [] },
    "missed_detection": { "count": 1, "samples": ["frame_002"] },
    "classifier_conflict": { "count": 0, "samples": [] },
    "sam_failure": { "count": 0, "samples": [] },
    "review_pressure": { "count": 1, "samples": ["frame_001"] }
  },
  "remediation_actions": {
    "negative_pool": ["frame_001", "frame_002"],
    "review_pack": ["frame_001"],
    "retrain_candidates": ["frame_002"]
  }
}
```

### 5.3 Before/After 对比报告

```json
{
  "shadow_validation_id": "...",
  "comparison": {
    "before": {
      "mAP50": 0.85,
      "precision": 0.85,
      "recall": 0.80,
      "gate_status": "failed"
    },
    "after": {
      "mAP50": 0.92,
      "precision": 0.90,
      "recall": 0.88,
      "gate_status": "passed"
    },
    "improvement": {
      "mAP50": +0.07,
      "precision": +0.05,
      "recall": +0.08
    }
  },
  "conclusion": "ready_for_production"
}
```

### 5.4 Rollback 就绪检查报告

```json
{
  "model_id": "...",
  "rollback_readiness": {
    "rollback_target_set": true,
    "rollback_target_id": "...",
    "rollback_target_exists": true,
    "rollback_api_tested": true,
    "last_production_model_defined": true
  },
  "status": "ready",
  "risks": []
}
```

---

## 6. 实现计划

### 6.1 数据库变更

无需变更，复用 C1 表结构

### 6.2 API 实现

1. `models/index.ts` - 添加失败分析 API
2. `shadow-validations/index.ts` - 添加 badcase 分桶和再验证 API
3. 新增报告生成函数

### 6.3 报告生成

1. Production gate 失败分析报告
2. Badcase 分桶报告
3. Before/after 对比报告
4. Rollback 就绪检查报告

---

## 7. 验证清单

- [ ] Production gate failed 根因报告
- [ ] Critical badcase 分桶结果
- [ ] 整改后 shadow compare 重跑
- [ ] Production gate 再判定
- [ ] Rollback readiness 检查结果

---

## 8. 验收标准

| 验收项 | 标准 | 状态 |
|--------|------|------|
| 根因分析 | 明确每个失败项的根因 | 待验证 |
| Badcase 分桶 | 至少 5 个分桶类别 | 待验证 |
| 再验证 | Before/after 对比报告 | 待验证 |
| Gate 再判定 | ready_for_production 或 still_blocked | 待验证 |
| Rollback 就绪 | API 可用，目标已设置 | 待验证 |

---

**设计完成**: 2026-04-16  
**设计者**: Agent 代可行-1
