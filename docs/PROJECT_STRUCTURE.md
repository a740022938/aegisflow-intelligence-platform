# AIP 项目结构说明

## 顶层目录

| 目录 | 用途 |
|------|------|
| `apps/` | 应用入口 |
| `apps/web-ui/` | 前端（Vite + React + TypeScript） |
| `apps/local-api/` | 后端 API（Fastify + TypeScript） |
| `packages/` | 共享包（db、logger、plugin-runtime、plugin-sdk、shared-types、storage、task-engine、template-engine） |
| `scripts/` | 维护与辅助脚本 |
| `scripts/openclaw/` | OpenClaw 协作适配脚本 |
| `scripts/smoke/` | 冒烟测试脚本 |
| `plugins/` | 插件目录 |
| `templates/` | 工作流模板 |
| `workers/` | 后台工作进程 |
| `docs/` | 文档 |
| `docker/` | Docker 配置 |
| `data/` | 运行时数据目录（不提交） |

## 不能提交的内容

- 模型权重：`*.pt`、`*.pth`、`*.onnx`、`*.safetensors`
- 数据集：`datasets/`、`data/`
- 日志：`logs/`、`*.log`
- 备份：`backups/`、`releases/`、`*.zip`
- 本地环境配置：`.env.local`
- Token 文件：`*.token`、`*.key`
- 临时目录：`_TEMP/`、`_DELETE_CANDIDATES/`
- 本地资产：`_AIP_ASSETS/`、`_AIP_BACKUPS/`、`_AIP_REPORTS/`
