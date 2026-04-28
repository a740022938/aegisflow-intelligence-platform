import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type Lang, translations, getStoredLang } from '../i18n';

type ModuleStatus = 'online' | 'offline' | 'degraded' | 'unknown';

interface MetricDef {
  labelZh: string;
  labelEn: string;
  value: string | number;
  color?: string;
}

interface ActionDef {
  labelZh: string;
  labelEn: string;
  onClick: () => void;
  primary?: boolean;
}

interface ModuleInfo {
  titleZh: string;
  titleEn: string;
  api?: string;
  descZh: string;
  descEn: string;
  capabilities: string[];
  limits: string[];
  redirect?: string;
}

const MODULES: Record<string, ModuleInfo> = {
  'digital-employee': {
    titleZh: '数字员工', titleEn: 'Digital Employee',
    api: '/api/employee/dashboard',
    descZh: 'AI 机器学习工程师，可接收任务、自动拆解、执行工作流、主动汇报',
    descEn: 'AI ML engineer - receives tasks, auto-plans, executes workflows, reports',
    capabilities: ['任务接收与拆解', '工作流自动执行', '主动汇报与通知'],
    limits: ['需 OpenClaw 在线', '需配置意图模板', '不支持多轮对话'],
  },
  'training-v2': {
    titleZh: '训练中心', titleEn: 'Training Center',
    api: '/api/training/v2/jobs',
    descZh: '13 种架构支持 (YOLO/ViT/ResNet/BERT/LLaMA+LoRA/Qwen+LoRA)，预设 8 种训练配方',
    descEn: '13 architectures, 8 preset recipes, HPO/distill/merge support',
    capabilities: ['13 种架构支持', '8 种预设配方', '超参搜索/蒸馏/合并'],
    limits: ['需配置训练镜像', 'GPU 资源受限', '不支持分布式训练'],
  },
  'hpo': {
    titleZh: '超参搜索', titleEn: 'HPO',
    api: '/api/training/v2/jobs?limit=5',
    descZh: '随机搜索 + 自适应搜索空间，按架构自动适配',
    descEn: 'Random search + adaptive search space per architecture',
    capabilities: ['随机搜索', '自适应搜索空间', '按架构自动适配'],
    limits: ['仅支持部分架构', '搜索空间需手动定义', '不支持多目标优化'],
  },
  'distill': {
    titleZh: '知识蒸馏', titleEn: 'Distillation',
    api: '/api/training/v2/distill/jobs',
    descZh: 'Teacher -> Student 任意架构组合，可配置温度/Alpha',
    descEn: 'Teacher->Student distillation, configurable temperature/alpha',
    capabilities: ['任意架构组合', '温度/Alpha 可配置', '自动评估'],
    limits: ['Teacher 模型需先训练', 'Student 架构需兼容', '不支持跨模态蒸馏'],
  },
  'model-merge': {
    titleZh: '模型合并', titleEn: 'Model Merge',
    api: '/api/training/v2/merge/jobs',
    descZh: '5 种合并方法: avg/task_vectors/model_soup/ties/dare',
    descEn: '5 merge methods: avg/task_vectors/model_soup/ties/dare',
    capabilities: ['5 种合并方法', '自动验证', '兼容 YOLO/BERT'],
    limits: ['仅同架构可合并', '需配置合并权重', '不支持跨模态合并'],
  },
  'inference': {
    titleZh: '模型推理', titleEn: 'Inference',
    api: '/api/infer/models',
    descZh: '用已训练的模型跑推理，支持检测/分类/分割',
    descEn: 'Run inference with trained models, detect/classify/segment',
    capabilities: ['检测推理', '分类推理', '分割推理'],
    limits: ['模型需先部署', '不支持流式推理', '需 GPU 加速'],
  },
  'annotation': {
    titleZh: '数据标注', titleEn: 'Annotation',
    api: '/api/annotation/projects',
    descZh: '图片标注 + SAM 半自动辅助，YOLO 格式导出',
    descEn: 'Image annotation + SAM auto-label, YOLO format export',
    capabilities: ['图片标注', 'SAM 半自动辅助', 'YOLO 格式导出'],
    limits: ['仅支持图片标注', '不支持视频标注', 'SAM 需 GPU'],
  },
  'huggingface': {
    titleZh: 'HuggingFace', titleEn: 'HuggingFace Hub',
    api: '/api/huggingface/models',
    descZh: '直接从 HuggingFace Hub 搜索、拉取预训练模型，导出 ONNX',
    descEn: 'Search & pull pretrained models from HuggingFace Hub',
    capabilities: ['模型搜索', '模型拉取', 'ONNX 导出'],
    limits: ['需外网访问', '大模型下载慢', '不支持上传'],
  },
  'backflow-v2': {
    titleZh: '智能回流', titleEn: 'Smart Backflow',
    api: '/api/backflow/v2/dashboard',
    descZh: '漂移检测 -> 错误分析 -> 重训建议 -> 自动触发，四级告警',
    descEn: 'Drift detection -> error analysis -> retrain suggestion -> auto-trigger',
    capabilities: ['漂移检测', '错误分析', '重训建议', '自动触发'],
    limits: ['需配置基线模型', '告警阈值需调优', '不支持实时检测'],
  },
  'scheduler': {
    titleZh: '任务调度器', titleEn: 'Scheduler',
    api: '/api/scheduler/jobs',
    descZh: 'Cron/Interval/事件驱动，自动触发工作流/训练/脚本',
    descEn: 'Cron/Interval/event-driven auto-trigger',
    capabilities: ['Cron 调度', 'Interval 调度', '事件驱动调度'],
    limits: ['不支持分布式调度', '无依赖管理', '时区仅支持 UTC+8'],
  },
  'alerting': {
    titleZh: '告警中心', titleEn: 'Alerting',
    api: '/api/alerting/channels',
    descZh: '飞书/钉钉/Webhook 渠道 + 自动健康巡检',
    descEn: 'Feishu/DingTalk/Webhook channels + auto health patrol',
    capabilities: ['多渠道告警', '自动健康巡检', '阈值配置'],
    limits: ['需配置渠道 Webhook', '不支持电话告警', '巡检间隔 >= 5 分钟'],
  },
  'model-monitor': {
    titleZh: '模型监控', titleEn: 'Model Monitor',
    api: '/api/monitor/deployments',
    descZh: '生产模型质量监控，漂移检测 + 阈值告警 + 自动重训',
    descEn: 'Production model monitoring, drift detection + threshold alert + auto-retrain',
    capabilities: ['质量监控', '漂移检测', '阈值告警', '自动重训'],
    limits: ['需配置生产部署', '基线数据需积累', '不支持实时监控'],
  },
  'deploy-v2': {
    titleZh: '发布管道', titleEn: 'Deploy Pipeline',
    api: '/api/deploy/v2/endpoints',
    descZh: 'Canary 金丝雀发布 + 版本回滚 + A/B 测试',
    descEn: 'Canary release + version rollback + A/B testing',
    capabilities: ['金丝雀发布', '版本回滚', 'A/B 测试'],
    limits: ['需配置部署目标', '不支持蓝绿部署', '回滚仅支持上一版本'],
  },
  'workspace': {
    titleZh: '工作空间', titleEn: 'Workspace',
    api: '/api/ws/dashboard',
    descZh: '多租户管理，团队/项目/成员/GPU 配额',
    descEn: 'Multi-tenant, teams/projects/members/GPU quota',
    capabilities: ['多租户管理', '团队/项目管理', 'GPU 配额'],
    limits: ['成员数上限 50', '不支持跨集群', '配额需手动分配'],
  },
  'cost-tracker': {
    titleZh: '成本分析', titleEn: 'Cost Analysis',
    api: '/api/cost/summary?period=month',
    descZh: 'GPU/存储/推理费用追踪，自动计价，预算预警',
    descEn: 'GPU/storage/inference cost tracking, auto billing, budget alerts',
    capabilities: ['费用追踪', '自动计价', '预算预警'],
    limits: ['仅统计已知资源', '不支持实时计费', '预算预警有延迟'],
  },
  'storage-v2': {
    titleZh: '对象存储', titleEn: 'Object Storage',
    api: '/api/storage/v2/datasets',
    descZh: '本地/MinIO/S3 三后端，数据集版本化，文件管理',
    descEn: 'Local/MinIO/S3 backends, dataset versioning, file management',
    capabilities: ['三后端支持', '数据集版本化', '文件管理'],
    limits: ['不支持跨后端迁移', '单文件上限 5GB', '版本数上限 100'],
  },
  'system-status': {
    titleZh: '系统状态', titleEn: 'System Status',
    api: '/api/system/status',
    descZh: 'API / Worker 池 / 任务队列 / 数据库 / 内存 全量状态',
    descEn: 'API/Worker pool/Task queue/Database/Memory full status',
    capabilities: ['API 状态', 'Worker 池状态', '队列状态', '数据库状态', '内存状态'],
    limits: ['仅展示系统级指标', '不支持进程级监控', '不包含历史趋势'],
  },
  'api-docs': {
    titleZh: 'API 文档', titleEn: 'API Docs',
    redirect: '/docs',
    descZh: 'Swagger/OpenAPI 交互式文档，在线调试',
    descEn: 'Swagger/OpenAPI interactive docs, online debugging',
    capabilities: ['交互式文档', '在线调试', 'Schema 查看'],
    limits: [],
  },
};

