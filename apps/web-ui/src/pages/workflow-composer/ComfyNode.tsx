// ============================================================
// ComfyNode.tsx — ComfyUI 风格节点组件
// 支持折叠、类型配色、端口、帮助按钮
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeResizeControl } from '@xyflow/react';
import type { NodeTypeConfig, PortConfig } from './NodeTypes';
import { getNodeConfig, getTypeColor } from './NodeTypes';
import './ComfyNode.css';

interface ComfyNodeData {
  label: string;
  nodeType: string;
  params: Record<string, unknown>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onShowHelp?: () => void;
  runStatus?: 'idle' | 'pending' | 'queued' | 'running' | 'success' | 'failed' | 'blocked' | 'skipped';
  runProgress?: number;
  runMessage?: string;
  runStepKey?: string;
  runStepOrder?: number;
  onFocusDryRunStep?: (stepKey?: string, stepOrder?: number) => void;
  issueLevel?: 'error' | 'warning';
  issueCount?: number;
  issueText?: string;
  issueTrend?: 'up' | 'down' | 'same';
  issueHistory?: number[];
  // ── ComfyUI化 v1: 节点就绪状态 ──
  readinessState?: 'idle' | 'ready' | 'missing_input' | 'missing_param' | 'invalid_link';
  readinessLabel?: string;
  readinessMissingInputs?: string[];
  readinessMissingParams?: string[];
  readinessInvalidLinks?: Array<{ reason: string }>;
}

// 端口类型中文映射（ComfyUI化 v1: F2 端口类型可视化）
const PORT_TYPE_LABELS: Record<string, string> = {
  video: '视频',
  image_batch: '帧序列',
  image: '图像',
  dataset: '数据集',
  split_manifest: '切分清单',
  train_config: '训练配置',
  checkpoint: '检查点',
  model: '模型',
  metrics: '指标',
  report: '报告',
  labels: '标注',
  annotations: '标注数据',
  detections: '检测结果',
  masks: '分割掩码',
  badcases: '坏案例',
  artifact: '产物',
  classifications: '分类结果',
  tracks: '跟踪轨迹',
  any: '任意',
};

function getPortTypeLabel(type: string): string {
  return PORT_TYPE_LABELS[type] || type.replace(/_/g, ' ');
}

// 端口组件 — ComfyUI化 v1: 清晰显示类型 + hover tooltip
function NodePort({
  config,
  position,
  isInput,
  isConnected,
}: {
  config: PortConfig;
  position: Position;
  isInput: boolean;
  isConnected?: boolean;
}) {
  const colors = getTypeColor(config.type);
  const typeLabel = getPortTypeLabel(config.type);

  return (
    <div className={`comfy-port ${isInput ? 'comfy-port--input' : 'comfy-port--output'}`} title={`${isInput ? '输入' : '输出'}: ${config.type} (${typeLabel})`}>
      <Handle
        type={isInput ? 'target' : 'source'}
        position={position}
        id={`${isInput ? 'in' : 'out'}_${config.name}`}
        className="comfy-handle"
        style={{
          background: colors.border,
          borderColor: colors.border,
          boxShadow: isConnected ? `0 0 8px ${colors.glow}` : 'none',
        }}
      />
      <span
        className="comfy-port-dot"
        style={{ background: colors.border }}
        title={`类型: ${config.type}`}
      />
      <span className="comfy-port-label" title={config.description || config.label}>
        {config.label}
      </span>
      {/* ComfyUI化 v1: 显示端口类型名称 */}
      <span className="comfy-port-type" title={config.description || `类型: ${config.type}`}>
        {typeLabel}
      </span>
      {/* ComfyUI化 v1: 未连接时类型标红提示 */}
      {!isConnected && isInput && (
        <span className="comfy-port-disconnected" title="未连接">⚠</span>
      )}
    </div>
  );
}

// 参数预览（折叠时显示）
function ParamPreview({ params, config }: { params: Record<string, unknown>; config: NodeTypeConfig }) {
  const entries = Object.entries(params).slice(0, 3);
  if (entries.length === 0) return null;
  
  return (
    <div className="comfy-param-preview">
      {entries.map(([key, value]) => (
        <div key={key} className="comfy-param-preview-item">
          <span className="comfy-param-key">{key}:</span>
          <span className="comfy-param-value">
            {typeof value === 'string' ? value : JSON.stringify(value).slice(0, 20)}
          </span>
        </div>
      ))}
    </div>
  );
}

