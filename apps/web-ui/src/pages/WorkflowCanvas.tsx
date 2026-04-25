import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EmptyState, PageHeader, SectionCard, StatusBadge } from '../components/ui';
import '../components/ui/shared.css';
import './WorkflowCanvas.css';

const API = '/api';
const LIMIT = 30;

const STEP_COLORS: Record<string, string> = {
  pending: '#6B7280',
  running: '#3B82F6',
  success: '#10B981',
  failed: '#EF4444',
  skipped: '#9CA3AF',
  retrying: '#F59E0B',
};

const normalizeStepStatus = (value: string): string => {
  if (value === 'completed') return 'success';
  return value || 'pending';
};

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

function buildGraph(job: any, steps: any[]): { nodes: Node[]; edges: Edge[] } {
  const startNode: Node = {
    id: `job:${job.id}`,
    data: { label: `Workflow Job\n${job.name || String(job.id).slice(0, 8)}` },
    position: { x: 80, y: 160 },
    style: {
      width: 220,
      borderRadius: 12,
      border: '1px solid #0EA5E9',
      background: 'linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 100%)',
      color: '#0B5E8E',
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'pre-line',
      padding: '8px 10px',
    },
  };

  const sorted = [...steps].sort((a, b) => (Number(a.step_order ?? 0) - Number(b.step_order ?? 0)));
  const nodes: Node[] = [startNode];
  const edges: Edge[] = [];
  const levelGap = 230;
  const rowGap = 110;

  sorted.forEach((s, i) => {
    const status = normalizeStepStatus(s.status);
    const color = STEP_COLORS[status] || STEP_COLORS.pending;
    const col = i + 1;
    const row = i % 2;
    const stepNodeId = `step:${s.id}`;
    nodes.push({
      id: stepNodeId,
      data: { label: `${i + 1}. ${s.step_name || s.step_key || 'step'}\n${status}` },
      position: { x: 80 + col * levelGap, y: 90 + row * rowGap },
      style: {
        width: 220,
        borderRadius: 12,
        border: `1px solid ${color}`,
        background: `${color}14`,
        color: '#0F172A',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'pre-line',
        padding: '8px 10px',
      },
    });
    const sourceId = i === 0 ? startNode.id : `step:${sorted[i - 1].id}`;
    edges.push({
      id: `e:${sourceId}->${stepNodeId}`,
      source: sourceId,
      target: stepNodeId,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: { stroke: color, strokeWidth: 1.6 },
      animated: status === 'running',
    });
  });

  return { nodes, edges };
}

