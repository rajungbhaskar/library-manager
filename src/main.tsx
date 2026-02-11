import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { LibraryProvider } from './context/LibraryContext'
import './styles/global.css'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#dc2626' }}>
                    <h1>Something went wrong.</h1>
                    <p>Please report this error:</p>
                    <pre style={{ background: '#fecaca', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                        <br />
                        {this.state.error?.stack}
                    </pre>
                    <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                        Clear LocalStorage & Reload (Emergency Reset)
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <LibraryProvider>
                    <App />
                </LibraryProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>,
)
