import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit, Truck, DollarSign, Package, AlertTriangle, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import { materialService, MaterialPurchase } from '../services/materialService';
import { showToast } from '../components/Toast';

const MaterialDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [material, setMaterial] = useState<MaterialPurchase | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (materialId: string) => {
        try {
            setLoading(true);
            const data = await materialService.getAll();
            const found = data.find(m => m.id === materialId);

            if (found) {
                setMaterial(found);
            } else {
                showToast("Material not found", "error");
                navigate('/materials');
            }
        } catch (error) {
            console.error("Failed to fetch material", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading material details...</div>
            </div>
        );
    }

    if (!material) return null;

    const inStock = material.quantity - (material.usedQuantity || 0);
    const stockPercentage = (inStock / material.quantity) * 100;
    const usagePercentage = ((material.usedQuantity || 0) / material.quantity) * 100;

    let stockColor = '#10b981';
    let stockStatus = 'In Stock';

    if (inStock === 0) {
        stockColor = '#ef4444';
        stockStatus = 'Out of Stock';
    } else if (stockPercentage < 25) {
        stockColor = '#f59e0b';
        stockStatus = 'Low Stock';
    }

    const costPerUnit = material.totalCost / material.quantity;
    const valueRemaining = costPerUnit * inStock;
    const valueConsumed = costPerUnit * (material.usedQuantity || 0);

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/materials')}
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
                    <ChevronLeft size={20} /> Back to Materials
                </button>
                <div className="flex-between">
                    <Header
                        title={material.item}
                        subtitle="Material Purchase Details & Stock Information"
                        showSearch={false}
                        showNotifications={false}
                    />
                    <button
                        onClick={() => navigate(`/materials/edit/${id}`)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        <Edit size={18} /> Edit Material
                    </button>
                </div>
            </div>

            {/* Stock Alert */}
            {stockPercentage < 25 && (
                <div className={inStock === 0 ? 'animate-pulse' : ''} style={{
                    marginBottom: '32px',
                    padding: '24px',
                    borderRadius: '16px',
                    background: `${stockColor}15`,
                    border: `1px solid ${stockColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: stockColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={24} color="white" />
                    </div>
                    <div>
                        <h3 style={{ color: stockColor, fontSize: '18px', marginBottom: '4px' }}>
                            {inStock === 0 ? 'Out of Stock' : 'Low Stock Alert'}
                        </h3>
                        <p style={{ color: `${stockColor}99`, fontSize: '14px' }}>
                            {inStock === 0
                                ? 'This material is completely depleted. Reorder immediately.'
                                : `Only ${Math.round(stockPercentage)}% remaining. Consider reordering soon.`}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                {/* Left Column - Basic Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass card">
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Material Information</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Supplier</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck size={16} color="var(--primary)" />
                                <span style={{ fontWeight: 600 }}>{material.supplier}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Purchase Date</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={16} color="var(--primary)" />
                                <span style={{ fontWeight: 600 }}>{material.date}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Payment Type</div>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: material.paymentType === 'Debit' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: material.paymentType === 'Debit' ? '#10b981' : '#f59e0b',
                                border: `1px solid ${material.paymentType === 'Debit' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                            }}>
                                {material.paymentType} {material.paymentType === 'Debit' ? '(Paid)' : '(Due)'}
                            </span>
                        </div>

                        {material.notes && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Notes</div>
                                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{material.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Financial Summary */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Financial Summary</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Investment</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>${material.totalCost.toLocaleString()}</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cost per {material.unit}</div>
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>${costPerUnit.toFixed(2)}</div>
                        </div>

                        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Value Consumed</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>${valueConsumed.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Value Remaining</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>${valueRemaining.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Stock Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Stock Status Card */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>Stock Status</h3>

                        {/* Large Stock Display */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '48px', fontWeight: 700, color: stockColor, marginBottom: '8px' }}>
                                {inStock} {material.unit}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: 600,
                                background: `${stockColor}20`,
                                color: stockColor,
                                border: `2px solid ${stockColor}`
                            }}>
                                {stockStatus}
                            </div>
                        </div>

                        {/* Progress Breakdown */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Stock Remaining</span>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>{Math.round(stockPercentage)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.min(stockPercentage, 100)}%`,
                                    height: '100%',
                                    background: stockColor,
                                    transition: 'width 0.5s'
                                }} />
                            </div>
                        </div>

                        {/* Stock Breakdown Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Package size={16} color="#6366f1" />
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Purchased</span>
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#6366f1' }}>
                                    {material.quantity}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{material.unit}</div>
                            </div>

                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <TrendingDown size={16} color="#f59e0b" />
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Used</span>
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                                    {material.usedQuantity || 0}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {usagePercentage.toFixed(1)}% consumed
                                </div>
                            </div>

                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: `${stockColor}15`,
                                border: `1px solid ${stockColor}40`,
                                gridColumn: 'span 2'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <TrendingUp size={16} color={stockColor} />
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available</span>
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: stockColor }}>
                                    {inStock} {material.unit}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Ready for production
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage Analytics */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Usage Analytics</h3>

                        {/* Pie Chart Visualization */}
                        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 24px' }}>
                            <svg width="200" height="200" viewBox="0 0 200 200">
                                {/* Background circle */}
                                <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.05)" />

                                {/* Used segment */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="80"
                                    fill="transparent"
                                    stroke="#f59e0b"
                                    strokeWidth="40"
                                    strokeDasharray={`${usagePercentage * 5.03} ${(100 - usagePercentage) * 5.03}`}
                                    transform="rotate(-90 100 100)"
                                />

                                {/* Remaining segment */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="80"
                                    fill="transparent"
                                    stroke={stockColor}
                                    strokeWidth="40"
                                    strokeDasharray={`${stockPercentage * 5.03} ${(100 - stockPercentage) * 5.03}`}
                                    strokeDashoffset={`${usagePercentage * -5.03}`}
                                    transform="rotate(-90 100 100)"
                                />

                                {/* Center text */}
                                <text x="100" y="95" textAnchor="middle" fill="white" fontSize="24" fontWeight="700">
                                    {Math.round(stockPercentage)}%
                                </text>
                                <text x="100" y="115" textAnchor="middle" fill="var(--text-muted)" fontSize="12">
                                    Remaining
                                </text>
                            </svg>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: stockColor }} />
                                <span style={{ fontSize: '13px' }}>In Stock ({inStock} {material.unit})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                                <span style={{ fontSize: '13px' }}>Used ({material.usedQuantity || 0} {material.unit})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialDetails;
