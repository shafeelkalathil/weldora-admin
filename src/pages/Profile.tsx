import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import Header from '../components/Header';
import { authService, User as UserType } from '../services/authService';
import { showToast } from '../components/Toast';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatar: '',
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            username: user.username,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            avatar: user.avatar || '',
        });
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) return;

        // Validate password change if attempted
        if (formData.newPassword || formData.confirmPassword) {
            if (!formData.currentPassword) {
                showToast('Please enter your current password', 'error');
                return;
            }
            if (formData.currentPassword !== currentUser.password) {
                showToast('Current password is incorrect', 'error');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            if (formData.newPassword.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
        }

        try {
            setLoading(true);

            const updateData: Partial<UserType> = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                username: formData.username,
                avatar: formData.avatar,
            };

            // Add password if changing
            if (formData.newPassword) {
                updateData.password = formData.newPassword;
            }

            await authService.update(currentUser.id, updateData);

            // Update current user in localStorage
            const updatedUser = { ...currentUser, ...updateData };
            authService.setCurrentUser(updatedUser);
            setCurrentUser(updatedUser);

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                avatar: formData.avatar, // Preserve avatar
            }));

            showToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update profile', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return null;
    }

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
            <Header
                title="My Profile"
                subtitle="Manage your account settings"
                showSearch={false}
                showNotifications={false}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginTop: '32px' }}>
                {/* Main Form */}
                <div className="glass card">
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>
                        Account Information
                    </h3>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* Profile Image */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '2px dashed var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: formData.avatar ? `url(${formData.avatar}) center/cover` : 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('profile-upload')?.click()}
                                    >
                                        {!formData.avatar && <User size={32} style={{ color: 'var(--text-muted)' }} />}
                                    </div>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        background: 'var(--primary)',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--bg-card)',
                                        cursor: 'pointer',
                                        pointerEvents: 'none' // Click passes through to parent
                                    }}>
                                        <div style={{ fontSize: '16px' }}>+</div>
                                    </div>
                                </div>
                            </div>

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
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white'
                                    }}
                                />
                            </div>

                            {/* Change Password Section */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '8px' }}>
                                <h4 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>
                                    Change Password
                                </h4>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Leave blank to keep current password"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="New password"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'white'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'white'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: '8px',
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
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar - Account Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass card">
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>
                            Account Details
                        </h3>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>
                                    Role
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={16} style={{ color: getRoleBadgeColor(currentUser.role) }} />
                                    <span style={{
                                        fontSize: '14px',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        background: `${getRoleBadgeColor(currentUser.role)}20`,
                                        color: getRoleBadgeColor(currentUser.role),
                                        fontWeight: 600
                                    }}>
                                        {currentUser.role}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>
                                    Account Created
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <Calendar size={14} color="var(--text-muted)" />
                                    {new Date(currentUser.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>
                                    Last Updated
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <Calendar size={14} color="var(--text-muted)" />
                                    {new Date(currentUser.updatedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>
                                    User ID
                                </div>
                                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                    {currentUser.id}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            <strong style={{ color: '#ef4444', display: 'block', marginBottom: '8px' }}>
                                Note:
                            </strong>
                            You cannot delete your own account. Contact an administrator if you need to deactivate your account.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
