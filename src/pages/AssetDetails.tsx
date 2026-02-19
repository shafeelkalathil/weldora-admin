import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Wrench, Ruler, Calculator, DollarSign, Calendar, Hash, AlertTriangle, Shield, Settings, History, Monitor, Package } from 'lucide-react';
import Header from '../components/Header';
import { assetService, Asset } from '../services/assetService';
import { showToast } from '../components/Toast';

const AssetDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchAssetDetails(id);
        }
    }, [id]);

    const fetchAssetDetails = async (assetId: string) => {
        try {
            setLoading(true);
            const data = await assetService.getAll();
            const item = data.find(a => a.id === assetId);
            if (item) {
                setAsset(item);
            } else {
                showToast("Asset not found", "error");
                navigate('/assets');
            }
        } catch (error) {
            console.error("Failed to fetch asset details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading asset technical data...</div>
            </div>
        );
    }

    if (!asset) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Operational': return '#10b981';
            case 'Maintenance': return '#f59e0b';
            case 'Retired': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/assets')}
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
                        <ChevronLeft size={20} /> Back to Assets
                    </button>
                    <Header
                        title={asset.name}
                        subtitle={`Serial: ${asset.serialWrapper} | Type: ${asset.type}`}
                        showSearch={false}
                        showNotifications={false}
                    />
                </div>
                <Link
                    to={`/assets/edit/${asset.id}`}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        color: 'white',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        marginBottom: '8px'
                    }}
                >
                    <Edit size={18} /> Edit Asset
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>

                {/* Visual / Summary Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass card" style={{ padding: '40px', textAlign: 'center' }}>
                        {asset.images && asset.images.length > 0 ? (
                            <div style={{ marginBottom: '24px' }}>
                                <img
                                    src={asset.images[0]}
                                    alt={asset.name}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border)'
                                    }}
                                />
                                {asset.images.length > 1 && (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                                        {asset.images.slice(1, 4).map((img, i) => (
                                            <div key={i} style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '24px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                color: 'var(--primary)'
                            }}>
                                {asset.type === 'Machinery' && <Wrench size={48} />}
                                {asset.type === 'Tools' && <Ruler size={48} />}
                                {asset.type === 'IT Equipment' && <Monitor size={48} />}
                                {asset.type === 'Other' && <Package size={48} />}
                            </div>
                        )}
                        <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>{asset.name}</h2>
                        <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: `rgba(${asset.status === 'Operational' ? '16, 185, 129' : (asset.status === 'Maintenance' ? '245, 158, 11' : '239, 68, 68')}, 0.2)`,
                            color: getStatusColor(asset.status),
                            marginBottom: '32px'
                        }}>
                            {asset.status}
                        </div>

                        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Asset Value</label>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>${asset.value.toLocaleString()}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Maintenance Due</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                    <Calendar size={16} /> {asset.maintenanceDue || 'Not Scheduled'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} color="var(--primary)" /> Insurance Info
                        </h3>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Provider:</span>
                                <span style={{ color: 'white' }}>{asset.insuranceProvider || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Policy Exp:</span>
                                <span style={{ color: asset.insurancePolicyExp ? 'white' : 'var(--text-muted)' }}>
                                    {asset.insurancePolicyExp || 'Not Set'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tech Specs Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Settings size={18} color="var(--primary)" /> Technical Specifications
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Manufacturer</label>
                                <div style={{ fontSize: '16px', fontWeight: 500 }}>{asset.manufacturer || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Model Year</label>
                                <div style={{ fontSize: '16px', fontWeight: 500 }}>{asset.modelYear || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Serial Number</label>
                                <div style={{ fontSize: '16px', fontWeight: 500, fontFamily: 'monospace' }}>{asset.serialWrapper}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Purchase Date</label>
                                <div style={{ fontSize: '16px', fontWeight: 500 }}>{asset.purchaseDate || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <History size={18} color="var(--primary)" /> Maintenance Log
                        </h3>
                        {/* Static log for UI demonstration, could be linked to another collection in real usage */}
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>System Registration</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{asset.purchaseDate}</div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#10b981' }}>Completed</div>
                            </div>
                        </div>
                        <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                            Detailed maintenance tracking service is coming soon.
                        </p>
                    </div>

                    {asset.status === 'Maintenance' && (
                        <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', display: 'flex', gap: '12px' }}>
                            <AlertTriangle size={24} />
                            <div>
                                <div style={{ fontWeight: 600 }}>Maintenance Required</div>
                                <div style={{ fontSize: '14px' }}>This asset is currently in maintenance mode. Please update status once resolved.</div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AssetDetails;
