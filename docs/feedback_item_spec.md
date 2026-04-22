# v6.3.0 Feedback Item Spec

## 1. 定义
Feedback Item 是自动回流池中的最小记录单元，挂在一个 `feedback_batch` 下。

## 2. 最小字段约束

### 2.1 必填
| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT | 系统生成 |
| batch_id | TEXT | 所属批次 ID |
| created_at | TEXT | 创建时间 |

### 2.2 关键业务字段
| 字段 | 类型 | 说明 |
|---|---|---|
| file_path | TEXT | 回流样本路径 |
| label_json | TEXT | 标签 JSON |
| reason | TEXT | 回流原因说明 |
| confidence | REAL | 置信度 |
| source_task_id | TEXT | 来源任务 |
| source_model_id | TEXT | 来源模型 |
| source_dataset_id | TEXT | 来源数据集 |
| predicted_label | TEXT | 预测标签 |
| ground_truth | TEXT | 参考标签 |
| status | TEXT | pending/reviewed 等 |
| reviewed_at | TEXT | 审核时间 |
| reviewed_by | TEXT | 审核人 |

## 3. 来源追溯要求
单条 item 至少应满足一种来源追溯：
- `source_task_id`
- `source_model_id`
- `source_dataset_id`

推荐同时携带 `reason + confidence + file_path`，便于后续导出候选数据集。

## 4. 创建接口示例
`POST /api/feedback-items`

```json
{
  "batch_id": "fb-xxx",
  "file_path": "E:/AGI_Factory/samples/failed_case/sample_001.jpg",
  "reason": "classifier mismatch",
  "confidence": 0.41,
  "source_task_id": "task-001",
  "source_model_id": "model-001",
  "source_dataset_id": "dataset-001",
  "label_json": {
    "expected": "ok",
    "actual": "ng"
  }
}
```

## 5. 导出映射
item 导出到 manifest 时至少保留：
- id
- source_task_id
- source_model_id
- source_dataset_id
- file_path
- confidence
- reason
- label_json

## 6. 审计要求
与 item 相关操作需要记录到 `audit_logs`（category=`feedback`）：
- 创建 item（`feedback_register`）
- 查询 item/list（`feedback_view`）
- 异常失败（`feedback_failed`）
