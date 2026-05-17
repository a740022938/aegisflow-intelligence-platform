// Connector registry — static definitions for Connector Center
// NOT used for external system control. Readonly metadata only.

export type ConnectorStatus = 'online' | 'warning' | 'offline' | 'unknown' | 'disabled' | 'not_configured';
export type ConnectorRiskLevel = 'low' | 'medium' | 'high';
export type ConnectorMaturity = 'stable' | 'preview' | 'lab' | 'external';
export type ConnectorCategory = 'data-label' | 'knowledge' | 'gateway' | 'media-gen' | 'devops' | 'proxy' | 'core' | 'model-hub';
export type SafetyBoundaryTag = 'readonly' | 'dry_run' | 'approval_required' | 'external_write_blocked' | 'dangerous_action_blocked';

export interface ConnectorHealthSignal {
  label: string;
  value: string | number | boolean | null;
  status?: 'ok' | 'warn' | 'err' | 'unknown';
}

export interface ConnectorActionPolicy {
  allowedActions: string[];
  forbiddenActions: string[];
}

export interface ConnectorMigrationPlan {
  stage: number;
  targetSidebarSection?: string;
  estimatedMilestone?: string;
}

export interface ConnectorDefinition {
  id: string;
  displayName: string;
  description: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  maturity: ConnectorMaturity;
  riskLevel: ConnectorRiskLevel;
  safetyBoundaryTags: SafetyBoundaryTag[];
  defaultMode: string;
  currentEntry: string;
  targetEntry: string;
  actionPolicy: ConnectorActionPolicy;
  dataSource: string;
  healthSignals: ConnectorHealthSignal[];
  migrationPlan: ConnectorMigrationPlan;
  notes: string;
}

