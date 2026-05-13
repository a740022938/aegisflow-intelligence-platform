import React, { useState, useCallback, useEffect } from 'react';
import { PageHeader, SectionCard, StatusBadge, EmptyState } from '../components/ui';
import '../components/ui/shared.css';

interface ApiResponse {
  ok: boolean; source?: string; mode?: string; command?: string;
  result?: any; error?: any; summary?: any; raw?: any; runId?: string;
  configured?: boolean; home?: string | null; cliExists?: boolean; issues?: string[];
  items?: any[]; total?: number; page?: number; pageSize?: number; totalPages?: number;
  taskCardMarkdown?: string; riskLevel?: string; projectPath?: string;
  createdAt?: string; id?: string; recommendations?: string[];
  rerunFrom?: string;
  suggestions?: any[];
  count?: number;
  taskIds?: string[];
}

async function apiPost(path: string, body: any): Promise<ApiResponse> {
  try {
    const res = await fetch(path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: { code: 'NETWORK', message: err.message, detail: '' } };
  }
}

async function apiGet(path: string): Promise<ApiResponse> {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: { code: 'NETWORK', message: err.message, detail: '' } };
  }
}

type ToolState = 'idle' | 'loading' | 'success' | 'error';

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '6px 10px',
  background: 'var(--bg-input)', border: '1px solid var(--border-color)',
  borderRadius: 6, color: 'var(--text-primary)', fontSize: 13,
};
const statRow: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13,
};

function riskColor(level?: string) {
  if (level === 'high') return 'var(--error)';
  if (level === 'medium') return 'var(--warning)';
  return 'var(--success)';
}

function copyText(text: string, setter: (v: boolean) => void) {
  navigator.clipboard.writeText(text).then(() => { setter(true); setTimeout(() => setter(false), 2000); });
}

