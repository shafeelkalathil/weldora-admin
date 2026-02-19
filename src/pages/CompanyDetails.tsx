import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit, Phone, Mail, MapPin, Star, Trash2, Building } from 'lucide-react';
import Header from '../components/Header';
import { companyService, Company } from '../services/companyService';
import { showToast } from '../components/Toast';

const CompanyDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCompany(id);
        }
    }, [id]);

    const fetchCompany = async (companyId: string) => {
        try {
            setLoading(true);
            const companies = await companyService.getAll();
            const found = companies.find(c => c.id === companyId);
            if (found) {
                setCompany(found);
            } else {
                showToast('Company not found', 'error');
                navigate('/companies');
            }
        } catch (error) {
            console.error('Failed to fetch company', error);
            showToast('Failed to load company', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!company) return;

        if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
            return;
        }

        try {
            await companyService.delete(company.id);
            showToast('Company deleted successfully', 'success');
            navigate('/companies');
        } catch (error) {
            console.error('Failed to delete company', error);
            showToast('Failed to delete company', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading company details...</div>
            </div>
        );
    }

    if (!company) return null;

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={20}
                fill={i < rating ? '#fbbf24' : 'none'}
                color={i < rating ? '#fbbf24' : '#6b7280'}
            />
        ));
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/companies')}
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
                        <ChevronLeft size={20} /> Back to Companies
                    </button>
                    <Header
                        title={company.name}
                        subtitle={`Company #${company.id.substring(0, 8)}`}
                        showSearch={false}
                        showNotifications={false}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Trash2 size={18} />
                        Delete
                    </button>
                    <button
                        onClick={() => navigate(`/companies/edit/${company.id}`)}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <Edit size={18} />
                        Edit Company
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Company Info Card */}
                    <div className="glass card">
                        {/* Logo */}
                        {company.logoUrl && (
                            <div style={{ marginBottom: '24px' }}>
                                <img
                                    src={company.logoUrl}
                                    alt={company.name}
                                    style={{
                                        width: '100%',
                                        height: '240px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)'
                                    }}
                                />
                            </div>
                        )}

                        <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 600 }}>Company Information</h3>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Company Name</div>
                                <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Building size={16} color="var(--primary)" />
                                    {company.name}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Phone</div>
                                <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Phone size={16} color="var(--primary)" />
                                    {company.phone}
                                </div>
                            </div>

                            {company.email && (
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Email</div>
                                    <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={16} color="var(--accent)" />
                                        {company.email}
                                    </div>
                                </div>
                            )}

                            {company.address && (
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Address</div>
                                    <div style={{ fontSize: '14px', display: 'flex', alignItems: 'start', gap: '8px' }}>
                                        <MapPin size={16} color="var(--accent)" style={{ marginTop: '2px' }} />
                                        {company.address}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>Rating</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {getRatingStars(company.rating)}
                                    </div>
                                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#fbbf24' }}>
                                        {company.rating}.0
                                    </span>
                                </div>
                            </div>

                            {company.review && (
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '12px' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>Review</div>
                                    <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-main)' }}>
                                        "{company.review}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    {company.photos && company.photos.length > 0 && (
                        <div className="glass card">
                            <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 600 }}>Photo Gallery</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: '12px'
                            }}>
                                {company.photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedPhoto(photo)}
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: '1px solid var(--border)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <img
                                            src={photo}
                                            alt={`Photo ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '160px',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Metadata */}
                <div>
                    <div className="glass card">
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>Details</h3>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ marginBottom: '4px' }}>Created</div>
                                <div style={{ color: 'white', fontSize: '12px' }}>
                                    {new Date(company.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div style={{ marginBottom: '4px' }}>Last Updated</div>
                                <div style={{ color: 'white', fontSize: '12px' }}>
                                    {new Date(company.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    onClick={() => setSelectedPhoto(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        cursor: 'pointer'
                    }}
                >
                    <img
                        src={selectedPhoto}
                        alt="Full size"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            borderRadius: '12px'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default CompanyDetails;
