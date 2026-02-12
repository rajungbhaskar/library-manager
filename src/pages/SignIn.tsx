import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import ShelfIcon from '../components/ShelfIcon';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/library');
        } catch (error: any) {
            alert(error.message || 'Failed to sign in');
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <ShelfIcon size="40px" color="var(--color-primary)" />
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="subtitle">Sign in to manage your library</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Sign In
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="link-primary">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                .auth-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: var(--color-background);
                    padding: var(--spacing-md);
                }
                .auth-card {
                    width: 100%;
                    max-width: 400px;
                    padding: var(--spacing-xl);
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: var(--spacing-xl);
                }
                .auth-logo {
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    width: 64px;
                    height: 64px;
                    background-color: #e0e7ff; /* Indigo 100 */
                    border-radius: 50%;
                    margin-bottom: var(--spacing-md);
                }
                .subtitle {
                    color: var(--color-text-muted);
                    font-size: var(--font-size-sm);
                    margin-top: var(--spacing-xs);
                }
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-lg);
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xs);
                }
                label {
                    font-weight: 500;
                    font-size: var(--font-size-sm);
                    color: var(--color-text);
                }
                input {
                    padding: var(--spacing-sm) var(--spacing-md);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-base);
                    transition: border-color 0.2s;
                }
                input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); /* Indigo 500 with opacity */
                }
                .password-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .password-input-wrapper input {
                    flex: 1;
                    padding-right: 48px; /* Space for the eye icon */
                }
                .password-toggle {
                    position: absolute;
                    right: var(--spacing-sm);
                    padding: var(--spacing-xs);
                    color: var(--color-text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }
                .password-toggle:hover {
                    color: var(--color-text);
                }
                .btn-block {
                    width: 100%;
                    padding: var(--spacing-md);
                }
                .auth-footer {
                    margin-top: var(--spacing-lg);
                    text-align: center;
                    font-size: var(--font-size-sm);
                    color: var(--color-text-muted);
                }
                .link-primary {
                    color: var(--color-primary);
                    font-weight: 500;
                }
                .link-primary:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default SignIn;
