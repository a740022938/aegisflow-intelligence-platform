import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, PageHeader, SectionCard, StatusBadge } from '../components/ui';
import WorkspaceGrid from '../layout/WorkspaceGrid';
import { clearLayout, loadLayout, saveLayout, type LayoutConfig } from '../layout/layoutStorage';
import { useResponsiveLayoutMode } from '../hooks/useResponsiveLayoutMode';
import '../components/ui/shared.css';
import './Knowledge.css';
import { roleClass } from '../theme/colorRoles';

const CATEGORIES = ['failure_postmortem', 'model_conclusion', 'task_experience', 'general_note'];
const CATEGORY_LABELS: Record<string, string> = {
  failure_postmortem: '失败复盘',
  model_conclusion: '模型结论',
  task_experience: '任务经验',
  general_note: '通用笔记',
};
const CATEGORY_COLORS: Record<string, string> = {
  failure_postmortem: '#ef4444',
  model_conclusion: '#3b82f6',
  task_experience: '#10b981',
  general_note: '#6b7280',
};

const LAYOUT_KEY = 'knowledge';

const DEFAULT_LAYOUTS: LayoutConfig = {
  lg: [
    { i: 'filter_bar', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'entry_list', x: 0, y: 2, w: 7, h: 12, minW: 4, minH: 6 },
    { i: 'entry_detail', x: 7, y: 2, w: 5, h: 12, minW: 3, minH: 6 },
    { i: 'category_stats', x: 0, y: 14, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'recent_activity', x: 4, y: 14, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'quick_actions', x: 8, y: 14, w: 4, h: 5, minW: 3, minH: 4 },
  ],
  md: [
    { i: 'filter_bar', x: 0, y: 0, w: 8, h: 2, minW: 4, minH: 2 },
    { i: 'entry_list', x: 0, y: 2, w: 5, h: 12, minW: 3, minH: 6 },
    { i: 'entry_detail', x: 5, y: 2, w: 3, h: 12, minW: 2, minH: 6 },
    { i: 'category_stats', x: 0, y: 14, w: 3, h: 5, minW: 2, minH: 4 },
    { i: 'recent_activity', x: 3, y: 14, w: 3, h: 5, minW: 2, minH: 4 },
    { i: 'quick_actions', x: 6, y: 14, w: 2, h: 5, minW: 2, minH: 4 },
  ],
  sm: [
    { i: 'filter_bar', x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'entry_list', x: 0, y: 3, w: 1, h: 10, minW: 1, minH: 6 },
    { i: 'entry_detail', x: 0, y: 13, w: 1, h: 10, minW: 1, minH: 6 },
    { i: 'category_stats', x: 0, y: 23, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'recent_activity', x: 0, y: 29, w: 1, h: 6, minW: 1, minH: 4 },
    { i: 'quick_actions', x: 0, y: 35, w: 1, h: 5, minW: 1, minH: 4 },
  ],
};

interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  source_type: string;
  source_id: string;
  summary: string;
  problem: string;
  resolution: string;
  conclusion: string;
  recommendation: string;
  tags_json: string;
  created_at: string;
  updated_at: string;
  links?: any[];
}

const API = import.meta.env.VITE_API_URL || '';

async function fetchAPI(path: string, options?: any) {
  const res = await fetch(`${API}${path}`, options);
  return res.json();
}