export default function WorkflowCanvas() {
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight') || '';
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const r = await fetch(`${API}/workflow-jobs?limit=${LIMIT}&offset=0`);
      const d = await r.json();
      const list = d.jobs || [];
      setJobs(list);
      if (list.length === 0) {
        setSelectedJob(null);
        return;
      }
      const next = highlight ? list.find((j: any) => j.id === highlight) || list[0] : list[0];
      setSelectedJob(next);
    } catch {
      setJobs([]);
      setSelectedJob(null);
    }
    setLoadingJobs(false);
  }, [highlight]);

  const fetchSteps = useCallback(async (job: any) => {
    if (!job) return;
    setLoadingSteps(true);
    try {
      const r = await fetch(`${API}/workflow-jobs/${job.id}/steps`);
      const d = await r.json();
      const stepList = d.steps || [];
      setSteps(stepList);
      const graph = buildGraph(job, stepList);
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setSelectedNodeId(`job:${job.id}`);
    } catch {
      setSteps([]);
      setNodes([]);
      setEdges([]);
      setSelectedNodeId('');
    }
    setLoadingSteps(false);
  }, [setEdges, setNodes]);

  useEffect(() => { fetchJobs(); const int = setInterval(fetchJobs, 10000); return () => clearInterval(int); }, [fetchJobs]);
  useEffect(() => { if (selectedJob) { fetchSteps(selectedJob); const int = setInterval(() => fetchSteps(selectedJob), 10000); return () => clearInterval(int); } }, [selectedJob, fetchSteps]);

  const onNodeClick = useCallback<NodeMouseHandler>((_evt, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedPayload = useMemo(() => {
    if (!selectedNodeId) return null;
    if (selectedNodeId.startsWith('job:')) return { type: 'job', data: selectedJob };
    if (!selectedNodeId.startsWith('step:')) return null;
    const stepId = selectedNodeId.replace('step:', '');
    return { type: 'step', data: steps.find((s) => String(s.id) === stepId) || null };
  }, [selectedNodeId, selectedJob, steps]);

  return (
    <div className="page-root workflow-canvas-page">
      <PageHeader
        title="Workflow Canvas V1"
        subtitle="React Flow"
        actions={(
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="ui-btn ui-btn-ghost ui-btn-sm" to="/workflow-jobs">列表模式</Link>
            <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={fetchJobs}>刷新</button>
          </div>
        )}
      />

      <div className="workflow-canvas-layout">
        <SectionCard title={`Workflow Jobs (${jobs.length})`}>
          {loadingJobs ? (
            <EmptyState message="加载中..." />
          ) : jobs.length === 0 ? (
            <EmptyState icon="📭" title="暂无任务" description="尚未创建 workflow jobs。" />
          ) : (
            <div className="workflow-job-list">
              {jobs.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setSelectedJob(j)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 12px',
                    marginBottom: 8,
                    background: selectedJob?.id === j.id ? 'var(--primary-light)' : 'var(--bg-app)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>{j.name || String(j.id).slice(0, 12)}</div>
                    <StatusBadge s={j.status} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {j.template_name || '—'} · {j.completed_steps ?? 0}/{j.total_steps ?? 0}
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title={selectedJob ? `画布 · ${selectedJob.name}` : '画布'}>
          <div className="workflow-canvas-flow-shell">
            {loadingSteps ? (
              <div style={{ padding: 18 }}><EmptyState message="加载中..." /></div>
            ) : !selectedJob ? (
              <div style={{ padding: 18 }}><EmptyState icon="🧭" message="请选择工作流任务" /></div>
            ) : (
              <ReactFlow
                fitView
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
              >
                <MiniMap pannable zoomable />
                <Controls showInteractive={false} />
                <Background gap={16} size={1} />
              </ReactFlow>
            )}
          </div>
        </SectionCard>

        <SectionCard title="节点详情">
          {!selectedPayload?.data ? (
            <EmptyState icon="ℹ️" message="点击画布节点查看详情" />
          ) : selectedPayload.type === 'job' ? (
            <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
              <div><strong>类型:</strong> Workflow Job</div>
              <div><strong>ID:</strong> {selectedPayload.data.id}</div>
              <div><strong>名称:</strong> {selectedPayload.data.name || '—'}</div>
              <div><strong>状态:</strong> <StatusBadge s={selectedPayload.data.status} /></div>
              <div><strong>模板:</strong> {selectedPayload.data.template_name || selectedPayload.data.template_id || '—'}</div>
              <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginTop: 6 }}>
                {JSON.stringify(parseMaybeJson(selectedPayload.data.input_json || selectedPayload.data.input_payload), null, 2)}
              </pre>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
              <div><strong>类型:</strong> Step</div>
              <div><strong>ID:</strong> {selectedPayload.data?.id || '—'}</div>
              <div><strong>名称:</strong> {selectedPayload.data?.step_name || selectedPayload.data?.step_key || '—'}</div>
              <div><strong>状态:</strong> <StatusBadge s={normalizeStepStatus(selectedPayload.data?.status)} /></div>
              <div><strong>序号:</strong> {selectedPayload.data?.step_order ?? '—'}</div>
              <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginTop: 6 }}>
                {JSON.stringify(parseMaybeJson(selectedPayload.data?.output_json), null, 2)}
              </pre>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

