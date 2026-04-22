# AGI Model Factory 工程师启动包（E盘版）

## 1. 本包用途
本包用于帮助工程师快速启动 AGI Model Factory / AGI 模型工厂的一期开发。

当前默认约定：
- 项目根目录使用 `E:\AGI_Factory\`
- 一期优先本地 Web 控制台，不先做桌面壳
- 一期数据库使用 SQLite
- 环境拆为 `platform`、`worker`、`train` 三层
- OpenClaw 作为执行层，平台负责调度、审计、版本治理和任务编排

## 2. 推荐目录
推荐在 E 盘创建如下目录：

```text
E:\AGI_Factory\
├─ repo\
├─ data\
├─ models\
├─ runs\
├─ reports\
├─ backups\
└─ audit\
```

## 3. 推荐技术栈
- 前端：React + Vite + TypeScript
- 后端：Node.js + TypeScript + Fastify
- Worker：Python
- 数据库：SQLite
- 通讯：REST + WebSocket
- 执行层：OpenClaw

## 4. 一期目标
最小闭环：
1. 新建任务
2. 选择模板
3. 调用 OpenClaw 执行步骤
4. 触发训练脚本
5. 生成评估结果
6. 归档模型和日志

## 5. 启动顺序
1. 先执行 `scripts/init-e-drive.ps1`
2. 再执行 `scripts/check-env.ps1`
3. 工程师按 `docs/01_系统分层.md` 和 `docs/02_一期范围.md` 建项目
4. 数据库先按 `packages/db/schema.sql` 初始化
5. 再接前端、后端和 Python Worker

## 6. 本包包含
- 目录初始化脚本
- 环境检查脚本
- `.env.example`
- monorepo 基础清单
- API 草案
- 数据库草案
- Worker 依赖清单
- 一期范围说明

## 7. 备注
这是“工程师启动包”，不是完整成品工程。它的作用是让工程师快速开工，并确保目录、接口、表结构和边界统一。
