# Phase-B / B4 双模型主链实战收口 - 设计文档

**阶段**: Phase-B / B4
**版本**: v1.0.0
**日期**: 2026-04-16

---

## 1. 目标

正式确立并验证双模型视觉飞轮主链，完成从真实视频到 dataset_version 的完整数据生产链路。

**双模型分工**:

| 模型 | 路径 | 职责 | 输出 |
|------|------|------|------|
| YOLOv8 | `E:\yolov8\best.pt` | **只检测框** (不负责分类) | bbox (x,y,w,h) + 置信度 |
| mahjong_vision | `E:\mahjong_vision` | **34类分类 + 假框过滤** | label + class_id + confidence + accept/reject |

**暂不接入**:
- `E:\mahjong_ai` - 决策层模型，当前视觉主线暂不接入
- `E:\mahjong-winning-tiles` - 暂不接入当前视觉主线

---

## 2. 完整数据链

```
真实视频/图片
    ↓
video_batch (批次注册)
    ↓
frame_extraction (抽帧)
    ↓
yolo_annotation (E:\yolov8\best.pt 粗框检测)
    ↓
classifier_results (E:\mahjong_vision 34类分类 + 假框过滤)
    ↓
review_pack (人工复核队列)
    ↓
dataset_version (数据集版本)
```

---

## 3. 双模型协作流程

### 3.1 YOLO 检测阶段

**输入**: 帧图片 (from frame_extraction)
**输出**: 检测框列表
```json
[
  {"x": 0.5, "y": 0.5, "w": 0.3, "h": 0.3, "confidence": 0.92, "class_id": 0},
  {"x": 0.3, "y": 0.3, "w": 0.25, "h": 0.25, "confidence": 0.85, "class_id": 1}
]
```

**写入**: `yolo_annotations` 表
- `annotation_data_json`: 检测框列表
- `total_boxes`: 检测框数量
- `frame_extraction_id`: 关联帧

### 3.2 mahjong_vision 分类阶段

**输入**: YOLO crop (根据 bbox 裁剪)
**处理**:
1. 裁剪原图 → 224×224
2. ViT 前向 → 34类 softmax
3. 阈值判定 → accept/reject

**输出**:
```json
{
  "predicted_label": "5n",
  "predicted_class_id": 13,
  "confidence": 0.8234,
  "is_accepted": 1,
  "rejection_reason": null,
  "top5": [["5n", 0.8234], ["5b", 0.0512], ...]
}
```

**写入**: `classifier_results` 表
- `yolo_annotation_id`: 关联 YOLO 检测
- `predicted_class_id/label/confidence`: 分类结果
- `is_accepted/rejection_reason`: 过滤决策

### 3.3 假框过滤机制

| 判定 | 条件 | 处理 |
|------|------|------|
| ACCEPT | confidence >= threshold (0.04) | 进入 review_pack → dataset_version |
| REJECT | confidence < threshold | 记录 reject 原因，不进入下游 |

**假框类型识别**:
- 背景误检 (低置信度)
- 多牌重叠 (可后续 SAM 处理)
- 模糊/遮挡 (人工复核)

---

## 4. Lineage 可回查设计

### 4.1 正向链路

```
video_batch.id
    → frame_extraction.video_batch_id
    → yolo_annotation.frame_extraction_id
    → classifier_results.yolo_annotation_id
    → review_pack (via classifier_results aggregation)
    → dataset_version (source_chain_json 记录完整链路)
```

### 4.2 反向回查

从任意节点可回查上游：

```sql
-- 从 dataset_version 回查
SELECT source_chain_json FROM dataset_versions WHERE id = ?;
-- 返回: {video_batch_id, yolo_model, classifier_model, pipeline}

-- 从 classifier_result 回查
SELECT yolo_annotation_id, frame_batch_id FROM classifier_results WHERE id = ?;

-- 从 yolo_annotation 回查
SELECT frame_extraction_id FROM yolo_annotations WHERE id = ?;
```

### 4.3 Reject 原因可查

```sql
SELECT id, predicted_label, confidence, rejection_reason 
FROM classifier_results 
WHERE is_accepted = 0;
```

---

## 5. 统计指标设计

### 5.1 假框过滤率

```
假框过滤率 = rejected_count / total_classifications × 100%
```

### 5.2 Accept/Reject 比例

```
接受率 = accepted_count / total × 100%
拒绝率 = rejected_count / total × 100%
```

### 5.3 Review Pack 压力

```
review_pack 样本数 = accepted_count (reject 的不进入)
人工复核率 = review_pack_samples / total_detections × 100%
```

### 5.4 Dataset Version 质量

```
version 样本数 = accepted_count
平均置信度 = AVG(confidence) WHERE is_accepted = 1
```

---

## 6. 文件清单

| 文件 | 说明 |
|------|------|
| `E:\yolov8\best.pt` | YOLOv8 检测模型 (21.57 MB) |
| `E:\mahjong_vision\pytorch_model.bin` | ViT 分类模型 (327 MB) |
| `src/mahjong_vision_classifier.py` | Python 推理模块 |
| `src/data-chain/index.ts` | API 路由 (classifier_results CRUD) |
| `b4_pipeline_test.py` | 完整链路测试脚本 |

---

## 7. 验收标准

- [ ] 至少 1 个真实 video_batch 跑通完整链路
- [ ] 至少 1 组 YOLO 检测框成功送入 mahjong_vision
- [ ] 至少 1 组 accept/reject 结果可查
- [ ] 至少 1 条 dataset_version 能回查双模型链路
- [ ] 至少 1 份前后对比统计结果
- [ ] 明确结论: 双模型链是否显著提升视觉飞轮质量

---

**设计完成**: 2026-04-16
**设计者**: Agent 代可行-1
