import React, { useState, useEffect, useCallback } from 'react';
import PageShell from '../components/ui/PageShell';

interface Schedule {
  id: string;
  name: string;
  type: string;
  config_json: string;
  task_json: string;
  enabled: number;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RunLog {
  id: string;
  schedule_id: string;
  status: string;
  message: string | null;
  started_at: string;
  finished_at: string | null;
}

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
    borderRadius: 12, padding: 24, minWidth: 460, maxWidth: 560,
  };
}

export default function Scheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Logs state
  const [logsVisible, setLogsVisible] = useState<string | null>(null);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form state
  const [fName, setFName] = useState('');
  const [fType, setFType] = useState('interval');
  const [fCronExpr, setFCronExpr] = useState('* * * * *');
  const [fIntervalHours, setFIntervalHours] = useState('0');
  const [fIntervalMinutes, setFIntervalMinutes] = useState('30');
  const [fTaskAction, setFTaskAction] = useState('command');
  const [fTaskTemplate, setFTaskTemplate] = useState('');
  const [fEnabled, setFEnabled] = useState(true);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/schedules');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setSchedules(d.schedules || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const openAdd = () => {
    setEditing(null);
    setFName('');
    setFType('interval');
    setFCronExpr('* * * * *');
    setFIntervalHours('0');
    setFIntervalMinutes('30');
    setFTaskAction('command');
    setFTaskTemplate('');
    setFEnabled(true);
    setShowModal(true);
  };

  const save = async () => {
    const config = fType === 'cron' ? { cron_expr: fCronExpr } : { hours: parseInt(fIntervalHours) || 0, minutes: parseInt(fIntervalMinutes) || 30 };
    const task = { action: fTaskAction, template_id: fTaskTemplate };
    const body = { name: fName, type: fType, config, task, enabled: fEnabled };
    setActionLoading('save');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/schedules/${editing.id}` : '/api/schedules';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setShowModal(false);
      fetchSchedules();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setActionLoading(null);
    }
  };

  const toggle = async (s: Schedule) => {
    setActionLoading(s.id);
    try {
      await fetch(`/api/schedules/${s.id}/toggle`, { method: 'PATCH' });
      fetchSchedules();
    } finally {
      setActionLoading(null);
    }
  };

  const trigger = async (s: Schedule) => {
    setActionLoading(s.id);
    try {
      const res = await fetch(`/api/schedules/${s.id}/run`, { method: 'POST' });
      const d = await res.json();
      alert(d.message || 'Triggered');
      fetchSchedules();
    } finally {
      setActionLoading(null);
    }
  };

  const del = async (s: Schedule) => {
    if (!confirm(`Delete schedule "${s.name}"?`)) return;
    setActionLoading(s.id);
    try {
      await fetch(`/api/schedules/${s.id}`, { method: 'DELETE' });
      fetchSchedules();
    } finally {
      setActionLoading(null);
    }
  };

  const viewLogs = async (scheduleId: string) => {
    if (logsVisible === scheduleId) { setLogsVisible(null); return; }
    setLogsVisible(scheduleId);
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/logs`);
      const d = await res.json();
      setLogs(d.logs || []);
    } finally {
      setLogsLoading(false);
    }
  };

  const parseConfig = (s: Schedule): string => {
    try {
      const c = JSON.parse(s.config_json);
      if (s.type === 'cron') return `Cron: ${c.cron_expr || c.cron || '*'}`;
      return `Every ${c.hours || 0}h ${c.minutes || 0}m`;
    } catch { return '-'; }
  };

  const parseTask = (s: Schedule): string => {
    try { return JSON.stringify(JSON.parse(s.task_json)); } catch { return s.task_json; }
  };

  const fmtTs = (ts: string | null) => {
    if (!ts) return '--';
    try { return new Date(ts).toLocaleString('zh-CN'); } catch { return ts; }
  };

  const STATUS_COLORS: Record<string, string> = { running: 'var(--info)', success: 'var(--success)', failed: 'var(--danger)' };

  return (
    <PageShell title="Scheduler" subtitle="Manage interval and cron schedules with manual triggers" maturity="preview">
      {error && (
        <div style={{ ...SECT_STYLE, borderColor: 'var(--danger)', background: 'var(--danger-light)' }}>
          <span style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</span>
        </div>
      )}

      {loading && (
        <div style={SECT_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Loading schedules...
          </div>
        </div>
      )}

      {!loading && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{schedules.length} schedule(s)</div>
            <button onClick={openAdd} style={btnStyle(true)}>+ Add Schedule</button>
          </div>

          {schedules.length === 0 ? (
            <div style={{ ...SECT_STYLE, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No Schedules</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Create interval or cron schedules to automate tasks.</div>
              <button onClick={openAdd} style={btnStyle(true)}>+ Add Schedule</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Type', 'Config', 'Next Run', 'Last Run', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(s => (
                    <React.Fragment key={s.id}>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                            color: s.type === 'cron' ? 'var(--secondary)' : 'var(--info)',
                            border: `1px solid ${s.type === 'cron' ? 'var(--secondary)' : 'var(--info)'}`,
                          }}>{s.type}</span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{parseConfig(s)}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 11 }}>{fmtTs(s.next_run_at)}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 11 }}>{fmtTs(s.last_run_at)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <button onClick={() => toggle(s)} disabled={actionLoading === s.id} style={{
                            padding: '3px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                            background: s.enabled ? 'var(--success)' : 'var(--text-muted)', color: '#fff', border: 'none',
                            opacity: actionLoading === s.id ? 0.6 : 1,
                          }}>
                            {s.enabled ? 'ON' : 'OFF'}
                          </button>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button onClick={() => trigger(s)} disabled={actionLoading === s.id} style={btnStyle()}>Run</button>
                            <button onClick={() => viewLogs(s.id)} style={{ ...btnStyle(), color: logsVisible === s.id ? 'var(--primary)' : 'var(--text-secondary)' }}>Logs</button>
                            <button onClick={() => del(s)} disabled={actionLoading === s.id} style={{ ...btnStyle(), color: 'var(--danger)' }}>Del</button>
                          </div>
                        </td>
                      </tr>
                      {logsVisible === s.id && (
                        <tr>
                          <td colSpan={7} style={{ padding: '12px 12px', background: 'var(--bg-app)' }}>
                            <div style={SECT_TITLE_STYLE}>Run Logs</div>
                            {logsLoading ? (
                              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Loading...</span>
                            ) : logs.length === 0 ? (
                              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No run logs yet.</span>
                            ) : (
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Started', 'Finished', 'Status', 'Message'].map(h => (
                                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {logs.map(l => (
                                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>{fmtTs(l.started_at)}</td>
                                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>{fmtTs(l.finished_at)}</td>
                                      <td style={{ padding: '6px 10px', color: STATUS_COLORS[l.status] || 'var(--text-secondary)', fontWeight: 600 }}>{l.status}</td>
                                      <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{l.message || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay()} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={modalContent()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {editing ? 'Edit Schedule' : 'New Schedule'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Name</label>
                <input style={inputStyle()} value={fName} onChange={e => setFName(e.target.value)} placeholder="e.g. Daily Model Retrain" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Type</label>
                <select style={selectStyle()} value={fType} onChange={e => setFType(e.target.value)}>
                  <option value="interval">Interval</option>
                  <option value="cron">Cron</option>
                </select>
              </div>
              {fType === 'interval' ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Hours</label>
                    <input style={inputStyle()} type="number" min="0" value={fIntervalHours} onChange={e => setFIntervalHours(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Minutes</label>
                    <input style={inputStyle()} type="number" min="0" value={fIntervalMinutes} onChange={e => setFIntervalMinutes(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Cron Expression</label>
                  <input style={inputStyle()} value={fCronExpr} onChange={e => setFCronExpr(e.target.value)} placeholder="* * * * *" />
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Task Action</label>
                  <select style={selectStyle()} value={fTaskAction} onChange={e => setFTaskAction(e.target.value)}>
                    <option value="command">Command</option>
                    <option value="workflow">Workflow</option>
                  </select>
                </div>
                {fTaskAction === 'workflow' && (
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Template ID</label>
                    <input style={inputStyle()} value={fTaskTemplate} onChange={e => setFTaskTemplate(e.target.value)} placeholder="e.g. dataset-flywheel" />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={fEnabled} onChange={e => setFEnabled(e.target.checked)} id="se-enabled" />
                <label htmlFor="se-enabled" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Enabled</label>
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
