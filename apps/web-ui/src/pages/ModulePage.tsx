import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { type Lang, translations, getStoredLang } from '../i18n';

interface ModuleInfo {
  titleZh?: string;
  titleEn?: string;
  api?: string;
  descriptionZh: string;
  descriptionEn: string;
  redirect?: string;
}

const MODULES: Record<string, ModuleInfo> = {
  'digital-employee': { titleZh: '数字员工 — 小枢', titleEn: 'Digital Employee — Kobito', api: '/api/employee/dashboard', descriptionZh: 'AI 机器学习工程师，可接收任务、自动拆解、执行工作流、主动汇报', descriptionEn: 'AI ML engineer - receives tasks, auto-plans, executes workflows, reports proactively' },
  'training-v2': { titleZh: '训练中心 v2', titleEn: 'Training Center v2', api: '/api/training/v2/jobs', descriptionZh: '13 种架构支持 (YOLO/ViT/ResNet/BERT/LLaMA+LoRA/Qwen+LoRA)，预设 8 种训练配方', descriptionEn: '13 architectures, 8 preset recipes, HPO/distill/merge support' },
  'hpo': { titleZh: '超参搜索 (HPO)', titleEn: 'Hyperparameter Search', api: '/api/training/v2/jobs?limit=5', descriptionZh: '随机搜索 + 自适应搜索空间，按架构自动适配', descriptionEn: 'Random search + adaptive search space per architecture' },
  'distill': { titleZh: '知识蒸馏', titleEn: 'Knowledge Distillation', api: '/api/training/v2/distill/jobs', descriptionZh: 'Teacher→Student 任意架构组合，可配置温度/Alpha', descriptionEn: 'Teacher→Student distillation, configurable temperature/alpha, any architecture' },
  'model-merge': { titleZh: '模型合并', titleEn: 'Model Merging', api: '/api/training/v2/merge/jobs', descriptionZh: '5 种合并方法: avg/task_vectors/model_soup/ties/dare', descriptionEn: '5 merge methods: avg/task_vectors/model_soup/ties/dare' },
  'inference': { titleZh: '模型推理', titleEn: 'Model Inference', api: '/api/infer/models', descriptionZh: '用已训练的模型跑推理，支持检测/分类/分割', descriptionEn: 'Run inference with trained models, supports detect/classify/segment' },
  'annotation': { titleZh: '数据标注', titleEn: 'Data Annotation', api: '/api/annotation/projects', descriptionZh: '图片标注 + SAM 半自动辅助，YOLO 格式导出', descriptionEn: 'Image annotation + SAM auto-label, YOLO format export' },
  'huggingface': { titleZh: 'HuggingFace 集成', titleEn: 'HuggingFace Hub', descriptionZh: '直接从 HuggingFace Hub 搜索、拉取预训练模型，导出 ONNX', descriptionEn: 'Search & pull pretrained models from HuggingFace Hub, ONNX export' },
  'backflow-v2': { titleZh: '智能回流 v2', titleEn: 'Smart Backflow v2', api: '/api/backflow/v2/dashboard', descriptionZh: '漂移检测 → 错误分析 → 重训建议 → 自动触发，四级告警', descriptionEn: 'Drift detection → error analysis → retrain suggestion → auto-trigger, 4-level alert' },
  'scheduler': { titleZh: '任务调度器', titleEn: 'Scheduler', api: '/api/scheduler/jobs', descriptionZh: 'Cron/Interval/事件驱动，自动触发工作流/训练/脚本', descriptionEn: 'Cron/Interval/event-driven, auto-trigger workflows/training/scripts' },
  'alerting': { titleZh: '告警中心', titleEn: 'Alerting Center', api: '/api/alerting/channels', descriptionZh: '飞书/钉钉/Webhook 渠道 + 自动健康巡检', descriptionEn: 'Feishu/DingTalk/Webhook channels + auto health patrol' },
  'model-monitor': { titleZh: '模型监控', titleEn: 'Model Monitor', api: '/api/monitor/deployments', descriptionZh: '生产模型质量监控，漂移检测 + 阈值告警 + 自动重训', descriptionEn: 'Production model monitoring, drift detection + threshold alert + auto-retrain' },
  'deploy-v2': { titleZh: '发布管道 v2', titleEn: 'Deploy Pipeline v2', api: '/api/deploy/v2/endpoints', descriptionZh: 'Canary 金丝雀发布 + 版本回滚 + A/B 测试', descriptionEn: 'Canary release + version rollback + A/B testing' },
  'workspace': { titleZh: '工作空间', titleEn: 'Workspace', api: '/api/ws/dashboard', descriptionZh: '多租户管理，团队/项目/成员/GPU 配额', descriptionEn: 'Multi-tenant, teams/projects/members/GPU quota' },
  'cost-tracker': { titleZh: '成本分析', titleEn: 'Cost Analysis', api: '/api/cost/summary?period=month', descriptionZh: 'GPU/存储/推理费用追踪，自动计价，预算预警', descriptionEn: 'GPU/storage/inference cost tracking, auto billing, budget alerts' },
  'storage-v2': { titleZh: '对象存储', titleEn: 'Object Storage', api: '/api/storage/v2/datasets', descriptionZh: '本地/MinIO/S3 三后端，数据集版本化，文件管理', descriptionEn: 'Local/MinIO/S3 backends, dataset versioning, file management' },
  'system-status': { titleZh: '系统状态', titleEn: 'System Status', api: '/api/system/status', descriptionZh: 'API / Worker 池 / 任务队列 / 数据库 / 内存 全量状态', descriptionEn: 'API/Worker pool/Task queue/Database/Memory full status' },
  'api-docs': { redirect: '/docs', descriptionZh: 'Swagger/OpenAPI 交互式文档，在线调试', descriptionEn: 'Swagger/OpenAPI interactive docs, online debugging' },
};

