import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './AssistantCenter.css';
import type {
  AssistantBackupItem,
  AssistantFullCheckResponse,
  AssistantListResponse,
  AssistantReportItem,
  AssistantSafetyBoundary,
  AssistantStatusItem,
  AssistantStatusResponse,
  AssistantTaskPackageResponse,
} from '../types/assistant-center';
import { APP_VERSION } from '../constants/appVersion';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import StatsGrid from '../components/ui/StatsGrid';
import StatusStrip from '../components/ui/StatusStrip';
import EmptyState from '../components/ui/EmptyState';
import type { StatusStripItem } from '../components/ui/StatusStrip';

const API = '/api/assistant-center';

const TASK_TYPES = [
  { value: 'aip-readonly-audit', label: 'AIP 只读摸底' },
  { value: 'aip-startup-forensic', label: 'AIP 启动故障取证' },
  { value: 'e-drive-readonly-audit', label: 'E盘清理只读摸底' },
  { value: 'single-directory-safe-delete', label: '单目录安全删除' },
  { value: 'openaxiom-dataset-readonly-check', label: 'OpenAxiom 数据集只读检查' },
  { value: 'mahjong-dataset-quality', label: 'Mahjong 数据集质检' },
  { value: 'yolo-evaluation', label: 'YOLO 评估任务' },
  { value: 'github-release-check', label: 'GitHub Release 检查' },
  { value: 'openclaw-status-check', label: 'OpenClaw 状态检查' },
  { value: 'claude-proxy-status-check', label: 'Claude Proxy 状态检查' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  try { return new Date(value).toLocaleString('zh-CN'); } catch { return value; }
}

function formatSize(bytes?: number | null, truncated = false) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return '—';
  const suffix = truncated ? '+' : '';
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB${suffix}`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB${suffix}`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB${suffix}`;
  return `${bytes} B${suffix}`;
}

async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
  }
  return data as T;
}

function RiskBadge({ value }: { value?: string }) {
  const level = value || 'unknown';
  const statusMap: Record<string, string> = {
    low: 'success', medium: 'warning', high: 'danger', critical: 'danger',
  };
  return <StatusBadge s={statusMap[level] || ''} emptyText={level} />;
}

function StatusPill({ value }: { value?: string }) {
  const status = value || 'unknown';
  const statusMap: Record<string, string> = {
    online: 'success', offline: 'danger', unknown: '',
  };
  return <StatusBadge s={statusMap[status] || ''} emptyText={status} />;
}

function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button className="assistant-copy-btn" type="button" onClick={copy}>
      {copied ? '已复制' : label}
    </button>
  );
}



export default function AssistantCenter() {
  const [statusData, setStatusData] = useState<AssistantStatusResponse | null>(null);
  const [fullCheck, setFullCheck] = useState<AssistantFullCheckResponse | null>(null);
  const [reports, setReports] = useState<AssistantReportItem[]>([]);
  const [backups, setBackups] = useState<AssistantBackupItem[]>([]);
  const [boundaries, setBoundaries] = useState<AssistantSafetyBoundary[]>([]);
  const [taskType, setTaskType] = useState(TASK_TYPES[0].value);
  const [taskText, setTaskText] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadReadonlyData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [status, reportData, backupData, boundaryData] = await Promise.all([
        readJson<AssistantStatusResponse>(`${API}/status`),
        readJson<AssistantListResponse<AssistantReportItem>>(`${API}/reports?limit=30`),
        readJson<AssistantListResponse<AssistantBackupItem>>(`${API}/backups?limit=20`),
        readJson<AssistantListResponse<AssistantSafetyBoundary>>(`${API}/safety-boundaries`),
      ]);
      setStatusData(status);
      setReports(reportData.items || []);
      setBackups(backupData.items || []);
      setBoundaries(boundaryData.items || []);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReadonlyData(); }, [loadReadonlyData]);

  const runFullCheck = async () => {
    setChecking(true);
    setError('');
    try {
      const data = await readJson<AssistantFullCheckResponse>(`${API}/full-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeReports: true, includeBackups: true, includeToolVersions: true, saveAudit: false }),
      });
      setFullCheck(data);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setChecking(false);
    }
  };

  const generateTaskPackage = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await readJson<AssistantTaskPackageResponse>(`${API}/task-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          targetPath: '按任务上下文确认',
          outputReportPath: 'E:\\_AIP_REPORTS\\<task_report>.md',
          includeSafetyTemplate: true,
        }),
      });
      setTaskText(data.text);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setGenerating(false);
    }
  };

  const topSummary = useMemo(() => {
    const items = statusData?.items || [];
    const offline = items.filter(item => item.status === 'offline').length;
    const unknown = items.filter(item => item.status === 'unknown').length;
    const mediumOrHigher = items.filter(item => ['medium', 'high', 'critical'].includes(item.riskLevel)).length;
    return {
      total: items.length,
      online: items.filter(item => item.status === 'online').length,
      offline,
      state: offline > 0 ? 'degraded' : mediumOrHigher > 0 || unknown > 0 ? 'warning' : 'healthy',
      risk: offline > 0 ? 'high' : mediumOrHigher > 0 ? 'medium' : 'low',
    };
  }, [statusData]);

  const diagnosticSummary = useMemo(() => {
    const items = statusData?.items || [];
    return [
      `Assistant Center readonly summary @ ${formatDate(statusData?.lastCheckedAt)}`,
      ...items.map(item => `${item.name}: ${item.status}, risk=${item.riskLevel}, detail=${item.detail}`),
    ].join('\n');
  }, [statusData]);

  return (
    <PageShell
      title="助手中心"
      subtitle="汇总 AIP 本地服务、外部助手、只读检查、任务包与报告中心，辅助生成安全施工指令。"
      versionLabel={`AIP ${APP_VERSION}`}
      maturity="preview"
      safetyBoundary="preview"
      safetyText="预览与任务包模式 · 不自动执行修复 · 高风险操作需要人工确认"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="assistant-primary-btn" type="button" onClick={loadReadonlyData} disabled={loading}>
            {loading ? '刷新中' : '刷新状态'}
          </button>
          <CopyButton text={diagnosticSummary} label="复制诊断摘要" />
        </div>
      }
    >

      {error && (
        <div className="ui-tag ui-tag-danger" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', marginBottom: 14, fontSize: 13, lineHeight: 1.5 }}>
          <strong>读取失败</strong>
          <span>{error}</span>
        </div>
      )}

      <StatusStrip
        items={[
          { label: '总体状态', value: topSummary.state, color: topSummary.state === 'healthy' ? 'var(--success)' : topSummary.state === 'warning' ? 'var(--warning)' : 'var(--danger)' },
          { label: '风险等级', value: topSummary.risk, status: topSummary.risk === 'low' ? 'success' : topSummary.risk === 'medium' ? 'warning' : 'failed' },
          { label: '在线项', value: `${topSummary.online}/${topSummary.total}` },
          { label: '最后检查', value: formatDate(statusData?.lastCheckedAt) || '—' },
          { label: '只读锁定', value: 'readonly', color: 'var(--success)' },
        ]}
      />
      {topSummary.risk !== 'low' && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 6, border: '1px solid rgba(245,158,11,0.2)' }}>
          {topSummary.offline > 0
            ? `${topSummary.offline} 个外部组件离线，风险等级升高。AIP 核心仍在线，不影响核心路由与决策能力。`
            : '部分外部组件存在中高风险项，反映外部助手生态状态，不代表 AIP 核心健康度。'}
        </div>
      )}

      <SectionCard title="助手状态卡片区">
        {loading ? (
          <EmptyState title="正在读取只读状态..." icon="⏳" />
        ) : statusData?.items?.length ? (
          <div className="assistant-card-grid">
            {statusData.items.map((item: AssistantStatusItem) => (
              <article className="assistant-card" key={item.id}>
                <div className="assistant-card-title-row">
                  <h3>{item.name}</h3>
                  <StatusPill value={item.status} />
                </div>
                <div className="assistant-meta-grid">
                  <span>类型</span><strong>{item.type}</strong>
                  <span>端口</span><strong>{item.port ?? '—'}</strong>
                  <span>PID</span><strong>{item.pid ?? '—'}</strong>
                  <span>版本</span><strong>{item.version || '—'}</strong>
                  <span>风险</span><RiskBadge value={item.riskLevel} />
                </div>
                <p className="assistant-path">{item.path}</p>
                <p className="assistant-detail">{item.detail || item.suggestedAction}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无状态数据" />
        )}
      </SectionCard>

      <SectionCard
        title="全链路体检区"
        actions={<button className="ui-btn ui-btn-primary" type="button" onClick={runFullCheck} disabled={checking}>{checking ? '检查中' : '执行只读体检'}</button>}
      >
        {fullCheck ? (
          <div className="assistant-check-layout">
            <StatsGrid
              columns={4}
              items={[
                { label: 'overallStatus', value: fullCheck.overallStatus, color: fullCheck.overallStatus === 'passed' ? 'var(--success)' : 'var(--danger)' },
                { label: 'riskLevel', value: fullCheck.riskLevel },
                { label: 'requiresHumanApproval', value: String(fullCheck.requiresHumanApproval) },
                { label: 'autoFixAllowed', value: String(fullCheck.autoFixAllowed) },
              ]}
            />
            <div className="assistant-check-list">
              {fullCheck.checks.map(item => (
                <div className={`assistant-check-row assistant-check-${item.status}`} key={item.id}>
                  <strong>{item.label}</strong>
                  <span>{item.detail || '—'}</span>
                  <em>{item.status}</em>
                </div>
              ))}
            </div>
            {fullCheck.warnings.length > 0 && (
              <div className="assistant-warning-list">
                {fullCheck.warnings.map((warning, index) => <span key={`${warning}-${index}`}>{warning}</span>)}
              </div>
            )}
          </div>
        ) : (
          <EmptyState title="准备就绪" description="点击按钮执行一次只读体检；不会保存审计，也不会触发修复。" />
        )}
      </SectionCard>

      <SectionCard title="任务包生成器区">
        <div className="assistant-task-grid">
          <div className="assistant-task-controls">
            <label>
              <span>任务类型</span>
              <select value={taskType} onChange={event => setTaskType(event.target.value)}>
                {TASK_TYPES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <button className="ui-btn ui-btn-primary" type="button" onClick={generateTaskPackage} disabled={generating}>
              {generating ? '生成中' : '生成任务包文本'}
            </button>
          </div>
          <div className="assistant-task-output">
            <div className="assistant-output-head">
              <span>任务包文本</span>
              <CopyButton text={taskText} label="复制任务包" />
            </div>
            <textarea readOnly value={taskText} placeholder="生成后将在这里显示任务包文本。" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="报告中心区">
        {reports.length ? (
          <div className="assistant-table-wrap">
            <table className="assistant-table">
              <thead><tr><th>文件</th><th>项目</th><th>类型</th><th>大小</th><th>修改时间</th><th>路径</th></tr></thead>
              <tbody>
                {reports.map(item => (
                  <tr key={item.path}>
                    <td>{item.fileName}</td>
                    <td>{item.project}</td>
                    <td>{item.type}</td>
                    <td>{formatSize(item.sizeBytes)}</td>
                    <td>{formatDate(item.mtime)}</td>
                    <td><span className="assistant-path-cell">{item.path}</span><CopyButton text={item.path} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="暂无报告数据" />
        )}
      </SectionCard>

      <SectionCard title="备份中心简表">
        {backups.length ? (
          <div className="assistant-table-wrap">
            <table className="assistant-table">
              <thead><tr><th>名称</th><th>项目</th><th>类型</th><th>大小</th><th>修改时间</th><th>路径</th></tr></thead>
              <tbody>
                {backups.map(item => (
                  <tr key={item.path}>
                    <td>{item.name}</td>
                    <td>{item.project}</td>
                    <td>{item.type}</td>
                    <td>{formatSize(item.sizeBytes, item.sizeTruncated)}</td>
                    <td>{formatDate(item.mtime)}</td>
                    <td><span className="assistant-path-cell">{item.path}</span><CopyButton text={item.path} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="暂无备份数据" />
        )}
      </SectionCard>

      <SectionCard title="风险边界区">
        {boundaries.length ? (
          <div className="assistant-boundary-list">
            {boundaries.map(item => (
              <article className="assistant-boundary" key={`${item.type}-${item.path}`}>
                <div className="assistant-boundary-head">
                  <strong>{item.path}</strong>
                  <RiskBadge value={item.riskLevel} />
                </div>
                <p>{item.note}</p>
                <div className="assistant-boundary-actions">
                  <span>允许：{item.allowedActions.join(' / ')}</span>
                  <span>禁止：{item.forbiddenActions.join(' / ')}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无风险边界数据" />
        )}
      </SectionCard>
    </PageShell>
  );
}
