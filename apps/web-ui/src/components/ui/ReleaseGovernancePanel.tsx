// v5.3.0 — Release Governance Panel (发布治理面板)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ReleaseSummary {
  id: string;
  release_name: string;
  release_version: string;
  status: string;
  sealed_at?: string;
  created_at?: string;
  package_present?: number;
  backup_verified?: number;
  gate_summary?: { passed: number; total: number; blocked?: number };
  health_status?: string;
  ready_for_promotion?: boolean;
}

interface RollbackReadiness {
  status: 'ready' | 'caution' | 'blocked' | 'unknown';
  checks: Array<{ name: string; passed: boolean; detail: string }>;
}

interface Props {
  timeRange?: string;
  versionPrefix?: string;
}

const STATUS_COLORS: Record<string, string> = {
  sealed: '#8B5CF6',
  candidate: '#F59E0B',
  draft: '#6B7280',
  archived: '#9CA3AF',
};

function fmtTime(iso: string): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('zh-CN'); } catch { return iso; }
}

export default function ReleaseGovernancePanel({ timeRange, versionPrefix }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (timeRange) params.set('time_range', timeRange);
    if (versionPrefix) params.set('version_prefix', versionPrefix);
    
    fetch(`/api/release/governance?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [timeRange, versionPrefix]);

  if (loading) return <div style={{ padding: 20, color: 'var(--text-muted)' }}>加载发布治理...</div>;

  const { stable_release, candidate_release, recent_releases, recent_recoveries, rollback_readiness } = data || {};

  const rollbackStatusColor = 
    rollback_readiness?.status === 'ready' ? '#10B981' :
    rollback_readiness?.status === 'caution' ? '#F59E0B' :
    rollback_readiness?.status === 'blocked' ? '#EF4444' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Stable vs Candidate */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Stable Release */}
        <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6' }}>🔒 当前稳定版</span>
            {stable_release && (
              <Link to={`/artifacts/${stable_release.artifact_id}`} style={{ fontSize: 10, color: 'var(--primary)', textDecoration: 'none' }}>
                查看
              </Link>
            )}
          </div>
          {stable_release ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{stable_release.release_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{stable_release.release_version}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, padding: '1px 4px', background: (stable_release.backup_verified ? '#10B981' : '#EF4444') + '18', color: stable_release.backup_verified ? '#10B981' : '#EF4444', borderRadius: 3 }}>
                  {stable_release.backup_verified ? '备份已验证' : '备份未验证'}
                </span>
                <span style={{ fontSize: 10, padding: '1px 4px', background: (stable_release.package_present ? '#10B981' : '#EF4444') + '18', color: stable_release.package_present ? '#10B981' : '#EF4444', borderRadius: 3 }}>
                  {stable_release.package_present ? '封板产物存在' : '封板产物缺失'}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Gate: {stable_release.gate_summary?.passed || 0}/{stable_release.gate_summary?.total || 0} 通过
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>暂无稳定版</div>
          )}
        </div>

        {/* Candidate Release */}
        <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>🔶 当前候选版</span>
            {candidate_release && (
              <button onClick={() => setShowCompare(true)} style={{ fontSize: 10, padding: '2px 6px', border: '1px solid var(--primary)', borderRadius: 4, background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
                对比
              </button>
            )}
          </div>
          {candidate_release ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{candidate_release.release_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{candidate_release.release_version}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, padding: '1px 4px', background: (candidate_release.ready_for_promotion ? '#10B981' : '#F59E0B') + '18', color: candidate_release.ready_for_promotion ? '#10B981' : '#F59E0B', borderRadius: 3 }}>
                  {candidate_release.ready_for_promotion ? '可晋升' : '存在阻塞'}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Gate: {candidate_release.gate_summary?.passed || 0}/{candidate_release.gate_summary?.total || 0} 通过
                {candidate_release.gate_summary?.blocked ? ` (${candidate_release.gate_summary.blocked} 阻塞)` : ''}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>暂无候选版</div>
          )}
        </div>
      </div>

      {/* Rollback Readiness */}
      <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>↩️ 回滚就绪状态</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: rollbackStatusColor }}>
            {rollback_readiness?.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        {rollback_readiness?.checks?.map((c: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: c.passed ? '#10B981' : '#EF4444' }}>{c.passed ? '✓' : '✗'} {c.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{c.detail}</span>
          </div>
        ))}
      </div>

      {/* Recent Releases */}
      <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>📦 最近发布</div>
        {recent_releases?.slice(0, 5).map((r: any) => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0' }}>
            <span style={{ color: STATUS_COLORS[r.status] || 'var(--text-secondary)' }}>{r.release_name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{r.status}</span>
          </div>
        ))}
      </div>

      {/* Recent Recoveries */}
      <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🔧 最近恢复演练</div>
        {recent_recoveries?.slice(0, 5).map((r: any) => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0' }}>
            <span>{r.recovery_type}</span>
            <span style={{ color: r.status === 'success' ? '#10B981' : '#EF4444' }}>{r.status}</span>
          </div>
        ))}
        <Link to="/audit?category=system" style={{ fontSize: 10, color: 'var(--primary)', textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 6 }}>
          → 查看全部恢复记录
        </Link>
      </div>
    </div>
  );
}
