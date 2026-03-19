import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../App.css';

const particles = [...Array(60)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 1}px`,
    height: `${Math.random() * 4 + 1}px`,
    animationDelay: `${Math.random() * 20}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    opacity: Math.random() * 0.5 + 0.3
}));

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            background: 'radial-gradient(circle at 70% 30%, #005a78, #001f2b)',
            overflow: 'hidden'
        }}>
            {/* Animated Particles */}
            <div className="particles-container">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.width,
                            height: p.height,
                            animationDelay: p.animationDelay,
                            animationDuration: p.animationDuration,
                            opacity: p.opacity
                        }}
                    ></div>
                ))}
            </div>


            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '50px 40px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1,
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 700 }}>Welcome</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Please login to your account</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#00d2d3' }}>Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#00d2d3' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 44px 12px 16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px',
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.color = '#00d2d3'}
                                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    /* Eye-off icon */
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    /* Eye icon */
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #00878a, #39b54a)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(0, 135, 138, 0.2)'
                    }}>
                        Sign In
                    </button>
                </form>

                {error && <div style={{ marginTop: '20px', color: '#ff4d4d', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
            </div>
        </div>
    );
};

export default Login;