export default function KnowledgePage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [msg, setMsg] = useState('');
  const { contentRef, contentWidth, canUseLayoutEditor, shouldUseLayoutEditor, layoutEdit, setLayoutEdit, toggleEdit, layoutMode } = useResponsiveLayoutMode();
  const [layouts, setLayouts] = useState<LayoutConfig>(DEFAULT_LAYOUTS);
  const [form, setForm] = useState({
    title: '',
    category: 'general_note',
    source_type: 'general',
    source_id: '',
    summary: '',
    problem: '',
    resolution: '',
    conclusion: '',
    recommendation: '',
    tags: '',
  });

  // Load saved layout
  useEffect(() => {
    const saved = loadLayout(LAYOUT_KEY);
    if (saved) {
      setLayouts(saved);
    }
  }, []);

  // Save layout on change (only when in edit mode and meets threshold)
  useEffect(() => {
    if (layoutEdit && canUseLayoutEditor) saveLayout(LAYOUT_KEY, layouts);
  }, [layouts, layoutEdit, canUseLayoutEditor]);

  async function loadEntries() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (category) q.set('category', category);
      if (filter) q.set('keyword', filter);
      const data = await fetchAPI(`/api/knowledge?${q}`);
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }

  useEffect(() => { loadEntries(); }, [category]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    const data = await fetchAPI('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (data.ok) {
      setMsg('知识条目已创建');
      setShowCreate(false);
      setForm({ title: '', category: 'general_note', source_type: 'general', source_id: '', summary: '', problem: '', resolution: '', conclusion: '', recommendation: '', tags: '' });
      loadEntries();
    } else {
      setMsg('创建失败: ' + (data.error || '未知错误'));
    }
  }

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    CATEGORIES.forEach(c => stats[c] = 0);
    entries.forEach(e => {
      if (stats[e.category] !== undefined) stats[e.category]++;
    });
    return stats;
  }, [entries]);

  // Recent activity (last 5)
  const recentActivity = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [entries]);

  // Cards definition
  const cards = useMemo(() => [
    {
      id: 'filter_bar',
      content: (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', height: '100%' }}>
          <input
            placeholder="搜索关键词..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadEntries()}
            style={{ flex: 1, minWidth: '200px', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
          />
          <button onClick={loadEntries} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)' }}>搜索</button>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setCategory('')} style={{ padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', background: !category ? 'var(--role-knowledge)' : 'var(--bg-elevated)', color: !category ? '#fff' : 'var(--text-secondary)' }}>全部</button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '6px 12px', border: '1px solid var(--border-light)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                background: category === cat ? CATEGORY_COLORS[cat] : 'var(--bg-elevated)',
                color: category === cat ? '#fff' : 'var(--text-secondary)',
              }}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'entry_list',
      content: (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          {loading ? (
            <EmptyState title="加载中" description="正在获取知识条目..." icon="⏳" />
          ) : entries.length === 0 ? (
            <EmptyState title="暂无知识条目" description='可点击"新增知识"创建第一条记录。' icon="📚" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entries.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => setSelected(entry)}
                  style={{
                    padding: '16px', background: selected?.id === entry.id ? 'rgba(96,165,250,0.12)' : 'var(--bg-elevated)',
                    border: `1px solid ${selected?.id === entry.id ? 'rgba(96,165,250,0.55)' : 'var(--border)'}`,
                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '4px',
                      background: CATEGORY_COLORS[entry.category] + '20', color: CATEGORY_COLORS[entry.category],
                    }}>
                      {CATEGORY_LABELS[entry.category] || entry.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {entry.created_at ? entry.created_at.slice(0, 10) : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{entry.title}</div>
                  <StatusBadge s={entry.source_type || 'general'} size="xs" />
                  {entry.summary && <div style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.summary}</div>}
                  {entry.tags_json && JSON.parse(entry.tags_json).length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {JSON.parse(entry.tags_json).slice(0, 4).map((tag: string) => (
                        <span key={tag} style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-app)', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid var(--border)' }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'entry_detail',
      content: selected ? (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{
              fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px',
              background: CATEGORY_COLORS[selected.category] + '20', color: CATEGORY_COLORS[selected.category],
            }}>
              {CATEGORY_LABELS[selected.category] || selected.category}
            </span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px', color: 'var(--text-primary)' }}>{selected.title}</h2>
          {selected.source_type && selected.source_id && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              来源: <StatusBadge s={selected.source_type} size="xs" /> / {selected.source_id}
            </div>
          )}

          {[
            { label: '摘要', value: selected.summary },
            { label: '问题', value: selected.problem },
            { label: '处理过程', value: selected.resolution },
            { label: '结论', value: selected.conclusion },
            { label: '建议', value: selected.recommendation },
          ].map(({ label, value }) => value ? (
            <div key={label} style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{value}</div>
            </div>
          ) : null)}

          {selected.tags_json && JSON.parse(selected.tags_json).length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>标签</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {JSON.parse(selected.tags_json).map((tag: string) => (
                  <span key={tag} style={{ fontSize: '12px', padding: '3px 8px', background: 'rgba(34,211,238,0.14)', color: '#67e8f9', borderRadius: '4px', border: '1px solid rgba(34,211,238,0.35)' }}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="选择条目" description="点击左侧列表查看知识详情" icon="📖" />
      ),
    },
    {
      id: 'category_stats',
      content: (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>分类统计</div>
          {CATEGORIES.map(cat => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLORS[cat] }} />
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{CATEGORY_LABELS[cat]}</span>
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: CATEGORY_COLORS[cat] }}>{categoryStats[cat] || 0}</span>
            </div>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>总计</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{entries.length}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'recent_activity',
      content: (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>最近更新</div>
          {recentActivity.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px 0' }}>暂无活动</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentActivity.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => setSelected(entry)}
                  style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{entry.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>{entry.updated_at?.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'quick_actions',
      content: (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>快捷操作</div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '12px 16px', background: 'linear-gradient(120deg, var(--role-data), var(--role-knowledge))',
              color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
            }}
          >
            + 新增知识
          </button>
          <button
            onClick={loadEntries}
            style={{
              padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
              borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)',
            }}
          >
            🔄 刷新列表
          </button>
          <button
            onClick={() => { setFilter(''); setCategory(''); loadEntries(); }}
            style={{
              padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
              borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)',
            }}
          >
            ✕ 清除筛选
          </button>
        </div>
      ),
    },
  ], [entries, loading, filter, category, selected, categoryStats, recentActivity]);

  return (
    <div className="knowledge-page page-root" ref={contentRef}>
      <PageHeader
        title="知识中心"
        subtitle="任务经验 · 失败复盘 · 模型结论 · 处理建议"
        actions={(
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={toggleEdit}
              disabled={!canUseLayoutEditor}
              title={!canUseLayoutEditor ? '请在大屏宽度下编辑布局' : ''}
              style={{
                padding: '10px 18px', background: layoutEdit ? 'rgba(34,211,238,0.15)' : 'var(--bg-elevated)',
                border: `1px solid ${layoutEdit ? 'rgba(34,211,238,0.5)' : 'var(--border-light)'}`,
                borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: layoutEdit ? '#22d3ee' : 'var(--text-main)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {layoutEdit ? '✓ 完成编辑' : '✎ 编辑布局'}
            </button>
            {layoutEdit && (
              <button
                onClick={() => { setLayouts(DEFAULT_LAYOUTS); clearLayout(LAYOUT_KEY); }}
                style={{
                  padding: '10px 18px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)',
                }}
              >
                ⟲ 恢复默认
              </button>
            )}
          </div>
        )}
      />

      {msg && (
        <div style={{ padding: '10px 16px', background: 'rgba(34,197,94,0.14)', color: '#86efac', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          <StatusBadge s="success" /> {msg}
        </div>
      )}

      {loading && entries.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : shouldUseLayoutEditor ? (
        <div>
          <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
            layoutMode: {layoutMode} · contentWidth: {Math.round(contentWidth)}px
          </div>
          <WorkspaceGrid editable={layoutEdit} layouts={layouts} cards={cards} onChange={setLayouts} />
        </div>
      ) : (
        <div>
          <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
            layoutMode: {layoutMode} · contentWidth: {Math.round(contentWidth)}px
          </div>
          <div className="responsive-card-grid">
            {cards.map((c: any) => (
              <div key={c.id} style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                {c.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '32px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>新增知识条目</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>标题 *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: 'var(--bg-elevated)', color: 'var(--text-main)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>分类 *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-elevated)', color: 'var(--text-main)' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>来源类型</label>
                  <select value={form.source_type} onChange={e => setForm({ ...form, source_type: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-elevated)', color: 'var(--text-main)' }}>
                    <option value="general">通用</option>
                    <option value="task">任务</option>
                    <option value="model">模型</option>
                    <option value="experiment">实验</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>摘要</label>
                <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', background: 'var(--bg-elevated)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>问题</label>
                <textarea value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} rows={2}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', background: 'var(--bg-elevated)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>处理过程</label>
                <textarea value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', background: 'var(--bg-elevated)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>结论</label>
                <textarea value={form.conclusion} onChange={e => setForm({ ...form, conclusion: e.target.value })} rows={2}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', background: 'var(--bg-elevated)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>建议</label>
                <textarea value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} rows={2}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', background: 'var(--bg-elevated)', color: 'var(--text-main)' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>标签（逗号分隔）</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="yolo, training, bug"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: 'var(--bg-elevated)', color: 'var(--text-main)' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '10px 20px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-main)' }}>取消</button>
                <button type="submit" style={{ padding: '10px 24px', background: 'var(--role-knowledge)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>创建</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
