// v4.5.0 — Workflow Jobs 页面（Vision Surface + 链路增强）
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  StatusBadge,
  PageHeader,
  SectionCard,
  EmptyState,
  InfoTable,
  VisionSurfaceStrip,
  buildVisionSurfaceFromJobSteps,
  MainlineChainStrip,
  EntityLinkChips,
} from '../components/ui';
import '../components/ui/shared.css';

const API = '/api';
const LIMIT = 20;

const STEP_REQUIRED_INPUTS: Record<string, string[]> = {
  build_package: ['package_id'],
  publish_package: ['package_id'],
  deploy_revision: ['revision_id'],
  health_check: ['deployment_id'],
  rollback: ['rollback_point_id'],
};

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

function pretty(v: any) {
  return JSON.stringify(v ?? {}, null, 2);
}

function collectRequiredInputs(tpl: any): string[] {
  const out = new Set<string>();
  const schemaRequired = tpl?.input_schema_json?.required;
  if (Array.isArray(schemaRequired)) {
    schemaRequired.forEach((k: any) => { if (typeof k === 'string') out.add(k); });
  }
  const steps = Array.isArray(tpl?.workflow_steps_json) ? tpl.workflow_steps_json : [];
  steps.forEach((s: any) => {
    const stepKey = typeof s?.step_key === 'string' ? s.step_key : '';
    (STEP_REQUIRED_INPUTS[stepKey] || []).forEach((k) => out.add(k));
  });
  return Array.from(out);
}

function parseMaybeJson(v: any) {
  if (!v) return {};
  if (typeof v === 'object') return v;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch {
      return {};
    }
  }
  return {};
}

function collectEntityRefs(job: any, steps: any[]) {
  const refs = new Map<string, { label: string; to: string; value: string }>();
  const payloads = [parseMaybeJson(job?.input_json), parseMaybeJson(job?.input_payload), parseMaybeJson(job?.output_json)];

  (steps || []).forEach((s: any) => {
    payloads.push(parseMaybeJson(s?.input_json));
    payloads.push(parseMaybeJson(s?.output_json?.output || s?.output_json));
  });

  const ingest = (obj: any) => {
    const modelId = obj?.model_id || obj?.detector_model_id;
    const datasetId = obj?.dataset_id;
    const artifactId = obj?.artifact_id || obj?.handoff_id || obj?.mask_artifact_id || obj?.segmentation_id;
    const runId = obj?.run_id || obj?.tracker_run_id || obj?.rule_run_id;
    const evaluationId = obj?.evaluation_id || obj?.verification_id;
    const taskId = obj?.task_id || obj?.source_task_id;
    if (modelId) refs.set(`model-${modelId}`, { label: 'Model', to: '/models', value: String(modelId) });
    if (datasetId) refs.set(`dataset-${datasetId}`, { label: 'Dataset', to: '/datasets', value: String(datasetId) });
    if (artifactId) refs.set(`artifact-${artifactId}`, { label: 'Artifact', to: '/artifacts', value: String(artifactId) });
    if (runId) refs.set(`run-${runId}`, { label: 'Run', to: '/runs', value: String(runId) });
    if (evaluationId) refs.set(`eval-${evaluationId}`, { label: 'Evaluation', to: '/evaluations', value: String(evaluationId) });
    if (taskId) refs.set(`task-${taskId}`, { label: 'Task', to: '/tasks', value: String(taskId) });
  };

  payloads.forEach(ingest);
  return Array.from(refs.values()).slice(0, 8);
}

// StepBadge（workflow 特有）
function StepBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: '#6B7280',
    running: '#3B82F6',
    success: '#10B981',
    failed: '#EF4444',
    skipped: '#9CA3AF',
    retrying: '#F59E0B',
  };
  const c = colors[status] || '#6B7280';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      background: c + '22',
      color: c,
    }}>
      {status}
    </span>
  );
}

