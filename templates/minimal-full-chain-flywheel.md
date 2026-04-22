# 最小全链飞轮样板

## 模板名称
- **ID**: `tpl-minimal-full-chain-flywheel`
- **名称**: 最小全链飞轮样板
- **Code**: `minimal_full_chain_flywheel`
- **类别**: `yolo_flywheel`
- **版本**: `1.0.0`

## 模板用途
提供一条从视频源到模型归档的完整 9 步工作流样板，适用于：
- 快速验证工作流引擎端到端能力
- 新用户入门演示
- 回归测试基线
- 后续定制化模板的起点

## 链路结构
```
视频源 → 抽帧 → 清洗 → 注册数据集 → 切分 
    → 训练配置 → 训练 → 评估 → 归档
```

## 必填参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `source_path` | string | 视频源文件路径 |
| `dataset_id` | string | 数据集唯一标识 |
| `experiment_id` | string | 实验唯一标识 |
| `template_version` | string | 模板版本（默认 `1.0.0`） |

## 可选参数
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `source_type` | `video` | 源类型 (video/image/stream) |
| `fps` | `1` | 抽帧帧率 |
| `max_frames` | `100` | 最大帧数 |
| `dataset_name` | - | 数据集名称 |
| `framework` | `yolov8` | 训练框架 |
| `model_variant` | `yolov8n` | 模型变体 |
| `epochs` | `1` | 训练轮数 |
| `allow_fallback` | `true` | 允许 Fallback 模式（无 GPU 时使用） |
| `preset_code` | `yolo-detect-debug` | 训练预设代码 |

## 使用示例

### 创建 Job
```json
{
  "name": "My Workflow Job",
  "template_id": "tpl-minimal-full-chain-flywheel",
  "input": {
    "source_path": "/path/to/video.mp4",
    "dataset_id": "my_dataset_001",
    "experiment_id": "my_experiment_001",
    "template_version": "1.0.0"
  }
}
```

### 启动执行
```
POST /api/workflow-jobs/{job_id}/start
```

## 推荐使用场景
1. **快速验证**: 验证工作流引擎端到端能力
2. **入门演示**: 新用户了解完整训练链路
3. **回归测试**: 作为 CI/CD 回归测试基线
4. **定制起点**: 复制后修改，快速创建定制化模板

## 注意事项
1. 训练步骤需要 GPU 环境，否则需设置 `allow_fallback: true`
2. `model_id` 参数会在运行时自动注入，创建时使用占位值
3. 视频源路径需确保服务有读取权限

## 文件信息
- **文件路径**: `templates/minimal-full-chain-flywheel.json`
- **最后更新**: 2026-04-20
- **验证状态**: ✅ 已验证（9 步全部成功）
