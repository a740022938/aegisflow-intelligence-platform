// NodeParamPanel.tsx - Right param config panel
// MVP v2: registry auto param form - dual source
import React, { useMemo, useState } from 'react';
import { NODE_REGISTRY } from './workflowSchema';
import type { NodeType } from './workflowSchema';
import { getRegistryParams, type ParamConfig } from './CapabilityAdapter';

interface DryRunEnvelope {
  ok: boolean;
  status: string;
  step_key: string;
  step_order: number;
  node_id?: string;
  output: any;
  error: null | { message: string; type?: string };
  artifacts: any[];
  refs: Record<string, string>;
  metrics: Record<string, any>;
  trace: { mode: 'dry-run' };
}

interface DryRunResult {
  ok: boolean;
  execution_mode: string;
  summary: { totalSteps: number; successSteps: number; failedSteps: number; blockedSteps: number };
  stepResults: Array<{
    stepOrder: number;
    stepName: string;
    stepKey: string;
    status: string;
    result: string;
    nodeId?: string;
    node_id?: string;
    blockedReason?: string;
    envelope?: DryRunEnvelope;
  }>;
  errors: Array<{ code: string; message: string; nodeId?: string; node_id?: string; stepOrder?: number; step_key?: string }>;
  warnings: Array<{ code: string; message: string; nodeId?: string; node_id?: string; stepOrder?: number; step_key?: string }>;
  metadata: { template_name: string; executed_at: string };
}

interface NodeParamPanelProps {
  selectedNodeIds: string[];
  nodes: Array<{
    id: string;
    data: {
      label?: string;
      nodeType?: string;
      params?: Record<string, unknown>;
      executable?: boolean;
      frozenHint?: string;
      runStatus?: 'idle' | 'pending' | 'queued' | 'running' | 'success' | 'failed' | 'blocked' | 'skipped';
      runProgress?: number;
      runMessage?: string;
      runStepKey?: string;
      runStepOrder?: number;
      issueLevel?: 'error' | 'warning';
      issueCount?: number;
      issueText?: string;
    };
  }>;
  dryRunResult?: DryRunResult | null;
  onParamChange: (nodeId: string, params: Record<string, unknown>) => void;
}

function getSelectedNode(ids: string[], nodes: NodeParamPanelProps['nodes']) {
  if (ids.length === 0) return null;
  return nodes.find((n) => n.id === ids[0]) || null;
}

