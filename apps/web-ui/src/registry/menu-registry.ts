// Menu Registry — shadow data file
// Mirrors current Layout.tsx sidebar menu structure.
// NOT referenced by Layout.tsx — shadow mode only.

export type MenuMaturity = 'stable' | 'preview' | 'lab' | 'external' | 'archived';
export type MenuRiskLevel = 'low' | 'medium' | 'high';
export type MenuPageType =
  | 'core'
  | 'governance'
  | 'training'
  | 'model'
  | 'data'
  | 'workflow'
  | 'connector'
  | 'lab'
  | 'placeholder'
  | 'system';

export interface MenuRegistryItem {
  id: string;
  label: string;
  labelKey?: string;
  path: string;
  icon?: string;
  maturity: MenuMaturity;
  riskLevel: MenuRiskLevel;
  pageType: MenuPageType;
  owner?: string;
  notes?: string;
  currentNav: true;
}

export interface MenuRegistrySection {
  id: string;
  label: string;
  labelKey?: string;
  collapsedByDefault?: boolean;
  items: MenuRegistryItem[];
}

export const MENU_REGISTRY: MenuRegistrySection[] = [
  // ── 概览 / Overview ──
  {
    id: 'overview',
    label: '概览',
    labelKey: 'nav.overview',
    items: [
      {
        id: 'dashboard',
        label: '仪表板',
        labelKey: 'nav.dashboard',
        path: '/',
        icon: 'dashboard',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'core',
        notes: 'AIP 主驾驶舱',
        currentNav: true,
      },
      {
        id: 'factory-status',
        label: '工厂状态',
        labelKey: 'nav.factoryStatus',
        path: '/factory-status',
        icon: 'factory',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'core',
        notes: '工厂级状态面板',
        currentNav: true,
      },
      {
        id: 'assistant-center',
        label: '助手中心',
        labelKey: 'nav.assistantCenter',
        path: '/assistant-center',
        icon: 'modules',
        maturity: 'preview',
        riskLevel: 'low',
        pageType: 'core',
        notes: 'P1d 已接入 PageShell',
        currentNav: true,
      },
    ],
  },

  // ── 数据与训练 / Data & Training ──
  {
    id: 'data-and-training',
    label: '数据与训练',
    labelKey: 'nav.dataAndTraining',
    items: [
      {
        id: 'datasets',
        label: '数据集',
        labelKey: 'nav.datasets',
        path: '/datasets',
        icon: 'dataset',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'data',
        notes: '',
        currentNav: true,
      },
      {
        id: 'training',
        label: '训练中心',
        labelKey: 'nav.trainingCenter',
        path: '/training',
        icon: 'training',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'training',
        notes: '可能触发训练任务',
        currentNav: true,
      },
      {
        id: 'runs',
        label: '运行中心',
        labelKey: 'nav.runCenter',
        path: '/runs',
        icon: 'run',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'training',
        notes: '任务运行记录',
        currentNav: true,
      },
      {
        id: 'templates',
        label: '模板中心',
        labelKey: 'nav.templates',
        path: '/templates',
        icon: 'template',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'data',
        notes: '',
        currentNav: true,
      },
    ],
  },

  // ── 模型与发布 / Model & Release ──
  {
    id: 'model-and-release',
    label: '模型与发布',
    labelKey: 'nav.modelAndRelease',
    items: [
      {
        id: 'models',
        label: '模型管理',
        labelKey: 'nav.modelMgmt',
        path: '/models',
        icon: 'artifact',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'model',
        notes: '',
        currentNav: true,
      },
      {
        id: 'artifacts',
        label: '模型产物',
        labelKey: 'nav.artifacts',
        path: '/artifacts',
        icon: 'artifact',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'model',
        notes: '',
        currentNav: true,
      },
      {
        id: 'evaluations',
        label: '评估中心',
        labelKey: 'nav.evalCenter',
        path: '/evaluations',
        icon: 'eval',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'model',
        notes: '',
        currentNav: true,
      },
      {
        id: 'deployments',
        label: '部署中心',
        labelKey: 'nav.deployCenter',
        path: '/deployments',
        icon: 'deploy',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'model',
        notes: '可触发部署动作',
        currentNav: true,
      },
    ],
  },

  // ── 流程与编排 / Workflow & Orchestration ──
  {
    id: 'workflow-and-composer',
    label: '流程与编排',
    labelKey: 'nav.workflowAndComposer',
    items: [
      {
        id: 'workflow-jobs',
        label: '工作流',
        labelKey: 'nav.workflow',
        path: '/workflow-jobs',
        icon: 'workflow',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'workflow',
        notes: '',
        currentNav: true,
      },
      {
        id: 'workflow-composer',
        label: '工作流编排器',
        labelKey: 'nav.workflowComposer',
        path: '/workflow-composer',
        icon: 'composer',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'workflow',
        notes: '最复杂页面，2400 行',
        currentNav: true,
      },
      {
        id: 'workflow-canvas',
        label: '流程运行画布',
        labelKey: 'nav.workflowCanvas',
        path: '/workflow-canvas',
        icon: 'workflow',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'workflow',
        notes: '',
        currentNav: true,
      },
    ],
  },

  // ── 能力与模块 / Capabilities & Modules ──
  {
    id: 'capabilities',
    label: '能力与模块',
    labelKey: 'nav.capabilities',
    items: [
      {
        id: 'module-center',
        label: '模块中心',
        labelKey: 'nav.moduleCenter',
        path: '/module-center',
        icon: 'modules',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'core',
        notes: '',
        currentNav: true,
      },
      {
        id: 'plugin-pool',
        label: '插件池',
        labelKey: 'nav.pluginPool',
        path: '/plugin-pool',
        icon: 'api',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'core',
        notes: '',
        currentNav: true,
      },
      {
        id: 'tasks',
        label: '任务编排',
        labelKey: 'nav.taskOrchestration',
        path: '/tasks',
        icon: 'tasks',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'core',
        notes: '可创建和执行任务',
        currentNav: true,
      },
      {
        id: 'cost-routing',
        label: '成本路由',
        labelKey: 'nav.costRouting',
        path: '/cost-routing',
        icon: 'route',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'governance',
        notes: 'P1a 已接入 PageShell。建议移至 governance 分组',
        currentNav: true,
      },
      {
        id: 'openaxiom-readonly',
        label: 'OpenAxiom 只读检查',
        labelKey: 'nav.openAxiomReadonly',
        path: '/openaxiom-readonly',
        icon: 'label',
        maturity: 'external',
        riskLevel: 'low',
        pageType: 'connector',
        notes: 'P1b 已接入 PageShell。外部工具只读页，建议移至 connector 分组',
        currentNav: true,
      },
      {
        id: 'memory-hub-readonly',
        label: 'Memory Hub 只读查看',
        labelKey: 'nav.memoryHubReadonly',
        path: '/memory-hub',
        icon: 'label',
        maturity: 'external',
        riskLevel: 'low',
        pageType: 'connector',
        notes: 'P1b 已接入 PageShell。外部工具只读页，建议移至 connector 分组',
        currentNav: true,
      },
    ],
  },

  // ── 智能增强 / Intelligence ──
  {
    id: 'intelligence',
    label: '智能增强',
    labelKey: 'nav.intelligence',
    collapsedByDefault: true,
    items: [
      {
        id: 'digital-employee',
        label: '数字员工',
        labelKey: 'nav.digitalEmployee',
        path: '/digital-employee',
        icon: 'brain',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'training-v2',
        label: '训练中心 v2',
        labelKey: 'nav.trainingV2',
        path: '/training-v2',
        icon: 'training',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页。v7.14 候选升级',
        currentNav: true,
      },
      {
        id: 'hpo',
        label: '超参搜索',
        labelKey: 'nav.hpo',
        path: '/hpo',
        icon: 'run',
        maturity: 'lab',
        riskLevel: 'low',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'distill',
        label: '知识蒸馏',
        labelKey: 'nav.distill',
        path: '/distill',
        icon: 'eval',
        maturity: 'lab',
        riskLevel: 'low',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'model-merge',
        label: '模型合并',
        labelKey: 'nav.modelMerge',
        path: '/model-merge',
        icon: 'merge',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'inference',
        label: '模型推理',
        labelKey: 'nav.inference',
        path: '/inference',
        icon: 'run',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'annotation',
        label: '数据标注',
        labelKey: 'nav.annotation',
        path: '/annotation',
        icon: 'label',
        maturity: 'lab',
        riskLevel: 'low',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'huggingface',
        label: 'HuggingFace',
        labelKey: 'nav.huggingface',
        path: '/huggingface',
        icon: 'api',
        maturity: 'lab',
        riskLevel: 'low',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
    ],
  },

  // ── 自动化 / Automation ──
  {
    id: 'automation',
    label: '自动化',
    labelKey: 'nav.automation',
    collapsedByDefault: true,
    items: [
      {
        id: 'backflow-v2',
        label: '智能回流',
        labelKey: 'nav.backflowV2',
        path: '/backflow-v2',
        icon: 'feedback',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'scheduler',
        label: '任务调度器',
        labelKey: 'nav.scheduler',
        path: '/scheduler',
        icon: 'clock',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'alerting',
        label: '告警中心',
        labelKey: 'nav.alerting',
        path: '/alerting',
        icon: 'bell',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'model-monitor',
        label: '模型监控',
        labelKey: 'nav.modelMonitor',
        path: '/model-monitor',
        icon: 'eval',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页',
        currentNav: true,
      },
      {
        id: 'deploy-v2',
        label: '发布管道',
        labelKey: 'nav.deployV2',
        path: '/deploy-v2',
        icon: 'deploy',
        maturity: 'lab',
        riskLevel: 'high',
        pageType: 'placeholder',
        notes: 'ModulePage 占位页。发布操作风险高',
        currentNav: true,
      },
    ],
  },

  // ── 视觉实验室 / Vision Lab ──
  {
    id: 'vision-lab',
    label: '视觉实验室',
    labelKey: 'nav.visionLab',
    items: [
      {
        id: 'mahjong-debug',
        label: '麻将视觉调试台',
        labelKey: 'nav.mahjongDebug',
        path: '/vision-lab/mahjong-debug',
        icon: 'template',
        maturity: 'lab',
        riskLevel: 'medium',
        pageType: 'lab',
        notes: '调试工具页',
        currentNav: true,
      },
    ],
  },

  // ── 治理与回流 / Governance & Feedback ──
  {
    id: 'governance',
    label: '治理与回流',
    labelKey: 'nav.governance',
    collapsedByDefault: true,
    items: [
      {
        id: 'approvals',
        label: '审批',
        labelKey: 'nav.approvals',
        path: '/approvals',
        icon: 'approval',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'governance',
        notes: '审批操作',
        currentNav: true,
      },
      {
        id: 'governance-hub',
        label: '治理中枢',
        labelKey: 'nav.governanceHub',
        path: '/governance-hub',
        icon: 'audit',
        maturity: 'stable',
        riskLevel: 'medium',
        pageType: 'governance',
        notes: '',
        currentNav: true,
      },
      {
        id: 'audit',
        label: '审计',
        labelKey: 'nav.audit',
        path: '/audit',
        icon: 'audit',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'governance',
        notes: '',
        currentNav: true,
      },
      {
        id: 'feedback',
        label: '回流池',
        labelKey: 'nav.feedback',
        path: '/feedback',
        icon: 'feedback',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'governance',
        notes: '',
        currentNav: true,
      },
    ],
  },

  // ── 知识 / Knowledge ──
  {
    id: 'knowledge',
    label: '知识',
    labelKey: 'nav.knowledge',
    collapsedByDefault: true,
    items: [
      {
        id: 'knowledge-center',
        label: '知识中心',
        labelKey: 'nav.knowledgeCenter',
        path: '/knowledge',
        icon: 'knowledge',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'core',
        notes: '',
        currentNav: true,
      },
    ],
  },

  // ── 输出 / Output ──
  {
    id: 'output',
    label: '输出',
    labelKey: 'nav.output',
    collapsedByDefault: true,
    items: [
      {
        id: 'standard-output',
        label: '标准输出',
        labelKey: 'nav.standardOutput',
        path: '/outputs',
        icon: 'output',
        maturity: 'stable',
        riskLevel: 'low',
        pageType: 'core',
        notes: '',
        currentNav: true,
      },
    ],
  },
];

export function getMenuRegistryItemCount(): number {
  return MENU_REGISTRY.reduce((sum, section) => sum + section.items.length, 0);
}

export function getMenuRegistrySectionCount(): number {
  return MENU_REGISTRY.length;
}
