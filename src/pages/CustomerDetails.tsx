import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Mail, Phone, MapPin, DollarSign, Calendar, AlertTriangle, Star, CheckCircle, ShoppingBag, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import { customerService, Customer } from '../services/customerService';
import { orderService, Order } from '../services/orderService';
import { reviewService } from '../services/reviewService'; // Assumption: reviewService exists
import { productService } from '../services/productService';
import { showToast } from '../components/Toast';

const CustomerDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [creditAlert, setCreditAlert] = useState(false);
    const [reviewMode, setReviewMode] = useState<string | null>(null); // Product ID for review
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (customerId: string) => {
        try {
            setLoading(true);
            const customersData = await customerService.getAll();
            const member = customersData.find(c => c.id === customerId);

            if (member) {
                setCustomer(member);

                // Fetch Orders for this customer
                const allOrders = await orderService.getAll();
                const customerOrders = allOrders.filter(o =>
                    o.customer === member.name ||
                    (member.email && o.customerEmail === member.email)
                );
                setOrders(customerOrders);

                // Credit Alert Logic
                const today = new Date().toISOString().split('T')[0];
                const hasCreditIssue = customerOrders.some(o =>
                    (o.payment === 'Unpaid' || o.payment === 'Refunded') && // Refunded often implies money flow monitoring, but 'Unpaid' is main target
                    o.status !== 'Cancelled' &&
                    o.deliveryDate && o.deliveryDate < today
                );
                setCreditAlert(hasCreditIssue);

            } else {
                showToast("Customer not found", "error");
                navigate('/customers');
            }
        } catch (error) {
            console.error("Failed to fetch details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (productName: string) => {
        if (!customer) return;
        try {
            await reviewService.add({
                customerName: customer.name,
                productName: productName,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                date: new Date().toISOString().split('T')[0]
            });
            showToast("Review submitted successfully", "success");
            setReviewMode(null);
            setReviewForm({ rating: 5, comment: '' });
        } catch (error) {
            console.error(error);
            showToast("Failed to submit review", "error");
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading customer profile...</div>
            </div>
        );
    }

    if (!customer) return null;

    // Get unique products purchased
    const purchasedProducts = Array.from(new Set(orders.map(o => o.productName))).filter((name): name is string => Boolean(name));

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/customers')}
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
                        <ChevronLeft size={20} /> Back to Customers
                    </button>
                    <Header
                        title={customer.name}
                        subtitle="Customer Profile & History"
                        showSearch={false}
                        showNotifications={false}
                    />
                </div>
            </div>

            {/* Credit Alert Section */}
            {creditAlert && (
                <div className="animate-pulse-slow" style={{
                    marginBottom: '32px',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DollarSign size={24} color="white" />
                    </div>
                    <div>
                        <h3 style={{ color: '#ef4444', fontSize: '18px', marginBottom: '4px' }}>Credit Alert: Payment Overdue</h3>
                        <p style={{ color: '#fca5a5', fontSize: '14px' }}>This customer has unpaid orders for items that have already been delivered/shipped. Please follow up immediately.</p>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="glass card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            margin: '0 auto 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>
                            {customer.name.charAt(0)}
                        </div>
                        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{customer.name}</h2>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Customer since {new Date(customer.createdAt || Date.now()).getFullYear()}</div>

                        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                            <div className="contact-row">
                                <Mail size={16} color="var(--primary)" /> {customer.email || 'No Email'}
                            </div>
                            <div className="contact-row">
                                <Phone size={16} color="var(--primary)" /> {customer.phone || 'No Phone'}
                            </div>
                            <div className="contact-row">
                                <MapPin size={16} color="#ef4444" /> {customer.street ? `${customer.street}, ${customer.city}` : customer.address}
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>Purchase Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Orders</span>
                            <span style={{ fontWeight: 600 }}>{orders.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Spent</span>
                            <span style={{ fontWeight: 600, color: '#10b981' }}>${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Write Reviews Section */}
                    {purchasedProducts.length > 0 && (
                        <div className="glass card">
                            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MessageSquare size={18} color="var(--primary)" /> Write Product Review
                            </h3>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {purchasedProducts.map((prodName, idx) => (
                                    <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                                        <div className="flex-between">
                                            <div style={{ fontWeight: 600 }}>{prodName}</div>
                                            {reviewMode === prodName ? (
                                                <button onClick={() => setReviewMode(null)} style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                            ) : (
                                                <button onClick={() => setReviewMode(prodName)} style={{ padding: '6px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Review</button>
                                            )}
                                        </div>

                                        {reviewMode === prodName && (
                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                                                <div style={{ marginBottom: '12px', display: 'flex', gap: '4px' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star
                                                            key={star}
                                                            size={20}
                                                            fill={star <= reviewForm.rating ? "#f59e0b" : "none"}
                                                            color={star <= reviewForm.rating ? "#f59e0b" : "var(--text-muted)"}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        />
                                                    ))}
                                                </div>
                                                <textarea
                                                    placeholder="Write your experience..."
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', minHeight: '80px', marginBottom: '12px' }}
                                                />
                                                <button onClick={() => handleReviewSubmit(prodName)} style={{ padding: '8px 20px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Submit Review</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Orders */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShoppingBag size={18} color="var(--primary)" /> Recent Orders
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>Order ID</th>
                                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>Product</th>
                                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>Amount</th>
                                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>Credit Check</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', fontFamily: 'monospace' }}>#{order.id?.substring(0, 6)}</td>
                                            <td style={{ padding: '12px' }}>{order.date}</td>
                                            <td style={{ padding: '12px' }}>{order.productName}</td>
                                            <td style={{ padding: '12px' }}>${order.total}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>{order.status}</span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {order.payment === 'Unpaid' ? (
                                                    (order.deliveryDate && order.deliveryDate < new Date().toISOString().split('T')[0]) ?
                                                        <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '11px', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '4px' }}>OVERDUE</span> :
                                                        <span style={{ color: '#f59e0b', fontSize: '11px' }}>Unpaid</span>
                                                ) : (
                                                    <span style={{ color: '#10b981', fontSize: '11px' }}>Paid</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .contact-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: var(--text-main); font-size: 14px; }
                .animate-pulse-slow { animation: pulse 3s infinite; }
            `}</style>
        </div>
    );
};

export default CustomerDetails;
