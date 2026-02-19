import { Search, Bell } from 'lucide-react';
import { authService } from '../services/authService';

const Header = ({
    title,
    subtitle,
    showSearch = true,
    showNotifications = true,
    searchValue = "",
    onSearchChange = () => { }
}: {
    title?: string | React.ReactNode,
    subtitle?: string,
    showSearch?: boolean,
    showNotifications?: boolean,
    searchValue?: string,
    onSearchChange?: (value: string) => void
}) => {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            animation: 'fadeIn 0.5s ease',
            width: '100%'
        }}>
            <div>
                <h2 style={{ fontSize: '32px' }}>{title || <span>Welcome back, <span className="gradient-text">{authService.getCurrentUser()?.name?.split(' ')[0] || 'User'}!</span></span>}</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle || "Here's what's happening with Weldora today."}</p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
                {showSearch && (
                    <div className="glass" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderRadius: '12px'
                    }}>
                        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                outline: 'none',
                                fontSize: '14px'
                            }}
                        />
                    </div>
                )}
                {/* {showNotifications && (
                    <div className="glass" style={{ padding: '10px', borderRadius: '12px', cursor: 'pointer', position: 'relative' }}>
                        <Bell size={20} />
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'var(--secondary)',
                            borderRadius: '50%',
                            border: '2px solid var(--bg-sidebar)'
                        }}></div>
                    </div>
                )} */}
            </div>
        </header>
    );
};

export default Header;
