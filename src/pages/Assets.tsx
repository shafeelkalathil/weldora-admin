import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calculator, Ruler, Wrench, AlertTriangle, Plus, Edit, Trash2, Eye, Monitor, Package } from 'lucide-react';
import Header from '../components/Header';
import { assetService, Asset } from '../services/assetService';
import { showToast, showConfirm } from '../components/Toast';

const Assets = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const data = await assetService.getAll();
            setAssets(data);
        } catch (error) {
            console.error("Failed to fetch assets", error);
            showToast("Failed to fetch assets", "error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Operational': return '#10b981';
            case 'Maintenance': return '#f59e0b';
            case 'Retired': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Machinery': return <Wrench size={16} />;
            case 'Tools': return <Ruler size={16} />;
            case 'IT Equipment': return <Monitor size={16} />;
            case 'Other': return <Package size={16} />;
            default: return <Package size={16} />;
        }
    };

    const handleEdit = (asset: Asset) => {
        navigate(`/assets/edit/${asset.id}`);
    };

    const handleDelete = (id: string) => {
        showConfirm("Are you sure you want to delete this asset? This action is permanent and will remove maintenance history.", async () => {
            try {
                await assetService.delete(id);
                showToast("Asset deleted successfully", "success");
                fetchAssets();
            } catch (error) {
                console.error("Error deleting asset", error);
                showToast("Failed to delete asset", "error");
            }
        });
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialWrapper.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <Header
                title="Asset Management"
                subtitle="Track company equipment, maintenance, and depreciation."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="grid-dashboard" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="glass card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Asset Value</p>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>${assets.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}</h3>
                </div>
                <div className="glass card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Operational</p>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: '#10b981' }}>{assets.filter(a => a.status === 'Operational').length}</h3>
                </div>
                <div className="glass card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>In Maintenance</p>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: '#f59e0b' }}>{assets.filter(a => a.status === 'Maintenance').length}</h3>
                </div>
                <div className="glass card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Retired</p>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: '#ef4444' }}>{assets.filter(a => a.status === 'Retired').length}</h3>
                </div>
            </div>

            <div className="glass card">
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
                        {/* Search moved to Header */}
                    </div>
                    <button
                        onClick={() => navigate('/assets/add')}
                        style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}
                    >
                        <Plus size={18} /> Add Asset
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Asset Name</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Serial / ID</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Value</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Maintenance Due</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading assets...</td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No assets found. Add one to track your equipment.</td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <tr
                                        key={asset.id}
                                        className="clickable-row"
                                        onClick={() => navigate(`/assets/view/${asset.id}`)}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {asset.images && asset.images.length > 0 ? (
                                                        <img src={asset.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}>{getTypeIcon(asset.type)}</span>
                                                    )}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{asset.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{getTypeIcon(asset.type)}</span>
                                                {asset.type}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{asset.serialWrapper}</td>
                                        <td style={{ padding: '16px' }}>${asset.value.toLocaleString()}</td>
                                        <td style={{ padding: '16px' }}>
                                            {asset.maintenanceDue}
                                            {asset.status === 'Maintenance' && <span style={{ marginLeft: '8px', color: '#f59e0b' }}><AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                                                background: `rgba(${asset.status === 'Operational' ? '16, 185, 129' : (asset.status === 'Maintenance' ? '245, 158, 11' : '239, 68, 68')}, 0.2)`,
                                                color: getStatusColor(asset.status)
                                            }}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/assets/view/${asset.id}`); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                                    title="View Technical Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(asset); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(asset.id!); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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

export default Assets;
