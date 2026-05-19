// Runtime Readonly Status API Registry — static readonly contract model
// Does not execute API calls, modify state, write to databases, or control external tools.

export type RuntimeReadonlyEndpointMethod = 'GET' | 'POST';

export type RuntimeReadonlyEndpointStatus =
  | 'contract_only'
  | 'not_implemented'
  | 'blocked'
  | 'future_stage_c';

export type RuntimeReadonlyEndpointCategory =
  | 'status'
  | 'readiness'
  | 'registry_summary'
  | 'risk_summary'
  | 'gate_summary'
  | 'audit_preview'
  | 'evidence_schema'
  | 'rollback_readiness'
  | 'dry_run_preview'
  | 'approval_request'
  | 'execution'
  | 'rollback';

export type RuntimeReadonlyRisk = 'low' | 'medium' | 'high' | 'critical';

export interface RuntimeReadonlyStatusApiEndpoint {
  id: string;
  label: string;
  method: RuntimeReadonlyEndpointMethod;
  path: string;
  category: RuntimeReadonlyEndpointCategory;
  status: RuntimeReadonlyEndpointStatus;
  risk: RuntimeReadonlyRisk;
  currentAllowed: boolean;
  readonly: boolean;
  mutatesState: boolean;
  writesDb: boolean;
  controlsExternalTool: boolean;
  requiresHumanApproval: boolean;
  requiresStageC: boolean;
  requiresEvidence: boolean;
  requiresRollback: boolean;
  implementationStatus: 'contract_only' | 'not_implemented';
  requestSchema: string;
  responseSchema: string;
  mockResponseShape: string[];
  forbiddenFields: string[];
  gates: string[];
  blockedActions: string[];
  linkedDocs: string[];
  reason: string;
  nextAction: string;
}