function ParamControl({ param, value, onChange }: { param: ParamConfig; value: unknown; onChange: (v: unknown) => void }) {
  if (param.type === 'string') {
    return (
      <input
        type='text'
        className='wf-input'
        value={String(value ?? '')}
        placeholder={param.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (param.type === 'number') {
    return (
      <input
        type='number'
        className='wf-input'
        value={value !== undefined && value !== '' ? String(value) : ''}
        placeholder={param.placeholder}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    );
  }
  if (param.type === 'boolean') {
    return (
      <label className='wf-toggle'>
        <input
          type='checkbox'
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className='wf-toggle-track' />
      </label>
    );
  }
  if (param.type === 'select') {
    return (
      <select
        className='wf-select'
        value={String(value ?? param.default ?? '')}
        onChange={(e) => onChange(e.target.value)}
      >
        {(param.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }
  if (param.type === 'text') {
    return (
      <textarea
        className='wf-textarea'
        value={String(value ?? '')}
        placeholder={param.placeholder}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return null;
}

const NodeParamPanel: React.FC<NodeParamPanelProps> = ({ selectedNodeIds, nodes, dryRunResult, onParamChange }) => {
  const selectedNode = getSelectedNode(selectedNodeIds, nodes);
  const nodeType: string = selectedNode?.data?.nodeType || '';
  const isRegistryNode = nodeType.startsWith('plugin:');

  // P4: 结果视图状态
  const [resultViewMode, setResultViewMode] = useState<'summary' | 'raw'>('summary');
  const [showErrorDetail, setShowErrorDetail] = useState(false);

  // P4: 查找当前节点的 dry-run 结果
  const stepResult = useMemo(() => {
    if (!dryRunResult || !selectedNode) return null;
    const byNodeId = dryRunResult.stepResults.find(sr => sr.nodeId === selectedNode.id || sr.node_id === selectedNode.id);
    if (byNodeId) return byNodeId;
    const byStepKey = dryRunResult.stepResults.find(sr => sr.stepKey === nodeType || sr.envelope?.step_key === nodeType);
    return byStepKey || null;
  }, [dryRunResult, selectedNode, nodeType]);

  const envelope = stepResult?.envelope;

  const paramConfigs: ParamConfig[] = useMemo(() => {
    if (!nodeType) return [];
    const regParams = getRegistryParams(nodeType);
    if (regParams) return regParams;
    const config = NODE_REGISTRY[nodeType as NodeType];
    return config ? config.params : [];
  }, [nodeType]);

  const currentParams: Record<string, unknown> = selectedNode?.data?.params || {};

  const displayConfig = useMemo(() => {
    if (!nodeType) return null;
    const regParams = getRegistryParams(nodeType);
    if (isRegistryNode && regParams !== undefined) return null;
    return NODE_REGISTRY[nodeType as NodeType] || null;
  }, [nodeType, isRegistryNode]);

  const frozenHint = selectedNode?.data?.frozenHint;
  const executable = selectedNode?.data?.executable;
  const isMultiSelect = selectedNodeIds.length > 1;

  if (!selectedNode) {
    return (
      <div className='wf-param-panel wf-param-panel--empty'>
        <div className='wf-param-empty-state'>
          <span className='wf-param-empty-icon'>◉</span>
          <p>选中节点后配置参数</p>
          <small>点击画布上的节点以编辑</small>
        </div>
      </div>
    );
  }

  if (isMultiSelect) {
    return (
      <div className='wf-param-panel wf-param-panel--empty'>
        <div className='wf-param-empty-state'>
          <span className='wf-param-empty-icon'>◉◉</span>
          <p>多节点已选中</p>
          <small>{selectedNodeIds.length} 个节点已选中，仅可编辑单个节点</small>
        </div>
      </div>
    );
  }

  const handleParamChange = (key: string, value: unknown) => {
    if (!selectedNode) return;
    onParamChange(selectedNode.id, { ...currentParams, [key]: value });
  };

  return (
    <div className='wf-param-panel'>
      <div className='wf-param-header'>
        <span className='wf-param-icon'>
          {isRegistryNode ? '🔌' : displayConfig?.icon || '◉'}
        </span>
        <div className='wf-param-header-text'>
          <div className='wf-param-title'>
            {selectedNode.data.label || nodeType}
            {isRegistryNode && <span className='wf-registry-badge'>registry</span>}
          </div>
          <div className='wf-param-subtitle'>{displayConfig?.description || ''}</div>
        </div>
      </div>

      <div className='wf-param-list'>
        {paramConfigs.length === 0 ? (
          <div className='wf-param-empty-hint'>
            {isRegistryNode ? (
              <>
                <span>📋 此插件暂未提供可编辑参数</span>
                <small>manifest 中无 input_schema 或 schema 无法自动解析</small>
              </>
            ) : (
              <>
                <span>ℹ️ 此节点无预定义参数</span>
                <small>可在画布上直接使用默认配置</small>
              </>
            )}
          </div>
        ) : (
          paramConfigs.map((param) => {
            const value = currentParams[param.key] ?? param.default;
            return (
              <div key={param.key} className='wf-param-item'>
                <label className='wf-param-label'>
                  {param.labelZh}
                  {param.required && <span className='wf-param-required'>*</span>}
                  {param.type === 'boolean' && (
                    <span className='wf-param-label-hint'>{value ? '是' : '否'}</span>
                  )}
                </label>
                <ParamControl param={param} value={value} onChange={(v) => handleParamChange(param.key, v)} />
                {param.description && <small className='wf-param-desc'>{param.description}</small>}
              </div>
            );
          })
        )}
      </div>

      {executable === false && !frozenHint && (
        <div className='wf-frozen-hint'><span>⚠️ 此节点当前不可执行（仅支持校验）</span></div>
      )}

      {frozenHint && (
        <div className='wf-frozen-hint'><span>ℹ️ {frozenHint}</span></div>
      )}

      {paramConfigs.length > 0 && isRegistryNode && (
        <div className='wf-registry-source-hint'>
          <small>参数来源：manifest input_schema（自动生成）</small>
        </div>
      )}

      {/* P4: 节点结果详情面板 */}
      {(selectedNode.data.runStatus || envelope) && selectedNode.data.runStatus !== 'idle' && (
        <div className='wf-result-summary'>
          {/* 标题栏 + 视图切换 */}
          <div className='wf-result-header'>
            <span className={`wf-result-status wf-result-status--${selectedNode.data.runStatus}`}>
              {selectedNode.data.runStatus === 'success' ? '✓ 成功' :
               selectedNode.data.runStatus === 'failed' ? '✗ 失败' :
               selectedNode.data.runStatus === 'running' ? '▶ 运行中' :
               selectedNode.data.runStatus === 'pending' ? '⏳ 等待' :
               selectedNode.data.runStatus}
            </span>
            {selectedNode.data.runProgress !== undefined && (
              <span className='wf-result-progress'>{Math.round(selectedNode.data.runProgress)}%</span>
            )}
            <div className='wf-result-view-toggle'>
              <button className={`wf-toggle-btn ${resultViewMode === 'summary' ? 'active' : ''}`} onClick={() => setResultViewMode('summary')}>摘要</button>
              <button className={`wf-toggle-btn ${resultViewMode === 'raw' ? 'active' : ''}`} onClick={() => setResultViewMode('raw')}>原始</button>
            </div>
          </div>

          {resultViewMode === 'summary' ? (
            <>
              {/* 基本信息 */}
              {selectedNode.data.runStepKey && (
                <div className='wf-result-step'>step: {selectedNode.data.runStepKey}</div>
              )}
              {dryRunResult?.metadata?.executed_at && (
                <div className='wf-result-time'>执行时间: {dryRunResult.metadata.executed_at}</div>
              )}

              {/* 关键产物直达入口 */}
              {envelope?.refs && Object.keys(envelope.refs).length > 0 && (
                <div className='wf-result-entities'>
                  <div className='wf-result-section-title'>关键产物</div>
                  {Object.entries(envelope.refs).map(([key, id]) => (
                    <div key={key} className='wf-result-entity-row'>
                      <span className='wf-entity-key'>{key}:</span>
                      <button className='wf-entity-link' onClick={() => {
                        const routes: Record<string, string> = {
                          dataset_id: '/datasets',
                          model_id: '/models',
                          artifact_id: '/artifacts',
                          release_id: '/releases',
                          experiment_id: '/experiments',
                        };
                        const base = routes[key] || '/search';
                        window.open(`${base}?id=${id}`, '_blank');
                      }}>
                        {id}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 指标摘要 */}
              {envelope?.metrics && Object.keys(envelope.metrics).length > 0 && (
                <div className='wf-result-metrics'>
                  <div className='wf-result-section-title'>指标</div>
                  {Object.entries(envelope.metrics).slice(0, 6).map(([k, v]) => (
                    <div key={k} className='wf-metric-row'>
                      <span className='wf-metric-key'>{k}</span>
                      <span className='wf-metric-val'>{typeof v === 'number' ? v.toFixed(4) : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 消息 */}
              {selectedNode.data.runMessage && (
                <div className='wf-result-message'>{selectedNode.data.runMessage}</div>
              )}

              {/* 错误详情展开 */}
              {(envelope?.error || selectedNode.data.issueLevel === 'error') && (
                <div className='wf-result-error-section'>
                  <button className='wf-error-toggle' onClick={() => setShowErrorDetail(!showErrorDetail)}>
                    {showErrorDetail ? '▼ 收起错误详情' : '▶ 展开错误详情'}
                  </button>
                  {showErrorDetail && (
                    <div className='wf-error-detail'>
                      {envelope?.error?.message && (
                        <div className='wf-error-message'>
                          <strong>错误信息:</strong> {envelope.error.message}
                        </div>
                      )}
                      {envelope?.error?.type && (
                        <div className='wf-error-type'>
                          <strong>错误类型:</strong> {envelope.error.type}
                        </div>
                      )}
                      {selectedNode.data.issueText && (
                        <div className='wf-error-context'>{selectedNode.data.issueText}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 问题标记 */}
              {selectedNode.data.issueLevel && selectedNode.data.issueLevel !== 'error' && (
                <div className={`wf-result-issue wf-result-issue--${selectedNode.data.issueLevel}`}>
                  {selectedNode.data.issueCount !== undefined && <span>{selectedNode.data.issueCount} 个问题</span>}
                  {selectedNode.data.issueText && <small>{selectedNode.data.issueText}</small>}
                </div>
              )}
            </>
          ) : (
            /* 原始 JSON 视图 */
            <div className='wf-result-raw'>
              <pre className='wf-raw-json'>
                {JSON.stringify(envelope || stepResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeParamPanel;
