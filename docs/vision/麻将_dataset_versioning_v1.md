# 麻将数据集版本治理规范 V1

## 文件属性

- **版本**: v1.0
- **日期**: 2026-04-15
- **状态**: 冻结

## 1. 核心原则

1. **不可覆盖**：已发布的 dataset_version 永远不修改
2. **可溯源**：每个版本可追溯到原始数据来源和标注人员
3. **可回滚**：训练任务可回查到训练时使用的数据版本
4. **显式命名**：版本号必须显式记录，不使用 "latest"

## 2. dataset_version 命名规范

### 2.1 格式

```
mahjong_{seq}{suffix}_{YYYYMMDD}_{nnn}
```

| 部分 | 说明 | 示例 |
|------|------|------|
| `mahjong` | 固定前缀 | mahjong |
| `{seq}{suffix}` | 序列标识 | `v1`、`v2`、`v3_b` | 
| `{YYYYMMDD}` | 采集/清洗日期 | `20260415` |
| `{nnn}` | 当日序号（从 001 起） | `001` |

### 2.2 版本序列

| dataset_version | 说明 |
|----------------|------|
| `mahjong_v1_20260415_001` | 麻将数据集，第一个清洗版本 |
| `mahjong_v1_20260420_001` | 同一数据集，新采集数据补充后的版本 |
| `mahjong_v1_20260425_001` | 同一数据集，修复标注错误后的版本 |

### 2.3 版本类型标签（suffix）

| suffix | 含义 |
|--------|------|
| （无） | 标准清洗版本 |
| `_b` | 小批量增补版本 |
| `_q` | 仅修复标注质量问题的版本 |
| `_r` | 重新划分 train/val 的版本 |

## 3. 版本状态

| 状态 | 说明 | 可用于训练 |
|------|------|-----------|
| draft | 正在标注/清洗中 | ❌ |
| candidate | 标注完成，待质量审核 | ❌ |
| approved | 质量审核通过 | ✅ |
| archived | 已被新版本替代 | ❌（仅查看） |

**状态转换**：draft → candidate → approved → archived（单向，不可逆）

## 4. 版本元信息（写入 datasets 表）

每个版本写入 `datasets` 表时，`meta_json` 必须包含以下字段：

```json
{
  "dataset_version": "mahjong_v1_20260415_001",
  "seq": 1,
  "suffix": "",
  "date": "20260415",
  "seq_number": "001",
  "status": "approved",
  "total_raw_images": 520,
  "total_clean_images": 480,
  "train_count": 384,
  "val_count": 72,
  "test_count": 24,
  "class_distribution": {
    "1m": 120, "2m": 118, ..., "bai": 35
  },
  "annotation_tool": "labelme 5.0",
  "annotated_by": "标注员A",
  "reviewed_by": "审核员B",
  "quality_check_passed": true,
  "data_sources": [
    {
      "source_id": "raw001",
      "description": "2026-04-15 室内自然光拍摄",
      "device": "iPhone 14 Pro",
      "image_count": 300
    }
  ],
  "change_log": "初始版本，500张图像，34类"
}
```

## 5. 版本登记流程

```
标注完成
  ↓
标注员提交（draft → candidate）
  ↓
质量审核（审核标注数量、类别分布、坏图率）
  ↓
通过 → approved（可进入训练）
  ↓
新版本发布
  ↓
旧版本自动 → archived
```

## 6. 与训练任务的绑定

### 6.1 绑定字段（写入 training run）

```json
{
  "dataset_id": "<datasets.id>",
  "dataset_version": "mahjong_v1_20260415_001",
  "dataset_code": "mahjong_v1",
  "dataset_root": "E:\\AGI_Factory\\data\\mahjong\\",
  "dataset_yaml": "E:\\AGI_Factory\\data\\mahjong\\dataset.yaml",
  "split_manifests": {
    "train": "E:\\AGI_Factory\\data\\mahjong\\split\\mahjong_v1_20260415_001\\train_manifest.json",
    "val": "E:\\AGI_Factory\\data\\mahjong\\split\\mahjong_v1_20260415_001\\val_manifest.json",
    "test": "E:\\AGI_Factory\\data\\mahjong\\split\\mahjong_v1_20260415_001\\test_manifest.json"
  }
}
```

### 6.2 溯源链路

```
训练记录 (runs 表)
  → config_json.training_config_id
  → training_configs.dataset_id
  → datasets.id
  → datasets.meta_json.dataset_version
  → split manifest
  → 原始数据文件
```

### 6.3 版本锁定（不可用 latest）

- 训练任务创建时必须显式指定 `dataset_version`
- API 禁止接受 `version=latest` 或 `version=*`
- UI 侧下拉框仅展示 `status=approved` 的版本

## 7. 版本废弃规则

当新版本 approved 时，旧版本自动转为 archived：

1. archived 版本不得用于新训练任务
2. 已使用 archived 版本跑出的模型不受影响
3. 历史模型的 `source_dataset_version` 字段不变

## 8. 与 Datasets 表的字段映射

| datasets 表字段 | 麻将数据集填法 |
|----------------|-------------|
| id | UUID（自动生成） |
| dataset_code | `mahjong_v1` |
| name | `麻将识别数据集 v1` |
| version | `mahjong_v1_20260415_001` |
| status | `approved` |
| dataset_type | `detection` |
| storage_path | `E:\AGI_Factory\data\mahjong\` |
| label_format | `yolo` |
| sample_count | 480 |
| train_count | 384 |
| val_count | 72 |
| test_count | 24 |
| tags_json | `["mahjong","vision","detection","34class"]` |
| meta_json | 见上方版本元信息结构 |

## 9. 违反规则的处置

| 违规行为 | 处置 |
|---------|------|
| 覆盖已 approved 版本 | 记录违规事件，版本冻结，通知审计 |
| 使用 archived 版本新建训练 | API 拒绝，返回错误 |
| 未绑定 dataset_version 即发起训练 | API 拒绝，返回错误 |
| 手动修改 split manifest | 记录违规事件，触发审计 |

## 10. 版本演进

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-04-15 | T2 初始冻结版 |
