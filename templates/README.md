# 模板资产索引

> 本目录包含工作流模板资产。所有正式模板需在此索引中登记。

## 索引

| ID | 名称 | 状态 | 链路步数 | 说明 |
|----|------|------|----------|------|
| `tpl-minimal-full-chain-flywheel` | 最小全链飞轮样板 | active-development | 9 | 视频源→抽帧→清洗→注册→切分→训练配置→训练→评估→归档 |
| `tpl-existing-dataset-flywheel` | 已有数据集训练闭环 | active-development | 6 | 加载数据集→切分→训练配置→训练→评估→归档 |
| `tpl-front-chain-light` | 数据准备轻量链 | active-development | 5 | 视频源→抽帧→清洗→注册→切分 |

## 模板列表

### tpl-minimal-full-chain-flywheel
- **名称**: 最小全链飞轮样板
- **状态**: `active-development`
- **链路**: 9 步
- **用途**: 完整训练链路验证、入门演示、回归测试基线
- **文件**: 
  - JSON: `minimal-full-chain-flywheel.json`
  - 说明: `minimal-full-chain-flywheel.md`

### tpl-existing-dataset-flywheel
- **名称**: 已有数据集训练闭环
- **状态**: `active-development`
- **链路**: 6 步
- **用途**: 已有数据集快速训练入口
- **文件**: 
  - JSON: `existing-dataset-flywheel.json`
  - 说明: `existing-dataset-flywheel.md`
- **必填参数**: `dataset_id`, `experiment_id`, `template_version`

### tpl-front-chain-light
- **名称**: 数据准备轻量链
- **状态**: `active-development`
- **链路**: 5 步
- **用途**: 纯数据准备前链
- **文件**: 
  - JSON: `front-chain-light.json`
  - 说明: `front-chain-light.md`
- **必填参数**: `source_path`, `dataset_id`

## 添加新模板

1. 在 `apps/local-api/src/workflow/index.ts` 的 `seedWorkflowFactoryTemplates()` 中添加模板定义
2. 在 `templates/` 目录创建对应的 JSON 和 MD 文件
3. 更新本索引文件，添加模板条目
4. 执行验证测试

## 状态说明

- `active-development`: 开发中，可使用
- `official-template`: 正式模板
- `deprecated`: 已废弃
- `sealed`: 封板冻结

## 维护规则

1. 数据库模板与文件模板需保持一致
2. 每次代码变更后需更新 JSON 文件
3. 状态变更需记录
4. 不做封板冻结，保持可演进
