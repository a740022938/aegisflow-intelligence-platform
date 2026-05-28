import React, { useState, useEffect, useCallback } from 'react';
import PageShell from '../components/ui/PageShell';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

interface HistoryEntry {
  id: string;
  rule_id: string;
  rule_name: string;
  metric: string;
  triggered_value: number;
  threshold: number;
  severity: string;
  created_at: string;
}

const METRICS = ['cpu', 'memory', 'disk', 'gpu', 'model_perf'];
const OPERATORS = ['gt', 'lt'];
const SEVERITIES = ['info', 'warn', 'critical'];

const SEV_COLORS: Record<string, string> = {
  info: 'var(--info)',
  warn: 'var(--warning)',
  critical: 'var(--danger)',
};

const SECT_STYLE: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border)',
  borderRadius: 8, padding: 20, marginBottom: 16,
};

const SECT_TITLE_STYLE: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16,
};

function btnStyle(primary?: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500,
    fontFamily: 'inherit', background: primary ? 'var(--primary)' : 'var(--bg-surface)',
    color: primary ? '#fff' : 'var(--text-secondary)', border: primary ? 'none' : '1px solid var(--border)',
  };
}

function inputStyle(): React.CSSProperties {
  return {
    padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)',
    background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: 13,
    width: '100%', boxSizing: 'border-box', outline: 'none',
  };
}

function selectStyle(): React.CSSProperties {
  return {
    padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)',
    background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: 13,
    minWidth: 120, outline: 'none',
  };
}

function modalOverlay(): React.CSSProperties {
  return {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
  };
}

function modalContent(): React.CSSProperties {
  return {
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 24, minWidth: 420, maxWidth: 520,
  };
}

