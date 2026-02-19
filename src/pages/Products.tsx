import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, Edit, Trash2, Eye } from 'lucide-react';
import Header from '../components/Header';
import { productService, Product } from '../services/productService';
import { showToast, showConfirm } from '../components/Toast';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
            showToast("Failed to fetch products", "error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock': return '#10b981'; // Green
            case 'Out of Stock': return '#ef4444'; // Red
            case 'Low Stock': return '#f59e0b'; // Amber
            default: return 'var(--text-muted)';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'In Stock': return 'rgba(16, 185, 129, 0.2)';
            case 'Out of Stock': return 'rgba(239, 68, 68, 0.2)';
            case 'Low Stock': return 'rgba(245, 158, 11, 0.2)';
            default: return 'rgba(255,255,255,0.05)';
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (product: Product) => {
        navigate(`/products/edit/${product.id}`);
    };

    const handleDelete = (id: string) => {
        showConfirm("Are you sure you want to delete this product? This will remove it from the catalog.", async () => {
            try {
                await productService.delete(id);
                showToast("Product deleted successfully", "success");
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product", error);
                showToast("Failed to delete product", "error");
            }
        });
    };

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <Header
                title="Product Management"
                subtitle="Manage your product catalog and inventory."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="glass card">
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                        {/* Search moved to Header */}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/products/add')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <Plus size={18} /> Add Product
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Product Name</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>SKU</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Price</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Stock</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="clickable-row"
                                        onClick={() => navigate(`/products/view/${product.id}`)}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{product.category}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{product.sku}</td>
                                        <td style={{ padding: '16px' }}>${product.price.toFixed(2)}</td>
                                        <td style={{ padding: '16px' }}>{product.stock}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                background: getStatusBg(product.status),
                                                color: getStatusColor(product.status)
                                            }}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/products/view/${product.id}`); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(product.id!); }}
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

export default Products;