const STATUS_CFG: Record<ModuleStatus, { zh: string; en: string; color: string; bg: string }> = {
  online: { zh: '在线', en: 'Online', color: 'var(--primary)', bg: 'rgba(34,197,94,0.1)' },
  offline: { zh: '离线', en: 'Offline', color: 'var(--danger)', bg: 'var(--danger-light)' },
  degraded: { zh: '降级', en: 'Degraded', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  unknown: { zh: '未知', en: 'Unknown', color: 'var(--text-muted)', bg: 'transparent' },
};

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const key of ['data', 'items', 'jobs', 'models', 'projects', 'channels', 'deployments', 'endpoints', 'datasets', 'records', 'tasks', 'recent_tasks', 'recent_jobs', 'recent_activity']) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
}

function getStatus(data: any, error: string | null, loading: boolean): ModuleStatus {
  if (loading) return 'unknown';
  if (error) return 'offline';
  if (!data) return 'unknown';
  const s = data?.status ?? data?.state ?? '';
  if (s === 'healthy' || s === 'ok' || s === 'online') return 'online';
  if (s === 'degraded' || s === 'warning') return 'degraded';
  if (s === 'offline' || s === 'error' || s === 'unhealthy') return 'offline';
  return 'online';
}

function fmtTime(ts: string | number | undefined | null): string {
  if (!ts) return '--';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--';
  }
}

