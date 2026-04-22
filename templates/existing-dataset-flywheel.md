# 已有数据集训练闭环

## 模板名称
- **ID**: `tpl-existing-dataset-flywheel`
- **名称**: 已有数据集训练闭环
- **Code**: `existing_dataset_flywheel`
- **类别**: `yolo_flywheel`
- **版本**: `1.0.0`

## 模板用途
从已有数据集直接进入训练评估归档链路，适用于：
- 已有标注数据集的快速训练启动
- 训练链路快捷入口
- 独立训练/评估/归档场景

## 链路结构
```
加载数据集 → 数据集切分 → 训练配置 → 训练 → 评估 → 归档
```

## 必填参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `dataset_id` | string | 数据集唯一标识 |
| `experiment_id` | string | 实验唯一标识 |
| `template_version` | string | 模板版本 |

## 可选参数
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `dataset_name` | - | 数据集名称 |
| `framework` | `yolov8` | 训练框架 |
| `model_variant` | `yolov8n` | 模型变体 |
| `epochs` | `1` | 训练轮数 |
| `allow_fallback` | `true` | 允许 Fallback 模式 |
| `preset_code` | `yolo-detect-debug` | 训练预设 |

## 使用示例

```json
{
  "name": "My Training Job",
  "template_id": "tpl-existing-dataset-flywheel",
  "input": {
    "dataset_id": "my_existing_dataset",
    "experiment_id": "my_experiment_001",
    "template_version": "1.0.0"
  }
}
```

## 推荐使用场景
1. **已有数据集训练**: 已有标注数据，快速启动训练
2. **快捷训练入口**: 跳过数据准备，直接训练
3. **独立训练链路**: 单独的训练/评估/归档场景

## 注意事项
- 需要确保数据集已存在于系统中
- 训练步骤需要 GPU 环境，否则需设置 `allow_fallback: true`

## 文件信息
- **文件路径**: `templates/existing-dataset-flywheel.json`
- **最后更新**: 2026-04-20
- **验证状态**: 待验证
