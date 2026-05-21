import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';

export interface TokenInputProps {
  onVerifiedChange?: (verified: boolean) => void;
  compact?: boolean;
}

export default function TokenInput({ onVerifiedChange, compact = false }: TokenInputProps) {
  const { status, verifyToken, clearToken, abortVerify } = useAuth();
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const mountedRef = useRef(true);
  const verifyHardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortVerify();
      if (verifyHardTimeoutRef.current) {
        clearTimeout(verifyHardTimeoutRef.current);
        verifyHardTimeoutRef.current = null;
      }
    };
  }, [abortVerify]);

  const handleVerify = async () => {
    if (!token.trim()) return;
    setVerifying(true);

    verifyHardTimeoutRef.current = setTimeout(() => {
      abortVerify();
      if (verifyHardTimeoutRef.current) {
        clearTimeout(verifyHardTimeoutRef.current);
        verifyHardTimeoutRef.current = null;
      }
      if (mountedRef.current) setVerifying(false);
    }, 9000);

    try {
      const ok = await verifyToken(token.trim());
      if (!mountedRef.current) return;
      if (ok) {
        setToken('');
        onVerifiedChange?.(true);
      } else {
        onVerifiedChange?.(false);
      }
    } finally {
      if (verifyHardTimeoutRef.current) {
        clearTimeout(verifyHardTimeoutRef.current);
        verifyHardTimeoutRef.current = null;
      }
      if (mountedRef.current) setVerifying(false);
    }
  };

  const handleClear = () => {
    if (verifyHardTimeoutRef.current) {
      clearTimeout(verifyHardTimeoutRef.current);
      verifyHardTimeoutRef.current = null;
    }
    setToken('');
    clearToken();
    setVerifying(false);
    onVerifiedChange?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify();
  };

  const state = status.state;

  const stateIcon = () => {
    switch (state) {
      case 'authorized': return '✅';
      case 'invalid': return '❌';
      case 'validating': return '⏳';
      case 'timeout': return '⏰';
      case 'network_error': return '🌐';
      case 'openclaw_unreachable': return '⚠️';
      default: return '🔒';
    }
  };

  const stateText = () => {
    switch (state) {
      case 'unauthenticated':
      case 'unknown':
        return '当前未授权，请输入 Token 进行当前会话验证。';
      case 'validating':
        return '正在验证 Token…';
      case 'authorized':
        return '授权有效。执行总闸仍保持关闭。';
      case 'invalid':
      case 'expired':
        return 'Token 无效或已过期，请重新输入。';
      case 'timeout':
        return '验证超时，请检查 AIP API / OpenClaw 状态后重试。';
      case 'network_error':
        return '无法连接认证服务，请检查网络连接后重试。';
      case 'openclaw_unreachable':
        return '授权有效，但 OpenClaw 未连接。需确认 OpenClaw 服务状态。';
    }
  };

  const stateColor = () => {
    switch (state) {
      case 'authorized': return 'var(--success)';
      case 'invalid':
      case 'expired':
      case 'timeout':
      case 'network_error': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  if (compact && state === 'authorized') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>✅ 已授权</span>
        <button className="ui-btn ui-btn-ghost ui-btn-xs" onClick={handleClear} style={{ fontSize: 11 }}>
          清除
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        OpenClaw Heartbeat Token
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="password"
          autoComplete="off"
          value={token}
          onChange={e => setToken(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入 Token"
          maxLength={4096}
          disabled={verifying || state === 'authorized'}
          style={{ flex: '1 1 200px', minWidth: 160 }}
          className="ui-input"
        />
        <button
          className="ui-btn ui-btn-primary ui-btn-sm"
          onClick={handleVerify}
          disabled={verifying || !token.trim() || state === 'authorized'}
        >
          {verifying ? '验证中...' : '验证连接'}
        </button>
        <button
          className="ui-btn ui-btn-outline ui-btn-sm"
          onClick={handleClear}
          disabled={verifying}
        >
          清除
        </button>
      </div>
      {state !== 'unknown' && (
        <div style={{ marginTop: 8, fontSize: 12, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span>{stateIcon()}</span>
          <span style={{ color: stateColor() }}>
            {stateText()}
          </span>
        </div>
      )}
      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
        Token 只用于当前会话验证，不会自动打开执行总闸。
      </div>
    </div>
  );
}
