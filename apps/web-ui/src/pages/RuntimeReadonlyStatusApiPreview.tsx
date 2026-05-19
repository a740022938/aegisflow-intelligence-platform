import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getRuntimeReadonlyStatusApiEndpoints,
  getRuntimeReadonlyStatusApiSummary,
  getRuntimeReadonlyStatusApiValidationSummary,
} from '../registry/runtime-readonly-status-api-registry';
import {
  validateRuntimeReadonlyStatusApi,
} from '../registry/runtime-readonly-status-api-validator';

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
  padding: 16,
  background: 'var(--bg-card, #1a1a2e)',
  borderRadius: 8,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const headerStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 12,
  color: 'var(--text-primary, #e0e0e0)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 8,
  marginBottom: 12,
};

const statCardStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg-item, #16213e)',
  borderRadius: 4,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #8892b0)',
  textTransform: 'uppercase' as const,
};

const statValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const endpointRowStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: '#fff',
});

const RuntimeReadonlyStatusApiPreview: React.FC = () => {
  const endpoints = getRuntimeReadonlyStatusApiEndpoints();
  const summary = getRuntimeReadonlyStatusApiSummary();
  const validation = validateRuntimeReadonlyStatusApi();
  const validationSummary = getRuntimeReadonlyStatusApiValidationSummary();

  return (
    <PageShell
      title="Runtime 只读状态 API 预览"
      subtitle="只读查看 Runtime Status API 契约、schema、mock response、gate 与阻断边界"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不新增 endpoint · 不接后端 · 不写数据库 · 不启用 Stage C"
    >
      {/* A. API Overview Dashboard */}
      <div style={sectionStyle}>
        <div style={headerStyle}>A. API Overview Dashboard</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Endpoints</div>
            <div style={statValueStyle}>{summary.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>GET</div>
            <div style={{ ...statValueStyle, color: '#4fc3f7' }}>{summary.getEndpoints}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>POST</div>
            <div style={{ ...statValueStyle, color: '#ffa726' }}>{summary.postEndpoints}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Contract Only</div>
            <div style={{ ...statValueStyle, color: '#66bb6a' }}>{summary.contractOnly}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Not Implemented</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.notImplemented}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Current Allowed</div>
            <div style={{ ...statValueStyle, color: '#66bb6a' }}>{summary.currentAllowed}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocked</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.blocked}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>High/Critical</div>
            <div style={{ ...statValueStyle, color: '#ff1744' }}>{summary.highOrCritical}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Writes DB</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.writesDb}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Controls External</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.controlsExternalTool}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Requires Stage C</div>
            <div style={{ ...statValueStyle, color: '#ffa726' }}>{summary.requiresStageC}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Requires Approval</div>
            <div style={{ ...statValueStyle, color: '#ffa726' }}>{summary.requiresHumanApproval}</div>
          </div>
        </div>
      </div>

      {/* B. Endpoint Catalog Board */}
      <div style={sectionStyle}>
        <div style={headerStyle}>B. Endpoint Catalog Board</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          全部 12 endpoints — 实现状态与当前允许性
        </div>
        {endpoints.map(ep => (
          <div key={ep.id} style={endpointRowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={badgeStyle(ep.method === 'GET' ? '#1976d2' : '#f57c00')}>{ep.method}</span>
              <span style={{ fontWeight: 600 }}>{ep.path}</span>
              <span style={{ color: 'var(--text-secondary, #8892b0)' }}>{ep.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={badgeStyle(ep.implementationStatus === 'contract_only' ? '#388e3c' : '#d32f2f')}>
                {ep.implementationStatus}
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                background: ep.currentAllowed ? '#1b5e20' : '#b71c1c',
                color: '#fff',
              }}>
                {ep.currentAllowed ? 'allowed' : 'blocked'}
              </span>
              <span style={badgeStyle(
                ep.risk === 'low' ? '#388e3c' :
                ep.risk === 'medium' ? '#f57c00' :
                ep.risk === 'high' ? '#d32f2f' : '#880e4f'
              )}>
                {ep.risk}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* C. GET Readonly Board */}
      <div style={sectionStyle}>
        <div style={headerStyle}>C. GET Readonly Board</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          8 个 GET endpoint — contract_only，只读，无副作用
        </div>
        {endpoints.filter(e => e.method === 'GET').map(ep => (
          <div key={ep.id} style={endpointRowStyle}>
            <div>
              <strong>{ep.path}</strong> — {ep.label}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
              <span>readonly: {String(ep.readonly)}</span>
              <span>mutatesState: {String(ep.mutatesState)}</span>
              <span>writesDb: {String(ep.writesDb)}</span>
              <span>controlsExternal: {String(ep.controlsExternalTool)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* D. POST Blocked Board */}
      <div style={sectionStyle}>
        <div style={headerStyle}>D. POST Blocked Board</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          4 个 POST endpoint — not_implemented，全部封禁
        </div>
        {endpoints.filter(e => e.method === 'POST').map(ep => (
          <div key={ep.id} style={{ ...endpointRowStyle, flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <strong>{ep.path}</strong> — {ep.label}
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                <span>stageC: {String(ep.requiresStageC)}</span>
                <span>humanApproval: {String(ep.requiresHumanApproval)}</span>
                <span>dbWrite: {String(ep.writesDb)}</span>
                <span>extControl: {String(ep.controlsExternalTool)}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)' }}>
              Blocked actions: {ep.blockedActions.join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* E. Schema Board */}
      <div style={sectionStyle}>
        <div style={headerStyle}>E. Schema Board</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          契约定义中的 request / response schema
        </div>
        {endpoints.map(ep => (
          <div key={ep.id} style={endpointRowStyle}>
            <div style={{ fontWeight: 600, minWidth: 250 }}>{ep.path}</div>
            <div style={{ fontSize: 12, display: 'flex', gap: 16 }}>
              <span>Request: <strong>{ep.requestSchema}</strong></span>
              <span>Response: <strong>{ep.responseSchema}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* F. Mock Response Shape Board */}
      <div style={sectionStyle}>
        <div style={headerStyle}>F. Mock Response Shape Board</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          字段预览（mock 数据形状）
        </div>
        {endpoints.map(ep => (
          <div key={ep.id} style={endpointRowStyle}>
            <div style={{ fontWeight: 600, minWidth: 250 }}>{ep.path}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)' }}>
              {ep.mockResponseShape.join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* G. Gate and Forbidden Fields Board */}
      <div style={sectionStyle}>
        <div style={headerStyle}>G. Gate and Forbidden Fields Board</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          各个 endpoint 的门禁与禁用字段
        </div>
        {endpoints.slice(0, 4).map(ep => (
          <div key={ep.id} style={{ ...endpointRowStyle, flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{ep.path}</div>
            <div style={{ fontSize: 11, display: 'flex', gap: 16 }}>
              <div>
                <strong>Gates:</strong> {ep.gates.join(', ')}
              </div>
              <div>
                <strong>Forbidden:</strong> {ep.forbiddenFields.join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* H. Validator Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>H. Validator Summary</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocking</div>
            <div style={{ ...statValueStyle, color: validationSummary.blocking > 0 ? '#ef5350' : '#66bb6a' }}>
              {validationSummary.blocking}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Warning</div>
            <div style={{ ...statValueStyle, color: validationSummary.warning > 0 ? '#ffa726' : '#66bb6a' }}>
              {validationSummary.warning}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Info</div>
            <div style={statValueStyle}>{validationSummary.info}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Pass</div>
            <div style={{ ...statValueStyle, color: validationSummary.pass ? '#66bb6a' : '#ef5350' }}>
              {validationSummary.pass ? 'YES' : 'NO'}
            </div>
          </div>
        </div>
        {validation.blocking.map((msg, i) => (
          <div key={`b-${i}`} style={{ fontSize: 12, color: '#ef5350', marginTop: 4 }}>
            ⛔ BLOCKING: {msg}
          </div>
        ))}
        {validation.warning.map((msg, i) => (
          <div key={`w-${i}`} style={{ fontSize: 12, color: '#ffa726', marginTop: 2 }}>
            ⚠ WARNING: {msg}
          </div>
        ))}
      </div>

      {/* I. Forbidden API Notice */}
      <div style={{ ...sectionStyle, border: '2px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>I. Forbidden API Notice</div>
        <ul style={{ fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>当前不新增 backend endpoint — 所有 endpoint 仅存在于 contract freeze 文档中</li>
          <li>当前不实现 mock server — mock 数据仅存在于文档中</li>
          <li>当前不写 DB — db_write 在所有 endpoint 中均为 false（GET）或 blocked（POST）</li>
          <li>当前不控制外部工具 — external_control 在所有 endpoint 中均为 false（GET）或 blocked（POST）</li>
          <li>当前不启用 Stage C — stage_c 在所有 endpoint 中均被禁用</li>
          <li>无 Send Request / Call API / Execute / Apply / Enable Stage C 按钮</li>
          <li>无 token / API key 输入框</li>
        </ul>
      </div>
    </PageShell>
  );
};

export default RuntimeReadonlyStatusApiPreview;
