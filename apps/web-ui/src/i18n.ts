// i18n.ts - 双语字典
export type Lang = 'zh' | 'en';

export const translations = {
  zh: {
    // 导航
    nav: {
      // ── 分组标题 ──
      openAip: 'OpenAIP',
      resources: '资源',
      workbench: '工作台',
      system: '系统',
      advancedTools: '高级工具',
      // ── 菜单项 ──
      dashboard: '仪表板',
      factoryStatus: '系统状态',
      datasets: '数据集',
      trainingCenter: '训练',
      runCenter: '运行',
      templates: '模板',
      modelMgmt: '模型',
      artifacts: '模型产物',
      evalCenter: '评估',
      deployCenter: '部署',
      workflow: '工作流',
      workflowComposer: '工作流编排器',
      workflowCanvas: '流程运行画布',
      moduleCenter: '模块中心',
      pluginPool: '插件',
      taskOrchestration: '任务编排',
      costRouting: '成本路由',
      approvals: '审批',
      governanceHub: '治理中枢',
      audit: '审计日志',
      feedback: '回流池',
      advancedModeReadonly: '高级模式预览',
      openAipV8CommandCenter: '指挥中心',
      openAipV8AgentCenter: '智能体',
      openAipV8TaskCenter: '任务',
      openAipV8ProviderManager: '供应商',
      openAipV8IntegrationCenter: '集成',
      openAipV8LocalAppsCenter: '本地应用',
      openAipV8MemoryKnowledgeCenter: '记忆与知识',
      openAipV8PolicyCapabilityCenter: '策略',
      openAipV8AuditCenter: '审计',
      openAipV8ExecutionGateway: '执行网关',
      connectorCenterReadonly: '连接器',
      knowledgeCenter: '知识中心',
      standardOutput: '标准输出',
      // ── 新模块 ──
      digitalEmployee: '数字员工',
      inference: '模型推理',
      trainingV2: '训练中心 v2',
      hpo: '超参搜索',
      distill: '知识蒸馏',
      modelMerge: '模型合并',
      backflowV2: '智能回流',
      scheduler: '任务调度',
      alerting: '告警中心',
      annotation: '数据标注',
      huggingface: 'HuggingFace',
      modelMonitor: '模型监控',
      deployV2: '发布管道',
      workspace: '工作空间',
      costTracker: '成本分析',
      storageV2: '对象存储',
      intentEngine: '意图引擎',
      systemStatus: '系统状态',
      apiDocs: 'API 文档',
      // ── 新增页导航 ──
      assistantCenter: '助手',
      openAxiomReadonly: 'OpenAxiom',
      memoryHubReadonly: 'Memory Hub',
      // ── 视觉实验室 ──
      mahjongDebug: '麻将工具',
    },
    // 通用
    common: {
      loading: '加载中...',
      home: '首页',
      about: '关于',
      systems: '系统',
      help: '帮助',
      wechat: '微信',
      langSwitch: 'EN',
      themeSwitch: '切换主题',
      apiStatusPending: '检测中…',
      apiStatusOk: 'API 正常',
      apiStatusBad: 'API 异常',
      empty: '暂无数据',
      error: '出错了',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      filter: '筛选',
      refresh: '刷新',
      close: '关闭',
      more: '更多',
      all: '全部',
      none: '无',
      yes: '是',
      no: '否',
      status: '状态',
      name: '名称',
      type: '类型',
      time: '时间',
      action: '操作',
      detail: '详情',
      overview: '概览',
      settings: '设置',
      footerTitle: 'OpenAIP v8',
      footerSubtitle: '本地 AI 控制台',
      footerBuildPrefix: '核心',
      footerStatus: '大门关闭 · C阶段禁用',
    },
    // Dashboard
    dashboard: {
      title: 'OpenAIP 控制台',
      subtitle: '本地 AI 控制台',
      factoryStatus: '工厂状态',
      runningTasks: '运行中任务',
      activeWorkflows: '活跃工作流',
      pendingApprovals: '待审批',
      pluginStatus: '插件状态',
      routeHealth: '路由健康',
      recentErrors: '近期异常',
      recentActivity: '近期活动',
      systemStats: '系统统计',
      quickAccess: '快速入口',
      lastAction: 'Last Action',
      lastError: 'Last Error',
      circuitState: 'Circuit State',
      execution: '执行类',
      dataTraining: '数据训练类',
      governance: '治理类',
      intelligence: '智能增强类',
      registered: '已注册',
      enabled: '已启用',
      online: '在线',
      offline: '离线',
      abnormal: '异常',
      recentlyActive: '最近活跃',
      viewAll: '查看全部',
      live: '实时',
    },
    // 状态
    status: {
      healthy: '健康',
      unhealthy: '异常',
      running: '运行中',
      pending: '待处理',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消',
      draft: '草稿',
      ready: '就绪',
      deploying: '部署中',
      archived: '已归档',
    },
    // 时间
    time: {
      justNow: '刚刚',
      minutesAgo: '分钟前',
      hoursAgo: '小时前',
      daysAgo: '天前',
    },
  },
    en: {
    // Navigation
    nav: {
      // ── Group labels ──
      openAip: 'OpenAIP',
      resources: 'Resources',
      workbench: 'Workbench',
      system: 'System',
      advancedTools: 'Advanced Tools',
      // ── Nav items ──
      dashboard: 'Dashboard',
      factoryStatus: 'System Status',
      datasets: 'Datasets',
      trainingCenter: 'Training',
      runCenter: 'Runs',
      templates: 'Templates',
      modelMgmt: 'Models',
      artifacts: 'Artifacts',
      evalCenter: 'Evaluation',
      deployCenter: 'Deployment',
      workflow: 'Workflow',
      workflowComposer: 'Workflow Composer',
      workflowCanvas: 'Workflow Run Canvas',
      moduleCenter: 'Module Center',
      pluginPool: 'Plugins',
      taskOrchestration: 'Task Orchestration',
      costRouting: 'Cost Routing',
      approvals: 'Approvals',
      governanceHub: 'Governance Hub',
      audit: 'Audit Logs',
      feedback: 'Feedback Pool',
      advancedModeReadonly: 'Advanced Mode Preview',
      openAipV8CommandCenter: 'Command',
      openAipV8AgentCenter: 'Agents',
      openAipV8TaskCenter: 'Tasks',
      openAipV8ProviderManager: 'Providers',
      openAipV8IntegrationCenter: 'Integrations',
      openAipV8LocalAppsCenter: 'Local Apps',
      openAipV8MemoryKnowledgeCenter: 'Memory & Knowledge',
      openAipV8PolicyCapabilityCenter: 'Policies',
      openAipV8AuditCenter: 'Audit',
      openAipV8ExecutionGateway: 'Execution Gateway',
      connectorCenterReadonly: 'Connectors',
      knowledgeCenter: 'Knowledge Center',
      standardOutput: 'Standard Output',
      // ── New modules ──
      digitalEmployee: 'Digital Employee',
      inference: 'Inference',
      trainingV2: 'Training v2',
      hpo: 'HPO Search',
      distill: 'Distillation',
      modelMerge: 'Model Merge',
      backflowV2: 'Smart Backflow',
      scheduler: 'Scheduler',
      alerting: 'Alerting',
      annotation: 'Annotation',
      huggingface: 'HuggingFace',
      modelMonitor: 'Model Monitor',
      deployV2: 'Deploy Pipeline',
      workspace: 'Workspace',
      costTracker: 'Cost Analysis',
      storageV2: 'Storage',
      intentEngine: 'Intent Engine',
      systemStatus: 'System Status',
      apiDocs: 'API Docs',
      // ── New pages ──
      assistantCenter: 'Assistant',
      openAxiomReadonly: 'OpenAxiom',
      memoryHubReadonly: 'Memory Hub',
      // ── Vision Lab → Advanced Tools ──
      mahjongDebug: 'Mahjong Tools',
    },
    // Common
    common: {
      loading: 'Loading...',
      home: 'Home',
      about: 'About',
      systems: 'Systems',
      help: 'Help',
      wechat: 'WeChat',
      langSwitch: '中',
      themeSwitch: 'Toggle Theme',
      apiStatusPending: 'Checking…',
      apiStatusOk: 'API Online',
      apiStatusBad: 'API Offline',
      empty: 'No Data',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      refresh: 'Refresh',
      close: 'Close',
      more: 'More',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      status: 'Status',
      name: 'Name',
      type: 'Type',
      time: 'Time',
      action: 'Action',
      detail: 'Detail',
      overview: 'Overview',
      settings: 'Settings',
      footerTitle: 'OpenAIP v8',
      footerSubtitle: 'Local AI Console',
      footerBuildPrefix: 'Core',
      footerStatus: 'Gate CLOSED · Stage C Off',
    },
    // Dashboard
    dashboard: {
      title: 'OpenAIP Console',
      subtitle: 'Local AI Console',
      factoryStatus: 'Factory Status',
      runningTasks: 'Running Tasks',
      activeWorkflows: 'Active Workflows',
      pendingApprovals: 'Pending Approvals',
      pluginStatus: 'Plugin Status',
      routeHealth: 'Route Health',
      recentErrors: 'Recent Errors',
      recentActivity: 'Recent Activity',
      systemStats: 'System Stats',
      quickAccess: 'Quick Access',
      lastAction: 'Last Action',
      lastError: 'Last Error',
      circuitState: 'Circuit State',
      execution: 'Execution',
      dataTraining: 'Data & Training',
      governance: 'Governance',
      intelligence: 'Intelligence',
      registered: 'Registered',
      enabled: 'Enabled',
      online: 'Online',
      offline: 'Offline',
      abnormal: 'Abnormal',
      recentlyActive: 'Recently Active',
      viewAll: 'View All',
      live: 'LIVE',
    },
    // Status
    status: {
      healthy: 'Healthy',
      unhealthy: 'Unhealthy',
      running: 'Running',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      draft: 'Draft',
      ready: 'Ready',
      deploying: 'Deploying',
      archived: 'Archived',
    },
    // Time
    time: {
      justNow: 'Just now',
      minutesAgo: 'min ago',
      hoursAgo: 'hr ago',
      daysAgo: 'days ago',
    },
  },
};

