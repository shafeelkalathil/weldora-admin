import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, DollarSign, FileText, Calendar, CreditCard, User, Building, Plus, X, List, Edit, Trash2, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import { accountService, chartOfAccountsService, AccountTransaction, AccountCategory } from '../services/accountService';
import { orderService, Order } from '../services/orderService';
import { productService, Product } from '../services/productService';
import { showToast } from '../components/Toast';

const AccountForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Data Sources
    const [categories, setCategories] = useState<AccountCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [bankStats, setBankStats] = useState<{ balance: number, income: number, expense: number } | null>(null);
    const [cashStats, setCashStats] = useState<{ balance: number, income: number, expense: number } | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Form State
    const [formData, setFormData] = useState<AccountTransaction>({
        date: new Date().toISOString().split('T')[0],
        transactionNumber: '',
        accountId: '',
        accountName: '',
        accountType: 'Expense',
        description: '',
        amount: 0,
        paymentMethod: 'Cash',
        status: 'Completed',
        notes: '',
        createdAt: new Date().toISOString(),
        section: 'Sales' // Default to Sales Based
    });

    // Category Management State (Create/Edit)
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'Expense',
        code: ''
    });
    // Track where the "Add New" request came from: 'Main' (Category Field) or 'Payment' (Payment Field)
    const [newCategoryContext, setNewCategoryContext] = useState<'Main' | 'Payment'>('Main');

    // Category Search State
    const [categorySearch, setCategorySearch] = useState('');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    // Payment/Source Account Search State
    // Removed legacy payment dropdown state

    useEffect(() => {
        fetchCategories();
        fetchBalances();
        fetchOrdersAndProducts();
        if (isEdit && id) {
            fetchTransaction();
        }
    }, [id]);

    const fetchOrdersAndProducts = async () => {
        try {
            const [ordersData, productsData] = await Promise.all([
                orderService.getAll(),
                productService.getAll()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching orders and products:", error);
        }
    };

    const fetchBalances = async () => {
        try {
            const data = await accountService.getAll();
            const completed = data.filter(t => t.status === 'Completed');

            const getStats = (methodChecker: (m: string) => boolean) => {
                const income = completed
                    .filter(t => methodChecker(t.paymentMethod || '') && t.accountType === 'Income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = completed
                    .filter(t => methodChecker(t.paymentMethod || '') && t.accountType === 'Expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                return { balance: income - expense, income, expense };
            };

            const isBank = (m: string) => m.toLowerCase().includes('bank') || m.toLowerCase().includes('upi') || m.toLowerCase().includes('pay') || m.toLowerCase().includes('transfer');
            const isCash = (m: string) => m.toLowerCase().includes('cash');

            setBankStats(getStats(isBank));
            setCashStats(getStats(isCash));
        } catch (error) {
            console.error("Error fetching balances:", error);
        }
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            let data = await chartOfAccountsService.getAll();
            // Removed auto-seeding of default accounts to ensure only Firebase data is used.
            // if (data.length === 0) { ... }
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            const data = await accountService.getAll();
            const found = data.find(t => t.id === id);
            if (found) {
                setFormData(found);
            } else {
                showToast("Transaction not found", "error");
                navigate('/accounts');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.description || formData.amount <= 0) {
            showToast("Please fill in description and amount", "error");
            return;
        }
        if (!formData.accountId) {
            showToast("Please select an account category", "error");
            return;
        }

        try {
            setSaving(true);
            if (isEdit && id) {
                await accountService.update(id, formData);
                showToast("Transaction updated successfully", "success");
            } else {
                const txnNum = await accountService.generateTransactionNumber();
                await accountService.add({ ...formData, transactionNumber: txnNum });
                showToast("Transaction recorded successfully", "success");
            }
            navigate('/accounts');
        } catch (error) {
            console.error("Error saving transaction", error);
            showToast("Failed to save transaction", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!newCategory.name) return;
        try {
            if (editingId) {
                // Update existing
                await chartOfAccountsService.update(editingId, {
                    name: newCategory.name,
                    type: newCategory.type as any
                });
                showToast("Category updated!", "success");
            } else {
                // Create new
                const code = await chartOfAccountsService.generateCode(newCategory.type as any);
                const newCat = {
                    name: newCategory.name,
                    type: newCategory.type as any,
                    code: code,
                    section: (formData.section || 'Both') as 'Expansion' | 'Sales' | 'Both',
                    isActive: true, // Ensure it's active immediately
                    createdAt: new Date().toISOString()
                };

                const id = await chartOfAccountsService.add(newCat);
                showToast("New category created!", "success");

                // Auto-select the newly created category in the correct field
                if (newCategoryContext === 'Main') {
                    setFormData({ ...formData, accountId: id, accountName: newCat.name });
                } else {
                    setFormData({ ...formData, paymentMethod: newCat.name });
                }
            }

            setShowNewCategory(false);
            setEditingId(null);
            setNewCategory({ name: '', type: 'Expense', code: '' });
            fetchCategories(); // Refresh list to include new item
        } catch (e) {
            showToast("Failed to save category", "error");
        }
    };

    const handleDeleteCategory = async (e: React.MouseEvent, cat: AccountCategory) => {
        e.stopPropagation(); // Prevent selection
        if (!window.confirm(`Are you sure you want to delete "${cat.name}"?`)) return;

        try {
            await chartOfAccountsService.delete(cat.id!);
            showToast("Category deleted", "success");
            fetchCategories();

            // Clear selection if deleted item was selected
            if (formData.accountId === cat.id) {
                setFormData({ ...formData, accountId: '', accountName: '' });
            }
            if (formData.paymentMethod === cat.name) {
                setFormData({ ...formData, paymentMethod: '' });
            }
        } catch (error) {
            showToast("Failed to delete category", "error");
        }
    };

    const handleEditClick = (e: React.MouseEvent, cat: AccountCategory) => {
        e.stopPropagation();
        setNewCategory({ name: cat.name, type: cat.type, code: cat.code });
        setEditingId(cat.id!);
        setShowNewCategory(true);
    };

    // Filter by type and deduplicate (handles potential double-seeding issues)
    const uniqueCategories = Array.from(new Map(categories.map(item => [item.code, item])).values());
    const filteredCategories = uniqueCategories.filter(c =>
        c.type === formData.accountType &&
        (!c.section || c.section === 'Both' || c.section === formData.section)
    );

    // Removed legacy Payment Accounts filter

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/accounts')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '0' }}
                >
                    <ChevronLeft size={20} /> Back to Accounts
                </button>
                <Header
                    title={isEdit ? "Edit Entry" : "New Entry"}
                    subtitle={isEdit ? "Update financial record" : "Record a new income or expense"}
                    showSearch={false}
                    showNotifications={false}
                />
            </div>

            <div className="glass card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

                {/* Account Section Toggle */}
                <div style={{ marginBottom: '24px' }}>
                    <label className="form-label">Account Management Section</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '14px' }}>
                        <button
                            onClick={() => setFormData({ ...formData, section: 'Sales' })}
                            style={{
                                padding: '12px', borderRadius: '10px',
                                background: formData.section === 'Sales' ? 'var(--primary)' : 'transparent',
                                color: formData.section === 'Sales' ? 'white' : 'var(--text-muted)',
                                border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <DollarSign size={16} /> Sales Based Accounts
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, section: 'Expansion' })}
                            style={{
                                padding: '12px', borderRadius: '10px',
                                background: formData.section === 'Expansion' ? 'var(--primary)' : 'transparent',
                                color: formData.section === 'Expansion' ? 'white' : 'var(--text-muted)',
                                border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <TrendingUp size={16} /> Company Expansion
                        </button>
                    </div>
                </div>

                {/* Transaction Type Toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    <button
                        onClick={() => {
                            setFormData({ ...formData, accountType: 'Income', accountId: '', accountName: '' });
                            setNewCategory({ ...newCategory, type: 'Income' });
                        }}
                        style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: `2px solid ${formData.accountType === 'Income' ? '#10b981' : 'var(--border)'}`,
                            background: formData.accountType === 'Income' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: formData.accountType === 'Income' ? '#10b981' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        💰 Income / Revenue
                    </button>
                    <button
                        onClick={() => {
                            setFormData({ ...formData, accountType: 'Expense', accountId: '', accountName: '' });
                            setNewCategory({ ...newCategory, type: 'Expense' });
                        }}
                        style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: `2px solid ${formData.accountType === 'Expense' ? '#ef4444' : 'var(--border)'}`,
                            background: formData.accountType === 'Expense' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                            color: formData.accountType === 'Expense' ? '#ef4444' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        💸 Expense / Payment
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    {/* Date */}
                    <div>
                        <label className="form-label">Transaction Date</label>
                        <div className="input-wrapper">
                            <Calendar size={18} className="input-icon" />
                            <input
                                type="date"
                                className="form-input icon-input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="form-label">Amount ($)</label>
                        <div className="input-wrapper">
                            <DollarSign size={18} className="input-icon" />
                            <input
                                type="number"
                                className="form-input icon-input"
                                value={formData.amount || ''}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>
                                {formData.accountType === 'Income' ? 'Income Account (Source)' : 'Expense Account (For)'}
                            </label>
                            <button
                                onClick={() => {
                                    setNewCategoryContext('Main');
                                    setNewCategory({ ...newCategory, type: formData.accountType });
                                    setEditingId(null);
                                    setShowNewCategory(true);
                                }}
                                style={{
                                    fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <Plus size={14} /> Create New Account
                            </button>
                        </div>

                        <div className="input-wrapper">
                            <List size={18} className="input-icon" />
                            <input
                                type="text"
                                className="form-input icon-input"
                                placeholder={isCategoryDropdownOpen ? "Search categories..." : (formData.accountName || `Select ${formData.accountType} Category`)}
                                value={categorySearch}
                                onChange={(e) => {
                                    setCategorySearch(e.target.value);
                                    setIsCategoryDropdownOpen(true);
                                }}
                                onFocus={() => {
                                    setIsCategoryDropdownOpen(true);
                                    // Pre-fil search with current name if desired, or keep empty to show all. 
                                    // Let's keep empty to encourage searching or seeing full list.
                                }}
                                onClick={() => setIsCategoryDropdownOpen(true)}
                            />
                            {isCategoryDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%', left: 0, right: 0,
                                    zIndex: 50,
                                    marginTop: '4px',
                                    background: '#1e293b', // darker slate to match likely theme
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    maxHeight: '240px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                }}>
                                    {filteredCategories
                                        .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()) || c.code.toLowerCase().includes(categorySearch.toLowerCase()))
                                        .length === 0 ? (
                                        <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                                            No categories found
                                        </div>
                                    ) : (
                                        filteredCategories
                                            .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()) || c.code.toLowerCase().includes(categorySearch.toLowerCase()))
                                            .map(cat => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            accountId: cat.id!,
                                                            accountName: cat.name
                                                        });
                                                        setCategorySearch(''); // Clear search or set to name?
                                                        setIsCategoryDropdownOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                        background: formData.accountId === cat.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = formData.accountId === cat.id ? 'rgba(255,255,255,0.05)' : 'transparent'}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span>{cat.name}</span>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{cat.code}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={(e) => handleEditClick(e, cat)}
                                                            style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                                                        >
                                                            <Edit size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteCategory(e, cat)}
                                                            style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Overlay to close dropdown when clicking outside */}
                        {isCategoryDropdownOpen && (
                            <div
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                                onClick={() => setIsCategoryDropdownOpen(false)}
                            />
                        )}
                    </div>

                    {/* Source/Destination Account (Payment Method) */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{formData.accountType === 'Income' ? 'Deposit To' : 'Payment Source'}</span>
                            {formData.paymentMethod === 'Cash' && cashStats !== null && (
                                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', alignItems: 'center' }}>
                                    <span style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Total Income: +${cashStats.income.toLocaleString()}</span>
                                    <span style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Total Expense: -${cashStats.expense.toLocaleString()}</span>
                                    <span style={{ fontWeight: 600, color: cashStats.balance >= 0 ? '#10b981' : '#ef4444', backgroundColor: cashStats.balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid currentColor' }}>
                                        Net Balance: {cashStats.balance >= 0 ? '+' : '-'}${Math.abs(cashStats.balance).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {formData.paymentMethod === 'Bank Transfer' && bankStats !== null && (
                                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', alignItems: 'center' }}>
                                    <span style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Total Income: +${bankStats.income.toLocaleString()}</span>
                                    <span style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Total Expense: -${bankStats.expense.toLocaleString()}</span>
                                    <span style={{ fontWeight: 600, color: bankStats.balance >= 0 ? '#10b981' : '#ef4444', backgroundColor: bankStats.balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid currentColor' }}>
                                        Net Balance: {bankStats.balance >= 0 ? '+' : '-'}${Math.abs(bankStats.balance).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </label>
                        <div className="input-wrapper">
                            <CreditCard size={18} className="input-icon" style={{ zIndex: 10 }} />
                            <select
                                className="form-input icon-input"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                style={{ appearance: 'none', cursor: 'pointer' }}
                            >
                                <option value="Cash">Cash in Hand</option>
                                <option value="Bank Transfer">Bank Account</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Description / Narration</label>
                        <div className="input-wrapper">
                            <FileText size={18} className="input-icon" />
                            <input
                                type="text"
                                className="form-input icon-input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={formData.accountType === 'Income' ? "e.g. Sales for INV-001" : "e.g. Office Rent payment"}
                            />
                        </div>
                    </div>

                    {/* Link to Order & Product (Only for Sales Section) */}
                    {formData.section === 'Sales' && (
                        <>
                            <div>
                                <label className="form-label">Link to Order</label>
                                <select
                                    className="form-input"
                                    value={formData.orderId || ''}
                                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                >
                                    <option value="">-- No Order Linked --</option>
                                    {orders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            {order.customer} - ${order.total} ({new Date(order.date).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Link to Product</label>
                                <select
                                    className="form-input"
                                    value={formData.productId || ''}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                >
                                    <option value="">-- No Product Linked --</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.category})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Party Name */}
                    <div>
                        <label className="form-label">
                            {formData.accountType === 'Income' ? 'Received From' : 'Paid To'}
                        </label>
                        <div className="input-wrapper">
                            {formData.accountType === 'Income' ? <User size={18} className="input-icon" /> : <Building size={18} className="input-icon" />}
                            <input
                                type="text"
                                className="form-input icon-input"
                                value={formData.partyName || ''}
                                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                                placeholder="Optional (Name)"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="form-label">Status</label>
                        <select
                            className="form-input"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                </div>

                {/* Create New Category Modal/Overlay */}
                {showNewCategory && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                    }}>
                        <div style={{ background: '#1e293b', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px', width: '320px' }}>
                            <h4 style={{ color: 'white', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                {editingId ? 'Edit Account' : `New ${newCategory.type} Account`}
                                <X size={18} style={{ cursor: 'pointer' }} onClick={() => { setShowNewCategory(false); setEditingId(null); }} />
                            </h4>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Account Name</label>
                                <input
                                    placeholder="e.g. Consulting Fees"
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {['Income', 'Expense', 'Asset', 'Liability'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => !editingId && setNewCategory({ ...newCategory, type })}
                                            disabled={!!editingId}
                                            style={{
                                                padding: '8px', borderRadius: '6px', border: '1px solid var(--border)',
                                                background: newCategory.type === type ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                color: newCategory.type === type ? 'white' : 'var(--text-muted)',
                                                cursor: editingId ? 'not-allowed' : 'pointer', fontSize: '12px', opacity: editingId && newCategory.type !== type ? 0.3 : 1
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveCategory}
                                style={{ width: '100%', padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                {editingId ? 'Update Account' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/accounts')}
                        style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ padding: '12px 32px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> {isEdit ? 'Update' : 'Save Record'}</>}
                    </button>
                </div>

            </div>

            <style>{`
                .form-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: var(--text-muted); }
                .input-wrapper { position: relative; }
                .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .form-input { 
                    width: 100%; padding: 12px; border-radius: 12px; 
                    background: rgba(255,255,255,0.05); border: 1px solid var(--border); 
                    color: white; outline: none; transition: border-color 0.2s;
                }
                .form-input:focus { border-color: var(--primary); }
                .icon-input { padding-left: 40px; }
            `}</style>
        </div>
    );
};

export default AccountForm;
