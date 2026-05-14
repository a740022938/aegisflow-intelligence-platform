import React, { useState, useEffect } from 'react';
import '../components/ui/shared.css';

// ---- Types ----
interface StatusData {
  ok: boolean; configured?: boolean; root?: string;
  exportsExists?: boolean; bootstrapExists?: boolean;
  statsExists?: boolean; manifestExists?: boolean;
  mode?: string; error?: string;
}

interface StatsData {
  ok: boolean; data?: {
    database_memory_count?: number; published_count?: number;
    archived_count?: number; level_counts?: Record<string, number>;
    status_counts?: Record<string, number>;
  }; error?: string;
}

interface ManifestData {
  ok: boolean; data?: {
    total_files?: number; generated_at?: string;
    files?: Array<{ file_path?: string; sha256?: string; file_size?: number }>;
  }; error?: string;
}

interface ProfilesData {
  ok: boolean; profiles?: Array<{ name: string; file: string }>; error?: string;
}

interface ProfileData {
  ok: boolean; name?: string; content?: string; error?: string;
}

interface BootstrapData {
  ok: boolean; content?: string; updatedAt?: string; error?: string;
}

type LoadState = 'idle' | 'loading' | 'success' | 'error';

// ---- Helpers ----
async function apiGet<T>(path: string): Promise<T> {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch (err: any) {
    return { ok: false, error: err.message } as T;
  }
}

function card(title: string, children: React.ReactNode) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );
}

function statusDot(ok: boolean | undefined) {
  return (
    <span style={{
      display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
      background: ok ? 'var(--success)' : 'var(--error)', marginRight: 8,
    }} />
  );
}

function copyBtn(text: string) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); }}
      style={{
        padding: '4px 12px', fontSize: 12, background: 'var(--bg-input)',
        border: '1px solid var(--border-color)', borderRadius: 4, cursor: 'pointer',
        color: 'var(--text-primary)',
      }}
    >
      复制
    </button>
  );
}