function OpenAxiomReadonly() {
  // Status
  const [status, setStatus] = useState<ApiResponse | null>(null);
  const [statusState, setStatusState] = useState<ToolState>('idle');
  // Paths
  const [projectPath, setProjectPath] = useState(() => localStorage.getItem('openaxiom_project_path') || '');
  const [hcImagesDir, setHcImagesDir] = useState(() => localStorage.getItem('openaxiom_hc_images') || '');
  const [hcLabelsDir, setHcLabelsDir] = useState(() => localStorage.getItem('openaxiom_hc_labels') || '');
  // Independent tool results
  const [scanResult, setScanResult] = useState<ApiResponse | null>(null);
  const [scanState, setScanState] = useState<ToolState>('idle');
  const [hcResult, setHcResult] = useState<ApiResponse | null>(null);
  const [hcState, setHcState] = useState<ToolState>('idle');
  const [ydResult, setYdResult] = useState<ApiResponse | null>(null);
  const [ydState, setYdState] = useState<ToolState>('idle');
  // Diagnostic summary
  const [diagResult, setDiagResult] = useState<ApiResponse | null>(null);
  const [diagState, setDiagState] = useState<ToolState>('idle');
  const [diagCopied, setDiagCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyState, setHistoryState] = useState<ToolState>('idle');
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailState, setDetailState] = useState<ToolState>('idle');
  const [rerunResult, setRerunResult] = useState<ApiResponse | null>(null);
  const [rerunState, setRerunState] = useState<ToolState>('idle');
  const [detailCopied, setDetailCopied] = useState(false);
  // Stats dashboard
  const [statsData, setStatsData] = useState<any>(null);
  const [statsState, setStatsState] = useState<ToolState>('idle');
  // History filter
  const [historyRiskFilter, setHistoryRiskFilter] = useState('');
  const [historyDaysFilter, setHistoryDaysFilter] = useState(0);
  // Governance
  const [govSuggestions, setGovSuggestions] = useState<any[]>([]);
  const [govState, setGovState] = useState<ToolState>('idle');
  const [govTasks, setGovTasks] = useState<any[]>([]);
  const [govTaskTotal, setGovTaskTotal] = useState(0);
  const [govTaskPage, setGovTaskPage] = useState(1);
  const [govTaskState, setGovTaskState] = useState<ToolState>('idle');
  const [govTaskDetail, setGovTaskDetail] = useState<any>(null);
  const [govTaskFilter, setGovTaskFilter] = useState('');
  const [govCopied, setGovCopied] = useState(false);
  const [govMsg, setGovMsg] = useState('');

  const loadStats = useCallback(async (days = 30) => {
    setStatsState('loading');
    const res = await apiGet(`/api/openaxiom/diagnostic-stats?days=${days}`);
    if (res.ok) { setStatsData(res); setStatsState('success'); }
    else { setStatsState('error'); }
  }, []);

  const checkStatus = useCallback(async () => {
    setStatusState('loading');
    try {
      const res = await fetch('/api/openaxiom/status');
      const data = await res.json();
      setStatus(data);
      setStatusState(data.ok ? 'success' : 'error');
    } catch {
      setStatus({ ok: false, issues: ['API 不可达'] });
      setStatusState('error');
    }
  }, []);

  const doProjectScan = useCallback(async () => {
    if (!projectPath.trim()) return;
    localStorage.setItem('openaxiom_project_path', projectPath);
    setScanState('loading');
    const res = await apiPost('/api/openaxiom/project-scan', { projectPath: projectPath.trim() });
    setScanResult(res); setScanState(res.ok ? 'success' : 'error');
  }, [projectPath]);

  const doHealthCheck = useCallback(async () => {
    if (!hcImagesDir.trim() || !hcLabelsDir.trim()) return;
    localStorage.setItem('openaxiom_hc_images', hcImagesDir);
    localStorage.setItem('openaxiom_hc_labels', hcLabelsDir);
    setHcState('loading');
    const res = await apiPost('/api/openaxiom/label-health-check', { imagesDir: hcImagesDir.trim(), labelsDir: hcLabelsDir.trim() });
    setHcResult(res); setHcState(res.ok ? 'success' : 'error');
  }, [hcImagesDir, hcLabelsDir]);

  const doYoloDryRun = useCallback(async () => {
    if (!hcImagesDir.trim() || !hcLabelsDir.trim()) return;
    localStorage.setItem('openaxiom_yd_images', hcImagesDir);
    localStorage.setItem('openaxiom_yd_labels', hcLabelsDir);
    setYdState('loading');
    const res = await apiPost('/api/openaxiom/yolo-dry-run', { imagesDir: hcImagesDir.trim(), labelsDir: hcLabelsDir.trim() });
    setYdResult(res); setYdState(res.ok ? 'success' : 'error');
  }, [hcImagesDir, hcLabelsDir]);

  const doDiagnosticSummary = useCallback(async (autoSave = false) => {
    if (!projectPath.trim() || !hcImagesDir.trim() || !hcLabelsDir.trim()) return;
    setDiagState('loading'); setDiagCopied(false); setSaveMsg('');
    const url = '/api/openaxiom/diagnostic-summary' + (autoSave ? '?save=true' : '');
    const res = await apiPost(url, {
      projectPath: projectPath.trim(), imagesDir: hcImagesDir.trim(), labelsDir: hcLabelsDir.trim(),
    });
    setDiagResult(res); setDiagState(res.ok ? 'success' : 'error');
    if (res.runId) setSaveMsg('已自动保存审计记录');
  }, [projectPath, hcImagesDir, hcLabelsDir]);

  const saveAuditRecord = useCallback(async () => {
    if (!diagResult?.summary) return;
    setSaveMsg('');
    const res = await apiPost('/api/openaxiom/diagnostic-runs', {
      projectPath: projectPath.trim(),
      imagesDir: hcImagesDir.trim(),
      labelsDir: hcLabelsDir.trim(),
      summary: diagResult.summary,
      raw: diagResult.raw,
      riskLevel: diagResult.summary.riskLevel,
      recommendations: diagResult.summary.recommendations,
    });
    if (res.ok) {
      setSaveMsg('审计记录已保存 (ID: ' + res.runId?.slice(0, 8) + '…)');
      loadHistory(1, historyRiskFilter, historyDaysFilter);
      loadStats(30);
    } else {
      setSaveMsg('保存失败: ' + (res.error?.message || ''));
    }
  }, [diagResult, projectPath, hcImagesDir, hcLabelsDir]);

  const copyDiagnosticSummary = useCallback(() => {
    if (!diagResult?.summary) return;
    const s = diagResult.summary;
    const lines = [
      '## OpenAxiom 只读诊断摘要',
      '', `- **项目路径**: ${projectPath || '-'}`,
      `- **imagesDir**: ${hcImagesDir || '-'}`, `- **labelsDir**: ${hcLabelsDir || '-'}`,
      `- **风险等级**: ${s.riskLevel || 'unknown'}`,
      `- **项目就绪**: ${s.projectOk ? '是' : '否'}`,
      '', '### 数据集规模',
      `- 图片: ${s.imageCount}`, `- Label: ${s.labelCount}`, `- 匹配: ${s.matchedCount}`, `- 总 bbox: ${s.totalBoxes}`,
      '', '### 异常统计',
      `- 0 字节 label: ${s.zeroByteCount}`, `- 格式错误: ${s.badFormatCount}`,
      `- 坐标越界: ${s.badCoordCount}`, `- class_id 错误: ${s.badClassCount}`,
      `- 有图无标: ${s.imagesWithoutLabelsCount}`, `- 有标无图: ${s.labelsWithoutImagesCount}`,
      '', '### 问题列表', ...(s.issues || []).map((x: string) => `- ${x}`),
      '', '### 建议动作', ...(s.recommendations || []).map((x: string) => `- ${x}`),
      '', '---', '*当前模式: OpenAxiom 只读检查*',
    ];
    copyText(lines.join('\n'), setDiagCopied);
  }, [diagResult, projectPath, hcImagesDir, hcLabelsDir]);

  const loadHistory = useCallback(async (page = 1, riskLevel = '', days = 0) => {
    setHistoryState('loading');
    setHistoryPage(page);
    let url = `/api/openaxiom/diagnostic-runs?page=${page}&pageSize=20`;
    if (riskLevel) url += `&riskLevel=${riskLevel}`;
    if (days > 0) {
      const d = new Date(Date.now() - days * 86400000).toISOString();
      url += `&startDate=${encodeURIComponent(d)}`;
    }
    const res = await apiGet(url);
    if (res.ok) {
      setHistory(res.items || []);
      setHistoryTotal(res.total || 0);
      setHistoryState('success');
    } else {
      setHistoryState('error');
    }
  }, []);

  const openDetail = useCallback(async (id: string) => {
    setDetailState('loading'); setDetailItem(null); setRerunResult(null);
    const res = await apiGet(`/api/openaxiom/diagnostic-runs/${id}`);
    if (res.ok) {
      setDetailItem(res); setDetailState('success');
    } else {
      setDetailState('error');
    }
  }, []);

  const doRerun = useCallback(async (id: string) => {
    setRerunState('loading'); setRerunResult(null);
    const res = await apiPost(`/api/openaxiom/diagnostic-runs/${id}/rerun`, {});
    setRerunResult(res); setRerunState(res.ok ? 'success' : 'error');
  }, []);

  const getHistoryPage = () => Math.ceil(historyTotal / 20);

  // Governance functions
  const generateGovernance = useCallback(async (runId = '') => {
    if (!diagResult?.summary && !runId) return;
    setGovState('loading'); setGovMsg(''); setGovSuggestions([]);
    const res = await apiPost('/api/openaxiom/governance-suggestions', {
      runId: runId || undefined,
      summary: runId ? undefined : diagResult?.summary,
      projectPath: projectPath.trim(),
    });
    if (res.ok) { setGovSuggestions(res.suggestions || []); setGovState('success'); }
    else { setGovState('error'); setGovMsg(res.error?.message || '生成治理建议失败'); }
  }, [diagResult, projectPath]);

  const loadGovTasks = useCallback(async (page = 1, status = '') => {
    setGovTaskState('loading'); setGovTaskPage(page); setGovTaskFilter(status);
    let url = `/api/openaxiom/governance-tasks?page=${page}&pageSize=20`;
    if (status) url += `&status=${status}`;
    const res = await apiGet(url);
    if (res.ok) { setGovTasks(res.items || []); setGovTaskTotal(res.total || 0); setGovTaskState('success'); }
    else { setGovTaskState('error'); }
  }, []);

  const createGovTasks = useCallback(async () => {
    if (govSuggestions.length === 0) return;
    setGovMsg('');
    const res = await apiPost('/api/openaxiom/governance-tasks', {
      suggestions: govSuggestions,
      projectPath: projectPath.trim(),
      runId: diagResult?.runId || '',
    });
    if (res.ok) {
      setGovMsg(`已创建 ${res.count} 个人工处理任务`);
      loadGovTasks(1, govTaskFilter);
    } else {
      setGovMsg('创建任务失败: ' + (res.error?.message || ''));
    }
  }, [govSuggestions, projectPath, diagResult, govTaskFilter]);

  const updateGovTask = useCallback(async (id: string, status: string) => {
    const res = await fetch(`/api/openaxiom/governance-tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());
    if (res.ok) {
      loadGovTasks(govTaskPage, govTaskFilter);
      if (govTaskDetail?.id === id) setGovTaskDetail({ ...govTaskDetail, status });
    }
  }, [govTaskPage, govTaskFilter, govTaskDetail]);

  const openGovTaskDetail = useCallback(async (id: string) => {
    const res = await apiGet(`/api/openaxiom/governance-tasks/${id}`);
    if (res.ok) setGovTaskDetail(res);
  }, []);

  const copyGovMarkdown = useCallback(() => {
    if (!govSuggestions.length) return;
    const lines = [
      '# OpenAxiom 人工治理任务',
      '',
      `**风险等级**: ${govSuggestions.some(s => s.severity === 'high') ? '高' : govSuggestions.some(s => s.severity === 'medium') ? '中' : '低'}`,
      `**问题类型**: ${govSuggestions.map(s => s.type).join(', ')}`,
      `**项目路径**: ${projectPath || '-'}`,
      '',
      '| 类型 | 严重程度 | 数量 | 推荐动作 |',
      '|------|----------|------|----------|',
      ...govSuggestions.map(s => `| ${s.type} | ${s.severity} | ${s.count} | ${s.recommendedAction} |`),
      '',
      '### 安全边界',
      '- 只读检查结果',
      '- 禁止自动修改 label',
      '- 禁止自动恢复',
      '- 禁止批量覆盖',
      '- 需人工确认后处理',
      '',
      '*OpenAxiom 只读治理 — 仅生成建议，不自动修改*',
    ];
    copyText(lines.join('\n'), setGovCopied);
  }, [govSuggestions, projectPath]);

  useEffect(() => { loadHistory(1); loadStats(30); loadGovTasks(1); }, []);

  return (
    <div style={{ padding: 16 }}>
      <PageHeader title="OpenAxiom 只读检查" subtitle="AIP × OpenAxiom Readonly Integration" />

      {/* Safety banner */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 12,
        color: 'var(--text-secondary)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--warning)' }}>当前模式: OpenAxiom 只读检查</strong><br />
        允许保存: AIP 审计记录 · 禁止写入: label / images / data.yaml<br />
        不会保存 label · 不会恢复 label · 不会批量覆盖 · 不会删除文件
      </div>

      {/* Tool cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 16 }}>
        <SectionCard title="OpenAxiom 状态" actions={
          <button className="btn btn-sm" onClick={checkStatus} disabled={statusState === 'loading'}>
            {statusState === 'loading' ? '检查中…' : '检查状态'}
          </button>
        }>
          {statusState === 'idle' && !status && (<EmptyState message="点击「检查状态」查看" />)}
          {status && <div style={statRow}>
            <span>已配置</span><StatusBadge s={status.configured ? '是' : '否'} />
            <span>CLI 就绪</span><StatusBadge s={status.cliExists ? '是' : '否'} />
            <span>模式</span><span>只读</span>
            {status.issues?.map((x, i) => <React.Fragment key={i}><span style={{ color: 'var(--error)' }}>问题</span><span style={{ color: 'var(--error)', fontSize: 12 }}>{x}</span></React.Fragment>)}
          </div>}
        </SectionCard>

        <SectionCard title="项目扫描" actions={
          <button className="btn btn-sm" onClick={doProjectScan} disabled={scanState === 'loading' || !projectPath.trim()}>
            {scanState === 'loading' ? '扫描中…' : '扫描项目'}
          </button>
        }>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>项目路径 (projectPath)</label>
            <input className="input" type="text" value={projectPath} onChange={e => setProjectPath(e.target.value)}
              placeholder="例如: E:/Mahjong_V1_Project" style={inputStyle} />
          </div>
          {scanResult && <div style={{ fontSize: 13 }}>
            <StatusBadge s={scanResult.ok ? '通过' : '有异常'} />
            {scanResult.result && <><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
              <span>图片: {scanResult.result.image_count}</span><span>标签: {scanResult.result.label_count}</span>
              <span>类别: {(scanResult.result.class_names || []).join(', ') || '-'}</span>
            </div>
            {scanResult.result.issues?.length > 0 && <div style={{ color: 'var(--error)', maxHeight: 120, overflowY: 'auto', marginTop: 4 }}>
              {scanResult.result.issues.map((x: string, i: number) => <div key={i} style={{ fontSize: 12 }}>• {x}</div>)}
            </div>}</>}
            {scanResult.error && <div style={{ color: 'var(--error)', marginTop: 4 }}>{scanResult.error.message || JSON.stringify(scanResult.error)}</div>}
          </div>}
          {scanState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>执行中…</div>}
        </SectionCard>

        <SectionCard title="Label 健康检查" actions={
          <button className="btn btn-sm" onClick={doHealthCheck} disabled={hcState === 'loading' || !hcImagesDir.trim() || !hcLabelsDir.trim()}>
            {hcState === 'loading' ? '检查中…' : '执行检查'}
          </button>
        }>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>图片目录 (imagesDir)</label>
            <input className="input" type="text" value={hcImagesDir} onChange={e => setHcImagesDir(e.target.value)}
              placeholder="例如: E:/dataset/images" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>标签目录 (labelsDir)</label>
            <input className="input" type="text" value={hcLabelsDir} onChange={e => setHcLabelsDir(e.target.value)}
              placeholder="例如: E:/dataset/labels" style={inputStyle} />
          </div>
          {hcResult && <div style={{ fontSize: 13 }}>
            <StatusBadge s={hcResult.ok ? '全部通过' : '发现问题'} />
            {hcResult.result && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
              <span>扫描: {hcResult.result.label_count} 个 label</span>
              <span style={hcResult.result.zero_byte_count > 0 ? { color: 'var(--error)' } : {}}>0 字节: {hcResult.result.zero_byte_count}</span>
              <span style={hcResult.result.bad_format_count > 0 ? { color: 'var(--error)' } : {}}>格式错误: {hcResult.result.bad_format_count}</span>
              <span style={hcResult.result.bad_coord_count > 0 ? { color: 'var(--error)' } : {}}>坐标越界: {hcResult.result.bad_coord_count}</span>
              <span style={hcResult.result.bad_class_count > 0 ? { color: 'var(--error)' } : {}}>类别错误: {hcResult.result.bad_class_count}</span>
            </div>}
            {hcResult.error && <div style={{ color: 'var(--error)', marginTop: 4 }}>{hcResult.error.message || JSON.stringify(hcResult.error)}</div>}
          </div>}
          {hcState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>执行中…</div>}
        </SectionCard>

        <SectionCard title="YOLO Dry-Run" actions={
          <button className="btn btn-sm" onClick={doYoloDryRun} disabled={ydState === 'loading' || !hcImagesDir.trim() || !hcLabelsDir.trim()}>
            {ydState === 'loading' ? '执行中…' : '执行 Dry-Run'}
          </button>
        }>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>图片目录 (imagesDir)</label>
            <input className="input" type="text" value={hcImagesDir} onChange={e => setHcImagesDir(e.target.value)}
              placeholder="例如: E:/dataset/images" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>标签目录 (labelsDir)</label>
            <input className="input" type="text" value={hcLabelsDir} onChange={e => setHcLabelsDir(e.target.value)}
              placeholder="例如: E:/dataset/labels" style={inputStyle} />
          </div>
          {ydResult && <div style={{ fontSize: 13 }}>
            <StatusBadge s={ydResult.ok ? '全部匹配' : '存在异常'} />
            {ydResult.result && <><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
              <span>图片: {ydResult.result.image_count}</span><span>标签: {ydResult.result.label_count}</span>
              <span>匹配: {ydResult.result.matched_count}</span><span>总框: {ydResult.result.total_boxes}</span>
            </div>
            {ydResult.result.images_without_labels?.length > 0 && <div style={{ marginTop: 4 }}>
              <div style={{ color: 'var(--warning)', fontSize: 12 }}>有图无标 ({ydResult.result.images_without_labels.length})</div>
              <div style={{ maxHeight: 80, overflowY: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>
                {ydResult.result.images_without_labels.slice(0, 20).map((x: string, i: number) => <div key={i}>{x}</div>)}
              </div>
            </div>}
            {ydResult.result.labels_without_images?.length > 0 && <div style={{ marginTop: 4 }}>
              <div style={{ color: 'var(--warning)', fontSize: 12 }}>有标无图 ({ydResult.result.labels_without_images.length})</div>
              <div style={{ maxHeight: 80, overflowY: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>
                {ydResult.result.labels_without_images.slice(0, 20).map((x: string, i: number) => <div key={i}>{x}</div>)}
              </div>
            </div>}</>}
            {ydResult.error && <div style={{ color: 'var(--error)', marginTop: 4 }}>{ydResult.error.message || JSON.stringify(ydResult.error)}</div>}
          </div>}
          {ydState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>执行中…</div>}
        </SectionCard>
      </div>

      {/* Diagnostic Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginBottom: 24 }}>
        <SectionCard title="诊断摘要 (只读)" actions={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={() => doDiagnosticSummary(false)}
              disabled={diagState === 'loading' || !projectPath.trim() || !hcImagesDir.trim() || !hcLabelsDir.trim()}>
              {diagState === 'loading' ? '生成中…' : '生成诊断摘要'}
            </button>
            {diagResult && <button className="btn btn-sm" onClick={copyDiagnosticSummary}>{diagCopied ? '已复制' : '复制摘要'}</button>}
            {diagResult && <button className="btn btn-sm" onClick={saveAuditRecord}>保存本次审计</button>}
            {diagResult && <button className="btn btn-sm" onClick={() => doDiagnosticSummary(true)}>保存并生成</button>}
          </div>
        }>
          {diagState === 'idle' && !diagResult && (<EmptyState message="请填写路径，点击「生成诊断摘要」" />)}
          {diagState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>正在并行执行三个只读检查…</div>}
          {saveMsg && <div style={{ fontSize: 12, color: 'var(--success)', marginBottom: 4 }}>{saveMsg}</div>}
          {diagResult && diagResult.summary && <div style={{ fontSize: 13 }}>
            <div style={{ marginBottom: 8 }}>
              <StatusBadge s={diagResult.summary.projectOk ? '项目就绪' : '项目异常'} />
              <span style={{ marginLeft: 8, color: riskColor(diagResult.summary.riskLevel), fontWeight: 600 }}>
                风险等级: {diagResult.summary.riskLevel === 'high' ? '高' : diagResult.summary.riskLevel === 'medium' ? '中' : '低'}
              </span>
            </div>
            <div style={statRow}>
              <span>图片</span><span>{diagResult.summary.imageCount}</span>
              <span>Label</span><span>{diagResult.summary.labelCount}</span>
              <span>匹配</span><span>{diagResult.summary.matchedCount}</span>
              <span>总 bbox</span><span>{diagResult.summary.totalBoxes}</span>
            </div>
            <div style={{ marginTop: 8, padding: '8px 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>异常统计</div>
              <div style={statRow}>
                <span style={diagResult.summary.zeroByteCount > 0 ? { color: 'var(--error)' } : {}}>0 字节</span><span>{diagResult.summary.zeroByteCount}</span>
                <span style={diagResult.summary.badFormatCount > 0 ? { color: 'var(--error)' } : {}}>格式错误</span><span>{diagResult.summary.badFormatCount}</span>
                <span style={diagResult.summary.badCoordCount > 0 ? { color: 'var(--error)' } : {}}>坐标越界</span><span>{diagResult.summary.badCoordCount}</span>
                <span style={diagResult.summary.badClassCount > 0 ? { color: 'var(--error)' } : {}}>class_id 错误</span><span>{diagResult.summary.badClassCount}</span>
                <span style={diagResult.summary.imagesWithoutLabelsCount > 0 ? { color: 'var(--warning)' } : {}}>有图无标</span><span>{diagResult.summary.imagesWithoutLabelsCount}</span>
                <span style={diagResult.summary.labelsWithoutImagesCount > 0 ? { color: 'var(--warning)' } : {}}>有标无图</span><span>{diagResult.summary.labelsWithoutImagesCount}</span>
              </div>
            </div>
            {diagResult.summary.issues?.length > 0 && <div style={{ marginTop: 8, padding: '8px 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, color: 'var(--error)' }}>发现的问题</div>
              {diagResult.summary.issues.map((x: string, i: number) => <div key={i} style={{ fontSize: 12, marginBottom: 2 }}>• {x}</div>)}
            </div>}
            {diagResult.summary.recommendations?.length > 0 && <div style={{ marginTop: 8, padding: '8px 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>建议</div>
              {diagResult.summary.recommendations.map((x: string, i: number) => <div key={i} style={{ fontSize: 12, marginBottom: 2 }}>→ {x}</div>)}
            </div>}
            {diagResult.error && <div style={{ color: 'var(--error)', marginTop: 8 }}>{diagResult.error.message || JSON.stringify(diagResult.error)}</div>}
          </div>}
        </SectionCard>

        {/* Governance Suggestions */}
        <SectionCard title="治理建议 (仅建议，不自动修改)" actions={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={() => generateGovernance()}
              disabled={govState === 'loading' || !diagResult?.summary}>
              {govState === 'loading' ? '生成中…' : '生成治理建议'}
            </button>
            {govSuggestions.length > 0 && <button className="btn btn-sm" onClick={() => generateGovernance(diagResult?.runId || '')}>基于历史 runId</button>}
            {govSuggestions.length > 0 && <button className="btn btn-sm" onClick={copyGovMarkdown}>{govCopied ? '已复制' : '复制治理 Markdown'}</button>}
            {govSuggestions.length > 0 && <button className="btn btn-sm" onClick={createGovTasks}>创建处理任务</button>}
          </div>
        }>
          {govState === 'idle' && govSuggestions.length === 0 && <EmptyState message="先生成诊断摘要，然后点击「生成治理建议」" />}
          {govState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>生成治理建议中…</div>}
          {govMsg && <div style={{ fontSize: 12, color: govState === 'success' ? 'var(--success)' : 'var(--error)', marginBottom: 4 }}>{govMsg}</div>}
          {govSuggestions.length > 0 && <>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              {govSuggestions.filter(s => s.severity === 'high').length} 个 high · {govSuggestions.filter(s => s.severity === 'medium').length} 个 medium · {govSuggestions.filter(s => s.severity === 'low').length} 个 low
            </div>
            {govSuggestions.map((s: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0',
                borderBottom: i < govSuggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                fontSize: 12,
              }}>
                <StatusBadge s={s.severity === 'high' ? '高' : s.severity === 'medium' ? '中' : '低'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{s.description}</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>推荐: {s.recommendedAction}</div>
                  <div style={{ marginTop: 2, color: 'var(--warning)' }}>
                    需人工确认: 是 · 允许自动修复: 否
                  </div>
                </div>
              </div>
            ))}
          </>}
          {govState === 'error' && !govSuggestions.length && <div style={{ fontSize: 12, color: 'var(--error)' }}>{govMsg || '生成失败'}</div>}
        </SectionCard>
      </div>

      {/* Risk Dashboard */}
      <SectionCard title="审计风险看板" actions={
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={() => loadStats(7)} disabled={statsState === 'loading'}>7天</button>
          <button className="btn btn-sm" onClick={() => loadStats(30)} disabled={statsState === 'loading'}>30天</button>
          <button className="btn btn-sm" onClick={() => loadStats(90)} disabled={statsState === 'loading'}>90天</button>
          <button className="btn btn-sm" onClick={() => loadStats(365)} disabled={statsState === 'loading'}>全部</button>
        </div>
      }>
        {statsState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>加载统计…</div>}
        {statsState === 'error' && <div style={{ fontSize: 12, color: 'var(--error)' }}>加载统计失败</div>}
        {statsData?.summary && (
          <>
            {/* Summary stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
              {[
                { label: '总审计', value: statsData.summary.totalRuns },
                { label: '高风险', value: statsData.summary.highRiskCount, color: statsData.summary.highRiskCount > 0 ? 'var(--error)' : undefined },
                { label: '中风险', value: statsData.summary.mediumRiskCount, color: statsData.summary.mediumRiskCount > 0 ? 'var(--warning)' : undefined },
                { label: '低风险', value: statsData.summary.lowRiskCount },
                { label: '0 字节', value: statsData.summary.zeroByteTotal, color: statsData.summary.zeroByteTotal > 0 ? 'var(--error)' : undefined },
                { label: '格式异常', value: statsData.summary.badFormatTotal, color: statsData.summary.badFormatTotal > 0 ? 'var(--error)' : undefined },
                { label: '坐标异常', value: statsData.summary.badCoordTotal, color: statsData.summary.badCoordTotal > 0 ? 'var(--warning)' : undefined },
                { label: '有图无标', value: statsData.summary.imagesWithoutLabelsTotal, color: statsData.summary.imagesWithoutLabelsTotal > 0 ? 'var(--warning)' : undefined },
                { label: '有标无图', value: statsData.summary.labelsWithoutImagesTotal, color: statsData.summary.labelsWithoutImagesTotal > 0 ? 'var(--warning)' : undefined },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg-input)', borderRadius: 6, padding: '8px 10px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Advisory */}
            {(() => {
              const advices: string[] = [];
              const s = statsData.summary;
              if (s.highRiskCount > 0) advices.push('存在高风险数据集检查记录，建议优先处理 0 字节 label、格式错误、坐标异常。');
              if (s.zeroByteTotal > 0) advices.push('发现 0 字节 label，建议优先从备份或源数据恢复（需人工确认）。');
              if (s.badCoordTotal > 0) advices.push('发现坐标异常，建议进入人工复核。');
              if (s.imagesWithoutLabelsTotal > 0) advices.push('存在图片无 label，可能需要补标或确认负样本策略。');
              return advices.length > 0 ? (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--warning)', borderRadius: 6,
                  padding: '8px 12px', marginBottom: 12, fontSize: 12,
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--warning)' }}>风险提示</div>
                  {advices.map((a, i) => <div key={i} style={{ marginBottom: 2 }}>• {a}</div>)}
                </div>
              ) : <div style={{ fontSize: 12, color: 'var(--success)', marginBottom: 12 }}>✅ 近期审计未发现明显风险</div>;
            })()}

            {/* Top Issues + Recent High Risk */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(statsData.topIssues || []).length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>常见问题 Top Issues</div>
                  {(statsData.topIssues || []).map((issue: any, i: number) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', fontSize: 12,
                      padding: '4px 0', borderBottom: '1px solid var(--border-color)',
                    }}>
                      <span>{issue.type.replace(/_/g, ' ')}</span>
                      <span style={{ color: issue.severity === 'high' ? 'var(--error)' : 'var(--warning)' }}>
                        {issue.count} ({issue.severity})
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {(statsData.recentHighRiskRuns || []).length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>最近高风险记录</div>
                  {statsData.recentHighRiskRuns.slice(0, 5).map((r: any, i: number) => (
                    <div key={i} style={{
                      fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer', color: 'var(--primary)',
                    }} onClick={() => openDetail(r.id)}>
                      {r.createdAt?.slice(0, 10)} — {r.projectPath?.split('/').pop()?.split('\\').pop()}
                      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
                        (0B:{r.zeroByteCount} Fmt:{r.badFormatCount})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {statsData.parseErrors > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                ⚠ {statsData.parseErrors} 条记录解析异常（部分旧记录可能缺少 summary 字段）
              </div>
            )}
            {statsData.summary.totalRuns === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>所选时间范围内无审计记录</div>}
          </>
        )}
        {!statsData && statsState === 'idle' && <EmptyState message="加载统计中…" />}
      </SectionCard>

      {/* History Section */}
      <SectionCard title="历史审计记录" actions={
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="input" style={{ fontSize: 12, padding: '3px 6px', width: 'auto' }}
            value={historyRiskFilter} onChange={e => {
              setHistoryRiskFilter(e.target.value);
              loadHistory(1, e.target.value, historyDaysFilter);
            }}>
            <option value="">全部风险</option>
            <option value="high">高风险</option>
            <option value="medium">中风险</option>
            <option value="low">低风险</option>
          </select>
          <select className="input" style={{ fontSize: 12, padding: '3px 6px', width: 'auto' }}
            value={historyDaysFilter} onChange={e => {
              const d = parseInt(e.target.value, 10);
              setHistoryDaysFilter(d);
              loadHistory(1, historyRiskFilter, d);
            }}>
            <option value="0">全部时间</option>
            <option value="7">最近 7 天</option>
            <option value="30">最近 30 天</option>
            <option value="90">最近 90 天</option>
          </select>
        </div>
      }>
        {historyState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>加载中…</div>}
        {history.length === 0 && historyState !== 'loading' && <EmptyState message="暂无审计记录" />}
        {history.length > 0 && <>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>共 {historyTotal} 条记录</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.map((item: any) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
                background: 'var(--bg-input)', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                border: detailItem?.id === item.id ? '1px solid var(--primary)' : '1px solid transparent',
              }} onClick={() => openDetail(item.id)}>
                <span style={{ color: 'var(--text-muted)', minWidth: 120 }}>{item.createdAt?.slice(0, 19)?.replace('T', ' ')}</span>
                <StatusBadge s={item.riskLevel === 'high' ? '高风险' : item.riskLevel === 'medium' ? '中风险' : '低风险'} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.projectPath}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.imageCount} 图 / {item.labelCount} 标 / 0B:{item.zeroByteCount}</span>
              </div>
            ))}
          </div>
          {getHistoryPage() > 1 && <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
            <button className="btn btn-sm" disabled={historyPage <= 1} onClick={() => loadHistory(historyPage - 1, historyRiskFilter, historyDaysFilter)}>上一页</button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 8px' }}>{historyPage} / {getHistoryPage()}</span>
            <button className="btn btn-sm" disabled={historyPage >= getHistoryPage()} onClick={() => loadHistory(historyPage + 1, historyRiskFilter, historyDaysFilter)}>下一页</button>
          </div>}
        </>}
      </SectionCard>

      {/* Detail Panel */}
      {detailState === 'loading' && <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)' }}>加载详情…</div>}
      {detailItem && (
        <SectionCard title="审计详情" actions={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={() => copyText(detailItem.taskCardMarkdown || '', setDetailCopied)}>
              {detailCopied ? '已复制任务卡片' : '复制任务卡片'}
            </button>
            <button className="btn btn-sm" onClick={() => doRerun(detailItem.id)} disabled={rerunState === 'loading'}>
              {rerunState === 'loading' ? '复查中…' : '复查'}
            </button>
            <button className="btn btn-sm" onClick={() => { setDetailItem(null); setRerunResult(null); }}>关闭</button>
          </div>
        }>
          <div style={{ fontSize: 13, marginBottom: 8 }}>
            <div style={statRow}>
              <span>记录 ID</span><span style={{ fontSize: 11 }}>{detailItem.id}</span>
              <span>时间</span><span>{detailItem.createdAt?.slice(0, 19)?.replace('T', ' ')}</span>
              <span>项目路径</span><span style={{ wordBreak: 'break-all', fontSize: 12 }}>{detailItem.projectPath || '-'}</span>
              <span>风险等级</span><span style={{ color: riskColor(detailItem.riskLevel), fontWeight: 600 }}>{detailItem.riskLevel}</span>
            </div>
            {detailItem.summary && <div style={{ marginTop: 8, padding: '8px 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>统计</div>
              <div style={statRow}>
                <span>图片</span><span>{detailItem.summary.imageCount}</span>
                <span>Label</span><span>{detailItem.summary.labelCount}</span>
                <span>匹配</span><span>{detailItem.summary.matchedCount}</span>
                <span>总框</span><span>{detailItem.summary.totalBoxes}</span>
                <span>0 字节</span><span style={detailItem.summary.zeroByteCount > 0 ? { color: 'var(--error)' } : {}}>{detailItem.summary.zeroByteCount}</span>
                <span>格式错误</span><span style={detailItem.summary.badFormatCount > 0 ? { color: 'var(--error)' } : {}}>{detailItem.summary.badFormatCount}</span>
              </div>
            </div>}
            {detailItem.recommendations?.length > 0 && <div style={{ marginTop: 8, padding: '8px 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>建议</div>
              {detailItem.recommendations.map((x: string, i: number) => <div key={i} style={{ fontSize: 12, marginBottom: 2 }}>→ {x}</div>)}
            </div>}
            {detailItem.taskCardMarkdown && <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>任务卡片预览</div>
              <div style={{
                fontSize: 11, whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                background: 'var(--bg-input)', borderRadius: 6, padding: 10,
                maxHeight: 200, overflowY: 'auto', lineHeight: 1.4,
              }}>{detailItem.taskCardMarkdown}</div>
            </div>}
          </div>

          {/* Rerun result */}
          {rerunState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>正在复查…</div>}
          {rerunResult && rerunResult.summary && <div style={{
            marginTop: 8, padding: 12, borderRadius: 6,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>复查结果</div>
            <div style={statRow}>
              <span>图片</span><span>{rerunResult.summary.imageCount}</span>
              <span>Label</span><span>{rerunResult.summary.labelCount}</span>
              <span>匹配</span><span>{rerunResult.summary.matchedCount}</span>
              <span>总框</span><span>{rerunResult.summary.totalBoxes}</span>
              <span>0 字节</span><span style={rerunResult.summary.zeroByteCount > 0 ? { color: 'var(--error)' } : {}}>{rerunResult.summary.zeroByteCount}</span>
              <span>格式错误</span><span style={rerunResult.summary.badFormatCount > 0 ? { color: 'var(--error)' } : {}}>{rerunResult.summary.badFormatCount}</span>
              <span>风险等级</span><span style={{ color: riskColor(rerunResult.summary.riskLevel), fontWeight: 600 }}>{rerunResult.summary.riskLevel}</span>
            </div>
            {rerunResult.summary.issues?.length > 0 && <div style={{ marginTop: 4, color: 'var(--error)', fontSize: 12 }}>
              {rerunResult.summary.issues.map((x: string, i: number) => <div key={i}>• {x}</div>)}
            </div>}
          </div>}
        </SectionCard>
      )}

      {/* Governance Tasks Queue */}
      <SectionCard title="人工处理队列" actions={
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="input" style={{ fontSize: 12, padding: '3px 6px', width: 'auto' }}
            value={govTaskFilter} onChange={e => loadGovTasks(1, e.target.value)}>
            <option value="">全部状态</option>
            <option value="open">待处理</option>
            <option value="reviewing">审查中</option>
            <option value="resolved">已解决</option>
            <option value="ignored">已忽略</option>
          </select>
          <button className="btn btn-sm" onClick={() => loadGovTasks(1, govTaskFilter)} disabled={govTaskState === 'loading'}>
            {govTaskState === 'loading' ? '刷新中…' : '刷新'}
          </button>
        </div>
      }>
        {govTaskState === 'loading' && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>加载中…</div>}
        {govTasks.length === 0 && govTaskState !== 'loading' && <EmptyState message="暂无人工处理任务" />}
        {govTasks.length > 0 && <>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>共 {govTaskTotal} 个任务</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {govTasks.map((t: any) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                background: 'var(--bg-input)', borderRadius: 6, fontSize: 12,
                cursor: 'pointer', border: govTaskDetail?.id === t.id ? '1px solid var(--primary)' : '1px solid transparent',
                flexWrap: 'wrap',
              }} onClick={() => openGovTaskDetail(t.id)}>
                <StatusBadge s={t.severity === 'high' ? '高' : t.severity === 'medium' ? '中' : '低'} />
                <StatusBadge s={
                  t.status === 'open' ? '待处理' : t.status === 'reviewing' ? '审查中' : t.status === 'resolved' ? '已解决' : '已忽略'
                } />
                <span style={{ flex: 1, minWidth: 100 }}>{t.title}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t.count} 个 · {t.createdAt?.slice(0, 10)}</span>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  {t.status === 'open' && <button className="btn btn-sm" onClick={() => updateGovTask(t.id, 'reviewing')}>审查中</button>}
                  {t.status === 'reviewing' && <button className="btn btn-sm" onClick={() => updateGovTask(t.id, 'resolved')}>已解决</button>}
                  {(t.status === 'open' || t.status === 'reviewing') && <button className="btn btn-sm" onClick={() => updateGovTask(t.id, 'ignored')}>忽略</button>}
                </div>
              </div>
            ))}
          </div>
          {Math.ceil(govTaskTotal / 20) > 1 && <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
            <button className="btn btn-sm" disabled={govTaskPage <= 1} onClick={() => loadGovTasks(govTaskPage - 1, govTaskFilter)}>上一页</button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 8px' }}>{govTaskPage} / {Math.ceil(govTaskTotal / 20)}</span>
            <button className="btn btn-sm" disabled={govTaskPage >= Math.ceil(govTaskTotal / 20)} onClick={() => loadGovTasks(govTaskPage + 1, govTaskFilter)}>下一页</button>
          </div>}
        </>}

        {/* Task Detail */}
        {govTaskDetail && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>任务详情</span>
              <button className="btn btn-sm" onClick={() => setGovTaskDetail(null)}>关闭</button>
            </div>
            <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4px 12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>ID</span><span style={{ fontSize: 11 }}>{govTaskDetail.id}</span>
              <span style={{ color: 'var(--text-secondary)' }}>类型</span><span>{govTaskDetail.type}</span>
              <span style={{ color: 'var(--text-secondary)' }}>状态</span><StatusBadge s={govTaskDetail.status === 'open' ? '待处理' : govTaskDetail.status === 'reviewing' ? '审查中' : govTaskDetail.status === 'resolved' ? '已解决' : '已忽略'} />
              <span style={{ color: 'var(--text-secondary)' }}>严重程度</span><StatusBadge s={govTaskDetail.severity === 'high' ? '高' : govTaskDetail.severity === 'medium' ? '中' : '低'} />
              <span style={{ color: 'var(--text-secondary)' }}>标题</span><span>{govTaskDetail.title}</span>
              <span style={{ color: 'var(--text-secondary)' }}>描述</span><span>{govTaskDetail.description}</span>
              <span style={{ color: 'var(--text-secondary)' }}>推荐动作</span><span>{govTaskDetail.recommendedAction}</span>
              <span style={{ color: 'var(--text-secondary)' }}>数量</span><span>{govTaskDetail.count}</span>
              <span style={{ color: 'var(--text-secondary)' }}>关联诊断</span><span style={{ fontSize: 11 }}>{govTaskDetail.relatedRunId || '-'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>需人工确认</span><span style={{ color: 'var(--warning)' }}>{govTaskDetail.requiresHumanApproval ? '是' : '否'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>允许自动修复</span><span style={{ color: 'var(--error)' }}>{govTaskDetail.autoFixAllowed ? '是' : '否'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {govTaskDetail.status === 'open' && <button className="btn btn-sm" onClick={() => updateGovTask(govTaskDetail.id, 'reviewing')}>标记审查中</button>}
              {govTaskDetail.status === 'reviewing' && <button className="btn btn-sm" onClick={() => updateGovTask(govTaskDetail.id, 'resolved')}>标记已解决</button>}
              {(govTaskDetail.status === 'open' || govTaskDetail.status === 'reviewing') && <button className="btn btn-sm" onClick={() => updateGovTask(govTaskDetail.id, 'ignored')}>忽略</button>}
              <button className="btn btn-sm" onClick={async () => {
                if (govTaskDetail.relatedRunId) {
                  await generateGovernance(govTaskDetail.relatedRunId);
                  setGovMsg('已生成基于关联诊断的治理建议');
                }
              }} disabled={!govTaskDetail.relatedRunId}>关联诊断建议</button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Footer */}
      <div style={{
        marginTop: 24, padding: 12, borderRadius: 8,
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
      }}>
        OpenAxiom 只读治理 · 允许写入 AIP 审计/任务记录 · 禁止写入 label / images / data.yaml · 所有治理任务需人工确认
      </div>
    </div>
  );
}

export default OpenAxiomReadonly;