// Hook 使用帮助函数
export function useI18n(lang: Lang) {
  const t = translations[lang];
  return { t, lang };
}

// 从 localStorage 获取语言
export function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'zh';
  const saved = localStorage.getItem('agi_factory_site_lang');
  return saved === 'en' ? 'en' : 'zh';
}

// 保存语言到 localStorage
export function setStoredLang(lang: Lang) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('agi_factory_site_lang', lang);
}

// Optional: server-side translation sync to align with backend-driven strings
export async function syncTranslationsFromServer(lang: Lang): Promise<boolean> {
  try {
    // Endpoint is optional; if not present, gracefully skip
    const resp = await fetch('/api/ui/i18n', {
      method: 'GET',
      headers: {
        'Accept-Language': lang,
      },
    });
    if (!resp || !resp.ok) return false;
    const data = await resp.json();
    if (!data || typeof data !== 'object') return false;
    // Expect data to be shaped as { zh?: PartialDashboard, en?: PartialDashboard, ... }
    // Merge each language dictionary if present
    (Object.keys(data) as string[]).forEach((l) => {
      const patch = (data as any)[l] as any;
      if (patch && typeof patch === 'object') {
        // merge top-level keys within that language
        (translations as any)[l] = {
          ...translations[(l as Lang)],
          ...patch,
        };
      }
    });
    return true;
  } catch {
    return false;
  }
}
