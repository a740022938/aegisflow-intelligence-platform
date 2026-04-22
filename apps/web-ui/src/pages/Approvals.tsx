// v4.4.1 — Approvals 页面（统一控制台风格）
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PageHeader, SectionCard, EmptyState, InfoTable, MainlineChainStrip, EntityLinkChips } from '../components/ui';
import '../components/ui/shared.css';

const API = '/api';

function timeAgo(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtTs(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function fmtExpires(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Math.floor((d.getTime() - Date.now()) / 1000);
  if (diff <= 0) return 'Expired';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

function ApprovalBadge({ status, policy }: { status: string; policy?: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    approved: { color: '#10B981', label: 'Approved' },
    rejected: { color: '#EF4444', label: 'Rejected' },
    expired: { color: '#8B5CF6', label: 'Expired' },
    cancelled: { color: '#6B7280', label: 'Cancelled' },
    pending: { color: '#F59E0B', label: policy === 'manual' ? 'Pending' : `Pending (${policy})` },
  };
  const c = cfg[status] || { color: '#9CA3AF', label: status };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 500,
      background: c.color + '22',
      color: c.color,
    }}>
      {c.label}
    </span>
  );
}

function PolicyBadge({ policy }: { policy?: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    manual: { color: '#F59E0B', label: 'Manual' },
    auto: { color: '#10B981', label: 'Auto' },
    timeout: { color: '#6B7280', label: 'Timeout' },
  };
  const c = cfg[policy || 'manual'] || { color: '#9CA3AF', label: policy || '—' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 6px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 500,
      background: c.color + '22',
      color: c.color,
    }}>
      {c.label}
    </span>
  );
}

