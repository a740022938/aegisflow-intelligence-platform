# 架构总览（Community Edition）

## 1. 平台分层

1. 表现层：`apps/web-ui`
2. 应用服务层：`apps/local-api`
3. 领域与工具层：`packages/*`、`scripts/*`
4. 数据与运行层：SQLite（默认 `packages/db/agi_factory.db`）

## 2. 核心模块

- Workflow Composer：流程编排、运行触发、节点状态追踪
- Governance Hub：治理总览、指标聚合、风险态势
- Self-Learning 主干：训练与评估结果回流
- Incident / Playbook / Audit：事件治理闭环
- OpenClaw 协作适配：心跳、任务接入、运行协同（凭据外置）

## 3. 运行链路（最小）

1. 前端触发工作流运行
2. 后端创建 workflow job 并回执 `job_id`
3. 轮询 job/step 状态并更新节点 UI
4. 结果面板展示输出摘要/错误摘要/实体 ID
5. 日志页按 `job_id` 追踪运行记录

## 4. 公开版边界

- 保留：可运行主链与核心治理能力
- 剥离：私有数据快照、个人桌面产物、私有凭据、不可去敏审计导出

## 5. 配置原则

- 凭据全部通过 `.env.local` 注入
- 路径优先相对路径或环境变量
- 默认不提交本地数据库、日志、备份与临时脚本产物
