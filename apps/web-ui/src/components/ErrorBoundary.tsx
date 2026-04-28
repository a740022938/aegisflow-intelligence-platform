import React from 'react';

interface Props { children: React.ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  private _errorHandler: ((event: ErrorEvent) => void) | null = null;
  private _unhandledHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidMount() {
    this._errorHandler = (event: ErrorEvent) => {
      console.error('[ErrorBoundary] Caught async error:', event.error);
      event.preventDefault();
    };
    window.addEventListener('error', this._errorHandler);
    this._unhandledHandler = (event: PromiseRejectionEvent) => {
      console.error('[ErrorBoundary] Unhandled rejection:', event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', this._unhandledHandler);
  }

  componentWillUnmount() {
    if (this._errorHandler) window.removeEventListener('error', this._errorHandler);
    if (this._unhandledHandler) window.removeEventListener('unhandledrejection', this._unhandledHandler);
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
