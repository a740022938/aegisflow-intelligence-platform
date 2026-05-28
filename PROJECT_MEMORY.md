# AIP 项目速记 — 给新对话用

## 项目速览
- **项目**: agi-model-factory (AIP)
- **版本**: v8.0.0
- **路径**: E:\AIP
- **描述**: AI 训练/评估/模型发布全流程平台

## 技术栈
- pnpm monorepo (pnpm@9.15.0), Node.js >= 22
- 后端: Fastify + TypeScript
- 前端: React + Vite + Tailwind CSS
- 数据库: SQLite + better-sqlite3 + drizzle-orm
- 部署: PM2

## 架构 (5 层)
1. 展示层: 任务、数据集、训练、评估、模型、审批、设置
2. 控制层: 本地 API、任务/模板管理、审计、OpenClaw/Ollama 适配
3. 流程层: 模板引擎、步骤编排、重试、审批、回滚
4. 执行层: OpenClaw、Python Worker、Shell、文件系统
5. 资源层: SQLite、E 盘数据/模型/报表/备份目录

## Monorepo
```
apps/
  local-api/   ← Fastify 核心 API
  web-ui/      ← React 前端
  aip-cli/     ← CLI
packages/
  plugin-sdk, plugin-runtime, task-engine, template-engine, shared-types, storage, logger
```

## 启动方式
```
pnpm setup
pnpm dev           # 同时启动 API + Web
pnpm dev:api       # 只启动 API
pnpm dev:web       # 只启动 Web
```
API 默认端口 8787，数据库: apps/local-api/packages/db/agi_factory.db

## Vision Pipeline 六阶段
detect(yolo) → handoff(sam) → segment(sam) → verify(classifier) → track(tracker) → rules(rule_engine)

## 常用文档
- docs/01_系统分层.md ~ 05_前期准备清单.md
- docs/versions/ — 版本文档
- docs/v5.0.0_*, v5.1.0_*, v5.2.0_* — 功能锁定文档

## 当前用户环境
- Windows 11, i5-9400F, RTX 3060 12GB, 32GB 内存
- C 盘 ~5GB 可用，E 盘 ~53GB 可用
- 本地模型文件已移至 D 盘
