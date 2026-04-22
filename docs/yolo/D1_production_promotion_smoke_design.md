# Phase-D / D1 生产晋升与上线验证 - 设计文档

**阶段**: Phase-D / D1  
**版本**: v1.0.0  
**日期**: 2026-04-16  

---

## 1. 目标

将 C3 整改后的模型正式晋升为 production，并执行上线验证：

1. **Promote to Production** - 执行正式晋升
2. **Smoke Check** - 上线后验证
3. **Rollback Verification** - 回滚机制验证
4. **Production Acceptance** - 生产验收报告

---

## 2. 当前状态 (C3 结束)

### Model 信息

| 字段 | 值 |
|------|-----|
| model_id | 6386e775-f25c-4ea1-a554-57caef304e10 |
| name | yolo_yolo_yolov8n_v2_c3_remediation_2026-04-15_v1 |
| status | candidate |
| promotion_status | ready_for_manual_promotion |
| shadow_validation_id | a4fd3e24-90ca-4f03-bf09-8f45f2dca40b |
| rollback_target_id | 78dd44a1-d3f8-471e-89d9-edc9598c1f8a |
| production_gate_status | passed |

---

## 3. Promote to Production

### 3.1 晋升流程

```
candidate → ready_for_manual_promotion → promoted_to_production
```

### 3.2 晋升 API

```http
POST /api/models/:id/promote
{
  "promoted_by": "admin_001",
  "promotion_reason": "C3 remediation complete, production gate passed, shadow validation approved",
  "release_note": "..."
}
```

### 3.3 晋升后状态

| 字段 | 晋升前 | 晋升后 |
|------|--------|--------|
| status | candidate | production |
| promotion_status | ready_for_manual_promotion | promoted_to_production |
| released_at | - | timestamp |
| released_by | - | admin_001 |
| last_production_model_id | - | previous production model |

---

## 4. Smoke Check

### 4.1 检查项目

| 检查项 | 检查方式 | 通过标准 |
|--------|----------|----------|
| 推理正常 | POST /api/inference | 返回结果，无异常 |
| 指标无异常 | 检查 metrics | 与 shadow validation 一致 |
| UI 误检可接受 | 样本检查 | 无明显异常 |
| 日志完整 | 检查审计日志 | 有完整记录 |

### 4.2 Smoke Check API

```http
POST /api/models/:id/smoke-check
{
  "test_samples": ["frame_001", "frame_002"],
  "check_types": ["inference", "metrics", "ui_errors", "logs"]
}
```

---

## 5. Rollback Verification

### 5.1 Rollback 流程

```
current_production → rollback_target (78dd44a1)
```

### 5.2 Rollback API

```http
GET /api/models/:id/rollback-readiness
POST /api/models/:id/rollback
{
  "rollback_reason": "Manual rollback due to smoke check failure"
}
```

### 5.3 Rollback Smoke

| 检查项 | 说明 |
|--------|------|
| rollback_target_exists | 目标模型存在 |
| rollback_target_valid | 目标模型有效 |
| rollback_api_available | 回滚 API 可用 |

---

## 6. 报告格式

### 6.1 晋升报告

```json
{
  "model_id": "6386e775-f25c-4ea1-a554-57caef304e10",
  "promotion": {
    "previous_status": "candidate",
    "new_status": "production",
    "promoted_by": "admin_001",
    "promoted_at": "2026-04-16T04:44:00Z",
    "release_id": "..."
  },
  "audit": {
    "approval_record": {...},
    "smoke_check_result": {...}
  }
}
```

### 6.2 Smoke Check 报告

```json
{
  "smoke_check_id": "...",
  "model_id": "6386e775-f25c-4ea1-a554-57caef304e10",
  "started_at": "...",
  "finished_at": "...",
  "checks": [
    {
      "id": "inference",
      "status": "passed",
      "detail": "Inference completed successfully"
    },
    {
      "id": "metrics",
      "status": "passed",
      "detail": "Metrics match shadow validation"
    }
  ],
  "overall_status": "passed"
}
```

---

## 7. 验收清单

- [ ] Promote to production 成功
- [ ] Promotion audit record 存在
- [ ] Smoke check 通过
- [ ] Rollback readiness 可查
- [ ] Lineage / release note 可回查

---

## 8. 下一步

D1 完成后，进入持续监控阶段：
1. 生产指标监控
2. Badcase 收集
3. 下一轮迭代准备

---

**设计完成**: 2026-04-16  
**设计者**: Agent 代可行-1
