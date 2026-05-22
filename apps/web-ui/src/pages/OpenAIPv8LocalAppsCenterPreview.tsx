import OpenAIPv8ReadonlyCenterPreview from './OpenAIPv8ReadonlyCenterPreview';

const config = {
  title: 'Local Apps Center',
  subtitle: '本地微应用运行时管理',
  purpose: '管理 OpenAxiom、ComfyUI、Ollama、LM Studio、YOLO/SAM、Python Workers 等本地应用。',
  sections: [
    {
      title: 'Managed Local Apps',
      items: [
        'OpenAxiom — Local App / UI Lab / Vision Tool',
        'ComfyUI — 工作流引擎',
        'Ollama — 本地 LLM',
        'LM Studio — 本地 LLM',
        'YOLO / SAM — 视觉工具',
        'Python Workers — 自定义工作进程'
      ]
    },
    {
      title: 'App Lifecycle',
      items: [
        'registered — 注册但未启动',
        'enabled — 可启动',
        'running — 运行中',
        'stopped — 已停止',
        'error — 异常'
      ]
    },
    {
      title: 'What This Center Will Manage',
      items: [
        '本地应用注册与配置',
        '应用启停管理（未来阶段）',
        '资源使用监控',
        '日志查看'
      ]
    }
  ],
  keyRules: [
    'Local app configured does not mean launch allowed.',
    'Enabled does not mean currently running.',
    'App launch requires Gate open and Stage C enabled.'
  ],
  notAllowed: [
    'No app launch in this preview',
    'No app stop or restart',
    'No app configuration write',
    'No runtime execution'
  ],
  futurePhases: [
    'Local app registry management',
    'App launch/stop controls (gated)',
    'Resource monitoring',
    'Log streaming'
  ],
  sampleData: [
    { label: 'OpenAxiom', value: 'registered | L1 | local_app | ui_lab_vision_tool' },
    { label: 'ComfyUI', value: 'registered | L1 | workflow_engine' },
    { label: 'Future: Python Workers', value: 'placeholder | L0 | pending' }
  ],
  backLink: '/openaip-v8-command-center-preview',
  backLabel: 'Back to Command Center'
};

export default function OpenAIPv8LocalAppsCenterPreview() {
  return <OpenAIPv8ReadonlyCenterPreview config={config} />;
}
