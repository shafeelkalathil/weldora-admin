import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MessageSquare, Repeat, Star, Send } from 'lucide-react';
import Header from '../components/Header';
import { customerService, Customer } from '../services/customerService';
import { reviewService, Review } from '../services/reviewService';
import { showToast, showConfirm } from '../components/Toast';

const Customers = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'list' | 'reviews' | 'reconnect'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [customersData, reviewsData] = await Promise.all([
                customerService.getAll(),
                reviewService.getAll()
            ]);
            setCustomers(customersData);
            setReviews(reviewsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            showToast("Failed to load customer data", "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inactiveCustomers = customers.filter(c => c.status === 'Inactive' || (new Date().getTime() - new Date(c.lastOrder).getTime() > 30 * 24 * 60 * 60 * 1000));

    const handleDeleteCustomer = (id: string | undefined) => {
        if (!id) return;
        showConfirm("Are you sure you want to delete this customer? This will remove all their data from the system.", async () => {
            try {
                await customerService.delete(id);
                showToast("Customer deleted successfully", "success");
                fetchData();
            } catch (error) {
                console.error("Error deleting customer", error);
                showToast("Failed to delete customer", "error");
            }
        });
    };

    const handleDeleteReview = (id: string | undefined) => {
        if (!id) return;
        showConfirm("Are you sure you want to delete this review? It will be removed from the public list.", async () => {
            try {
                await reviewService.delete(id);
                showToast("Review deleted successfully", "success");
                fetchData();
            } catch (error) {
                console.error("Error deleting review", error);
                showToast("Failed to delete review", "error");
            }
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        fill={star <= rating ? "#f59e0b" : "none"}
                        color={star <= rating ? "#f59e0b" : "var(--text-muted)"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <Header title="Customer Management" subtitle="Manage relationships, reviews, and re-engagement." />

            {/* Stats */}
            <div className="grid-dashboard" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="glass card">
                    <div className="flex-between">
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Customers</p>
                            <h3 style={{ fontSize: '28px', marginTop: '4px' }}>{customers.length}</h3>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ color: 'var(--primary)' }}>👥</div>
                        </div>
                    </div>
                </div>
                <div className="glass card">
                    <div className="flex-between">
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Average Rating</p>
                            <h3 style={{ fontSize: '28px', marginTop: '4px' }}>4.8</h3>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={24} color="#f59e0b" />
                        </div>
                    </div>
                </div>
                <div className="glass card">
                    <div className="flex-between">
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Need Reconnect</p>
                            <h3 style={{ fontSize: '28px', marginTop: '4px' }}>{inactiveCustomers.length}</h3>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Repeat size={24} color="#ef4444" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setActiveTab('list')}
                        style={{ padding: '20px 32px', background: activeTab === 'list' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        All Customers
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        style={{ padding: '20px 32px', background: activeTab === 'reviews' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Reviews & Ratings
                    </button>
                    <button
                        onClick={() => setActiveTab('reconnect')}
                        style={{ padding: '20px 32px', background: activeTab === 'reconnect' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'reconnect' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'reconnect' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Reconnect Helps
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {activeTab === 'list' && (
                        <>
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <div style={{ position: 'relative', width: '300px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                    />
                                </div>
                                <button style={{ padding: '10px 16px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <Filter size={18} /> Filters
                                </button>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Customer Details</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Orders</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Last Order</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Rating</th>
                                        <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((c) => (
                                        <tr
                                            key={c.id || Math.random()}
                                            className="clickable-row"
                                            onClick={() => navigate(`/customers/view/${c.id}`)}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                        >
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 500, fontSize: '15px' }}>{c.name}</div>
                                                {c.email && <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>📧 {c.email}</div>}
                                                {c.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>📞 {c.phone}</div>}
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                                                    📍 {c.street ? `${c.street} - ${c.city} - ${c.state} - ${c.zip}` : c.address}
                                                </div>
                                                {c.createdAt && <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px' }}>Joined: {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                                            </td>
                                            <td style={{ padding: '16px' }}>{c.totalOrders}</td>
                                            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{c.lastOrder}</td>
                                            <td style={{ padding: '16px' }}>
                                                {c.rating > 0 ? renderStars(c.rating) : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No reviews</span>}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id); }}
                                                    style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'reviews' && (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {reviews.map((r) => (
                                <div key={r.id || Math.random()} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{r.customerName.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{r.customerName}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.date}</div>
                                                {r.productName && <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '2px' }}>Product: {r.productName}</div>}
                                            </div>
                                        </div>
                                        {renderStars(r.rating)}
                                    </div>
                                    <p style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>"{r.comment}"</p>
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <button style={{ padding: '6px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Reply</button>
                                        <button onClick={() => handleDeleteReview(r.id)} style={{ padding: '6px 16px', borderRadius: '20px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                            <button style={{ padding: '12px', borderRadius: '12px', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                Request more reviews from recent customers
                            </button>
                        </div>
                    )}

                    {activeTab === 'reconnect' && (
                        <div>
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
                                <strong>Reconnect Helps:</strong> You have {inactiveCustomers.length} customers who haven't ordered in 30+ days. Send them a personalized offer to bring them back!
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Customer</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Last Activity</th>
                                        <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Suggested Action</th>
                                        <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inactiveCustomers.map((c) => (
                                        <tr key={c.id || Math.random()} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px', fontWeight: 500 }}>{c.name}</td>
                                            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{c.lastOrder} <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>Inactive</span></td>
                                            <td style={{ padding: '16px' }}>Send "We Miss You" 10% Discount</td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <button style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginLeft: 'auto'
                                                }}>
                                                    <Send size={14} /> Send Offer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Customers;
