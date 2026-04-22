# Candidate Detector Integration Decision

**日期**: 2026-04-16
**决策**: current_detector 保留，candidate_detector 进入 shadow compare

---

## 1. 背景

B5 发现检测器是主瓶颈，需要引入专用麻将 YOLO 候选模型进行 shadow compare。

---

## 2. 模型资产

### Current Detector (保留)
- 路径: `E:\yolov8\best.pt` (21.57 MB)
- 状态: production
- 特点: 本地训练，已适配场景

### Candidate Detector v1
- 路径: `E:\AGI_Factory\models\candidate_detector\yolov8n.pt` (6.25 MB)
- 来源: Ultralytics YOLOv8n
- 状态: candidate
- 特点: 轻量、快速

### Candidate Detector v2
- 路径: `E:\AGI_Factory\models\candidate_detector\yolov8s.pt` (21.54 MB)
- 来源: Ultralytics YOLOv8s
- 状态: candidate
- 特点: 精度更高

---

## 3. Shadow Compare 结果

| 指标 | Current | Candidate | 评估 |
|------|---------|-----------|------|
| 有效检测 | 9 | 13 | +44% |
| 假框过滤 | 无 | 有 | 新增 |
| 验证机制 | 无 | mahjong_vision | 新增 |

---

## 4. 决策

### 4.1 不替换 Production

理由:
1. candidate 为通用 COCO 模型，非麻将专用
2. 需要 mahjong_vision 二次验证，增加复杂度
3. 验证置信度偏低 (0.045)，需优化

### 4.2 继续 Shadow Compare

行动:
1. 使用真实麻将视频测试 candidate
2. 积累更多对比数据
3. 训练麻将专用 YOLO 模型

---

## 5. 下一步

1. 使用真实视频跑通 candidate 完整链路
2. 训练麻将专用 YOLO (基于本地数据)
3. 优化 mahjong_vision 验证阈值

---

**决策**: 保留 current_detector，candidate_detector 继续 shadow compare
**日期**: 2026-04-16
