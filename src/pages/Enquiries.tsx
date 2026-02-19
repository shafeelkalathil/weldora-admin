import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, TrendingUp, Clock, CheckCircle, XCircle, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { enquiryService, Enquiry } from '../services/enquiryService';
import { showToast } from '../components/Toast';

const Enquiries = () => {
    const navigate = useNavigate();
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterPriority, setFilterPriority] = useState<string>('All');

    useEffect(() => {
        fetchEnquiries();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [enquiries, searchTerm, filterStatus, filterPriority]);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const data = await enquiryService.getAll();
            setEnquiries(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to fetch enquiries', error);
            showToast('Failed to load enquiries', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...enquiries];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.phone.includes(searchTerm) ||
                e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.company?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'All') {
            filtered = filtered.filter(e => e.status === filterStatus);
        }

        // Priority filter
        if (filterPriority !== 'All') {
            filtered = filtered.filter(e => e.priority === filterPriority);
        }

        setFilteredEnquiries(filtered);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'New': return <Clock size={16} color="#3b82f6" />;
            case 'In Progress': return <TrendingUp size={16} color="#f59e0b" />;
            case 'Follow-up Scheduled': return <Calendar size={16} color="#8b5cf6" />;
            case 'Converted': return <CheckCircle size={16} color="#10b981" />;
            case 'Lost': return <XCircle size={16} color="#ef4444" />;
            case 'On Hold': return <AlertCircle size={16} color="#6b7280" />;
            default: return <Clock size={16} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return '#3b82f6';
            case 'In Progress': return '#f59e0b';
            case 'Follow-up Scheduled': return '#8b5cf6';
            case 'Converted': return '#10b981';
            case 'Lost': return '#ef4444';
            case 'On Hold': return '#6b7280';
            default: return 'var(--text-muted)';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return '#ef4444';
            case 'High': return '#f59e0b';
            case 'Medium': return '#3b82f6';
            case 'Low': return '#6b7280';
            default: return 'var(--text-muted)';
        }
    };

    const stats = {
        total: enquiries.length,
        new: enquiries.filter(e => e.status === 'New').length,
        inProgress: enquiries.filter(e => e.status === 'In Progress' || e.status === 'Follow-up Scheduled').length,
        converted: enquiries.filter(e => e.status === 'Converted').length,
        estimatedValue: enquiries.reduce((sum, e) => sum + (e.estimatedValue || 0), 0),
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading enquiries...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <Header
                    title="Customer Enquiries"
                    subtitle="Manage leads and follow-ups"
                    showSearch={false}
                    showNotifications={false}
                />
                <button
                    onClick={() => navigate('/enquiries/add')}
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
                    Add Enquiry
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Enquiries</div>
                            <div style={{ fontSize: '32px', fontWeight: 700 }}>{stats.total}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={24} color="var(--primary)" />
                        </div>
                    </div>
                </div>

                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>New Enquiries</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>{stats.new}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>In Progress</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{stats.inProgress}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={24} color="#f59e0b" />
                        </div>
                    </div>
                </div>

                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Converted</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{stats.converted}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={24} color="#10b981" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass card" style={{ marginBottom: '24px', padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, phone, email, company..."
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

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="All">All Status</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                        <option value="On Hold">On Hold</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="All">All Priority</option>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            {/* Enquiries Table */}
            <div className="glass card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>CUSTOMER</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>CONTACT</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>PRODUCT INTEREST</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>SOURCE</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>STATUS</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>PRIORITY</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>NEXT FOLLOW-UP</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>VALUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEnquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                        No enquiries found
                                    </td>
                                </tr>
                            ) : (
                                filteredEnquiries.map((enquiry) => (
                                    <tr
                                        key={enquiry.id}
                                        onClick={() => navigate(`/enquiries/view/${enquiry.id}`)}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600 }}>{enquiry.customerName}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <Phone size={12} color="var(--primary)" />
                                                <span style={{ fontSize: '13px' }}>{enquiry.phone}</span>
                                            </div>
                                            {enquiry.email && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Mail size={12} color="var(--accent)" />
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{enquiry.email}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '14px' }}>{enquiry.productInterest || '-'}</span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                                                {enquiry.source}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {getStatusIcon(enquiry.status)}
                                                <span style={{ fontSize: '13px', color: getStatusColor(enquiry.status), fontWeight: 600 }}>
                                                    {enquiry.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                fontSize: '12px',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                background: `${getPriorityColor(enquiry.priority)}15`,
                                                color: getPriorityColor(enquiry.priority),
                                                fontWeight: 600
                                            }}>
                                                {enquiry.priority}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {enquiry.nextFollowUpDate ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={14} color="var(--accent)" />
                                                    <span style={{ fontSize: '13px' }}>{enquiry.nextFollowUpDate}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Not scheduled</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {enquiry.estimatedValue ? (
                                                <span style={{ fontWeight: 600, color: '#10b981' }}>
                                                    ${enquiry.estimatedValue.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            )}
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

export default Enquiries;
