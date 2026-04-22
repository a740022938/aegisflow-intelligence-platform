// ============================================================
// StatusBar.tsx — 底部状态栏
// P5: 显示校验数/阻断数/dry-run ready 状态 + 运行状态 + job 控制
// ============================================================

import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  validationErrors: number;
  validationWarnings: number;
  dryRunReady: boolean;
  zoom: number;
  position: { x: number; y: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  // P5: 运行状态
  activeJobId?: string | null;
  runLoading?: boolean;
  runResult?: { ok: boolean; message: string; jobId?: string } | null;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onShowLogs?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  idle: '空闲',
  queued: '排队中',
  running: '运行中',
  paused: '已暂停',
  cancelled: '已取消',
  success: '成功',
  completed: '成功',
  failed: '失败',
};

export function StatusBar({
  nodeCount,
  edgeCount,
  validationErrors,
  validationWarnings,
  dryRunReady,
  zoom,
  position,
  onZoomIn,
  onZoomOut,
  onFitView,
  activeJobId,
  runLoading,
  runResult,
  onPause,
  onResume,
  onCancel,
  onShowLogs,
}: StatusBarProps) {
  const isRunning = runLoading || !!activeJobId;

  return (
    <div className="comfy-statusbar">
      {/* 左侧：统计 */}
      <div className="statusbar-section">
        <div className="statusbar-stat">
          <span className="stat-icon">📦</span>
          <span className="stat-value">{nodeCount}</span>
          <span className="stat-label">节点</span>
        </div>
        <div className="statusbar-stat">
          <span className="stat-icon">🔗</span>
          <span className="stat-value">{edgeCount}</span>
          <span className="stat-label">连接</span>
        </div>
        <div className="statusbar-divider" />
        <div className={`statusbar-stat ${validationErrors > 0 ? 'has-error' : ''}`}>
          <span className="stat-icon">❌</span>
          <span className="stat-value">{validationErrors}</span>
          <span className="stat-label">阻断</span>
        </div>
        <div className={`statusbar-stat ${validationWarnings > 0 ? 'has-warning' : ''}`}>
          <span className="stat-icon">⚠️</span>
          <span className="stat-value">{validationWarnings}</span>
          <span className="stat-label">警告</span>
        </div>
      </div>

      {/* 中间：dry-run 状态 + P5 运行状态 */}
      <div className="statusbar-section statusbar-center">
        {/* P5: 运行状态 */}
        {isRunning && (
          <div className="statusbar-job">
            <span className={`job-indicator ${runLoading ? 'running' : 'active'}`} />
            <span className="job-text">
              {runLoading ? '⏳ 运行中...' : `🚀 Job: ${activeJobId ? activeJobId.slice(0, 8) : '?'}`}
            </span>
            {runResult?.message && !runLoading && (
              <span className={`job-message ${runResult.ok ? 'ok' : 'error'}`}>
                {runResult.message}
              </span>
            )}
            {activeJobId && (
              <div className="job-controls">
                {onPause && <button className="job-ctrl-btn" onClick={onPause} title="暂停">⏸</button>}
                {onResume && <button className="job-ctrl-btn" onClick={onResume} title="恢复">▶</button>}
                {onCancel && <button className="job-ctrl-btn job-ctrl-btn--danger" onClick={onCancel} title="取消">✕</button>}
                {onShowLogs && <button className="job-ctrl-btn" onClick={onShowLogs} title="查看日志">📋</button>}
              </div>
            )}
          </div>
        )}
        {/* Dry-run 状态 */}
        <div className={`dryrun-status ${dryRunReady ? 'ready' : 'blocked'}`}>
          <span className="dryrun-indicator" />
          <span className="dryrun-text">
            {dryRunReady ? '✓ Dry-run Ready' : '✗ 存在阻断错误'}
          </span>
        </div>
        {validationErrors > 0 && (
          <span className="dryrun-hint">请先修复错误再编译</span>
        )}
      </div>

      {/* 右侧：视图控制 */}
      <div className="statusbar-section">
        <div className="statusbar-coords">
          <span className="coord-label">X</span>
          <span className="coord-value">{Math.round(position.x)}</span>
          <span className="coord-label">Y</span>
          <span className="coord-value">{Math.round(position.y)}</span>
        </div>
        <div className="statusbar-divider" />
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={onZoomOut} title="缩小">−</button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={onZoomIn} title="放大">+</button>
          <button className="zoom-btn zoom-fit" onClick={onFitView} title="适应视图">⊡</button>
        </div>
      </div>
    </div>
  );
}
