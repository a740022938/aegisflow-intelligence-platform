import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, PageHeader, SectionCard } from '../components/ui';
import '../components/ui/shared.css';
import './GovernanceHub.css';

const API = '/api';

type Incident = {
  id: string;
  source_type: string;
  source_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
  status: 'open' | 'in_progress' | 'resolved' | 'ignored' | string;
  assignee: string;
  summary: string;
  probable_cause: string;
  resolution_summary: string;
  playbook_id: string;
  playbook_code: string;
  playbook_match_reason: string;
  playbook_run_status: string;
  playbook_step_completed: number;
  playbook_step_total: number;
  recommended_actions_json: any[];
  evidence_refs_json: Record<string, any[]>;
  playbook_run?: any;
  assistant_diagnosis_summary?: string;
  assistant_probable_cause?: string;
  assistant_recommended_actions_json?: any[];
  assistant_confidence?: number;
  assistant_risk_level?: string;
  assistant_manual_confirmation_required?: number;
  assistant_last_request_id?: string;
  assistant_last_status?: string;
  created_at: string;
  updated_at: string;
};

type IncidentAction = {
  id: string;
  action_type: string;
  from_status: string;
  to_status: string;
  comment: string;
  actor: string;
  meta_json: Record<string, any>;
  created_at: string;
};

function fmtTs(v?: string) {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleString('zh-CN');
  } catch {
    return v;
  }
}

function severityRank(s: string) {
  if (s === 'critical') return 4;
  if (s === 'high') return 3;
  if (s === 'medium') return 2;
  if (s === 'low') return 1;
  return 0;
}

