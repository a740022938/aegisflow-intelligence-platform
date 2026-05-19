// Dry-run Plan Registry — static readonly model for connector dry-run plans
// Does not execute dry-runs, call APIs, write to databases, or control external tools.

export type DryRunPlanTarget =
  | 'openclaw'
  | 'comfyui'
  | 'openaxiom'
  | 'huggingface'
  | 'memory_hub'
  | 'cc_switch'
  | 'claude_proxy'
  | 'git'
  | 'database'
  | 'stage_c';

export type DryRunPlanStatus =
  | 'preview_ready'
  | 'design_only'
  | 'blocked'
  | 'future_stage_c';

export type DryRunPlanRisk = 'low' | 'medium' | 'high' | 'critical';

export type DryRunPlanMode =
  | 'static_preview'
  | 'synthetic_plan'
  | 'external_dry_run_required'
  | 'human_approval_required'
  | 'forbidden';

export interface DryRunPlanItem {
  id: string;
  label: string;
  target: DryRunPlanTarget;
  mode: DryRunPlanMode;
  status: DryRunPlanStatus;
  risk: DryRunPlanRisk;
  allowedNow: boolean;
  requiresRuntime: boolean;
  requiresExternalSystem: boolean;
  requiresHumanApproval: boolean;
  requiresStageC: boolean;
  requiresAuditLog: boolean;
  requiresRollbackPlan: boolean;
  planSteps: string[];
  previewInputs: string[];
  expectedOutputs: string[];
  blockedActions: string[];
  gates: string[];
  evidence: string[];
  reason: string;
  nextAction: string;
}

