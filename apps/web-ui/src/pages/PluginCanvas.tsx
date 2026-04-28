/**
 * PluginCanvas - 插件画布页面（Phase 1C）
 * 左侧：插件节点面板（可切换标签页）
 * 中间：React Flow DAG（插件节点展示，禁止拖拽/连线）
 * 右侧：节点详情面板
 *
 * Phase 1C 约束：
 * - 节点只读展示，不允许拖入/连线/执行
 * - trial 节点显示 warning
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Background, Controls, MarkerType, MiniMap,
  ReactFlow, useEdgesState, useNodesState,
  type Edge, type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EmptyState, PageHeader, SectionCard, StatusBadge } from '../components/ui';
import PluginDetailPanel from './canvas/PluginDetailPanel';
import '../components/ui/shared.css';
import './PluginCanvas.css';

const API = '/api';

// ===== 类型 =====
type CatalogPlugin = {
  plugin_id: string;
  name: string;
  version: string;
  category: string;
  status: 'active' | 'trial' | 'frozen' | 'planned' | 'residual';
  execution_mode: string;
  risk_level: string;
  enabled: boolean;
  requires_approval: boolean;
  dry_run_supported: boolean;
  ui_node_type: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
  permissions: string[];
  allowed_upstream: string[];
  allowed_downstream: string[];
  tags: string[];
};

type LeftTab = 'plugins' | 'workflows';

const STATUS_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  active: { border: 'var(--success)', bg: 'color-mix(in srgb, var(--success-light) 65%, var(--bg-surface))', text: 'var(--text-main)' },
  trial: { border: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning-light) 65%, var(--bg-surface))', text: 'var(--text-main)' },
  frozen: { border: 'var(--border-light)', bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' },
  planned: { border: 'var(--border)', bg: 'var(--bg-elevated)', text: 'var(--text-muted)' },
};

const ICONS: Record<string, string> = {
  info: '💻', database: '📊', 'file-text': '📄', scissors: '✂️',
  plug: '🔌', default: '🔧',
};

function getIcon(icon?: string) { return ICONS[icon || ''] || ICONS.default; }

function getCatLabel(cat: string) {
  const icons: Record<string, string> = { system:'💻', data:'📊', vision:'👁️', reporting:'📈', ml:'🤖', network:'🌐', other:'📁' };
  const parts = cat.split('/');
  if (parts.length === 2) return `${icons[parts[0]] || '📁'} ${parts[1]}`;
  return `📁 ${cat}`;
}

function normalizeCatalogItem(raw: any): CatalogPlugin {
  return {
    plugin_id: String(raw?.plugin_id || ''),
    name: String(raw?.name || raw?.plugin_id || 'unknown'),
    version: String(raw?.version || '0.0.0'),
    category: String(raw?.category || 'other'),
    status: (raw?.status || 'active') as CatalogPlugin['status'],
    execution_mode: String(raw?.execution_mode || 'readonly'),
    risk_level: String(raw?.risk_level || 'LOW'),
    enabled: !!raw?.enabled,
    requires_approval: !!raw?.requires_approval,
    dry_run_supported: raw?.dry_run_supported !== false,
    ui_node_type: String(raw?.ui_node_type || 'plugin'),
    icon: String(raw?.icon || 'default'),
    color: String(raw?.color || ''),
    description: String(raw?.description || ''),
    capabilities: Array.isArray(raw?.capabilities) ? raw.capabilities : [],
    permissions: Array.isArray(raw?.permissions) ? raw.permissions : [],
    allowed_upstream: Array.isArray(raw?.allowed_upstream) ? raw.allowed_upstream : [],
    allowed_downstream: Array.isArray(raw?.allowed_downstream) ? raw.allowed_downstream : [],
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
  };
}

// ===== 构建 Plugin DAG =====
function buildPluginDag(catalog: CatalogPlugin[]): { nodes: Node[]; edges: Edge[] } {
  const active = catalog.filter(p => p.status !== 'residual');
  if (active.length === 0) return { nodes: [], edges: [] };

  // 按 category 分列排布
  const cats: string[] = [];
  const byCat: Record<string, CatalogPlugin[]> = {};
  active.forEach(p => {
    const cat = p.category || 'other';
    if (!cats.includes(cat)) cats.push(cat);
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(p);
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const colW = 260, rowH = 130;
  const startX = 60, startY = 60;
  const headerH = 50;

  // Category 列头
  cats.forEach((cat, ci) => {
    nodes.push({
      id: `cat:${cat}`,
      type: 'input',
      data: { label: getCatLabel(cat) },
      position: { x: startX + ci * colW, y: startY },
      style: {
        width: 220, padding: '6px 12px',
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#64748b',
      },
      draggable: false,
      selectable: false,
    });
  });

  // Plugin 节点
  cats.forEach((cat, ci) => {
    byCat[cat].forEach((p, ri) => {
      const s = STATUS_COLORS[p.status] || STATUS_COLORS.planned;
      const isTrial = p.status === 'trial';
      const nodeId = `plugin:${p.plugin_id}`;
      const riskW = p.risk_level === 'MEDIUM' || p.risk_level === 'HIGH' ? 2 : 1;

      nodes.push({
        id: nodeId,
        data: {
          label: `${getIcon(p.icon)} ${p.name} v${p.version}\n${p.plugin_id}`,
          status: p.status,
          isTrial,
        },
        position: { x: startX + ci * colW, y: startY + headerH + ri * rowH },
        style: {
          width: 220, minHeight: 70,
          padding: '8px 12px',
          border: `${riskW}px solid ${s.border}`,
          borderRadius: 10,
          background: s.bg,
          color: s.text,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: isTrial ? `0 0 0 2px #f59e0b40` : undefined,
        },
        draggable: false,
      });

      // 边：从 allowed_upstream → 当前节点
      (p.allowed_upstream || []).forEach(upId => {
        edges.push({
          id: `e:${upId}->${p.plugin_id}`,
          source: `plugin:${upId}`,
          target: nodeId,
          markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
          style: { stroke: '#94a3b8', strokeWidth: 1.2, strokeDasharray: '4,3' },
        });
      });
    });
  });

  return { nodes, edges };
}

// ===== 主组件 =====
export default function PluginCanvas() {
  const [leftTab, setLeftTab] = useState<LeftTab>('plugins');
  const [catalog, setCatalog] = useState<CatalogPlugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<CatalogPlugin | null>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [busyPluginId, setBusyPluginId] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // 加载 catalog
  const loadCatalog = useCallback(async () => {
    setCatLoading(true);
    setCatError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const r = await fetch(`${API}/plugins/catalog`, { signal: controller.signal });
      if (r.ok) {
        const d = await r.json();
        if (d?._unauthorized) {
          setCatError('访问未授权，请检查身份认证配置');
          return;
        }
        if (Array.isArray(d?.catalog) && d.catalog.length > 0) {
          setCatalog(d.catalog.map(normalizeCatalogItem));
          return;
        }
      }
      const fallback = await fetch(`${API}/plugins/pool`, { signal: controller.signal });
      if (!fallback.ok) throw new Error(`HTTP ${fallback.status}`);
      const pd = await fallback.json();
      if (pd?._unauthorized) {
        setCatError('访问未授权，请检查身份认证配置');
        return;
      }
      const plugins = Array.isArray(pd?.plugins) ? pd.plugins : [];
      setCatalog(plugins.map(normalizeCatalogItem));
      setCatError('目录接口不可用，已回退到插件池数据');
    } catch (err: any) {
      setCatError(err?.name === 'AbortError' ? '请求超时，请检查 local-api 服务' : `加载失败：${String(err?.message || err)}`);
    } finally {
      clearTimeout(timer);
      setCatLoading(false);
    }
  }, []);

  const togglePlugin = useCallback(async (plugin: CatalogPlugin) => {
    if (plugin.status === 'trial' || plugin.status === 'frozen' || plugin.status === 'planned' || plugin.status === 'residual') return;
    setBusyPluginId(plugin.plugin_id);
    try {
      const r = await fetch(`${API}/plugins/${plugin.plugin_id}/${plugin.enabled ? 'disable' : 'enable'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d?.ok === false) {
        throw new Error(String(d?.error || `HTTP ${r.status}`));
      }
      await loadCatalog();
      setCatError('');
    } catch (err: any) {
      setCatError(`插件操作失败：${String(err?.message || err)}`);
    } finally {
      setBusyPluginId('');
    }
  }, [loadCatalog]);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  useEffect(() => {
    if (!selectedPlugin) return;
    const next = catalog.find((p) => p.plugin_id === selectedPlugin.plugin_id) || null;
    setSelectedPlugin(next);
  }, [catalog, selectedPlugin]);

  // 构建 DAG
  useEffect(() => {
    if (leftTab !== 'plugins') { setNodes([]); setEdges([]); return; }
    const { nodes: nds, edges: eds } = buildPluginDag(catalog || []);
    setNodes(nds);
    setEdges(eds);
  }, [catalog, leftTab, setNodes, setEdges]);

  // 点击节点
  const onNodeClick = useCallback((_: any, node: Node) => {
    if (node.id.startsWith('plugin:')) {
      const pid = node.id.replace('plugin:', '');
      const p = (catalog || []).find(pl => pl.plugin_id === pid);
      setSelectedPlugin(p || null);
    }
  }, [catalog]);

  return (
    <div className="page-root plugin-canvas-page">
      <PageHeader
        title="插件画布"
        subtitle="插件池与流程画布联动"
        actions={(
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/workflow-canvas" className="ui-btn ui-btn-ghost ui-btn-sm">流程画布</Link>
            <Link to="/plugin-pool" className="ui-btn ui-btn-ghost ui-btn-sm">插件池</Link>
            <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={loadCatalog} disabled={catLoading}>
              ↻
            </button>
          </div>
        )}
      />

      <div className="plugin-canvas-layout">
        {/* ===== 左侧：标签页切换 ===== */}
        <SectionCard title="" style={{ padding: 0 }}>
          <div className="plugin-tab-switch">
            {(['plugins','workflows'] as LeftTab[]).map(t => (
              <button key={t} onClick={() => setLeftTab(t)} className={leftTab === t ? 'active' : ''}>
                {t === 'plugins' ? '插件' : '工作流'}
              </button>
            ))}
          </div>
          {leftTab === 'plugins' ? (
            <div className="plugin-node-list" style={{ padding: 0 }}>
              {/* Inline PluginNodePanel */}
              <div style={{ padding: '8px 8px' }}>
                {catLoading ? (
                  <div style={{ padding:20, textAlign:'center', color:'var(--text-muted)' }}>加载中...</div>
                ) : catError ? (
                  <div style={{ padding: 12 }}>
                    <EmptyState icon="⚠️" title="插件目录加载失败" description={catError} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                      <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={loadCatalog}>重试</button>
                    </div>
                  </div>
                ) : catalog.length === 0 ? (
                  <EmptyState icon="🧩" title="无插件" description="No plugins registered. Run: pnpm aip:cli:doctor" />
                ) : (
                  Object.entries(
                    (catalog || []).filter(p => p.status !== 'residual').reduce<Record<string, CatalogPlugin[]>>((acc, p) => {
                      const cat = p.category || 'other';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(p);
                      return acc;
                    }, {})
                  ).map(([cat, plugins]) => (
                    <div key={cat} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', padding: '2px 4px', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {getCatLabel(cat)}
                      </div>
                      {plugins.map(p => {
                        const s = STATUS_COLORS[p.status] || STATUS_COLORS.planned;
                        const isTrial = p.status === 'trial';
                        const rColor = ({ LOW: '#15803d', MEDIUM: '#b45309', HIGH: '#dc2626', CRITICAL: '#991b1b' } as Record<string, string>)[p.risk_level] || '#6b7280';
                        const rBg = ({ LOW: '#f0fdf4', MEDIUM: '#fffbeb', HIGH: '#fef2f2', CRITICAL: '#fef2f2' } as Record<string, string>)[p.risk_level] || '#f9fafb';
                        return (
                          <div key={p.plugin_id} className="plugin-node-item" onClick={() => setSelectedPlugin(p)} style={{
                            border: `1px solid ${s.border}`, background: s.bg, color: s.text,
                          }}>
                            {isTrial && (
                              <div style={{ position: 'absolute', top: -6, right: -4, background: '#f59e0b', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>
                                试运行
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span>{getIcon(p.icon)}</span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: 10, opacity: 0.7 }}>
                                  {p.plugin_id}
                                </div>
                                <div style={{ display: 'flex', gap: 3, marginTop: 3, alignItems: 'center' }}>
                                  <span style={{ padding: '0 5px', borderRadius: 8, fontSize: 9, fontWeight: 700, background: rBg, color: rColor }}>
                                    {p.risk_level}
                                  </span>
                                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>v{p.version}</span>
                                  <Link
                                    to={`/audit?filter=plugin:${p.plugin_id}`}
                                    className="ui-btn ui-btn-ghost ui-btn-xs"
                                    style={{ fontSize: 9, padding: '0 4px', textDecoration: 'none', lineHeight: '16px' }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    📋
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <WorkflowList />
          )}
        </SectionCard>

        {/* ===== 中间：DAG 画布 ===== */}
        <SectionCard
          title={leftTab === 'plugins' ? `插件 DAG · ${(catalog || []).filter(p=>p.status!=='residual').length} 节点` : '画布'}
        >
          {!!catError && (
            <div style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb', color: '#92400e', fontSize: 11 }}>
              {catError}
            </div>
          )}
          <div className="plugin-canvas-flow-shell">
            {leftTab === 'plugins' ? (
              catLoading ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
                  <EmptyState message="正在加载画布..." />
                </div>
              ) : (catalog || []).filter(p => p.status !== 'residual').length === 0 ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:8 }}>
                  <span style={{ fontSize:40 }}>🧩</span>
                  <span style={{ color:'var(--text-muted)', fontSize:13 }}>目录中暂无插件</span>
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={true}
                  zoomOnScroll={true}
                  minZoom={0.3}
                  maxZoom={2}
                >
                  <MiniMap
                    pannable zoomable
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                  />
                  <Controls showInteractive={false} />
                  <Background gap={20} size={1} color="var(--border)" />
                </ReactFlow>
              )
            ) : (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:8 }}>
                <span style={{ fontSize:40 }}>📋</span>
                  <span style={{ color:'var(--text-muted)', fontSize:13 }}>切换到工作流标签页</span>
              </div>
            )}
          </div>

          <div className="plugin-canvas-banner">
            试运行插件保持只读；可在右侧详情启用/停用基础状态
          </div>
        </SectionCard>

        {/* ===== 右侧：详情 ===== */}
        <SectionCard title={selectedPlugin ? `${selectedPlugin.name} · 详情` : '详情'}>
          {!selectedPlugin ? (
            <EmptyState icon="🔌" message="点击左侧或画布节点查看详情" />
          ) : (
            <PluginDetailPanel
              plugin={selectedPlugin}
              onClose={() => setSelectedPlugin(null)}
              onToggleEnabled={() => togglePlugin(selectedPlugin)}
              busy={busyPluginId === selectedPlugin.plugin_id}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// ===== Workflow List (simplified) =====
function WorkflowList() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/workflow-jobs?limit=20`)
      .then(r => r.json())
      .then(d => setJobs(d.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:20, textAlign:'center', color:'var(--text-muted)' }}>加载中...</div>;
  if (jobs.length === 0) return <EmptyState icon="📭" message="暂无任务" />;

  return (
    <div style={{ padding: 12, maxHeight: 640, overflowY: 'auto' }}>
      {jobs.slice(0,20).map(j => (
        <Link key={j.id} to="/workflow-canvas" style={{
          display: 'block', padding: '8px 10px', borderRadius: 8, marginBottom: 6,
          border: '1px solid var(--border)', background: 'var(--bg-app)', textDecoration: 'none', color: 'inherit',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontWeight:700, fontSize:12 }}>{j.name || String(j.id).slice(0,12)}</div>
            <StatusBadge s={j.status} />
          </div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
            {j.template_name||'—'} · {j.completed_steps??0}/{j.total_steps??0}
          </div>
        </Link>
      ))}
    </div>
  );
}
