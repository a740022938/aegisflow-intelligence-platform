import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './theme/tokens.css';
import './theme/workspaceControls.css';
import './theme/legacy-bridge.css';
import './theme/inline-style-bridge.css';
import './components/ui/shared.css';   /* 全局主题变量 */
import './components/Layout.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// 全局 fetch 拦截: 401 不崩溃，降级返回 { ok: false }
const _origFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  try {
    const res = await _origFetch(input, init);
    if (res.status === 401) {
      console.warn('[fetch] 401 on', input, '- returning dev fallback');
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized', _unauthorized: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return res;
  } catch (e: any) {
    console.warn('[fetch] Network error on', input, '- returning dev fallback');
    return new Response(JSON.stringify({ ok: false, error: e.message || 'network_error', _networkError: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
