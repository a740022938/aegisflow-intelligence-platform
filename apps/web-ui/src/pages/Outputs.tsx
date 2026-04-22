import React, { useState, useEffect } from 'react';
import { EmptyState, PageHeader, SectionCard, StatusBadge } from '../components/ui';
import '../components/ui/shared.css';
import './Outputs.css';

const TEMPLATE_TYPES = [
  { type: 'task_closure_report', label: '任务收口报告', icon: '📋', desc: '任务完成或取消后的正式记录' },
  { type: 'evaluation_report', label: '评估报告', icon: '📊', desc: '模型评估过程与结果记录' },
  { type: 'model_release_note', label: '模型发布说明', icon: '🚀', desc: '模型归档/发布时的标准说明' },
  { type: 'seal_backup_note', label: '封板/备份说明', icon: '🔒', desc: '系统封板或例行备份记录' },
];

const FIELD_TEMPLATES: Record<string, Array<{ key: string; label: string; placeholder: string; required: boolean }>> = {
  task_closure_report: [
    { key: 'task_name', label: '任务名称', placeholder: 'v6.1.0 知识中心收口', required: true },
    { key: 'task_id', label: '任务 ID', placeholder: 'task-v610-closure', required: true },
    { key: 'executed_at', label: '执行时间', placeholder: '2026-04-13T10:00:00Z', required: true },
    { key: 'executed_by', label: '执行者', placeholder: '代可行', required: true },
    { key: 'summary', label: '执行摘要', placeholder: '一句话描述任务执行情况', required: true },
    { key: 'key_results', label: '关键结果', placeholder: '- 完成了 xxx\n- 验证了 yyy', required: true },
    { key: 'recommendations', label: '后续建议', placeholder: '1. 下一步计划\n2. 待改进项', required: true },
    { key: 'status', label: '状态', placeholder: 'final / cancelled / partial', required: true },
    { key: 'version', label: '系统版本', placeholder: '6.1.0', required: false },
    { key: 'linked_artifacts', label: '关联产出物', placeholder: 'artifact-xxx, artifact-yyy', required: false },
    { key: 'linked_models', label: '关联模型', placeholder: 'model-xxx', required: false },
    { key: 'tags', label: '标签', placeholder: 'v6.1.0, 收口', required: false },
  ],
  evaluation_report: [
    { key: 'model_name', label: '模型名称', placeholder: 'ResNet18-mahjong-v1', required: true },
    { key: 'model_id', label: '模型 ID', placeholder: 'model-resnet18-v1', required: true },
    { key: 'dataset_name', label: '评估数据集', placeholder: 'synthetic_mahjong_v1', required: true },
    { key: 'evaluated_at', label: '评估时间', placeholder: '2026-04-13T10:00:00Z', required: true },
    { key: 'evaluator', label: '评估执行者', placeholder: '代可行', required: true },
    { key: 'map_score', label: 'mAP', placeholder: '0.7123', required: true },
    { key: 'precision', label: '精确率', placeholder: '0.75', required: true },
    { key: 'recall', label: '召回率', placeholder: '0.68', required: true },
    { key: 'f1_score', label: 'F1 分数', placeholder: '0.71', required: false },
    { key: 'key_findings', label: '关键发现', placeholder: '- mAP 0.71，基本可用', required: true },
    { key: 'improvement_suggestions', label: '改进建议', placeholder: '- 增加训练样本\n- 尝试 ResNet34', required: true },
    { key: 'recommendation', label: '综合建议', placeholder: 'adopt / revise / reject', required: true },
    { key: 'version', label: '系统版本', placeholder: '6.1.0', required: false },
    { key: 'notes', label: '备注', placeholder: '其他说明', required: false },
  ],
  model_release_note: [
    { key: 'model_name', label: '模型名称', placeholder: 'ResNet18-mahjong-v1', required: true },
    { key: 'model_id', label: '模型 ID', placeholder: 'model-resnet18-v1', required: true },
    { key: 'version', label: '发布版本', placeholder: '1.0', required: true },
    { key: 'release_type', label: '发布类型', placeholder: 'major / minor / patch', required: true },
    { key: 'changelog', label: '变更内容', placeholder: '- 首次发布\n- 优化了 xxx', required: true },
    { key: 'release_date', label: '发布日期', placeholder: '2026-04-13', required: true },
    { key: 'released_by', label: '发布负责人', placeholder: '代可行', required: true },
    { key: 'base_model', label: '基础模型', placeholder: 'ResNet18', required: false },
    { key: 'training_dataset', label: '训练数据集', placeholder: 'synthetic_mahjong_v1', required: false },
    { key: 'architecture', label: '架构', placeholder: 'ResNet18', required: false },
    { key: 'parameters', label: '参数量', placeholder: '11M', required: false },
    { key: 'known_issues', label: '已知问题', placeholder: '无', required: false },
    { key: 'system_version', label: '系统版本', placeholder: '6.1.0', required: false },
  ],
  seal_backup_note: [
    { key: 'version', label: '封板版本', placeholder: '6.1.0', required: true },
    { key: 'seal_type', label: '封板类型', placeholder: 'seal / backup / hotfix', required: true },
    { key: 'sealed_at', label: '封板时间', placeholder: '2026-04-13T10:00:00Z', required: true },
    { key: 'sealed_by', label: '封板执行者', placeholder: '代可行', required: true },
    { key: 'scope', label: '封板范围', placeholder: '本次封板包含 xxx 功能', required: true },
    { key: 'acceptance_checklist', label: '验收清单', placeholder: '- [x] 功能1验证通过\n- [ ] 功能2待测', required: true },
    { key: 'risks', label: '遗留风险', placeholder: '无 / 低 / 中 / 高', required: false },
    { key: 'next_steps', label: '后续计划', placeholder: '下一步版本规划', required: false },
    { key: 'system_version', label: '系统版本', placeholder: '6.1.0', required: false },
  ],
};

