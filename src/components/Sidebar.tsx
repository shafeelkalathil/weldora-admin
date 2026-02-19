import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Package,
    Database,
    Wallet,
    ShoppingCart,
    LogOut,
    Menu,
    X,
    Shield,
    UserCircle,
    PhoneCall,
    Building
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUserRole } from '../context/UserContext';
import { showToast, showConfirm } from './Toast';
import { authService } from '../services/authService';
import logo from '../assets/logo-removebg-preview.png';

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            margin: '4px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: active ? 'white' : 'var(--text-muted)',
            backgroundColor: active ? 'var(--primary)' : 'transparent',
            boxShadow: active ? '0 8px 16px -4px var(--primary-glow)' : 'none',
        }}
    >
        <Icon size={20} style={{ marginRight: '12px', flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
);

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { role, setRole } = useUserRole();
    const currentPath = location.pathname;
    const [isOpen, setIsOpen] = useState(false);

    // Sync role with logged-in user
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.role !== role) {
            setRole(currentUser.role as any);
        }
    }, [role, setRole]);

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Manager', 'Staff', 'Admin'] },
        { path: '/staff', icon: Users, label: 'Staff Management', roles: ['Manager', 'Admin'] },
        { path: '/customers', icon: Users, label: 'Customers & Reviews', roles: ['Manager', 'Staff', 'Admin'] },
        { path: '/enquiries', icon: PhoneCall, label: 'Enquiries & Follow-ups', roles: ['Manager', 'Staff', 'Admin'] },
        { path: '/companies', icon: Building, label: 'Companies & Shops', roles: ['Manager', 'Admin'] },
        { path: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['Manager', 'Admin'] },
        { path: '/products', icon: Package, label: 'Products', roles: ['Manager', 'Staff', 'Admin'] },
        { path: '/assets', icon: Database, label: 'Company Assets', roles: ['Manager', 'Admin'] },
        { path: '/materials', icon: Database, label: 'Material Purchases', roles: ['Manager', 'Admin'] },
        { path: '/accounts', icon: Wallet, label: 'Accounts', roles: ['Manager', 'Admin'] },
        { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['Manager', 'Staff', 'Admin'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(role));

    const isActive = (path: string) => {
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleLogout = () => {
        showConfirm("Are you sure you want to logout?", () => {
            authService.logout();
            showToast('Logged out successfully', 'success');
            navigate('/login');
        }, "Logout", "#ef4444");
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="mobile-toggle"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 200,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'none',
                }}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 90,
                    }}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div style={{ padding: '32px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <img src={logo} alt="Weldora Logo" style={{ height: '32px', objectFit: 'contain', borderRadius: '6px', mixBlendMode: 'screen', padding: '2px 0px 0px 2px' }} />
                            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)', margin: 0 }}>
                                𝐖𝐄𝐋𝐃𝐎𝐑𝐀
                            </h1>
                        </div>
                        {/* <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>ADMIN CONSOLE v1.1</p> */}
                    </div>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredItems.map((item) => (
                        <NavItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            active={isActive(item.path)}
                            onClick={() => handleNavigation(item.path)}
                        />
                    ))}
                </nav>

                <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        onClick={() => navigate('/profile')}
                        title="View Profile"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px',
                            borderRadius: '12px',
                            backgroundColor: role === 'Manager' || role === 'Admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'all 0.2s',
                            minWidth: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: authService.getCurrentUser()?.avatar ? 'transparent' : (role === 'Admin' ? '#ef4444' : role === 'Manager' ? 'var(--primary)' : 'var(--accent)'),
                            background: authService.getCurrentUser()?.avatar ? `url(${authService.getCurrentUser()?.avatar}) center/cover` : undefined,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px',
                            color: 'white',
                            fontWeight: 700,
                            flexShrink: 0,
                            overflow: 'hidden'
                        }}>
                            {!authService.getCurrentUser()?.avatar && (role === 'Admin' || role === 'Manager' ? <Shield size={18} /> : <UserCircle size={18} />)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {authService.getCurrentUser()?.name || 'User'}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: role === 'Admin' ? '#ef4444' : role === 'Manager' ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: role === 'Admin' || role === 'Manager' ? 600 : 400
                            }}>
                                {role}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            padding: '10px',
                            borderRadius: '12px',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        title="Logout"
                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