// ---- Main Component ----
function MemoryHubReadonly() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [statusState, setStatusState] = useState<LoadState>('idle');

  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsState, setStatsState] = useState<LoadState>('idle');

  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [manifestState, setManifestState] = useState<LoadState>('idle');

  const [profiles, setProfiles] = useState<ProfilesData | null>(null);
  const [profilesState, setProfilesState] = useState<LoadState>('idle');

  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [bootstrapState, setBootstrapState] = useState<LoadState>('idle');

  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [profileState, setProfileState] = useState<LoadState>('idle');

  // Candidate safety UX state
  const [candFile, setCandFile] = useState('');
  const [candDetail, setCandDetail] = useState<any>(null);
  const [dryRunResult, setDryRunResult] = useState<any>(null);
  const [confirmText, setConfirmText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const hasCandidateId = candFile.trim().length > 0;
  const hasLoadedCandidate = Boolean(candDetail);
  const dryRunOk = Boolean(dryRunResult?.ok && dryRunResult?.dryRun === true);
  const approveConfirmOk = confirmText === 'APPROVE_MEMORY_CANDIDATE';
  const rejectConfirmOk = confirmText === 'REJECT_MEMORY_CANDIDATE';
  const archiveConfirmOk = confirmText === 'ARCHIVE_MEMORY_CANDIDATE';

  const canApprove = hasCandidateId && hasLoadedCandidate && dryRunOk && approveConfirmOk && !actionLoading;
  const canReject = hasCandidateId && hasLoadedCandidate && dryRunOk && rejectConfirmOk && !actionLoading;
  const canArchive = hasCandidateId && hasLoadedCandidate && dryRunOk && archiveConfirmOk && !actionLoading;

  useEffect(() => {
    setStatusState('loading');
    apiGet<StatusData>('/api/memory-hub/status').then(d => { setStatus(d); setStatusState('success'); });
    setStatsState('loading');
    apiGet<StatsData>('/api/memory-hub/stats').then(d => { setStats(d); setStatsState('success'); });
    setManifestState('loading');
    apiGet<ManifestData>('/api/memory-hub/manifest').then(d => { setManifest(d); setManifestState('success'); });
    setProfilesState('loading');
    apiGet<ProfilesData>('/api/memory-hub/profiles').then(d => { setProfiles(d); setProfilesState('success'); });
    setBootstrapState('loading');
    apiGet<BootstrapData>('/api/memory-hub/bootstrap').then(d => { setBootstrap(d); setBootstrapState('success'); });
  }, []);

  const loadProfile = (name: string) => {
    setProfileState('loading');
    apiGet<ProfileData>(`/api/memory-hub/profile/${name}`).then(d => {
      setSelectedProfile(d);
      setProfileState('success');
    });
  };

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Memory Hub</h1>
        <span style={{
          padding: '2px 8px', fontSize: 11, borderRadius: 4,
          background: 'var(--warning)', color: '#000', fontWeight: 600,
        }}>只读</span>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--warning)', borderRadius: 8,
        padding: '10px 16px', marginBottom: 16, fontSize: 13, color: 'var(--warning)',
      }}>
        <strong>安全提示：</strong> 当前页面只读。AIP 不写 Memory Hub 数据库，不提交 candidate，不审批记忆。
      </div>

      {/* Status */}
      {card('状态', (
        statusState === 'loading' ? <span>加载中...</span> :
        statusState === 'error' || !status?.ok ? <span style={{ color: 'var(--error)' }}>加载失败</span> :
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <div>{statusDot(status.configured)} 已配置: {String(status.configured)}</div>
          <div>{statusDot(status.exportsExists)} exports: {String(status.exportsExists)}</div>
          <div>{statusDot(status.bootstrapExists)} bootstrap: {String(status.bootstrapExists)}</div>
          <div>{statusDot(status.statsExists)} stats: {String(status.statsExists)}</div>
          <div>{statusDot(status.manifestExists)} manifest: {String(status.manifestExists)}</div>
          <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            根目录: {status.root}<br />
            模式: {status.mode}
          </div>
        </div>
      ))}

      {/* Stats */}
      {card('记忆统计', (
        statsState === 'loading' ? <span>加载中...</span> :
        !stats?.ok ? <span style={{ color: 'var(--error)' }}>加载失败</span> :
        stats.data ? (
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div>数据库记忆数: <strong>{stats.data.database_memory_count}</strong></div>
            <div>已发布: <strong>{stats.data.published_count}</strong></div>
            <div>已归档: <strong>{stats.data.archived_count}</strong></div>
            {stats.data.level_counts && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>按级别:</div>
                {Object.entries(stats.data.level_counts).map(([k, v]) => (
                  <div key={k} style={{ marginLeft: 12 }}>{k}: {v}</div>
                ))}
              </div>
            )}
            {stats.data.status_counts && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>按状态:</div>
                {Object.entries(stats.data.status_counts).map(([k, v]) => (
                  <div key={k} style={{ marginLeft: 12 }}>{k}: {v}</div>
                ))}
              </div>
            )}
          </div>
        ) : <span>无数据</span>
      ))}

      {/* Bootstrap Preview */}
      {card('Bootstrap 预览', (
        bootstrapState === 'loading' ? <span>加载中...</span> :
        !bootstrap?.ok ? <span style={{ color: 'var(--error)' }}>加载失败</span> :
        bootstrap.content ? (
          <div>
            <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              更新时间: {bootstrap.updatedAt || '未知'}
              <span style={{ marginLeft: 12 }}>{copyBtn(bootstrap.content)}</span>
            </div>
            <pre style={{
              maxHeight: 400, overflow: 'auto', fontSize: 12, lineHeight: 1.5,
              background: 'var(--bg-input)', padding: 12, borderRadius: 6,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {bootstrap.content.slice(0, 3000)}
              {bootstrap.content.length > 3000 && '\n\n... (内容已截断，请复制查看完整内容)'}
            </pre>
          </div>
        ) : <span>无内容</span>
      ))}

      {/* Profiles */}
      {card('助手 Profiles', (
        profilesState === 'loading' ? <span>加载中...</span> :
        !profiles?.ok ? <span style={{ color: 'var(--error)' }}>加载失败</span> :
        profiles.profiles && profiles.profiles.length > 0 ? (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {profiles.profiles.map(p => (
                <button
                  key={p.name}
                  onClick={() => loadProfile(p.name)}
                  style={{
                    padding: '6px 14px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                    background: selectedProfile?.name === p.name ? 'var(--accent)' : 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: selectedProfile?.name === p.name ? '#fff' : 'var(--text-primary)',
                    fontWeight: selectedProfile?.name === p.name ? 600 : 400,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {profileState === 'loading' && <span>加载中...</span>}
            {selectedProfile?.content && (
              <pre style={{
                maxHeight: 300, overflow: 'auto', fontSize: 11, lineHeight: 1.4,
                background: 'var(--bg-input)', padding: 12, borderRadius: 6,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {selectedProfile.content}
              </pre>
            )}
          </div>
        ) : <span>无 profile</span>
      ))}

      {/* Manifest Summary */}
      {card('导出清单摘要', (
        manifestState === 'loading' ? <span>加载中...</span> :
        !manifest?.ok ? <span style={{ color: 'var(--error)' }}>加载失败</span> :
        manifest.data ? (
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div>导出文件总数: <strong>{manifest.data.total_files}</strong></div>
            <div>生成时间: {manifest.data.generated_at || '未知'}</div>
            <div style={{ marginTop: 8 }}>
              SHA256 校验: <strong style={{ color: 'var(--success)' }}>已启用</strong>
            </div>
            {manifest.data.files && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  查看文件清单 ({manifest.data.files.length} 个文件)
                </summary>
                <div style={{ marginTop: 8, maxHeight: 300, overflow: 'auto' }}>
                  {manifest.data.files.map((f, i) => (
                    <div key={i} style={{
                      padding: '4px 8px', fontSize: 11, borderBottom: '1px solid var(--border-color)',
                      fontFamily: 'monospace',
                    }}>
                      {f.file_path}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : <span>无数据</span>
      ))}

      {/* ── Candidate Inbox (v0.6-rc1 readonly preview) ── */}
      <h2 style={{ margin: '24px 0 12px 0', fontSize: 18, fontWeight: 600 }}>候选收件箱 <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--warning)' }}>只读预览</span></h2>

      {card('候选概览', (
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <div>待审批: <strong id="cand-pending">-</strong></div>
          <div>测试候选: <strong id="cand-test">-</strong></div>
          <div>总计: <strong id="cand-total">-</strong></div>
          <div id="cand-dirs" style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>-</div>
          <div style={{ marginTop: 12, padding: 8, background: 'var(--bg-input)', borderRadius: 4, fontSize: 12, color: 'var(--warning)' }}>
            ⚠️ v0.6-rc2 支持单条审批（需输入确认词）。不支持批量审批。不自动同步 LAN_SHARE。
          </div>
        </div>
      ))}

      {card('候选列表', (
        <div>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }} id="cand-list-info">加载中...</div>
          <div id="cand-list" style={{ maxHeight: 400, overflow: 'auto', fontSize: 12 }}></div>
        </div>
      ))}

      {card('候选详情 / 校验 / Dry-Run / 真实动作', (
        <div style={{ fontSize: 13 }}>
          <div style={{ marginBottom: 8 }}>
            <input id="cand-detail-id" value={candFile} onChange={e => setCandFile(e.target.value)} placeholder="输入候选文件名 (如 candidate_xxx.json)" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <button disabled={!hasCandidateId} onClick={async () => {
              const id = candFile.trim();
              if (!id) return;
              setActionLoading(true);
              const el = document.getElementById('cand-detail-result');
              if (!el) return; el.textContent = '加载中...';
              try {
                const [detail, valid, approveDR, rejectDR, archiveDR] = await Promise.all([
                  fetch(`/api/memory-hub/candidates/${id}`).then(r => r.json()),
                  fetch(`/api/memory-hub/candidates/${id}/validate`).then(r => r.json()),
                  fetch(`/api/memory-hub/candidates/${id}/approve-dry-run`, { method: 'POST' }).then(r => r.json()),
                  fetch(`/api/memory-hub/candidates/${id}/reject-dry-run`, { method: 'POST' }).then(r => r.json()),
                  fetch(`/api/memory-hub/candidates/${id}/archive-dry-run`, { method: 'POST' }).then(r => r.json()),
                ]);
                setCandDetail(detail);
                setDryRunResult(approveDR);
                el.textContent = JSON.stringify({ detail, valid, 'approve-dry-run': approveDR, 'reject-dry-run': rejectDR, 'archive-dry-run': archiveDR }, null, 2);
              } catch (err: any) { el.textContent = `Error: ${err.message}`; }
              setActionLoading(false);
            }} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 4, cursor: hasCandidateId ? 'pointer' : 'not-allowed', background: hasCandidateId ? 'var(--accent)' : 'var(--bg-input)', color: hasCandidateId ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border-color)', opacity: hasCandidateId ? 1 : 0.5 }}>
              加载 Dry-Run
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: '30px' }}>Dry-Run 不会修改任何文件</span>
          </div>

          {/* Safety Status Block */}
          <div style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-color)', marginBottom: 12, fontSize: 12, lineHeight: 1.8 }}>
            <strong>安全状态：</strong><br />
            候选文件：{hasCandidateId ? <span style={{ color: 'var(--success)' }}>已输入</span> : <span style={{ color: 'var(--error)' }}>未输入</span>}<br />
            候选详情：{hasLoadedCandidate ? <span style={{ color: 'var(--success)' }}>已加载</span> : <span style={{ color: 'var(--error)' }}>未加载</span>}<br />
            Dry-Run：{dryRunOk ? <span style={{ color: 'var(--success)' }}>已通过</span> : <span style={{ color: 'var(--error)' }}>未执行</span>}<br />
            确认词 App：{approveConfirmOk ? <span style={{ color: 'var(--success)' }}>匹配</span> : confirmText ? <span style={{ color: 'var(--error)' }}>不匹配</span> : <span style={{ color: 'var(--error)' }}>未输入</span>}<br />
            真实动作：{canApprove || canReject || canArchive ? <strong style={{ color: 'var(--success)' }}>可执行</strong> : <span style={{ color: 'var(--error)' }}>锁定</span>}
          </div>

          <div style={{ marginBottom: 8 }}>
            <input id="cand-confirm-text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="输入确认词 (如 APPROVE_MEMORY_CANDIDATE)" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button disabled={!canApprove} onClick={async () => {
              if (!canApprove) return;
              setActionLoading(true);
              const el = document.getElementById('cand-detail-result');
              if (!el) return; el.textContent = '执行中...';
              try {
                const r = await fetch(`/api/memory-hub/candidates/${candFile.trim()}/approve`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ confirm: true, confirmText, humanNote: '' }),
                });
                el.textContent = JSON.stringify(await r.json(), null, 2);
              } catch (err: any) { el.textContent = `Error: ${err.message}`; }
              setActionLoading(false);
            }} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 4, cursor: canApprove ? 'pointer' : 'not-allowed', background: canApprove ? '#2e7d32' : 'var(--bg-input)', color: canApprove ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border-color)', opacity: canApprove ? 1 : 0.5 }}>
              批准 (Approve)
            </button>
            <button disabled={!canReject} onClick={async () => {
              if (!canReject) return;
              setActionLoading(true);
              const el = document.getElementById('cand-detail-result');
              if (!el) return; el.textContent = '执行中...';
              try {
                const r = await fetch(`/api/memory-hub/candidates/${candFile.trim()}/reject`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ confirm: true, confirmText, humanNote: '', reason: '' }),
                });
                el.textContent = JSON.stringify(await r.json(), null, 2);
              } catch (err: any) { el.textContent = `Error: ${err.message}`; }
              setActionLoading(false);
            }} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 4, cursor: canReject ? 'pointer' : 'not-allowed', background: canReject ? '#c62828' : 'var(--bg-input)', color: canReject ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border-color)', opacity: canReject ? 1 : 0.5 }}>
              驳回 (Reject)
            </button>
            <button disabled={!canArchive} onClick={async () => {
              if (!canArchive) return;
              setActionLoading(true);
              const el = document.getElementById('cand-detail-result');
              if (!el) return; el.textContent = '执行中...';
              try {
                const r = await fetch(`/api/memory-hub/candidates/${candFile.trim()}/archive`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ confirm: true, confirmText, humanNote: '' }),
                });
                el.textContent = JSON.stringify(await r.json(), null, 2);
              } catch (err: any) { el.textContent = `Error: ${err.message}`; }
              setActionLoading(false);
            }} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 4, cursor: canArchive ? 'pointer' : 'not-allowed', background: canArchive ? '#6a1b9a' : 'var(--bg-input)', color: canArchive ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border-color)', opacity: canArchive ? 1 : 0.5 }}>
              归档 (Archive)
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: '30px' }}>
              真实动作会修改 candidate 状态。已锁定：请先输入候选文件名、加载详情、执行 dry-run，并输入正确确认词。
            </span>
          </div>
          <pre id="cand-detail-result" style={{ marginTop: 8, maxHeight: 500, overflow: 'auto', fontSize: 11, background: 'var(--bg-input)', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}></pre>
        </div>
      ))}
    </div>
  );
}