function getMetrics(key: string, d: any): MetricDef[] {
  const def = (labelZh: string, labelEn: string, value: any, color?: string): MetricDef => ({
    labelZh, labelEn, value: value ?? value === 0 ? value : '--', color,
  });
  switch (key) {
    case 'digital-employee':
      return [
        def('待处理任务', 'Pending Tasks', d?.tasks_received ?? d?.tasks),
        def('已执行工作流', 'Workflows Executed', d?.workflows_executed ?? d?.executed, 'var(--primary)'),
        def('主动报告', 'Reports', d?.reports),
      ];
    case 'training-v2':
      return [
        def('总任务数', 'Total Jobs', d?.total ?? (Array.isArray(d?.jobs) ? d.jobs.length : undefined)),
        def('运行中', 'Running', d?.running, 'var(--primary)'),
        def('已完成', 'Completed', d?.completed),
      ];
    case 'hpo':
      return [
        def('搜索任务', 'Search Jobs', d?.total ?? (Array.isArray(d?.jobs) ? d.jobs.length : undefined)),
        def('运行中', 'Running', d?.running, 'var(--primary)'),
      ];
    case 'distill':
      return [
        def('蒸馏任务', 'Distill Jobs', d?.total ?? (Array.isArray(d?.jobs) ? d.jobs.length : undefined)),
        def('已完成', 'Completed', d?.completed),
      ];
    case 'model-merge':
      return [
        def('合并任务', 'Merge Jobs', d?.total ?? (Array.isArray(d?.jobs) ? d.jobs.length : undefined)),
        def('已完成', 'Completed', d?.completed),
      ];
    case 'inference':
      return [
        def('已部署模型', 'Deployed Models', d?.total ?? (Array.isArray(d) ? d.length : undefined)),
        def('活跃端点', 'Active Endpoints', d?.active_endpoints ?? d?.endpoints),
      ];
    case 'annotation':
      return [
        def('标注项目', 'Annotation Projects', d?.total ?? (Array.isArray(d?.projects) ? d.projects.length : undefined)),
        def('已标注图片', 'Images Labeled', d?.images_labeled ?? d?.total_images),
      ];
    case 'huggingface':
      return [
        def('拉取模型', 'Models Pulled', d?.total ?? (Array.isArray(d?.models) ? d.models.length : undefined)),
        def('已导出 ONNX', 'ONNX Exported', d?.onnx_exported),
      ];
    case 'backflow-v2':
      return [
        def('漂移检测', 'Drift Detections', d?.drift_count ?? d?.detections, '#eab308'),
        def('活跃告警', 'Active Alerts', d?.active_alerts ?? d?.alerts, 'var(--danger)'),
        def('自动触发', 'Auto Triggers', d?.auto_triggered ?? d?.triggered, 'var(--primary)'),
      ];
    case 'scheduler':
      return [
        def('调度任务', 'Scheduled Jobs', d?.total ?? (Array.isArray(d?.jobs) ? d.jobs.length : undefined)),
        def('活跃 Cron', 'Active Cron', d?.active ?? d?.active_cron, 'var(--primary)'),
      ];
    case 'alerting':
      return [
        def('告警渠道', 'Alert Channels', d?.total ?? (Array.isArray(d?.channels) ? d.channels.length : undefined)),
        def('活跃告警', 'Active Alerts', d?.active_alerts ?? d?.alerts, '#eab308'),
      ];
    case 'model-monitor':
      return [
        def('监控部署', 'Monitored Deployments', d?.total ?? (Array.isArray(d?.deployments) ? d.deployments.length : undefined)),
        def('漂移告警', 'Drift Alerts', d?.drift_alerts, 'var(--danger)'),
      ];
    case 'deploy-v2':
      return [
        def('发布端点', 'Deploy Endpoints', d?.total ?? (Array.isArray(d?.endpoints) ? d.endpoints.length : undefined)),
        def('活跃版本', 'Active Releases', d?.active_releases ?? d?.releases, 'var(--primary)'),
      ];
    case 'workspace':
      return [
        def('团队数', 'Teams', d?.teams),
        def('成员数', 'Members', d?.members),
        def('GPU 配额', 'GPU Quota', d?.gpu_quota ?? d?.gpu),
      ];
    case 'cost-tracker':
      return [
        def('GPU 费用', 'GPU Cost', d?.gpu_cost, 'var(--danger)'),
        def('存储费用', 'Storage Cost', d?.storage_cost),
        def('推理费用', 'Inference Cost', d?.inference_cost ?? d?.infer_cost),
      ];
    case 'storage-v2':
      return [
        def('数据集数', 'Datasets', d?.total ?? (Array.isArray(d?.datasets) ? d.datasets.length : undefined)),
        def('总容量 (GB)', 'Total Size (GB)', d?.total_size_gb ?? d?.total_size),
      ];
    case 'system-status':
      return [
        def('API 状态', 'API Status', d?.api ?? d?.api_status ?? '--'),
        def('Worker 池', 'Worker Pool', d?.workers ?? d?.worker_pool ?? '--'),
        def('队列深度', 'Queue Depth', d?.queue ?? d?.queue_depth),
        def('数据库', 'Database', d?.database ?? d?.db ?? '--'),
      ];
    default:
      return [];
  }
}

