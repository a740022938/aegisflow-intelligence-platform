# AIP Connector Permission Gate Model (v7.27.0-D1)

> 设计文档，非实现。定义门禁类型与 Permission Evaluator 的关系。v7.27.0-P1 Runtime Registry Preview 实现了 gate 模型的只读展示。

## 1. Gate 类型

### readonly_gate
- 输入: 用户身份、目标连接器、L0/L1 请求
- 输出: allow / deny
- 行为: 检查是否只读模式下允许的静态查看
- 当前: 始终 allow (readonly 模式)

### dry_run_gate
- 输入: 用户身份、dry-run 计划、连接器权限
- 输出: allow / deny / require_human_approval
- 行为: 检查 Permission Evaluator 建议 + 连接器状态
- 当前: 设计阶段，未实现

### human_approval_gate
- 输入: 审批人身份、动作详情、audit log
- 输出: approved / rejected
- 行为: 在 Governance Center 中展示审批请求
- 当前: 未实现 (Governance Center hold_review)

### audit_log_gate
- 输入: 动作结果、日志格式
- 输出: logged / failed
- 行为: 确保每次执行都记录审计日志
- 当前: CostRouting 有基础模拟日志

### rollback_gate
- 输入: 动作 ID、回滚策略
- 输出: rolled_back / failed
- 行为: 执行回滚计划
- 当前: 设计阶段

### stage_c_gate
- 输入: Stage C 状态、runtime evaluator 状态
- 输出: allow / deny
- 行为: 检查 Stage C 是否启用
- 当前: 始终 deny (Stage C disabled)

## 2. Gate 输入/输出/失败行为

| Gate | 输入 | 成功输出 | 失败行为 |
|------|------|---------|---------|
| readonly_gate | user, connector, action | allow | deny + log |
| dry_run_gate | user, plan, permissions | allow / require_human | deny + reason |
| human_approval_gate | approver, action, audit | approved | rejected + log |
| audit_log_gate | action_result | logged | blocking error |
| rollback_gate | action_id, strategy | rolled_back | manual intervention |
| stage_c_gate | stage_c_status | allow | deny (permanently) |

## 3. P1 Runtime Registry Gate Integration

v7.27.0-P1 Runtime Registry Preview 包含 5 个 gate 类型的只读展示：

| Gate 类型 | Runtime Registry items | 状态 |
|-----------|----------------------|------|
| readonly_only | 所有 L0 items | 已启用 |
| human_approval_required | L4+ items | 已定义但不执行 |
| audit_log_required | high/critical items | 已定义但不执行 |
| rollback_plan_required | L5/L6 items | 已定义但不执行 |
| stage_c_disabled | requiresStageC items | 永久禁用 |

所有 gate 在 runtime registry 中仅作为元数据展示，不执行真实门禁逻辑。

## 4. Gate 与 Permission Evaluator 的关系

```
Permission Evaluator (当前)
    │
    ├── 只读评估规则建议
    ├── 不执行 gate
    ├── 不改变权限
    └── 仅供预览
            │
            ▼
Gate Model (设计阶段)
    │
    ├── 读取 Permission Evaluator 建议
    ├── 执行门禁检查
    ├── 返回 allow/deny
    └── 记录审计日志
```

**关键原则：** Permission Evaluator 只建议，不执行 gate。Gate 是独立的执行层。

## 4. Gate 与 Governance Center 的关系

- Governance Center 是 gate 状态的管理 UI
- Human approval gate 的审批在 Governance Center 中展示
- Governance Center 显示所有 gate 的状态
- 当前 Governance Center hold_review，不执行真实 gate

## 5. Gate 与 Stage C 的关系

| Gate | Stage C 依赖 | 当前状态 |
|------|-------------|---------|
| readonly_gate | 否 | 通过 |
| dry_run_gate | 否 | 设计阶段 |
| human_approval_gate | 否 | 设计阶段 |
| audit_log_gate | 是 (持久化需要 DB) | 设计阶段 |
| rollback_gate | 是 | 设计阶段 |
| stage_c_gate | 自身 | 始终 deny |

## 6. v7.27 Final Seal Status

**v7.27.0 Final Seal: READY** (commit `8f8242a`)
- Gate model validated against Permission Evaluator Registry
- All gates correctly reflect design-only status
- No gate implementation added

## 7. v7.28 Governance Blueprint Reference

v7.28.0-D1 defines new gate relationships in `AIP_RUNTIME_GOVERNANCE_STATE_MACHINE.md` and `AIP_RUNTIME_API_CONTRACT_SPEC.md`. These remain design-only. No gate is implemented, executed, or enforced in v7.28.|
