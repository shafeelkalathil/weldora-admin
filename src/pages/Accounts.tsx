import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, Banknote, Edit, Trash2, PieChart, Search, Calendar, BookOpen, FileText, LayoutDashboard, Settings, X, Save as SaveIcon } from 'lucide-react';
import Header from '../components/Header';
import { accountService, AccountTransaction, chartOfAccountsService, AccountCategory } from '../services/accountService';
import { showToast, showConfirm } from '../components/Toast';

const Accounts = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'overview' | 'daybook' | 'ledger' | 'categories'>('overview');
    const [accountSection, setAccountSection] = useState<'Sales' | 'Expansion'>('Sales');
    const [selectedLedgerAccount, setSelectedLedgerAccount] = useState<string>('');
    const [dayBookDate, setDayBookDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Categories Management State
    const [categories, setCategories] = useState<AccountCategory[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AccountCategory | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', type: 'Expense', code: '', description: '' });

    const [filterType, setFilterType] = useState<string>('All');
    const [filterAccount, setFilterAccount] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Enhanced Filter States
    const [dayBookAccount, setDayBookAccount] = useState('All');
    const [dayBookSearch, setDayBookSearch] = useState('');
    const [isDayBookDropdownOpen, setIsDayBookDropdownOpen] = useState(false);

    const [ledgerSearch, setLedgerSearch] = useState('');
    const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);

    // Base transactions filtered by Section (Sales vs Expansion)
    const sectionTransactions = transactions.filter(t =>
        accountSection === 'Expansion'
            ? t.section === 'Expansion'
            : (t.section === 'Sales' || !t.section)
    );

    const uniqueAccounts = Array.from(new Set(sectionTransactions.map(t => t.accountName))).sort();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await accountService.getAll();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
            showToast("Failed to load transactions", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const data = await chartOfAccountsService.getAll();
        setCategories(data);
    };

    // Load categories when switching to this view
    useEffect(() => {
        if (viewMode === 'categories') {
            fetchCategories();
        }
    }, [viewMode]);

    const handleSaveCategory = async () => {
        if (!categoryForm.name) return showToast("Account name is required", "error");
        try {
            if (editingCategory) {
                await chartOfAccountsService.update(editingCategory.id!, {
                    name: categoryForm.name,
                    description: categoryForm.description
                    // Type and code usually shouldn't change to maintain integrity, or handle carefully
                });
                showToast("Account updated successfully", "success");
            } else {
                const code = await chartOfAccountsService.generateCode(categoryForm.type as any);
                await chartOfAccountsService.add({
                    name: categoryForm.name,
                    type: categoryForm.type as any,
                    code,
                    description: categoryForm.description,
                    isActive: true,
                    createdAt: new Date().toISOString()
                });
                showToast("New account created successfully", "success");
            }
            setShowCategoryModal(false);
            fetchCategories();
        } catch (error) {
            showToast("Failed to save account", "error");
        }
    };

    const handleDeleteCategory = (id: string) => {
        showConfirm("Are you sure? This will hide the account from new selections.", async () => {
            try {
                await chartOfAccountsService.delete(id); // Or set isActive: false
                showToast("Account deleted", "success");
                fetchCategories();
            } catch (e) { showToast("Failed to delete", "error"); }
        });
    };

    const openCategoryModal = (cat?: AccountCategory) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryForm({ name: cat.name, type: cat.type, code: cat.code, description: cat.description || '' });
        } else {
            setEditingCategory(null);
            setCategoryForm({ name: '', type: 'Expense', code: '', description: '' });
        }
        setShowCategoryModal(true);
    };

    const handleDelete = (id: string) => {
        showConfirm("Are you sure you want to delete this transaction?", async () => {
            try {
                await accountService.delete(id);
                showToast("Transaction deleted successfully", "success");
                fetchData();
            } catch (error) {
                showToast("Failed to delete transaction", "error");
            }
        });
    };



    const filteredTransactions = sectionTransactions.filter(t => {
        const typeMatch = filterType === 'All' || t.accountType === filterType;
        const accountMatch = filterAccount === 'All' || t.paymentMethod === filterAccount;
        const searchMatch = searchQuery === '' ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.amount.toString().includes(searchQuery);

        let dateMatch = true;
        if (startDate && endDate) {
            dateMatch = t.date >= startDate && t.date <= endDate;
        } else if (startDate) {
            dateMatch = t.date >= startDate;
        } else if (endDate) {
            dateMatch = t.date <= endDate;
        }

        return typeMatch && accountMatch && searchMatch && dateMatch;
    });

    // Calculate comprehensive metrics (Based on Section, respecting Date filter if needed, but usually metrics cover all time or specific period. 
    // Let's assume metrics cards should reflect the SELECTED SECTION only, but maybe ALL TIME unless date is set? 
    // Current implementation used 'transactions' (all time). 
    // Let's use 'sectionTransactions' (all time for that section). 
    // If we want metrics to react to Date Filter, we should use a date-filtered version of sectionTransactions.
    // However, usually "Total Revenue" on a dashboard is All Time or YTD. 
    // EXISTING LOGIC was All Time (unless I missed something).
    // Let's stick to All Time for the Section.
    const completed = sectionTransactions.filter(t => t.status === 'Completed');

    // Revenue breakdown
    const salesRevenue = completed
        .filter(t => t.accountType === 'Income' && t.accountName.includes('Sales'))
        .reduce((sum, t) => sum + t.amount, 0);

    const investmentRevenue = completed
        .filter(t => t.accountType === 'Income' && t.accountName.includes('Investment'))
        .reduce((sum, t) => sum + t.amount, 0);

    const otherRevenue = completed
        .filter(t => t.accountType === 'Income' && !t.accountName.includes('Sales') && !t.accountName.includes('Investment'))
        .reduce((sum, t) => sum + t.amount, 0);

    const totalRevenue = salesRevenue + investmentRevenue + otherRevenue;

    // Expense breakdown
    const salaryExpense = completed
        .filter(t => t.accountType === 'Expense' && t.accountName.includes('Salary'))
        .reduce((sum, t) => sum + t.amount, 0);

    const dividendExpense = completed
        .filter(t => t.accountType === 'Expense' && t.accountName.includes('Dividend'))
        .reduce((sum, t) => sum + t.amount, 0);

    const materialExpense = completed
        .filter(t => t.accountType === 'Expense' && t.accountName.includes('Material'))
        .reduce((sum, t) => sum + t.amount, 0);

    const rentExpense = completed
        .filter(t => t.accountType === 'Expense' && t.accountName.includes('Rent'))
        .reduce((sum, t) => sum + t.amount, 0);

    const electricityExpense = completed
        .filter(t => t.accountType === 'Expense' && t.accountName.includes('Electricity'))
        .reduce((sum, t) => sum + t.amount, 0);

    const maintenanceExpense = completed
        .filter(t => t.accountType === 'Expense' && t.accountName.includes('Maintenance'))
        .reduce((sum, t) => sum + t.amount, 0);

    const otherExpense = completed
        .filter(t => t.accountType === 'Expense' &&
            !t.accountName.includes('Salary') && !t.accountName.includes('Dividend') &&
            !t.accountName.includes('Material') && !t.accountName.includes('Rent') &&
            !t.accountName.includes('Electricity') && !t.accountName.includes('Maintenance'))
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = salaryExpense + dividendExpense + materialExpense + rentExpense +
        electricityExpense + maintenanceExpense + otherExpense;

    // Cash flow by payment account (Enhanced)
    const getFlow = (method: string) => {
        const income = completed
            .filter(t => t.paymentMethod === method && t.accountType === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = completed
            .filter(t => t.paymentMethod === method && t.accountType === 'Expense') // Only operational expenses
            .reduce((sum, t) => sum + t.amount, 0);
        const assets = completed
            .filter(t => t.paymentMethod === method && t.accountType === 'Asset')
            .reduce((sum, t) => sum + t.amount, 0);
        // "Out" includes both Expenses and Asset purchases from that account
        return { in: income, out: expense + assets, balance: income - (expense + assets) };
    };

    const bankFlow = getFlow('Bank Transfer');
    const upiFlow = getFlow('UPI');
    const cashFlow = getFlow('Cash');

    // Investment Fund Analysis
    const totalAssetPurchase = completed
        .filter(t => t.accountType === 'Asset')
        .reduce((sum, t) => sum + t.amount, 0);

    const investmentBalance = investmentRevenue - totalAssetPurchase;

    // Operational Net Profit (Already excluded Investment Revenue)
    // We must ensure 'totalExpenses' EXCLUDES Asset purchases (which it does, as it filters by 'Expense')
    const operationalRevenue = salesRevenue + otherRevenue;
    const netBalance = operationalRevenue - totalExpenses;

    const getTypeColor = (type: string) => {
        const colors: any = {
            'Income': '#10b981',
            'Asset': '#3b82f6',
            'Expense': '#ef4444',
            'Liability': '#f59e0b'
        };
        return colors[type] || '#6366f1';
    };

    const getTypeIcon = (type: string) => {
        if (type === 'Income' || type === 'Asset') return <TrendingUp size={18} />;
        return <TrendingDown size={18} />;
    };

    const getDisplayCategory = (t: AccountTransaction) => {
        return t.accountName || 'General';
    };

    return (
        <div className="animate-fade-in">
            <Header
                title={accountSection === 'Sales' ? "Sales Based Accounts" : "Company Expansion Accounts"}
                subtitle={accountSection === 'Sales' ? "Manage operational revenue and expenses." : "Track capital investments and expansion costs."}
                showSearch={false}
            />

            {/* Account Section Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px', maxWidth: '600px' }}>
                <button
                    onClick={() => setAccountSection('Sales')}
                    style={{
                        padding: '16px',
                        borderRadius: '16px',
                        border: `2px solid ${accountSection === 'Sales' ? 'var(--primary)' : 'transparent'}`,
                        background: accountSection === 'Sales' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                        color: accountSection === 'Sales' ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left', // Align text to the left
                        display: 'flex',
                        flexDirection: 'column', // Stack icon and text vertically if needed, or row
                        gap: '8px',
                        transition: 'all 0.3s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                            <DollarSign size={20} />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 600 }}>Sales Based Management</span>
                    </div>
                    <span style={{ fontSize: '12px', opacity: 0.7, paddingLeft: '52px' }}>Operational finance & daily accounts</span>
                </button>

                <button
                    onClick={() => setAccountSection('Expansion')}
                    style={{
                        padding: '16px',
                        borderRadius: '16px',
                        border: `2px solid ${accountSection === 'Expansion' ? '#10b981' : 'transparent'}`,
                        background: accountSection === 'Expansion' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                        color: accountSection === 'Expansion' ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.3s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                            <TrendingUp size={20} />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 600 }}>Expansion Management</span>
                    </div>
                    <span style={{ fontSize: '12px', opacity: 0.7, paddingLeft: '52px' }}>Capital projects & growth tracking</span>
                </button>
            </div>

            {/* View Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                <button
                    onClick={() => setViewMode('overview')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '8px',
                        background: viewMode === 'overview' ? 'var(--primary)' : 'transparent',
                        color: viewMode === 'overview' ? 'white' : 'var(--text-muted)',
                        border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
                    }}
                >
                    <LayoutDashboard size={16} /> Overview
                </button>
                <button
                    onClick={() => setViewMode('daybook')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '8px',
                        background: viewMode === 'daybook' ? 'var(--primary)' : 'transparent',
                        color: viewMode === 'daybook' ? 'white' : 'var(--text-muted)',
                        border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
                    }}
                >
                    <BookOpen size={16} /> Day Book
                </button>
                <button
                    onClick={() => setViewMode('ledger')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '8px',
                        background: viewMode === 'ledger' ? 'var(--primary)' : 'transparent',
                        color: viewMode === 'ledger' ? 'white' : 'var(--text-muted)',
                        border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
                    }}
                >
                    <FileText size={16} /> Ledger View
                </button>
                <button
                    onClick={() => setViewMode('categories')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '8px',
                        background: viewMode === 'categories' ? 'var(--primary)' : 'transparent',
                        color: viewMode === 'categories' ? 'white' : 'var(--text-muted)',
                        border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s'
                    }}
                >
                    <Settings size={16} /> Manage Accounts
                </button>
            </div>

            {viewMode === 'daybook' && (
                <div className="glass card animate-fade-in" style={{ minHeight: '500px' }}>
                    <div className="flex-between" style={{ marginBottom: '20px', alignItems: 'flex-end' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Day Book</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Daily record of all financial transactions</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {/* Account Filter */}
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Filter Account</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder={isDayBookDropdownOpen ? "Search..." : (dayBookAccount === 'All' ? "All Accounts" : dayBookAccount)}
                                        value={dayBookSearch}
                                        onChange={(e) => {
                                            setDayBookSearch(e.target.value);
                                            setIsDayBookDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDayBookDropdownOpen(true)}
                                        className="form-input"
                                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', width: '200px', fontSize: '13px', cursor: 'pointer' }}
                                    />
                                    {/* Dropdown */}
                                    {isDayBookDropdownOpen && (
                                        <>
                                            <div style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                                marginTop: '4px', background: '#1e293b', border: '1px solid var(--border)',
                                                borderRadius: '8px', maxHeight: '240px', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                            }}>
                                                <div
                                                    onClick={() => { setDayBookAccount('All'); setDayBookSearch(''); setIsDayBookDropdownOpen(false); }}
                                                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: dayBookAccount === 'All' ? 'var(--primary)' : 'white' }}
                                                >
                                                    All Accounts
                                                </div>
                                                {uniqueAccounts
                                                    .filter(acc => acc.toLowerCase().includes(dayBookSearch.toLowerCase()))
                                                    .map(acc => (
                                                        <div
                                                            key={acc}
                                                            onClick={() => { setDayBookAccount(acc); setDayBookSearch(''); setIsDayBookDropdownOpen(false); }}
                                                            style={{
                                                                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                                                                background: dayBookAccount === acc ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                                color: dayBookAccount === acc ? 'var(--primary)' : 'white' // Highlight selected
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = dayBookAccount === acc ? 'rgba(255,255,255,0.05)' : 'transparent'}
                                                        >
                                                            {acc}
                                                        </div>
                                                    ))}
                                            </div>
                                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={() => setIsDayBookDropdownOpen(false)} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</label>
                                <input
                                    type="date"
                                    value={dayBookDate}
                                    onChange={(e) => setDayBookDate(e.target.value)}
                                    className="form-input"
                                    style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Particulars</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Vch Type</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Vch No</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)' }}>Debit</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)' }}>Credit</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const dailyTxns = sectionTransactions
                                    .filter(t => t.date === dayBookDate)
                                    .filter(t => dayBookAccount === 'All' || t.accountName === dayBookAccount)
                                    .sort((a, b) => (a.transactionNumber || '').localeCompare(b.transactionNumber || ''));

                                if (dailyTxns.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No entries found.
                                            </td>
                                        </tr>
                                    );
                                }

                                let runningBalance = 0;

                                return (
                                    <>
                                        {dailyTxns.map(t => {
                                            // Determine Debit/Credit based on account type generally
                                            // Asset/Expense increase on Debit. Income/Liability increase on Credit.
                                            // BUT, in a Day Book (Journal), we are typically looking at it from the perspective of the business.
                                            // Simplified:
                                            // Receipt (Income/Liability) -> Credit
                                            // Payment (Expense/Asset) -> Debit

                                            // HOWEVER, strictly speaking:
                                            // If Account Type is Income -> It IS a Credit entry.
                                            // If Account Type is Expense -> It IS a Debit entry.

                                            const isCredit = t.accountType === 'Income' || t.accountType === 'Liability';
                                            const debitAmount = !isCredit ? t.amount : 0;
                                            const creditAmount = isCredit ? t.amount : 0;

                                            // Correct Logic for Balance? 
                                            // Usually Day Book just lists transactions. Running balance might be "Cash in Hand" if filtering by Cash.
                                            // If checking generic Day Book, "Balance" is less meaningful unless specific account.
                                            // User requested "Balance also want", so we will try.
                                            // Assuming "Cash Book" style if no specific account, or just net flow.
                                            // Let's treat Inflow as positive, Outflow as negative for a generic "Net" column?
                                            // Or better, just show Dr/Cr and let the totals speak.
                                            // WAITING: User said "set debit and credit and balance".
                                            // For specific account ledger, balance is easier.
                                            // For Day Book, maybe just show Dr/Cr sum?
                                            // Let's implement row-wise visual, and maybe a cumulative if it makes sense.

                                            // Let's do simple net cumulative for the day:
                                            // (Credit - Debit) or (Debit - Credit)?
                                            // Let's go with (Income - Expense) style: Flow.
                                            // Actually, usually Day Book balance is meaningless across mixed accounts.
                                            // BUT if we interpret it as "Cash Book" (Receipts vs Payments):
                                            // Balance = Receipts - Payments.

                                            if (isCredit) runningBalance += t.amount;
                                            else runningBalance -= t.amount;

                                            return (
                                                <tr
                                                    key={t.id}
                                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                                    onClick={() => navigate(`/accounts/view/${t.id}`)}
                                                >
                                                    <td style={{ padding: '12px', fontWeight: 500 }}>
                                                        {getDisplayCategory(t)}
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{t.description}</div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>{isCredit ? 'Receipt' : 'Payment'}</td>
                                                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{t.transactionNumber || '-'}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#ef4444' }}>
                                                        {debitAmount > 0 ? debitAmount.toFixed(2) : '-'}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#10b981' }}>
                                                        {creditAmount > 0 ? creditAmount.toFixed(2) : '-'}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: runningBalance >= 0 ? '#10b981' : '#ef4444' }}>
                                                        {Math.abs(runningBalance).toFixed(2)} {runningBalance >= 0 ? 'Cr' : 'Dr'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700, background: 'rgba(255,255,255,0.05)' }}>
                                            <td colSpan={3} style={{ padding: '12px', textAlign: 'right' }}>Daily Total:</td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#ef4444' }}>
                                                {dailyTxns.reduce((sum, t) => sum + ((t.accountType === 'Expense' || t.accountType === 'Asset') ? t.amount : 0), 0).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#10b981' }}>
                                                {dailyTxns.reduce((sum, t) => sum + ((t.accountType === 'Income' || t.accountType === 'Liability') ? t.amount : 0), 0).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: runningBalance >= 0 ? '#10b981' : '#ef4444' }}>
                                                {Math.abs(runningBalance).toFixed(2)} {runningBalance >= 0 ? 'Cr' : 'Dr'}
                                            </td>
                                        </tr>
                                    </>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === 'ledger' && (
                <div className="glass card animate-fade-in" style={{ minHeight: '500px' }}>
                    <div className="flex-between" style={{ marginBottom: '20px', alignItems: 'flex-end' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Ledger Account</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Account Statement & Transaction History</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Select Account</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder={isLedgerDropdownOpen ? "Search..." : (selectedLedgerAccount || "All Accounts")}
                                    value={ledgerSearch}
                                    onChange={(e) => {
                                        setLedgerSearch(e.target.value);
                                        setIsLedgerDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsLedgerDropdownOpen(true)}
                                    // onClick={() => !selectedLedgerAccount && setLedgerSearch('')}
                                    className="form-input"
                                    style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', width: '240px', fontSize: '13px', cursor: 'pointer' }}
                                />
                                <Search size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />

                                {isLedgerDropdownOpen && (
                                    <>
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                            marginTop: '4px', background: '#1e293b', border: '1px solid var(--border)',
                                            borderRadius: '8px', maxHeight: '240px', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                        }}>
                                            <div
                                                onClick={() => { setSelectedLedgerAccount(''); setLedgerSearch(''); setIsLedgerDropdownOpen(false); }}
                                                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: !selectedLedgerAccount ? 'var(--primary)' : 'white' }}
                                            >
                                                All Accounts
                                            </div>
                                            {uniqueAccounts
                                                .filter(acc => acc.toLowerCase().includes(ledgerSearch.toLowerCase()))
                                                .map(acc => (
                                                    <div
                                                        key={acc}
                                                        onClick={() => { setSelectedLedgerAccount(acc); setLedgerSearch(''); setIsLedgerDropdownOpen(false); }}
                                                        style={{
                                                            padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                                                            background: selectedLedgerAccount === acc ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                            color: selectedLedgerAccount === acc ? 'var(--primary)' : 'white'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = selectedLedgerAccount === acc ? 'rgba(255,255,255,0.05)' : 'transparent'}
                                                    >
                                                        {acc}
                                                    </div>
                                                ))}
                                        </div>
                                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={() => setIsLedgerDropdownOpen(false)} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Particulars</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Vch Type</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)' }}>Debit</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)' }}>Credit</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const accountTxns = sectionTransactions
                                    .filter(t => !selectedLedgerAccount || selectedLedgerAccount === 'All' || t.accountName === selectedLedgerAccount)
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                                if (accountTxns.length === 0) {
                                    return (
                                        <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found for this selection.</td></tr>
                                    );
                                }

                                let runningBalance = 0;
                                let totalDebit = 0;
                                let totalCredit = 0;

                                return (
                                    <>
                                        {accountTxns.map(t => {
                                            const isCredit = t.accountType === 'Income' || t.accountType === 'Liability';
                                            const debitAmount = !isCredit ? t.amount : 0;
                                            const creditAmount = isCredit ? t.amount : 0;

                                            totalDebit += debitAmount;
                                            totalCredit += creditAmount;

                                            // Ledger logic: 
                                            // Start with 0.
                                            // If Debit -> Balance decreases (or increases if it's an Expense/Asset account)?
                                            // Standard Accounting:
                                            // Assets/Expenses: Dr is +, Cr is -
                                            // Liabilities/Income: Cr is +, Dr is -
                                            // BUT ensuring a single continuous column is tricky without knowing the "Nature" of the account implicitly.
                                            // Let's assume the user wants to see the "Net" impact.
                                            // Standard Ledger often assumes a "Normal Balance" side.
                                            // For simplicity in this UI:
                                            // Let's assume Credit (Receipt/Income) is Positive (+)
                                            // Debit (Payment/Expense) is Negative (-)
                                            // OR vice versa depending on account type.

                                            // Let's check Account Type of the *selected* account to decide sign?
                                            // If 'All' is selected, mixed signs are confusing.
                                            // Default: Credit +, Debit - (Bank Statement style)

                                            if (isCredit) runningBalance += t.amount;
                                            else runningBalance -= t.amount;

                                            return (
                                                <tr
                                                    key={t.id}
                                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                                    onClick={() => navigate(`/accounts/view/${t.id}`)}
                                                >
                                                    <td style={{ padding: '12px' }}>{t.date}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{ fontWeight: 500 }}>{t.description}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', gap: '8px' }}>
                                                            <span>{t.accountName}</span>
                                                            {!selectedLedgerAccount && <span>• {t.paymentMethod}</span>}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>{isCredit ? 'Receipt' : 'Payment'}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#ef4444' }}>
                                                        {debitAmount > 0 ? debitAmount.toFixed(2) : '-'}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#10b981' }}>
                                                        {creditAmount > 0 ? creditAmount.toFixed(2) : '-'}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: runningBalance >= 0 ? '#10b981' : '#ef4444' }}>
                                                        {Math.abs(runningBalance).toFixed(2)} {runningBalance >= 0 ? 'Cr' : 'Dr'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700, background: 'rgba(255,255,255,0.05)' }}>
                                            <td colSpan={3} style={{ padding: '12px', textAlign: 'right' }}>Total / Closing Balance:</td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#ef4444' }}>
                                                {totalDebit.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#10b981' }}>
                                                {totalCredit.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: runningBalance >= 0 ? '#10b981' : '#ef4444' }}>
                                                {Math.abs(runningBalance).toFixed(2)} {runningBalance >= 0 ? 'Cr' : 'Dr'}
                                            </td>
                                        </tr>
                                    </>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === 'categories' && (
                <div className="glass card animate-fade-in">
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Chart of Accounts</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Manage Income, Expense, Asset, and Liability accounts.</p>
                        </div>
                        <button
                            onClick={() => openCategoryModal()}
                            style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> New Account
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Code</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Account Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)' }}>Description</th>
                                    <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-muted)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No accounts found. Create one to get started.</td></tr>
                                ) : (
                                    categories.map(cat => (
                                        <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', fontFamily: 'monospace' }}>{cat.code}</td>
                                            <td style={{ padding: '12px', fontWeight: 500 }}>{cat.name}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: `${getTypeColor(cat.type)}20`, color: getTypeColor(cat.type)
                                                }}>
                                                    {cat.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{cat.description || '-'}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button onClick={() => openCategoryModal(cat)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteCategory(cat.id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {showCategoryModal && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                        }}>
                            <div className="glass card" style={{ padding: '32px', width: '400px', borderRadius: '20px' }}>
                                <div className="flex-between" style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 600 }}>
                                        {editingCategory ? 'Edit Account' : 'New Account'}
                                    </h3>
                                    <button onClick={() => setShowCategoryModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Account Type</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {['Income', 'Expense', 'Asset', 'Liability'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => !editingCategory && setCategoryForm({ ...categoryForm, type })}
                                                    disabled={!!editingCategory}
                                                    style={{
                                                        padding: '10px', borderRadius: '8px', border: '1px solid var(--border)',
                                                        background: categoryForm.type === type ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                        color: categoryForm.type === type ? 'white' : 'var(--text-muted)',
                                                        cursor: editingCategory ? 'not-allowed' : 'pointer',
                                                        fontSize: '13px', textAlign: 'center'
                                                    }}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Account Name</label>
                                        <input
                                            type="text"
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                            placeholder="e.g. Sales Revenue"
                                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Description (Optional)</label>
                                        <textarea
                                            value={categoryForm.description}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                            placeholder="Brief description..."
                                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical', minHeight: '80px' }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveCategory}
                                        style={{ marginTop: '16px', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <SaveIcon size={18} /> {editingCategory ? 'Update Account' : 'Create Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'overview' && (
                <>
                    {/* Top Row - Revenue & Expense Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        {/* Revenue Breakdown */}
                        <div className="glass card">
                            <div className="flex-between" style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Revenue Breakdown</h3>
                                <TrendingUp size={20} color="#10b981" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                                    ${totalRevenue.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Revenue</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>💰 Sales Revenue</span>
                                    <span style={{ fontWeight: 600, color: '#10b981' }}>${salesRevenue.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>📈 Investment</span>
                                    <span style={{ fontWeight: 600, color: '#3b82f6' }}>${investmentRevenue.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>💵 Other Income</span>
                                    <span style={{ fontWeight: 600, color: '#6366f1' }}>${otherRevenue.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Expense Breakdown */}
                        <div className="glass card">
                            <div className="flex-between" style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Expense Breakdown</h3>
                                <TrendingDown size={20} color="#ef4444" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
                                    ${totalExpenses.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Expenses</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '6px' }}>
                                    <span>👥 Salary</span>
                                    <span style={{ fontWeight: 600, color: '#8b5cf6' }}>${salaryExpense.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '6px' }}>
                                    <span>💎 Dividend</span>
                                    <span style={{ fontWeight: 600, color: '#ec4899' }}>${dividendExpense.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                                    <span>🔩 Materials</span>
                                    <span style={{ fontWeight: 600, color: '#f59e0b' }}>${materialExpense.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                                    <span>🏢 Rent</span>
                                    <span style={{ fontWeight: 600, color: '#ef4444' }}>${rentExpense.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '6px' }}>
                                    <span>⚡ Electricity</span>
                                    <span style={{ fontWeight: 600, color: '#eab308' }}>${electricityExpense.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px' }}>
                                    <span>🔧 Maintenance</span>
                                    <span style={{ fontWeight: 600, color: '#22c55e' }}>${maintenanceExpense.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row - Cash Flow & Net Balance */}
                    <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '32px' }}>
                        <div className="glass card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Banknote size={18} color="#3b82f6" />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Bank Account</p>
                                    <h3 style={{ fontSize: '18px', marginTop: '0', color: '#3b82f6' }}>${bankFlow.balance.toLocaleString()}</h3>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#10b981' }}>In: +${bankFlow.in.toLocaleString()}</span>
                                <span style={{ color: '#ef4444' }}>Out: -${bankFlow.out.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="glass card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={18} color="#8b5cf6" />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>UPI Balance</p>
                                    <h3 style={{ fontSize: '18px', marginTop: '0', color: '#8b5cf6' }}>${upiFlow.balance.toLocaleString()}</h3>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#10b981' }}>In: +${upiFlow.in.toLocaleString()}</span>
                                <span style={{ color: '#ef4444' }}>Out: -${upiFlow.out.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="glass card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Wallet size={18} color="#22c55e" />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Cash in Hand</p>
                                    <h3 style={{ fontSize: '18px', marginTop: '0', color: '#22c55e' }}>${cashFlow.balance.toLocaleString()}</h3>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#10b981' }}>In: +${cashFlow.in.toLocaleString()}</span>
                                <span style={{ color: '#ef4444' }}>Out: -${cashFlow.out.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Investment Fund Card */}
                        <div className="glass card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '10px', borderBottomLeftRadius: '8px' }}>
                                Capital Fund
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={18} color="#f59e0b" />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Investment</p>
                                    <h3 style={{ fontSize: '18px', marginTop: '0', color: '#f59e0b' }}>${investmentBalance.toLocaleString()}</h3>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#3b82f6' }}>Fund: ${investmentRevenue.toLocaleString()}</span>
                                <span style={{ color: '#ef4444' }}>Asset: ${totalAssetPurchase.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="glass card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: netBalance >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DollarSign size={18} color={netBalance >= 0 ? '#10b981' : '#ef4444'} />
                                </div>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Operating Net</p>
                                    <h3 style={{ fontSize: '18px', marginTop: '0', color: netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                                        ${Math.abs(netBalance).toLocaleString()}
                                    </h3>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#10b981' }}>Rev: ${operationalRevenue.toLocaleString()}</span>
                                <span style={{ color: '#ef4444' }}>Exp: ${totalExpenses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Performance (Dynamic Breakdown) */}
                    <div className="glass card" style={{ marginBottom: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Category Performance</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Breakdown by individual account categories</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            {/* Income Accounts */}
                            <div>
                                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Income Accounts
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {Object.entries(
                                        completed
                                            .filter(t => t.accountType === 'Income')
                                            .reduce((acc, t) => {
                                                const name = t.accountName || 'Unknown';
                                                acc[name] = (acc[name] || 0) + t.amount;
                                                return acc;
                                            }, {} as Record<string, number>)
                                    )
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([name, amount], index) => (
                                            <div
                                                key={name}
                                                onClick={() => setSearchQuery(name)}
                                                style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '10px', borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer', transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '20px' }}>#{index + 1}</span>
                                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{name}</span>
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#10b981' }}>${amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    {completed.filter(t => t.accountType === 'Income').length === 0 && (
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No income recorded yet.</div>
                                    )}
                                </div>
                            </div>

                            {/* Expense Accounts */}
                            <div>
                                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Expense Accounts
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {Object.entries(
                                        completed
                                            .filter(t => t.accountType === 'Expense')
                                            .reduce((acc, t) => {
                                                const name = t.accountName || 'Unknown';
                                                acc[name] = (acc[name] || 0) + t.amount;
                                                return acc;
                                            }, {} as Record<string, number>)
                                    )
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([name, amount], index) => (
                                            <div
                                                key={name}
                                                onClick={() => setSearchQuery(name)}
                                                style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '10px', borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer', transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '20px' }}>#{index + 1}</span>
                                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{name}</span>
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#ef4444' }}>${amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    {completed.filter(t => t.accountType === 'Expense').length === 0 && (
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No expenses recorded yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table for Overview */}
                    <div className="glass card">
                        <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                                {/* Search Bar */}
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            padding: '10px 10px 10px 40px',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border)',
                                            color: 'white',
                                            outline: 'none',
                                            width: '240px',
                                            fontSize: '13px'
                                        }}
                                    />
                                </div>

                                {/* Date Filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <Calendar size={16} color="var(--text-muted)" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', outline: 'none', colorScheme: 'dark' }}
                                    />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>to</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '13px', outline: 'none', colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        color: 'white',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                    <option value="Asset">Asset</option>
                                    <option value="Liability">Liability</option>
                                </select>

                                <select
                                    value={filterAccount}
                                    onChange={(e) => setFilterAccount(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        color: 'white',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    <option value="All">All Methods</option>
                                    {Array.from(new Set(transactions.map(t => t.paymentMethod)))
                                        .filter(Boolean)
                                        .sort()
                                        .map(method => (
                                            <option key={method} value={method}>{method}</option>
                                        ))}
                                </select>

                                <button
                                    onClick={() => navigate('/accounts/add')}
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
                                        fontWeight: 500,
                                        fontSize: '13px'
                                    }}
                                >
                                    <Plus size={18} /> Add Transaction
                                </button>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Type</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Description</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Amount</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Account</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading transactions...</td></tr>
                                    ) : filteredTransactions.length === 0 ? (
                                        <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</td></tr>
                                    ) : (
                                        filteredTransactions.map((t) => (
                                            <tr key={t.id} className="clickable-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>{t.date}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            background: `${getTypeColor(t.accountType)}20`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: getTypeColor(t.accountType)
                                                        }}>
                                                            {getTypeIcon(t.accountType)}
                                                        </div>
                                                        <span style={{ fontWeight: 500, fontSize: '14px' }}>{t.accountType}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', fontWeight: 500 }}>{t.description}</td>
                                                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>{getDisplayCategory(t)}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        fontSize: '15px',
                                                        color: (t.accountType === 'Income' || t.accountType === 'Asset') ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {(t.accountType === 'Income' || t.accountType === 'Asset') ? '+' : '-'}${t.amount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>{t.paymentMethod}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        background: t.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : t.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                        color: t.status === 'Completed' ? '#10b981' : t.status === 'Pending' ? '#f59e0b' : '#ef4444',
                                                        border: `1px solid ${t.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : t.status === 'Pending' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                                    }}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/accounts/edit/${t.id}`); }}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); t.id && handleDelete(t.id); }}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
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
                </>
            )}

        </div>
    );
};

export default Accounts;
