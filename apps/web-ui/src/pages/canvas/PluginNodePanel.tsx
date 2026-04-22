/**
 * PluginNodePanel - 画布节点面板（Phase 1C）
 * 读取 /api/plugins/catalog，按 status 渲染节点
 * 不可执行、不允许连线
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBadge, EmptyState } from '../../components/ui';
import PluginDetailPanel from './PluginDetailPanel';

// ===== 类型定义 =====

interface PluginCatalogItem {
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
}

// ===== 样式配置 =====

const STATUS_STYLES: Record<string, { label: string; borderColor: string; bgColor: string; textColor: string; badge: string; enabled: boolean }> = {
  active: {
    label: 'Active',
    borderColor: '#10b981',
    bgColor: '#ecfdf5',
    textColor: '#065f46',
    badge: 'running',
    enabled: true,
  },
  trial: {
    label: 'Trial',
    borderColor: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#92400e',
    badge: 'pending',
    enabled: true,
  },
  frozen: {
    label: 'Frozen',
    borderColor: '#9ca3af',
    bgColor: '#f9fafb',
    textColor: '#4b5563',
    badge: 'cancelled',
    enabled: false,
  },
  planned: {
    label: 'Planned',
    borderColor: '#d1d5db',
    bgColor: '#f3f4f6',
    textColor: '#6b7280',
    badge: 'cancelled',
    enabled: false,
  },
  residual: {
    label: 'Residual',
    borderColor: '#6b7280',
    bgColor: '#f9fafb',
    textColor: '#9ca3af',
    badge: 'cancelled',
    enabled: false,
  },
};

const RISK_STYLES: Record<string, { borderWidth: number; marker: string }> = {
  LOW: { borderWidth: 1, marker: '' },
  MEDIUM: { borderWidth: 2, marker: '⚠️' },
  HIGH: { borderWidth: 3, marker: '🔴' },
  CRITICAL: { borderWidth: 3, marker: '🔒' },
};

const NODE_ICONS: Record<string, string> = {
  info: '💻',
  database: '📊',
  'file-text': '📄',
  scissors: '✂️',
  plug: '🔌',
  default: '🔧',
};

// ===== 辅助函数 =====

function getIcon(icon?: string): string {
  if (!icon) return NODE_ICONS.default;
  return NODE_ICONS[icon] || NODE_ICONS.default;
}

function getCategoryLabel(category: string): string {
  if (!category) return 'Other';
  const parts = category.split('/');
  if (parts.length === 2) {
    const icons: Record<string, string> = {
      system: '💻', data: '📊', vision: '👁️', reporting: '📈', ml: '🤖', network: '🌐',
    };
    return `${icons[parts[0]] || '📁'} ${parts[1]}`;
  }
  return `📁 ${category}`;
}

// ===== 组件 =====

export default function PluginNodePanel() {
  const [catalog, setCatalog] = useState<PluginCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginCatalogItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载 catalog
  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/plugins/catalog');
      const d = await r.json();
      if (d.ok) {
        setCatalog(d.catalog || []);
      } else {
        setError(d.error || 'Failed to load catalog');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // 过滤掉 residual 插件
  const visiblePlugins = useMemo(() =>
    catalog.filter(p => p.status !== 'residual'),
    [catalog]
  );

  // 按 category 分组
  const grouped = useMemo(() => {
    const g: Record<string, PluginCatalogItem[]> = {};
    visiblePlugins.forEach(p => {
      const cat = p.category || 'other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(p);
    });
    return g;
  }, [visiblePlugins]);

  // 点击节点 → 打开详情
  const handleNodeClick = useCallback((plugin: PluginCatalogItem) => {
    setSelectedPlugin(plugin);
    setShowDetail(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedPlugin(null);
  }, []);

  return (
    <>
      <div
        style={{
          width: 260,
          height: '100%',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🔌</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Plugin Nodes</span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                background: 'var(--bg-secondary)',
                padding: '1px 6px',
                borderRadius: 10,
              }}
            >
              {visiblePlugins.length}
            </span>
          </div>
          <button
            onClick={loadCatalog}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 12,
              color: 'var(--text-muted)',
              opacity: loading ? 0.5 : 1,
            }}
            title="Refresh"
          >
            ↻
          </button>
        </div>

        {/* Node list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : error ? (
            <div style={{ padding: 12, color: '#ef4444', fontSize: 12 }}>{error}</div>
          ) : visiblePlugins.length === 0 ? (
            <EmptyState icon="🧩" title="No plugins" description="No plugins in catalog." />
          ) : (
            Object.entries(grouped).map(([category, plugins]) => (
              <div key={category} style={{ marginBottom: 12 }}>
                {/* Category header */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    padding: '2px 4px',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {getCategoryLabel(category)}
                </div>

                {/* Plugin nodes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {plugins.map(plugin => {
                    const s = STATUS_STYLES[plugin.status] || STATUS_STYLES.active;
                    const risk = RISK_STYLES[plugin.risk_level] || RISK_STYLES.LOW;
                    const icon = getIcon(plugin.icon);
                    const isTrial = plugin.status === 'trial';
                    const isDisabled = !s.enabled;

                    return (
                      <div
                        key={plugin.plugin_id}
                        onClick={() => handleNodeClick(plugin)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: `${risk.borderWidth}px solid ${s.borderColor}`,
                          background: s.bgColor,
                          color: s.textColor,
                          cursor: 'pointer',
                          fontSize: 12,
                          transition: 'all 0.15s ease',
                          position: 'relative',
                          opacity: isDisabled ? 0.6 : 1,
                        }}
                        onMouseEnter={e => {
                          if (!isDisabled) {
                            (e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 8px ${s.borderColor}40`;
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
                          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        }}
                      >
                        {/* Trial warning */}
                        {isTrial && (
                          <div
                            style={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              background: '#f59e0b',
                              color: 'white',
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '1px 4px',
                              borderRadius: 8,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }}
                          >
                            TRIAL
                          </div>
                        )}

                        {/* Node content */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>{icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 12,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {plugin.name}
                            </div>
                            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>
                              {plugin.plugin_id}
                              {plugin.risk_level !== 'LOW' && (
                                <span style={{ marginLeft: 4, fontSize: 9 }}>
                                  {risk.marker} {plugin.risk_level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div
                          style={{
                            marginTop: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <StatusBadge s={s.badge as any} />
                          <span style={{ fontSize: 10, opacity: 0.6 }}>
                            {plugin.execution_mode}
                          </span>
                        </div>

                        {/* Trial note */}
                        {isTrial && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 10,
                              color: '#92400e',
                              fontStyle: 'italic',
                            }}
                          >
                            Dry-run only
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '6px 12px',
            borderTop: '1px solid var(--border-color)',
            fontSize: 10,
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          🔒 Nodes view-only • No execution
        </div>
      </div>

      {/* Detail panel */}
      {showDetail && selectedPlugin && (
        <PluginDetailPanel
          plugin={selectedPlugin}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
}
