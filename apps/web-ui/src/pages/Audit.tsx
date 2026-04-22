// v4.9.0 — Audit Log Console
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PageHeader, SectionCard, EmptyState, InfoTable, LineagePanel } from '../components/ui';
import '../components/ui/shared.css';
import './Audit.css';

const API = '/api';

const CATEGORY_COLORS: Record<string, string> = {
  promotion: '#F59E0B', release: '#8B5CF6', system: '#6B7280',
  backup: '#10B981', experiment: '#3B82F6', evaluation: '#14B8A6',
  workflow: '#0EA5E9', training: '#6366F1',
};

const ACTION_LABELS: Record<string, string> = {
  promote_to_candidate: '⬆ 晋升候选',
  approve_promotion: '✅ 批准晋升',
  reject_promotion: '❌ 拒绝晋升',
  seal_release: '🔒 封存发布',
  manifest_created: '📋 创建清单',
  release_notes_created: '📝 创建发布说明',
  backup_created: '💾 创建备份',
};

function fmtTs(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('zh-CN');
}

function parseDetail(raw: string | null): any {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return { raw }; }
}

export default function Audit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? `?category=${filter}` : '?limit=100';
      const r = await fetch(`${API}/audit${params}`);
      const d = await r.json();
      setLogs(d.logs || []);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Build lineage from detail_json
  const buildChain = (log: any) => {
    const d = parseDetail(log.detail_json);
    const chain: any[] = [];
    if (d.artifact_id) chain.push({ type: 'artifact', id: d.artifact_id, label: 'Artifact', status: undefined });
    if (d.model_id) chain.push({ type: 'model', id: d.model_id, label: 'Model', status: undefined });
    if (d.approval_id) chain.push({ type: 'approval', id: d.approval_id, label: 'Approval', status: undefined });
    if (d.release_id) chain.push({ type: 'artifact', id: d.release_id, label: '🔒 Release', status: 'sealed' });
    chain.push({ type: 'audit', id: log.id, label: ACTION_LABELS[log.action] || log.action, status: log.result });
    return chain;
  };

  return (
    <div className="page-root">
      <PageHeader
        title="审计日志"
        subtitle={`${logs.length} 条记录`}
        actions={
          <div className="audit-actions">
            <select className="ui-select audit-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">全部类别</option>
              <option value="promotion">晋升</option>
              <option value="release">发布</option>
              <option value="system">系统</option>
              <option value="backup">备份</option>
            </select>
            <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={fetchLogs}>↻</button>
          </div>
        }
      />

      <div className="audit-scroll">
        <div className="audit-main-grid">
        {/* Left: log list */}
        <div className="audit-list-panel">
          {loading && <EmptyState message="加载中..." />}
          {!loading && logs.length === 0 && <EmptyState icon="📋" message="暂无审计记录" />}
          {logs.map(log => {
            const catColor = CATEGORY_COLORS[log.category] || '#9CA3AF';
            return (
              <div key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`audit-row ${selectedLog?.id === log.id ? 'selected' : ''}`}
              >
                <div className="audit-row-head">
                  <span className="audit-row-action">
                    <span className="audit-row-dot" style={{ color: catColor }}>●</span>
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                  <span className="audit-row-time">{fmtTs(log.created_at)}</span>
                </div>
                <div className="audit-row-sub">
                  {log.target?.slice(0, 20)}... · {log.result}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: detail */}
        <div className="audit-detail-panel">
          {selectedLog ? (
            <>
              <SectionCard title="审计详情">
                <InfoTable rows={[
                  { label: '类别', value: <span className="audit-category" style={{ color: CATEGORY_COLORS[selectedLog.category] || '#9CA3AF' }}>{selectedLog.category}</span> },
                  { label: '动作', value: ACTION_LABELS[selectedLog.action] || selectedLog.action },
                  { label: '目标', value: <code className="audit-code">{selectedLog.target || '—'}</code> },
                  { label: '结果', value: <StatusBadge s={selectedLog.result} /> },
                  { label: '时间', value: fmtTs(selectedLog.created_at) },
                  ...(selectedLog.category === 'release' ? [
                    { label: '回跳', value: <Link to="/artifacts" className="audit-link">→ Artifact 页</Link> },
                  ] : []),
                ]} />
              </SectionCard>

              <SectionCard title="事件链路">
                <LineagePanel chain={buildChain(selectedLog)} />
              </SectionCard>

              <SectionCard title="Detail JSON">
                <pre className="audit-json-pre">
                  {JSON.stringify(parseDetail(selectedLog.detail_json), null, 2)}
                </pre>
              </SectionCard>
            </>
          ) : (
            <SectionCard>
              <div className="audit-empty">
                <div className="audit-empty-icon">📋</div>
                从左侧选择一条审计记录查看详情
              </div>
            </SectionCard>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

