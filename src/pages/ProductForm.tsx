import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Package, Tag, DollarSign, Database, Activity, FileText, Settings, MapPin, Image, Trash2, Plus } from 'lucide-react';
import Header from '../components/Header';
import { productService, Product } from '../services/productService';
import { showToast } from '../components/Toast';

import { storageService } from '../services/storageService';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [product, setProduct] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        sku: '',
        status: 'In Stock',
        description: '',
        material: '',
        weight: '',
        dimensions: '',
        storageLocation: '',
        images: [] as string[]
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchProduct(id);
        }
    }, [id, isEdit]);

    const fetchProduct = async (productId: string) => {
        try {
            const data = await productService.getAll();
            const item = data.find(p => p.id === productId);
            if (item) {
                setProduct({
                    name: item.name,
                    category: item.category,
                    price: item.price.toString(),
                    stock: item.stock.toString(),
                    sku: item.sku,
                    status: item.status,
                    description: item.description || '',
                    material: item.material || '',
                    weight: item.weight || '',
                    dimensions: item.dimensions || '',
                    storageLocation: item.storageLocation || '',
                    images: item.images || []
                });
            } else {
                showToast("Product not found", "error");
                navigate('/products');
            }
        } catch (error) {
            console.error("Failed to fetch product details", error);
            showToast("Error loading product details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product.name || !product.price || !product.stock || !product.sku) {
            showToast("Please fill in required fields (Name, Price, Stock, SKU)", "error");
            return;
        }

        try {
            setSaving(true);
            const productData = {
                name: product.name,
                category: product.category,
                price: parseFloat(product.price) || 0,
                stock: parseInt(product.stock) || 0,
                sku: product.sku,
                status: product.status,
                description: product.description,
                material: product.material,
                weight: product.weight,
                dimensions: product.dimensions,
                storageLocation: product.storageLocation,
                images: product.images
            };

            if (isEdit && id) {
                await productService.update(id, productData);
                showToast("Product updated successfully", "success");
            } else {
                await productService.add(productData);
                showToast("Product created successfully", "success");
            }
            navigate('/products');
        } catch (error) {
            console.error("Failed to save product", error);
            showToast("Error saving product", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading product details...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/products')}
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
                    <ChevronLeft size={20} /> Back to Products
                </button>
                <Header
                    title={isEdit ? "Edit Product" : "Add New Product"}
                    subtitle={isEdit ? `Updating ${product.name}` : "Add a new item to your inventory."}
                />
            </div>

            <form onSubmit={handleSave} className="glass card" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>

                    {/* Product Images */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <h3 className="section-title"><Image size={18} /> Product Gallery</h3>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
                            {product.images.map((img, index) => (
                                <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src={img} alt={`Product ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...product.images];
                                            newImages.splice(index, 1);
                                            setProduct({ ...product, images: newImages });
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
                                onClick={() => document.getElementById('product-images-upload')?.click()}
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
                            id="product-images-upload"
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
                                        showToast(`Uploading ${files.length} images...`, "info");

                                        const uploadPromises = files.map(file => storageService.uploadImage(file, 'products'));
                                        const newImages = await Promise.all(uploadPromises);

                                        setProduct(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
                                        showToast("Images uploaded successfully", "success");
                                    } catch (error) {
                                        console.error("Error uploading images:", error);
                                        showToast("Error uploading images", "error");
                                    } finally {
                                        setUploading(false);
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Basic Information */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <h3 className="section-title"><Package size={18} /> Basic Information</h3>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Product Name *</label>
                        <input
                            type="text"
                            required
                            className="form-input"
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Category</label>
                        <div style={{ position: 'relative' }}>
                            <Tag size={16} className="input-icon" />
                            <select
                                className="form-input icon-input"
                                value={product.category}
                                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                                style={{ appearance: 'none' }} // helpful to fix padding with icon
                            >
                                <option value="" disabled>Select Category</option>
                                {['All', 'Furniture', 'Decor', 'Shop Display'].map((cat) => (
                                    <option key={cat} value={cat} style={{ color: 'black' }}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">SKU (Stock Keeping Unit) *</label>
                        <div style={{ position: 'relative' }}>
                            <Database size={16} className="input-icon" />
                            <input
                                type="text"
                                required
                                className="form-input icon-input"
                                value={product.sku}
                                onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Description</label>
                        <div style={{ position: 'relative' }}>
                            <FileText size={16} className="input-icon" style={{ top: '20px' }} />
                            <textarea
                                className="form-input icon-input"
                                style={{ minHeight: '100px', paddingTop: '12px' }}
                                value={product.description}
                                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Technical Specs */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                        <h3 className="section-title"><Settings size={18} /> Specifications & Storage</h3>
                    </div>

                    <div>
                        <label className="form-label">Material</label>
                        <input
                            type="text"
                            className="form-input"
                            value={product.material}
                            onChange={(e) => setProduct({ ...product, material: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Weight</label>
                        <input
                            type="text"
                            className="form-input"
                            value={product.weight}
                            onChange={(e) => setProduct({ ...product, weight: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Dimensions</label>
                        <input
                            type="text"
                            className="form-input"
                            value={product.dimensions}
                            onChange={(e) => setProduct({ ...product, dimensions: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">Storage Location</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} className="input-icon" />
                            <input
                                type="text"
                                className="form-input icon-input"
                                value={product.storageLocation}
                                onChange={(e) => setProduct({ ...product, storageLocation: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Inventory & Pricing */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                        <h3 className="section-title"><DollarSign size={18} /> Inventory & Pricing</h3>
                    </div>

                    <div>
                        <label className="form-label">Unit Price ($) *</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} className="input-icon" />
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="form-input icon-input"
                                value={product.price}
                                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Stock Quantity *</label>
                        <div style={{ position: 'relative' }}>
                            <Activity size={16} className="input-icon" />
                            <input
                                type="number"
                                required
                                className="form-input icon-input"
                                value={product.stock}
                                onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Stock Status</label>
                        <select
                            className="form-input"
                            value={product.status}
                            onChange={(e) => setProduct({ ...product, status: e.target.value })}
                        >
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="btn-submit"
                    >
                        {saving ? 'Saving...' : uploading ? 'Uploading...' : <><Save size={18} /> {isEdit ? 'Update Product' : 'Create Product'}</>}
                    </button>
                </div>
            </form>
            <style>{`
                .section-title { fontSize: 18px; marginBottom: 20px; display: flex; alignItems: center; gap: 8px; color: var(--primary); }
                .form-label { display: block; marginBottom: 8px; color: var(--text-muted); fontSize: 14px; }
                .form-input { width: 100%; padding: 12px; borderRadius: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: white; outline: none; transition: all 0.2s; }
                .form-input:focus { border-color: var(--primary); background: rgba(255,255,255,0.1); }
                .icon-input { paddingLeft: 40px !important; }
                .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .form-actions { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 16px; }
                .btn-cancel { padding: 12px 24px; border-radius: 12px; background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border); cursor: pointer; font-weight: 500; transition: all 0.2s; }
                .btn-submit { padding: 12px 32px; border-radius: 12px; background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
                .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default ProductForm;
