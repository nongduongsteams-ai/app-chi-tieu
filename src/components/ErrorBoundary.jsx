import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fee',
                    minHeight: '100vh',
                    fontFamily: 'monospace'
                }}>
                    <h1 style={{ color: '#c00' }}>⚠️ Lỗi ứng dụng</h1>
                    <h2>Chi tiết lỗi:</h2>
                    <pre style={{
                        backgroundColor: '#fff',
                        padding: '10px',
                        border: '1px solid #ccc',
                        overflow: 'auto',
                        fontSize: '12px'
                    }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <h3>Stack trace:</h3>
                    <pre style={{
                        backgroundColor: '#fff',
                        padding: '10px',
                        border: '1px solid #ccc',
                        overflow: 'auto',
                        fontSize: '10px'
                    }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Tải lại trang
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
