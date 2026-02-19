import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building, Star, Phone, Image } from 'lucide-react';
import Header from '../components/Header';
import { companyService, Company } from '../services/companyService';
import { showToast } from '../components/Toast';

const Companies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [companies, searchTerm]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const data = await companyService.getAll();
            setCompanies(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to fetch companies', error);
            showToast('Failed to load companies', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...companies];

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.phone.includes(searchTerm) ||
                c.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCompanies(filtered);
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                fill={i < rating ? '#fbbf24' : 'none'}
                color={i < rating ? '#fbbf24' : '#6b7280'}
            />
        ));
    };

    const stats = {
        total: companies.length,
        averageRating: companies.length > 0
            ? (companies.reduce((sum, c) => sum + c.rating, 0) / companies.length).toFixed(1)
            : '0.0',
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading companies...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <Header
                    title="Associated Companies & Shops"
                    subtitle="Manage partner companies and retail shops"
                    showSearch={false}
                    showNotifications={false}
                />
                <button
                    onClick={() => navigate('/companies/add')}
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
                    Add Company
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Companies</div>
                            <div style={{ fontSize: '32px', fontWeight: 700 }}>{stats.total}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building size={24} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div className="glass card hover-lift" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Average Rating</div>
                            <div style={{ fontSize: '32px', fontWeight: 700, color: '#fbbf24' }}>{stats.averageRating}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={24} color="#fbbf24" />
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
                        placeholder="Search by name, phone, or email..."
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

            {/* Companies Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {filteredCompanies.length === 0 ? (
                    <div className="glass card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                        No companies found
                    </div>
                ) : (
                    filteredCompanies.map((company) => (
                        <div
                            key={company.id}
                            onClick={() => navigate(`/companies/view/${company.id}`)}
                            className="glass card hover-lift"
                            style={{
                                cursor: 'pointer',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Logo/Header */}
                            <div style={{
                                height: '140px',
                                background: company.logoUrl
                                    ? `url(${company.logoUrl}) center/cover`
                                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                {!company.logoUrl && <Building size={48} color="rgba(255,255,255,0.3)" />}
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{company.name}</h3>

                                {/* Rating */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {getRatingStars(company.rating)}
                                    </div>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                        {company.rating}.0
                                    </span>
                                </div>

                                {/* Phone */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Phone size={14} color="var(--primary)" />
                                    <span style={{ fontSize: '14px' }}>{company.phone}</span>
                                </div>

                                {/* Photos Count */}
                                {company.photos && company.photos.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                        <Image size={14} color="var(--accent)" />
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {company.photos.length} {company.photos.length === 1 ? 'photo' : 'photos'}
                                        </span>
                                    </div>
                                )}

                                {/* Review Preview */}
                                {company.review && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.02)',
                                        fontSize: '13px',
                                        color: 'var(--text-muted)',
                                        lineHeight: '1.5',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        "{company.review}"
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Companies;
