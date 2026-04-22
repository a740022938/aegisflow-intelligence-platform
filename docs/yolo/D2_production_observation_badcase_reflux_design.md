# Phase-D / D2 生产观察与坏例回流 - 设计文档

**阶段**: Phase-D / D2  
**版本**: v1.0.0  
**日期**: 2026-04-16  

---

## 1. 目标

在首个 production 模型上线后，执行生产观察与坏例回流：

1. **生产观察** - 连续记录 production 模型运行情况
2. **坏例沉淀** - 将真实误检/漏检/冲突样本写入 negative_pool 和 review_pack
3. **回流链打通** - 让生产坏例进入下一轮训练候选
4. **观察报告** - 输出 production 观察报告
5. **下轮准备** - 为下一轮 retraining 做输入准备

---

## 2. 当前状态

### Production Model

| 字段 | 值 |
|------|-----|
| model_id | 6386e775-f25c-4ea1-a554-57caef304e10 |
| promotion_status | in_production |
| rollback_target_id | 78dd44a1-d3f8-471e-89d9-edc9598c1f8a |
| latest_evaluation_id | fed250cb-7b87-489c-8891-5c4ef500b9e6 |
| source_artifact_id | bfa6f199-49dd-4c7a-bd96-47e38bfa328a |

### Production Gate

| 检查项 | 状态 |
|--------|------|
| shadow_validation | ✅ |
| manual_approval | ✅ |
| no_critical_badcases | ✅ |
| rollback_ready | ✅ |

---

## 3. 生产观察

### 3.1 观察指标

| 指标 | 说明 | 数据来源 |
|------|------|----------|
| inference_count | 推理次数 | production_observations |
| ui_misdetect | UI误检数量 | production_observations |
| missed_detection | 漏检样本 | production_observations |
| classifier_reject | 分类器拒绝数量 | production_observations |
| review_pack_pressure | 复核压力 | production_observations |
| badcase_count | 坏例总数 | production_observations |

### 3.2 观察 API

```http
POST /api/production-observations
{
  "model_id": "6386e775-f25c-4ea1-a554-57caef304e10",
  "observation_period": "2026-04-16T05:00:00Z/2026-04-16T06:00:00Z",
  "inference_count": 150,
  "ui_misdetect_count": 3,
  "missed_detection_count": 2,
  "classifier_reject_count": 5,
  "review_pack_pressure": 0.12,
  "badcase_count": 5,
  "notes": "Initial observation"
}
```

### 3.3 观察报告 API

```http
GET /api/production-observations/report?model_id=...
```

---

## 4. 坏例沉淀

### 4.1 坏例类型

| 类型 | 说明 | 沉淀目标 |
|------|------|----------|
| ui_misdetect | UI误检 | negative_pool + review_pack |
| missed_detection | 漏检样本 | negative_pool + retrain_candidates |
| classifier_conflict | 分类器冲突 | negative_pool |
| sam_failure | SAM失败 | review_pack |
| review_pressure | 复核压力 | review_pack |

### 4.2 坏例写入

**写入 negative_pool**:

```json
{
  "dataset_version_id": "e4311404-d1d4-457e-96f7-7afe90ee8903",
  "source_type": "production_inference",
  "source_id": "prod_obs_001",
  "frame_id": "frame_xxx",
  "rejection_reason": "ui_misdetect",
  "severity": "medium",
  "metadata_json": {...}
}
```

**写入 review_pack**:

```json
{
  "dataset_version_id": "e4311404-d1d4-457e-96f7-7afe90ee8903",
  "pack_type": "production_badcase",
  "total_samples": 5,
  "status": "pending"
}
```

---

## 5. 回流链

### 5.1 回流链路

```
Production Observation → Badcase → negative_pool / review_pack → next_retrain_candidates
```

### 5.2 下轮训练准备

**next_dataset_version_candidates**:

| 来源 | dataset_version_id | 样本数 |
|------|-------------------|--------|
| negative_pool | e4311404 | 5 |
| review_pack | 8e0b1b37... | 2 |

**retrain_candidates**:

| 来源 | 类型 | 优先级 |
|------|------|--------|
| missed_detection | 漏检 | high |
| ui_misdetect | 误检 | medium |

---

## 6. API 设计

### 6.1 Production Observation Routes

```typescript
// POST /api/production-observations - 记录观察数据
// GET /api/production-observations - 查询观察记录
// GET /api/production-observations/report - 生成观察报告
// GET /api/production-observations/badcases - 获取坏例列表
```

### 6.2 Badcase Routes

```typescript
// POST /api/badcases - 写入坏例
// GET /api/badcases/buckets - 按类型分桶
// GET /api/badcases/next-retrain-candidates - 下轮训练候选
```

---

## 7. 数据库设计

### 7.1 production_observations 表

```sql
CREATE TABLE production_observations (
  id TEXT PRIMARY KEY,
  model_id TEXT,
  observation_period_start TEXT,
  observation_period_end TEXT,
  inference_count INTEGER DEFAULT 0,
  ui_misdetect_count INTEGER DEFAULT 0,
  missed_detection_count INTEGER DEFAULT 0,
  classifier_reject_count INTEGER DEFAULT 0,
  review_pack_pressure REAL DEFAULT 0,
  badcase_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### 7.2 production_badcases 表

```sql
CREATE TABLE production_badcases (
  id TEXT PRIMARY KEY,
  model_id TEXT,
  observation_id TEXT,
  badcase_type TEXT,
  frame_id TEXT,
  severity TEXT,
  description TEXT,
  metadata_json TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT,
  updated_at TEXT
);
```

---

## 8. 验收清单

- [ ] 至少 1 批 production observation 记录
- [ ] 至少 1 条 badcase 写入 negative_pool
- [ ] 至少 1 条 badcase 写入 review_pack
- [ ] 至少 1 组 next_dataset_version_candidates 可查
- [ ] 至少 1 份 production observation 汇总结果

---

## 9. 下一步

D2 完成后，进入下一轮训练准备：

1. 基于 D2 坏例清单，准备 next_dataset_version
2. 执行下一轮 retraining
3. 重复 Phase-C / C3 流程

---

**设计完成**: 2026-04-16  
**设计者**: Agent 代可行-1
