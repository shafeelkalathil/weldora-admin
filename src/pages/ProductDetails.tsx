import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Package, Tag, DollarSign, Activity, Database, History, TrendingUp, AlertCircle, Printer, PlusSquare, Trash2, Settings } from 'lucide-react';
import Header from '../components/Header';
import { productService, Product } from '../services/productService';
import { showToast } from '../components/Toast';

const ProductDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const fetchProductDetails = async (productId: string) => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            const item = data.find(p => p.id === productId);
            if (item) {
                setProduct(item);
            } else {
                showToast("Product not found", "error");
                navigate('/products');
            }
        } catch (error) {
            console.error("Failed to fetch product details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading product data...</div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
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
                        title={product.name}
                        subtitle={`SKU: ${product.sku} | Category: ${product.category}`}
                        showSearch={false}
                        showNotifications={false}
                    />
                </div>
                <Link
                    to={`/products/edit/${product.id}`}
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
                    <Edit size={18} /> Edit Product
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>

                {/* Stats Bar */}
                {/* Stats Group 1 (Aligns with Main Content) */}
                <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div className="glass card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <DollarSign size={14} /> Unit Price
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>${product.price.toFixed(2)}</div>
                    </div>
                    <div className="glass card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Activity size={14} /> Stock Level
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: product.stock < 10 ? '#ef4444' : 'inherit' }}>
                            {product.stock} Units
                        </div>
                    </div>
                    <div className="glass card" style={{ padding: '24px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingUp size={14} /> Total Sales
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>124 Items</div>
                    </div>
                </div>

                {/* Stats Group 2 (Aligns with Sidebar) */}
                <div style={{ gridColumn: 'span 4' }}>
                    <div className="glass card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={14} /> Status
                        </div>
                        <div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                display: 'inline-block',
                                background: product.status === 'In Stock' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: product.status === 'In Stock' ? '#10b981' : '#ef4444'
                            }}>
                                {product.status}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div style={{ gridColumn: 'span 8' }}>
                    <div className="glass card" style={{ padding: '32px', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={18} color="var(--primary)" /> Product Overview
                        </h3>

                        {/* Image Gallery */}
                        {product.images && product.images.length > 0 && (
                            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                <div style={{ gridColumn: 'span 4' }}>
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                {product.images.slice(1, 5).map((img: string, i: number) => (
                                    <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img src={img} alt={`${product.name} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                        <p style={{ color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '32px' }}>
                            {product.description || `This premium ${product.name} is part of our ${product.category} collection. It has been manufactured with high-quality materials ensuring durability and aesthetics for modern industrial workspaces.`}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Specifications</h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Material</span>
                                        <span style={{ fontWeight: 500 }}>{product.material || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Weight</span>
                                        <span style={{ fontWeight: 500 }}>{product.weight || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Dimensions</span>
                                        <span style={{ fontWeight: 500 }}>{product.dimensions || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Inventory Details</h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>SKU Number</span>
                                        <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{product.sku}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Storage Zone</span>
                                        <span style={{ fontWeight: 500 }}>{product.storageLocation || 'Unassigned'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Last Restocked</span>
                                        <span style={{ fontWeight: 500 }}>Oct 24, 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Sidebar */}
                <div style={{ gridColumn: 'span 4' }}>
                    <div className="glass card" style={{ padding: '32px', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Storage Info</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                            <Database size={24} color="var(--primary)" />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>Bin Location</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.storageLocation || 'Aisle 4, Row 2, Bin 109'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <History size={18} color="var(--primary)" /> Stock History (Last 30 Days)
                        </h3>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0' }}>
                            {[45, 60, 55, 70, 65, 80, 75, 90, 85, 95, 88, 70].map((h, i) => (
                                <div key={i} style={{
                                    flex: 1,
                                    height: `${h}%`,
                                    background: 'rgba(99, 102, 241, 0.4)',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s'
                                }} title={`${h} Units`}></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <span>30 days ago</span>
                            <span>Today</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetails;
