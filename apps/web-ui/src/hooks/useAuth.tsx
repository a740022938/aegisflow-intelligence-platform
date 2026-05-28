import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { setJwt, clearJwt } from '../services/authStore';

export type AuthState = 'unknown' | 'unauthenticated' | 'validating' | 'authorized' | 'invalid' | 'expired' | 'timeout' | 'network_error';

/** @deprecated OpenClaw integration was deprecated in v8.0 */
export interface OpenClawStatus {
  tokenConfigured: boolean;
  online: boolean | null;
  masterSwitchEnabled: boolean;
  lastHeartbeatAt: string | null;
}

export interface JwtStatus {
  authenticated: boolean;
  username: string | null;
  role: string | null;
}

export interface AuthStatus {
  state: AuthState;
  jwt: JwtStatus;
  openclaw: OpenClawStatus;
  lastVerified: number | null;
  verifiedToken: boolean;
}

export interface AuthContextValue {
  status: AuthStatus;
  verifyToken: (token: string) => Promise<boolean>;
  clearToken: () => void;
  abortVerify: () => void;
  refreshStatus: () => Promise<void>;
}

const defaultStatus: AuthStatus = {
  state: 'unknown',
  jwt: { authenticated: false, username: null, role: null },
  openclaw: { tokenConfigured: false, online: null, masterSwitchEnabled: false, lastHeartbeatAt: null },
  lastVerified: null,
  verifiedToken: false,
};

const AuthContext = createContext<AuthContextValue>({
  status: defaultStatus,
  verifyToken: async () => false,
  clearToken: () => {},
  abortVerify: () => {},
  refreshStatus: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(defaultStatus);
  const prevJwtRef = useRef<JwtStatus>(defaultStatus.jwt);

  const refreshStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/status');
      const d = await r.json().catch(() => null);
      if (d?._unauthorized) {
        clearJwt();
        setStatus(prev => ({ ...prev, state: 'unauthenticated', jwt: { ...prev.jwt, authenticated: false }, verifiedToken: false }));
        return;
      }
      if (!d?.ok) return;
      const nextJwt = d.jwt || prevJwtRef.current;
      prevJwtRef.current = nextJwt;
      setStatus(prev => ({
        ...prev,
        jwt: nextJwt,
        openclaw: prev.openclaw,
        lastVerified: Date.now(),
        ...(nextJwt.authenticated ? { state: 'authorized' as const, verifiedToken: true } : {}),
      }));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refreshStatus();
    const t = setInterval(refreshStatus, 300000);
    const onJwtExpired = () => {
      prevJwtRef.current = { authenticated: false, username: null, role: null };
      setStatus(prev => ({ ...prev, state: 'unauthenticated', verifiedToken: false, jwt: { authenticated: false, username: null, role: null } }));
    };
    window.addEventListener('auth:jwt-expired', onJwtExpired);
    return () => {
      clearInterval(t);
      window.removeEventListener('auth:jwt-expired', onJwtExpired);
    };
  }, [refreshStatus]);

  const verifyTokenAbortRef = React.useRef<AbortController | null>(null);

  const verifyToken = useCallback(async (token: string): Promise<boolean> => {
    verifyTokenAbortRef.current?.abort();
    const controller = new AbortController();
    verifyTokenAbortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);

    setStatus(prev => ({ ...prev, state: 'validating' }));
    try {
      const r = await fetch('/api/openclaw/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartbeat_token: token }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const d = await r.json().catch(() => null);
      if (d?.ok && d?.valid) {
        if (d.access_token) setJwt(d.access_token);
        await refreshStatus();
        setStatus(prev => ({ ...prev, state: 'authorized', verifiedToken: true, jwt: { ...prev.jwt, authenticated: true } }));
        return true;
      }
      setStatus(prev => ({
        ...prev,
        state: d?.error?.includes('未配置') ? 'unauthenticated' : 'invalid',
        verifiedToken: false,
      }));
      return false;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === 'AbortError') {
        setStatus(prev => ({ ...prev, state: 'timeout', verifiedToken: false }));
        return false;
      }
      setStatus(prev => ({ ...prev, state: 'network_error', verifiedToken: false }));
      return false;
    } finally {
      if (verifyTokenAbortRef.current === controller) {
        verifyTokenAbortRef.current = null;
      }
    }
  }, [refreshStatus]);

  const abortVerify = useCallback(() => {
    verifyTokenAbortRef.current?.abort();
    verifyTokenAbortRef.current = null;
  }, []);

  const clearToken = useCallback(() => {
    abortVerify();
    clearJwt();
    prevJwtRef.current = { authenticated: false, username: null, role: null };
    setStatus(prev => ({
      ...prev,
      state: 'unauthenticated',
      verifiedToken: false,
      jwt: { authenticated: false, username: null, role: null },
    }));
  }, [abortVerify]);

  return (
    <AuthContext.Provider value={{ status, verifyToken, clearToken, abortVerify, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
