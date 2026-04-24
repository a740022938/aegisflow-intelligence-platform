import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState, PageHeader, SectionCard, StatusBadge } from '../components/ui';
import '../components/ui/shared.css';
import './CostRouting.css';
import { roleClass } from '../theme/colorRoles';

type RouteType = 'local_low_cost' | 'local_balanced' | 'cloud_high_capability';

interface RoutePolicy {
  id: string;
  name: string;
  task_type: string;
  route_type: RouteType;
  priority: number;
  status: string;
  reason_template: string;
  metadata_json: any;
  created_at: string;
  updated_at: string;
}

interface RouteDecision {
  id: string;
  task_id: string;
  task_type: string;
  policy_id: string;
  route_type: RouteType;
  route_reason: string;
  input_json: any;
  created_at: string;
}

interface RouteStat {
  route_type: RouteType;
  decisions: number;
  feedback_count: number;
  success_rate: number | null;
  avg_estimated_cost: number | null;
  avg_actual_cost: number | null;
  avg_latency_ms: number | null;
  avg_quality_score: number | null;
}

interface RoutePolicyStat {
  policy_id: string;
  policy_name: string;
  hits: number;
  avg_score: number | null;
}

interface RouteInsightRec {
  level: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}

interface CostRoutingInsights {
  engine_version: string;
  window: {
    since_at: string;
    since_hours: number;
    sampled_decisions: number;
  };
  route_stats: RouteStat[];
  policy_stats: RoutePolicyStat[];
  top_task_types: Array<{ task_type: string; count: number }>;
  recommendations: RouteInsightRec[];
}

interface OptimizationProposal {
  policy_id: string;
  policy_name: string;
  task_type: string;
  route_type: RouteType;
  feedback_count: number;
  changed: boolean;
  reasons: string[];
  current_weights: Record<string, number>;
  suggested_weights: Record<string, number>;
  metrics: {
    outcome_score: number | null;
    avg_actual_cost: number | null;
    avg_latency_ms: number | null;
    avg_quality_score: number | null;
  };
}

interface RoutingOptimization {
  mode: 'preview' | 'apply';
  proposal_count: number;
  applied_count: number;
  proposals: OptimizationProposal[];
}

function fmt(v?: string) {
  if (!v) return '暂无记录';
  try {
    return new Date(v).toLocaleString('zh-CN');
  } catch {
    return v;
  }
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, init);
  return res.json();
}

