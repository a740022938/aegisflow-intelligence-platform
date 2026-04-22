# Knowledge Entry Spec — 知识条目规范

**Project**: AGI Model Factory  
**Version**: 6.1.0  
**Date**: 2026-04-13

---

## 1. 知识条目结构

### 1.1 字段定义

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | TEXT (UUID) | 自动 | 主键 |
| title | TEXT | 必填 | 标题（最多 200 字符） |
| category | TEXT | 必填 | 分类 |
| source_type | TEXT | 可选 | 来源类型 |
| source_id | TEXT | 可选 | 来源ID |
| summary | TEXT | 可选 | 摘要（最多 500 字符） |
| problem | TEXT | 可选 | 问题描述 |
| resolution | TEXT | 可选 | 处理过程 |
| conclusion | TEXT | 可选 | 结论 |
| recommendation | TEXT | 可选 | 建议 |
| tags_json | TEXT | 可选 | 标签数组（JSON 数组格式） |
| created_at | TEXT | 自动 | ISO 8601 时间戳 |
| updated_at | TEXT | 自动 | ISO 8601 时间戳 |

### 1.2 分类枚举

```
failure_postmortem  — 失败复盘
model_conclusion    — 模型结论
task_experience     — 任务经验
general_note        — 通用笔记
```

---

## 2. 模板

### 2.1 失败复盘模板（failure_postmortem）

```json
{
  "title": "[P0] YOLO Training Job Failed: Out of Memory",
  "category": "failure_postmortem",
  "source_type": "task",
  "source_id": "task_xxx",
  "summary": "YOLO 训练任务因 GPU 显存不足导致失败。",
  "problem": "任务执行过程中 GPU 内存耗尽，进程被 OOM Killer 终止。",
  "resolution": "1. 减小 batch_size 从 16 降至 4\n2. 减少 max_workers\n3. 添加 CUDA_VISIBLE_DEVICES 环境变量\n\n重新执行后成功完成训练。",
  "conclusion": "GPU 显存规划不足是本次失败根因。后续训练任务需提前评估显存需求。",
  "recommendation": "1. 在模板中添加 batch_size 上限检查\n2. 添加显存预估公式\n3. 超出阈值时自动降级配置",
  "tags_json": "[\"yolo\", \"oom\", \"gpu\", \"training\"]"
}
```

### 2.2 模型结论模板（model_conclusion）

```json
{
  "title": "ResNet18 on Mahjong Dataset: mAP 0.71 @ IoU 0.5",
  "category": "model_conclusion",
  "source_type": "experiment",
  "source_id": "exp_xxx",
  "summary": "ResNet18 在麻将数据集上 mAP 71%，适合作为基线模型。",
  "problem": "需要评估 ResNet18 在麻将数据集上的目标检测性能。",
  "resolution": "使用 v3.1.0 YOLO 训练模板执行 100 epochs 训练，batch_size=16，输入尺寸 640x640。",
  "conclusion": "ResNet18 在麻将数据集上达到 mAP 0.71（IoU 0.5），可将 'envelope' 误判率从 81/82 降至 12/82。适合作为基线，后续可尝试 ResNet50 提升精度。",
  "recommendation": "1. 使用 ResNet18 作为基线\n2. 尝试 ResNet50 提升精度\n3. 增加数据增强策略",
  "tags_json": "[\"resnet18\", \"mahjong\", \"mAP\", \"baseline\"]"
}
```

---

## 3. 知识关联结构

### knowledge_links

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | TEXT (UUID) | 自动 | 主键 |
| knowledge_id | TEXT | 必填 | 知识条目 ID |
| target_type | TEXT | 必填 | task / model / experiment |
| target_id | TEXT | 必填 | 目标实体 ID |
| relation_type | TEXT | 必填 | relates_to / blocks / resolves / improves |
| created_at | TEXT | 自动 | ISO 8601 时间戳 |

---

## 4. API 请求/响应格式

### POST /api/knowledge

**Request Body**:
```json
{
  "title": "ResNet18 on Mahjong Dataset: mAP 0.71",
  "category": "model_conclusion",
  "source_type": "experiment",
  "source_id": "exp_xxx",
  "summary": "ResNet18 基线模型评估结论",
  "problem": "需要评估 ResNet18 在麻将数据集上的性能",
  "resolution": "使用 YOLO 训练模板执行 100 epochs 训练",
  "conclusion": "mAP 0.71，适合作为基线",
  "recommendation": "尝试 ResNet50 提升精度",
  "tags_json": "[\"resnet18\", \"mahjong\", \"baseline\"]"
}
```

**Response**:
```json
{
  "ok": true,
  "knowledge": {
    "id": "uuid-xxx",
    "title": "...",
    "category": "model_conclusion",
    ...
  }
}
```

### GET /api/knowledge?category=failure_postmortem&tag=yolo

**Response**:
```json
{
  "ok": true,
  "entries": [...],
  "count": 3
}
```

---

## 5. 审计事件

| 事件 | 说明 |
|------|------|
| KNOWLEDGE_CREATED | 知识条目新增 |
| KNOWLEDGE_UPDATED | 知识条目更新 |
| KNOWLEDGE_DELETED | 知识条目删除 |
| KNOWLEDGE_LINKED | 建立知识关联 |
| KNOWLEDGE_UNLINKED | 解除知识关联 |

---

**Status**: SPEC DEFINED — 2026-04-13
