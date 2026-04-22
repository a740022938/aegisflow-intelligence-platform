import React, { useCallback, useState } from 'react';

interface PluginDetailItem {
  plugin_id: string;
  name: string;
  version: string;
  category: string;
  status: string;
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

const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: '启用', color: '#10b981', bg: '#ecfdf5' },
  trial: { label: '试运行', color: '#f59e0b', bg: '#fffbeb' },
  frozen: { label: '冻结', color: '#9ca3af', bg: '#f9fafb' },
  planned: { label: '规划中', color: '#6b7280', bg: '#f3f4f6' },
  residual: { label: '残留', color: '#6b7280', bg: '#f9fafb' },
};

const RISK_INFO: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: 'LOW', color: '#10b981', bg: '#ecfdf5' },
  MEDIUM: { label: 'MEDIUM', color: '#f59e0b', bg: '#fffbeb' },
  HIGH: { label: 'HIGH', color: '#ef4444', bg: '#fef2f2' },
  CRITICAL: { label: 'CRITICAL', color: '#dc2626', bg: '#fef2f2' },
};

const EXEC_MODE_INFO: Record<string, { label: string; color: string }> = {
  readonly: { label: '只读', color: '#3b82f6' },
  side_effect: { label: '可产生副作用', color: '#f59e0b' },
  resource_intensive: { label: '高资源消耗', color: '#8b5cf6' },
};

interface Props {
  plugin: PluginDetailItem;
  onClose: () => void;
  onToggleEnabled?: () => void;
  busy?: boolean;
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </div>
  );
}

export default function PluginDetailPanel({ plugin, onClose, onToggleEnabled, busy = false }: Props) {
  const [copied, setCopied] = useState(false);

  const sInfo = STATUS_INFO[plugin.status] || STATUS_INFO.active;
  const rInfo = RISK_INFO[plugin.risk_level] || RISK_INFO.LOW;
  const mInfo = EXEC_MODE_INFO[plugin.execution_mode] || EXEC_MODE_INFO.readonly;
  const isTrial = plugin.status === 'trial';
  const isFrozen = plugin.status === 'frozen';
  const isPlanned = plugin.status === 'planned';
  const isNotExecutable = isTrial || isFrozen || isPlanned;

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(plugin.plugin_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [plugin.plugin_id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 680, overflowY: 'auto', paddingRight: 2 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{plugin.name}</div>
          <div
            onClick={handleCopyId}
            title="点击复制"
            style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}
          >
            <code style={{ background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>{plugin.plugin_id}</code>
            <span style={{ fontSize: 10 }}>{copied ? '✅' : '📋'}</span>
          </div>
        </div>
        <button type="button" className="ui-btn ui-btn-ghost ui-btn-xs" onClick={onClose}>关闭</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: sInfo.bg, color: sInfo.color }}>{sInfo.label}</span>
        <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: rInfo.bg, color: rInfo.color }}>{rInfo.label}</span>
        <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>v{plugin.version}</span>
      </div>

      {isTrial && (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: '#fffbeb', border: '1px solid #f59e0b', fontSize: 11, color: '#78350f' }}>
          <strong>试运行模式：</strong>执行已阻止，仅支持 dry-run。
        </div>
      )}
      {isFrozen && (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f9fafb', border: '1px solid #9ca3af', fontSize: 11, color: '#6b7280' }}>
          <strong>冻结：</strong>执行已阻止，如需恢复请联系管理员。
        </div>
      )}
      {isPlanned && (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f3f4f6', border: '1px solid #d1d5db', fontSize: 11, color: '#6b7280' }}>
          <strong>规划中：</strong>暂不可执行。
        </div>
      )}

      {plugin.description && (
        <div>
          <BlockTitle>描述</BlockTitle>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{plugin.description}</div>
        </div>
      )}

      <div>
        <BlockTitle>执行信息</BlockTitle>
        <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>执行模式</span><span style={{ color: mInfo.color, fontWeight: 600 }}>{mInfo.label}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>需要审批</span><span style={{ fontWeight: 600 }}>{plugin.requires_approval ? '✅ 是' : '❌ 否'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Dry Run</span><span style={{ fontWeight: 600 }}>{plugin.dry_run_supported ? '✅ 支持' : '❌ 不支持'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>节点类型</span><span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{plugin.ui_node_type}</span></div>
        </div>
      </div>

      {plugin.capabilities?.length > 0 && (
        <div>
          <BlockTitle>能力</BlockTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {plugin.capabilities.map((cap) => <span key={cap} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: '#eff6ff', color: '#1d4ed8' }}>{cap}</span>)}
          </div>
        </div>
      )}

      {plugin.permissions?.length > 0 && (
        <div>
          <BlockTitle>权限</BlockTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {plugin.permissions.map((perm) => <span key={perm} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: '#fdf4ff', color: '#7e22ce' }}>{perm}</span>)}
          </div>
        </div>
      )}

      {(plugin.allowed_upstream?.length > 0 || plugin.allowed_downstream?.length > 0) && (
        <div>
          <BlockTitle>链路</BlockTitle>
          <div style={{ display: 'grid', gap: 4, fontSize: 12 }}>
            {plugin.allowed_upstream?.length > 0 && <div><span style={{ color: 'var(--text-muted)' }}>上游: </span>{plugin.allowed_upstream.join(', ')}</div>}
            {plugin.allowed_downstream?.length > 0 && <div><span style={{ color: 'var(--text-muted)' }}>下游: </span>{plugin.allowed_downstream.join(', ')}</div>}
          </div>
        </div>
      )}

      {plugin.tags?.length > 0 && (
        <div>
          <BlockTitle>标签</BlockTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {plugin.tags.map((tag) => <span key={tag} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{tag}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
        {onToggleEnabled && !isNotExecutable && (
          <button type="button" className={`ui-btn ui-btn-sm ${plugin.enabled ? 'ui-btn-outline' : 'ui-btn-success'}`} onClick={onToggleEnabled} disabled={busy}>
            {busy ? '处理中...' : plugin.enabled ? '停用插件' : '启用插件'}
          </button>
        )}
        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>
          画布模式：基础操作可用，分析执行交给 OpenClaw
        </div>
      </div>
    </div>
  );
}
