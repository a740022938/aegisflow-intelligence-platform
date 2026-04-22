# Workflow Composer Dry-Run P0 设计文档

## 概述

本模块为 Workflow Composer 的 dry-run 提交验证流程，让画布从"能设计"升级为"能验证提交"。

## 核心设计

### 提交流程

```
前端 → POST /api/workflow-templates/dry-run
  body: { payload, execution_mode: 'dry-run' }
    ↓
后端 handler:
  1. 强制校验 execution_mode === 'dry-run'
  2. 遍历 steps → 检查 STEP_EXECUTORS + mock 执行
  3. 返回结构化结果（不写 DB，不创建 Job）
    ↓
前端 → 显示 Dry-Run 结果面板
```

### 安全边界设计

1. **端点级强制**: 只接受 `execution_mode: 'dry-run'`，非此值返回 `REAL_RUN_NOT_ALLOWED`
2. **无 DB 写入**: handler 不调用任何 db.prepare/insert/update
3. **无 Job 创建**: 不调用 `createWorkflowJob`
4. **Mock 执行**: 50ms delay 模拟，返回固定 mock 数据
5. **冻结节点**: frozen 节点依然标记为 blocked

### 步骤状态映射

| step status | 含义 | UI 颜色 |
|------------|------|---------|
| `success` | executor 存在，mock 执行成功 | 绿色 |
| `mock` | executor 不存在，mock 降级 | 紫色 |
| `blocked` | 需要审批，暂停 | 黄色 |
| `failed` | mock 执行失败 | 红色 |

### 错误码

| code | 含义 |
|------|------|
| `REAL_RUN_NOT_ALLOWED` | 端点只接受 dry-run |
| `EMPTY_STEPS` | 无步骤 |
| `UNKNOWN_STEP_KEY` | step_key 未在 STEP_EXECUTORS 注册 |
| `APPROVAL_REQUIRED` | 步骤需要审批 |
| `EMPTY_PARAMS` | 步骤参数为空 |
| `STEP_DRYRUN_FAILED` | mock 执行失败 |
| `NETWORK_ERROR` | 前端网络错误 |

## 未完成项

1. **真实 executor dry-run 模式** — 让 STEP_EXECUTORS 支持 `_dry_run` 参数
2. **参数 schema 校验** — 深度校验 params 是否符合 input_schema
3. **执行时间估算** — 根据历史数据估算真实执行时间
4. **结果持久化** — dry-run 结果保存到 DB（可选）

## 扩展路径

### 下一步：真实 executor dry-run 模式
- 修改 STEP_EXECUTORS 支持 `_dry_run: true` 参数
- executor 检查 _dry_run 后只做参数校验，不执行真实逻辑
- 返回更精确的 dry-run 结果（参数缺失、依赖问题等）
