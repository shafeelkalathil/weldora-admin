import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Shield, UserCircle, Edit, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import { authService, User } from '../services/authService';
import { showToast } from '../components/Toast';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await authService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin': return '#ef4444';
            case 'Manager': return '#3b82f6';
            case 'Staff': return '#10b981';
            default: return '#6b7280';
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            return;
        }

        try {
            // Note: We need to add a delete method to authService
            showToast('Delete user functionality will be implemented', 'info');
            // await authService.delete(userId);
            // fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
            showToast('Failed to delete user', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading users...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <Header
                    title="User Management"
                    subtitle="Manage system users and access control"
                    showSearch={false}
                    showNotifications={false}
                />
                <button
                    onClick={() => navigate('/users/add')}
                    style={{
                        padding: '14px 24px',
                        borderRadius: '12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Users</div>
                            <div style={{ fontSize: '32px', fontWeight: 700 }}>{users.length}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserCircle size={24} color="#6366f1" />
                        </div>
                    </div>
                </div>

                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Admins</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444' }}>
                                {users.filter(u => u.role === 'Admin').length}
                            </div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={24} color="#ef4444" />
                        </div>
                    </div>
                </div>

                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Staff</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                                {users.filter(u => u.role === 'Staff').length}
                            </div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserCircle size={24} color="#10b981" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="glass card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, username, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 44px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="glass card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>User</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Username</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Role</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Created</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: `${getRoleBadgeColor(user.role)}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: getRoleBadgeColor(user.role),
                                                    fontWeight: 700,
                                                    fontSize: '14px'
                                                }}>
                                                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{user.username}</span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: `${getRoleBadgeColor(user.role)}20`,
                                                color: getRoleBadgeColor(user.role)
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: user.isActive ? '#10b981' : '#ef4444'
                                            }}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => navigate(`/users/edit/${user.id}`)}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#3b82f6'
                                                    }}
                                                    title="Edit User"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {user.role !== 'Admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        style={{
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#ef4444'
                                                        }}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
