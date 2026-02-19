import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Trash2, Edit, PackageCheck, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { materialService, MaterialPurchase } from '../services/materialService';
import { showToast, showConfirm } from '../components/Toast';

const Materials = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState<MaterialPurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await materialService.getAll();
            setPurchases(data);
        } catch (error) {
            console.error("Failed to fetch materials", error);
            showToast("Failed to load material purchases", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        showConfirm("Are you sure you want to delete this purchase record?", async () => {
            try {
                await materialService.delete(id);
                showToast("Record deleted successfully", "success");
                fetchData();
            } catch (error) {
                showToast("Failed to delete record", "error");
            }
        });
    };



    const filteredPurchases = purchases.filter(p =>
        p.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCredit = filteredPurchases.filter(p => p.paymentType === 'Credit').reduce((sum, p) => sum + Number(p.totalCost), 0);
    const totalDebit = filteredPurchases.filter(p => p.paymentType === 'Debit').reduce((sum, p) => sum + Number(p.totalCost), 0);
    const totalSpend = totalCredit + totalDebit;

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <Header
                title="Material Purchases"
                subtitle="Track raw material acquisitions and costs."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {/* Summary Cards */}
            <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '32px' }}>
                <div className="glass card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Spend</p>
                    <h3 style={{ fontSize: '28px', marginTop: '8px', color: 'white' }}>${totalSpend.toLocaleString()}</h3>
                </div>
                <div className="glass card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Paid (Debit)</p>
                    <h3 style={{ fontSize: '28px', marginTop: '8px', color: '#10b981' }}>${totalDebit.toLocaleString()}</h3>
                </div>
                <div className="glass card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Credit Due</p>
                    <h3 style={{ fontSize: '28px', marginTop: '8px', color: '#f59e0b' }}>${totalCredit.toLocaleString()}</h3>
                </div>
            </div>

            <div className="glass card">
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Filters could go here */}
                    </div>
                    <button
                        onClick={() => navigate('/materials/add')}
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
                        <Plus size={18} /> Record Purchase
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Item Name</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Supplier</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Purchased / Cost</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Stock Status</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Payment</th>
                                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</td></tr>
                            ) : filteredPurchases.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No purchases recorded.</td></tr>
                            ) : (
                                filteredPurchases.map((p) => {
                                    const inStock = p.quantity - (p.usedQuantity || 0);
                                    const stockPercentage = (inStock / p.quantity) * 100;
                                    let stockColor = '#10b981'; // Green
                                    let stockStatus = 'In Stock';

                                    if (inStock === 0) {
                                        stockColor = '#ef4444'; // Red
                                        stockStatus = 'Out of Stock';
                                    } else if (stockPercentage < 25) {
                                        stockColor = '#f59e0b'; // Amber
                                        stockStatus = 'Low Stock';
                                    }


                                    return (
                                        <tr
                                            key={p.id}
                                            className={`clickable-row ${p.paymentType === 'Credit' ? 'blink-row' : ''}`}
                                            onClick={() => navigate(`/materials/view/${p.id}`)}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                        >
                                            <td style={{ padding: '16px', fontWeight: 500 }}>{p.item}</td>
                                            <td style={{ padding: '16px', color: 'white', fontWeight: 500 }}>{p.supplier}</td>
                                            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{p.date}</td>
                                            <td style={{ padding: '16px' }}>
                                                <div>{p.quantity} {p.unit}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${p.totalCost.toFixed(2)}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: stockColor }}>
                                                        {inStock} {p.unit}
                                                    </div>
                                                    <span style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background: `${stockColor}15`,
                                                        color: stockColor,
                                                        border: `1px solid ${stockColor}40`
                                                    }}>
                                                        {stockStatus}
                                                    </span>
                                                </div>
                                                {(p.usedQuantity || 0) > 0 && (
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        Used: {p.usedQuantity} {p.unit}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        background: p.paymentType === 'Debit' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                        color: p.paymentType === 'Debit' ? '#10b981' : '#f59e0b',
                                                        border: `1px solid ${p.paymentType === 'Debit' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                                    }}
                                                >
                                                    {p.paymentType}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button onClick={() => navigate(`/materials/edit/${p.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => p.id && handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
                @keyframes blink-row {
                    0% { background-color: rgba(255, 255, 255, 0.02); }
                    50% { background-color: rgba(245, 158, 11, 0.15); } 
                    100% { background-color: rgba(255, 255, 255, 0.02); }
                }
                .blink-row {
                    animation: blink-row 2s infinite ease-in-out;
                    border-left: 3px solid #f59e0b;
                }
            `}</style>
        </div>
    );
};

export default Materials;
