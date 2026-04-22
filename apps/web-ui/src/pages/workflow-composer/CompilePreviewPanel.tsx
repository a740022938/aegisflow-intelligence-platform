// ============================================================
// CompilePreviewPanel.tsx — 编译预览面板
// 展示：步骤顺序、依赖关系、参数快照、输入输出摘要
// ============================================================
import React, { useState } from 'react';
import type { CompiledWorkflow, CompiledStep, DryRunValidation } from './workflowCompiler';

interface CompilePreviewPanelProps {
  compiled: CompiledWorkflow | null;
  dryRun: DryRunValidation | null;
  onExportTemplate: () => void;
  onRecompile: () => void;
}

const CompilePreviewPanel: React.FC<CompilePreviewPanelProps> = ({
  compiled,
  dryRun,
  onExportTemplate,
  onRecompile,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'deps' | 'params' | 'output'>('steps');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (!compiled) {
    return (
      <div className="compile-preview-panel compile-preview-panel--empty">
        <div className="compile-preview-empty-icon">📋</div>
        <div className="compile-preview-empty-text">点击「编译预览」生成执行计划</div>
      </div>
    );
  }

  const toggleStep = (nodeId: string) => {
    const next = new Set(expandedSteps);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    setExpandedSteps(next);
  };

  const { steps, summary, typeLinks, inputClosure } = compiled;

  return (
    <div className="compile-preview-panel">
      {/* 头部状态栏 */}
      <div className="compile-preview-header">
        <h3 className="compile-preview-title">📋 编译预览</h3>
        <div className="compile-preview-status">
          {dryRun?.ok ? (
            <span className="status-badge status-badge--success">✓ Dry-run 通过</span>
          ) : (
            <span className="status-badge status-badge--error">
              ✗ {dryRun?.errors.length || 0} 错误
            </span>
          )}
        </div>
      </div>

      {/* 摘要卡片 */}
      <div className="compile-summary-grid">
        <div className="summary-card">
          <div className="summary-value">{summary.totalNodes}</div>
          <div className="summary-label">节点</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summary.totalEdges}</div>
          <div className="summary-label">连接</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{summary.maxDepth + 1}</div>
          <div className="summary-label">层级</div>
        </div>
        <div className="summary-card summary-card--frozen">
          <div className="summary-value">{summary.frozenNodes}</div>
          <div className="summary-label">不可执行</div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="compile-tabs">
        <button
          className={`compile-tab ${activeTab === 'steps' ? 'active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          执行步骤
        </button>
        <button
          className={`compile-tab ${activeTab === 'deps' ? 'active' : ''}`}
          onClick={() => setActiveTab('deps')}
        >
          依赖关系
        </button>
        <button
          className={`compile-tab ${activeTab === 'params' ? 'active' : ''}`}
          onClick={() => setActiveTab('params')}
        >
          参数快照
        </button>
        <button
          className={`compile-tab ${activeTab === 'output' ? 'active' : ''}`}
          onClick={() => setActiveTab('output')}
        >
          输出摘要
        </button>
      </div>

      {/* 内容区 */}
      <div className="compile-content">
        {/* 执行步骤 */}
        {activeTab === 'steps' && (
          <div className="steps-list">
            {steps.map(step => (
              <div
                key={step.nodeId}
                className={`step-item ${!step.executable ? 'step-item--frozen' : ''}`}
                onClick={() => toggleStep(step.nodeId)}
              >
                <div className="step-header">
                  <span className="step-order">#{step.order}</span>
                  <span className="step-label">{step.label}</span>
                  <span className="step-type">{step.nodeType}</span>
                  {!step.executable && <span className="step-frozen-tag">不可执行</span>}
                </div>
                {expandedSteps.has(step.nodeId) && (
                  <div className="step-details">
                    <div className="step-detail-row">
                      <span className="detail-label">深度:</span>
                      <span className="detail-value">{step.depth}</span>
                    </div>
                    <div className="step-detail-row">
                      <span className="detail-label">输入:</span>
                      <span className="detail-value">{step.inputs.join(', ') || '无'}</span>
                    </div>
                    <div className="step-detail-row">
                      <span className="detail-label">输出:</span>
                      <span className="detail-value">{step.outputs.join(', ') || '无'}</span>
                    </div>
                    <div className="step-detail-row">
                      <span className="detail-label">依赖:</span>
                      <span className="detail-value">
                        {step.dependencies.length > 0
                          ? step.dependencies.join(', ')
                          : '无'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 依赖关系 */}
        {activeTab === 'deps' && (
          <div className="deps-list">
            {typeLinks.length === 0 ? (
              <div className="compile-empty">暂无连接</div>
            ) : (
              typeLinks.map((link, idx) => (
                <div
                  key={idx}
                  className={`dep-item ${link.typeMatched ? '' : 'dep-item--error'}`}
                >
                  <div className="dep-nodes">
                    <span className="dep-node">{link.fromNode}</span>
                    <span className="dep-arrow">→</span>
                    <span className="dep-node">{link.toNode}</span>
                  </div>
                  <div className="dep-types">
                    <span className="dep-type">{link.fromOutput}</span>
                    <span className="dep-arrow">→</span>
                    <span className={`dep-type ${link.typeMatched ? '' : 'dep-type--error'}`}>
                      {link.toInput}
                      {!link.typeMatched && ' ⚠️ 类型不匹配'}
                    </span>
                  </div>
                </div>
              ))
            )}
            {!inputClosure.ok && (
              <div className="input-closure-errors">
                <h4>⚠️ 缺失输入</h4>
                {inputClosure.missingInputs.map((m, idx) => (
                  <div key={idx} className="missing-input-item">
                    [{m.nodeLabel}] 需要 [{m.inputName}]
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 参数快照 */}
        {activeTab === 'params' && (
          <div className="params-list">
            {steps.map(step => (
              <div key={step.nodeId} className="param-step">
                <div className="param-step-header">
                  #{step.order} {step.label}
                </div>
                <div className="param-table">
                  {step.paramSnapshot.map(p => (
                    <div key={p.key} className="param-row">
                      <span className={`param-name ${p.required ? 'required' : ''}`}>
                        {p.label}
                        {p.required && <span className="required-mark">*</span>}
                      </span>
                      <span className={`param-value ${p.provided ? '' : 'missing'}`}>
                        {p.provided ? String(p.value) : '未提供'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 输出摘要 */}
        {activeTab === 'output' && (
          <div className="output-summary">
            <div className="output-section">
              <h4>📤 预计输出</h4>
              {summary.estimatedOutputs.length === 0 ? (
                <div className="output-empty">无最终输出（所有产出被下游消费）</div>
              ) : (
                <div className="output-tags">
                  {summary.estimatedOutputs.map((out, idx) => (
                    <span key={idx} className="output-tag">{out}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="output-section">
              <h4>⚠️ 不可执行节点</h4>
              {summary.frozenNodes === 0 ? (
                <div className="output-empty">无不可执行节点</div>
              ) : (
                <div className="frozen-list">
                  {steps
                    .filter(s => !s.executable && s.frozenHint)
                    .map(s => (
                      <div key={s.nodeId} className="frozen-item">
                        #{s.order} {s.label}
                        <div className="frozen-hint">{s.frozenHint}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dry-run 结果 */}
      {dryRun && (
        <div className={`dryrun-panel ${dryRun.ok ? 'dryrun-ok' : 'dryrun-error'}`}>
          <div className="dryrun-header">
            <span className="dryrun-title">🧪 Dry-run 校验</span>
            <span className="dryrun-badge">
              {dryRun.ok ? '✓ 通过' : `${dryRun.errors.length} 错误`}
            </span>
          </div>
          {!dryRun.ok && (
            <div className="dryrun-errors">
              {dryRun.errors.map((e, idx) => (
                <div key={idx} className="dryrun-error-item">
                  <span className="error-code">[{e.code}]</span>
                  <span className="error-msg">{e.message}</span>
                </div>
              ))}
            </div>
          )}
          {dryRun.warnings.length > 0 && (
            <div className="dryrun-warnings">
              {dryRun.warnings.map((w, idx) => (
                <div key={idx} className="dryrun-warning-item">
                  <span className="warning-code">[{w.code}]</span>
                  <span className="warning-msg">{w.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 底部操作 */}
      <div className="compile-actions">
        <button className="wf-btn wf-btn--secondary" onClick={onRecompile}>
          🔄 重新编译
        </button>
        <button
          className="wf-btn wf-btn--primary"
          onClick={onExportTemplate}
          disabled={!dryRun?.ok}
        >
          📦 导出模板
        </button>
      </div>
    </div>
  );
};

export default CompilePreviewPanel;
