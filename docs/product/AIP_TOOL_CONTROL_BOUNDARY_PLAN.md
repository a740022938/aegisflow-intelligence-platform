# AIP Tool Control Boundary Plan (v7.27.0-D1)

> 设计文档，非实现。定义工具控制边界，不执行真实控制。

## 1. 工具控制红线

| 红线 | 当前状态 | 禁止原因 |
|------|---------|---------|
| 启用 Stage C | 永久禁止 | 政策锁定 |
| 控制外部工具 | 永久禁止 | 未授权 runtime |
| 写入外部系统 | 永久禁止 | 无网络控制 |
| 调用外部 API | 永久禁止 | 安全边界 |
| 读取 token/API key | 永久禁止 | 凭据安全 |

## 2. 只读能力定义 (L0-L2)

仅展示连接器元数据和状态，不发起任何外部请求。

| 能力 | 当前状态 | 风险 |
|------|---------|------|
| 查看连接器列表 | 已实现 | 低 |
| 查看连接器状态 | 已实现 | 低 |
| 查看元数据 | 已实现 | 低 |
| 生成 task package | ConnectorCenterReadonly 中 | 低 (不执行) |

## 3. Dry-run 能力定义 (L3)

模拟执行但不实际操作外部工具。

| 能力 | 当前状态 | 所需门禁 |
|------|---------|---------|
| 生成 dry-run 计划 | 设计阶段 | Permission Evaluator |
| 展示模拟结果 | 设计阶段 | Permission Evaluator |
| 记录 dry-run 审计 | 设计阶段 | Audit log gate |

## 4. Controlled Execution 能力定义 (L4)

需要 human approval 的真实执行。

| 能力 | 当前状态 | 所需门禁 |
|------|---------|---------|
| 执行经审批的操作 | 禁止 | Human approval + Stage C |
| 自动执行 | 禁止 | Stage C + runtime evaluator |

## 5. Human Approval 需求

所有 L4 以上操作需要 human approval：

- 审批人必须是列表中的用户
- 每次执行必须明确 approve/reject
- 审批记录必须写入 audit log
- 不可绕过

## 6. 禁止动作列表

| 动作 | 原因 | 解锁条件 |
|------|------|---------|
| OpenClaw 控制 | 外部工具安全 | Stage C + runtime |
| ComfyUI 工作流执行 | 外部工具安全 | Stage C + runtime |
| OpenAxiom label 写入 | 数据完整性 | Stage C + DB write |
| Hugging Face 上传 | 外部平台安全 | Stage C |
| CC Switch 配置写入 | 基础设施安全 | Stage C |
| Claude Proxy 写入 | 代理安全 | Stage C |
| Git commit/push | 仓库安全 | Human approval |
| DB 写入 | 数据安全 | Stage C |

## 7. 外部工具列表

| 工具 | 当前状态 | 未来状态 | 风险 | 备注 |
|------|---------|---------|------|------|
| OpenClaw | 只读查看 | dry-run + controlled | 高 | 生产环境工具 |
| ComfyUI | 只读查看 | dry-run + controlled | 高 | 工作流引擎 |
| OpenAxiom | 只读诊断 | read + dry-run | 中 | 标注平台 |
| Hugging Face | 只读查看 | read + upload | 中 | 模型仓库 |
| Hermes | 未接入 | 设计阶段 | 中 | 消息系统 |
| CC Switch | 只读配置 | read + controlled | 高 | 基础设施 |
| Claude Proxy | 只读配置 | read + controlled | 高 | AI 代理 |

## 8. v7.27 Final Seal Status

**v7.27.0 Final Seal: READY** (commit `8f8242a`)
- All tool control boundaries remain enforced
- Runtime Preview Trilogy (Registry/Dry-run/Audit) completed
- No tool control capability added — readonly only

## 9. v7.28 Governance Blueprint References

v7.28.0-D1 adds design-only governance docs that do not change any tool control boundary:
- `AIP_RUNTIME_API_CONTRACT_SPEC.md` — defines endpoint contracts (not implemented)
- `AIP_RUNTIME_GOVERNANCE_STATE_MACHINE.md` — defines state transitions (not executed)
- `AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md` — defines approval flow (not processed)

No new tool control capability, no external API calls, no token/API key handling.|
