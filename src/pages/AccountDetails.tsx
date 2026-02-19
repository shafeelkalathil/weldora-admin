
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Calendar, DollarSign, FileText, Tag, CreditCard, User, AlertCircle, Hash, CheckCircle, XCircle, Clock } from 'lucide-react';
import Header from '../components/Header';
import { accountService, AccountTransaction } from '../services/accountService';
import { showToast, showConfirm } from '../components/Toast';

const AccountDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [transaction, setTransaction] = useState<AccountTransaction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTransaction(id);
        }
    }, [id]);

    const fetchTransaction = async (transactionId: string) => {
        try {
            setLoading(true);
            const allTransactions = await accountService.getAll();
            const found = allTransactions.find(t => t.id === transactionId);

            if (found) {
                setTransaction(found);
            } else {
                showToast("Transaction not found", "error");
                navigate('/accounts');
            }
        } catch (error) {
            console.error("Failed to fetch transaction details", error);
            showToast("Failed to load transaction details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!transaction?.id) return;
        showConfirm("Are you sure you want to delete this transaction?", async () => {
            try {
                await accountService.delete(transaction.id!);
                showToast("Transaction deleted successfully", "success");
                navigate('/accounts');
            } catch (error) {
                showToast("Failed to delete transaction", "error");
            }
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading transaction details...</div>
            </div>
        );
    }

    if (!transaction) return null;

    const isCredit = transaction.accountType === 'Income' || transaction.accountType === 'Liability';
    const amountColor = isCredit ? '#10b981' : '#ef4444';
    const amountPrefix = isCredit ? '+' : '-';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'Pending': return '#f59e0b';
            case 'Cancelled': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle size={16} />;
            case 'Pending': return <Clock size={16} />;
            case 'Cancelled': return <XCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/accounts')}
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
                    <ChevronLeft size={20} /> Back to Accounts
                </button>
                <div className="flex-between">
                    <Header
                        title={`Transaction Details`}
                        subtitle={`Ref: ${transaction.transactionNumber || 'N/A'}`}
                        showSearch={false}
                        showNotifications={false}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => navigate(`/accounts/edit/${transaction.id}`)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                color: 'white', cursor: 'pointer', fontWeight: 500
                            }}
                        >
                            <Edit size={18} /> Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                                color: '#ef4444', cursor: 'pointer', fontWeight: 500
                            }}
                        >
                            <AlertCircle size={18} /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Main Details */}
                <div className="glass card" style={{ padding: '32px' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        paddingBottom: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px'
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Transaction Amount</div>
                            <div style={{ fontSize: '36px', fontWeight: 700, color: amountColor }}>
                                {amountPrefix}${transaction.amount.toFixed(2)}
                            </div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                marginTop: '8px', padding: '4px 10px', borderRadius: '20px',
                                background: `${getStatusColor(transaction.status)}20`,
                                color: getStatusColor(transaction.status),
                                fontSize: '12px', fontWeight: 600
                            }}>
                                {getStatusIcon(transaction.status)} {transaction.status.toUpperCase()}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</div>
                            <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <Calendar size={18} color="var(--primary)" /> {transaction.date}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <label className="detail-label">Description</label>
                            <div className="detail-value" style={{ minHeight: '60px' }}>
                                {transaction.description}
                            </div>
                        </div>
                        <div>
                            <label className="detail-label">Account Category</label>
                            <div className="detail-value flex-center-start">
                                <Tag size={16} style={{ marginRight: '8px', opacity: 0.7 }} />
                                {transaction.accountName}
                                <span style={{
                                    marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)'
                                }}>
                                    {transaction.accountType}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="detail-label">Payment Method</label>
                            <div className="detail-value flex-center-start">
                                <CreditCard size={16} style={{ marginRight: '8px', opacity: 0.7 }} />
                                {transaction.paymentMethod}
                            </div>
                        </div>
                        <div>
                            <label className="detail-label">Transaction ID</label>
                            <div className="detail-value flex-center-start" style={{ fontFamily: 'monospace' }}>
                                <Hash size={16} style={{ marginRight: '8px', opacity: 0.7 }} />
                                {transaction.transactionNumber || '-'}
                            </div>
                        </div>

                        {(transaction.partyName) && (
                            <div>
                                <label className="detail-label">Party / Payer / Payee</label>
                                <div className="detail-value flex-center-start">
                                    <User size={16} style={{ marginRight: '8px', opacity: 0.7 }} />
                                    {transaction.partyName}
                                    {transaction.partyType && (
                                        <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>({transaction.partyType})</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {(transaction.referenceId) && (
                            <div>
                                <label className="detail-label">Reference ID</label>
                                <div className="detail-value flex-center-start">
                                    <FileText size={16} style={{ marginRight: '8px', opacity: 0.7 }} />
                                    {transaction.referenceId}
                                    {transaction.referenceType && (
                                        <span style={{ marginLeft: 'auto', fontSize: '11px' }}>{transaction.referenceType}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {transaction.notes && (
                        <div style={{ marginTop: '24px' }}>
                            <label className="detail-label">Notes</label>
                            <div className="detail-value" style={{ whiteSpace: 'pre-line' }}>
                                {transaction.notes}
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Info / Side Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                style={{
                                    padding: '12px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                    color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '13px'
                                }}
                                onClick={() => showToast("Functionality coming soon: Download Receipt", "info")}
                            >
                                📥 Download Receipt
                            </button>
                            <button
                                style={{
                                    padding: '12px', borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                    color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '13px'
                                }}
                                onClick={() => showToast("Functionality coming soon: Email Details", "info")}
                            >
                                📧 Email Details
                            </button>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Metadata</h3>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>Created: {transaction.createdAt?.split('T')[0] || 'Unknown'}</div>
                            {transaction.updatedAt && <div>Updated: {transaction.updatedAt.split('T')[0]}</div>}
                            {transaction.createdBy && <div>By: {transaction.createdBy}</div>}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .detail-label { display: block; font-size: 13px; color: var(--text-muted); marginBottom: 8px; }
                .detail-value { font-size: 15px; color: white; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--border); }
                .flex-center-start { display: flex; align-items: center; }
            `}</style>
        </div>
    );
};

export default AccountDetails;
