import { getStoredLang, type Lang } from '../i18n';

export type OpenAipv8CenterKey =
  | 'command'
  | 'agent'
  | 'task'
  | 'audit'
  | 'policy'
  | 'execution'
  | 'provider'
  | 'integration'
  | 'localApps'
  | 'memory';

export const openAipv8CenterTitles: Record<Lang, Record<OpenAipv8CenterKey, string>> = {
  zh: {
    command: 'OpenAIP v8 指挥中心',
    agent: 'OpenAIP v8 智能体中心',
    task: 'OpenAIP v8 任务中心',
    audit: 'OpenAIP v8 审计中心',
    policy: 'OpenAIP v8 策略与能力中心',
    execution: 'OpenAIP v8 执行网关',
    provider: 'OpenAIP v8 供应商管理中心',
    integration: 'OpenAIP v8 集成中心',
    localApps: 'OpenAIP v8 本地应用中心',
    memory: 'OpenAIP v8 记忆与知识中心',
  },
  en: {
    command: 'OpenAIP v8 Command Center',
    agent: 'OpenAIP v8 Agent Center',
    task: 'OpenAIP v8 Task Center',
    audit: 'OpenAIP v8 Audit Center',
    policy: 'OpenAIP v8 Policy + Capability Center',
    execution: 'OpenAIP v8 Execution Gateway',
    provider: 'OpenAIP v8 Provider Manager',
    integration: 'OpenAIP v8 Integration Center',
    localApps: 'OpenAIP v8 Local Apps Center',
    memory: 'OpenAIP v8 Memory + Knowledge Center',
  },
};

export const openAipv8Subtitles: Record<Lang, Record<OpenAipv8CenterKey, string>> = {
  zh: {
    command: '只读控制平面，统一查看所有 v8 中心。',
    agent: '智能体生命周期、权限和任务关系的只读视图。',
    task: '任务包、回执和人工复核流程的只读视图。',
    audit: '证据、回执和审计链路的只读视图。',
    policy: '策略、能力和权限边界的只读视图。',
    execution: '只读执行边界，不是执行器。',
    provider: '供应商档案、路由概念和密钥安全的只读视图。',
    integration: '集成关系、连接器迁移和外部动作边界的只读视图。',
    localApps: '本地应用、模型服务和运行时关系的只读视图。',
    memory: '记忆、知识源和索引边界的只读视图。',
  },
  en: {
    command: 'Readonly control plane for all v8 centers.',
    agent: 'Readonly view of agent lifecycle, permissions, and task relationships.',
    task: 'Readonly view of task packs, receipts, and human review flow.',
    audit: 'Readonly view of evidence, receipts, and audit trail.',
    policy: 'Readonly view of policy, capability, and permission boundaries.',
    execution: 'Readonly execution boundary, not an executor.',
    provider: 'Readonly view of provider profiles, routing concepts, and secret safety.',
    integration: 'Readonly view of integration relationships, connector migration, and external action boundaries.',
    localApps: 'Readonly view of local apps, model servers, and runtime relationships.',
    memory: 'Readonly view of memory, knowledge sources, and indexing boundaries.',
  },
};

export const openAipv8GlobalSafetyBadges: Record<Lang, string[]> = {
  zh: ['只读预览', '无运行时突变', '大门关闭', 'C 阶段已禁用', '注册表支持的数据', '不执行'],
  en: ['Readonly Preview', 'No runtime mutation', 'Gate CLOSED', 'Stage C disabled', 'Registry-backed data', 'No execution'],
};

export const openAipv8NoActionBadges: Record<Lang, Record<OpenAipv8CenterKey, string[]>> = {
  zh: {
    command: ['不执行'],
    agent: ['不调度智能体'],
    task: ['不执行任务'],
    audit: ['无审计写入'],
    policy: ['无策略变更'],
    execution: ['无执行控制'],
    provider: ['无供应商切换'],
    integration: ['无连接器动作'],
    localApps: ['无本地应用启动'],
    memory: ['无记忆写入', '无索引任务'],
  },
  en: {
    command: ['No execution'],
    agent: ['No agent dispatch'],
    task: ['No task execution'],
    audit: ['No audit write'],
    policy: ['No policy mutation'],
    execution: ['No execution controls'],
    provider: ['No provider switching'],
    integration: ['No connector actions'],
    localApps: ['No local app launch'],
    memory: ['No memory write', 'No indexing job'],
  },
};

export function getOpenAipv8Lang(): Lang {
  return getStoredLang();
}

export function getOpenAipv8Copy(center: OpenAipv8CenterKey, lang = getOpenAipv8Lang()) {
  return {
    lang,
    title: openAipv8CenterTitles[lang][center],
    subtitle: openAipv8Subtitles[lang][center],
    globalSafetyBadges: openAipv8GlobalSafetyBadges[lang],
    noActionBadges: openAipv8NoActionBadges[lang][center],
    backToCommand: lang === 'zh' ? '返回 OpenAIP v8 指挥中心' : 'Back to OpenAIP v8 Command Center',
    relatedCenters: lang === 'zh' ? '相关中心' : 'Related Centers',
    safetyRules: lang === 'zh' ? '安全规则' : 'Safety Rules',
    notAllowed: lang === 'zh' ? '此预览中不可用' : 'Not Allowed in This Preview',
    futurePhases: lang === 'zh' ? '后续阶段' : 'Future Phases',
  };
}
