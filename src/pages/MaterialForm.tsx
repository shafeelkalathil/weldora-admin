import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Package, DollarSign, Calendar, Truck, FileText } from 'lucide-react';
import Header from '../components/Header';
import { materialService, MaterialPurchase } from '../services/materialService';
import { showToast } from '../components/Toast';

const MaterialForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<MaterialPurchase>({
        item: '',
        supplier: '',
        quantity: 0,
        unit: 'pcs',
        totalCost: 0,
        date: new Date().toISOString().split('T')[0],
        paymentType: 'Debit',
        usedQuantity: 0,
        notes: ''
    });

    useEffect(() => {
        if (isEdit && id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await materialService.getAll();
            const found = data.find(p => p.id === id);
            if (found) {
                setFormData(found);
            } else {
                showToast("Record not found", "error");
                navigate('/materials');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.item || !formData.supplier || formData.totalCost <= 0) {
            showToast("Please fill in all required fields correctly", "error");
            return;
        }

        try {
            setSaving(true);
            if (isEdit && id) {
                await materialService.update(id, formData);
                showToast("Purchase updated successfully", "success");
            } else {
                await materialService.add(formData);
                showToast("Purchase recorded successfully", "success");
            }
            navigate('/materials');
        } catch (error) {
            console.error("Error saving purchase", error);
            showToast("Failed to save record", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/materials')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                >
                    <ChevronLeft size={20} /> Back to Purchases
                </button>
                <div className="flex-between">
                    <Header
                        title={isEdit ? "Edit Purchase Record" : "Record Material Purchase"}
                        subtitle={isEdit ? "Update transaction details." : "Log a new raw material acquisition."}
                        showSearch={false}
                        showNotifications={false}
                    />

                </div>
            </div>

            <div className="glass card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Item Name / Description</label>
                        <div style={{ position: 'relative' }}>
                            <Package size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="e.g. Steel Sheets, Welding Rods"
                                value={formData.item}
                                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Supplier Name</label>
                        <div style={{ position: 'relative' }}>
                            <Truck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Supplier Company"
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Purchase Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Quantity</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                            />
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                style={{ width: '100px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                            >
                                <option value="pcs">Pcs</option>
                                <option value="kg">Kg</option>
                                <option value="sheets">Sheets</option>
                                <option value="meters">Meters</option>
                                <option value="liters">Liters</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Total Cost</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="number"
                                placeholder="0.00"
                                value={formData.totalCost}
                                onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Used in Production</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.usedQuantity || 0}
                            onChange={(e) => setFormData({ ...formData, usedQuantity: Number(e.target.value) })}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                        />
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            In Stock: {(formData.quantity - (formData.usedQuantity || 0))} {formData.unit}
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Payment Type</label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="Debit"
                                    checked={formData.paymentType === 'Debit'}
                                    onChange={() => setFormData({ ...formData, paymentType: 'Debit' })}
                                />
                                <span style={{ color: formData.paymentType === 'Debit' ? '#10b981' : 'var(--text-muted)' }}>Debit (Paid)</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="paymentType"
                                    value="Credit"
                                    checked={formData.paymentType === 'Credit'}
                                    onChange={() => setFormData({ ...formData, paymentType: 'Credit' })}
                                />
                                <span style={{ color: formData.paymentType === 'Credit' ? '#f59e0b' : 'var(--text-muted)' }}>Credit (Due)</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Notes (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <FileText size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none', height: '100px', resize: 'vertical' }}
                                placeholder="Invoice numbers, quality checks, etc."
                            />
                        </div>
                    </div>

                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/materials')}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-submit"
                    >
                        {saving ? 'Processing...' : <><Save size={18} /> {isEdit ? 'Update Record' : 'Save Record'}</>}
                    </button>
                </div>
            </div>
            <style>{`
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

export default MaterialForm;
