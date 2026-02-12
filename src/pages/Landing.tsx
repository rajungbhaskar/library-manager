import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShelfIcon from '../components/ShelfIcon';
import { BookOpen, Shield, BarChart3, HardDrive } from 'lucide-react';

const Landing: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/library" replace />;
    }

    return (
        <div className="landing-container">
            {/* Navigation Header */}
            <header className="landing-header">
                <div className="landing-logo">
                    <span className="logo-text-main">My-s</span>
                    <ShelfIcon size="1.2em" />
                    <span className="logo-text-main">elf</span>
                </div>
                <div className="landing-nav-actions">
                    <Link to="/library" className="btn btn-primary">Launch App</Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Your Personal <span className="text-gradient">Library</span>, <br />
                        Elevated.
                    </h1>
                    <p className="hero-subtitle">
                        Book management for serious readers.
                    </p>
                    <div className="hero-actions">
                        <Link to="/library" className="btn btn-primary btn-large">Launch App</Link>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="feature-cards-grid">
                        <div className="feature-card">
                            <div className="f-icon bg-indigo"><BookOpen size={24} /></div>
                            <h3>Smart Catalog</h3>
                            <p>Organized collection with rich metadata.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon bg-green"><BarChart3 size={24} /></div>
                            <h3>Deep Insights</h3>
                            <p>Track your progress and velocity.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon bg-amber"><Shield size={24} /></div>
                            <h3>Private Access</h3>
                            <p>Your library is isolated and secure.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon bg-blue"><HardDrive size={24} /></div>
                            <h3>Local Control</h3>
                            <p>Your data stays on your device.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; 2026. All Rights reserved by developer.</p>
            </footer>

            <style>{`
                .landing-container {
                    min-height: 100vh;
                    background: radial-gradient(circle at top right, #f8fafc, #eff6ff);
                    display: flex;
                    flex-direction: column;
                    font-family: var(--font-family);
                    color: var(--color-text);
                    overflow-x: hidden;
                }

                .landing-header {
                    padding: 1.5rem 5%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    border-bottom: 1px solid rgba(226, 232, 240, 0.5);
                }

                .landing-logo {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    line-height: 1;
                }

                .logo-text-main {
                    font-size: 1.8rem;
                    font-weight: 900;
                    letter-spacing: 1px;
                    color: var(--color-text);
                }

                .landing-nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .btn-link {
                    font-weight: 600;
                    color: var(--color-text-muted);
                    transition: color 0.2s;
                }

                .btn-link:hover {
                    color: var(--color-primary);
                }

                /* Hero Section */
                .hero-section {
                    flex: 1;
                    padding: 4rem 5%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    align-items: center;
                    gap: 4rem;
                }

                .hero-title {
                    font-size: 4rem;
                    font-weight: 900;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.04em;
                    color: #1e293b;
                }

                .text-gradient {
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    color: var(--color-text-muted);
                    line-height: 1.6;
                    margin-bottom: 2.5rem;
                    max-width: 540px;
                }

                .hero-actions {
                    display: flex;
                    gap: 1rem;
                }

                .btn-large {
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    border-radius: 12px;
                }

                /* Visuals */
                .feature-cards-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .feature-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
                    border: 1px solid #f1f5f9;
                    transition: all 0.3s ease;
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1);
                }

                .f-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }

                .bg-indigo { background: #e0e7ff; color: #4f46e5; }
                .bg-green { background: #dcfce7; color: #10b981; }
                .bg-amber { background: #fef3c7; color: #f59e0b; }
                .bg-blue { background: #dbeafe; color: #3b82f6; }

                .feature-card h3 {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: #1e293b;
                }

                .feature-card p {
                    font-size: 0.95rem;
                    color: var(--color-text-muted);
                    line-height: 1.5;
                }

                .landing-footer {
                    padding: 3rem 5%;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                    color: var(--color-text-muted);
                    font-size: 0.9rem;
                }

                @media (max-width: 1024px) {
                    .hero-section {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }
                    .hero-subtitle {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .hero-actions {
                        justify-content: center;
                    }
                    .hero-title {
                        font-size: 3rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Landing;