const API = import.meta.env.VITE_API_URL || '';

async function api(url: string, opts?: RequestInit) {
  const r = await fetch(`${API}${url}`, opts);
  return r.json();
}

export default function OutputsPage() {
  const [selectedType, setSelectedType] = useState<string>('task_closure_report');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'create' | 'list'>('create');

  const [recentOutputs, setRecentOutputs] = useState<any[]>([]);

  function handleTypeChange(type: string) {
    setSelectedType(type);
    setResult(null);
    setPreview('');
    const init: Record<string, string> = {};
    (FIELD_TEMPLATES[type] || []).forEach(f => {
      if (!f.required) return;
      if (f.key === 'executed_at' || f.key === 'evaluated_at' || f.key === 'sealed_at') {
        init[f.key] = new Date().toISOString();
      } else if (f.key === 'version' || f.key === 'system_version') {
        init[f.key] = '6.2.0';
      }
    });
    setFields(init);
  }

  useEffect(() => { handleTypeChange('task_closure_report'); }, []);

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const r = await api('/api/outputs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_type: selectedType, params: fields, save_to_file: true }),
      });
      setResult(r);
      if (r.ok) {
        setPreview(r.content || '');
      }
    } catch {
      setResult({ ok: false, error: '请求失败，请检查 API 服务' });
    }
    setLoading(false);
  }

  async function loadRecent() {
    const d = await api('/api/outputs/list?limit=20');
    setRecentOutputs(d.outputs || []);
  }

  useEffect(() => { if (tab === 'list') loadRecent(); }, [tab]);

  const ti = TEMPLATE_TYPES.find(t => t.type === selectedType)!;
  const fieldList = FIELD_TEMPLATES[selectedType] || [];

  return (
    <div className="outputs-page page-root">
      <PageHeader
        title="标准输出"
        subtitle="任务收口报告 · 评估报告 · 模型发布说明 · 封板/备份说明"
      />

      {/* Tab switch */}
      <div className="outputs-tabs">
        <button 
          onClick={() => setTab('create')} 
          className={`outputs-tab ${tab === 'create' ? 'active' : ''}`}
        >
          生成报告
        </button>
        <button 
          onClick={() => { setTab('list'); loadRecent(); }} 
          className={`outputs-tab ${tab === 'list' ? 'active' : ''}`}
        >
          已生成文件
        </button>
      </div>

      {tab === 'create' && (
        <div className="outputs-layout">
          {/* Left: type selector + fields */}
          <div>
            {/* Type selector */}
            <div className="outputs-type-grid">
              {TEMPLATE_TYPES.map(t => (
                <div 
                  key={t.type} 
                  onClick={() => handleTypeChange(t.type)} 
                  className={`outputs-type-card ${selectedType === t.type ? 'active' : ''}`}
                >
                  <div className="outputs-type-icon">{t.icon}</div>
                  <div className="outputs-type-label">{t.label}</div>
                  <div className="outputs-type-desc">{t.desc}</div>
                </div>
              ))}
            </div>

            {/* Fields */}
            <SectionCard title={`${ti.icon} ${ti.label}`}>
              <div className="outputs-section-title">必填字段与生成参数</div>
              <div className="outputs-form">
                {fieldList.map(f => (
                  <div key={f.key} className="outputs-field">
                    <label className="outputs-field-label">
                      {f.label} {f.required && <span className="required">*</span>}
                    </label>
                    {f.key.includes('summary') || f.key.includes('results') || f.key.includes('findings') || f.key.includes('suggestions') || f.key.includes('checklist') || f.key.includes('changelog') || f.key === 'conclusion' ? (
                      <textarea
                        value={fields[f.key] || ''}
                        onChange={e => setFields({ ...fields, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        rows={3}
                        className="outputs-textarea"
                      />
                    ) : (
                      <input
                        value={fields[f.key] || ''}
                        onChange={e => setFields({ ...fields, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="outputs-input"
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="outputs-generate-btn"
                >
                  {loading ? '生成中...' : `${ti.icon} 生成 ${ti.label}`}
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Right: preview */}
          <div>
            <SectionCard title="预览">
              <div className="outputs-preview-header">
                <span className="outputs-preview-label">📄 输出内容</span>
                {result?.ok && (
                  <span className="ui-status-badge ui-status-badge-success ui-status-badge-pulse">成功</span>
                )}
              </div>
              {result && !result.ok && (
                <div className="outputs-error">
                  <span className="ui-status-badge ui-status-badge-danger">失败</span> {result.error}
                </div>
              )}
              {preview ? (
                <pre className="outputs-preview-content">{preview}</pre>
              ) : (
                <EmptyState
                  title="待生成输出"
                  description='填写左侧字段后点击"生成"，这里会展示标准输出预览。'
                  icon="📄"
                />
              )}
              {result?.ok && result.file_path && (
                <div className="outputs-success">
                  📁 已保存: {result.file_path.split(/[/\\]/).pop()}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <SectionCard title={`已生成文件 (${recentOutputs.length})`}>
          {recentOutputs.length === 0 ? (
            <EmptyState title="暂无已生成文件" description='先在"生成报告"页签创建一份标准输出。' icon="📁" />
          ) : (
            <div className="outputs-file-list">
              {recentOutputs.map((o: any, i: number) => (
                <div key={i} className="outputs-file-item">
                  <div>
                    <span className="outputs-file-name">{o.filename}</span>
                    <span className="outputs-file-meta">{o.date}</span>
                    <span className="outputs-file-type">{o.type}</span>
                  </div>
                  <span className="outputs-file-size">{(o.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