const ModulePage: React.FC = () => {
  const location = useLocation();
  const moduleName = location.pathname.replace(/^\//, '');
  const info = MODULES[moduleName];
  const [lang] = useState<Lang>(() => getStoredLang());
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    if (info?.redirect) {
      window.open(info.redirect, '_blank');
      setLoading(false);
      return;
    }
    if (!info?.api) { setLoading(false); return; }
    setLoading(true);
    fetch(info.api)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(d => { setData(d); setError(null); })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [moduleName]);

  if (!info) {
    return <div style={{ padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>{lang === 'zh' ? '未知模块' : 'Unknown Module'}</div>;
  }

  const title = lang === 'zh' ? (info.titleZh || info.titleEn) : (info.titleEn || info.titleZh);
  const desc = lang === 'zh' ? info.descriptionZh : info.descriptionEn;

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        {title && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h1>}
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{desc}</p>
        {info.api && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            API: <code style={{ color: 'var(--primary)' }}>GET {info.api}</code>
          </p>
        )}
      </div>

      {loading && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.common.loading}</div>}

      {error && !loading && (
        <div style={{ padding: 16, background: 'var(--danger-light)', borderRadius: 8, border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
          ⚠️ {error}
          <div style={{ marginTop: 8 }}>
            <a href={info.api} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
              {lang === 'zh' ? '直接在浏览器查看 →' : 'Open in browser →'}
            </a>
          </div>
        </div>
      )}

      {data && !loading && (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{lang === 'zh' ? 'API 响应' : 'API Response'}</span>
            <button onClick={() => setData(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>{t.common.close}</button>
          </div>
          <pre style={{ margin: 0, padding: 16, fontSize: 12, color: 'var(--text-main)', overflow: 'auto', maxHeight: 500, lineHeight: 1.5 }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {!info.api && !info.redirect && !loading && (
        <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13 }}>
          📋 {lang === 'zh' ? '可调 API 直接使用' : 'Use the API directly'}
        </div>
      )}

      {info.api && !loading && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={() => window.open(info.api, '_blank')} style={{
            padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6,
            fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}>{lang === 'zh' ? '🔍 查看原始数据' : '🔍 View Raw Data'}</button>
          <button onClick={() => window.open('/docs', '_blank')} style={{
            padding: '8px 16px', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border)',
            borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}>{lang === 'zh' ? '📚 API 文档' : '📚 API Docs'}</button>
        </div>
      )}
    </div>
  );
};

export default ModulePage;
