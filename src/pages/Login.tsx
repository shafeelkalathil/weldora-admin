import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { showToast } from '../components/Toast';
import logo from '../assets/logo-removebg-preview.png';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already logged in
        if (authService.isAuthenticated()) {
            navigate('/');
        }

        // Create default admin account if it doesn't exist
        authService.createDefaultAdmin();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }

        try {
            setLoading(true);
            const user = await authService.login(formData.username, formData.password);

            if (user && user.isActive) {
                authService.setCurrentUser(user);
                showToast(`Welcome back, ${user.name}!`, 'success');
                navigate('/');
            } else if (user && !user.isActive) {
                setError('Your account has been deactivated. Please contact an administrator.');
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login failed', error);
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            padding: '20px'
        }}>
            {/* Background Animation */}
            <div style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                zIndex: 0
            }}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 300 + 50 + 'px',
                            height: Math.random() * 300 + 50 + 'px',
                            borderRadius: '50%',
                            background: `radial-gradient(circle, rgba(99, 102, 241, ${Math.random() * 0.1}) 0%, transparent 70%)`,
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animation: `float ${Math.random() * 20 + 10}s infinite ease-in-out`,
                        }}
                    />
                ))}
            </div>

            {/* Login Card */}
            <div className="glass card" style={{
                maxWidth: '600px',
                width: '100%',
                position: 'relative',
                zIndex: 1,
                padding: window.innerWidth < 768 ? '32px 24px' : '56px 48px',
                margin: 'auto'
            }}>
                {/* Logo & Title */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img
                        src={logo}
                        alt="Weldora"
                        style={{
                            width: window.innerWidth < 768 ? '70px' : '100px',
                            height: window.innerWidth < 768 ? '70px' : '100px',
                            marginBottom: '24px',
                            filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4))'
                        }}
                    />
                    <h1 style={{
                        fontSize: window.innerWidth < 768 ? '26px' : '36px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        𝐖𝐄𝐋𝐃𝐎𝐑𝐀
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Admin Panel Login
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span style={{ color: '#ef4444', fontSize: '13px', flex: 1, minWidth: '200px' }}>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label htmlFor="username" style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'var(--text-main)'
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '15px',
                                transition: 'all 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label htmlFor="password" style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'var(--text-main)'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '15px',
                                transition: 'all 0.3s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.5)',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <LogIn size={20} />
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Default Credentials Info */}
                {/* <div style={{
                    marginTop: '32px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px dashed var(--primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <Shield size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                            Default Admin Credentials
                        </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        <div><strong style={{ color: 'white' }}>Username:</strong> admin</div>
                        <div><strong style={{ color: 'white' }}>Password:</strong> admin123</div>
                    </div>
                </div> */}
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -20px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(20px, 20px) scale(1.05); }
                }
                
                @media (max-width: 480px) {
                    .glass.card {
                        padding: 24px 20px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