const EMPTY_MSGS: Record<string, { zh: string; en: string; zhDesc: string; enDesc: string }> = {
  'digital-employee': { zh: '暂无任务', en: 'No Tasks', zhDesc: '数字员工尚未接收到任何任务。请先通过任务中心创建任务，或配置意图模板。', enDesc: 'No tasks received. Create a task from the task center or configure an intent template.' },
  'training-v2': { zh: '暂无训练任务', en: 'No Training Jobs', zhDesc: '尚未创建训练任务。使用训练中心创建您的第一个训练任务。', enDesc: 'No training jobs yet. Create your first training job.' },
  'hpo': { zh: '暂无搜索任务', en: 'No HPO Jobs', zhDesc: '尚未执行超参搜索。新建搜索任务以开始。', enDesc: 'No HPO jobs yet. Start a new search.' },
  'distill': { zh: '暂无蒸馏任务', en: 'No Distill Jobs', zhDesc: '尚未执行知识蒸馏。需要一个已训练的 Teacher 模型。', enDesc: 'No distillation jobs yet. A trained teacher model is required.' },
  'model-merge': { zh: '暂无合并任务', en: 'No Merge Jobs', zhDesc: '尚未执行模型合并。需要至少两个同架构模型。', enDesc: 'No merge jobs yet. At least two models of the same architecture are needed.' },
  'inference': { zh: '暂无推理模型', en: 'No Inference Models', zhDesc: '尚未部署任何推理模型。请先部署模型到推理端点。', enDesc: 'No inference models deployed. Deploy a model first.' },
  'annotation': { zh: '暂无标注项目', en: 'No Annotation Projects', zhDesc: '尚未创建标注项目。新建项目并上传图片开始标注。', enDesc: 'No annotation projects yet. Create one and upload images.' },
  'huggingface': { zh: '暂无拉取模型', en: 'No Pulled Models', zhDesc: '尚未从 HuggingFace Hub 拉取任何模型。搜索并拉取预训练模型。', enDesc: 'No models pulled from HuggingFace Hub yet. Search and pull a model.' },
  'backflow-v2': { zh: '暂无回流数据', en: 'No Backflow Data', zhDesc: '暂无漂移检测或回流记录。当检测到模型漂移时将自动生成。', enDesc: 'No drift detection or backflow records yet. Records appear when drift is detected.' },
  'scheduler': { zh: '暂无调度任务', en: 'No Scheduled Jobs', zhDesc: '尚未配置任何调度任务。创建 Cron 或事件驱动调度。', enDesc: 'No scheduled jobs configured. Create a cron or event-driven schedule.' },
  'alerting': { zh: '暂无告警渠道', en: 'No Alert Channels', zhDesc: '尚未配置告警渠道。添加飞书、钉钉或 Webhook 渠道。', enDesc: 'No alert channels configured. Add Feishu, DingTalk or Webhook.' },
  'model-monitor': { zh: '暂无监控部署', en: 'No Monitored Deployments', zhDesc: '尚未配置模型监控。需要先部署生产模型并配置基线。', enDesc: 'No model monitoring configured. Deploy a model and set up a baseline.' },
  'deploy-v2': { zh: '暂无发布端点', en: 'No Deploy Endpoints', zhDesc: '尚未创建发布端点。新建端点以进行金丝雀发布或 A/B 测试。', enDesc: 'No deploy endpoints created. Create one for canary or A/B testing.' },
  'workspace': { zh: '暂无工作空间数据', en: 'No Workspace Data', zhDesc: '尚未配置工作空间。创建团队并分配成员和 GPU 配额。', enDesc: 'No workspace data. Create teams and assign members and GPU quota.' },
  'cost-tracker': { zh: '暂无成本数据', en: 'No Cost Data', zhDesc: '当前周期内尚无费用记录。资源使用后将自动生成。', enDesc: 'No cost records for the current period. Data appears after resource usage.' },
  'storage-v2': { zh: '暂无数据集', en: 'No Datasets', zhDesc: '尚未创建数据集。上传文件或连接外部存储后端。', enDesc: 'No datasets yet. Upload files or connect an external storage backend.' },
  'system-status': { zh: '暂无系统状态', en: 'No System Status', zhDesc: '系统状态数据不可用。请检查服务是否正常运行。', enDesc: 'System status unavailable. Check if services are running.' },
};