export const RUNTIME_READONLY_STATUS_API_ENDPOINTS: RuntimeReadonlyStatusApiEndpoint[] = [
  {
    id: 'runtime-status-get',
    label: 'Runtime Status',
    method: 'GET',
    path: '/runtime/status',
    category: 'status',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'RuntimeStatus',
    mockResponseShape: ['runtimeStatus', 'overallHealth', 'implementationStatus', 'currentAllowed', 'stageCEnabled', 'dbWriteEnabled', 'externalControlEnabled', 'lastUpdated'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['execute_runtime', 'write_db', 'control_external_tool', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md', 'AIP_RUNTIME_READONLY_STATUS_API_DESIGN.md'],
    reason: 'GET /runtime/status — contract_only. Defined in contract freeze v1.freeze. No backend endpoint implemented.',
    nextAction: 'Maintain contract_only. Do not implement without human approval and Stage C review.',
  },
  {
    id: 'runtime-readiness-get',
    label: 'Runtime Readiness',
    method: 'GET',
    path: '/runtime/readiness',
    category: 'readiness',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'RuntimeReadiness',
    mockResponseShape: ['overallReadiness', 'gateReadiness', 'capabilityReadiness', 'stageCRequired', 'stageCEnabled'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['execute_runtime', 'write_db', 'control_external_tool', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md', 'AIP_RUNTIME_READONLY_STATUS_API_DESIGN.md'],
    reason: 'GET /runtime/readiness — contract_only. Defined in contract freeze v1.freeze. No backend endpoint implemented.',
    nextAction: 'Maintain contract_only. Do not implement without human approval and Stage C review.',
  },
  {
    id: 'runtime-registries-get',
    label: 'Runtime Registries',
    method: 'GET',
    path: '/runtime/registries',
    category: 'registry_summary',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'RuntimeRegistryList',
    mockResponseShape: ['items', 'validation'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['execute_runtime', 'write_db', 'control_external_tool', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md'],
    reason: 'GET /runtime/registries — contract_only. Registry summary from contract freeze.',
    nextAction: 'Maintain contract_only.',
  },
  {
    id: 'runtime-risks-get',
    label: 'Runtime Risks',
    method: 'GET',
    path: '/runtime/risks',
    category: 'risk_summary',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'RiskSummary',
    mockResponseShape: ['riskId', 'level', 'category', 'status', 'blockedBy', 'requiresStageC'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['execute_runtime', 'write_db', 'control_external_tool', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md'],
    reason: 'GET /runtime/risks — contract_only. Risk summary from contract freeze.',
    nextAction: 'Maintain contract_only.',
  },
  {
    id: 'runtime-gates-get',
    label: 'Runtime Gates',
    method: 'GET',
    path: '/runtime/gates',
    category: 'gate_summary',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'GateSummary',
    mockResponseShape: ['gateId', 'status', 'currentState', 'blockingReason', 'requiresHumanAction', 'stageCRelated'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['execute_runtime', 'write_db', 'control_external_tool', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_GATE_AND_PERMISSION_MODEL.md'],
    reason: 'GET /runtime/gates — contract_only. Gate summary from contract freeze.',
    nextAction: 'Maintain contract_only.',
  },
  {
    id: 'runtime-audit-preview-get',
    label: 'Runtime Audit Preview',
    method: 'GET',
    path: '/runtime/audit-preview',
    category: 'audit_preview',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'AuditPreviewSummary',
    mockResponseShape: ['auditId', 'source', 'eventType', 'risk', 'writeNow'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['write_audit', 'execute_runtime', 'write_db', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md'],
    reason: 'GET /runtime/audit-preview — contract_only. Audit preview from contract freeze.',
    nextAction: 'Maintain contract_only.',
  },
  {
    id: 'runtime-evidence-schema-get',
    label: 'Runtime Evidence Schema',
    method: 'GET',
    path: '/runtime/evidence-schema',
    category: 'evidence_schema',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'EvidenceSchemaSummary',
    mockResponseShape: ['evidenceId', 'evidenceType', 'required', 'sensitive', 'storageImplemented'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['capture_evidence', 'store_secret', 'write_db', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md'],
    reason: 'GET /runtime/evidence-schema — contract_only. Evidence schema from contract freeze.',
    nextAction: 'Maintain contract_only.',
  },
  {
    id: 'runtime-rollback-readiness-get',
    label: 'Runtime Rollback Readiness',
    method: 'GET',
    path: '/runtime/rollback-readiness',
    category: 'rollback_readiness',
    status: 'contract_only',
    risk: 'low',
    currentAllowed: true,
    readonly: true,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: false,
    requiresStageC: false,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'contract_only',
    requestSchema: 'None',
    responseSchema: 'RollbackReadinessSummary',
    mockResponseShape: ['rollbackId', 'reversible', 'estimatedImpact', 'executorImplemented', 'gitMutationRequired'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'no_backend_endpoint', 'no_api_call', 'no_db_write', 'no_external_control', 'stage_c_disabled'],
    blockedActions: ['execute_rollback', 'restore_file', 'git_mutation', 'write_db', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md'],
    reason: 'GET /runtime/rollback-readiness — contract_only. Rollback readiness from contract freeze.',
    nextAction: 'Maintain contract_only.',
  },
  {
    id: 'runtime-dry-run-preview-post',
    label: 'Dry-run Plan Preview',
    method: 'POST',
    path: '/runtime/dry-run/preview',
    category: 'dry_run_preview',
    status: 'not_implemented',
    risk: 'high',
    currentAllowed: false,
    readonly: false,
    mutatesState: false,
    writesDb: false,
    controlsExternalTool: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresEvidence: false,
    requiresRollback: false,
    implementationStatus: 'not_implemented',
    requestSchema: 'DryRunPreviewRequest',
    responseSchema: 'DryRunPreviewResponse',
    mockResponseShape: ['error', 'code', 'message', 'httpStatus', 'details'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'stage_c_required', 'human_approval_required', 'no_backend_endpoint'],
    blockedActions: ['execute_dry_run', 'call_external_api', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md', 'AIP_RUNTIME_API_MOCK_EXAMPLES.md'],
    reason: 'POST /runtime/dry-run/preview — not_implemented. Requires Stage C + human approval. Blocked by contract freeze.',
    nextAction: 'Keep not_implemented. Do not implement without Stage C activation.',
  },
  {
    id: 'runtime-approval-request-post',
    label: 'Approval Request',
    method: 'POST',
    path: '/runtime/approval/request',
    category: 'approval_request',
    status: 'not_implemented',
    risk: 'high',
    currentAllowed: false,
    readonly: false,
    mutatesState: true,
    writesDb: true,
    controlsExternalTool: false,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresEvidence: true,
    requiresRollback: true,
    implementationStatus: 'not_implemented',
    requestSchema: 'ApprovalRequest',
    responseSchema: 'ApprovalRequestResponse',
    mockResponseShape: ['error', 'code', 'message', 'httpStatus', 'details'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'stage_c_required', 'human_approval_required', 'db_write_required', 'evidence_required', 'rollback_required'],
    blockedActions: ['approve', 'reject', 'process_candidate', 'write_db', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md', 'AIP_RUNTIME_API_MOCK_EXAMPLES.md'],
    reason: 'POST /runtime/approval/request — not_implemented. Requires DB write, Stage C, human approval queue, evidence store, rollback executor. All blocked.',
    nextAction: 'Keep not_implemented. Do not implement without Stage C activation and full implementation pack.',
  },
  {
    id: 'runtime-execute-post',
    label: 'Runtime Execute',
    method: 'POST',
    path: '/runtime/execute',
    category: 'execution',
    status: 'not_implemented',
    risk: 'critical',
    currentAllowed: false,
    readonly: false,
    mutatesState: true,
    writesDb: true,
    controlsExternalTool: true,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresEvidence: true,
    requiresRollback: true,
    implementationStatus: 'not_implemented',
    requestSchema: 'ExecuteRequest',
    responseSchema: 'ExecuteResponse',
    mockResponseShape: ['error', 'code', 'message', 'httpStatus', 'details'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'stage_c_required', 'human_approval_required', 'db_write_required', 'external_control_required', 'evidence_required', 'rollback_required'],
    blockedActions: ['execute_runtime', 'control_external_tool', 'write_db', 'enable_stage_c', 'approve', 'reject'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md', 'AIP_RUNTIME_API_MOCK_EXAMPLES.md'],
    reason: 'POST /runtime/execute — not_implemented. Requires Stage C, runtime evaluator, permission function, external control authorization, DB write, evidence store, rollback executor. All blocked.',
    nextAction: 'Keep not_implemented. Do not implement without Stage C activation and full implementation pack.',
  },
  {
    id: 'runtime-rollback-post',
    label: 'Runtime Rollback',
    method: 'POST',
    path: '/runtime/rollback',
    category: 'rollback',
    status: 'not_implemented',
    risk: 'critical',
    currentAllowed: false,
    readonly: false,
    mutatesState: true,
    writesDb: true,
    controlsExternalTool: true,
    requiresHumanApproval: true,
    requiresStageC: true,
    requiresEvidence: true,
    requiresRollback: true,
    implementationStatus: 'not_implemented',
    requestSchema: 'RollbackRequest',
    responseSchema: 'RollbackResponse',
    mockResponseShape: ['error', 'code', 'message', 'httpStatus', 'details'],
    forbiddenFields: ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'],
    gates: ['readonly_only', 'stage_c_required', 'human_approval_required', 'db_write_required', 'external_control_required', 'evidence_required', 'rollback_required'],
    blockedActions: ['execute_rollback', 'restore_file', 'git_mutation', 'write_db', 'enable_stage_c'],
    linkedDocs: ['AIP_RUNTIME_API_CONTRACT_FREEZE.md', 'AIP_RUNTIME_API_MOCK_EXAMPLES.md'],
    reason: 'POST /runtime/rollback — not_implemented. Requires Stage C, rollback executor, git protection policy, DB write, evidence store. All blocked.',
    nextAction: 'Keep not_implemented. Do not implement without Stage C activation and full implementation pack.',
  },
];

export function getRuntimeReadonlyStatusApiEndpoints(): RuntimeReadonlyStatusApiEndpoint[] {
  return RUNTIME_READONLY_STATUS_API_ENDPOINTS;
}

export function getRuntimeReadonlyStatusApiSummary(): {
  total: number;
  getEndpoints: number;
  postEndpoints: number;
  contractOnly: number;
  notImplemented: number;
  currentAllowed: number;
  blocked: number;
  highOrCritical: number;
  writesDb: number;
  controlsExternalTool: number;
  requiresStageC: number;
  requiresHumanApproval: number;
} {
  const all = RUNTIME_READONLY_STATUS_API_ENDPOINTS;
  return {
    total: all.length,
    getEndpoints: all.filter(e => e.method === 'GET').length,
    postEndpoints: all.filter(e => e.method === 'POST').length,
    contractOnly: all.filter(e => e.implementationStatus === 'contract_only').length,
    notImplemented: all.filter(e => e.implementationStatus === 'not_implemented').length,
    currentAllowed: all.filter(e => e.currentAllowed).length,
    blocked: all.filter(e => !e.currentAllowed).length,
    highOrCritical: all.filter(e => e.risk === 'high' || e.risk === 'critical').length,
    writesDb: all.filter(e => e.writesDb).length,
    controlsExternalTool: all.filter(e => e.controlsExternalTool).length,
    requiresStageC: all.filter(e => e.requiresStageC).length,
    requiresHumanApproval: all.filter(e => e.requiresHumanApproval).length,
  };
}

export function getRuntimeReadonlyEndpointsByMethod(method: RuntimeReadonlyEndpointMethod): RuntimeReadonlyStatusApiEndpoint[] {
  return RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.method === method);
}

export function getRuntimeReadonlyEndpointsByCategory(category: RuntimeReadonlyEndpointCategory): RuntimeReadonlyStatusApiEndpoint[] {
  return RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.category === category);
}

export function getRuntimeReadonlyEndpointsByStatus(status: RuntimeReadonlyEndpointStatus): RuntimeReadonlyStatusApiEndpoint[] {
  return RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.status === status);
}

export function getRuntimeReadonlyBlockedEndpoints(): RuntimeReadonlyStatusApiEndpoint[] {
  return RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => !e.currentAllowed);
}

export function getRuntimeReadonlyPostActionEndpoints(): RuntimeReadonlyStatusApiEndpoint[] {
  return RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.method === 'POST');
}

export function getRuntimeReadonlyStatusApiValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const all = RUNTIME_READONLY_STATUS_API_ENDPOINTS;
  const requiredForbiddenFields = ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'];
  let blocking = 0;
  let warning = 0;
  let info = 0;

  for (const endpoint of all) {
    if (endpoint.method === 'GET' && (endpoint.mutatesState || endpoint.writesDb || endpoint.controlsExternalTool)) blocking++;
    if (endpoint.implementationStatus === 'not_implemented' && endpoint.currentAllowed) blocking++;
    if (endpoint.requiresStageC && endpoint.currentAllowed) blocking++;
    if (endpoint.writesDb && endpoint.currentAllowed) blocking++;
    if (endpoint.controlsExternalTool && endpoint.currentAllowed) blocking++;
    if (endpoint.risk === 'critical' && endpoint.currentAllowed) blocking++;
    for (const field of requiredForbiddenFields) {
      if (!endpoint.forbiddenFields.includes(field)) { blocking++; break; }
    }
    if (!endpoint.requestSchema || !endpoint.responseSchema) warning++;
    if (endpoint.gates.length === 0) warning++;
    if (!endpoint.reason || !endpoint.nextAction) warning++;
  }

  return { blocking, warning, info, pass: blocking === 0 };
}
