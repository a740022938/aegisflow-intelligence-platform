# Phase-E / E1 第二轮数据集发布与再训练触发 - 设计文档

**阶段**: Phase-E / E1  
**版本**: v1.0.0  
**日期**: 2026-04-16  

---

## 1. 目标

基于 D2 生产观察结果，准备第二轮数据集和再训练触发：

1. **第二轮数据集候选整理** - 汇总 D2 next_retrain_candidates
2. **第二轮 dataset_version 生成** - 基于候选清单生成新版本
3. **再训练触发准备** - 生成 retrain_dataset_bundle 和触发条件
4. **回流价值评估** - 评估是否足以触发再训练
5. **文档与验收** - 输出设计文档和验收报告

---

## 2. 当前状态 (D2 结束)

### Next Retrain Candidates

| 优先级 | 来源 | 数量 |
|--------|------|------|
| High | missed_detection (critical) | 2 |
| Medium | ui_misdetect (medium) | 2 |
| Medium | missed_detection (medium) | 1 |
| Negative Pool | negative_pool | 7 |
| **Total** | | **11** |

### Production Model

| 字段 | 值 |
|------|-----|
| model_id | 6386e775-f25c-4ea1-a554-57caef304e10 |
| promotion_status | in_production |
| current_dataset_version | e4311404 |
| production_stability | acceptable |
| badcase_rate | 0.0302 |

---

## 3. 第二轮数据集候选整理

### 3.1 来源分类

| 来源 | 样本数 | 类型 | 优先级 |
|------|--------|------|--------|
| missed_detection (critical) | 2 | 漏检 | High |
| missed_detection (medium) | 1 | 漏检 | Medium |
| ui_misdetect (medium) | 2 | 误检 | Medium |
| ui_misdetect (low) | 2 | 误检 | Low |
| classifier_conflict (low) | 2 | 冲突 | Low |
| negative_pool | 7 | 负样本 | Medium |

### 3.2 候选清单结构

```json
{
  "candidate_id": "v3_candidates",
  "parent_dataset_version_id": "e4311404",
  "sources": {
    "production_badcases": 11,
    "negative_pool": 7,
    "review_pack": 5
  },
  "priority_breakdown": {
    "high": 2,
    "medium": 3,
    "low": 4
  },
  "recommended_action": "prepare_retrain"
}
```

---

## 4. 第二轮 dataset_version 生成

### 4.1 生成参数

| 参数 | 值 | 说明 |
|------|-----|------|
| version | v3_e1_reflux | 第二轮整改版本 |
| parent_dataset_version_id | e4311404 | 父版本 |
| reflux_sources | production_badcases, negative_pool, review_pack | 回流来源 |
| total_new_samples | 11 | 新增样本数 |
| new_negative_samples | 7 | 负样本数 |
| status | draft | 草稿状态 |

### 4.2 来源链可回查

```
v3_e1_reflux
  ├── parent: e4311404 (v2_c3_remediation)
  │   └── reflux_sources:
  │       ├── production_badcases: 11
  │       ├── negative_pool: 7
  │       └── review_pack: 5
  └── new_candidates: 11
```

---

## 5. 再训练触发准备

### 5.1 Retrain Dataset Bundle

```json
{
  "bundle_id": "bundle_v3",
  "dataset_version_id": "<new_id>",
  "training_samples": {
    "from_parent": 5,
    "from_badcases": 11,
    "total": 16
  },
  "negative_samples": 7,
  "recommended_epochs": 50,
  "recommended_batch_size": 4,
  "trigger_reason": "badcase accumulation"
}
```

### 5.2 触发条件

| 条件 | 当前值 | 阈值 | 状态 |
|------|--------|------|------|
| badcase_rate > 5% | 3.02% | 5% | ❌ 未触发 |
| critical_samples > 5 | 2 | 5 | ❌ 未触发 |
| missed_detection > 5 | 4 | 5 | ❌ 接近 |
| total_candidates > 10 | 11 | 10 | ✅ 触发 |

**总体判定**: ⚠️ 触发阈值临界，建议准备训练 bundle 但暂缓执行

---

## 6. 回流价值评估

### 6.1 样本质量评估

| 类型 | 数量 | 质量 | 说明 |
|------|------|------|------|
| missed_detection (critical) | 2 | 高 | 必须修复，优先 |
| missed_detection (medium) | 1 | 中 | 建议修复 |
| ui_misdetect (medium) | 2 | 中 | 建议修复 |
| ui_misdetect (low) | 2 | 低 | 可选 |
| classifier_conflict | 2 | 低 | 可选 |

### 6.2 推荐优先级

| 优先级 | 动作 | 样本数 |
|--------|------|--------|
| P0 (必须) | 处理 2 个 critical missed_detection | 2 |
| P1 (强烈建议) | 处理 medium 误检/漏检 | 3 |
| P2 (可选) | 处理 low 误检/冲突 | 4 |

### 6.3 回流价值判定

- [ ] **样本量**: 11 个坏例 + 7 个负样本 = 18 个新样本 ✅
- [ ] **样本质量**: 2 个 critical, 3 个 medium ✅
- [ ] **触发条件**: 接近阈值 (badcase_rate 3.02%, threshold 5%) ⚠️
- [ ] **建议**: 准备 retrain bundle，暂缓执行，等更多数据积累

---

## 7. API 设计

### 7.1 Dataset Version Creation

```http
POST /api/dataset-versions
{
  "version": "v3_e1_reflux",
  "parent_dataset_version_id": "e4311404",
  "description": "Second round reflux from D2 production badcases",
  "reflux_sources": {
    "production_badcases": 11,
    "negative_pool": 7,
    "review_pack": 5
  }
}
```

### 7.2 Retrain Bundle Generation

```http
POST /api/dataset-versions/:id/retrain-bundle
{
  "training_samples": "all",
  "negative_samples": "all",
  "recommended_epochs": 50,
  "recommended_batch_size": 4
}
```

---

## 8. 验收清单

- [ ] 至少 1 条 next_dataset_version 候选清单
- [ ] 至少 1 个新的 dataset_version 成功生成
- [ ] 至少 1 组 retrain_dataset_bundle 成功生成
- [ ] 至少 1 份 retrain trigger 判定结果
- [ ] parent_dataset_version / reflux_source 可回查

---

## 9. 下一步

E1 完成后，进入下一阶段：

1. 等待 production 积累更多数据
2. 当 badcase_rate > 5% 或 critical_samples > 5 时，触发 Phase-C / C3' 再训练
3. 重复 Phase-C → D1 → D2 循环

---

**设计完成**: 2026-04-16  
**设计者**: Agent 代可行-1
