import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageShell from '../components/ui/PageShell';

interface CpuInfo {
  model: string;
  cores: number;
  usage_percent: number;
  load: number[];
}

interface MemInfo {
  total: number;
  used: number;
  free: number;
  used_percent: number;
  total_formatted: string;
  used_formatted: string;
  free_formatted: string;
}

interface DiskInfo {
  drive: string;
  total: number;
  used: number;
  free: number;
  usedPercent: number;
  total_formatted: string;
  used_formatted: string;
  free_formatted: string;
}

interface GpuInfo {
  model: string;
  vramTotalMB: number;
  vramUsedMB: number;
  vramFreeMB: number;
  temperature: number;
  utilizationGPU: number;
  index: number;
  uuid: string;
}

interface StatusData {
  ok: boolean;
  hostname: string;
  platform: string;
  arch: string;
  uptime: number;
  cpu: CpuInfo;
  memory: MemInfo;
  disk: DiskInfo[];
  gpu: GpuInfo[];
  gpu_available: boolean;
}

function formatUptime(s: number): string {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '0m';
}

function GaugeBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-app)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : color,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '16px 20px', flex: '1 1 0', minWidth: 120,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}

const SECT_STYLE: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border)',
  borderRadius: 8, padding: 20,
};

const SECT_TITLE_STYLE: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16,
  display: 'flex', alignItems: 'center', gap: 8,
};

export default function SystemStatus() {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setData(d);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  return (
    <PageShell title="System Status" subtitle="Real-time CPU / GPU / RAM / Disk monitoring" maturity="preview">
      {loading && (
        <div style={SECT_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Loading system status...
          </div>
        </div>
      )}

      {error && !loading && (
        <div style={{ ...SECT_STYLE, borderColor: 'var(--danger)', background: 'var(--danger-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 13 }}>Error</span>
            <span style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</span>
            <button onClick={fetchData} style={{
              marginLeft: 'auto', padding: '4px 12px', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
            }}>Retry</button>
          </div>
        </div>
      )}

      {data && !error && (
        <>
          {/* Overview */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <MetricCard label="Hostname" value={data.hostname} />
            <MetricCard label="Platform" value={`${data.platform} (${data.arch})`} />
            <MetricCard label="Uptime" value={formatUptime(data.uptime)} />
            <MetricCard label="CPU" value={`${data.cpu.cores} cores`} />
            <MetricCard label="GPU Available" value={data.gpu_available ? String(data.gpu.length) : 'None'} color={data.gpu_available ? 'var(--success)' : 'var(--text-muted)'} />
          </div>

          {/* CPU */}
          <div style={SECT_STYLE}>
            <div style={SECT_TITLE_STYLE}>
              <span style={{ color: 'var(--info)' }}>&#9632;</span> CPU — {data.cpu.model}
            </div>
            <GaugeBar label="CPU Usage" value={data.cpu.usage_percent} max={100} color="var(--info)" />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Load: {data.cpu.load.map(l => l.toFixed(2)).join(' / ')}
            </div>
          </div>

          {/* Memory */}
          <div style={{ ...SECT_STYLE, marginTop: 16 }}>
            <div style={SECT_TITLE_STYLE}>
              <span style={{ color: 'var(--warning)' }}>&#9632;</span> Memory
            </div>
            <GaugeBar label="RAM Usage" value={data.memory.used_percent} max={100} color="var(--warning)" />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <MetricCard label="Total" value={data.memory.total_formatted} />
              <MetricCard label="Used" value={data.memory.used_formatted} color="var(--warning)" />
              <MetricCard label="Free" value={data.memory.free_formatted} color="var(--success)" />
            </div>
          </div>

          {/* Disk */}
          {data.disk.length > 0 && (
            <div style={{ ...SECT_STYLE, marginTop: 16 }}>
              <div style={SECT_TITLE_STYLE}>
                <span style={{ color: 'var(--secondary)' }}>&#9632;</span> Disks
              </div>
              {data.disk.map((d, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <GaugeBar label={`${d.drive} (${d.total_formatted})`} value={d.usedPercent} max={100} color="var(--secondary)" />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <MetricCard label="Used" value={d.used_formatted} />
                    <MetricCard label="Free" value={d.free_formatted} color="var(--success)" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GPU */}
          <div style={{ ...SECT_STYLE, marginTop: 16 }}>
            <div style={SECT_TITLE_STYLE}>
              <span style={{ color: 'var(--primary)' }}>&#9632;</span> GPU
            </div>
            {data.gpu.length > 0 ? (
              data.gpu.map((g, i) => (
                <div key={i} style={{ marginBottom: 16, padding: 12, background: 'var(--bg-app)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                    GPU {g.index}: {g.model}
                  </div>
                  <GaugeBar label="VRAM Usage" value={g.vramTotalMB > 0 ? Math.round((g.vramUsedMB / g.vramTotalMB) * 100) : 0} max={100} color="var(--primary)" />
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                    <MetricCard label="VRAM Total" value={`${g.vramTotalMB.toFixed(0)} MB`} />
                    <MetricCard label="VRAM Used" value={`${g.vramUsedMB.toFixed(0)} MB`} color="var(--warning)" />
                    <MetricCard label="VRAM Free" value={`${g.vramFreeMB.toFixed(0)} MB`} color="var(--success)" />
                    <MetricCard label="Temp" value={`${g.temperature}\u00b0C`} color={g.temperature > 80 ? 'var(--danger)' : 'var(--text-primary)'} />
                    <MetricCard label="Utilization" value={`${g.utilizationGPU}%`} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>
                No NVIDIA GPU detected. Install nvidia-smi or connect a GPU to see stats.
              </div>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