// 主节点组件 — 使用 any 绕过 @xyflow/react v12 NodeProps 泛型约束
export function ComfyNode({ id, data, selected }: any) {
  const nodeData = data as ComfyNodeData;
  const config = getNodeConfig(nodeData.nodeType as any);
  const [collapsed, setCollapsed] = useState(nodeData.collapsed ?? false);
  const [showHelp, setShowHelp] = useState(false);
  const [showIssuePanel, setShowIssuePanel] = useState(false);
  const [issueIndex, setIssueIndex] = useState(0);

  useEffect(() => {
    setCollapsed(!!nodeData.collapsed);
  }, [nodeData.collapsed]);

  const issueItems = (nodeData.issueText ? String(nodeData.issueText).split('|').map((s) => s.trim()).filter(Boolean) : []);
  const issueTotal = issueItems.length;
  const safeIssueIndex = Math.min(issueIndex, Math.max(0, issueTotal - 1));
  const currentIssueRaw = issueItems[safeIssueIndex] || '';
  const isErrorIssue = currentIssueRaw.startsWith('[E]');
  const issueBody = currentIssueRaw.replace(/^\[(E|W)\]\s*/i, '');

  useEffect(() => {
    setIssueIndex(0);
  }, [nodeData.issueText, nodeData.issueLevel, nodeData.issueCount]);
  
  const handleToggle = useCallback(() => {
    setCollapsed(v => !v);
    nodeData.onToggleCollapse?.();
  }, [nodeData]);
  
  const handleHelp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHelp(v => !v);
    nodeData.onShowHelp?.();
  }, [nodeData]);

  const handleIssueBadgeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowIssuePanel(v => !v);
  }, []);
  
  const colors = {
    border: config.borderColor,
    bg: config.bgColor,
    glow: config.glowColor,
  };

  const runStatus = nodeData.runStatus || '';
  const runProgress = Math.max(0, Math.min(100, Number(nodeData.runProgress || 0)));
  const issueCount = Math.max(0, Number(nodeData.issueCount || 0));
  const issueLevel = nodeData.issueLevel;
  const issueTrend = nodeData.issueTrend;

  // ── ComfyUI化 v1: F4 节点就绪状态 ──────────────────────────────────
  const readinessState = nodeData.readinessState || 'idle';
  const readinessLabel = nodeData.readinessLabel;
  const readinessMissingInputs = nodeData.readinessMissingInputs || [];
  const readinessMissingParams = nodeData.readinessMissingParams || [];

  // 就绪状态样式
  const READINESS_STYLES: Record<string, { bg: string; color: string; border: string; label: string; short: string }> = {
    idle:          { bg: 'rgba(100,116,139,0.2)',   color: '#9CA3AF', border: 'rgba(100,116,139,0.5)',  label: '空闲',    short: '○' },
    ready:         { bg: 'rgba(34,197,94,0.2)',     color: '#86efac', border: 'rgba(34,197,94,0.5)',    label: '就绪',    short: '✓' },
    missing_input: { bg: 'rgba(245,158,11,0.2)',    color: '#fcd34d', border: 'rgba(245,158,11,0.5)',   label: '缺输入',  short: '?' },
    missing_param: { bg: 'rgba(249,115,22,0.2)',    color: '#fb923c', border: 'rgba(249,115,22,0.5)',   label: '缺参数',  short: '!' },
    invalid_link:  { bg: 'rgba(239,68,68,0.2)',     color: '#fca5a5', border: 'rgba(239,68,68,0.5)',   label: '连线错误', short: '✗' },
  };
  const rs = READINESS_STYLES[readinessState] || READINESS_STYLES.idle;
  const readinessHint = readinessState === 'missing_input'
    ? `缺少: ${readinessMissingInputs.join(', ')}`
    : readinessState === 'missing_param'
    ? `缺少: ${readinessMissingParams.join(', ')}`
    : readinessLabel || '';

  return (
    <div
      className={`comfy-node ${selected ? 'comfy-node--selected' : ''} ${collapsed ? 'comfy-node--collapsed' : ''} comfy-node--${readinessState}`}
      style={{
        borderColor: colors.border,
        background: colors.bg,
        boxShadow: selected ? `0 0 0 2px ${colors.border}, 0 4px 20px ${colors.glow}` : `0 2px 8px rgba(0,0,0,0.3)`,
        // 就绪状态边框颜色叠加
        outline: readinessState !== 'idle' && readinessState !== 'ready'
          ? `1px solid ${rs.border}`
          : undefined,
        outlineOffset: readinessState !== 'idle' && readinessState !== 'ready' ? '-2px' : undefined,
      }}
    >
      <NodeResizeControl
        position="bottom-right"
        minWidth={220}
        minHeight={120}
        maxWidth={640}
        maxHeight={640}
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          border: selected ? '1px solid #38BDF8' : '1px solid #334155',
          background: selected ? '#0b1220' : '#0b0f1a',
          display: selected ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'nwse-resize',
          boxShadow: selected ? '0 0 0 1px rgba(56,189,248,0.25)' : 'none',
        }}
      >
        <span className="comfy-resize-handle">⋰</span>
      </NodeResizeControl>

      {/* 头部 */}
      <div
        className="comfy-node-header"
        style={{ background: `linear-gradient(90deg, ${colors.border}20, transparent)` }}
      >
        <div className="comfy-node-title">
          <span className="comfy-node-icon">{config.icon}</span>
          <span className="comfy-node-label">{nodeData.label || config.label}</span>

          {/* ComfyUI化 v1: F4 就绪状态徽章（显示在头部右侧） */}
          {readinessState !== 'idle' && (
            <span
              className={`comfy-readiness-badge comfy-readiness-badge--${readinessState}`}
              style={{ background: rs.bg, color: rs.color, borderColor: rs.border }}
              title={readinessHint || rs.label}
            >
              {rs.short}
            </span>
          )}

          {issueCount > 0 && issueLevel && (
            <button
              className={`comfy-issue-badge comfy-issue-badge--${issueLevel}`}
              title={nodeData.issueText || (issueLevel === 'error' ? '存在错误' : '存在警告')}
              onClick={handleIssueBadgeClick}
            >
              {issueLevel === 'error' ? 'ERR' : 'WARN'} {issueCount}
            </button>
          )}
          {issueCount > 0 && issueTrend && (
            <span
              className={`comfy-issue-trend comfy-issue-trend--${issueTrend}`}
              title={issueTrend === 'up' ? '问题较上次增多' : issueTrend === 'down' ? '问题较上次减少' : '问题数量与上次持平'}
            >
              {issueTrend === 'up' ? '↑' : issueTrend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        <div className="comfy-node-actions">
          <button 
            className="comfy-action-btn comfy-help-btn" 
            onClick={handleHelp}
            title="帮助"
          >
            ?
          </button>
          {config.collapsible && (
            <button 
              className="comfy-action-btn comfy-collapse-btn" 
              onClick={handleToggle}
              title={collapsed ? '展开' : '折叠'}
            >
              {collapsed ? '▶' : '▼'}
            </button>
          )}
        </div>
      </div>

      {runStatus && (
        <div className={`comfy-run-status comfy-run-status--${runStatus}`}>
          <span className="comfy-run-status-badge">
            {runStatus === 'running' ? '执行中' : runStatus === 'success' ? '成功' : runStatus === 'failed' ? '失败' : runStatus === 'blocked' ? '阻断' : runStatus === 'skipped' ? '跳过' : '等待'}
          </span>
          <div className="comfy-run-progress">
            <div className="comfy-run-progress-fill" style={{ width: `${runProgress}%` }} />
          </div>
          <span className="comfy-run-progress-text">{runProgress}%</span>
        </div>
      )}

      {showIssuePanel && issueCount > 0 && (
        <div className={`comfy-issue-panel comfy-issue-panel--${issueLevel || 'warning'}`}>
          <div className="comfy-issue-panel-head">
            <div className="comfy-issue-panel-title">
              {issueLevel === 'error' ? '错误摘要' : '警告摘要'}
            </div>
            {issueTotal > 1 && (
              <div className="comfy-issue-nav">
                <button
                  className="comfy-issue-nav-btn"
                  onClick={(e) => { e.stopPropagation(); setIssueIndex((v) => Math.max(0, v - 1)); }}
                  disabled={safeIssueIndex <= 0}
                  title="上一条"
                >
                  ‹
                </button>
                <span className="comfy-issue-nav-text">{safeIssueIndex + 1}/{issueTotal}</span>
                <button
                  className="comfy-issue-nav-btn"
                  onClick={(e) => { e.stopPropagation(); setIssueIndex((v) => Math.min(issueTotal - 1, v + 1)); }}
                  disabled={safeIssueIndex >= issueTotal - 1}
                  title="下一条"
                >
                  ›
                </button>
              </div>
            )}
          </div>
          {issueTotal > 0 ? (
            <ul className="comfy-issue-list">
              <li
                className={nodeData.onFocusDryRunStep && (nodeData.runStepKey || nodeData.runStepOrder) ? 'comfy-issue-list-item--link' : ''}
                onClick={(e) => {
                  if (!nodeData.onFocusDryRunStep) return;
                  if (!nodeData.runStepKey && !nodeData.runStepOrder) return;
                  e.stopPropagation();
                  nodeData.onFocusDryRunStep(nodeData.runStepKey, nodeData.runStepOrder);
                }}
                title={nodeData.onFocusDryRunStep && (nodeData.runStepKey || nodeData.runStepOrder) ? '点击定位到 Dry-Run 步骤' : undefined}
              >
                <span className={`comfy-issue-inline-tag ${isErrorIssue ? 'comfy-issue-inline-tag--error' : 'comfy-issue-inline-tag--warning'}`}>
                  {isErrorIssue ? '[E]' : '[W]'}
                </span>
                <span>{issueBody || currentIssueRaw}</span>
              </li>
            </ul>
          ) : (
            <div className="comfy-issue-empty">暂无详细信息</div>
          )}
          {nodeData.runMessage && (
            <div className="comfy-issue-runmsg">步骤: {nodeData.runMessage}</div>
          )}
          {nodeData.onFocusDryRunStep && (nodeData.runStepKey || nodeData.runStepOrder) && (
            <button
              className="comfy-issue-jump-btn"
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onFocusDryRunStep?.(nodeData.runStepKey, nodeData.runStepOrder);
              }}
            >
              定位到 Dry-Run 步骤
            </button>
          )}
        </div>
      )}
      
      {/* 帮助面板 */}
      {showHelp && (
        <div className="comfy-help-panel">
          <div className="comfy-help-section">
            <h4>输入</h4>
            {config.inputs.length === 0 ? (
              <p className="comfy-help-empty">无输入端口</p>
            ) : (
              config.inputs.map(input => (
                <div key={input.name} className="comfy-help-item">
                  <code>{input.name}</code>
                  <span className="comfy-help-type">{input.type}</span>
                  <p>{input.description}</p>
                </div>
              ))
            )}
          </div>
          <div className="comfy-help-section">
            <h4>输出</h4>
            {config.outputs.length === 0 ? (
              <p className="comfy-help-empty">无输出端口</p>
            ) : (
              config.outputs.map(output => (
                <div key={output.name} className="comfy-help-item">
                  <code>{output.name}</code>
                  <span className="comfy-help-type">{output.type}</span>
                  <p>{output.description}</p>
                </div>
              ))
            )}
          </div>
          {config.frozenHint && (
            <div className="comfy-help-frozen">
              <strong>ℹ️ 兼容提示</strong>
              <p>{config.frozenHint}</p>
            </div>
          )}
        </div>
      )}
      
      {/* 输入端口区 */}
      {!collapsed && config.inputs.length > 0 && (
        <div className="comfy-ports comfy-ports--inputs">
          {config.inputs.map(input => (
            <NodePort
              key={input.name}
              config={input}
              position={Position.Left}
              isInput={true}
            />
          ))}
        </div>
      )}
      
      {/* 参数预览（折叠时） */}
      {collapsed && Object.keys(nodeData.params).length > 0 && (
        <ParamPreview params={nodeData.params} config={config} />
      )}
      
      {/* 输出端口区 */}
      {!collapsed && config.outputs.length > 0 && (
        <div className="comfy-ports comfy-ports--outputs">
          {config.outputs.map(output => (
            <NodePort
              key={output.name}
              config={output}
              position={Position.Right}
              isInput={false}
            />
          ))}
        </div>
      )}
      
    </div>
  );
}

// Group/Frame 节点
export function ComfyGroupNode({ data }: any) {
  return (
    <div 
      className="comfy-group"
      style={{ 
        borderColor: data.color || '#6B7280',
        background: `${data.color || '#6B7280'}10`,
      }}
    >
      <div 
        className="comfy-group-header"
        style={{ background: `${data.color || '#6B7280'}30` }}
      >
        <span>📦 {data.label}</span>
      </div>
    </div>
  );
}
