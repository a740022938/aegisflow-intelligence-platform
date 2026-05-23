// Layout menu snapshot — mirrors Layout.tsx sidebar NavItem structure
// Used ONLY for parity checking against MENU_REGISTRY.
// NOT used for rendering. Layout.tsx remains the source of truth.

export interface LayoutSectionSnapshot {
  sectionId: string;
  sectionLabelKey: string;
  sectionComment?: string;
  collapsedByDefault?: boolean;
  items: LayoutItemSnapshot[];
}

export interface LayoutItemSnapshot {
  path: string;
  icon: string;
  labelKey: string;
}

const SNAPSHOT: LayoutSectionSnapshot[] = [
  {
    sectionId: 'overview',
    sectionLabelKey: 'nav.overview',
    items: [
      { path: '/', icon: 'dashboard', labelKey: 'nav.dashboard' },
      { path: '/factory-status', icon: 'factory', labelKey: 'nav.factoryStatus' },
      { path: '/assistant-center', icon: 'modules', labelKey: 'nav.assistantCenter' },
    ],
  },
  {
    sectionId: 'openaip-v8',
    sectionLabelKey: 'nav.openAipV8',
    items: [
      { path: '/openaip-v8-command-center-preview', icon: 'route', labelKey: 'nav.openAipV8CommandCenter' },
      { path: '/openaip-v8-agent-center-preview', icon: 'route', labelKey: 'nav.openAipV8AgentCenter' },
      { path: '/openaip-v8-task-center-preview', icon: 'route', labelKey: 'nav.openAipV8TaskCenter' },
      { path: '/openaip-v8-audit-center-preview', icon: 'route', labelKey: 'nav.openAipV8AuditCenter' },
      { path: '/openaip-v8-policy-capability-center-preview', icon: 'route', labelKey: 'nav.openAipV8PolicyCapabilityCenter' },
      { path: '/openaip-v8-execution-gateway-preview', icon: 'route', labelKey: 'nav.openAipV8ExecutionGateway' },
      { path: '/openaip-v8-provider-manager-preview', icon: 'route', labelKey: 'nav.openAipV8ProviderManager' },
      { path: '/openaip-v8-integration-center-preview', icon: 'route', labelKey: 'nav.openAipV8IntegrationCenter' },
      { path: '/openaip-v8-local-apps-center-preview', icon: 'route', labelKey: 'nav.openAipV8LocalAppsCenter' },
      { path: '/openaip-v8-memory-knowledge-center-preview', icon: 'route', labelKey: 'nav.openAipV8MemoryKnowledgeCenter' },
    ],
  },
  {
    sectionId: 'data-and-training',
    sectionLabelKey: 'nav.dataAndTraining',
    items: [
      { path: '/datasets', icon: 'dataset', labelKey: 'nav.datasets' },
      { path: '/training', icon: 'training', labelKey: 'nav.trainingCenter' },
      { path: '/runs', icon: 'run', labelKey: 'nav.runCenter' },
      { path: '/templates', icon: 'template', labelKey: 'nav.templates' },
    ],
  },
  {
    sectionId: 'model-and-release',
    sectionLabelKey: 'nav.modelAndRelease',
    items: [
      { path: '/models', icon: 'artifact', labelKey: 'nav.modelMgmt' },
      { path: '/artifacts', icon: 'artifact', labelKey: 'nav.artifacts' },
      { path: '/evaluations', icon: 'eval', labelKey: 'nav.evalCenter' },
      { path: '/deployments', icon: 'deploy', labelKey: 'nav.deployCenter' },
    ],
  },
  {
    sectionId: 'workflow-and-composer',
    sectionLabelKey: 'nav.workflowAndComposer',
    items: [
      { path: '/workflow-jobs', icon: 'workflow', labelKey: 'nav.workflow' },
      { path: '/workflow-composer', icon: 'composer', labelKey: 'nav.workflowComposer' },
      { path: '/workflow-canvas', icon: 'workflow', labelKey: 'nav.workflowCanvas' },
    ],
  },
  {
    sectionId: 'capabilities',
    sectionLabelKey: 'nav.capabilities',
    items: [
      { path: '/module-center', icon: 'modules', labelKey: 'nav.moduleCenter' },
      { path: '/plugin-pool', icon: 'api', labelKey: 'nav.pluginPool' },
      { path: '/tasks', icon: 'tasks', labelKey: 'nav.taskOrchestration' },
      { path: '/cost-routing', icon: 'route', labelKey: 'nav.costRouting' },
      { path: '/openaxiom-readonly', icon: 'label', labelKey: 'nav.openAxiomReadonly' },
      { path: '/memory-hub', icon: 'label', labelKey: 'nav.memoryHubReadonly' },
      { path: '/connector-center-readonly', icon: 'route', labelKey: 'nav.connectorCenterReadonly' },
    ],
  },
  {
    sectionId: 'intelligence',
    sectionLabelKey: 'nav.intelligence',
    collapsedByDefault: true,
    items: [
      { path: '/digital-employee', icon: 'brain', labelKey: 'nav.digitalEmployee' },
      { path: '/training-v2', icon: 'training', labelKey: 'nav.trainingV2' },
      { path: '/hpo', icon: 'run', labelKey: 'nav.hpo' },
      { path: '/distill', icon: 'eval', labelKey: 'nav.distill' },
      { path: '/model-merge', icon: 'merge', labelKey: 'nav.modelMerge' },
      { path: '/inference', icon: 'run', labelKey: 'nav.inference' },
      { path: '/annotation', icon: 'label', labelKey: 'nav.annotation' },
      { path: '/huggingface', icon: 'api', labelKey: 'nav.huggingface' },
    ],
  },
  {
    sectionId: 'automation',
    sectionLabelKey: 'nav.automation',
    collapsedByDefault: true,
    items: [
      { path: '/backflow-v2', icon: 'feedback', labelKey: 'nav.backflowV2' },
      { path: '/scheduler', icon: 'clock', labelKey: 'nav.scheduler' },
      { path: '/alerting', icon: 'bell', labelKey: 'nav.alerting' },
      { path: '/model-monitor', icon: 'eval', labelKey: 'nav.modelMonitor' },
      { path: '/deploy-v2', icon: 'deploy', labelKey: 'nav.deployV2' },
    ],
  },
  {
    sectionId: 'vision-lab',
    sectionLabelKey: 'nav.visionLab',
    items: [
      { path: '/vision-lab/mahjong-debug', icon: 'template', labelKey: 'nav.mahjongDebug' },
    ],
  },
  {
    sectionId: 'governance',
    sectionLabelKey: 'nav.governance',
    collapsedByDefault: true,
    sectionComment: 'Layout.tsx line 343 comment incorrectly says "自动化"',
    items: [
      { path: '/approvals', icon: 'approval', labelKey: 'nav.approvals' },
      { path: '/governance-hub', icon: 'audit', labelKey: 'nav.governanceHub' },
      { path: '/audit', icon: 'audit', labelKey: 'nav.audit' },
      { path: '/feedback', icon: 'feedback', labelKey: 'nav.feedback' },
      { path: '/advanced-mode-readonly', icon: 'audit', labelKey: 'nav.advancedModeReadonly' },
    ],
  },
  {
    sectionId: 'knowledge',
    sectionLabelKey: 'nav.knowledge',
    collapsedByDefault: true,
    items: [
      { path: '/knowledge', icon: 'knowledge', labelKey: 'nav.knowledgeCenter' },
    ],
  },
  {
    sectionId: 'output',
    sectionLabelKey: 'nav.output',
    collapsedByDefault: true,
    items: [
      { path: '/outputs', icon: 'output', labelKey: 'nav.standardOutput' },
    ],
  },
];

export function getLayoutSnapshotSectionCount(): number {
  return SNAPSHOT.length;
}

export function getLayoutSnapshotItemCount(): number {
  return SNAPSHOT.reduce((sum, s) => sum + s.items.length, 0);
}

export function getLayoutSnapshotPaths(): string[] {
  return SNAPSHOT.flatMap(s => s.items.map(i => i.path));
}

export function getLayoutSnapshotLabelKeys(): string[] {
  return SNAPSHOT.flatMap(s => s.items.map(i => i.labelKey));
}

export default SNAPSHOT;