export default function Approvals() {
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmOnConfirm, setConfirmOnConfirm] = useState<(() => Promise<void>) | null>(null);

  // Filters (history tab)
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStepName, setFilterStepName] = useState('');
  const [filterRange, setFilterRange] = useState<'all' | 'today' | '7d'>('all');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/approvals?status=pending&limit=100`);
      const d = await r.json();
      setApprovals(d.approvals || d.items || []);
      setTotal((d.approvals || d.items || []).length);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String((p - 1) * LIMIT) });
      if (filterStatus) params.append('status', filterStatus);
      const r = await fetch(`${API}/approvals?${params}`);
      const d = await r.json();
      let list = d.approvals || d.items || [];
      if (filterStepName) list = list.filter((a: any) => a.step_name?.toLowerCase().includes(filterStepName.toLowerCase()));
      setApprovals(list);
      setTotal(d.total || list.length);
    } catch { /* silent */ }
    setLoading(false);
  }, [filterStatus, filterStepName]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
    if (tab === 'pending') fetchPending();
    else fetchHistory(1);
  }, [tab, fetchPending, fetchHistory]);

  useEffect(() => {
    if (tab === 'history') fetchHistory(page);
  }, [page, tab, fetchHistory]);

  const toggleSelect = (id: string) => {
    const ns = new Set(selected);
    if (ns.has(id)) ns.delete(id);
    else ns.add(id);
    setSelected(ns);
  };

  const doApprove = async (id: string) => {
    setPendingAction('approve:' + id);
    try {
      await fetch(`${API}/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed_by: 'ui-operator' }),
      });
      if (tab === 'pending') fetchPending();
      else fetchHistory();
      setSelected(new Set());
    } catch { /* silent */ }
    setPendingAction('');
  };

  const doReject = async (id: string) => {
    setPendingAction('reject:' + id);
    try {
      await fetch(`${API}/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed_by: 'ui-operator', comment: 'Rejected from console' }),
      });
      if (tab === 'pending') fetchPending();
      else fetchHistory();
      setSelected(new Set());
    } catch { /* silent */ }
    setPendingAction('');
  };

  const batchApprove = () => {
    if (selected.size === 0) return;
    setConfirmMsg(`Approve ${selected.size} approval(s)?`);
    setConfirmOnConfirm(() => async () => {
      setConfirmMsg('');
      setPendingAction('batch:approve');
      for (const id of selected) {
        await fetch(`${API}/approvals/${id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewed_by: 'ui-operator' }),
        });
      }
      setPendingAction('');
      setSelected(new Set());
      if (tab === 'pending') fetchPending();
      else fetchHistory();
    });
  };

  const batchReject = () => {
    if (selected.size === 0) return;
    setConfirmMsg(`Reject ${selected.size} approval(s)?`);
    setConfirmOnConfirm(() => async () => {
      setConfirmMsg('');
      setPendingAction('batch:reject');
      for (const id of selected) {
        await fetch(`${API}/approvals/${id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewed_by: 'ui-operator', comment: 'Batch rejected' }),
        });
      }
      setPendingAction('');
      setSelected(new Set());
      if (tab === 'pending') fetchPending();
      else fetchHistory();
    });
  };

  const openDetail = (a: any) => {
    setSelectedId(a.id);
    setSelectedApproval(a);
  };

  const pendingCount = tab === 'pending' ? total : approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;
  const highRiskCount = approvals.filter((a) => (a.step_name || '').toLowerCase().includes('delete') || (a.step_name || '').toLowerCase().includes('rollback')).length;

  return (
    <div className="page-root" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Approvals"
        subtitle={tab === 'pending' ? `${total} pending` : `${total} total`}
        summaryStrip={
          <div className="page-summary-strip">
            <div className="page-summary-item">
              <div className="page-summary-label">pending</div>
              <div className="page-summary-value">{pendingCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">approved</div>
              <div className="page-summary-value">{approvedCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">rejected</div>
              <div className="page-summary-value">{rejectedCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">high risk</div>
              <div className="page-summary-value">{highRiskCount}</div>
            </div>
          </div>
        }
        actions={
          tab === 'pending' && selected.size > 0 ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ui-btn ui-btn-success ui-btn-sm" onClick={batchApprove} disabled={!!pendingAction}>
                Approve ({selected.size})
              </button>
              <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={batchReject} disabled={!!pendingAction} style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                Reject ({selected.size})
              </button>
            </div>
          ) : undefined
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Tabs */}
          <SectionCard>
            <div style={{ display: 'flex', gap: 0 }}>
              {(['pending', 'history'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setPage(1); setFilterStatus(''); setFilterStepName(''); setFilterRange('all'); }}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    border: 'none',
                    borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                    background: 'none',
                    color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {t === 'pending' ? `Pending (${pendingCount})` : 'History'}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Filters (history) */}
          {tab === 'history' && (
            <SectionCard>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select className="ui-select" style={{ width: 120 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input className="ui-input" placeholder="Filter by step name..." value={filterStepName} onChange={e => { setFilterStepName(e.target.value); setPage(1); }} style={{ width: 160 }} />
                <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => fetchHistory(1)}>Refresh</button>
              </div>
            </SectionCard>
          )}

          {/* List */}
          <SectionCard title={`${tab === 'pending' ? 'Pending' : 'History'} (${approvals.length})`} style={{ flex: 1, overflow: 'hidden' }} actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => tab === 'pending' ? fetchPending() : fetchHistory(page)}>↻</button>}>
            <div style={{ maxHeight: 460, overflowY: 'auto' }}>
              {loading && <EmptyState message="Loading..." />}
              {!loading && approvals.length === 0 && <EmptyState icon="✅" message={tab === 'pending' ? 'No pending approvals' : 'No approval history'} />}
              {!loading && approvals.map(a => (
                <div
                  key={a.id}
                  onClick={() => openDetail(a)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: selectedId === a.id ? 'var(--primary-light)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {tab === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selected.has(a.id)}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(a.id); }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-main)' }}>{a.step_name || '—'}</span>
                    </div>
                    <ApprovalBadge status={a.status} policy={a.policy_type} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginLeft: tab === 'pending' ? 24 : 0 }}>
                    <code style={{ fontSize: 10, background: 'var(--bg-app)', padding: '1px 4px', borderRadius: 3 }}>{a.resource_id?.slice(0, 8) || '—'}</code>
                    {' · '}
                    <PolicyBadge policy={a.policy_type} />
                    {' · '}
                    {timeAgo(a.created_at)}
                    {tab === 'pending' && a.expires_at && ` · expires in ${fmtExpires(a.expires_at)}`}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Pagination */}
          {tab === 'history' && total > LIMIT && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0' }}>
              <button className="ui-btn ui-btn-outline ui-btn-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{page}</span>
              <button className="ui-btn ui-btn-outline ui-btn-xs" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>

        {/* Right Panel - Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {!selectedApproval ? (
            <EmptyState icon="📝" message="Select an approval to view details" />
          ) : (
            <>
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{selectedApproval.step_name || 'Approval'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selectedApproval.id}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedApproval.status === 'pending' && (
                      <>
                        <button className="ui-btn ui-btn-success ui-btn-sm" disabled={pendingAction === 'approve:' + selectedApproval.id} onClick={() => doApprove(selectedApproval.id)}>
                          {pendingAction === 'approve:' + selectedApproval.id ? '...' : 'Approve'}
                        </button>
                        <button className="ui-btn ui-btn-outline ui-btn-sm" style={{ borderColor: '#EF4444', color: '#EF4444' }} disabled={pendingAction === 'reject:' + selectedApproval.id} onClick={() => doReject(selectedApproval.id)}>
                          {pendingAction === 'reject:' + selectedApproval.id ? '...' : 'Reject'}
                        </button>
                      </>
                    )}
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => { setSelectedId(null); setSelectedApproval(null); }}>Close</button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Approval Info">
                <InfoTable rows={[
                  { label: 'Status', value: <ApprovalBadge status={selectedApproval.status} policy={selectedApproval.policy_type} /> },
                  { label: 'Policy', value: <PolicyBadge policy={selectedApproval.policy_type} /> },
                  { label: 'Action', value: selectedApproval.action === 'promotion_review' ? '⬆ 发布审批' : (selectedApproval.step_name || '暂无步骤信息') },
                  { label: 'Resource Type', value: selectedApproval.resource_type === 'artifact' ? '📦 Artifact (发布候选)' : (selectedApproval.resource_type || '—') },
                  { label: 'Resource ID', value: <code style={{ fontSize: 11, background: 'var(--bg-app)', padding: '2px 6px', borderRadius: 3 }}>{selectedApproval.resource_id || '暂无资源 ID'}</code> },
                  ...(selectedApproval.resource_type === 'artifact' && selectedApproval.resource_id ? [{ label: '查看 Artifact', value: <Link to={{ pathname: '/artifacts', search: `?highlight=${selectedApproval.resource_id}` }} style={{ color: 'var(--primary)', textDecoration: 'none' }}>→ 前往 Artifact 页</Link> }] : []),
                  { label: 'Created', value: fmtTs(selectedApproval.created_at) },
                  { label: 'Expires', value: selectedApproval.expires_at ? fmtTs(selectedApproval.expires_at) : '无过期时间' },
                  ...(selectedApproval.reviewed_at ? [{ label: 'Reviewed At', value: fmtTs(selectedApproval.reviewed_at) }] : []),
                  ...(selectedApproval.reviewed_by ? [{ label: 'Reviewed By', value: selectedApproval.reviewed_by }] : []),
                ]} />
              </SectionCard>

              {/* v4.6.0 — Mainline Chain */}
              <SectionCard title="主线链路">
                <MainlineChainStrip
                  compact
                  current={selectedApproval.id}
                  chain={[
                    ...((selectedApproval as any).source_task_id ? [{ type: 'task' as const, id: (selectedApproval as any).source_task_id, label: '来源Task' }] : []),
                    ...(selectedApproval.resource_id ? [{ type: 'workflow_job' as const, id: selectedApproval.resource_id, label: '目标对象', status: undefined }] : []),
                    { type: 'approval' as const, id: selectedApproval.id, label: selectedApproval.step_name || '当前审批', status: selectedApproval.status },
                  ]}
                />
              </SectionCard>

              {/* v4.6.0 — Related Objects */}
              <SectionCard title="关联对象">
                <EntityLinkChips
                  label="相关对象"
                  entities={[
                    ...(selectedApproval.resource_type === 'artifact' && selectedApproval.resource_id ? [{ type: 'artifact' as const, id: selectedApproval.resource_id, label: '发布候选 Artifact', status: selectedApproval.status === 'approved' ? 'approved' : 'candidate' }] : []),
                    ...(selectedApproval.resource_id && selectedApproval.resource_type !== 'artifact' ? [{ type: 'workflow_job' as const, id: selectedApproval.resource_id, label: selectedApproval.resource_id.slice(0, 10) + '…', status: undefined }] : []),
                    ...((selectedApproval as any).source_task_id ? [{ type: 'task' as const, id: (selectedApproval as any).source_task_id, label: 'Source Task', status: undefined }] : []),
                    ...((selectedApproval as any).model_id ? [{ type: 'model' as const, id: String((selectedApproval as any).model_id), label: 'Model', status: undefined }] : []),
                    ...((selectedApproval as any).artifact_id ? [{ type: 'artifact' as const, id: String((selectedApproval as any).artifact_id), label: 'Artifact', status: undefined }] : []),
                  ]}
                />
              </SectionCard>

              <SectionCard title="Risk & Impact">
                <InfoTable rows={[
                  {
                    label: '风险级别',
                    value: (selectedApproval.step_name || '').toLowerCase().includes('delete') || (selectedApproval.step_name || '').toLowerCase().includes('rollback')
                      ? '⚠️ 高风险（删除/回滚相关）'
                      : '✅ 常规风险',
                  },
                  {
                    label: '影响对象',
                    value: selectedApproval.resource_id ? (
                      <code style={{ fontSize: 11, background: 'var(--bg-app)', padding: '2px 6px', borderRadius: 3 }}>{selectedApproval.resource_id}</code>
                    ) : '待识别对象',
                  },
                  {
                    label: '批准后影响',
                    value: selectedApproval.status === 'pending'
                      ? '将继续执行当前工作流步骤并影响下游对象。'
                      : '已执行审批结论，影响已生效或已终止。',
                  },
                  {
                    label: '来源入口',
                    value: (
                      <div className="inline-meta-list">
                        <Link className="linked-entity-chip" to="/workflow-jobs">Workflow Jobs</Link>
                        <Link className="linked-entity-chip" to="/tasks">Tasks</Link>
                        <Link className="linked-entity-chip" to="/models">Models</Link>
                        <Link className="linked-entity-chip" to="/artifacts">Artifacts</Link>
                      </div>
                    ),
                  },
                ]} />
              </SectionCard>

              {selectedApproval.comment && (
                <SectionCard title="Comment">
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedApproval.comment}</div>
                </SectionCard>
              )}
            </>
          )}
        </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 20, width: 360 }}>
            <p style={{ margin: '0 0 16px', fontSize: 14 }}>{confirmMsg}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="ui-btn ui-btn-ghost" onClick={() => { setConfirmMsg(''); setConfirmOnConfirm(null); }}>Cancel</button>
              <button className="ui-btn ui-btn-primary" onClick={async () => { if (confirmOnConfirm) await confirmOnConfirm(); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

