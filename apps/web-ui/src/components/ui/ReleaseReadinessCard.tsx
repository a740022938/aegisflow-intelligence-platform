// v4.6.0 — Release Readiness Card: shows seal / backup / report / approval status
import React from 'react';

export interface ReleaseReadinessData {
  seal_status?: 'sealed' | 'unsealed' | 'pending' | 'none';
  backup_present?: boolean;
  report_present?: boolean;
  approval_required?: boolean;
  approval_status?: 'approved' | 'pending' | 'rejected' | 'none' | 'not_required';
  last_backup_at?: string;
  last_report_at?: string;
}

interface Props {
  data: ReleaseReadinessData;
  compact?: boolean;
}

const SEAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  sealed: { label: '已封板', color: '#10B981', bg: '#10B98118', icon: '🔒' },
  unsealed: { label: '未封板', color: '#F59E0B', bg: '#F59E0B18', icon: '🔓' },
  pending: { label: '待封板', color: '#6366F1', bg: '#6366F118', icon: '⏳' },
  none: { label: '无封板', color: '#9CA3AF', bg: '#9CA3AF18', icon: '—' },
};

const APPROVAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  approved: { label: '已审批', color: '#10B981', bg: '#10B98118', icon: '✅' },
  pending: { label: '待审批', color: '#F59E0B', bg: '#F59E0B18', icon: '⏳' },
  rejected: { label: '已拒绝', color: '#EF4444', bg: '#EF444418', icon: '❌' },
  not_required: { label: '无需审批', color: '#9CA3AF', bg: '#9CA3AF18', icon: '—' },
  none: { label: '未知', color: '#9CA3AF', bg: '#9CA3AF18', icon: '—' },
};

function Pill({ label, color, bg, icon }: { label: string; color: string; bg: string; icon: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 500,
      background: bg,
      color: color,
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function CheckRow({ label, present }: { label: string; present?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: present ? '#10B981' : '#9CA3AF',
      }}>
        {present ? '✅ 已就绪' : '—'}
      </span>
    </div>
  );
}

export default function ReleaseReadinessCard({ data, compact = false }: Props) {
  const seal = SEAL_CONFIG[data.seal_status || 'none'] || SEAL_CONFIG.none;
  const approval = APPROVAL_CONFIG[data.approval_status || data.approval_required ? 'pending' : 'not_required'] || APPROVAL_CONFIG.none;

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Pill label={seal.label} color={seal.color} bg={seal.bg} icon={seal.icon} />
        <Pill label={approval.label} color={approval.color} bg={approval.bg} icon={approval.icon} />
        {data.backup_present && <Pill label="已备份" color="#14B8A6" bg="#14B8A618" icon="💾" />}
        {data.report_present && <Pill label="报告" color="#6366F1" bg="#6366F118" icon="📄" />}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Pill label={seal.label} color={seal.color} bg={seal.bg} icon={seal.icon} />
        <Pill label={approval.label} color={approval.color} bg={approval.bg} icon={approval.icon} />
        {data.backup_present && <Pill label="已备份" color="#14B8A6" bg="#14B8A618" icon="💾" />}
        {data.report_present && <Pill label="报告" color="#6366F1" bg="#6366F118" icon="📄" />}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6 }}>
        <CheckRow label="备份存在" present={data.backup_present} />
        <CheckRow label="报告存在" present={data.report_present} />
        {data.last_backup_at && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingTop: 2 }}>
            上次备份: {new Date(data.last_backup_at).toLocaleString('zh-CN')}
          </div>
        )}
        {data.last_report_at && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingTop: 2 }}>
            上次报告: {new Date(data.last_report_at).toLocaleString('zh-CN')}
          </div>
        )}
      </div>
    </div>
  );
}