export const DRY_RUN_PLANS: DryRunPlanItem[] = [
  {
    id: 'openclaw-task-package-preview',
    label: 'OpenClaw — 任务包生成预览',
    target: 'openclaw',
    mode: 'synthetic_plan',
    status: 'preview_ready',
    risk: 'low',
    allowedNow: true,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    planSteps: ['选择连接器', '生成任务包 JSON', '预览任务包结构', '验证任务包格式'],
    previewInputs: ['连接器 ID', '任务类型', '参数模板'],
    expectedOutputs: ['task_package.json 预览', '结构验证报告'],
    blockedActions: ['submit_to_connector', 'execute_task', 'modify_connector_state'],
    gates: ['readonly_only'],
    evidence: ['design_spec', 'static_preview_data'],
    reason: 'Task package generation in synthetic mode. No real submission to OpenClaw. Allowed as readonly preview.',
    nextAction: 'Keep synthetic-only. No real task submission.',
  },
  {
    id: 'openclaw-status-dry-run-plan',
    label: 'OpenClaw — 状态查询 Dry-Run',
    target: 'openclaw',
    mode: 'static_preview',
    status: 'preview_ready',
    risk: 'low',
    allowedNow: true,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    planSteps: ['选择连接器', '查询连接器状态', '返回状态信息'],
    previewInputs: ['连接器 ID'],
    expectedOutputs: ['连接器状态 JSON', '健康检查报告'],
    blockedActions: ['modify_connector_state', 'control_connector'],
    gates: ['readonly_only', 'no_external_control'],
    evidence: ['design_spec'],
    reason: 'Connector status query plan. Uses static preview data only. No real connection or control.',
    nextAction: 'Maintain static preview.',
  },
  {
    id: 'openclaw-execution-dry-run-blocked',
    label: 'OpenClaw — 执行 Dry-Run (已拦截)',
    target: 'openclaw',
    mode: 'forbidden',
    status: 'blocked',
    risk: 'high',
    allowedNow: false,
    requiresRuntime: true,
    requiresExternalSystem: true,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: [],
    previewInputs: [],
    expectedOutputs: [],
    blockedActions: ['execute', 'control', 'write_back', 'modify_remote'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Real execution dry-run blocked. Requires Stage C, runtime evaluator, human approval, and rollback plan.',
    nextAction: 'Keep blocked. Do not allow execution dry-run.',
  },
  {
    id: 'comfyui-workflow-read-plan',
    label: 'ComfyUI — 工作流读取预览',
    target: 'comfyui',
    mode: 'static_preview',
    status: 'preview_ready',
    risk: 'low',
    allowedNow: true,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    planSteps: ['选择工作流', '解析节点结构', '展示工作流概览'],
    previewInputs: ['工作流 ID'],
    expectedOutputs: ['节点拓扑图', '节点参数预览'],
    blockedActions: ['run_workflow', 'modify_nodes', 'connect_inputs'],
    gates: ['readonly_only', 'no_external_control'],
    evidence: ['design_spec', 'static_preview_data'],
    reason: 'Workflow static preview plan. No real workflow execution or node modification.',
    nextAction: 'Maintain readonly preview.',
  },
  {
    id: 'comfyui-workflow-dry-run-plan',
    label: 'ComfyUI — 工作流 Dry-Run 计划',
    target: 'comfyui',
    mode: 'external_dry_run_required',
    status: 'design_only',
    risk: 'medium',
    allowedNow: false,
    requiresRuntime: true,
    requiresExternalSystem: true,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: false,
    planSteps: ['选择工作流', '生成 dry-run 请求', '发送到 ComfyUI 实例', '收集模拟结果'],
    previewInputs: ['工作流 ID', '输入参数', 'Dry-run 配置'],
    expectedOutputs: ['模拟执行结果', '节点输出预览', '警告和错误列表'],
    blockedActions: ['run_real_workflow', 'save_results', 'modify_environment'],
    gates: ['readonly_only', 'audit_log_required', 'no_external_control'],
    evidence: ['design_spec'],
    reason: 'Workflow dry-run requires external ComfyUI instance. Currently design-only. No real dry-run executed.',
    nextAction: 'Design dry-run interface. Do not connect to real ComfyUI instance.',
  },
  {
    id: 'comfyui-workflow-execute-blocked',
    label: 'ComfyUI — 工作流执行 (已拦截)',
    target: 'comfyui',
    mode: 'forbidden',
    status: 'blocked',
    risk: 'high',
    allowedNow: false,
    requiresRuntime: true,
    requiresExternalSystem: true,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: [],
    previewInputs: [],
    expectedOutputs: [],
    blockedActions: ['execute', 'control', 'write_outputs', 'modify_environment'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Workflow execution blocked. Requires Stage C, human approval, audit trail, and rollback plan.',
    nextAction: 'Keep blocked. No real workflow execution.',
  },
  {
    id: 'openaxiom-label-write-dry-run-plan',
    label: 'OpenAxiom — 标签写入 Dry-Run',
    target: 'openaxiom',
    mode: 'human_approval_required',
    status: 'design_only',
    risk: 'high',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: ['选择标签', '填写标签内容', '审查标签变更', '生成 dry-run 报告'],
    previewInputs: ['标签 ID', '标签内容', '覆盖选项'],
    expectedOutputs: ['标签写入预览', '变更差异报告', '影响分析'],
    blockedActions: ['write_labels', 'modify_tool_state', 'overwrite_data'],
    gates: ['human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['design_spec'],
    reason: 'Label write dry-run is design-only. Requires human approval, audit log, and rollback plan. Not currently executable.',
    nextAction: 'Design label write dry-run interface. No real label mutation.',
  },
  {
    id: 'huggingface-model-card-preview',
    label: 'Hugging Face — 模型卡片预览',
    target: 'huggingface',
    mode: 'static_preview',
    status: 'design_only',
    risk: 'low',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresAuditLog: false,
    requiresRollbackPlan: false,
    planSteps: ['选择模型', '读取模型卡片', '展示元数据'],
    previewInputs: ['模型 ID'],
    expectedOutputs: ['模型卡片预览', '元数据摘要'],
    blockedActions: ['download_model', 'upload_model', 'modify_repo'],
    gates: ['readonly_only', 'no_external_api_call'],
    evidence: ['design_spec'],
    reason: 'Hugging Face model card preview is design-only. No real API calls. No model download or upload.',
    nextAction: 'Design static preview data. Do not call Hugging Face API.',
  },
  {
    id: 'huggingface-upload-blocked',
    label: 'Hugging Face — 上传 (已拦截)',
    target: 'huggingface',
    mode: 'forbidden',
    status: 'blocked',
    risk: 'critical',
    allowedNow: false,
    requiresRuntime: true,
    requiresExternalSystem: true,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: [],
    previewInputs: [],
    expectedOutputs: [],
    blockedActions: ['upload_model', 'modify_repo', 'publish_release'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Model upload to Hugging Face is an external write with high impact. Permanently blocked in v7.x.',
    nextAction: 'Keep denied. Do not allow upload.',
  },
  {
    id: 'memory-hub-candidate-review-plan',
    label: 'Memory Hub — Candidate 审查计划',
    target: 'memory_hub',
    mode: 'human_approval_required',
    status: 'design_only',
    risk: 'high',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: ['查看 candidate 列表', '查看 candidate 详情', '生成审查报告', '建议 approve/reject'],
    previewInputs: ['candidate ID', '相关元数据'],
    expectedOutputs: ['candidate 审查报告', '风险评分', '建议操作'],
    blockedActions: ['approve', 'reject', 'archive', 'sync', 'write_database'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['design_spec'],
    reason: 'Candidate review plan is design-only. Requires Stage C, human approval, audit log. No real candidate processing.',
    nextAction: 'Keep design-only. Do not enable candidate processing.',
  },
  {
    id: 'cc-switch-config-change-plan',
    label: 'CC Switch — 配置变更 Dry-Run 计划',
    target: 'cc_switch',
    mode: 'human_approval_required',
    status: 'design_only',
    risk: 'high',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: ['查看当前配置', '预览配置变更', '生成变更差异', '审查变更影响'],
    previewInputs: ['当前配置 ID', '新配置参数'],
    expectedOutputs: ['配置差异报告', '影响分析', '切换风险评估'],
    blockedActions: ['write_config', 'modify_routing', 'control_switch'],
    gates: ['human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['design_spec'],
    reason: 'CC Switch config change dry-run plan is design-only. Requires human approval, audit log, and rollback plan.',
    nextAction: 'Design config change preview. No real switch control.',
  },
  {
    id: 'claude-proxy-config-change-plan',
    label: 'Claude Proxy — 配置变更 Dry-Run 计划',
    target: 'claude_proxy',
    mode: 'human_approval_required',
    status: 'design_only',
    risk: 'high',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: ['查看当前代理配置', '预览端点切换', '生成切换计划', '审查切换影响'],
    previewInputs: ['当前端点', '目标端点', '切换参数'],
    expectedOutputs: ['切换计划', '影响分析', '风险评估'],
    blockedActions: ['write_config', 'switch_endpoint', 'control_proxy'],
    gates: ['human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['design_spec'],
    reason: 'Claude Proxy config change dry-run plan is design-only. Requires human approval, audit log, and rollback plan.',
    nextAction: 'Design config change preview. No real proxy control.',
  },
  {
    id: 'git-commit-push-plan',
    label: 'Git — Commit & Push 计划',
    target: 'git',
    mode: 'human_approval_required',
    status: 'design_only',
    risk: 'medium',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: true,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: false,
    planSteps: ['选择变更文件', '生成 commit 消息', '预览变更差异', '审查提交计划'],
    previewInputs: ['变更文件列表', 'commit 消息模板'],
    expectedOutputs: ['commit 差异预览', 'commit 消息', '影响文件列表'],
    blockedActions: ['force_push', 'modify_remote', 'delete_branch'],
    gates: ['human_approval_required', 'audit_log_required', 'preview_only'],
    evidence: ['design_spec'],
    reason: 'Git commit plan is design-only. Standard git workflow is used separately. Runtime registry does not implement git operations.',
    nextAction: 'Keep design-only. No git operations in runtime registry.',
  },
  {
    id: 'git-tag-release-blocked',
    label: 'Git — Tag & Release (已拦截)',
    target: 'git',
    mode: 'forbidden',
    status: 'blocked',
    risk: 'critical',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: true,
    requiresHumanApproval: true,
    requiresStageC: false,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: [],
    previewInputs: [],
    expectedOutputs: [],
    blockedActions: ['create_tag', 'publish_release', 'delete_tag', 'modify_release'],
    gates: ['human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Git tag and release creation is blocked. Tags and releases require explicit human approval.',
    nextAction: 'Keep denied. Do not create tags or releases.',
  },
  {
    id: 'db-write-blocked',
    label: '数据库 — 写入 (已拦截)',
    target: 'database',
    mode: 'forbidden',
    status: 'blocked',
    risk: 'critical',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: true,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: [],
    previewInputs: [],
    expectedOutputs: [],
    blockedActions: ['write', 'update', 'delete', 'alter_schema', 'migrate'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Database write is permanently denied. Dry-run plan registry does not write to any database.',
    nextAction: 'Keep denied. Do not allow DB writes.',
  },
  {
    id: 'stage-c-transition-blocked',
    label: 'Stage C — 状态转换 (已拦截)',
    target: 'stage_c',
    mode: 'forbidden',
    status: 'blocked',
    risk: 'critical',
    allowedNow: false,
    requiresRuntime: false,
    requiresExternalSystem: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresAuditLog: true,
    requiresRollbackPlan: true,
    planSteps: [],
    previewInputs: [],
    expectedOutputs: [],
    blockedActions: ['enable_stage_c', 'activate_stage_c', 'modify_stage_c_state'],
    gates: ['stage_c_disabled', 'human_approval_required', 'audit_log_required', 'rollback_plan_required'],
    evidence: ['manual_policy'],
    reason: 'Stage C is permanently disabled. No transition to Stage C is allowed.',
    nextAction: 'Keep denied. Do not enable Stage C.',
  },
];

export function getDryRunPlanCount(): number {
  return DRY_RUN_PLANS.length;
}

export function getDryRunPlansByTarget(target: DryRunPlanTarget): DryRunPlanItem[] {
  return DRY_RUN_PLANS.filter(p => p.target === target);
}

export function getDryRunPlansByMode(mode: DryRunPlanMode): DryRunPlanItem[] {
  return DRY_RUN_PLANS.filter(p => p.mode === mode);
}

export function getDryRunPlansByRisk(risk: DryRunPlanRisk): DryRunPlanItem[] {
  return DRY_RUN_PLANS.filter(p => p.risk === risk);
}

export function getDryRunPlanAllowedNowItems(): DryRunPlanItem[] {
  return DRY_RUN_PLANS.filter(p => p.allowedNow);
}

export function getDryRunPlanBlockedItems(): DryRunPlanItem[] {
  return DRY_RUN_PLANS.filter(p => p.status === 'blocked');
}

export function getDryRunPlanSummary(): {
  total: number;
  allowedNow: number;
  blocked: number;
  highOrCritical: number;
  requiresRuntime: number;
  requiresExternalSystem: number;
  requiresHumanApproval: number;
  requiresStageC: number;
} {
  return {
    total: DRY_RUN_PLANS.length,
    allowedNow: DRY_RUN_PLANS.filter(p => p.allowedNow).length,
    blocked: DRY_RUN_PLANS.filter(p => p.status === 'blocked').length,
    highOrCritical: DRY_RUN_PLANS.filter(p => p.risk === 'high' || p.risk === 'critical').length,
    requiresRuntime: DRY_RUN_PLANS.filter(p => p.requiresRuntime).length,
    requiresExternalSystem: DRY_RUN_PLANS.filter(p => p.requiresExternalSystem).length,
    requiresHumanApproval: DRY_RUN_PLANS.filter(p => p.requiresHumanApproval).length,
    requiresStageC: DRY_RUN_PLANS.filter(p => p.requiresStageC).length,
  };
}

export function getDryRunPlanModeSummary(): Record<DryRunPlanMode, number> {
  return {
    static_preview: DRY_RUN_PLANS.filter(p => p.mode === 'static_preview').length,
    synthetic_plan: DRY_RUN_PLANS.filter(p => p.mode === 'synthetic_plan').length,
    external_dry_run_required: DRY_RUN_PLANS.filter(p => p.mode === 'external_dry_run_required').length,
    human_approval_required: DRY_RUN_PLANS.filter(p => p.mode === 'human_approval_required').length,
    forbidden: DRY_RUN_PLANS.filter(p => p.mode === 'forbidden').length,
  };
}
