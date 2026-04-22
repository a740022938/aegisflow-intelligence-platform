# 天枢智治平台（AegisFlow Intelligence Platform, AIP）

天枢智治平台（AIP）是面向数据-训练-评估-发布全流程的本地化智能治理平台。
当前仓库为**可运行社区版（Community Edition）**，用于公开演示与二次开发。

## 版本与定位

- 当前公开版本：`v6.8.0-community.1`
- 仓库定位：`可运行社区版`
- 目标：在去敏前提下保留核心主干能力（Workflow Composer / Governance Hub / 审计基础链路）

## 主要能力

- Workflow Composer：可视化编排、运行追踪、结果面板
- Governance Hub：治理中枢视图与运行态汇聚
- 训练与评估主干：数据集、训练、评估、归档、发布链路
- incident / playbook / audit 基础能力
- OpenClaw 协作适配层（需自行配置 token 与地址）

## 快速启动

### 1. 环境要求

- Node.js `>=22.0.0`
- pnpm `9.x`
- Git

### 2. 安装

```bash
git clone <your-public-repo-url>
cd AGI-Model-Factory
pnpm install
```

### 3. 配置

```bash
cp .env.example .env.local
```

按需修改 `.env.local`：

- `OPENCLAW_BASE_URL`
- `OPENCLAW_HEARTBEAT_TOKEN`
- `OPENCLAW_ADMIN_TOKEN`
- 端口与日志级别

> 公开仓库不包含真实 `.env` 与任何私有凭据。

### 4. 初始化与运行

```bash
pnpm run db:init
pnpm run dev
```

访问：

- Web UI: `http://127.0.0.1:5173`
- Local API: `http://127.0.0.1:8787`
- Health: `http://127.0.0.1:8787/api/health`

## 目录结构（公开版）

```text
AGI-Model-Factory/
├─ apps/
│  ├─ web-ui/
│  └─ local-api/
├─ packages/
├─ scripts/
├─ templates/
├─ docs/
│  ├─ architecture/
│  └─ public-release/
├─ .env.example
└─ README.md
```

## 边界说明

- 本仓库移除了私有封板材料、桌面验证产物、本地日志与快照导出。
- 若要启用完整 OpenClaw 协同能力，需自行部署并配置目标服务。
- 部分高级能力依赖本地模型、数据目录与插件环境，默认不随公开仓库提供。

## 文档入口

- 架构说明：`docs/architecture/ARCHITECTURE_OVERVIEW.md`
- 公开发布说明：`docs/public-release/PUBLIC_RELEASE_NOTES.md`
- 清洗与安全说明：`docs/public-release/SANITIZATION_AND_SECURITY.md`
- 保留/剥离清单：`docs/public-release/KEEP_EXCLUDE_MANIFEST.md`
- Phase F.0 官网同步清单：`docs/public-release/F0_WEBSITE_SYNC_CHECKLIST.md`
- Phase F.0 新用户上手闭环：`docs/public-release/F0_NEW_USER_ONBOARDING.md`
- Phase F.0 首发后巡检报告：`docs/public-release/F0_POST_LAUNCH_INSPECTION.md`
- 社区协作说明：`CONTRIBUTING.md`

## 架构概览

- 前端：`apps/web-ui`（Workflow Composer / Governance Hub / 运行结果消费）
- 后端：`apps/local-api`（工作流运行、治理接口、审计主干）
- 数据层：SQLite（默认路径 `packages/db/agi_factory.db`）
- 文档层：`docs/architecture` 与 `docs/public-release` 维护公开版边界与治理说明

## 后续路线（Community Edition）

- 持续增强 Workflow Composer 的稳定性与可观测性
- 补齐社区可复用模板与最小数据样例
- 完善插件适配层文档与安全实践示例
- 增加面向社区贡献者的开发/测试规范

## License

MIT
