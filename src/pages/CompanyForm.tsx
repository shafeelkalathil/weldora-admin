import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, Star } from 'lucide-react';
import Header from '../components/Header';
import { companyService, Company } from '../services/companyService';
import { showToast } from '../components/Toast';

import { storageService } from '../services/storageService';

const CompanyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false); // Track upload state
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        rating: 5,
        review: '',
        logoUrl: '',
        photos: [] as string[],
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchCompany(id);
        }
    }, [id, isEdit]);

    const fetchCompany = async (companyId: string) => {
        try {
            const companies = await companyService.getAll();
            const company = companies.find(c => c.id === companyId);
            if (company) {
                setFormData({
                    name: company.name,
                    phone: company.phone,
                    email: company.email || '',
                    address: company.address || '',
                    rating: company.rating,
                    review: company.review || '',
                    logoUrl: company.logoUrl || '',
                    photos: company.photos || [],
                });
                if (company.logoUrl) {
                    setLogoPreview(company.logoUrl);
                }
                if (company.photos && company.photos.length > 0) {
                    setPhotoPreviews(company.photos);
                }
            }
        } catch (error) {
            console.error('Failed to fetch company', error);
            showToast('Failed to load company', 'error');
        }
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setUploading(true);
                showToast("Uploading logo...", "info");
                const url = await storageService.uploadImage(file, 'company/logos');
                setLogoPreview(url);
                setFormData(prev => ({ ...prev, logoUrl: url }));
                showToast("Logo uploaded successfully", "success");
            } catch (err: any) {
                console.error("Error processing logo", err);
                showToast(`Error uploading logo: ${err.message || "Unknown error"}`, "error");
            } finally {
                setUploading(false);
            }
        }
        e.target.value = '';
    };

    const handlePhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        e.target.value = '';

        try {
            setUploading(true);
            showToast(`Uploading ${files.length} photos...`, "info");

            const uploadPromises = files.map(file => storageService.uploadImage(file, 'company/photos'));
            const newUrls = await Promise.all(uploadPromises);

            setPhotoPreviews(prev => [...prev, ...newUrls]);
            setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newUrls] }));
            showToast("Photos uploaded successfully", "success");
        } catch (err: any) {
            console.error("Error processing photos", err);
            showToast(`Error uploading photos: ${err.message || "Unknown error"}`, "error");
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (index: number) => {
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const removeLogo = () => {
        setLogoPreview('');
        setFormData(prev => ({ ...prev, logoUrl: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setLoading(true);

            const companyData = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                address: formData.address || undefined,
                rating: formData.rating,
                review: formData.review || undefined,
                logoUrl: formData.logoUrl || undefined,
                photos: formData.photos,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (isEdit && id) {
                await companyService.update(id, companyData);
                showToast('Company updated successfully', 'success');
            } else {
                await companyService.add(companyData);
                showToast('Company created successfully', 'success');
            }

            navigate('/companies');
        } catch (error) {
            console.error('Failed to save company', error);
            showToast('Failed to save company', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
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
                    title={isEdit ? 'Edit Company' : 'New Company'}
                    subtitle={isEdit ? 'Update company details' : 'Add a new partner company or shop'}
                    showSearch={false}
                    showNotifications={false}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Main Form */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>Company Information</h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                    Company Name <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Phone <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
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

                                <div>
                                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
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

                            <div>
                                <label htmlFor="address" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
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

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '8px' }}>
                                <h4 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Rating & Review</h4>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500 }}>
                                        Rating
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={32}
                                                fill={star <= formData.rating ? '#fbbf24' : 'none'}
                                                color={star <= formData.rating ? '#fbbf24' : '#6b7280'}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                            />
                                        ))}
                                        <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: 600 }}>
                                            {formData.rating}.0
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="review" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Review / Comments
                                    </label>
                                    <textarea
                                        id="review"
                                        name="review"
                                        value={formData.review}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Add your review or comments about this company..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Logo & Photos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Company Logo */}
                        <div className="glass card">
                            <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>Company Logo</h3>

                            {logoPreview ? (
                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        style={{
                                            width: '100%',
                                            height: '180px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: '#ef4444',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '180px',
                                    border: '2px dashed var(--border)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <Upload size={32} color="var(--text-muted)" />
                                </div>
                            )}

                            <label htmlFor="logo" style={{
                                display: 'block',
                                padding: '10px',
                                textAlign: 'center',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500
                            }}>
                                {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                <input
                                    type="file"
                                    id="logo"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {/* Photos */}
                        <div className="glass card">
                            <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>Gallery Photos</h3>

                            {photoPreviews.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '8px',
                                    marginBottom: '16px'
                                }}>
                                    {photoPreviews.map((preview, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img
                                                src={preview}
                                                alt={`Photo ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: '#ef4444',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '22px',
                                                    height: '22px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'white'
                                                }}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label htmlFor="photos" style={{
                                display: 'block',
                                padding: '10px',
                                textAlign: 'center',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500
                            }}>
                                Add Photos
                                <input
                                    type="file"
                                    id="photos"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotosChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/companies')}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    cursor: (loading || uploading) ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
                                    opacity: (loading || uploading) ? 0.6 : 1
                                }}
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : uploading ? 'Uploading...' : isEdit ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CompanyForm;