function StatusIndicator({ status, lang }: { status: ModuleStatus; lang: Lang }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px',
        borderRadius: 20, fontSize: 12, fontWeight: 500,
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`,
        lineHeight: 1.4,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
      {lang === 'zh' ? cfg.zh : cfg.en}
    </span>
  );
}

function MetricCard({ m }: { m: MetricDef }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '16px 20px', minWidth: 140, flex: '1 1 0',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.labelZh}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: m.color || 'var(--text-primary)', lineHeight: 1.2 }}>{m.value ?? '--'}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.labelEn}</div>
    </div>
  );
}

const SECT_STYLE: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border)',
  borderRadius: 8, padding: 16,
};

const SECT_TITLE_STYLE: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12,
};

export default function ModulePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const moduleName = location.pathname.replace(/^\//, '');
  const info = MODULES[moduleName];
  const [lang] = useState<Lang>(() => getStoredLang());
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];
  const isZh = lang === 'zh';

  useEffect(() => {
    if (info?.redirect) {
      navigate(info.redirect, { replace: true });
    }
  }, [info, navigate]);

  const fetchData = useCallback(async () => {
    if (!info?.api || info?.redirect) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(info.api);
      if (!res.ok) throw new Error(`HTTP ${res.status}${res.statusText ? ' ' + res.statusText : ''}`);
      const d = await res.json();
      setData(d);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [info?.api, info?.redirect]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const status = getStatus(data, error, loading);
  const metrics = getMetrics(moduleName, data);
  const records = data && !error ? extractArray(data) : [];
  const isRedirect = !!info?.redirect;

  if (!info) {
    return (
      <div style={{ padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>
        {isZh ? '未知模块: ' : 'Unknown Module: '}{moduleName}
      </div>
    );
  }

  const title = isZh ? info.titleZh : info.titleEn;
  const desc = isZh ? info.descZh : info.descEn;

  const actions = buildActions(moduleName, navigate, fetchData, isZh);

  if (isRedirect) return null;

  const emptyMsg = EMPTY_MSGS[moduleName];

  const handleRetry = () => {
    fetchData();
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200 }}>
      {/* Requirement 1 & 2: Title + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h1>
        <StatusIndicator status={status} lang={lang} />
      </div>

      {/* Requirement 3: Description */}
      <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
      {info.api && (
        <p style={{ margin: '0 0 20px', fontSize: 11, color: 'var(--text-muted)' }}>
          API: <code style={{ color: 'var(--primary)', fontSize: 11 }}>GET {info.api}</code>
        </p>
      )}

      {/* Requirement 10: Error state */}
      {error && !loading && (
        <div style={{ ...SECT_STYLE, marginBottom: 20, borderColor: 'var(--danger)', background: 'var(--danger-light)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="var(--danger)" strokeWidth="1.5" />
              <path d="M5 5L11 11M11 5L5 11" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>
                {isZh ? '请求失败' : 'Request Failed'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--danger)', opacity: 0.8, marginBottom: 10 }}>{error}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleRetry} style={BTN_PRIMARY}>
                  {isZh ? '重试' : 'Retry'}
                </button>
                <button onClick={() => window.open(info.api, '_blank')} style={BTN_OUTLINE}>
                  {isZh ? '在浏览器查看' : 'Open in Browser'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requirement 4: Capabilities & Limits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={SECT_STYLE}>
          <div style={SECT_TITLE_STYLE}>
            <span style={{ color: 'var(--primary)' }}>{isZh ? '能力' : 'Capabilities'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {info.capabilities.map((cap, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M2 6L4.5 8.5L10 3" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {cap}
              </div>
            ))}
          </div>
        </div>
        <div style={SECT_STYLE}>
          <div style={SECT_TITLE_STYLE}>
            <span style={{ color: '#eab308' }}>{isZh ? '边界' : 'Limits'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {info.limits.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {isZh ? '暂无已知限制' : 'No known limits'}
              </div>
            ) : (
              info.limits.map((lim, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 4L8 8M8 4L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {lim}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Requirement 5: Metric cards */}
      {metrics.length > 0 && !loading && !error && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {metrics.map((m, i) => (
            <MetricCard key={i} m={m} />
          ))}
        </div>
      )}

      {/* Requirement 7 & 8: Recent records / Empty state */}
      {!loading && !error && (
        <div style={SECT_STYLE}>
          <div style={SECT_TITLE_STYLE}>
            {isZh ? '最近记录' : 'Recent Records'}
            {records.length > 0 && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, fontSize: 11 }}>
                ({records.length})
              </span>
            )}
          </div>
          {records.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {records.slice(0, 10).map((item: any, i: number) => {
                const name = item.name ?? item.id ?? item.title ?? item.model_id ?? item.plugin_id ?? item.job_id ?? `#${i + 1}`;
                const sub = item.status ?? item.state ?? item.type ?? item.category ?? '';
                const ts = fmtTime(item.created_at ?? item.updated_at ?? item.time ?? item.timestamp);
                return (
                  <div
                    key={item.id ?? item.job_id ?? i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                      borderBottom: i < Math.min(records.length, 10) - 1 ? '1px solid var(--border)' : 'none',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(name).slice(0, 60)}
                    </div>
                    {sub && (
                      <span
                        style={{
                          padding: '1px 8px', borderRadius: 10, fontSize: 11,
                          color: 'var(--text-secondary)', background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {String(sub).slice(0, 20)}
                      </span>
                    )}
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{ts}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Requirement 8: Empty state */
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12, color: 'var(--text-muted)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7H16M8 12H16M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                {emptyMsg ? (isZh ? emptyMsg.zh : emptyMsg.en) : (isZh ? '暂无数据' : 'No Data')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 16px', lineHeight: 1.6 }}>
                {emptyMsg ? (isZh ? emptyMsg.zhDesc : emptyMsg.enDesc) : (isZh ? '当前尚无可用数据。' : 'No data currently available.')}
              </div>
              <button onClick={() => navigate(`/${moduleName}`)} style={BTN_PRIMARY}>
                {emptyMsg ? (isZh ? emptyMsg.zhDesc.slice(0, 8) : 'Get Started') : (isZh ? '前往模块' : 'Go to Module')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Requirement 9: Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            style={a.primary ? { ...BTN_PRIMARY, ...BTN_BASE } : { ...BTN_OUTLINE, ...BTN_BASE }}
          >
            {isZh ? a.labelZh : a.labelEn}
          </button>
        ))}
        {info.api && (
          <>
            <button
              onClick={() => window.open(info.api, '_blank')}
              style={{ ...BTN_OUTLINE, ...BTN_BASE }}
            >
              {isZh ? '查看原始数据' : 'View Raw Data'}
            </button>
            <button
              onClick={() => window.open('/docs', '_blank')}
              style={{ ...BTN_OUTLINE, ...BTN_BASE }}
            >
              {isZh ? 'API 文档' : 'API Docs'}
            </button>
          </>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={SECT_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            {t.common.loading}
          </div>
        </div>
      )}
    </div>
  );
}