export const CONNECTOR_REGISTRY: ConnectorDefinition[] = [
  {
    id: 'openaxiom',
    displayName: 'OpenAxiom',
    description: 'OpenAxiom 项目只读检查与标签健康诊断。不修改 label / images / data.yaml，不保存/恢复/批量保存。',
    category: 'data-label',
    status: 'online',
    maturity: 'external',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'external_write_blocked', 'approval_required'],
    defaultMode: 'read_only',
    currentEntry: '/openaxiom-readonly',
    targetEntry: 'Connector Center',
    actionPolicy: {
      allowedActions: ['project-scan', 'label-health-check', 'yolo-dry-run', 'diagnostic-summary', 'governance-suggestions'],
      forbiddenActions: ['save-labels', 'restore-labels', 'batch-save', 'overwrite-data-yaml', 'modify-E-Axiom'],
    },
    dataSource: '/api/cost-routing/openaxiom-status-preview + /api/openaxiom/*',
    healthSignals: [
      { label: 'lastScanAt', value: '—', status: 'unknown' },
      { label: 'configured', value: true, status: 'ok' },
      { label: 'cliExists', value: true, status: 'ok' },
    ],
    migrationPlan: { stage: 0, targetSidebarSection: '连接器', estimatedMilestone: 'v7.14.0-P2' },
    notes: '已有独立页面 OpenAxiomReadonly（P1b PageShell 接入）。初期保留原入口。',
  },
  {
    id: 'memory-hub',
    displayName: 'Memory Hub',
    description: 'Memory Hub 只读查看：导出、Bootstrap、Profiles、Manifest 与候选状态。不写入 sqlite，不处理 candidate。',
    category: 'knowledge',
    status: 'online',
    maturity: 'external',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'external_write_blocked', 'approval_required'],
    defaultMode: 'read_only',
    currentEntry: '/memory-hub',
    targetEntry: 'Connector Center',
    actionPolicy: {
      allowedActions: ['status-check', 'stats-view', 'profile-view', 'manifest-view', 'candidate-list', 'candidate-detail', 'candidate-dry-run'],
      forbiddenActions: ['approve-candidate', 'reject-candidate', 'archive-candidate', 'write-sqlite', 'sync-lan-share', 'memory-import'],
    },
    dataSource: '/api/memory-hub/*',
    healthSignals: [
      { label: 'configured', value: true, status: 'ok' },
      { label: 'exportsExist', value: true, status: 'ok' },
      { label: 'manifestExist', value: true, status: 'ok' },
    ],
    migrationPlan: { stage: 0, targetSidebarSection: '连接器', estimatedMilestone: 'v7.14.0-P2' },
    notes: '已有独立页面 MemoryHubReadonly（P1b PageShell 接入）。candidate dry-run 是只读模拟。',
  },
  {
    id: 'openclaw',
    displayName: 'OpenClaw Gateway',
    description: 'OpenClaw 外部助手/网关。当前稳定版本 2026.3.23 需保护。只读观察 gateway status / health / version。',
    category: 'gateway',
    status: 'online',
    maturity: 'stable',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'dry_run', 'dangerous_action_blocked', 'approval_required'],
    defaultMode: 'read_only',
    currentEntry: 'CostRouting (External Readonly Governance tab)',
    targetEntry: 'Connector Center',
    actionPolicy: {
      allowedActions: ['status-preview', 'health-check', 'version-check'],
      forbiddenActions: ['start-openclaw', 'stop-openclaw', 'restart-openclaw', 'upgrade-version', 'modify-config', 'taskkill-openclaw', 'modify-dot-openclaw'],
    },
    dataSource: '/api/cost-routing/openclaw-status-preview',
    healthSignals: [
      { label: 'onlineStatus', value: '—', status: 'unknown' },
      { label: 'circuitState', value: '—', status: 'unknown' },
      { label: 'version', value: '2026.3.23', status: 'ok' },
    ],
    migrationPlan: { stage: 0, targetSidebarSection: '连接器', estimatedMilestone: 'v7.14.0-P3+' },
    notes: '当前嵌入在 CostRouting 页面。禁止展示升级/覆盖/启停按钮。',
  },
  {
    id: 'comfyui',
    displayName: 'ComfyUI',
    description: 'ComfyUI 只读状态检测。端口 127.0.0.1:8000。展示 queue / system_stats，不执行生成。',
    category: 'media-gen',
    status: 'unknown',
    maturity: 'stable',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'dry_run', 'dangerous_action_blocked', 'approval_required'],
    defaultMode: 'read_only',
    currentEntry: 'CostRouting (External Readonly Governance tab)',
    targetEntry: 'Connector Center',
    actionPolicy: {
      allowedActions: ['status-preview', 'queue-check', 'system-stats-check'],
      forbiddenActions: ['launch-comfyui', 'submit-queue', 'generate-image', 'download-model', 'modify-workflow', 'clean-model-files'],
    },
    dataSource: '/api/cost-routing/comfyui-status-preview',
    healthSignals: [
      { label: 'healthy', value: null, status: 'unknown' },
      { label: 'queueLength', value: null, status: 'unknown' },
    ],
    migrationPlan: { stage: 0, targetSidebarSection: '连接器', estimatedMilestone: 'v7.14.0-P3+' },
    notes: '端口可能为 127.0.0.1:8000 而非默认 8188。禁止自动下载模型或运行大型生成。',
  },
  {
    id: 'github',
    displayName: 'GitHub Release',
    description: 'GitHub 发布准备度检查。只读展示 repo / branch / HEAD / release gate 状态。不执行发布。',
    category: 'devops',
    status: 'unknown',
    maturity: 'stable',
    riskLevel: 'high',
    safetyBoundaryTags: ['readonly', 'dry_run', 'dangerous_action_blocked', 'approval_required'],
    defaultMode: 'preview_only',
    currentEntry: 'CostRouting (Release Readiness Preview tab)',
    targetEntry: 'Connector Center',
    actionPolicy: {
      allowedActions: ['release-readiness-check', 'gate-status-view'],
      forbiddenActions: ['git-tag', 'git-push', 'create-release', 'force-push', 'modify-secrets', 'modify-repo-settings'],
    },
    dataSource: '/api/cost-routing/github-release-prep-preview',
    healthSignals: [
      { label: 'gateScore', value: null, status: 'unknown' },
    ],
    migrationPlan: { stage: 0, targetSidebarSection: '连接器', estimatedMilestone: 'v7.14.0-P3+' },
    notes: '高风险 connector。禁止任何发布按钮。CRITICAL：禁止自动 tag / Release。',
  },
  {
    id: 'claude-proxy',
    displayName: 'Claude / DeepSeek Proxy',
    description: '本地 Claude / DeepSeek 代理只读状态。端口 127.0.0.1:15721。展示 process / port / health probe。',
    category: 'proxy',
    status: 'unknown',
    maturity: 'preview',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly', 'approval_required', 'external_write_blocked'],
    defaultMode: 'read_only',
    currentEntry: 'AssistantCenter (status card)',
    targetEntry: 'Connector Center',
    actionPolicy: {
      allowedActions: ['status-check', 'health-probe'],
      forbiddenActions: ['modify-proxy-config', 'restart-proxy', 'expose-token', 'log-sensitive-data'],
    },
    dataSource: '/api/assistant-center/status',
    healthSignals: [
      { label: 'port', value: '15721', status: 'unknown' },
      { label: 'status', value: '—', status: 'unknown' },
    ],
    migrationPlan: { stage: 0, targetSidebarSection: '连接器', estimatedMilestone: 'v7.14.0-P3+' },
    notes: '只显示健康状态，不暴露认证 token 或 API key。',
  },
  {
    id: 'aip-local-api',
    displayName: 'AIP Local API',
    description: 'AIP 本地 API 健康状态。内部 connector，作为所有外部连接器健康基准。',
    category: 'core',
    status: 'online',
    maturity: 'stable',
    riskLevel: 'low',
    safetyBoundaryTags: ['readonly'],
    defaultMode: 'read_only',
    currentEntry: 'Dashboard + Layout health indicator',
    targetEntry: 'Connector Center (internal)',
    actionPolicy: {
      allowedActions: ['health-check', 'db-doctor-check', 'uptime-check'],
      forbiddenActions: ['migrate-database', 'clear-data', 'restart-service', 'modify-config'],
    },
    dataSource: '/api/health',
    healthSignals: [
      { label: 'status', value: 'ok', status: 'ok' },
      { label: 'version', value: '7.3.1', status: 'ok' },
      { label: 'uptime', value: '—', status: 'unknown' },
      { label: 'dbStatus', value: 'ok', status: 'ok' },
    ],
    migrationPlan: { stage: 1, estimatedMilestone: 'v7.14.0-P2' },
    notes: '内部 connector。如 AIP Local API 离线，所有外部 connector 检查可能不可靠。',
  },
  {
    id: 'future-connector',
    displayName: 'Future Connector',
    description: '未来外部连接器占位。新 connector 必须经过 spec 设计、安全边界定义、health signal 确认后才能接入。',
    category: 'gateway',
    status: 'not_configured',
    maturity: 'lab',
    riskLevel: 'medium',
    safetyBoundaryTags: ['readonly', 'approval_required', 'external_write_blocked', 'dangerous_action_blocked'],
    defaultMode: 'read_only',
    currentEntry: '—',
    targetEntry: 'Connector Center',
    actionPolicy: {
      allowedActions: [],
      forbiddenActions: ['all-execution', 'all-write', 'all-modify'],
    },
    dataSource: 'TBD',
    healthSignals: [],
    migrationPlan: { stage: 0, estimatedMilestone: 'TBD' },
    notes: '新 connector 接入标准：(1) 先只读 (2) 有 safetyBoundary (3) 有 forbiddenActions (4) 有 healthSignals (5) 先 spec 后施工',
  },
];

export function getConnectorStats() {
  const total = CONNECTOR_REGISTRY.length;
  const byStatus: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let readonlyCount = 0;
  let migrationPendingCount = 0;

  for (const c of CONNECTOR_REGISTRY) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byRisk[c.riskLevel] = (byRisk[c.riskLevel] || 0) + 1;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    if (c.safetyBoundaryTags.includes('readonly')) readonlyCount++;
    if (c.migrationPlan.stage < 3) migrationPendingCount++;
  }

  return { total, byStatus, byRisk, byCategory, readonlyCount, highRiskCount: byRisk['high'] || 0, migrationPendingCount };
}
