import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: '#c00' }}>
          <h2>문제가 발생했습니다.</h2>
          <pre style={{ color: '#c00', background: '#fff0f0', padding: 16, borderRadius: 8 }}>
            {this.state.error?.toString()}
          </pre>
          <p>잠시 후 다시 시도해 주세요.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 