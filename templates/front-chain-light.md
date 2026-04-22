# 数据准备轻量链

## 模板名称
- **ID**: `tpl-front-chain-light`
- **名称**: 数据准备轻量链
- **Code**: `front_chain_light`
- **类别**: `data_prep`
- **版本**: `1.0.0`

## 模板用途
纯数据准备前链，适用于：
- 视频数据的抽帧和清洗
- 数据集注册和切分
- 作为完整训练链路的前置准备

## 链路结构
```
视频源 → 抽帧 → 清洗 → 注册数据集 → 数据集切分
```

## 必填参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `source_path` | string | 视频源文件路径 |
| `dataset_id` | string | 数据集唯一标识 |

## 可选参数
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `source_type` | `video` | 源类型 (video/image/stream) |
| `fps` | `1` | 抽帧帧率 |
| `max_frames` | `100` | 最大帧数 |
| `dataset_name` | - | 数据集名称 |

## 使用示例

```json
{
  "name": "My Data Prep Job",
  "template_id": "tpl-front-chain-light",
  "input": {
    "source_path": "/path/to/video.mp4",
    "dataset_id": "my_new_dataset",
    "fps": 1,
    "max_frames": 100
  }
}
```

## 推荐使用场景
1. **数据准备入口**: 视频数据的抽帧和清洗
2. **数据集构建**: 构建新的训练数据集
3. **完整链路前置**: 作为 `tpl-minimal-full-chain-flywheel` 的前置准备

## 注意事项
- 不包含训练/评估/归档步骤
- 视频源路径需确保服务有读取权限
- 生成的 dataset_id 可用于后续训练模板

## 与其他模板的关系
- **前置模板**: 为 `tpl-existing-dataset-flywheel` 提供数据集
- **前置模板**: 为 `tpl-minimal-full-chain-flywheel` 提供数据

## 文件信息
- **文件路径**: `templates/front-chain-light.json`
- **最后更新**: 2026-04-20
- **验证状态**: 待验证