export default function CostRoutingPage() {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [policies, setPolicies] = useState<RoutePolicy[]>([]);
  const [decisions, setDecisions] = useState<RouteDecision[]>([]);
  const [insights, setInsights] = useState<CostRoutingInsights | null>(null);
  const [optimization, setOptimization] = useState<RoutingOptimization | null>(null);

  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<RoutePolicy | null>(null);

  const [selectedDecisionId, setSelectedDecisionId] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<RouteDecision | null>(null);

  const [policyTaskType, setPolicyTaskType] = useState('inference');
  const [policyName, setPolicyName] = useState('inference balanced policy');
  const [policyRouteType, setPolicyRouteType] = useState<RouteType>('local_balanced');
  const [policyPriority, setPolicyPriority] = useState(120);
  const [policyReasonTpl, setPolicyReasonTpl] = useState('task_type={task_type}; route={route_type}; policy={policy_id}; rule={rule_kind}');

  const [simulateTaskType, setSimulateTaskType] = useState('training');
  const [simulateTaskId, setSimulateTaskId] = useState('sim-task-v640-001');
  const [simulateInputJson, setSimulateInputJson] = useState('{"budget":"low","gpu_needed":true}');

  const [decisionRouteFilter, setDecisionRouteFilter] = useState('');
  const [feedbackOutcome, setFeedbackOutcome] = useState<'success' | 'partial' | 'failed' | 'timeout'>('success');
  const [feedbackCost, setFeedbackCost] = useState('');
  const [feedbackLatency, setFeedbackLatency] = useState('');
  const [feedbackQuality, setFeedbackQuality] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const stats = useMemo(() => {
    const byRoutePolicy: Record<string, number> = {
      local_low_cost: 0,
      local_balanced: 0,
      cloud_high_capability: 0,
    };
    for (const p of policies) {
      byRoutePolicy[p.route_type] = (byRoutePolicy[p.route_type] || 0) + 1;
    }
    const byRouteDecision: Record<string, number> = {
      local_low_cost: 0,
      local_balanced: 0,
      cloud_high_capability: 0,
    };
    for (const stat of insights?.route_stats || []) {
      byRouteDecision[stat.route_type] = stat.decisions || 0;
    }
    const feedbackCount = (insights?.route_stats || []).reduce((acc, item) => acc + Number(item.feedback_count || 0), 0);
    return {
      policyTotal: policies.length,
      decisionTotal: (insights?.window?.sampled_decisions || 0),
      recommendationCount: insights?.recommendations?.length || 0,
      feedbackCount,
      byRoutePolicy,
      byRouteDecision,
    };
  }, [policies, insights]);

  async function loadPolicies() {
    const res = await api('/api/route-policies?limit=200');
    if (!res.ok) throw new Error(res.error || '加载策略失败');
    setPolicies(res.policies || []);
    if (!selectedPolicyId && res.policies?.length) {
      setSelectedPolicyId(res.policies[0].id);
    }
  }

  async function loadPolicyDetail(id: string) {
    if (!id) {
      setSelectedPolicy(null);
      return;
    }
    const res = await api(`/api/route-policies/${id}`);
    if (!res.ok) throw new Error(res.error || '加载策略详情失败');
    setSelectedPolicy(res.policy || null);
  }

  async function loadDecisions() {
    const q = new URLSearchParams({ limit: '100' });
    if (decisionRouteFilter) q.set('route_type', decisionRouteFilter);
    const res = await api(`/api/cost-routing/decisions?${q.toString()}`);
    if (!res.ok) throw new Error(res.error || '加载决策失败');
    setDecisions(res.decisions || []);
    if (!selectedDecisionId && res.decisions?.length) {
      setSelectedDecisionId(res.decisions[0].id);
    }
  }

  async function loadDecisionDetail(id: string) {
    if (!id) {
      setSelectedDecision(null);
      return;
    }
    const res = await api(`/api/cost-routing/decisions/${id}`);
    if (!res.ok) throw new Error(res.error || '加载决策详情失败');
    setSelectedDecision(res.decision || null);
  }

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadPolicies(), loadDecisions(), loadInsights()]);
    } catch (e: any) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadInsights() {
    setLoadingInsights(true);
    try {
      const res = await api('/api/cost-routing/insights?since_hours=168&limit=800');
      if (!res.ok) throw new Error(res.error || '加载洞察失败');
      setInsights(res.insights || null);
    } catch (e: any) {
      setError(e.message || '加载洞察失败');
    } finally {
      setLoadingInsights(false);
    }
  }

  async function handleCreatePolicy(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/route-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: policyName,
          task_type: policyTaskType,
          route_type: policyRouteType,
          priority: Number(policyPriority),
          reason_template: policyReasonTpl,
          metadata_json: { source: 'ui-v640' },
        }),
      });
      if (!res.ok) throw new Error(res.error || '创建策略失败');
      setMsg(`策略已创建: ${res.policy.id}`);
      setSelectedPolicyId(res.policy.id);
      await loadPolicies();
      await loadPolicyDetail(res.policy.id);
    } catch (e: any) {
      setError(e.message || '创建失败');
    } finally {
      setCreating(false);
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setResolving(true);
    setError('');
    setMsg('');
    try {
      let parsed: any = {};
      try {
        parsed = simulateInputJson ? JSON.parse(simulateInputJson) : {};
      } catch {
        throw new Error('input_json 不是合法 JSON');
      }

      const res = await api('/api/cost-routing/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: simulateTaskType,
          task_id: simulateTaskId,
          input_json: parsed,
        }),
      });
      if (!res.ok) throw new Error(res.error || '路由决策失败');

      const d = res.decision;
      setMsg(`路由命中: ${d.route_type} | reason: ${d.route_reason}`);
      setSelectedDecisionId(d.id);
      await Promise.all([loadDecisions(), loadDecisionDetail(d.id), loadInsights()]);
    } catch (e: any) {
      setError(e.message || '决策失败');
    } finally {
      setResolving(false);
    }
  }

  async function handleAttachFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDecisionId) {
      setError('请先选择一条决策记录');
      return;
    }
    setSavingFeedback(true);
    setError('');
    setMsg('');
    try {
      const payload: any = {
        decision_id: selectedDecisionId,
        outcome: feedbackOutcome,
        notes: feedbackNotes,
      };
      if (feedbackCost.trim()) payload.actual_cost = Number(feedbackCost);
      if (feedbackLatency.trim()) payload.latency_ms = Number(feedbackLatency);
      if (feedbackQuality.trim()) payload.quality_score = Number(feedbackQuality);
      const res = await api('/api/cost-routing/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.error || '反馈回填失败');
      setMsg(`反馈回填成功: ${selectedDecisionId}`);
      await Promise.all([loadDecisionDetail(selectedDecisionId), loadInsights()]);
      setFeedbackNotes('');
    } catch (e: any) {
      setError(e.message || '反馈回填失败');
    } finally {
      setSavingFeedback(false);
    }
  }

  async function runOptimization(mode: 'preview' | 'apply') {
    setOptimizing(true);
    setError('');
    setMsg('');
    try {
      const res = await api('/api/cost-routing/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          since_hours: 336,
          min_feedback: 1,
          max_shift: 0.12,
        }),
      });
      if (!res.ok) throw new Error(res.error || '策略优化失败');
      setOptimization(res.optimization || null);
      setMsg(mode === 'apply'
        ? `策略优化已应用: ${res.optimization?.applied_count || 0} 条`
        : `策略优化建议: ${res.optimization?.proposal_count || 0} 条`);
      await Promise.all([loadPolicies(), loadInsights()]);
    } catch (e: any) {
      setError(e.message || '策略优化失败');
    } finally {
      setOptimizing(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedPolicyId) {
      loadPolicyDetail(selectedPolicyId).catch((e) => setError(e.message || '策略详情失败'));
    }
  }, [selectedPolicyId]);

  useEffect(() => {
    loadDecisions().catch((e) => setError(e.message || '决策列表失败'));
  }, [decisionRouteFilter]);

  useEffect(() => {
    if (selectedDecisionId) {
      loadDecisionDetail(selectedDecisionId).catch((e) => setError(e.message || '决策详情失败'));
    }
  }, [selectedDecisionId]);

  return (
    <div className="cost-routing-page page-root">
      <PageHeader
        title="成本路由 v2（强闭环）"
        subtitle="多维打分路由 + 决策反馈回填 + 近7天策略洞察"
      />

      <div className={`cr-summary-panel role-card ${roleClass('gov')}`}>
        <div className="cr-summary-title">策略概览</div>
        <div className="cr-summary-grid">
          <div className="cr-summary-item">
            <span className="cr-summary-key">策略总数</span>
            <span className="cr-summary-val">{stats.policyTotal}</span>
          </div>
          <div className="cr-summary-item">
            <span className="cr-summary-key">近7天决策</span>
            <span className="cr-summary-val">{stats.decisionTotal}</span>
          </div>
          <div className="cr-summary-item">
            <span className="cr-summary-key">回填反馈数</span>
            <span className="cr-summary-val">{stats.feedbackCount}</span>
          </div>
          <div className="cr-summary-item">
            <span className="cr-summary-key">建议条数</span>
            <span className="cr-summary-val">{stats.recommendationCount}</span>
          </div>
        </div>
      </div>

      <div className="cr-top-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="新增路由策略">
        <form onSubmit={handleCreatePolicy} className="cr-form-grid">
          <div className="cr-subtitle">新增路由策略</div>
          <input className="ui-input" value={policyName} onChange={(e) => setPolicyName(e.target.value)} placeholder="策略名称" required />
          <div className="cr-policy-row">
            <input className="ui-input" value={policyTaskType} onChange={(e) => setPolicyTaskType(e.target.value)} placeholder="任务类型" required />
            <select className="ui-select" value={policyRouteType} onChange={(e) => setPolicyRouteType(e.target.value as RouteType)}>
              <option value="local_low_cost">local_low_cost</option>
              <option value="local_balanced">local_balanced</option>
              <option value="cloud_high_capability">cloud_high_capability</option>
            </select>
            <input className="ui-input" type="number" value={policyPriority} onChange={(e) => setPolicyPriority(Number(e.target.value || 100))} placeholder="优先级" />
          </div>
          <input className="ui-input" value={policyReasonTpl} onChange={(e) => setPolicyReasonTpl(e.target.value)} placeholder="命中原因模板" />
          <button className="ui-btn ui-btn-primary" type="submit" disabled={creating}>{creating ? '创建中...' : '创建策略'}</button>
        </form>
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="模拟任务路由">
        <form onSubmit={handleResolve} className="cr-form-grid">
          <div className="cr-subtitle">模拟任务路由</div>
          <div className="cr-dual-row">
            <input className="ui-input" value={simulateTaskType} onChange={(e) => setSimulateTaskType(e.target.value)} placeholder="任务类型" required />
            <input className="ui-input" value={simulateTaskId} onChange={(e) => setSimulateTaskId(e.target.value)} placeholder="task_id（模拟）" />
          </div>
          <textarea className="ui-textarea" value={simulateInputJson} onChange={(e) => setSimulateInputJson(e.target.value)} rows={4} placeholder='输入 JSON（input_json）' />
          <button className="ui-btn ui-btn-primary" type="submit" disabled={resolving}>{resolving ? '决策中...' : '执行路由决策'}</button>
        </form>
        </SectionCard>
      </div>

      <div className="cr-main-grid">
        <SectionCard className={`role-card ${roleClass('gov')} cr-card-grid`} title="路由策略">
          {loading ? <EmptyState title="加载中" description="正在获取路由策略..." icon="⏳" /> : policies.length === 0 ? <EmptyState title="暂无策略" description="可通过上方表单新增策略。" icon="📭" /> : policies.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setSelectedPolicyId(p.id)}
              className={`cost-routing-policy-item ${selectedPolicyId === p.id ? 'selected' : ''}`}
            >
              <div className="cost-routing-policy-name">{p.name}</div>
              <div className="cost-routing-policy-meta">{p.task_type}{' -> '}{p.route_type}</div>
              <div className="cost-routing-policy-meta">priority={p.priority} · <StatusBadge s={p.status} size="xs" /></div>
            </button>
          ))}
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')} cr-card-grid-lg`} title="策略与决策">
          <div>
            <div className="cost-routing-section-title">策略详情</div>
            {!selectedPolicy ? <EmptyState title="未选择策略" description="请从左侧选择一个 Route Policy。" icon="👈" /> : (
              <div className="cost-routing-detail-grid">
                <div><b>ID:</b> {selectedPolicy.id}</div>
                <div><b>名称:</b> {selectedPolicy.name}</div>
                <div><b>任务类型:</b> {selectedPolicy.task_type}</div>
                <div><b>路由类型:</b> {selectedPolicy.route_type}</div>
                <div><b>优先级:</b> {selectedPolicy.priority}</div>
                <div><b>状态:</b> <StatusBadge s={selectedPolicy.status} size="xs" /></div>
                <div><b>原因模板:</b> {selectedPolicy.reason_template || '暂无记录'}</div>
                <div><b>更新时间:</b> {fmt(selectedPolicy.updated_at)}</div>
              </div>
            )}
          </div>

          <div>
            <div className="cr-head-row">
              <div className="cr-subtitle">最近路由决策</div>
              <select className="ui-select" value={decisionRouteFilter} onChange={(e) => setDecisionRouteFilter(e.target.value)}>
                <option value="">全部 route_type</option>
                <option value="local_low_cost">local_low_cost</option>
                <option value="local_balanced">local_balanced</option>
                <option value="cloud_high_capability">cloud_high_capability</option>
              </select>
            </div>
            <div className="cr-decisions-grid">
              <div className="cr-decisions-list">
                {decisions.length === 0 ? <EmptyState title="暂无决策记录" description="先执行一次模拟路由即可生成记录。" icon="🧭" /> : decisions.map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => setSelectedDecisionId(d.id)}
                    className={`cost-routing-decision-item ${selectedDecisionId === d.id ? 'selected' : ''}`}
                  >
                    <div className="cost-routing-policy-name">{d.task_type}{' -> '}{d.route_type}</div>
                    <div className="cost-routing-decision-meta">{d.task_id || 'sim-task'} · {fmt(d.created_at)}</div>
                  </button>
                ))}
              </div>
              <div className="cr-decision-detail-card">
                {!selectedDecision ? <EmptyState title="未选择决策" description="请从左侧选择一条路由决策记录。" icon="👈" /> : (
                  <div className="cost-routing-detail-grid">
                    <div><b>ID:</b> {selectedDecision.id}</div>
                    <div><b>任务:</b> {selectedDecision.task_type} ({selectedDecision.task_id || '无 task_id'})</div>
                    <div><b>策略:</b> {selectedDecision.policy_id || 'fallback'}</div>
                    <div><b>路由:</b> <StatusBadge s={selectedDecision.route_type} size="xs" /></div>
                    <div><b>原因:</b> {selectedDecision.route_reason}</div>
                    <div><b>创建时间:</b> {fmt(selectedDecision.created_at)}</div>
                    <div><b>引擎:</b> {selectedDecision.input_json?.__routing?.engine_version || 'v1'}</div>
                    <div><b>评分:</b> {selectedDecision.input_json?.__routing?.selected?.score_total ?? 'N/A'}</div>
                    <div><b>主因子:</b> {(selectedDecision.input_json?.__routing?.selected?.dominant_factors || []).join(', ') || 'N/A'}</div>
                    {selectedDecision.input_json?.__feedback?.latest ? (
                      <div><b>最近反馈:</b> {selectedDecision.input_json.__feedback.latest.outcome} · cost={selectedDecision.input_json.__feedback.latest.actual_cost ?? 'N/A'} · latency={selectedDecision.input_json.__feedback.latest.latency_ms ?? 'N/A'}ms</div>
                    ) : (
                      <div><b>最近反馈:</b> 暂无</div>
                    )}
                    <pre className="cr-json-box">{JSON.stringify(selectedDecision.input_json || {}, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="cr-bottom-grid">
        <SectionCard className={`role-card ${roleClass('gov')}`} title="路由洞察（近7天）">
          {loadingInsights ? <EmptyState title="加载中" description="正在分析路由决策..." icon="⏳" /> : !insights ? <EmptyState title="暂无洞察" description="执行决策后可生成洞察。" icon="📉" /> : (
            <div className="cr-insights-grid">
              <div className="cr-insight-block">
                <div className="cr-subtitle">按 route_type</div>
                {(insights.route_stats || []).length === 0 ? <div className="cost-routing-policy-meta">暂无记录</div> : (
                  <div className="cr-mini-table">
                    {(insights.route_stats || []).map((item) => (
                      <div className="cr-mini-row" key={item.route_type}>
                        <span>{item.route_type}</span>
                        <span>决策 {item.decisions}</span>
                        <span>反馈 {item.feedback_count}</span>
                        <span>成功率 {item.success_rate === null ? 'N/A' : `${Math.round(item.success_rate * 100)}%`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cr-insight-block">
                <div className="cr-subtitle">策略命中 Top</div>
                {(insights.policy_stats || []).length === 0 ? <div className="cost-routing-policy-meta">暂无记录</div> : (
                  <div className="cr-mini-table">
                    {(insights.policy_stats || []).slice(0, 8).map((item) => (
                      <div className="cr-mini-row" key={item.policy_id}>
                        <span>{item.policy_name}</span>
                        <span>命中 {item.hits}</span>
                        <span>均分 {item.avg_score === null ? 'N/A' : item.avg_score.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cr-insight-block">
                <div className="cr-head-row">
                  <div className="cr-subtitle">优化建议</div>
                  <div className="cr-action-row">
                    <button className="ui-btn" type="button" onClick={() => runOptimization('preview')} disabled={optimizing}>
                      {optimizing ? '计算中...' : '生成建议'}
                    </button>
                    <button className="ui-btn ui-btn-primary" type="button" onClick={() => runOptimization('apply')} disabled={optimizing}>
                      应用优化
                    </button>
                  </div>
                </div>
                {(insights.recommendations || []).length === 0 ? <div className="cost-routing-policy-meta">暂无建议</div> : (
                  <div className="cr-rec-list">
                    {(insights.recommendations || []).map((rec, i) => (
                      <div className={`cr-rec-item level-${rec.level}`} key={`${rec.level}-${i}`}>
                        <div><b>[{rec.level}]</b> {rec.message}</div>
                        <div className="cost-routing-policy-meta">{rec.suggestion}</div>
                      </div>
                    ))}
                  </div>
                )}
                {optimization ? (
                  <div className="cr-optimization-box">
                    <div className="cost-routing-policy-meta">
                      mode={optimization.mode} · proposals={optimization.proposal_count} · applied={optimization.applied_count}
                    </div>
                    {(optimization.proposals || []).slice(0, 6).map((proposal) => (
                      <div className="cr-opt-item" key={proposal.policy_id}>
                        <div>
                          <b>{proposal.policy_name}</b> · {proposal.task_type} · feedback={proposal.feedback_count}
                        </div>
                        <div className="cost-routing-policy-meta">
                          reasons: {(proposal.reasons || []).join(', ') || 'stable'}
                        </div>
                        <pre className="cr-json-box">{JSON.stringify({
                          from: proposal.current_weights,
                          to: proposal.suggested_weights,
                          metrics: proposal.metrics,
                        }, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard className={`role-card ${roleClass('exec')}`} title="决策反馈回填">
          <form onSubmit={handleAttachFeedback} className="cr-form-grid">
            <div className="cr-subtitle">对选中决策回填真实结果</div>
            <div className="cr-dual-row">
              <input className="ui-input" value={selectedDecisionId} disabled placeholder="请选择决策" />
              <select className="ui-select" value={feedbackOutcome} onChange={(e) => setFeedbackOutcome(e.target.value as any)}>
                <option value="success">success</option>
                <option value="partial">partial</option>
                <option value="failed">failed</option>
                <option value="timeout">timeout</option>
              </select>
            </div>
            <div className="cr-triple-row">
              <input className="ui-input" value={feedbackCost} onChange={(e) => setFeedbackCost(e.target.value)} placeholder="actual_cost（可选）" />
              <input className="ui-input" value={feedbackLatency} onChange={(e) => setFeedbackLatency(e.target.value)} placeholder="latency_ms（可选）" />
              <input className="ui-input" value={feedbackQuality} onChange={(e) => setFeedbackQuality(e.target.value)} placeholder="quality_score 0~1（可选）" />
            </div>
            <textarea className="ui-textarea" rows={3} value={feedbackNotes} onChange={(e) => setFeedbackNotes(e.target.value)} placeholder="备注（可选）" />
            <button className="ui-btn ui-btn-primary" type="submit" disabled={savingFeedback || !selectedDecisionId}>
              {savingFeedback ? '回填中...' : '提交反馈回填'}
            </button>
          </form>
        </SectionCard>
      </div>

      {error ? <div className="cost-routing-alert-error"><StatusBadge s="failed" /> {error}</div> : null}
      {msg ? <div className="cost-routing-alert-success"><StatusBadge s="success" /> {msg}</div> : null}
    </div>
  );
}
