import React from 'react';

interface Props { children: React.ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 40, maxWidth: 600, margin: '40px auto',
          background: 'var(--bg-surface)', borderRadius: 8,
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <h2 style={{ color: 'var(--danger)', fontSize: 18, marginBottom: 12 }}>页面出错了</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{
              padding: '8px 20px', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
            }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
