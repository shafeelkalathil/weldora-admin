import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Wrench, Ruler, Calculator, DollarSign, Calendar, Hash, Shield, Settings, Image, Trash2, Plus } from 'lucide-react';
import Header from '../components/Header';
import { assetService, Asset } from '../services/assetService';
import { showToast } from '../components/Toast';

import { storageService } from '../services/storageService';

const AssetForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [asset, setAsset] = useState<Omit<Asset, 'id'>>({
        name: '',
        type: 'Machinery',
        serialWrapper: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        manufacturer: '',
        modelYear: new Date().getFullYear().toString(),
        status: 'Operational',
        value: 0,
        maintenanceDue: '',
        insuranceProvider: '',
        insurancePolicyExp: '',
        images: [] as string[]
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchAsset(id);
        }
    }, [id, isEdit]);

    const fetchAsset = async (assetId: string) => {
        try {
            const data = await assetService.getAll();
            const item = data.find(a => a.id === assetId);
            if (item) {
                setAsset({
                    name: item.name,
                    type: item.type,
                    serialWrapper: item.serialWrapper,
                    purchaseDate: item.purchaseDate,
                    manufacturer: item.manufacturer || '',
                    modelYear: item.modelYear || '',
                    status: item.status,
                    value: item.value,
                    maintenanceDue: item.maintenanceDue || '',
                    insuranceProvider: item.insuranceProvider || '',
                    insurancePolicyExp: item.insurancePolicyExp || '',
                    images: item.images || []
                });
            } else {
                showToast("Asset not found", "error");
                navigate('/assets');
            }
        } catch (error) {
            console.error("Failed to fetch asset details", error);
            showToast("Error loading asset details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!asset.name || !asset.serialWrapper || !asset.value) {
            showToast("Please fill in required fields (Name, Serial, Value)", "error");
            return;
        }

        try {
            setSaving(true);
            if (isEdit && id) {
                await assetService.update(id, asset);
                showToast("Asset updated successfully", "success");
            } else {
                await assetService.add(asset);
                showToast("Asset registered successfully", "success");
            }
            navigate('/assets');
        } catch (error) {
            console.error("Failed to save asset", error);
            showToast("Error saving asset", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading asset details...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
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
                    title={isEdit ? "Edit Asset" : "Add New Asset"}
                    subtitle={isEdit ? `Updating ${asset.name}` : "Register a new company asset."}
                />
            </div>

            <form onSubmit={handleSave} className="glass card" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>

                    {/* Asset Images */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <Image size={18} /> Asset Gallery
                        </h3>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
                            {(asset.images || []).map((img, index) => (
                                <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src={img} alt={`Asset ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...(asset.images || [])];
                                            newImages.splice(index, 1);
                                            setAsset({ ...asset, images: newImages });
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            border: 'none',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <div
                                onClick={() => document.getElementById('asset-images-upload')?.click()}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: '8px',
                                    border: '2px dashed var(--border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.2s',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                <Plus size={24} style={{ marginBottom: '8px' }} />
                                <span style={{ fontSize: '12px' }}>Add Photos</span>
                            </div>
                        </div>
                        <input
                            id="asset-images-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                if (e.target.files) {
                                    const files = Array.from(e.target.files);
                                    if (files.length === 0) return;

                                    try {
                                        setUploading(true);
                                        showToast(`Uploading ${files.length} photos...`, "info");

                                        const uploadPromises = files.map(file => storageService.uploadImage(file, 'assets'));
                                        const newImages = await Promise.all(uploadPromises);

                                        setAsset(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
                                        showToast("Photos uploaded successfully", "success");
                                    } catch (error) {
                                        console.error("Error uploading photos:", error);
                                        showToast("Error uploading photos", "error");
                                    } finally {
                                        setUploading(false);
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Basic Information */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <Wrench size={18} /> Basic Information
                        </h3>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Asset Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            value={asset.name}
                            onChange={(e) => setAsset({ ...asset, name: e.target.value })}
                            placeholder="e.g. CNC Cutting Machine"
                        />
                    </div>

                    <div>
                        <label className="form-label">Category</label>
                        <select
                            className="form-input"
                            value={asset.type}
                            onChange={(e) => setAsset({ ...asset, type: e.target.value as any })}
                        >
                            <option value="Machinery">Machinery</option>
                            <option value="Tools">Tools</option>
                            <option value="IT Equipment">IT Equipment</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Serial / ID Number *</label>
                        <div style={{ position: 'relative' }}>
                            <Hash size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '40px' }}
                                required
                                value={asset.serialWrapper}
                                onChange={(e) => setAsset({ ...asset, serialWrapper: e.target.value })}
                                placeholder="SN-123456"
                            />
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <Settings size={18} /> Technical & Manufacturing
                        </h3>
                    </div>

                    <div>
                        <label className="form-label">Manufacturer</label>
                        <input
                            type="text"
                            className="form-input"
                            value={asset.manufacturer}
                            onChange={(e) => setAsset({ ...asset, manufacturer: e.target.value })}
                            placeholder="e.g. Industrial Corp"
                        />
                    </div>

                    <div>
                        <label className="form-label">Model Year</label>
                        <input
                            type="number"
                            className="form-input"
                            value={asset.modelYear}
                            onChange={(e) => setAsset({ ...asset, modelYear: e.target.value })}
                            placeholder="2023"
                        />
                    </div>

                    <div>
                        <label className="form-label">Purchase Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={asset.purchaseDate}
                            onChange={(e) => setAsset({ ...asset, purchaseDate: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Maintenance Due Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={asset.maintenanceDue}
                            onChange={(e) => setAsset({ ...asset, maintenanceDue: e.target.value })}
                        />
                    </div>

                    {/* Financial & Status */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <DollarSign size={18} /> Financial & Status
                        </h3>
                    </div>

                    <div>
                        <label className="form-label">Asset Value ($) *</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="number"
                                className="form-input"
                                style={{ paddingLeft: '40px' }}
                                required
                                value={asset.value || ''}
                                onChange={(e) => setAsset({ ...asset, value: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Status</label>
                        <select
                            className="form-input"
                            value={asset.status}
                            onChange={(e) => setAsset({ ...asset, status: e.target.value as any })}
                        >
                            <option value="Operational">Operational</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Retired">Retired</option>
                        </select>
                    </div>

                    {/* Insurance Information */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <Shield size={18} /> Insurance Information
                        </h3>
                    </div>

                    <div>
                        <label className="form-label">Insurance Provider</label>
                        <input
                            type="text"
                            className="form-input"
                            value={asset.insuranceProvider}
                            onChange={(e) => setAsset({ ...asset, insuranceProvider: e.target.value })}
                            placeholder="e.g. Weldora Secure"
                        />
                    </div>

                    <div>
                        <label className="form-label">Policy Expiry Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={asset.insurancePolicyExp}
                            onChange={(e) => setAsset({ ...asset, insurancePolicyExp: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/assets')}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="btn-submit"
                    >
                        {saving ? 'Saving...' : uploading ? 'Uploading...' : <><Save size={18} /> {isEdit ? 'Update Asset' : 'Register Asset'}</>}
                    </button>
                </div>
            </form>
            <style>{`
                .form-label { display: block; margin-bottom: 8px; color: var(--text-muted); fontSize: 14px; }
                .form-input { width: 100%; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: white; outline: none; transition: all 0.2s; }
                .form-input:focus { border-color: var(--primary); background: rgba(255,255,255,0.1); }
                .form-actions { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 16px; }
                .btn-cancel { padding: 12px 24px; border-radius: 12px; background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border); cursor: pointer; font-weight: 500; transition: all 0.2s; }
                .btn-cancel:hover { background: rgba(255,255,255,0.1); }
                .btn-submit { padding: 12px 32px; border-radius: 12px; background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
                .btn-submit:hover { filter: brightness(1.1); }
                .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default AssetForm;