// Load candidate overview and list on mount
setTimeout(() => {
  fetch('/api/memory-hub/candidates/status').then(r => r.json()).then(d => {
    if (d.ok) {
      const pending = document.getElementById('cand-pending');
      const test = document.getElementById('cand-test');
      const total = document.getElementById('cand-total');
      const dirs = document.getElementById('cand-dirs');
      if (pending) pending.textContent = String(d.pendingCount);
      if (test) test.textContent = String(d.testOnlyCount);
      if (total) total.textContent = String(d.totalCandidateCount);
      if (dirs) dirs.textContent = d.dirs.map((x: any) => `${x.name}: ${x.count}`).join(' | ');
    }
  });
  fetch('/api/memory-hub/candidates').then(r => r.json()).then(d => {
    const info = document.getElementById('cand-list-info');
    const list = document.getElementById('cand-list');
    if (info) info.textContent = `共 ${d.total} 个 pending_review 候选`;
    if (list && d.items) {
      list.innerHTML = d.items.map((f: any) =>
        `<div style="padding: 6px 8px; border-bottom: 1px solid var(--border-color); cursor: pointer;"
              onclick="document.getElementById('cand-detail-id').value='${f.fileName}';">
           <strong>${f.title || '?'}</strong>
           <span style="float:right;font-size:11px;color:var(--text-secondary)">${f.project || ''} | ${f.level || ''} | ${f.confidence || ''}</span>
         </div>`
      ).join('');
    }
  });
}, 100);

export default MemoryHubReadonly;
