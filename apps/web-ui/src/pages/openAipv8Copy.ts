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

const commandTagline: Record<Lang, string> = {
  zh: '各路 AI 工具都是英雄，OpenAIP 是指挥中心。',
  en: 'All AI tools are heroes. OpenAIP is the command center.',
};

const commandSafetyPreamble: Record<Lang, string> = {
  zh: '所有安全边界均已强制执行。此预览不会变更运行时、写入数据库、打开大门或启用 C 阶段。Wave 2 确认全部 10 个只读中心已在侧边栏可见；可见不等于可执行。',
  en: 'All safety boundaries are enforced. This preview does not mutate runtime, write to DB, open Gate, or enable Stage C. Wave 2 confirms all 10 readonly centers are visible in the sidebar; visibility is not execution.',
};

const commandExtendedSafetyItems: Record<Lang, string[]> = {
  zh: ['仅预览', '只读', '无运行时突变', '大门关闭', 'C 阶段已禁用', '配置 != 权限', '启用 != 执行', '授权 != 开门', '能力 != 权限', 'UI 开关 != 后端真相'],
  en: ['Preview only', 'Read-only', 'No runtime mutation', 'Gate CLOSED', 'Stage C disabled', 'Config != permission', 'Enabled != execution', 'Authorized != gateOpen', 'Capability != permission', 'UI switch != backend truth'],
};

const commandRegistryLabels: Record<Lang, string[]> = {
  zh: ['智能体', '供应商', '集成', '本地应用', '能力', '策略', '任务', '审计', '记忆/知识', '连接器迁移', '执行边界'],
  en: ['Agents', 'Providers', 'Integrations', 'Local Apps', 'Capabilities', 'Policies', 'Tasks', 'Audits', 'Memory/Knowledge', 'Connector Migrations', 'Execution Boundaries'],
};

const commandMigrationStatusLabels: Record<Lang, { heading: string; migrated: string; inProgress: string; planned: string; total: string; legacy: string }> = {
  zh: {
    heading: '连接器 → v8 迁移状态',
    migrated: '已迁移',
    inProgress: '进行中',
    planned: '已计划',
    total: '总计',
    legacy: '旧版: 连接器中心 → 集成中心 / 本地应用中心 / 供应商管理中心',
  },
  en: {
    heading: 'Connector → v8 Migration Status',
    migrated: 'Migrated',
    inProgress: 'In Progress',
    planned: 'Planned',
    total: 'Total',
    legacy: 'Legacy: ConnectorCenter → Integration / Local Apps / Provider Manager',
  },
};

const commandCenterRoles: Record<Lang, Record<OpenAipv8CenterKey, string>> = {
  zh: {
    agent: 'AI 智能体生命周期与权限',
    task: '任务包与回执管道',
    provider: '模型供应商路由',
    integration: '外部服务绑定',
    localApps: '本地微应用运行时',
    memory: '长期记忆与知识',
    policy: '策略与能力治理',
    audit: '审计追踪与证据',
    execution: '执行大门（已关闭）',
    command: '只读控制平面',
  },
  en: {
    agent: 'AI Agent Lifecycle & Permissions',
    task: 'Task Pack & Receipt Pipeline',
    provider: 'Model Provider Routing',
    integration: 'External Service Binding',
    localApps: 'Local Micro App Runtime',
    memory: 'Long-term Memory & Knowledge',
    policy: 'Policy & Capability Governance',
    audit: 'Audit Trail & Evidence',
    execution: 'Execution Gate (closed)',
    command: 'Readonly Control Plane',
  },
};

const commandCenterItems: Record<Lang, Record<OpenAipv8CenterKey, string[]>> = {
  zh: {
    agent: ['智能体生命周期: 启用 / 暂停 / 禁用 / 隔离', '权限等级 L0-L5', '任务/审计关联'],
    task: ['任务包生成', '回执接收管道', '复核队列', '减少人工疲劳'],
    provider: ['CC Switch 式供应商/配置/路由', '供应商注册表', '只读/空运行优先'],
    integration: ['OpenClaw', 'GitHub', 'Webhooks/外部服务', '连接器 → v8 迁移桥'],
    localApps: ['OpenAxiom 本地应用 / UI 实验室 / 视觉工具', 'ComfyUI', 'Ollama / LM Studio', 'YOLO / SAM 工具'],
    memory: ['记忆访问策略', '知识源注册表', '回执/报告索引'],
    policy: ['能力 != 权限', '权限等级', '策略先于按钮'],
    audit: ['回执', '报告', '证据', '提交/推送/验证追溯'],
    execution: ['默认关闭', '大门关闭', 'C 阶段已禁用', '未来执行前需空运行/审批'],
    command: [],
  },
  en: {
    agent: ['AI agents lifecycle: enabled / paused / disabled / quarantined', 'Permission levels L0-L5', 'Task/audit linkage'],
    task: ['Task pack generation', 'Receipt intake pipeline', 'Review queue', 'Human-fatigue reduction'],
    provider: ['CC Switch-like provider/config/router', 'Provider registry', 'Readonly/dry-run first'],
    integration: ['OpenClaw', 'GitHub', 'Webhooks/external services', 'Connector → v8 migration bridge'],
    localApps: ['OpenAxiom as Local App / UI Lab / Vision Tool', 'ComfyUI', 'Ollama / LM Studio', 'YOLO / SAM tools'],
    memory: ['Memory access policy', 'Knowledge source registry', 'Receipt/report indexing'],
    policy: ['Capability != permission', 'Permission levels', 'Policy-before-buttons'],
    audit: ['Receipts', 'Reports', 'Evidence', 'Commit/push/verification trail'],
    execution: ['Default closed', 'Gate CLOSED', 'Stage C disabled', 'Dry-run/approval required before future execution'],
    command: [],
  },
};

const commandNextPhase: Record<Lang, { heading: string; items: string[] }> = {
  zh: {
    heading: '建议后续阶段',
    items: ['只读路由烟雾测试 — 验证全部 10 个 v8 只读路由正确加载。', '不执行 — 所有操作保持阻断。大门保持关闭。C 阶段保持禁用。'],
  },
  en: {
    heading: 'Recommended Next Phase',
    items: ['Readonly route smoke — Verify all 10 v8 readonly routes load correctly.', 'No execution — All actions remain blocked. Gate stays CLOSED. Stage C stays disabled.'],
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
    tagline: commandTagline[lang],
    safetyPreamble: commandSafetyPreamble[lang],
    extendedSafetyItems: commandExtendedSafetyItems[lang],
    registryLabels: commandRegistryLabels[lang],
    migrationStatusLabels: commandMigrationStatusLabels[lang],
    centerRole: commandCenterRoles[lang][center],
    centerItems: commandCenterItems[lang][center],
    nextPhase: commandNextPhase[lang],
  };
}