function ApprovalBadge({ status, policy }: { status?: string; policy?: string }) {
  if (!status || !policy) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
  const cfg: Record<string, { color: string; label: string }> = {
    approved: { color: '#10B981', label: 'Approved' },
    rejected: { color: '#EF4444', label: 'Rejected' },
    expired: { color: '#8B5CF6', label: 'Expired' },
    cancelled: { color: '#6B7280', label: 'Cancelled' },
    pending: { color: '#F59E0B', label: policy === 'manual' ? 'Pending Approval' : `Pending (${policy})` },
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

const STEP_COLORS: Record<string, string> = {
  pending: '#6B7280',
  running: '#3B82F6',
  succeeded: '#10B981',
  completed: '#10B981',
  success: '#10B981',
  failed: '#EF4444',
  cancelled: '#F59E0B',
  blocked: '#8B5CF6',
  skipped: '#EAB308',
};

function StepTimeline({ steps, activeStepId, onStepClick }: { steps: any[]; activeStepId?: string; onStepClick?: (id: string) => void }) {
  if (!steps || steps.length === 0) return null;
  const sorted = [...steps].sort((a, b) => (Number(a.step_order ?? 0) - Number(b.step_order ?? 0)));
  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'center', padding: '12px 0', overflow: 'auto' }}>
      {sorted.map((step, idx) => {
        const color = STEP_COLORS[step.status] || '#6B7280';
        const isActive = step.id === activeStepId;
        return (
          <React.Fragment key={step.id}>
            <div
              onClick={() => onStepClick?.(step.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: onStepClick ? 'pointer' : 'default', minWidth: 80,
                opacity: step.status === 'pending' ? 0.4 : 1,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isActive ? color : 'transparent',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                color: isActive ? '#fff' : color,
                transition: 'all 0.2s',
              }}>
                {step.status === 'succeeded' || step.status === 'completed' || step.status === 'success' ? '✓' :
                 step.status === 'failed' ? '✗' :
                 step.status === 'running' ? '●' :
                 step.status === 'cancelled' ? '—' :
                 step.status === 'blocked' ? '⊘' :
                 step.status === 'skipped' ? '→' : String(idx + 1)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {step.step_name || step.step_key || `Step ${idx + 1}`}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {step.status}
              </div>
            </div>
            {idx < sorted.length - 1 && (
              <div style={{ flex: 1, height: 2, background: color, opacity: 0.3, minWidth: 20, margin: '0 4px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function WorkflowJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [jobSteps, setJobSteps] = useState<any[]>([]);
  const [jobApprovals, setJobApprovals] = useState<any[]>([]);
  const [jobReflections, setJobReflections] = useState<any[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<any | null>(null);
  const [failureSignatures, setFailureSignatures] = useState<any[]>([]);
  const [errorPatterns, setErrorPatterns] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleActionPending, setRuleActionPending] = useState('');
  const [ruleFilterStepKey, setRuleFilterStepKey] = useState('');
  const [ruleFilterTemplateId, setRuleFilterTemplateId] = useState('');
  const [ruleFilterMode, setRuleFilterMode] = useState('all');
  const [ruleFilterEnabled, setRuleFilterEnabled] = useState('all');
  const [ruleFilterStatus, setRuleFilterStatus] = useState('all');
  const [ruleFilterCandidate, setRuleFilterCandidate] = useState('all');
  const [detailLoading, setDetailLoading] = useState(false);

  const [templates, setTemplates] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [createInputJson, setCreateInputJson] = useState('{\n  \n}');

  const [pendingAction, setPendingAction] = useState('');

  const filtered = jobs.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (search && !j.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/workflow-jobs?limit=${LIMIT}&offset=${(p - 1) * LIMIT}`);
      const d = await r.json();
      setJobs(d.jobs || []);
      setTotal(d.total || 0);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const fetchRules = async (ctx?: { stepKey?: string; templateId?: string }) => {
    setRulesLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      const stepKey = (ctx?.stepKey ?? ruleFilterStepKey).trim();
      const templateId = (ctx?.templateId ?? ruleFilterTemplateId).trim();
      if (stepKey) params.set('step_key', stepKey);
      if (templateId) params.set('template_id', templateId);
      if (ruleFilterMode !== 'all') params.set('mode', ruleFilterMode);
      if (ruleFilterEnabled !== 'all') params.set('enabled', ruleFilterEnabled === 'enabled' ? '1' : '0');
      if (ruleFilterStatus !== 'all') params.set('status', ruleFilterStatus);
      if (ruleFilterCandidate !== 'all') params.set('candidate_level', ruleFilterCandidate);
      const r = await fetch(`${API}/learned-rules?${params.toString()}`);
      const d = await r.json();
      const list = d.learned_rules || [];
      setRules(list);
      if (!selectedRule || !list.find((x: any) => x.id === selectedRule.id)) setSelectedRule(list[0] || null);
    } catch {
      setRules([]);
      setSelectedRule(null);
    }
    setRulesLoading(false);
  };

  const refreshSelectedRule = async (ruleId: string) => {
    try {
      const r = await fetch(`${API}/learned-rules/${ruleId}`);
      const d = await r.json();
      if (d.ok !== false && d.learned_rule) {
        setSelectedRule(d.learned_rule);
        setRules((prev) => prev.map((x) => x.id === ruleId ? d.learned_rule : x));
      }
    } catch { /* silent */ }
  };

  const setRuleEnabled = async (ruleId: string, enabled: boolean) => {
    setRuleActionPending(`${enabled ? 'enable' : 'disable'}:${ruleId}`);
    try {
      const r = await fetch(`${API}/learned-rules/${ruleId}/${enabled ? 'enable' : 'disable'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const d = await r.json();
      if (d.ok !== false && d.learned_rule) {
        setRules((prev) => prev.map((x) => x.id === ruleId ? d.learned_rule : x));
        if (selectedRule?.id === ruleId) setSelectedRule(d.learned_rule);
      } else {
        alert(d.error || 'rule update failed');
      }
    } catch { /* silent */ }
    setRuleActionPending('');
  };

  const setRuleMode = async (ruleId: string, mode: string) => {
    setRuleActionPending(`mode:${ruleId}`);
    try {
      const r = await fetch(`${API}/learned-rules/${ruleId}/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const d = await r.json();
      if (d.ok !== false && d.learned_rule) {
        setRules((prev) => prev.map((x) => x.id === ruleId ? d.learned_rule : x));
        if (selectedRule?.id === ruleId) setSelectedRule(d.learned_rule);
      } else {
        alert(d.error || 'mode change failed');
      }
    } catch { /* silent */ }
    setRuleActionPending('');
  };

  const requestRulePromotion = async (ruleId: string) => {
    setRuleActionPending(`promote-request:${ruleId}`);
    try {
      const r = await fetch(`${API}/learned-rules/${ruleId}/promote-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requested_by: 'ui-operator' }),
      });
      const d = await r.json();
      if (d.ok !== false && d.learned_rule) {
        setRules((prev) => prev.map((x) => x.id === ruleId ? d.learned_rule : x));
        if (selectedRule?.id === ruleId) setSelectedRule(d.learned_rule);
      } else {
        alert(d.error || 'promote request failed');
      }
    } catch { /* silent */ }
    setRuleActionPending('');
  };

  const reviewRulePromotion = async (ruleId: string, approve: boolean) => {
    setRuleActionPending(`promote-${approve ? 'approve' : 'reject'}:${ruleId}`);
    try {
      const r = await fetch(`${API}/learned-rules/${ruleId}/${approve ? 'promote-approve' : 'promote-reject'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed_by: 'ui-operator' }),
      });
      const d = await r.json();
      if (d.ok !== false && d.learned_rule) {
        setRules((prev) => prev.map((x) => x.id === ruleId ? d.learned_rule : x));
        if (selectedRule?.id === ruleId) setSelectedRule(d.learned_rule);
      } else {
        alert(d.error || 'promotion review failed');
      }
    } catch { /* silent */ }
    setRuleActionPending('');
  };

  const setRuleFreeze = async (ruleId: string, freeze: boolean) => {
    setRuleActionPending(`${freeze ? 'freeze' : 'unfreeze'}:${ruleId}`);
    try {
      const r = await fetch(`${API}/learned-rules/${ruleId}/${freeze ? 'freeze' : 'unfreeze'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'ui-operator' }),
      });
      const d = await r.json();
      if (d.ok !== false && d.learned_rule) {
        setRules((prev) => prev.map((x) => x.id === ruleId ? d.learned_rule : x));
        if (selectedRule?.id === ruleId) setSelectedRule(d.learned_rule);
      } else {
        alert(d.error || 'freeze action failed');
      }
    } catch { /* silent */ }
    setRuleActionPending('');
  };

  const submitRuleFeedback = async (ruleId: string, feedbackType: 'useful' | 'useless' | 'adopted' | 'ignored', stepId?: string) => {
    if (!selectedJob) return;
    setRuleActionPending(`feedback:${ruleId}:${feedbackType}`);
    try {
      const r = await fetch(`${API}/learned-rules/${ruleId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_type: feedbackType,
          job_id: selectedJob.id,
          step_id: stepId || '',
          created_by: 'ui-operator',
        }),
      });
      const d = await r.json();
      if (d.ok !== false) {
        await refreshSelectedRule(ruleId);
        await fetchRules();
      } else {
        alert(d.error || 'feedback failed');
      }
    } catch { /* silent */ }
    setRuleActionPending('');
  };

  const refreshJobDetail = async () => {
    if (!selectedJob) return;
    setDetailLoading(true);
    try {
      const failedStepKeys = (jobSteps || []).filter((s: any) => s.status === 'failed').map((s: any) => s.step_key).filter(Boolean);
      const stepKey = failedStepKeys[0] || '';
      const [sr, ar, rr, fr, er] = await Promise.all([
        fetch(`${API}/workflow-jobs/${selectedJob.id}/steps`),
        fetch(`${API}/approvals?resource_id=${selectedJob.id}`),
        fetch(`${API}/task-reflections?job_id=${selectedJob.id}&limit=5`),
        fetch(`${API}/failure-signatures?limit=8${stepKey ? `&step_key=${encodeURIComponent(stepKey)}` : ''}`),
        fetch(`${API}/error-patterns?limit=8${stepKey ? `&step_key=${encodeURIComponent(stepKey)}` : ''}`),
      ]);
      const [sd, ad, rd, fd, ed] = await Promise.all([sr.json(), ar.json(), rr.json(), fr.json(), er.json()]);
      setJobSteps(sd.steps || []);
      setJobApprovals(ad.approvals || ad.items || []);
      const reflections = rd.task_reflections || [];
      setJobReflections(reflections);
      setSelectedReflection(reflections[0] || null);
      setFailureSignatures(fd.failure_signatures || []);
      setErrorPatterns(ed.error_patterns || []);
      const failedStepKeysFresh = (sd.steps || []).filter((s: any) => s.status === 'failed').map((s: any) => s.step_key).filter(Boolean);
      await fetchRules({ stepKey: failedStepKeysFresh[0] || '', templateId: selectedJob.template_id || '' });
    } catch { /* silent */ }
    setDetailLoading(false);
  };

  const openJob = async (j: any) => {
    setSelectedJob(j);
    setSelectedStepId(null);
    setJobSteps([]);
    setJobApprovals([]);
    setJobReflections([]);
    setSelectedReflection(null);
    setFailureSignatures([]);
    setErrorPatterns([]);
    setRules([]);
    setSelectedRule(null);
    setDetailLoading(true);
    try {
      const [sr, ar, rr, fr, er] = await Promise.all([
        fetch(`${API}/workflow-jobs/${j.id}/steps`),
        fetch(`${API}/approvals?resource_id=${j.id}`),
        fetch(`${API}/task-reflections?job_id=${j.id}&limit=5`),
        fetch(`${API}/failure-signatures?limit=8`),
        fetch(`${API}/error-patterns?limit=8`),
      ]);
      const [sd, ad, rd, fd, ed] = await Promise.all([sr.json(), ar.json(), rr.json(), fr.json(), er.json()]);
      setJobSteps(sd.steps || []);
      setJobApprovals(ad.approvals || ad.items || []);
      const reflections = rd.task_reflections || [];
      setJobReflections(reflections);
      setSelectedReflection(reflections[0] || null);
      setFailureSignatures(fd.failure_signatures || []);
      setErrorPatterns(ed.error_patterns || []);
      const failedStepKeys = (sd.steps || []).filter((s: any) => s.status === 'failed').map((s: any) => s.step_key).filter(Boolean);
      await fetchRules({ stepKey: failedStepKeys[0] || '', templateId: j.template_id || '' });
    } catch { /* silent */ }
    setDetailLoading(false);
  };

  const doAction = async (action: 'start' | 'cancel') => {
    if (!selectedJob) return;
    setPendingAction(action);
    try {
      const r = await fetch(`${API}/workflow-jobs/${selectedJob.id}/${action}`, { method: 'POST' });
      const d = await r.json();
      if (d.ok !== false) {
        await fetchJobs(page);
        await refreshJobDetail();
      }
    } catch { /* silent */ }
    setPendingAction('');
  };

  const doRetryStep = async (stepId: string) => {
    if (!selectedJob) return;
    setPendingAction('retry:' + stepId);
    try {
      await fetch(`${API}/workflow-jobs/${selectedJob.id}/steps/${stepId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      await refreshJobDetail();
    } catch { /* silent */ }
    setPendingAction('');
  };

  const doApproveStep = async (stepId: string) => {
    if (!selectedJob) return;
    setPendingAction('approve:' + stepId);
    try {
      const approval = jobApprovals.find((a: any) => a.step_id === stepId && a.status === 'pending');
      if (!approval) { alert('No pending approval'); return; }
      const r = await fetch(`${API}/approvals/${approval.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed_by: 'ui-operator' }),
      });
      const d = await r.json();
      if (d.ok !== false) {
        await refreshJobDetail();
        await fetchJobs(page);
      }
    } catch { /* silent */ }
    setPendingAction('');
  };

  const openCreate = async () => {
    setCreating(true);
    try {
      const r = await fetch(`${API}/workflow-jobs`);
      const d = await r.json();
      const list = (d.templates || []).filter((t: any) => t.status === 'active' && Array.isArray(t.workflow_steps_json) && t.workflow_steps_json.length > 0);
      setTemplates(list);
      setSelectedTemplateId(list[0]?.id || '');
      if (list[0]) {
        const defaultInput = list[0].default_input_json && typeof list[0].default_input_json === 'object' ? list[0].default_input_json : {};
        setCreateInputJson(pretty(defaultInput));
      }
    } catch { setTemplates([]); }
    setCreating(false);
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!createName.trim() || !selectedTemplateId) return;
    setCreating(true);
    try {
      let parsedInput = {};
      try { parsedInput = createInputJson.trim() ? JSON.parse(createInputJson) : {}; }
      catch { alert('Input JSON 格式错误'); return; }
      const r = await fetch(`${API}/workflow-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName.trim(), template_id: selectedTemplateId, input: parsedInput }),
      });
      const d = await r.json();
      if (d.ok !== false) {
        setShowCreate(false);
        fetchJobs(page);
      } else { alert(d.error || '创建失败'); }
    } catch { /* silent */ }
    setCreating(false);
  };

  useEffect(() => { fetchJobs(page); }, [page, fetchJobs]);

  const canStart = selectedJob && (selectedJob.status === 'pending' || selectedJob.status === 'paused');
  const canCancel = selectedJob && selectedJob.status === 'running';
  const visionItems = useMemo(() => buildVisionSurfaceFromJobSteps(jobSteps), [jobSteps]);
  const entityRefs = useMemo(() => collectEntityRefs(selectedJob, jobSteps), [selectedJob, jobSteps]);
  const runningCount = jobs.filter((j) => j.status === 'running').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;

  return (
    <div className="page-root" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <PageHeader
        title="Workflow Jobs"
        subtitle={`${filtered.length} / ${total} 条`}
        summaryStrip={
          <div className="page-summary-strip">
            <div className="page-summary-item">
              <div className="page-summary-label">running</div>
              <div className="page-summary-value">{runningCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">completed</div>
              <div className="page-summary-value">{completedCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">failed</div>
              <div className="page-summary-value">{failedCount}</div>
            </div>
            <div className="page-summary-item">
              <div className="page-summary-label">selected template</div>
              <div className="page-summary-value" style={{ fontSize: 14 }}>
                {selectedJob?.template_name || '暂无记录'}
              </div>
            </div>
          </div>
        }
        actions={<button className="ui-btn ui-btn-primary" onClick={openCreate}>+ Create Job</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left Panel - Job List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <SectionCard title="筛选" actions={<button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={() => fetchJobs(page)}>↻</button>}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select className="ui-select" style={{ width: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input className="ui-input" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
            </div>
          </SectionCard>

          <SectionCard title={`Jobs (${filtered.length})`}>
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {loading && <EmptyState message="Loading..." />}
              {!loading && filtered.length === 0 && <EmptyState icon="📋" message="No Workflow Jobs" />}
              {!loading && filtered.map(j => (
                <div
                  key={j.id}
                  onClick={() => openJob(j)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: selectedJob?.id === j.id ? 'var(--primary-light)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-main)' }}>{j.name}</span>
                    <StatusBadge s={j.status} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {j.template_name || j.template_id?.slice(0, 8) || '—'} · {j.completed_steps ?? 0}/{j.total_steps ?? 0} steps · {timeAgo(j.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Pagination */}
          {total > LIMIT && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0' }}>
              <button className="ui-btn ui-btn-outline ui-btn-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{page} / {Math.ceil(total / LIMIT)}</span>
              <button className="ui-btn ui-btn-outline ui-btn-xs" disabled={page * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>

        {/* Right Panel - Job Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {!selectedJob ? (
            <EmptyState icon="📋" message="Select a job to view details" />
          ) : (
            <>
              {/* Job Header */}
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{selectedJob.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      {selectedJob.id} · {selectedJob.template_name || '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={refreshJobDetail}>刷新</button>
                    {canStart && <button className="ui-btn ui-btn-primary ui-btn-sm" disabled={!!pendingAction} onClick={() => doAction('start')}>Start</button>}
                    {canCancel && <button className="ui-btn ui-btn-outline ui-btn-sm" disabled={!!pendingAction} onClick={() => doAction('cancel')}>Cancel</button>}
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => setSelectedJob(null)}>Close</button>
                  </div>
                </div>
              </SectionCard>

              {/* Job Info */}
              <SectionCard title="Job Info">
                <InfoTable rows={[
                  { label: 'Status', value: <StatusBadge s={selectedJob.status} /> },
                  { label: 'Progress', value: `${selectedJob.completed_steps ?? 0} / ${selectedJob.total_steps ?? 0} steps` },
                  { label: 'Created', value: fmtTs(selectedJob.created_at) },
                  { label: 'Finished', value: selectedJob.finished_at ? fmtTs(selectedJob.finished_at) : '暂无完成时间' },
                ]} />
              </SectionCard>

              <SectionCard title="Status Timeline">
                {detailLoading ? (
                  <EmptyState message="Loading..." />
                ) : jobSteps.length === 0 ? (
                  <EmptyState icon="⚙" message="No steps to display" />
                ) : (
                  <>
                    <StepTimeline steps={jobSteps} activeStepId={selectedStepId || undefined} onStepClick={setSelectedStepId} />
                    {selectedStepId && (() => {
                      const step = jobSteps.find((s: any) => s.id === selectedStepId);
                      if (!step) return null;
                      return (
                        <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                            {step.step_name || step.step_key} — Step Details
                          </div>
                          {step.input_json != null && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>input_json</div>
                              <pre style={{ margin: 0, fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', background: 'var(--bg-elevated)', padding: 8, borderRadius: 6 }}>{pretty(step.input_json)}</pre>
                            </div>
                          )}
                          {step.output_json != null && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>output_json</div>
                              <pre style={{ margin: 0, fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', background: 'var(--bg-elevated)', padding: 8, borderRadius: 6 }}>{pretty(step.output_json)}</pre>
                            </div>
                          )}
                          {step.error_message && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#EF4444', marginBottom: 4 }}>error_message</div>
                              <pre style={{ margin: 0, fontSize: 11, whiteSpace: 'pre-wrap', background: '#EF444422', padding: 8, borderRadius: 6 }}>{step.error_message}</pre>
                            </div>
                          )}
                          {step.logs && step.logs.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>logs</div>
                              <div style={{ maxHeight: 200, overflow: 'auto', background: '#1a1a2e', borderRadius: 6, padding: 8, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.5 }}>
                                {(Array.isArray(step.logs) ? step.logs : [step.logs]).map((log: any, i: number) => (
                                  <div key={i} style={{ color: '#d4d4d4' }}>
                                    {typeof log === 'string' ? log : JSON.stringify(log)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </SectionCard>

              <SectionCard title="Recent Reflection Hint">
                {(() => {
                  const hint = parseMaybeJson(selectedJob?.output_summary_json)?.reflection_hint;
                  if (!hint) return <EmptyState icon="🧠" message="暂无同模板复盘摘要" />;
                  return (
                    <InfoTable rows={[
                      { label: 'Status', value: hint.status || '—' },
                      { label: 'Root Cause', value: hint.root_cause || '—' },
                      { label: 'Next Rule Draft', value: hint.next_time_rule_draft || '—' },
                      { label: 'From Reflection', value: hint.reflection_id || '—' },
                    ]} />
                  );
                })()}
              </SectionCard>

              <SectionCard title="Risk Hints">
                {(() => {
                  const hints = parseMaybeJson(selectedJob?.output_summary_json)?.risk_hints;
                  if (!Array.isArray(hints) || hints.length === 0) return <EmptyState icon="🧭" message="暂无风险建议" />;
                  return (
                    <div className="ui-table-wrap">
                      <table className="ui-table">
                        <thead>
                          <tr>
                            <th>step_key</th>
                            <th>error_type</th>
                            <th>mode</th>
                            <th>confidence</th>
                            <th>hit_count</th>
                            <th>reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hints.map((h: any, idx: number) => (
                            <tr key={h.pattern_id || idx}>
                              <td>{h.step_key || '—'}</td>
                              <td>{h.error_type || '—'}</td>
                              <td>{h.mode || 'suggest'}</td>
                              <td>{h.confidence ?? '—'}</td>
                              <td>{h.hit_count ?? 0}</td>
                              <td style={{ fontSize: 12 }}>{h.reason || (Array.isArray(h.recommended_actions) ? h.recommended_actions[0] || '—' : '—')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </SectionCard>

              <SectionCard title="Step Failure Suggestions">
                {(() => {
                  const ss = parseMaybeJson(selectedJob?.output_summary_json)?.step_suggestions;
                  const suggestions = Array.isArray(ss?.suggestions) ? ss.suggestions : [];
                  if (suggestions.length === 0) return <EmptyState icon="🛠" message="暂无失败建议（任务未失败或暂无模式）" />;
                  return (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <InfoTable rows={[
                        { label: 'failed_step_key', value: ss?.failed_step_key || '—' },
                        { label: 'error_type', value: ss?.error_type || '—' },
                      ]} />
                      {suggestions.map((x: any, i: number) => (
                        <div key={x.rule_id || i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>
                            [{x.mode || 'suggest'} | conf={x.confidence ?? '—'}] {x.rule_code || '—'}
                          </div>
                          <div style={{ fontSize: 12, marginTop: 4 }}>{x.reason || '—'}</div>
                          <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-muted)' }}>
                            status={x.status || 'active'} · candidate={x.candidate_level || 'none'} · quality={x.quality_score ?? '—'}
                            {x.eligible_for_promotion ? ' · eligible_for_promotion' : ''}
                          </div>
                          {x.mode === 'manual_only' && (
                            <div style={{ marginTop: 6, padding: 8, borderRadius: 6, background: 'var(--bg-secondary)' }}>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>人工处理建议（manual_only）</div>
                              <div style={{ fontSize: 12, marginTop: 4 }}>{x.manual_only_reason || '该规则被标记为 manual_only，禁止自动执行。'}</div>
                              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12 }}>
                                {(Array.isArray(x.manual_actions) ? x.manual_actions : []).map((a: any, idx: number) => (
                                  <li key={idx}>{String(a)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <details style={{ marginTop: 6 }}>
                            <summary style={{ cursor: 'pointer', fontSize: 12 }}>Evidence</summary>
                            <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', fontSize: 11 }}>
                              {pretty(x.evidence_refs || {})}
                            </pre>
                          </details>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                            <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending.startsWith(`feedback:${x.rule_id}:`)} onClick={() => submitRuleFeedback(x.rule_id, 'useful', ss?.failed_step_id)}>有用</button>
                            <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending.startsWith(`feedback:${x.rule_id}:`)} onClick={() => submitRuleFeedback(x.rule_id, 'useless', ss?.failed_step_id)}>无用</button>
                            <button className="ui-btn ui-btn-xs ui-btn-success" disabled={ruleActionPending.startsWith(`feedback:${x.rule_id}:`)} onClick={() => submitRuleFeedback(x.rule_id, 'adopted', ss?.failed_step_id)}>已采纳</button>
                            <button className="ui-btn ui-btn-xs ui-btn-outline" disabled={ruleActionPending.startsWith(`feedback:${x.rule_id}:`)} onClick={() => submitRuleFeedback(x.rule_id, 'ignored', ss?.failed_step_id)}>忽略</button>
                            <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending === `promote-request:${x.rule_id}`} onClick={() => requestRulePromotion(x.rule_id)}>申请晋级</button>
                            <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending === `freeze:${x.rule_id}`} onClick={() => setRuleFreeze(x.rule_id, true)}>冻结</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </SectionCard>

              <SectionCard title="Phase3 Rule Feedback">
                {(() => {
                  const rf = parseMaybeJson(selectedJob?.output_summary_json)?.phase3_rule_feedback;
                  const diagnostics = Array.isArray(rf?.diagnostics) ? rf.diagnostics : [];
                  if (diagnostics.length === 0) return <EmptyState icon="🧪" message="暂无半自动诊断反馈" />;
                  return (
                    <InfoTable rows={[
                      { label: 'scope', value: rf.scope || '—' },
                      { label: 'generated_at', value: rf.generated_at || '—' },
                      {
                        label: 'diagnostics',
                        value: (
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 11 }}>
                            {pretty(diagnostics)}
                          </pre>
                        ),
                      },
                    ]} />
                  );
                })()}
              </SectionCard>

              <SectionCard title="Rules Governance">
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input className="ui-input" placeholder="step_key 过滤" value={ruleFilterStepKey} onChange={e => setRuleFilterStepKey(e.target.value)} style={{ width: 180 }} />
                    <input className="ui-input" placeholder="template_id 过滤" value={ruleFilterTemplateId} onChange={e => setRuleFilterTemplateId(e.target.value)} style={{ width: 220 }} />
                    <select className="ui-select" value={ruleFilterMode} onChange={e => setRuleFilterMode(e.target.value)} style={{ width: 130 }}>
                      <option value="all">All Modes</option>
                      <option value="suggest">suggest</option>
                      <option value="semi_auto">semi_auto</option>
                      <option value="manual_only">manual_only</option>
                    </select>
                    <select className="ui-select" value={ruleFilterEnabled} onChange={e => setRuleFilterEnabled(e.target.value)} style={{ width: 130 }}>
                      <option value="all">all</option>
                      <option value="enabled">enabled</option>
                      <option value="disabled">disabled</option>
                    </select>
                    <select className="ui-select" value={ruleFilterStatus} onChange={e => setRuleFilterStatus(e.target.value)} style={{ width: 130 }}>
                      <option value="all">all status</option>
                      <option value="active">active</option>
                      <option value="watch">watch</option>
                      <option value="frozen">frozen</option>
                    </select>
                    <select className="ui-select" value={ruleFilterCandidate} onChange={e => setRuleFilterCandidate(e.target.value)} style={{ width: 180 }}>
                      <option value="all">all candidate</option>
                      <option value="none">none</option>
                      <option value="eligible_for_promotion">eligible_for_promotion</option>
                      <option value="candidate_semi_auto">candidate_semi_auto</option>
                    </select>
                    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={() => fetchRules()}>查询规则</button>
                  </div>

                  {rulesLoading ? (
                    <EmptyState message="Loading rules..." />
                  ) : rules.length === 0 ? (
                    <EmptyState icon="🧾" message="暂无规则（可先执行失败链路生成）" />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="ui-table-wrap" style={{ maxHeight: 260, overflowY: 'auto' }}>
                        <table className="ui-table">
                          <thead>
                            <tr>
                              <th>rule_code</th>
                              <th>mode</th>
                              <th>status</th>
                              <th>enabled</th>
                              <th>quality</th>
                              <th>confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rules.map((r: any) => (
                              <tr key={r.id} onClick={() => setSelectedRule(r)} style={{ cursor: 'pointer', background: selectedRule?.id === r.id ? 'var(--primary-light)' : undefined }}>
                                <td>{r.rule_code}</td>
                                <td>{r.mode}</td>
                                <td>{r.status || 'active'}</td>
                                <td>{Number(r.enabled) === 1 ? 'yes' : 'no'}</td>
                                <td>{r.quality_score ?? 0}</td>
                                <td>{r.confidence}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        {!selectedRule ? (
                          <EmptyState message="选择一条规则查看详情" />
                        ) : (
                          <div style={{ display: 'grid', gap: 8 }}>
                            <InfoTable rows={[
                              { label: 'rule_code', value: selectedRule.rule_code },
                              { label: 'scope', value: selectedRule.scope },
                              { label: 'mode', value: selectedRule.mode },
                              { label: 'enabled', value: Number(selectedRule.enabled) === 1 ? 'true' : 'false' },
                              { label: 'status', value: selectedRule.status || 'active' },
                              { label: 'candidate_level', value: selectedRule.candidate_level || 'none' },
                              { label: 'approval_required', value: Number(selectedRule.approval_required) === 1 ? 'true' : 'false' },
                              { label: 'confidence', value: String(selectedRule.confidence ?? '—') },
                              { label: 'quality_score', value: String(selectedRule.quality_score ?? selectedRule.stats?.quality_score ?? 0) },
                              { label: 'step_key', value: selectedRule.step_key || '—' },
                              { label: 'template_id', value: selectedRule.template_id || '—' },
                              { label: 'promotion_requested_at', value: selectedRule.promotion_requested_at || '—' },
                              { label: 'promotion_reviewed_at', value: selectedRule.promotion_reviewed_at || '—' },
                              { label: 'promotion_reviewed_by', value: selectedRule.promotion_reviewed_by || '—' },
                            ]} />
                            {selectedRule.mode === 'manual_only' && (
                              <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 8, fontSize: 12 }}>
                                <div style={{ fontWeight: 600 }}>manual_only 说明</div>
                                <div style={{ marginTop: 4 }}>{selectedRule.action_json?.manual_only_reason || '该规则只允许人工处理，不允许自动执行。'}</div>
                                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                                  {(Array.isArray(selectedRule.action_json?.manual_actions) ? selectedRule.action_json.manual_actions : []).map((x: any, idx: number) => (
                                    <li key={idx}>{String(x)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <InfoTable rows={[
                              { label: 'matched', value: String(selectedRule.stats?.matched_count ?? 0) },
                              { label: 'executed', value: String(selectedRule.stats?.executed_count ?? 0) },
                              { label: 'blocked', value: String(selectedRule.stats?.blocked_count ?? 0) },
                              { label: 'feedback(useful/useless/adopted/ignored)', value: `${selectedRule.stats?.feedback?.useful ?? 0}/${selectedRule.stats?.feedback?.useless ?? 0}/${selectedRule.stats?.feedback?.adopted ?? 0}/${selectedRule.stats?.feedback?.ignored ?? 0}` },
                              { label: 'execution_rate', value: String(selectedRule.stats?.execution_rate ?? 0) },
                              { label: 'positive_feedback_rate', value: String(selectedRule.stats?.positive_feedback_rate ?? 0) },
                              { label: 'noise_rate', value: String(selectedRule.stats?.noise_rate ?? 0) },
                              { label: 'quality_score(dynamic)', value: String(selectedRule.stats?.quality_score ?? 0) },
                            ]} />
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button className="ui-btn ui-btn-xs ui-btn-success" disabled={ruleActionPending === `enable:${selectedRule.id}` || Number(selectedRule.enabled) === 1} onClick={() => setRuleEnabled(selectedRule.id, true)}>启用</button>
                              <button className="ui-btn ui-btn-xs ui-btn-outline" disabled={ruleActionPending === `disable:${selectedRule.id}` || Number(selectedRule.enabled) === 0} onClick={() => setRuleEnabled(selectedRule.id, false)}>停用</button>
                              <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending === `mode:${selectedRule.id}`} onClick={() => setRuleMode(selectedRule.id, 'suggest')}>设为 suggest</button>
                              <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending === `mode:${selectedRule.id}`} onClick={() => setRuleMode(selectedRule.id, 'semi_auto')}>设为 semi_auto</button>
                              <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending === `mode:${selectedRule.id}`} onClick={() => setRuleMode(selectedRule.id, 'manual_only')}>设为 manual_only</button>
                              <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending === `promote-request:${selectedRule.id}`} onClick={() => requestRulePromotion(selectedRule.id)}>申请晋级</button>
                              <button className="ui-btn ui-btn-xs ui-btn-ghost" disabled={ruleActionPending === `promote-approve:${selectedRule.id}`} onClick={() => reviewRulePromotion(selectedRule.id, true)}>批准晋级</button>
                              <button className="ui-btn ui-btn-xs ui-btn-outline" disabled={ruleActionPending === `promote-reject:${selectedRule.id}`} onClick={() => reviewRulePromotion(selectedRule.id, false)}>拒绝晋级</button>
                              <button className="ui-btn ui-btn-xs ui-btn-outline" disabled={ruleActionPending === `freeze:${selectedRule.id}` || selectedRule.status === 'frozen'} onClick={() => setRuleFreeze(selectedRule.id, true)}>冻结</button>
                              <button className="ui-btn ui-btn-xs ui-btn-success" disabled={ruleActionPending === `unfreeze:${selectedRule.id}` || selectedRule.status !== 'frozen'} onClick={() => setRuleFreeze(selectedRule.id, false)}>解冻</button>
                            </div>
                            <details>
                              <summary>trigger / action 详情</summary>
                              <pre style={{ marginTop: 6, fontSize: 11, whiteSpace: 'pre-wrap' }}>
                                {pretty({ trigger_json: selectedRule.trigger_json, action_json: selectedRule.action_json })}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title={`Task Reflections (${jobReflections.length})`}>
                {jobReflections.length === 0 ? (
                  <EmptyState icon="📝" message="当前 Job 暂无复盘草稿" />
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {jobReflections.map((r: any) => (
                        <button
                          key={r.id}
                          className={`ui-btn ui-btn-xs ${selectedReflection?.id === r.id ? 'ui-btn-primary' : 'ui-btn-ghost'}`}
                          onClick={() => setSelectedReflection(r)}
                        >
                          {r.status} · {timeAgo(r.created_at)}
                        </button>
                      ))}
                    </div>
                    {selectedReflection && (
                      <InfoTable rows={[
                        { label: 'what_failed', value: selectedReflection.what_failed || '—' },
                        { label: 'what_worked', value: selectedReflection.what_worked || '—' },
                        { label: 'root_cause', value: selectedReflection.root_cause || '—' },
                        { label: 'wrong_assumption', value: selectedReflection.wrong_assumption || '—' },
                        { label: 'fix_applied', value: selectedReflection.fix_applied || '—' },
                        { label: 'next_time_rule_draft', value: selectedReflection.next_time_rule_draft || '—' },
                        {
                          label: 'evidence',
                          value: (
                            <details>
                              <summary>查看 evidence_json</summary>
                              <pre style={{ marginTop: 6, fontSize: 11, whiteSpace: 'pre-wrap' }}>
                                {pretty(selectedReflection.evidence_json || {})}
                              </pre>
                            </details>
                          )
                        },
                      ]} />
                    )}
                  </div>
                )}
              </SectionCard>

              <SectionCard title={`Failure Signatures (${failureSignatures.length})`}>
                {failureSignatures.length === 0 ? (
                  <EmptyState icon="🔎" message="暂无失败模式记录" />
                ) : (
                  <div className="ui-table-wrap">
                    <table className="ui-table">
                      <thead>
                        <tr>
                          <th>step_key</th>
                          <th>error_type</th>
                          <th>message_fingerprint</th>
                          <th>hit_count</th>
                          <th>last_seen_at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failureSignatures.map((s: any) => (
                          <tr key={s.id}>
                            <td>{s.step_key}</td>
                            <td>{s.error_type}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(s.message_fingerprint || '').slice(0, 64)}</td>
                            <td>{s.hit_count}</td>
                            <td>{fmtTs(s.last_seen_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              <SectionCard title={`Error Patterns (${errorPatterns.length})`}>
                {errorPatterns.length === 0 ? (
                  <EmptyState icon="📚" message="暂无 error pattern 聚类结果" />
                ) : (
                  <div className="ui-table-wrap">
                    <table className="ui-table">
                      <thead>
                        <tr>
                          <th>pattern_name</th>
                          <th>step_key</th>
                          <th>error_type</th>
                          <th>hit_count</th>
                          <th>last_seen_at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorPatterns.map((p: any) => (
                          <tr key={p.id}>
                            <td>{p.pattern_name || '—'}</td>
                            <td>{p.step_key || '—'}</td>
                            <td>{p.error_type || '—'}</td>
                            <td>{p.hit_count ?? 0}</td>
                            <td>{fmtTs(p.last_seen_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              {/* v4.6.0 — Mainline Chain */}
              <SectionCard title="主线链路">
                <MainlineChainStrip
                  compact
                  current={selectedJob.id}
                  chain={[
                    { type: 'workflow_job' as const, id: selectedJob.id, label: selectedJob.name, status: selectedJob.status },
                    ...(entityRefs.filter(r => r.label === 'Model').map(r => ({ type: 'model' as const, id: r.value, label: 'Model' }))),
                    ...(entityRefs.filter(r => r.label === 'Dataset').map(r => ({ type: 'dataset' as const, id: r.value, label: 'Dataset' }))),
                    ...(entityRefs.filter(r => r.label === 'Artifact').map(r => ({ type: 'artifact' as const, id: r.value, label: 'Artifact' }))),
                    ...(entityRefs.filter(r => r.label === 'Evaluation').map(r => ({ type: 'evaluation' as const, id: r.value, label: 'Evaluation' }))),
                  ]}
                />
              </SectionCard>

              {/* v4.6.0 — Linked Entities with EntityLinkChips */}
              <SectionCard
                title="Linked Entities"
                description="Workflow Job -> Model / Dataset / Artifact / Run / Evaluation"
              >
                {entityRefs.length > 0 ? (
                  <EntityLinkChips
                    label="关联对象"
                    entities={entityRefs.map(r => ({
                      type: (r.label.toLowerCase() || 'artifact') as any,
                      id: r.value,
                      label: `${r.label}: ${r.value.slice(0, 8)}…`,
                      status: undefined,
                    }))}
                  />
                ) : (
                  <EmptyState
                    title="暂无关联对象"
                    description="当前任务还未解析出 model / dataset / artifact 等关联实体。"
                  />
                )}
              </SectionCard>

              {/* Steps */}
              <SectionCard title={`Steps (${jobSteps.length})`}>
                {detailLoading ? (
                  <EmptyState message="Loading..." />
                ) : jobSteps.length === 0 ? (
                  <EmptyState icon="⚙" message="No steps" />
                ) : (
                  <div className="ui-table-wrap">
                    <table className="ui-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Step</th>
                          <th>Status</th>
                          <th>Started</th>
                          <th>Finished</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobSteps.map((s, i) => (
                          <tr key={s.id}>
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{s.step_name || s.step_key}</td>
                            <td><StepBadge status={s.status} /></td>
                            <td style={{ fontSize: 11 }}>{s.started_at ? timeAgo(s.started_at) : '—'}</td>
                            <td style={{ fontSize: 11 }}>{s.finished_at ? timeAgo(s.finished_at) : '—'}</td>
                            <td>
                              {s.status === 'failed' && (
                                <button className="ui-btn ui-btn-ghost ui-btn-xs" disabled={pendingAction === 'retry:' + s.id} onClick={() => doRetryStep(s.id)}>
                                  {pendingAction === 'retry:' + s.id ? '...' : 'Retry'}
                                </button>
                              )}
                              {s.status === 'pending' && jobApprovals.find((a: any) => a.step_id === s.id && a.status === 'pending') && (
                                <button className="ui-btn ui-btn-success ui-btn-xs" disabled={pendingAction === 'approve:' + s.id} onClick={() => doApproveStep(s.id)}>
                                  {pendingAction === 'approve:' + s.id ? '...' : 'Approve'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </>
          )}
        </div>
        </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 20, width: 500, maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Create Workflow Job</h3>
            <div className="form-group">
              <label className="form-label">Job Name</label>
              <input className="ui-input" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Enter job name" />
            </div>
            <div className="form-group">
              <label className="form-label">Template</label>
              <select className="ui-select" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
                {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Input JSON</label>
              <textarea className="ui-input" rows={6} value={createInputJson} onChange={e => setCreateInputJson(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button className="ui-btn ui-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="ui-btn ui-btn-primary" disabled={creating || !createName.trim()} onClick={handleCreate}>{creating ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

