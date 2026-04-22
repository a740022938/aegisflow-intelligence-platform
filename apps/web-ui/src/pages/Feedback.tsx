import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState, PageHeader, SectionCard, StatusBadge } from '../components/ui';
import '../components/ui/shared.css';
import './Feedback.css';

interface FeedbackBatch {
  id: string;
  name: string;
  source: 'failed_case' | 'low_confidence' | 'manual_flag';
  source_ref: string;
  trigger: 'failed_case' | 'low_confidence' | 'manual_flag';
  status: string;
  item_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface FeedbackItem {
  id: string;
  batch_id: string;
  file_path: string;
  reason: string;
  confidence: number;
  source_model: string;
  source_dataset: string;
  source_ref: string;
  status: string;
  created_at: string;
}

const FEEDBACK_TYPES = ['failed_case', 'low_confidence', 'manual_flag'] as const;

function fmtTime(v?: string) {
  if (!v) return '暂无记录';
  try {
    return new Date(v).toLocaleString('zh-CN');
  } catch {
    return v;
  }
}

async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`http://127.0.0.1:8787${path}`, init);
  return res.json();
}

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [batches, setBatches] = useState<FeedbackBatch[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selected, setSelected] = useState<(FeedbackBatch & { items: FeedbackItem[] }) | null>(null);
  const [lastExportPath, setLastExportPath] = useState('');

  const [sourceFilter, setSourceFilter] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');

  const [name, setName] = useState('');
  const [source, setSource] = useState<'failed_case' | 'low_confidence' | 'manual_flag'>('failed_case');
  const [trigger, setTrigger] = useState<'failed_case' | 'low_confidence' | 'manual_flag'>('failed_case');
  const [sourceRef, setSourceRef] = useState('');
  const [notes, setNotes] = useState('');

  const summary = useMemo(() => {
    const total = batches.length;
    const bySource: Record<string, number> = { failed_case: 0, low_confidence: 0, manual_flag: 0 };
    for (const b of batches) {
      bySource[b.source] = (bySource[b.source] || 0) + 1;
    }
    return { total, bySource };
  }, [batches]);

  async function loadList() {
    setLoading(true);
    setError('');
    try {
      const q = new URLSearchParams();
      if (sourceFilter) q.set('source', sourceFilter);
      if (triggerFilter) q.set('trigger', triggerFilter);
      q.set('limit', '100');
      const res: any = await api(`/api/feedback-batches?${q.toString()}`);
      if (!res.ok) {
        setError(res.error || '回流池列表加载失败');
        setBatches([]);
        return;
      }
      setBatches(res.batches || []);
      if (!selectedId && res.batches?.length) {
        setSelectedId(res.batches[0].id);
      }
    } catch (e: any) {
      setError(e.message || '回流池列表加载异常');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    if (!id) {
      setSelected(null);
      return;
    }
    try {
      const res: any = await api(`/api/feedback-batches/${id}`);
      if (!res.ok) {
        setError(res.error || '回流池详情加载失败');
        setSelected(null);
        return;
      }
      setSelected(res.batch || null);
    } catch (e: any) {
      setError(e.message || '回流池详情加载异常');
      setSelected(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const res: any = await api('/api/feedback-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          source,
          trigger,
          source_ref: sourceRef,
          notes,
        }),
      });
      if (!res.ok) {
        setError(res.error || '回流登记失败');
        return;
      }
      setNotice(`回流登记成功: ${res.batch.id}`);
      setName('');
      setSourceRef('');
      setNotes('');
      await loadList();
      if (res.batch?.id) {
        setSelectedId(res.batch.id);
      }
    } catch (e: any) {
      setError(e.message || '回流登记异常');
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    if (!selected?.id) return;
    setExporting(true);
    setError('');
    setNotice('');
    try {
      const res: any = await api(`/api/feedback-batches/${selected.id}/export`, { method: 'POST' });
      if (!res.ok) {
        setError(res.error || '导出失败');
        return;
      }
      setLastExportPath(res.manifest_path || '');
      setNotice(`导出成功: ${res.manifest_path || 'manifest 已返回'}`);
      await loadDetail(selected.id);
      await loadList();
    } catch (e: any) {
      setError(e.message || '导出异常');
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    loadList();
  }, [sourceFilter, triggerFilter]);

  useEffect(() => {
    loadDetail(selectedId);
  }, [selectedId]);

  return (
    <div className="feedback-page page-root">
      <PageHeader
        title="自动回流 v1（v6.3.0）"
        subtitle="回流池最小演示：列表、详情、source/trigger 过滤、导出 manifest"
      />

      <SectionCard title="回流概览">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
          <div style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 8 }}>总批次数: <b>{summary.total}</b></div>
          <div style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 8 }}>失败案例: <b>{summary.bySource.failed_case}</b></div>
          <div style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 8 }}>低置信度: <b>{summary.bySource.low_confidence}</b></div>
          <div style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 8 }}>手动标志: <b>{summary.bySource.manual_flag}</b></div>
        </div>
      </SectionCard>

      <SectionCard title="回流登记">
      <form onSubmit={handleCreate} style={{ display: 'grid', gap: 10 }}>
        <div style={{ fontWeight: 600 }}>回流登记</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
          <input className="ui-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="批次标题（必填）" required />
          <select className="ui-select" value={source} onChange={(e) => setSource(e.target.value as any)}>
            {FEEDBACK_TYPES.map((s) => <option value={s} key={s}>{s}</option>)}
          </select>
          <select className="ui-select" value={trigger} onChange={(e) => setTrigger(e.target.value as any)}>
            {FEEDBACK_TYPES.map((t) => <option value={t} key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
          <input className="ui-input" value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} placeholder="source_ref（如任务/评估id）" />
          <input className="ui-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="备注（可选）" />
          <button className="ui-btn ui-btn-primary" type="submit" disabled={saving}>{saving ? '登记中...' : '登记回流'}</button>
        </div>
      </form>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
        <SectionCard title="回流池列表" style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>
              source 过滤:
              <select className="ui-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ width: '100%' }}>
                <option value="">全部</option>
                {FEEDBACK_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              trigger 过滤:
              <select className="ui-select" value={triggerFilter} onChange={(e) => setTriggerFilter(e.target.value)} style={{ width: '100%' }}>
                <option value="">全部</option>
                {FEEDBACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          {loading ? <EmptyState title="加载中" description="正在获取回流批次..." icon="⏳" /> : batches.length === 0 ? <EmptyState title="暂无回流批次" description='可通过上方"回流登记"创建首个批次。' icon="📭" /> : (
            <div style={{ display: 'grid', gap: 8, maxHeight: 520, overflow: 'auto' }}>
              {batches.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={`feedback-batch-item ${selectedId === b.id ? 'selected' : ''}`}
                >
                  <div className="feedback-batch-name">{b.name}</div>
                  <div className="feedback-batch-meta">{b.source} / {b.trigger}</div>
                  <div className="feedback-batch-meta">items={b.item_count} · <StatusBadge s={b.status} size="xs" /></div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="详情" style={{ minHeight: 280 }}>
          {!selected ? <EmptyState title="未选择回流批次" description="请从左侧列表选择一个批次查看详情。" icon="👈" /> : (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    source={selected.source} · trigger={selected.trigger} · source_ref={selected.source_ref || '未绑定'}
                  </div>
                </div>
                <button className="ui-btn ui-btn-primary" type="button" onClick={handleExport} disabled={exporting}>
                  {exporting ? '导出中...' : '导出 manifest'}
                </button>
              </div>

              <div className="feedback-detail-meta">
                创建: {fmtTime(selected.created_at)} · 更新: {fmtTime(selected.updated_at)} · 状态: <StatusBadge s={selected.status} size="xs" />
              </div>

              <div className="feedback-detail-notes">{selected.notes || '暂无备注'}</div>

              <div className="feedback-items-header">Items ({selected.items?.length || 0})</div>
              {(selected.items?.length || 0) === 0 ? <EmptyState title="暂无回流项" description="该批次还未写入具体样本。" icon="📂" /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="feedback-table">
                    <thead>
                      <tr>
                        <th>file_path</th>
                        <th>reason</th>
                        <th>confidence</th>
                        <th>source_model</th>
                        <th>source_dataset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.file_path || '暂无记录'}</td>
                          <td>{item.reason || '暂无记录'}</td>
                          <td>{item.confidence ?? 0}</td>
                          <td>{item.source_model || '暂无记录'}</td>
                          <td>{item.source_dataset || '暂无记录'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {error ? <div className="feedback-alert-error"><StatusBadge s="failed" /> {error}</div> : null}
      {notice ? <div className="feedback-alert-success"><StatusBadge s="success" /> {notice}</div> : null}
      {lastExportPath ? <div className="feedback-export-path">最近导出: {lastExportPath}</div> : null}
    </div>
  );
}