function compactJson(v: any) {
  try {
    return JSON.stringify(v ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

function asArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  return [v];
}

function pickTopEvidence(evidence: Record<string, any[]> | undefined, max = 5) {
  if (!evidence || typeof evidence !== 'object') return [] as Array<{ kind: string; data: any }>;
  const order = ['jobs', 'routes', 'rules', 'feedback', 'artifacts', 'logs'];
  const out: Array<{ kind: string; data: any }> = [];
  for (const k of order) {
    for (const item of asArray((evidence as any)[k])) {
      out.push({ kind: k, data: item });
      if (out.length >= max) return out;
    }
  }
  return out;
}

function evidenceLinks(kind: string, data: any) {
  const links: Array<{ label: string; to: string }> = [];
  if (kind === 'jobs' && data?.job_id) links.push({ label: 'Workflow Job', to: `/workflow-jobs?highlight=${encodeURIComponent(String(data.job_id))}` });
  if (kind === 'artifacts') {
    if (data?.artifact_id) links.push({ label: 'Artifacts', to: `/artifacts?highlight=${encodeURIComponent(String(data.artifact_id))}` });
    if (data?.model_id) links.push({ label: 'Models', to: `/models?highlight=${encodeURIComponent(String(data.model_id))}` });
    if (data?.dataset_id) links.push({ label: 'Datasets', to: `/datasets?highlight=${encodeURIComponent(String(data.dataset_id))}` });
  }
  if (kind === 'feedback' && data?.feedback_id) links.push({ label: 'Feedback', to: `/feedback?highlight=${encodeURIComponent(String(data.feedback_id))}` });
  if (kind === 'routes' && data?.task_id) links.push({ label: 'Workflow Job', to: `/workflow-jobs?highlight=${encodeURIComponent(String(data.task_id))}` });
  if (kind === 'logs') links.push({ label: 'Audit', to: '/audit' });
  return links;
}

function statusClass(v: string) {
  if (v === 'open') return 'bad';
  if (v === 'in_progress') return 'ok';
  if (v === 'resolved') return 'ok';
  if (v === 'ignored') return 'bad';
  return 'bad';
}

export default function GovernanceHub() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selected, setSelected] = useState<Incident | null>(null);
  const [actions, setActions] = useState<IncidentAction[]>([]);
  const [trace, setTrace] = useState<any>(null);
  const [error, setError] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [operator, setOperator] = useState('gov-operator');
  const [assignee, setAssignee] = useState('');
  const [comment, setComment] = useState('');
  const [probableCause, setProbableCause] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [playbookNote, setPlaybookNote] = useState('');
  const [qualityRows, setQualityRows] = useState<any[]>([]);
  const [qualityNeedsRevisionOnly, setQualityNeedsRevisionOnly] = useState(false);
  const [qualityActiveOnly, setQualityActiveOnly] = useState(false);
  const [assistantRequests, setAssistantRequests] = useState<any[]>([]);
  const [assistantQuality, setAssistantQuality] = useState<any>(null);
  const [operationsOverview, setOperationsOverview] = useState<any>(null);
  const [assistantForceFail, setAssistantForceFail] = useState(false);
  const [showAssistantRaw, setShowAssistantRaw] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [adoptionFilter, setAdoptionFilter] = useState('');
  const [assistantRiskFilter, setAssistantRiskFilter] = useState('');
  const [assistantRequestStatusFilter, setAssistantRequestStatusFilter] = useState('');
  const [opsRange, setOpsRange] = useState<'24h' | '7d'>('24h');
  const [sort, setSort] = useState('unclosed_then_severity');

  const fetchSummary = useCallback(async () => {
    const r = await fetch(`${API}/incidents/summary`);
    const d = await r.json();
    if (d?.ok) setSummary(d.data || null);
  }, []);

  const fetchIncidents = useCallback(async () => {
    const p = new URLSearchParams();
    p.set('limit', '200');
    if (statusFilter) p.set('status', statusFilter);
    if (severityFilter) p.set('severity', severityFilter);
    if (sourceFilter) p.set('source_type', sourceFilter);
    if (sort) p.set('sort', sort);
    const r = await fetch(`${API}/incidents?${p.toString()}`);
    const d = await r.json();
    if (d?.ok) {
      setIncidents(d.incidents || []);
      if (!selectedId && (d.incidents || []).length) setSelectedId(d.incidents[0].id);
    }
  }, [statusFilter, severityFilter, sourceFilter, sort, selectedId]);

  const fetchIncidentDetail = useCallback(async (id: string) => {
    if (!id) return;
    const r = await fetch(`${API}/incidents/${id}`);
    const d = await r.json();
      if (d?.ok && d.incident) {
      setSelected(d.incident);
      setActions(asArray(d.incident.actions));
      setAssignee(d.incident.assignee || '');
      setProbableCause(d.incident.probable_cause || '');
      setResolutionSummary(d.incident.resolution_summary || '');
      if (d.incident?.source_type === 'workflow_failure' && d.incident?.source_id) {
        const tr = await fetch(`${API}/governance/jobs/${encodeURIComponent(String(d.incident.source_id))}/trace`);
        const td = await tr.json();
        setTrace(td?.ok ? td.data : null);
      } else {
        setTrace(null);
      }
      const ar = await fetch(`${API}/incidents/${id}/assistant-diagnostics?limit=20`);
      const ad = await ar.json();
      setAssistantRequests(ad?.ok ? (ad.requests || []) : []);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchSummary(), fetchIncidents()]);
    } catch (e: any) {
      setError(e?.message || '加载失败');
    }
    setLoading(false);
  }, [fetchSummary, fetchIncidents]);

  const fetchPlaybookQuality = useCallback(async () => {
    const p = new URLSearchParams();
    if (sourceFilter) p.set('source_type', sourceFilter);
    if (qualityNeedsRevisionOnly) p.set('needs_revision', '1');
    if (qualityActiveOnly) p.set('active', '1');
    const r = await fetch(`${API}/playbook-quality/overview?${p.toString()}`);
    const d = await r.json();
    if (d?.ok) setQualityRows(d.playbooks || []);
  }, [sourceFilter, qualityNeedsRevisionOnly, qualityActiveOnly]);

  const fetchAssistantQuality = useCallback(async () => {
    const p = new URLSearchParams();
    if (sourceFilter) p.set('source_type', sourceFilter);
    if (severityFilter) p.set('severity', severityFilter);
    if (adoptionFilter) p.set('adoption_status', adoptionFilter);
    if (assistantRiskFilter) p.set('risk_level', assistantRiskFilter);
    if (assistantRequestStatusFilter) p.set('request_status', assistantRequestStatusFilter);
    const r = await fetch(`${API}/governance/assistant-quality?${p.toString()}`);
    const d = await r.json();
    if (d?.ok) setAssistantQuality(d);
  }, [sourceFilter, severityFilter, adoptionFilter, assistantRiskFilter, assistantRequestStatusFilter]);

  const fetchOperationsOverview = useCallback(async () => {
    const p = new URLSearchParams();
    p.set('range', opsRange);
    if (sourceFilter) p.set('source_type', sourceFilter);
    const r = await fetch(`${API}/operations/overview?${p.toString()}`);
    const d = await r.json();
    if (d?.ok) setOperationsOverview(d);
  }, [opsRange, sourceFilter]);

  const doSync = useCallback(async (trigger = 'manual') => {
    setSyncing(true);
    setError('');
    try {
      const r = await fetch(`${API}/incidents/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: operator || 'gov-operator', trigger }),
      });
      const d = await r.json();
      if (d?.ok !== true) throw new Error(d?.error || 'sync failed');
      await refreshAll();
    } catch (e: any) {
      setError(e?.message || 'sync failed');
    }
    setSyncing(false);
  }, [operator, refreshAll]);

  const postAction = useCallback(async (actionType: string) => {
    if (!selectedId) return;
    const payload = {
      action_type: actionType,
      actor: operator || 'gov-operator',
      comment,
      assignee,
      probable_cause: probableCause,
      resolution_summary: resolutionSummary,
    };
    const r = await fetch(`${API}/incidents/${encodeURIComponent(selectedId)}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (!d?.ok) {
      setError(d?.error || 'action failed');
      return;
    }
    setComment('');
    await Promise.all([fetchSummary(), fetchIncidents(), fetchIncidentDetail(selectedId)]);
  }, [selectedId, operator, comment, assignee, probableCause, resolutionSummary, fetchSummary, fetchIncidents, fetchIncidentDetail]);

  const postPlaybookAction = useCallback(async (actionType: string, stepIndex?: number) => {
    if (!selectedId) return;
    const r = await fetch(`${API}/incidents/${encodeURIComponent(selectedId)}/playbook/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type: actionType,
        actor: operator || 'gov-operator',
        step_index: stepIndex || 0,
        action_note: playbookNote || comment || '',
      }),
    });
    const d = await r.json();
    if (!d?.ok) {
      setError(d?.error || 'playbook action failed');
      return;
    }
    setPlaybookNote('');
    setComment('');
    await Promise.all([fetchSummary(), fetchIncidents(), fetchIncidentDetail(selectedId), fetchPlaybookQuality()]);
  }, [selectedId, operator, playbookNote, comment, fetchSummary, fetchIncidents, fetchIncidentDetail, fetchPlaybookQuality]);

  const postPlaybookFeedback = useCallback(async (feedbackType: 'useful' | 'useless' | 'adopted' | 'needs_update') => {
    if (!selectedId) return;
    const r = await fetch(`${API}/incidents/${encodeURIComponent(selectedId)}/playbook/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_type: feedbackType, created_by: operator || 'gov-operator', comment: playbookNote || comment || '' }),
    });
    const d = await r.json();
    if (!d?.ok) {
      setError(d?.error || 'feedback failed');
      return;
    }
    await Promise.all([fetchIncidentDetail(selectedId), fetchPlaybookQuality()]);
  }, [selectedId, operator, playbookNote, comment, fetchIncidentDetail, fetchPlaybookQuality]);

  const requestAssistantDiagnostic = useCallback(async () => {
    if (!selectedId) return;
    const r = await fetch(`${API}/incidents/${encodeURIComponent(selectedId)}/assistant-diagnostics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor: operator || 'gov-operator',
        request_hint: playbookNote || comment || '',
        force_fail: assistantForceFail,
      }),
    });
    const d = await r.json();
    if (!d?.ok) {
      setError(d?.error || 'assistant diagnostic failed');
      return;
    }
    await fetchIncidentDetail(selectedId);
  }, [selectedId, operator, playbookNote, comment, assistantForceFail, fetchIncidentDetail]);

  const submitAssistantManualDecision = useCallback(async (decision: 'confirm_request' | 'reject_request') => {
    if (!selectedId || assistantRequests.length === 0) return;
    const reqId = String(assistantRequests[0].id || '');
    if (!reqId) return;
    const r = await fetch(`${API}/incidents/${encodeURIComponent(selectedId)}/assistant-diagnostics/${encodeURIComponent(reqId)}/manual-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: operator || 'gov-operator', decision, note: playbookNote || comment || '' }),
    });
    const d = await r.json();
    if (!d?.ok) {
      setError(d?.error || 'assistant manual confirmation failed');
      return;
    }
    await fetchIncidentDetail(selectedId);
  }, [selectedId, assistantRequests, operator, playbookNote, comment, fetchIncidentDetail]);

  const markAssistantAdoption = useCallback(async (adoption: 'adopted' | 'rejected') => {
    if (!selectedId || assistantRequests.length === 0) return;
    const reqId = String(assistantRequests[0].id || '');
    if (!reqId) return;
    const r = await fetch(`${API}/incidents/${encodeURIComponent(selectedId)}/assistant-diagnostics/${encodeURIComponent(reqId)}/adoption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: operator || 'gov-operator', adoption, note: playbookNote || comment || '' }),
    });
    const d = await r.json();
    if (!d?.ok) {
      setError(d?.error || 'assistant adoption update failed');
      return;
    }
    await fetchIncidentDetail(selectedId);
  }, [selectedId, assistantRequests, operator, playbookNote, comment, fetchIncidentDetail]);

  useEffect(() => {
    doSync('governance_hub_open').then(() => undefined);
    const timer = window.setInterval(() => {
      doSync('governance_hub_auto').then(() => undefined);
    }, 120000);
    return () => window.clearInterval(timer);
  }, [doSync]);

  useEffect(() => {
    fetchPlaybookQuality().then(() => undefined);
  }, [fetchPlaybookQuality]);

  useEffect(() => {
    fetchAssistantQuality().then(() => undefined);
  }, [fetchAssistantQuality]);

  useEffect(() => {
    fetchOperationsOverview().then(() => undefined);
  }, [fetchOperationsOverview]);

  useEffect(() => {
    if (selectedId) fetchIncidentDetail(selectedId).then(() => undefined);
  }, [selectedId, fetchIncidentDetail]);

  const stats = useMemo(() => {
    const bySeverity = summary?.by_severity || {};
    const byStatus = summary?.by_status || {};
    return {
      open: Number(summary?.open_incidents?.length || 0),
      high: Number(summary?.high_severity_incidents?.length || 0),
      resolved: Number(summary?.recent_resolved?.length || 0),
      ignored: Number(summary?.ignored_count || 0),
      bySeverity,
      byStatus,
      bySource: summary?.by_source_type || {},
    };
  }, [summary]);

  const topEvidence = useMemo(() => pickTopEvidence(selected?.evidence_refs_json, 5), [selected]);

  return (
    <div className="page-root governance-hub-page">
      <PageHeader
        title="治理中枢"
        subtitle="Incident Governance Hub"
        actions={(
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="ui-input" style={{ width: 150 }} value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="operator" />
            <button className="ui-btn ui-btn-outline ui-btn-sm" disabled={syncing} onClick={() => doSync('manual')}>
              {syncing ? '同步中...' : '同步事件'}
            </button>
            <button className="ui-btn ui-btn-ghost ui-btn-sm" disabled={loading} onClick={refreshAll}>
              {loading ? '加载中...' : '刷新'}
            </button>
          </div>
        )}
      />

      {!!error && <div className="ui-alert ui-alert-danger">{error}</div>}

      <SectionCard title="事件总览" className="gh-panel">
        <div className="gh-stats-grid">
          <div className="gh-stat"><div className="gh-k">Open Incidents</div><div className="gh-v">{stats.open}</div></div>
          <div className="gh-stat"><div className="gh-k">High Severity</div><div className="gh-v">{stats.high}</div></div>
          <div className="gh-stat"><div className="gh-k">Recent Resolved</div><div className="gh-v">{stats.resolved}</div></div>
          <div className="gh-stat"><div className="gh-k">Ignored Count</div><div className="gh-v">{stats.ignored}</div></div>
        </div>
        <div className="gh-db-grid">
          <div className="gh-stat-mini"><span>Status</span><strong>{Object.entries(stats.byStatus).map(([k, v]) => `${k}:${v}`).join(' / ') || '—'}</strong></div>
          <div className="gh-stat-mini"><span>Severity</span><strong>{Object.entries(stats.bySeverity).map(([k, v]) => `${k}:${v}`).join(' / ') || '—'}</strong></div>
          <div className="gh-stat-mini"><span>Source Type</span><strong>{Object.entries(stats.bySource).map(([k, v]) => `${k}:${v}`).join(' / ') || '—'}</strong></div>
          <div className="gh-stat-mini"><span>API</span><strong className="gh-api-badges"><span className="gh-api-badge ok">/api/incidents</span><span className="gh-api-badge ok">/summary</span><span className="gh-api-badge ok">/sync</span></strong></div>
        </div>
      </SectionCard>

      <SectionCard
        title="统一运营决策层（Phase E）"
        className="gh-panel"
        actions={(
          <div className="gh-filter-inline">
            <select className="ui-select gh-filter" value={opsRange} onChange={(e) => setOpsRange((e.target.value as any) || '24h')}>
              <option value="24h">range: 24h</option>
              <option value="7d">range: 7d</option>
            </select>
            <button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={() => fetchOperationsOverview()}>刷新运营盘面</button>
          </div>
        )}
      >
        {!operationsOverview?.overview ? (
          <div className="gh-muted">暂无运营聚合数据</div>
        ) : (
          <>
            <div className="gh-stats-grid">
              <div className="gh-stat"><div className="gh-k">WF Success</div><div className="gh-v">{Math.round((operationsOverview.overview.quality.workflow_success_rate || 0) * 100)}%</div></div>
              <div className="gh-stat"><div className="gh-k">Incident Completion</div><div className="gh-v">{Math.round((operationsOverview.overview.quality.incident_completion_rate || 0) * 100)}%</div></div>
              <div className="gh-stat"><div className="gh-k">Playbook Completion</div><div className="gh-v">{Math.round((operationsOverview.overview.quality.playbook_completion_rate || 0) * 100)}%</div></div>
              <div className="gh-stat"><div className="gh-k">Assistant Adoption</div><div className="gh-v">{Math.round((operationsOverview.overview.quality.assistant_adoption_rate || 0) * 100)}%</div></div>
            </div>
            <div className="gh-db-grid">
              <div className="gh-stat-mini"><span>Avg WF Time(s)</span><strong>{Math.round(operationsOverview.overview.latency.avg_workflow_completion_time_s || 0)}</strong></div>
              <div className="gh-stat-mini"><span>TTF Action(s)</span><strong>{Math.round(operationsOverview.overview.latency.avg_incident_time_to_first_action_s || 0)}</strong></div>
              <div className="gh-stat-mini"><span>TTR(s)</span><strong>{Math.round(operationsOverview.overview.latency.avg_incident_time_to_resolution_s || 0)}</strong></div>
              <div className="gh-stat-mini"><span>Assistant RT(ms)</span><strong>{Math.round(operationsOverview.overview.latency.avg_assistant_response_time_ms || 0)}</strong></div>
            </div>
            <div className="gh-db-grid">
              <div className="gh-stat-mini"><span>Blocked Saved</span><strong>{operationsOverview.overview.cost.blocked_saved_count || 0}</strong></div>
              <div className="gh-stat-mini"><span>Reuse Success</span><strong>{operationsOverview.overview.cost.reuse_success_count || 0}</strong></div>
              <div className="gh-stat-mini"><span>Cloud Cost Proxy</span><strong>{operationsOverview.overview.cost.cloud_cost_proxy_units || 0}</strong></div>
              <div className="gh-stat-mini"><span>Open Incidents</span><strong>{operationsOverview.overview.risk.open_incident_count || 0}</strong></div>
            </div>
            <div className="gh-kv"><span>Top Risks</span><span className="gh-cell-wrap">{(operationsOverview.overview.priority_board?.top_risks || []).map((x: any) => `${x.id}(${x.severity})`).join(' / ') || '—'}</span></div>
            <div className="gh-kv"><span>Top Bottlenecks</span><span className="gh-cell-wrap">{(operationsOverview.overview.priority_board?.top_bottlenecks || []).map((x: any) => `${x.domain}:${Math.round(x.value || 0)}`).join(' / ') || '—'}</span></div>
            <div className="gh-kv"><span>Top Value Opportunities</span><span className="gh-cell-wrap">{(operationsOverview.overview.priority_board?.top_value_opportunities || []).map((x: any) => `${x.source_type}:${Math.round((x.helpful_score || 0) * 100)}%`).join(' / ') || '—'}</span></div>
            <div className="gh-kv"><span>Top Waste</span><span className="gh-cell-wrap">{(operationsOverview.overview.priority_board?.top_waste || []).map((x: any) => `${x.type}:${x.count}`).join(' / ') || '—'}</span></div>
            <div className="gh-kv"><span>归因摘要</span><span className="gh-cell-wrap">{(operationsOverview.overview.attribution?.recommended_focus_areas || []).join(' / ') || '—'}</span></div>
          </>
        )}
      </SectionCard>

      <SectionCard
        title="Playbook 质量治理"
        className="gh-panel"
        actions={(
          <div className="gh-filter-inline">
            <label className="gh-muted"><input type="checkbox" checked={qualityActiveOnly} onChange={(e) => setQualityActiveOnly(e.target.checked)} /> active</label>
            <label className="gh-muted"><input type="checkbox" checked={qualityNeedsRevisionOnly} onChange={(e) => setQualityNeedsRevisionOnly(e.target.checked)} /> needs_revision</label>
            <button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={() => fetchPlaybookQuality()}>刷新质量</button>
          </div>
        )}
      >
        {qualityRows.length === 0 ? (
          <div className="gh-muted">暂无质量数据</div>
        ) : (
          <div className="gh-table-wrap">
            <table className="gh-table">
              <thead>
                <tr><th>playbook</th><th>source</th><th>bound</th><th>completed</th><th>aborted</th><th>completion_rate</th><th>quality</th><th>needs_revision</th></tr>
              </thead>
              <tbody>
                {qualityRows.map((q: any) => (
                  <tr key={q.id}>
                    <td>{q.playbook_code}</td>
                    <td>{q.applies_to_source_type}</td>
                    <td>{q.bound_count ?? 0}</td>
                    <td>{q.completed_count ?? 0}</td>
                    <td>{q.aborted_count ?? 0}</td>
                    <td>{q.completion_rate ?? 0}</td>
                    <td>{q.quality_score ?? 0}</td>
                    <td>{Number(q.needs_revision) === 1 ? 'yes' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="OpenClaw 协作质量治理"
        className="gh-panel"
        actions={<button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={() => fetchAssistantQuality()}>刷新协作质量</button>}
      >
        {!assistantQuality?.metrics ? (
          <div className="gh-muted">暂无协作质量数据</div>
        ) : (
          <>
            <div className="gh-stats-grid">
              <div className="gh-stat"><div className="gh-k">Requested</div><div className="gh-v">{assistantQuality.metrics.requested_count || 0}</div></div>
              <div className="gh-stat"><div className="gh-k">Completed</div><div className="gh-v">{assistantQuality.metrics.completed_count || 0}</div></div>
              <div className="gh-stat"><div className="gh-k">Failed</div><div className="gh-v">{assistantQuality.metrics.failed_count || 0}</div></div>
              <div className="gh-stat"><div className="gh-k">Adoption Rate</div><div className="gh-v">{Math.round((assistantQuality.metrics.adoption_rate || 0) * 100)}%</div></div>
            </div>
            <div className="gh-db-grid">
              <div className="gh-stat-mini"><span>Avg Confidence</span><strong>{Number(assistantQuality.metrics.avg_confidence || 0).toFixed(3)}</strong></div>
              <div className="gh-stat-mini"><span>High Risk Ratio</span><strong>{Math.round((assistantQuality.metrics.high_risk_ratio || 0) * 100)}%</strong></div>
              <div className="gh-stat-mini"><span>Avg RT(ms)</span><strong>{assistantQuality.metrics.avg_response_time_ms || 0}</strong></div>
              <div className="gh-stat-mini"><span>Manual Confirm</span><strong>{assistantQuality.metrics.manual_confirmation_required_count || 0}</strong></div>
            </div>
            <div className="gh-db-grid">
              <div className="gh-stat-mini"><span>Reuse Success</span><strong>{assistantQuality.long_term_metrics?.reuse_success_count || 0}</strong></div>
              <div className="gh-stat-mini"><span>Manual-to-Adopted</span><strong>{assistantQuality.long_term_metrics?.adoption_after_manual_confirm_count || 0}</strong></div>
              <div className="gh-stat-mini"><span>Blocked Saved</span><strong>{assistantQuality.long_term_metrics?.blocked_saved_count || 0}</strong></div>
              <div className="gh-stat-mini"><span>HighRisk Confirm Pass</span><strong>{Math.round((assistantQuality.long_term_metrics?.high_risk_manual_confirm_pass_rate || 0) * 100)}%</strong></div>
            </div>
            <div className="gh-kv"><span>最值得上云</span><span className="gh-cell-wrap">{(assistantQuality.value_ranking?.most_worth_cloud || []).map((x: any) => `${x.source_type}:${Math.round((x.source_type_adoption_rate || 0) * 100)}%`).join(' / ') || '—'}</span></div>
            <div className="gh-kv"><span>最不值得上云</span><span className="gh-cell-wrap">{(assistantQuality.value_ranking?.least_worth_cloud || []).map((x: any) => `${x.source_type}:${Math.round((x.source_type_failure_rate || 0) * 100)}%`).join(' / ') || '—'}</span></div>
            <div className="gh-kv"><span>复用收益最高</span><span className="gh-cell-wrap">{(assistantQuality.value_ranking?.highest_reuse_gain || []).map((x: any) => `${x.source_type}:${Math.round((x.source_type_reuse_rate || 0) * 100)}%`).join(' / ') || '—'}</span></div>
            <div className="gh-kv"><span>Gate Policy Hints</span><span className="gh-cell-wrap">{(assistantQuality.gate_policy_hints || []).map((x: any) => `${x.source_type}:${x.suggestion}`).join(' / ') || '—'}</span></div>
          </>
        )}
      </SectionCard>

      <div className="gh-grid-2">
        <SectionCard title="Incident 列表" className="gh-panel">
          <div className="gh-headline-row">
            <div className="gh-filter-inline">
              <select className="ui-select gh-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">status: all</option>
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
                <option value="ignored">ignored</option>
              </select>
              <select className="ui-select gh-filter" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option value="">severity: all</option>
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
              <select className="ui-select gh-filter" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="">source: all</option>
                <option value="workflow_failure">workflow_failure</option>
                <option value="route_anomaly">route_anomaly</option>
                <option value="rule_blocked">rule_blocked</option>
                <option value="ops_health_anomaly">ops_health_anomaly</option>
                <option value="feedback_risk_signal">feedback_risk_signal</option>
              </select>
              <select className="ui-select gh-filter" value={adoptionFilter} onChange={(e) => setAdoptionFilter(e.target.value)}>
                <option value="">adoption: all</option>
                <option value="adopted">adopted</option>
                <option value="rejected">rejected</option>
              </select>
              <select className="ui-select gh-filter" value={assistantRiskFilter} onChange={(e) => setAssistantRiskFilter(e.target.value)}>
                <option value="">assistant risk: all</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
              <select className="ui-select gh-filter" value={assistantRequestStatusFilter} onChange={(e) => setAssistantRequestStatusFilter(e.target.value)}>
                <option value="">request status: all</option>
                <option value="completed">completed</option>
                <option value="failed">failed</option>
                <option value="awaiting_manual_confirmation">awaiting_manual_confirmation</option>
                <option value="blocked">blocked</option>
                <option value="running">running</option>
              </select>
              <select className="ui-select gh-filter" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="unclosed_then_severity">未关闭优先</option>
                <option value="severity_first">高危优先</option>
                <option value="latest">最新优先</option>
              </select>
            </div>
          </div>
          {incidents.length === 0 ? (
            <EmptyState message="暂无事件" />
          ) : (
            <div className="gh-table-wrap">
              <table className="gh-table">
                <thead>
                  <tr><th>severity</th><th>status</th><th>source_type</th><th>playbook</th><th>progress</th><th>assistant</th><th>summary</th><th>updated_at</th></tr>
                </thead>
                <tbody>
                  {incidents.map((x) => (
                    <tr key={x.id} className={selectedId === x.id ? 'gh-row-active' : ''} onClick={() => setSelectedId(x.id)} style={{ cursor: 'pointer' }}>
                      <td>{x.severity}</td>
                      <td>{x.status}</td>
                      <td>{x.source_type}</td>
                      <td>{x.playbook_code || '—'}</td>
                      <td>{x.playbook_step_completed || 0}/{x.playbook_step_total || 0} ({x.playbook_run_status || 'not_started'})</td>
                      <td>{x.assistant_last_status || 'none'}</td>
                      <td className="gh-cell-wrap">{x.summary}</td>
                      <td>{fmtTs(x.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Incident 详情" className="gh-panel gh-linked">
          {!selected ? (
            <EmptyState message="请选择事件" />
          ) : (
            <>
              <div className="gh-kv"><span>incident_id</span><code>{selected.id}</code></div>
              <div className="gh-kv"><span>summary</span><strong>{selected.summary}</strong></div>
              <div className="gh-kv"><span>status</span><strong>{selected.status}</strong></div>
              <div className="gh-kv"><span>severity</span><strong>{selected.severity}</strong></div>
              <div className="gh-kv"><span>source</span><strong>{selected.source_type} / {selected.source_id}</strong></div>
              <div className="gh-kv"><span>playbook</span><strong>{selected.playbook_code || '—'} ({selected.playbook_run_status || 'not_started'})</strong></div>
              <div className="gh-kv"><span>playbook match</span><span className="gh-cell-wrap">{selected.playbook_match_reason || '—'}</span></div>
              <div className="gh-kv"><span>playbook progress</span><strong>{selected.playbook_step_completed || 0}/{selected.playbook_step_total || 0}</strong></div>
              <div className="gh-kv"><span>assistant status</span><strong>{selected.assistant_last_status || 'none'}</strong></div>

              <div className="gh-kv"><span>assignee</span><input className="ui-input" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="assignee" /></div>
              <div className="gh-kv"><span>probable cause</span><textarea className="ui-input" rows={2} value={probableCause} onChange={(e) => setProbableCause(e.target.value)} /></div>
              <div className="gh-kv"><span>resolution summary</span><textarea className="ui-input" rows={2} value={resolutionSummary} onChange={(e) => setResolutionSummary(e.target.value)} /></div>
              <div className="gh-kv"><span>comment</span><textarea className="ui-input" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="处置备注" /></div>

              <div className="gh-ref-actions">
                <button className="ui-btn ui-btn-xs ui-btn-outline" onClick={() => postAction('take_ownership')}>接手</button>
                <button className="ui-btn ui-btn-xs ui-btn-primary" onClick={() => postAction('mark_in_progress')}>标记处理中</button>
                <button className="ui-btn ui-btn-xs ui-btn-success" onClick={() => postAction('resolve')}>关闭</button>
                <button className="ui-btn ui-btn-xs ui-btn-warning" onClick={() => postAction('ignore')}>忽略</button>
                <button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={() => postAction('reopen')}>重新打开</button>
                <button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={() => postAction('comment')}>添加备注</button>
              </div>
              <div className="gh-kv"><span>playbook note</span><textarea className="ui-input" rows={2} value={playbookNote} onChange={(e) => setPlaybookNote(e.target.value)} placeholder="剧本执行备注/中止原因" /></div>
              <div className="gh-ref-actions">
                <button className="ui-btn ui-btn-xs ui-btn-outline" disabled={!selected.playbook_id} onClick={() => postPlaybookAction('playbook_start')}>开始剧本</button>
                <button className="ui-btn ui-btn-xs ui-btn-primary" disabled={!selected.playbook_id} onClick={() => postPlaybookAction('playbook_step_complete', (selected.playbook_step_completed || 0) + 1)}>完成当前步骤</button>
                <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={!selected.playbook_id} onClick={() => postPlaybookAction('playbook_note', selected.playbook_step_completed || 0)}>剧本备注</button>
                <button className="ui-btn ui-btn-xs ui-btn-success" disabled={!selected.playbook_id} onClick={() => postPlaybookAction('playbook_complete', selected.playbook_step_total || selected.playbook_step_completed || 0)}>标记剧本完成</button>
                <button className="ui-btn ui-btn-xs ui-btn-warning" disabled={!selected.playbook_id} onClick={() => postPlaybookAction('playbook_abort', selected.playbook_step_completed || 0)}>中止剧本</button>
              </div>
              <div className="gh-ref-actions">
                <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={!selected.playbook_id} onClick={() => postPlaybookFeedback('useful')}>反馈 useful</button>
                <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={!selected.playbook_id} onClick={() => postPlaybookFeedback('useless')}>反馈 useless</button>
                <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={!selected.playbook_id} onClick={() => postPlaybookFeedback('adopted')}>反馈 adopted</button>
                <button className="ui-btn ui-btn-xs ui-btn-warning" disabled={!selected.playbook_id} onClick={() => postPlaybookFeedback('needs_update')}>反馈 needs_update</button>
              </div>
              <SectionCard title="OpenClaw 诊断协作">
                <div className="gh-kv"><span>diagnosis summary</span><span className="gh-cell-wrap">{selected.assistant_diagnosis_summary || '—'}</span></div>
                <div className="gh-kv"><span>assistant probable cause</span><span className="gh-cell-wrap">{selected.assistant_probable_cause || '—'}</span></div>
                <div className="gh-kv"><span>confidence / risk</span><strong>{selected.assistant_confidence ?? 0} / {selected.assistant_risk_level || '—'}</strong></div>
                <div className="gh-kv"><span>manual confirmation</span><strong>{Number(selected.assistant_manual_confirmation_required || 0) === 1 ? 'required' : 'not_required'}</strong></div>
                <div className="gh-kv"><span>gate</span><strong>{assistantRequests[0]?.gate_decision || '—'} / {assistantRequests[0]?.gate_reason || '—'}</strong></div>
                <div className="gh-kv"><span>adoption</span><strong>{assistantRequests[0]?.adoption_status || '—'}</strong></div>
                <div className="gh-kv"><span>reuse_hint</span><span className="gh-cell-wrap">{assistantRequests[0]?.reuse_hit ? compactJson(assistantRequests[0]?.reuse_hint_json || {}) : 'none'}</span></div>
                <div className="gh-kv"><span>backflow impact</span><span className="gh-cell-wrap">pattern:{assistantRequests[0]?.pattern_backflow_id || '—'} / rule:{assistantRequests[0]?.rule_backflow_id || '—'} / playbook:{assistantRequests[0]?.playbook_backflow_id || '—'}</span></div>
                <div className="gh-kv"><span>gate policy hint snapshot</span><span className="gh-cell-wrap">{compactJson((assistantRequests[0]?.gate_policy_hint_json || []).slice?.(0, 3) || assistantRequests[0]?.gate_policy_hint_json || {})}</span></div>
                <div className="gh-ref-actions">
                  <label className="gh-muted"><input type="checkbox" checked={assistantForceFail} onChange={(e) => setAssistantForceFail(e.target.checked)} /> force_fail(测试)</label>
                  <button className="ui-btn ui-btn-xs ui-btn-outline" onClick={requestAssistantDiagnostic}>请求 OpenClaw 诊断</button>
                  <button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={requestAssistantDiagnostic}>重新请求</button>
                  <button className="ui-btn ui-btn-xs ui-btn-primary" disabled={assistantRequests.length === 0 || assistantRequests[0]?.manual_confirmation_status !== 'pending'} onClick={() => submitAssistantManualDecision('confirm_request')}>confirm_request</button>
                  <button className="ui-btn ui-btn-xs ui-btn-warning" disabled={assistantRequests.length === 0 || assistantRequests[0]?.manual_confirmation_status !== 'pending'} onClick={() => submitAssistantManualDecision('reject_request')}>reject_request</button>
                  <button className="ui-btn ui-btn-xs ui-btn-success" disabled={assistantRequests.length === 0} onClick={() => markAssistantAdoption('adopted')}>标记已采纳</button>
                  <button className="ui-btn ui-btn-xs ui-btn-warning" disabled={assistantRequests.length === 0} onClick={() => markAssistantAdoption('rejected')}>标记未采纳</button>
                  <button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={() => setShowAssistantRaw((v) => !v)}>查看原始诊断 JSON</button>
                </div>
                {showAssistantRaw && assistantRequests[0] && (
                  <pre className="gh-json">{compactJson(assistantRequests[0].response_json || {})}</pre>
                )}
              </SectionCard>
              {selected?.playbook_run?.review_summary_json && (
                <SectionCard title="剧本复盘摘要">
                  <pre className="gh-json">{compactJson(selected.playbook_run.review_summary_json)}</pre>
                </SectionCard>
              )}

              <SectionCard title="推荐动作">
                <div className="gh-list">
                  {asArray(selected.recommended_actions_json).slice(0, 6).map((a: any, i: number) => (
                    <div key={i} className="gh-list-item-static">
                      <div className="gh-item-main">{a?.step || `Action ${i + 1}`}</div>
                      <div className="gh-item-sub">{a?.detail || compactJson(a)}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="证据摘要（Top 5）">
                {topEvidence.length === 0 ? <div className="gh-muted">暂无证据</div> : (
                  <div className="gh-ref-grid">
                    {topEvidence.map((ev, idx) => (
                      <div className="gh-ref-card" key={`${ev.kind}-${idx}`}>
                        <div className="gh-ref-title">{ev.kind}</div>
                        <div className="gh-ref-line">{compactJson(ev.data).slice(0, 220)}</div>
                        <div className="gh-ref-actions">
                          {evidenceLinks(ev.kind, ev.data).map((l, li) => (
                            <Link className="ui-btn ui-btn-xs ui-btn-ghost" key={li} to={l.to}>{l.label}</Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="gh-json-actions">
                  <button className="ui-btn ui-btn-xs ui-btn-ghost" onClick={() => setShowRaw((v) => !v)}>{showRaw ? '隐藏原始 JSON' : '显示原始 JSON'}</button>
                </div>
                {showRaw && <pre className="gh-json">{compactJson(selected.evidence_refs_json)}</pre>}
              </SectionCard>

              <SectionCard title="处置历史">
                {actions.length === 0 ? <div className="gh-muted">暂无历史</div> : (
                  <div className="gh-table-wrap">
                    <table className="gh-table">
                      <thead><tr><th>time</th><th>action</th><th>status</th><th>actor</th><th>comment</th></tr></thead>
                      <tbody>
                        {actions.map((a) => (
                          <tr key={a.id}>
                            <td>{fmtTs(a.created_at)}</td>
                            <td>{a.action_type}</td>
                            <td><span className={`gh-api-badge ${statusClass(a.to_status || a.from_status)}`}>{a.from_status || '—'} → {a.to_status || '—'}</span></td>
                            <td>{a.actor || '—'}</td>
                            <td className="gh-cell-wrap">{a.comment || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              {trace?.job && (
                <SectionCard title="Trace 联动">
                  <div className="gh-kv"><span>job_id</span><strong>{trace.job.id}</strong></div>
                  <div className="gh-kv"><span>job_status</span><strong>{trace.job.status}</strong></div>
                  <div className="gh-kv"><span>last_error</span><span className="gh-cell-wrap">{trace.job.error_message || trace.job.last_error || '—'}</span></div>
                  <div className="gh-ref-actions">
                    <Link className="ui-btn ui-btn-xs ui-btn-outline" to={`/workflow-jobs?highlight=${encodeURIComponent(trace.job.id)}`}>打开 Workflow Jobs</Link>
                    <Link className="ui-btn ui-btn-xs ui-btn-ghost" to="/audit">打开 Audit</Link>
                  </div>
                </SectionCard>
              )}
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
