# 麻将模块 Vision I/O Contract V1

## 文件属性

- **版本**: v1.0.0
- **日期**: 2026-04-15
- **状态**: 预留（T1），待 T3 样板闭环后确认

## 1. 总则

本契约定义麻将专用识别模块与 AGI Model Factory 主骨架之间的输入/输出数据协议。所有麻将相关管线的跨模块数据交换必须遵守本契约。

### 1.1 契约原则

- **向后兼容**: 新字段以 optional 方式扩展，不删除已有字段
- **版本标记**: 所有 manifest 文件包含 `contract_version` 字段
- **路径规范**: 所有路径使用绝对路径（Windows: `E:\...`）
- **编码规范**: 所有 JSON 文件使用 UTF-8 without BOM

## 2. VisionModuleInput

### 2.1 通用输入结构

```json
{
  "contract_version": "1.0.0",
  "pipeline_id": "mahjong_detect | mahjong_classify | mahjong_fusion",
  "experiment_id": "uuid-string",
  "dataset_id": "uuid-string",
  "model_id": "uuid-string (optional)",
  "model_path": "absolute-path (optional, overrides model_id)",
  "execution_mode": "mahjong_detect | mahjong_classify | mahjong_fusion",
  "params": {
    "confidence_threshold": 0.5,
    "iou_threshold": 0.45,
    "max_detections": 100
  }
}
```

### 2.2 输入字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| contract_version | string | 是 | 契约版本号，当前为 "1.0.0" |
| pipeline_id | string | 是 | 目标管线标识 |
| experiment_id | string | 是 | 关联实验 ID |
| dataset_id | string | 是 | 关联数据集 ID |
| model_id | string | 否 | 模型 ID（从 models 表获取） |
| model_path | string | 否 | 模型文件绝对路径（优先于 model_id） |
| execution_mode | string | 是 | 执行模式 |
| params.confidence_threshold | number | 否 | 置信度阈值，默认 0.5 |
| params.iou_threshold | number | 否 | NMS IoU 阈值，默认 0.45 |
| params.max_detections | number | 否 | 最大检测数量，默认 100 |

## 3. VisionModuleOutput

### 3.1 通用输出结构

```json
{
  "contract_version": "1.0.0",
  "pipeline_id": "mahjong_detect",
  "status": "success | failed | partial",
  "created_at": "ISO-8601 timestamp",
  "artifacts": [
    {
      "type": "mahjong_detection_result",
      "path": "absolute-path/to/result.json",
      "format": "json",
      "size_bytes": 12345
    }
  ],
  "metrics": {
    "total_detections": 136,
    "avg_confidence": 0.87,
    "processing_time_ms": 152
  },
  "error": null
}
```

### 3.2 输出字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| contract_version | string | 契约版本号 |
| pipeline_id | string | 执行的管线标识 |
| status | string | 执行结果状态 |
| created_at | string | 输出生成时间 |
| artifacts | array | 产出物列表 |
| artifacts[].type | string | 产出物类型（对应 artifact registry） |
| artifacts[].path | string | 产出物文件绝对路径 |
| artifacts[].format | string | 文件格式 |
| artifacts[].size_bytes | number | 文件大小 |
| metrics | object | 执行指标（可选） |
| error | string/null | 错误信息 |

## 4. 管线专属输出

### 4.1 mahjong_detect 输出

```json
{
  "contract_version": "1.0.0",
  "pipeline_id": "mahjong_detect",
  "detections": [
    {
      "class_id": 0,
      "class_name": "1m",
      "confidence": 0.95,
      "bbox": [x1, y1, x2, y2]
    }
  ],
  "image_info": {
    "width": 1920,
    "height": 1080,
    "path": "absolute-path/to/image.jpg"
  }
}
```

### 4.2 mahjong_classify 输出

```json
{
  "contract_version": "1.0.0",
  "pipeline_id": "mahjong_classify",
  "classifications": [
    {
      "segment_id": "uuid",
      "predicted_class": "7p",
      "confidence": 0.92,
      "top3": [
        {"class": "7p", "confidence": 0.92},
        {"class": "7s", "confidence": 0.05},
        {"class": "7z", "confidence": 0.02}
      ]
    }
  ]
}
```

### 4.3 mahjong_fusion 输出

```json
{
  "contract_version": "1.0.0",
  "pipeline_id": "mahjong_fusion",
  "results": [
    {
      "tile_id": 1,
      "class_name": "1m",
      "confidence": 0.94,
      "bbox": [x1, y1, x2, y2],
      "detection_confidence": 0.95,
      "classification_confidence": 0.92,
      "fusion_method": "weighted_average"
    }
  ],
  "summary": {
    "total_tiles": 136,
    "high_confidence_count": 128,
    "low_confidence_count": 8,
    "unique_classes": 34
  }
}
```

## 5. 34 类牌面枚举

### 5.1 万子 (m)

1m, 2m, 3m, 4m, 5m, 6m, 7m, 8m, 9m

### 5.2 筒子 (p)

1p, 2p, 3p, 4p, 5p, 6p, 7p, 8p, 9p

### 5.3 索子 (s)

1s, 2s, 3s, 4s, 5s, 6s, 7s, 8s, 9s

### 5.4 风牌 (z)

dong (东), nan (南), xi (西), bei (北)

### 5.5 箭牌

zhong (中), fa (发), bai (白)

### 5.6 class_id 映射

| class_id | class_name | 中文名 |
|----------|-----------|--------|
| 0 | 1m | 一万 |
| 1 | 2m | 二万 |
| 2 | 3m | 三万 |
| 3 | 4m | 四万 |
| 4 | 5m | 五万 |
| 5 | 6m | 六万 |
| 6 | 7m | 七万 |
| 7 | 8m | 八万 |
| 8 | 9m | 九万 |
| 9 | 1p | 一筒 |
| 10 | 2p | 二筒 |
| 11 | 3p | 三筒 |
| 12 | 4p | 四筒 |
| 13 | 5p | 五筒 |
| 14 | 6p | 六筒 |
| 15 | 7p | 七筒 |
| 16 | 8p | 八筒 |
| 17 | 9p | 九筒 |
| 18 | 1s | 一索 |
| 19 | 2s | 二索 |
| 20 | 3s | 三索 |
| 21 | 4s | 四索 |
| 22 | 5s | 五索 |
| 23 | 6s | 六索 |
| 24 | 7s | 七索 |
| 25 | 8s | 八索 |
| 26 | 9s | 九索 |
| 27 | dong | 东 |
| 28 | nan | 南 |
| 29 | xi | 西 |
| 30 | bei | 北 |
| 31 | zhong | 中 |
| 32 | fa | 发 |
| 33 | bai | 白 |

## 6. Manifest 文件规范

每个管线执行完成后，必须在输出目录生成 manifest 文件：

- mahjong_detect → `mahjong_detection_manifest.json`
- mahjong_classify → `mahjong_classification_manifest.json`
- mahjong_fusion → `mahjong_fusion_manifest.json`

Manifest 必须包含：
- `contract_version`
- `pipeline_id`
- `status`
- `created_at`
- `artifacts`（所有产出文件路径）
- `metrics`（执行指标）

## 7. 版本演进

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-15 | T1 初始预留版本 |
