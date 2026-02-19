import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, ShoppingBag, User, CreditCard, Clock, CheckCircle2, Package, MapPin, Printer } from 'lucide-react';
import Header from '../components/Header';
import { orderService, Order } from '../services/orderService';
import { showToast } from '../components/Toast';
import logo from '../assets/logo-removebg-preview.png';

const OrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchOrderDetails(id);
        }
    }, [id]);

    const fetchOrderDetails = async (orderId: string) => {
        try {
            setLoading(true);
            const data = await orderService.getAll();
            const item = data.find(o => o.id === orderId);
            if (item) {
                setOrder(item);
            } else {
                showToast("Order not found", "error");
                navigate('/orders');
            }
        } catch (error) {
            console.error("Failed to fetch order details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading order information...</div>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'Shipped': return '#3b82f6';
            case 'Processing': return '#8b5cf6';
            case 'Pending': return '#f59e0b';
            case 'Cancelled': return '#ef4444';
            default: return 'var(--text-muted)';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Completed': return 'rgba(16, 185, 129, 0.2)';
            case 'Shipped': return 'rgba(59, 130, 246, 0.2)';
            case 'Processing': return 'rgba(139, 92, 246, 0.2)';
            case 'Pending': return 'rgba(245, 158, 11, 0.2)';
            case 'Cancelled': return 'rgba(239, 68, 68, 0.2)';
            default: return 'rgba(255,255,255,0.05)';
        }
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/orders')}
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
                        <ChevronLeft size={20} /> Back to Orders
                    </button>
                    <Header
                        title={`Order #${order.id?.substring(0, 8).toUpperCase()}`}
                        subtitle={`Placed on ${order.date}`}
                        showSearch={false}
                        showNotifications={false}
                    />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                    <button
                        onClick={() => window.print()}
                        className="btn-print no-print"
                        style={{
                            padding: '10px 24px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <Printer size={18} /> Print Invoice
                    </button>
                    <Link
                        to={`/orders/edit/${order.id}`}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600
                        }}
                    >
                        <Edit size={18} /> Edit Order
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>

                {/* Main Order Content */}
                <div style={{ gridColumn: 'span 8' }}>
                    <div className="glass card" style={{ padding: '32px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShoppingBag size={18} color="var(--primary)" /> Finalized Items
                            </h3>
                            <span style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 600,
                                background: getStatusBg(order.status),
                                color: getStatusColor(order.status)
                            }}>
                                {order.status}
                            </span>
                        </div>

                        <div style={{ width: '100%', marginBottom: '40px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr 1fr', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
                                <span>Product</span>
                                <span style={{ textAlign: 'center' }}>Price</span>
                                <span style={{ textAlign: 'center' }}>Qty</span>
                                <span style={{ textAlign: 'right' }}>Total</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr 1fr', padding: '16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={24} color="var(--primary)" />
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{order.productName || 'Custom Item'}</div>
                                </div>
                                <span style={{ textAlign: 'center' }}>${(order.total / order.items).toFixed(2)}</span>
                                <span style={{ textAlign: 'center' }}>x{order.items}</span>
                                <span style={{ textAlign: 'right', fontWeight: 600 }}>${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '300px', display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                    <span>Shipping</span>
                                    <span>$0.00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '20px', fontWeight: 700 }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--primary)' }}>${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={18} color="var(--primary)" /> Order Timeline
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                    <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '4px 0' }}></div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Order Placed</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.date} - 09:42 AM</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: order.status === 'Processing' || order.status === 'Completed' ? 'var(--primary)' : 'var(--border)' }}></div>
                                    <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '4px 0' }}></div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: order.status === 'Pending' ? 'var(--text-muted)' : 'inherit' }}>Payment {order.payment === 'Paid' ? 'Confirmed' : 'Pending'}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.payment === 'Paid' ? 'Transaction completed successfully' : 'Waiting for payment verification'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: order.status === 'Completed' ? '#10b981' : 'var(--border)' }}></div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: order.status === 'Completed' ? '#10b981' : 'var(--text-muted)' }}>Delivery</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        {order.status === 'Completed' ? 'Package received by customer' :
                                            (order.deliveryDate ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                    <span>Target: {order.deliveryDate}</span>
                                                    {order.priority && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: 600,
                                                            padding: '2px 6px',
                                                            borderRadius: '8px',
                                                            background: `rgba(${order.priority === 'Normal' ? '16, 185, 129' : (order.priority === 'Critical' ? '239, 68, 68' : '245, 158, 11')}, 0.1)`,
                                                            color: order.priority === 'Normal' ? '#10b981' : (order.priority === 'Critical' ? '#ef4444' : '#f59e0b')
                                                        }}>
                                                            {order.priority.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : 'Estimate: Not yet determined')
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Information Sidebar */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={18} color="var(--primary)" /> Customer Profile
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                                {order.customer.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '18px' }}>{order.customer}</div>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Customer ID: #CUST-992</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Email Address</label>
                                <div style={{ fontSize: '14px' }}>{order.customerEmail || 'n/a'}</div>
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                                <div style={{ fontSize: '14px' }}>{order.customerPhone || 'n/a'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={18} color="#ef4444" /> Shipping Address
                        </h3>
                        <div style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                            {order.addressStreet ? (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Street:</span> <br />{order.addressStreet}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>City/District:</span> <br />{order.addressCity}</div>
                                        <div><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>State:</span> <br />{order.addressState}</div>
                                    </div>
                                    <div><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Pin Code:</span> <br />{order.addressZip}</div>
                                </div>
                            ) : (
                                order.customerAddress || 'No shipping address provided.'
                            )}
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CreditCard size={18} color="var(--primary)" /> Payment Information
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{order.payment}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payment Method: Bank Transfer</div>
                            </div>
                            {order.payment === 'Paid' && <CheckCircle2 size={24} color="#10b981" />}
                        </div>
                    </div>
                </div>

            </div>

            {/* Hidden Professional Invoice Template for Printing */}
            <div id="invoice-template" className="only-print">
                <div className="invoice-header">
                    <div className="company-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <img src={logo} alt="Weldora" className="company-logo" style={{ height: '40px', objectFit: 'contain' }} />
                            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '2px', color: '#000', margin: 0 }}>
                                𝐖𝐄𝐋𝐃𝐎𝐑𝐀
                            </h1>
                        </div>
                        <p>Perinthalmanna, Malappuram</p>
                        <p>Kerala 679340</p>
                        <p>+91 81295 83813 | weldora.in@gmail.com</p>
                        <p>weldora.info@gmail.com |  weldora.in</p>
                    </div>
                    <div className="invoice-meta">
                        <h2 className="invoice-title">INVOICE</h2>
                        <p><strong>Invoice #:</strong> WLD-{order.id?.substring(0, 8).toUpperCase()}</p>
                        <p><strong>Date:</strong> {order.date}</p>
                        <p><strong>Due Date:</strong> {new Date(new Date(order.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}</p>
                    </div>
                </div>

                <div className="invoice-addresses">
                    <div className="bill-to">
                        <h3>BILL TO:</h3>
                        <p><strong>{order.customer}</strong></p>
                        <p>{order.customerEmail}</p>
                        <p>{order.customerPhone}</p>
                    </div>
                    <div className="ship-to">
                        <h3>SHIP TO:</h3>
                        {order.addressStreet ? (
                            <>
                                <p style={{ marginBottom: '4px' }}>{order.addressStreet}</p>
                                <p>District: {order.addressCity}</p>
                                <p>State: {order.addressState}</p>
                                <p>Pin: {order.addressZip}</p>
                            </>
                        ) : (
                            <p>{order.customerAddress || 'No shipping address provided.'}</p>
                        )}
                        {order.customerPhone && <p style={{ marginTop: '8px' }}>Phone: {order.customerPhone}</p>}
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{order.productName || 'Standard Industrial Product'}</td>
                            <td>${(order.total / order.items).toFixed(2)}</td>
                            <td>{order.items}</td>
                            <td>${order.total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="invoice-summary">
                    <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax (0%):</span>
                        <span>$0.00</span>
                    </div>
                    <div className="summary-row grand-total">
                        <span>Grand Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="invoice-footer">
                    <p>Thank you for choosing Weldora!</p>
                    <p>Terms: Internal processing completed. Payment status: {order.payment}.</p>
                </div>
            </div>

            <style>{`
                /* Screen only styles */
                .only-print { display: none; }

                @media print {
                    @page { size: A4; margin: 0; }
                    /* Hide everything else */
                    body * { visibility: hidden; }
                    #invoice-template, #invoice-template * { visibility: visible; }
                    #invoice-template { 
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        min-height: 297mm;
                        padding: 20mm;
                        color: black !important;
                        background: white !important;
                        box-sizing: border-box;
                    }
                    
                    .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 40px; }
                    .company-logo { filter: invert(1); mix-blend-mode: multiply; }
                    .invoice-title { font-size: 48px; color: #333; margin-bottom: 10px; }
                    
                    .invoice-addresses { display: flex; gap: 60px; margin-bottom: 40px; }
                    .invoice-addresses h3 { font-size: 14px; color: #666; margin-bottom: 12px; }
                    
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    .invoice-table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; color: #666; }
                    .invoice-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; }
                    
                    .invoice-summary { margin-left: auto; width: 250px; }
                    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; color: #444; }
                    .grand-total { border-top: 2px solid #333; margin-top: 10px; padding-top: 12px; font-size: 20px; font-weight: 800; color: #000; }
                    
                    .invoice-footer { margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999; }
                }
            `}</style>
        </div >
    );
};

export default OrderDetails;
