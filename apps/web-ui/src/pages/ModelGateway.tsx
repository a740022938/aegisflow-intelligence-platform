import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import StatusBadge from '../components/ui/StatusBadge';
import { clearJwt, getJwt } from '../services/authStore';
import './ModelGateway.css';

type EndpointStatus = {
  name: string;
  url?: string;
  status?: string;
  health?: any;
  modelListStatus?: string;
  countTokensStatus?: string;
  countTokensProbeReadonly?: boolean;
  processCount?: number;
  script?: { path: string; exists: boolean; updated_at?: string | null };
  starter?: { path: string; exists: boolean; updated_at?: string | null };
  hasE4B?: boolean;
  models?: Array<{ id?: string; name?: string; model?: string; parameter_size?: string; quantization_level?: string }>;
  keyConfiguredForAipGateway?: boolean;
};

type LlamaCppStatus = {
  ok: boolean;
  running: boolean;
  model: string | null;
  endpoint: string;
  hint?: string;
};

type GatewayStatus = {
  ok: boolean;
  mode: string;
  contractVersion?: string;
  authRequired?: boolean;
  publicSafe?: boolean;
  capability?: string;
  execution?: Record<string, boolean>;
  updated_at: string;
  endpoints: Record<string, EndpointStatus>;
  routePolicy: Array<{ clientModel: string; provider: string; targetModel: string }>;
  safety: { notes: string[]; legacyProxyUntouched: boolean; readonlyApi: boolean; secretRedaction: boolean };
};

function requireJwt(): string {
  const token = getJwt();
  if (!token) {
    throw new Error('请先通过顶部授权入口验证令牌。不会再使用默认管理员账号自动登录。');
  }
  return token;
}

async function fetchModelGatewayStatus(): Promise<GatewayStatus> {
  const token = requireJwt();

  const response = await fetch('/api/model-gateway/status', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (data?._unauthorized || response.status === 401) {
    clearJwt();
    throw new Error('授权已过期，请重新验证令牌。');
  }

  if (!response.ok || data?.ok === false) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}

function badgeStatus(value?: string) {
  const v = value || 'unknown';
  const map: Record<string, string> = {
    online: 'success',
    configured: 'success',
    offline: 'failed',
    timeout: 'pending',
    key_missing_for_sidecar: 'pending',
  };
  return <StatusBadge s={map[v] || v} emptyText={v} />;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('zh-CN');
  } catch {
    return value;
  }
}

function EndpointCard({ item }: { item: EndpointStatus }) {
  const modelCount = item.models?.length || 0;
  return (
    <div className="model-gateway-card">
      <div className="model-gateway-card-head">
        <h3 className="model-gateway-card-title">{item.name}</h3>
        {badgeStatus(item.status)}
      </div>
      <div className="model-gateway-meta">
        <span>地址</span><strong>{item.url || '—'}</strong>
        <span>进程</span><strong>{item.processCount === undefined ? '—' : `${item.processCount} 个`}</strong>
        <span>E4B</span><strong>{item.hasE4B === undefined ? '—' : item.hasE4B ? '已安装' : '未发现'}</strong>
        <span>Key</span><strong>{item.keyConfiguredForAipGateway === undefined ? '—' : item.keyConfiguredForAipGateway ? '已配置' : '未配置'}</strong>
        <span>模型数</span><strong>{modelCount || '—'}</strong>
        <span>列表</span><strong>{item.modelListStatus || '—'}</strong>
        <span>Token</span><strong>{item.countTokensStatus || '—'}</strong>
      </div>
      {item.script && (
        <p className="model-gateway-path">
          script: {item.script.path} · {item.script.exists ? 'exists' : 'missing'} · {formatDate(item.script.updated_at)}
        </p>
      )}
      {item.starter && (
        <p className="model-gateway-path">
          starter: {item.starter.path} · {item.starter.exists ? 'exists' : 'missing'} · {formatDate(item.starter.updated_at)}
        </p>
      )}
    </div>
  );
}

export default function ModelGateway() {
  const [data, setData] = useState<GatewayStatus | null>(null);
  const [llamaStatus, setLlamaStatus] = useState<LlamaCppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchModelGatewayStatus());
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLlama = useCallback(async () => {
    try {
      const res = await fetch('/api/system/llama-status');
      if (res.ok) {
        const d = await res.json();
        setLlamaStatus(d);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    load();
    loadLlama();
    const timer = window.setInterval(() => { load(); loadLlama(); }, 30000);
    return () => window.clearInterval(timer);
  }, [load, loadLlama]);

  const endpoints = useMemo(() => Object.values(data?.endpoints || {}), [data]);

  return (
    <PageShell
      title="AIP Model Gateway"
      subtitle="Claude / DeepSeek / Ollama E4B 本地模型只读 readiness dashboard"
      eyebrow="Readonly"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="本页只显示 readiness，不启动、停止、重启、替换代理或切换 provider。"
      actions={<button className="assistant-copy-btn" type="button" onClick={load} disabled={loading}>{loading ? '刷新中' : '刷新'}</button>}
    >
      {error && (
        <SectionCard title="状态读取失败">
          <p className="model-gateway-path">{error}</p>
        </SectionCard>
      )}

      <SectionCard title="运行状态" subtitle={`最近检查：${formatDate(data?.updated_at)} · ${data?.contractVersion || 'contract pending'}`}>
        <div className="model-gateway-grid">
          {endpoints.map(item => <EndpointCard key={item.name} item={item} />)}
        </div>
      </SectionCard>

      <SectionCard title="路由策略预览" subtitle="仅展示 sidecar readiness 下的目标映射；本页不切换 provider，也不代表模型调用已真实接通。">
        <table className="model-gateway-table">
          <thead>
            <tr>
              <th>客户端模型</th>
              <th>Provider</th>
              <th>目标模型</th>
            </tr>
          </thead>
          <tbody>
            {(data?.routePolicy || []).map(route => (
              <tr key={`${route.clientModel}-${route.provider}-${route.targetModel}`}>
                <td className="model-gateway-code">{route.clientModel}</td>
                <td>{route.provider}</td>
                <td className="model-gateway-code">{route.targetModel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {llamaStatus && (
        <SectionCard title="llama.cpp">
          <div className="model-gateway-card">
            <div className="model-gateway-card-head">
              <h3 className="model-gateway-card-title">llama.cpp Server</h3>
              {badgeStatus(llamaStatus.running ? 'online' : 'offline')}
            </div>
            <div className="model-gateway-meta">
              <span>Endpoint</span><strong>{llamaStatus.endpoint}</strong>
              <span>Model</span><strong>{llamaStatus.model || '—'}</strong>
              <span>Status</span><strong>{llamaStatus.running ? 'Running' : 'Not Running'}</strong>
            </div>
            {!llamaStatus.running && llamaStatus.hint && (
              <p className="model-gateway-path">{llamaStatus.hint}</p>
            )}
          </div>
        </SectionCard>
      )}

      <SectionCard title="安全边界" subtitle={`auth=${data?.authRequired ? 'required' : 'unknown'} · publicSafe=${data?.publicSafe ? 'yes' : 'no'}`}>
        <ul className="model-gateway-note-list">
          {(data?.safety?.notes || [
            'AIP 状态 API 只探测本机服务和文件。',
            '不读取或返回 DeepSeek API Key。',
            '不替换 127.0.0.1:15721 上的现有 Claude 代理。',
          ]).map(note => <li key={note}>{note}</li>)}
        </ul>
      </SectionCard>
    </PageShell>
  );
}
