import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, User, Mail, Phone, Lock, Shield } from 'lucide-react';
import Header from '../components/Header';
import { authService, User as UserType } from '../services/authService';
import { showToast } from '../components/Toast';

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        phone: '',
        role: 'Staff' as 'Admin' | 'Manager' | 'Staff',
        isActive: true,
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchUser(id);
        }
    }, [id, isEdit]);

    const fetchUser = async (userId: string) => {
        try {
            const user = await authService.getById(userId);
            if (user) {
                setFormData({
                    username: user.username,
                    password: '', // Don't show password
                    confirmPassword: '',
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    role: user.role,
                    isActive: user.isActive,
                });
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
            showToast('Failed to load user', 'error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.username || !formData.name || !formData.email) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!isEdit) {
            if (!formData.password) {
                showToast('Password is required for new users', 'error');
                return;
            }
            if (formData.password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
        }

        if (isEdit && formData.password) {
            if (formData.password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
        }

        try {
            setLoading(true);

            const userData: Partial<UserType> = {
                username: formData.username,
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                role: formData.role,
                isActive: formData.isActive,
            };

            // Only include password if it's being changed
            if (formData.password) {
                userData.password = formData.password;
            }

            if (isEdit && id) {
                await authService.update(id, userData);
                showToast('User updated successfully', 'success');
            } else {
                await authService.add({
                    ...userData,
                    password: formData.password,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                } as Omit<UserType, 'id'>);
                showToast('User created successfully', 'success');
            }

            navigate('/users');
        } catch (error) {
            console.error('Failed to save user', error);
            showToast('Failed to save user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin': return '#ef4444';
            case 'Manager': return '#3b82f6';
            case 'Staff': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/users')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0',
                        marginBottom: '16px'
                    }}
                >
                    <ChevronLeft size={20} /> Back to Users
                </button>
                <Header
                    title={isEdit ? 'Edit User' : 'New User'}
                    subtitle={isEdit ? 'Update user account details' : 'Create a new user account'}
                    showSearch={false}
                    showNotifications={false}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Main Form */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>
                            User Information
                        </h3>

                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* Name */}
                            <div>
                                <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 44px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Email & Phone */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Email <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@weldora.com"
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 44px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Phone
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1234567890"
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 44px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                    Username <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="john_doe"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                    Used for login. Must be unique.
                                </div>
                            </div>

                            {/* Password Section */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '8px' }}>
                                <h4 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>
                                    Password {!isEdit && <span style={{ color: '#ef4444' }}>*</span>}
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                            {isEdit ? 'New Password' : 'Password'}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required={!isEdit}
                                                placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 12px 12px 44px',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'white'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                            Confirm Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm password"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 12px 12px 44px',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'white'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Password must be at least 6 characters long.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Role & Status */}
                        <div className="glass card">
                            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>
                                Role & Status
                            </h3>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="role" style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500 }}>
                                    User Role <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(['Admin', 'Manager', 'Staff'] as const).map((role) => (
                                        <label
                                            key={role}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                border: `2px solid ${formData.role === role ? getRoleBadgeColor(role) : 'var(--border)'}`,
                                                background: formData.role === role ? `${getRoleBadgeColor(role)}10` : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role}
                                                checked={formData.role === role}
                                                onChange={handleChange}
                                                style={{ marginRight: '12px' }}
                                            />
                                            <Shield size={16} style={{ marginRight: '8px', color: getRoleBadgeColor(role) }} />
                                            <span style={{ fontWeight: 600, color: formData.role === role ? getRoleBadgeColor(role) : 'white' }}>
                                                {role}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        style={{ marginRight: '12px', width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>Active Account</span>
                                </label>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', marginLeft: '30px' }}>
                                    Inactive users cannot log in to the system.
                                </div>
                            </div>
                        </div>

                        {/* Role Permissions Info */}
                        <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: `${getRoleBadgeColor(formData.role)}10`,
                            border: `1px solid ${getRoleBadgeColor(formData.role)}40`
                        }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: getRoleBadgeColor(formData.role) }}>
                                {formData.role} Permissions:
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                                {formData.role === 'Admin' && '• Full system access\n• Manage all users\n• View all data'}
                                {formData.role === 'Manager' && '• Full system access\n• Manage staff\n• View all data'}
                                {formData.role === 'Staff' && '• Dashboard access\n• Customers & Reviews\n• Enquiries & Products\n• Orders management'}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '14px 24px',
                                borderRadius: '12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
