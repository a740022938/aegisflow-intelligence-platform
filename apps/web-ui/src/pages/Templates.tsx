import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, Template } from '../services/api';
import { StatusBadge, PageHeader, SectionCard, EmptyState } from '../components/ui';
import '../components/ui/shared.css';
import './Templates.css';

type TplTab = 'overview' | 'steps' | 'schema' | 'raw';

function TplListItem({ tpl, selected, onClick }: { tpl: Template; selected: boolean; onClick: () => void }) {
  return (
    <div className={`tpl-list-item${selected ? ' selected' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
        <span className="tpl-list-name">{tpl.name}</span>
        <StatusBadge s={tpl.status} />
      </div>
      <div className="tpl-list-sub">{tpl.code} · {tpl.category} · v{tpl.version}</div>
      <div className="tpl-list-sub">{tpl.is_builtin ? '内置模板' : '自定义'} · {new Date(tpl.updated_at).toLocaleString()}</div>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TplTab>('overview');
  const [keyword, setKeyword] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editCat, setEditCat] = useState('misc');
  const [editVersion, setEditVersion] = useState('0.1.0');
  const [editStatus, setEditStatus] = useState('draft');
  const [editDesc, setEditDesc] = useState('');
  const [defText, setDefText] = useState('{}');
  const [schemaText, setSchemaText] = useState('{}');
  const [defaultInputText, setDefaultInputText] = useState('{}');
  const [createTitle, setCreateTitle] = useState('');

  const selected = useMemo(() => templates.find(t => t.id === selectedId) || null, [templates, selectedId]);

  const fillEditor = (t: Template) => {
    setEditName(t.name);
    setEditCode(t.code);
    setEditCat(t.category);
    setEditVersion(t.version);
    setEditStatus(t.status);
    setEditDesc(t.description || '');
    setDefText(JSON.stringify(t.definition_json || {}, null, 2));
    setSchemaText(JSON.stringify(t.input_schema_json || {}, null, 2));
    setDefaultInputText(JSON.stringify(t.default_input_json || {}, null, 2));
    setCreateTitle('');
  };

  const loadTemplates = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiService.getTemplates({ keyword: keyword || undefined, category: catFilter || undefined, status: statusFilter || undefined });
      if (!res.ok) throw new Error(res.error || '加载失败');
      setTemplates(res.templates);
      if (res.templates.length > 0) {
        const saved = localStorage.getItem('agi_factory_tpl_sel');
        const id = (saved && res.templates.find(t => t.id === saved)) ? saved : res.templates[0].id;
        setSelectedId(id);
        const t = res.templates.find(t => t.id === id);
        if (t) fillEditor(t);
      } else setSelectedId(null);
    } catch (e: any) { setError(e.message || '加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTemplates(); }, [keyword, catFilter, statusFilter]);

  const handleSelect = (t: Template) => {
    setSelectedId(t.id);
    localStorage.setItem('agi_factory_tpl_sel', t.id);
    fillEditor(t);
    setTab('overview');
  };

  const parseJson = () => {
    try {
      return { definition_json: JSON.parse(defText), input_schema_json: JSON.parse(schemaText), default_input_json: JSON.parse(defaultInputText) };
    } catch (e: any) { throw new Error('JSON 解析失败：' + e.message); }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const jsonFields = parseJson();
      const res = await apiService.updateTemplate(selected.id, { name: editName.trim(), category: editCat, version: editVersion.trim(), status: editStatus, description: editDesc, ...jsonFields });
      if (!res.ok || !res.template) throw new Error(res.error || '保存失败');
      setSuccess('模板保存成功');
      await loadTemplates();
      if (res.template) { setSelectedId(res.template.id); localStorage.setItem('agi_factory_tpl_sel', res.template.id); fillEditor(res.template); }
    } catch (e: any) { setError(e.message || '保存失败'); }
    finally { setSaving(false); }
  };

  const handleClone = async () => {
    if (!selected) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await apiService.cloneTemplate(selected.id);
      if (!res.ok || !res.template) throw new Error(res.error || '克隆失败');
      setSuccess('模板克隆成功');
      await loadTemplates();
      if (res.template) { setSelectedId(res.template.id); fillEditor(res.template); }
    } catch (e: any) { setError(e.message || '克隆失败'); }
    finally { setSaving(false); }
  };

  const createTask = async (execute: boolean) => {
    if (!selected) return;
    setCreatingTask(true); setError(null); setSuccess(null);
    try {
      const res = await apiService.createTaskFromTemplate(selected.id, { title: createTitle.trim() || undefined, input_payload: JSON.parse(defaultInputText), execute_immediately: execute });
      if (!res.ok || !res.task) throw new Error(res.error || '创建任务失败');
      setSuccess(execute ? '模板任务已创建并执行' : '模板任务创建成功');
      localStorage.setItem('agi_factory_selected_task_id', res.task.id);
      navigate('/tasks');
    } catch (e: any) { setError(e.message || '创建任务失败'); }
    finally { setCreatingTask(false); }
  };

  const filtered = useMemo(() => [...templates], [templates]);

  const TABS: { key: TplTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'steps', label: 'Steps' },
    { key: 'schema', label: 'Schema' },
    { key: 'raw', label: 'Raw JSON' },
  ];

  return (
    <div className="page-root">
      <PageHeader
        title="模板中心"
        subtitle="管理任务模板，快速复用并创建执行任务"
        actions={<button className="ui-btn ui-btn-primary" onClick={() => { const code = 'custom_' + Date.now().toString().slice(-6); apiService.createTemplate({ name: '新模板', code, category: 'misc', version: '0.1.0', status: 'draft', description: '', definition_json: { title_template: '', description: '', steps: [] }, input_schema_json: { type: 'object', properties: {} }, default_input_json: {} }).then(r => { if (r.ok && r.template) { loadTemplates().then(() => { setSelectedId(r.template!.id); fillEditor(r.template!); setSuccess('新模板已创建'); }); } }); }}>+ 新建模板</button>}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left */}
        <div className="tpl-left" style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <SectionCard title="筛选">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="ui-input" placeholder="搜索名称/编码..." value={keyword} onChange={e => setKeyword(e.target.value)} />
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="ui-select" style={{ flex: 1 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                  <option value="">全部分类</option>
                  {['dataset','training','evaluation','misc'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="ui-select" style={{ flex: 1 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">全部状态</option>
                  {['active','disabled','draft'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>
          <SectionCard title={`模板列表 (${templates.length})`} actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={loadTemplates}>↻</button>}>
            <div style={{ maxHeight: 580, overflowY: 'auto' }}>
              {loading && <EmptyState message="加载中..." />}
              {!loading && templates.length === 0 && <EmptyState icon="📋" message="无模板" />}
              {!loading && templates.map(t => <TplListItem key={t.id} tpl={t} selected={selectedId === t.id} onClick={() => handleSelect(t)} />)}
            </div>
          </SectionCard>
        </div>

        {/* Right */}
        <div className="tpl-right" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {error && <div className="ui-flash ui-flash-err">{error} <button className="ui-btn ui-btn-ghost ui-btn-xs" style={{ marginLeft: 8 }} onClick={() => setError(null)}>×</button></div>}
          {success && <div className="ui-flash ui-flash-ok">{success}</div>}

          {selected ? (
            <>
              {/* Header */}
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{selected.code} · {selected.category} · v{selected.version}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={handleClone} disabled={saving}>Clone</button>
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={handleSave} disabled={saving || selected.is_builtin}>{saving ? '保存中...' : 'Save'}</button>
                    <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => createTask(false)} disabled={creatingTask}>Create Task</button>
                    <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => createTask(true)} disabled={creatingTask}>{creatingTask ? '启动中...' : 'Create & Execute'}</button>
                  </div>
                </div>
                {selected.is_builtin && (
                  <div className="tpl-builtin-note">内置模板为只读，如需修改请先 Clone</div>
                )}
              </SectionCard>

              {/* Tabs */}
              <SectionCard>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
                  {TABS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      style={{
                        padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
                        background: tab === t.key ? 'var(--primary)' : 'var(--bg-app)',
                        color: tab === t.key ? '#fff' : 'var(--text-secondary)',
                        transition: 'background var(--t-fast)',
                      }}
                    >{t.label}</button>
                  ))}
                  <button className="ui-btn ui-btn-ghost ui-btn-sm" style={{ marginLeft: 4 }} onClick={() => { navigator.clipboard.writeText(JSON.stringify(selected, null, 2)).then(() => setSuccess('JSON 已复制')).catch(() => setError('复制失败')); }}>Copy JSON</button>
                </div>

                {tab === 'overview' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group"><label className="form-label">名称</label><input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} disabled={selected.is_builtin} /></div>
                      <div className="form-group"><label className="form-label">编码</label><input className="form-input" value={editCode} disabled /></div>
                      <div className="form-group"><label className="form-label">分类</label><select className="form-input" value={editCat} onChange={e => setEditCat(e.target.value)} disabled={selected.is_builtin}>{['dataset','training','evaluation','misc'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                      <div className="form-group"><label className="form-label">版本</label><input className="form-input" value={editVersion} onChange={e => setEditVersion(e.target.value)} disabled={selected.is_builtin} /></div>
                      <div className="form-group"><label className="form-label">状态</label><select className="form-input" value={editStatus} onChange={e => setEditStatus(e.target.value)} disabled={selected.is_builtin}>{['active','disabled','draft'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                      <div className="form-group"><label className="form-label">任务标题（可选）</label><input className="form-input" value={createTitle} onChange={e => setCreateTitle(e.target.value)} placeholder="留空则使用 title_template" /></div>
                    </div>
                    <div className="form-group"><label className="form-label">描述</label><textarea className="form-input" rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} disabled={selected.is_builtin} /></div>
                    <div className="form-group"><label className="form-label">默认输入（JSON）</label><textarea className="form-input" rows={6} value={defaultInputText} onChange={e => setDefaultInputText(e.target.value)} disabled={selected.is_builtin} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} /></div>
                  </div>
                )}

                {tab === 'steps' && (
                  <>
                    <div className="form-group"><label className="form-label">definition_json</label><textarea className="form-input" rows={16} value={defText} onChange={e => setDefText(e.target.value)} disabled={selected.is_builtin} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} /></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>步骤预览</div>
                    {Array.isArray(selected.definition_json?.steps) && selected.definition_json.steps.length > 0 ? (
                      <div className="ui-table-wrap">
                        <table className="ui-table">
                          <thead><tr><th>#</th><th>Name</th><th>Type</th><th>Action</th></tr></thead>
                          <tbody>{selected.definition_json.steps.map((s: any, i: number) => (
                            <tr key={i}><td>{i + 1}</td><td>{s.name || '—'}</td><td>{s.type || '—'}</td><td>{s.action || '—'}</td></tr>
                          ))}</tbody>
                        </table>
                      </div>
                    ) : <EmptyState icon="⚙" message="当前模板暂无 steps" />}
                  </>
                )}

                {tab === 'schema' && (
                  <div className="form-group"><label className="form-label">input_schema_json</label><textarea className="form-input" rows={18} value={schemaText} onChange={e => setSchemaText(e.target.value)} disabled={selected.is_builtin} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} /></div>
                )}

                {tab === 'raw' && (
                  <pre className="json-pre">{JSON.stringify(selected, null, 2)}</pre>
                )}
              </SectionCard>
            </>
          ) : (
            <SectionCard>
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, opacity: 0.4, marginBottom: 8 }}>📋</div>
                从左侧选择一个模板查看详情
              </div>
            </SectionCard>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
