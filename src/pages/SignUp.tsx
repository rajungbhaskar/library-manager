import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShelfIcon from '../components/ShelfIcon';

const SignUp: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await register({ name, email, password });
            navigate('/library');
        } catch (error: any) {
            alert(error.message || 'Failed to sign up');
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <ShelfIcon size="40px" color="var(--color-primary)" />
                    </div>
                    <h2>Create Account</h2>
                    <p className="subtitle">Join to start managing your library</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Sign Up
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/signin" className="link-primary">
                            Sign In
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
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                .password-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .password-input-wrapper input {
                    flex: 1;
                    padding-right: 48px;
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

export default SignUp;