const BTN_BASE: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
  fontWeight: 500, lineHeight: 1.4, fontFamily: 'inherit',
};

const BTN_PRIMARY: React.CSSProperties = {
  background: 'var(--primary)', color: '#fff', border: 'none',
};

const BTN_OUTLINE: React.CSSProperties = {
  background: 'var(--bg-surface)', color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
};

function buildActions(
  key: string,
  nav: (p: string) => void,
  refetch: () => void,
  isZh: boolean,
): ActionDef[] {
  const a = (labelZh: string, labelEn: string, onClick: () => void, primary?: boolean): ActionDef => ({
    labelZh, labelEn, onClick, primary,
  });
  switch (key) {
    case 'digital-employee':
      return [a('查看任务列表', 'View Tasks', () => nav('/tasks'), true)];
    case 'training-v2':
      return [
        a('新建训练任务', 'New Training', () => nav('/training-v2/new'), true),
        a('查看全部任务', 'View All Jobs', () => nav('/training-v2')),
      ];
    case 'hpo':
      return [a('新建搜索', 'New HPO Job', () => nav('/training-v2/hpo'), true)];
    case 'distill':
      return [a('新建蒸馏', 'New Distill', () => nav('/training-v2/distill'), true)];
    case 'model-merge':
      return [a('新建合并', 'New Merge', () => nav('/training-v2/merge'), true)];
    case 'inference':
      return [a('查看模型列表', 'View Models', () => nav('/models'), true)];
    case 'annotation':
      return [a('新建标注项目', 'New Project', () => nav('/annotation'), true)];
    case 'huggingface':
      return [a('搜索模型', 'Search Models', () => nav('/models'), true)];
    case 'backflow-v2':
      return [a('查看回流状态', 'View Backflow', () => nav('/feedback'), true)];
    case 'scheduler':
      return [a('新建调度', 'New Schedule', () => nav('/scheduler'), true)];
    case 'alerting':
      return [a('管理告警渠道', 'Manage Channels', () => nav('/alerting'), true)];
    case 'model-monitor':
      return [a('查看部署监控', 'View Deployments', () => nav('/deployments'), true)];
    case 'deploy-v2':
      return [a('新建发布', 'New Release', () => nav('/deploy-v2'), true)];
    case 'workspace':
      return [a('管理工作空间', 'Manage Workspace', () => nav('/workspace'), true)];
    case 'cost-tracker':
      return [a('查看成本明细', 'View Cost Details', () => nav('/cost'), true)];
    case 'storage-v2':
      return [a('管理数据集', 'Manage Datasets', () => nav('/datasets'), true)];
    case 'system-status':
      return [a('刷新状态', 'Refresh Status', () => refetch(), true)];
    default:
      return [];
  }
}
