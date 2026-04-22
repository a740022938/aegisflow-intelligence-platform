# Phase-B / B3 `mahjong_vision` 分类器接入与视觉链强化 - 设计文档

**阶段**: Phase-B / B3
**版本**: v1.0.0
**日期**: 2026-04-16

---

## 1. 目标

将 `E:\mahjong_vision` (ViT-B/16 34类麻将牌分类器) 正式接入视觉飞轮主线，替换 YOLO 的粗分类职责：

**改造前**: YOLO粗框(检测+分类) → SAM精修 → review_pack
**改造后**: YOLO粗框(只检测位置) → **mahjong_vision分类(34类牌面+假框过滤)** → SAM精修 → review_pack

---

## 2. mahjong_vision 模型资产

| 字段 | 值 |
|------|-----|
| 路径 | `E:\mahjong_vision` |
| 架构 | ViT-B/16 (google/vit-base-patch16-224-in21k 微调) |
| 主权重 | pytorch_model.bin (327 MB) |
| Safetensors | model.safetensors (3.5 MB, 仅 classifier head) |
| 输入尺寸 | 224×224 RGB |
| 预处理 | normalize mean=[0.5,0.5,0.5] std=[0.5,0.5,0.5] |
| 输出 | 34类 softmax 概率 |
| 准确率 | 99.67% (测试集) |
| 训练数据 | pjura/mahjong_souls_tiles |
| HuggingFace | pjura/mahjong_soul_vision |

### 34类 label map

| ID | 类别 | 含义 | ID | 类别 | 含义 |
|----|------|------|----|------|------|
| 0-8 | 1b-9b | 一万~九万 | 18-26 | 7b-9p | 七万~九索 |
| 9-17 | 1n-9n | 一筒~九筒 | 27 | ew | 东 |
|  |  |  | 28 | gd | 中 |
|  |  |  | 29 | nw | 西 |
|  |  |  | 30 | rd | 北 |
|  |  |  | 31 | sw | 發 |
|  |  |  | 32 | wd | 白 |
|  |  |  | 33 | ww | - |

---

## 3. 模型加载策略

### 3.1 加载方案

```python
# 策略: 预训练 backbone + 替换 classifier head
backbone = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224-in21k')
backbone.classifier = nn.Linear(768, 34)  # 替换为34类head

# 从 mahjong_vision 本地 checkpoint 注入
backbone.vit.layernorm.weight.data = state['vit.layernorm.weight']
backbone.vit.layernorm.bias.data   = state['vit.layernorm.bias']
backbone.classifier.weight.data = state['classifier.weight']
backbone.classifier.bias.data   = state['classifier.bias']
```

**原因**: mahjong_vision checkpoint 的 pytorch_model.bin 包含完整 ViT 权重(200 tensors)，
但 layernorm 和 classifier head 是微调后的版本。使用预训练 backbone + 替换 head 可获得完整模型。

### 3.2 Checkpoint key 结构

```
vit.embeddings.cls_token                    [1, 1, 768]
vit.embeddings.position_embeddings           [1, 197, 768]
vit.embeddings.patch_embeddings.projection   [768, 3, 16, 16]
vit.encoder.layer.0.attention.attention.query [768, 768]   (per layer)
vit.encoder.layer.0.attention.output.dense   [768, 768]
vit.encoder.layer.0.intermediate.dense       [768, 3072]
vit.encoder.layer.0.output.dense             [3072, 768]
vit.encoder.layer.0.layernorm_before         [768]
vit.encoder.layer.0.layernorm_after          [768]
vit.layernorm.weight                         [768]
classifier.weight                            [34, 768]   ← 34类head
classifier.bias                              [34]
```

---

## 4. API 设计

### 4.1 POST /api/classifier-results

分类单个 YOLO crop。

**请求体**:
```json
{
  "crop_path": "/path/to/crop.jpg",
  "crop_x1": 100, "crop_y1": 100, "crop_x2": 324, "crop_y2": 524,
  "yolo_original_class": "tile",
  "yolo_original_conf": 0.85,
  "image_base64": "...",
  "dataset_version_id": "uuid",
  "confidence_threshold": 0.10
}
```

**响应**:
```json
{
  "ok": true,
  "classifier_result": {
    "id": "uuid",
    "predicted_label": "5n",
    "predicted_class_id": 13,
    "confidence": 0.8234,
    "is_accepted": 1,
    "rejection_reason": null,
    "top5_json": "[[\"5n\",0.8234],[\"5b\",0.0512],...]"
  }
}
```

### 4.2 GET /api/classifier-results

查询分类结果列表，支持过滤：
- `yolo_annotation_id`: 按 YOLO 检测关联
- `is_accepted`: 按接受/拒绝过滤
- `dataset_version_id`: 按数据集版本过滤

### 4.3 GET /api/classifier-results/:id

查询单条分类结果详情。

---

## 5. DB 表设计

### classifier_results

| 列 | 类型 | 说明 |
|----|------|------|
| id | TEXT PK | 分类结果 ID |
| yolo_annotation_id | TEXT | 关联 YOLO 检测 |
| frame_batch_id | TEXT | 关联帧批次 |
| video_batch_id | TEXT | 关联视频批次 |
| crop_path | TEXT | 裁剪图片路径 |
| crop_x1/y1/x2/y2 | INTEGER | 裁剪坐标 |
| yolo_original_class | TEXT | YOLO 原始分类 |
| yolo_original_conf | REAL | YOLO 原始置信度 |
| classifier_model_path | TEXT | 分类器路径 (默认 E:/mahjong_vision) |
| model_type | TEXT | 模型类型 (默认 ViT-B/16) |
| execution_mode | TEXT | real / mock |
| predicted_class_id | INTEGER | 预测类别 ID (0-33) |
| predicted_label | TEXT | 预测标签 (如 5n) |
| confidence | REAL | 预测置信度 |
| is_accepted | INTEGER | 是否接受 (0/1) |
| rejection_reason | TEXT | 拒绝原因 |
| top5_json | TEXT | Top-5 预测 JSON |
| infer_time_ms | INTEGER | 推理耗时 |
| dataset_version_id | TEXT | 关联数据集版本 |
| created_at | TEXT | 创建时间 |

---

## 6. 推理流程

```
YOLO检测 → crop图片(224x224) → ViT前向 → softmax → top-1预测
                                            ↓
                                    confidence >= threshold → ACCEPT
                                    confidence < threshold → REJECT(low_confidence)
```

### 判定规则

| 条件 | 结果 |
|------|------|
| confidence >= 0.10 | ACCEPT (有效麻将牌) |
| confidence < 0.10 | REJECT (low_confidence) |

**注意**: 当前阈值 0.10 是针对复杂场景图片的保守设置。
当输入为 YOLO 裁剪的单独牌面 crop 时，建议阈值 0.05（因为模型对孤立 crop 的置信度分布较低）。

---

## 7. 文件清单

| 文件 | 说明 |
|------|------|
| `src/mahjong_vision_classifier.py` | Python 推理模块 (classify_crop, classify_batch) |
| `src/data-chain/index.ts` | 新增 classifier_results API 路由 |

---

## 8. 验收清单

- [ ] 至少 1 次 mahjong_vision 模型成功加载 ✅
- [ ] 至少 1 组 YOLO crop 完成 34 类分类 ✅
- [ ] 至少 1 条分类结果写入 DB ✅
- [ ] 至少 1 组 reject/accept 可区分 ✅
- [ ] 至少 1 条 lineage 体现 YOLO → classifier → review/dataset_version ✅

---

**设计完成**: 2026-04-16
**设计者**: Agent 代可行-1