export default function AlertCenter() {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AlertRule | null>(null);

  // Form state
  const [fName, setFName] = useState('');
  const [fMetric, setFMetric] = useState('cpu');
  const [fOperator, setFOperator] = useState('gt');
  const [fThreshold, setFThreshold] = useState('80');
  const [fSeverity, setFSeverity] = useState('warn');
  const [fEnabled, setFEnabled] = useState(true);
  const [tab, setTab] = useState<'rules' | 'history'>('rules');

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setAlerts(d.alerts || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts/history');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setHistory(d.history || []);
    } catch {}
  }, []);

  useEffect(() => { fetchAlerts(); fetchHistory(); }, [fetchAlerts, fetchHistory]);

  const openAdd = () => {
    setEditing(null);
    setFName('');
    setFMetric('cpu');
    setFOperator('gt');
    setFThreshold('80');
    setFSeverity('warn');
    setFEnabled(true);
    setShowModal(true);
  };

  const openEdit = (rule: AlertRule) => {
    setEditing(rule);
    setFName(rule.name);
    setFMetric(rule.metric);
    setFOperator(rule.operator);
    setFThreshold(String(rule.threshold));
    setFSeverity(rule.severity);
    setFEnabled(!!rule.enabled);
    setShowModal(true);
  };

  const save = async () => {
    const body = {
      name: fName,
      metric: fMetric,
      operator: fOperator,
      threshold: parseFloat(fThreshold) || 80,
      severity: fSeverity,
      enabled: fEnabled,
    };
    setActionLoading('save');
    try {
      const url = editing ? `/api/alerts/${editing.id}` : '/api/alerts';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowModal(false);
      fetchAlerts();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setActionLoading(null);
    }
  };

  const toggle = async (rule: AlertRule) => {
    setActionLoading(rule.id);
    try {
      await fetch(`/api/alerts/${rule.id}/toggle`, { method: 'PATCH' });
      fetchAlerts();
    } finally {
      setActionLoading(null);
    }
  };

  const del = async (rule: AlertRule) => {
    if (!confirm(`Delete alert rule "${rule.name}"?`)) return;
    setActionLoading(rule.id);
    try {
      await fetch(`/api/alerts/${rule.id}`, { method: 'DELETE' });
      fetchAlerts();
    } finally {
      setActionLoading(null);
    }
  };

  const testAlert = async (rule: AlertRule) => {
    setActionLoading(rule.id);
    try {
      const res = await fetch(`/api/alerts/${rule.id}/test`, { method: 'POST' });
      const d = await res.json();
      alert(d.message || 'Test sent');
      fetchHistory();
    } finally {
      setActionLoading(null);
    }
  };

  const fmtTs = (ts: string) => { try { return new Date(ts).toLocaleString('zh-CN'); } catch { return ts; } };

  return (
    <PageShell title="Alert Center" subtitle="Manage alert rules, view history, test triggers" maturity="preview">
      {error && (
        <div style={{ ...SECT_STYLE, borderColor: 'var(--danger)', background: 'var(--danger-light)' }}>
          <span style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        <button onClick={() => setTab('rules')} style={{
          ...btnStyle(), background: tab === 'rules' ? 'var(--primary)' : 'var(--bg-surface)',
          color: tab === 'rules' ? '#fff' : 'var(--text-secondary)', border: tab === 'rules' ? 'none' : '1px solid var(--border)',
        }}>
          Alert Rules ({alerts.length})
        </button>
        <button onClick={() => setTab('history')} style={{
          ...btnStyle(), background: tab === 'history' ? 'var(--primary)' : 'var(--bg-surface)',
          color: tab === 'history' ? '#fff' : 'var(--text-secondary)', border: tab === 'history' ? 'none' : '1px solid var(--border)',
        }}>
          History ({history.length})
        </button>
      </div>

      {loading && (
        <div style={SECT_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Loading...
          </div>
        </div>
      )}

      {tab === 'rules' && !loading && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{alerts.length} rule(s)</div>
            <button onClick={openAdd} style={btnStyle(true)}>+ Add Rule</button>
          </div>

          {alerts.length === 0 ? (
            <div style={{ ...SECT_STYLE, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No Alert Rules</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Create your first alert rule to monitor system metrics.</div>
              <button onClick={openAdd} style={btnStyle(true)}>+ Add Rule</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Metric', 'Condition', 'Severity', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(rule => (
                    <tr key={rule.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{rule.name}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{rule.metric}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        <code>{rule.operator}</code> {rule.threshold}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          color: SEV_COLORS[rule.severity] || 'var(--text-muted)',
                          border: `1px solid ${SEV_COLORS[rule.severity] || 'var(--border)'}`,
                        }}>{rule.severity}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => toggle(rule)} disabled={actionLoading === rule.id} style={{
                          padding: '3px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                          background: rule.enabled ? 'var(--success)' : 'var(--text-muted)', color: '#fff', border: 'none',
                          opacity: actionLoading === rule.id ? 0.6 : 1,
                        }}>
                          {rule.enabled ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => testAlert(rule)} disabled={actionLoading === rule.id} style={btnStyle()}>Test</button>
                          <button onClick={() => openEdit(rule)} style={btnStyle()}>Edit</button>
                          <button onClick={() => del(rule)} disabled={actionLoading === rule.id} style={{ ...btnStyle(), color: 'var(--danger)' }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div style={SECT_STYLE}>
          <div style={SECT_TITLE_STYLE}>Alert History</div>
          {history.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No alert history yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'Rule', 'Metric', 'Value', 'Threshold', 'Severity'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 11 }}>{fmtTs(h.created_at)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{h.rule_name}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.metric}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--danger)', fontWeight: 600 }}>{h.triggered_value}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.threshold}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          color: SEV_COLORS[h.severity] || 'var(--text-muted)',
                          border: `1px solid ${SEV_COLORS[h.severity] || 'var(--border)'}`,
                        }}>{h.severity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay()} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={modalContent()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {editing ? 'Edit Alert Rule' : 'New Alert Rule'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Name</label>
                <input style={inputStyle()} value={fName} onChange={e => setFName(e.target.value)} placeholder="e.g. High CPU Alert" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Metric</label>
                  <select style={selectStyle()} value={fMetric} onChange={e => setFMetric(e.target.value)}>
                    {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Operator</label>
                  <select style={selectStyle()} value={fOperator} onChange={e => setFOperator(e.target.value)}>
                    {OPERATORS.map(o => <option key={o} value={o}>{o === 'gt' ? 'greater than' : 'less than'}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Threshold</label>
                  <input style={inputStyle()} type="number" value={fThreshold} onChange={e => setFThreshold(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Severity</label>
                  <select style={selectStyle()} value={fSeverity} onChange={e => setFSeverity(e.target.value)}>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                  <input type="checkbox" checked={fEnabled} onChange={e => setFEnabled(e.target.checked)} id="ae-enabled" />
                  <label htmlFor="ae-enabled" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Enabled</label>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={btnStyle()}>Cancel</button>
              <button onClick={save} disabled={actionLoading === 'save' || !fName} style={btnStyle(true)}>
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
