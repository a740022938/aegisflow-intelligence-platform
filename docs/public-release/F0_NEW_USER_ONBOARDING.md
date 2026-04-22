# Phase F.0 新用户最小上手闭环

## 第一次怎么用（4 步）
1. 克隆并安装依赖：`pnpm install`
2. 初始化并启动：`pnpm run db:init` + `pnpm run dev`
3. 进入 Workflow Composer，导入新手模板并点击 Run
4. 在 Workflow Jobs / Results 面板查看状态、输出与错误

## 模板推荐分层
### 最小上手模板
- `templates/front-chain-light.json`
- 目的：最小链路、快速看到状态变化

### 第一次推荐运行模板
- `templates/minimal-full-chain-flywheel.json`
- 目的：覆盖主要节点与结果消费路径

### 暂不建议新手首跑模板
- `templates/existing-dataset-flywheel.json`
- 原因：依赖已有数据上下文，前置条件更多

## 新手入口文案（可直接贴到 UI/官网）
- 第一步：先去 `Workflow Composer` 页面导入 `front-chain-light.json`
- 第二步：点击 `Run`，记录 job_id
- 第三步：去 `Workflow Jobs` 查看运行状态
- 成功后：回到结果面板查看输出摘要与实体 ID
- 失败后：打开日志页（按 job_id）查看错误摘要

## 新手成功标准
- Web UI 可打开
- Local API `/api/health` 返回 `ok: true`
- 能看到至少一次任务状态变化并有结果面板数据
