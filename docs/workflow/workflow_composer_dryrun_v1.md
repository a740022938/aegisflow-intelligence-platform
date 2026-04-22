# Workflow Composer Dry-Run 精准化 v1 设计文档

## 概述

本模块在 Dry-Run P0 基础上，将 dry-run 从"mock 结果"升级为"真实前置校验 + 结构化阻断原因"。

## 架构设计

```
用户点击 [▶ Dry-Run]
  → handleDryRunSubmit()
  → POST /api/workflow-templates/dry-run
  → 后端: for each step:
      checker = STEP_DRYRUN_CHECKERS[step_key]
      checkResult = await checker(params)   ← 真实前置校验
      stepResults.push({ ..., checkedItems: checkResult.checkedItems })
  → 返回: ok/summary/stepResults(errors/warnings/metadata)
  → 前端: 面板展示 checkedItems（每步校验项明细）
```

## 核心组件

### 1. STEP_DRYRUN_CHECKERS

独立于 `STEP_EXECUTORS` 的检查层，每个 step_key 对应一个 `async (input) => DryRunCheckResult`。

```typescript
interface DryRunCheckItem {
  code: string;       // MISSING_PARAM | RESOURCE_NOT_FOUND | STEP_FROZEN | PARAM_OK | RESOURCE_OK | ...
  item: string;        // experiment_id | dataset | frozen_gate | ...
  status: 'ok' | 'warning' | 'error';
  message: string;     // 人类可读描述
}
```

每步返回：
```typescript
{ status: 'ok' | 'blocked' | 'warning' | 'error', checkedItems: DryRunCheckItem[], blockedReason?: string, mockResult?: string }
```

### 2. 校验项类型

| code | 含义 |
|------|------|
| MISSING_PARAM | 必填参数缺失 |
| PARAM_OK | 参数存在 |
| RESOURCE_NOT_FOUND | 引用的 DB 资源不存在 |
| RESOURCE_OK | DB 资源存在 |
| STEP_FROZEN | 步骤被冻结门禁阻断 |
| FROZEN_GATE | 冻结门禁未触发（ENABLE_LEGACY_YOLO=true）|
| STEP_STATUS | 步骤状态不正确（如 segmentation 未 completed）|
| APPROVAL_REQUIRED | 需要审批 |
| NO_CHECKER | 无对应 checker（warning 降级）|
| CHECK_SKIPPED | 检查跳过 |

### 3. 安全边界

与 P0 相同：
- 只接受 `execution_mode === 'dry-run'`
- 无 DB 写入
- 无 Job 创建
- 无真实 executor 调用

## 未完成项

1. build_package、publish_package 等步骤无对应 checker
2. Plugin 执行层尚未接入 dry-run
3. 参数深度 schema 校验（input_schema 对比）

## 扩展路径

**为剩余步骤添加 CHECKERS** → 完成后全部步骤均支持前置校验
**Plugin 层 dry-run** → 利用 PluginManager 暴露的 checkPluginExecutionGate()
**参数 schema 深度校验** → 对比 input_schema 与实际 params
