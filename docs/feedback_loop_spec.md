# v6.3.0 Feedback Loop Spec

## 1. 版本目标
v6.3.0 自动回流 v1 的最小闭环：
- 回流批次登记（batch）
- 回流项登记（item）
- 列表/详情
- source/trigger 过滤
- 候选数据集 manifest 导出
- 审计留痕

## 2. 范围锁定
本版只覆盖 Feedback 最小闭环，不新增模型模板、不改 workflow/template 历史链路。

## 3. 数据结构

### 3.1 `feedback_batches`
| 列名 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 批次 ID |
| title | TEXT | 批次标题 |
| source_type | TEXT | 回流来源类型 |
| source_id | TEXT | 来源对象引用 |
| trigger_type | TEXT | 触发类型 |
| status | TEXT | open/closed/exported 等 |
| item_count | INTEGER | 批次项数量 |
| notes | TEXT | 备注 |
| created_at | TEXT | 创建时间 ISO |
| updated_at | TEXT | 更新时间 ISO |

### 3.2 `feedback_items`
| 列名 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 回流项 ID |
| batch_id | TEXT | 所属批次 |
| file_path | TEXT | 样本路径 |
| label_json | TEXT | 标签 JSON |
| reason | TEXT | 回流原因 |
| confidence | REAL | 置信度 |
| source_task_id | TEXT | 来源 task |
| source_model_id | TEXT | 来源 model |
| source_dataset_id | TEXT | 来源 dataset |
| predicted_label | TEXT | 预测标签 |
| ground_truth | TEXT | 参考标签 |
| status | TEXT | pending/reviewed 等 |
| reviewed_at | TEXT | 审核时间 |
| reviewed_by | TEXT | 审核人 |
| created_at | TEXT | 创建时间 ISO |

## 4. 回流来源与触发类型
本版统一支持：
- `failed_case`
- `low_confidence`
- `manual_flag`

说明：`source_type` 与 `trigger_type` 都可使用以上取值；过滤按这三类进行。

## 5. API

### 5.1 Batch
- `POST /api/feedback-batches`：创建批次
- `GET /api/feedback-batches`：列表（支持 `source` / `trigger` / `status`）
- `GET /api/feedback-batches/:id`：详情（含 items）
- `POST /api/feedback-batches/:id/export`：导出 manifest
- `POST /api/feedback-batches/:id/close`：关闭批次

### 5.2 Item
- `POST /api/feedback-items`：创建回流项
- `GET /api/feedback-items`：列表（支持 `batch_id` / `source` / `trigger` 等过滤）
- `GET /api/feedback-items/:id`：详情

## 6. 导出规范
导出为 manifest JSON，并落盘到：
- `E:\AGI_Factory\repo\outputs\feedback_exports\feedback_manifest_<batch_id>_<ts>.json`

manifest 关键字段：
- `export_version`
- `batch_id`
- `batch_name`
- `source`
- `trigger`
- `exported_at`
- `item_count`
- `items[]`

## 7. 审计留痕
`audit_logs` 中 category=`feedback`，动作至少包括：
- `feedback_register`（回流登记）
- `feedback_view`（回流查看）
- `feedback_export`（回流导出）
- `feedback_failed`（回流失败）

## 8. 最小 UI
前端最小演示页：`/feedback`
- 回流池列表
- 回流池详情
- source/trigger 过滤
- 导出 manifest 操作

## 9. 非目标
- 不做复杂标注系统
- 不做 workflow/template 历史链路修补
- 不做额外 UI 精装修
