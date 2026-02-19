import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, User, ShoppingBag, CreditCard, Calendar, MapPin, Mail, Phone, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { orderService, Order } from '../services/orderService';
import { productService, Product } from '../services/productService';
import { customerService } from '../services/customerService';

const OrderForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    const [order, setOrder] = useState({
        customer: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        date: new Date().toISOString().split('T')[0],
        deliveryDate: (() => {
            const d = new Date();
            d.setDate(d.getDate() + 5);
            return d.toISOString().split('T')[0];
        })(),
        total: 0,
        status: 'Pending',
        payment: 'Unpaid',
        items: 1,
        productId: '',
        productName: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, [id, isEdit]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [productsData, ordersData] = await Promise.all([
                productService.getAll(),
                isEdit && id ? orderService.getAll() : Promise.resolve([])
            ]);

            setProducts(productsData);

            if (isEdit && id) {
                const existingOrder = ordersData.find(o => o.id === id);
                if (existingOrder) {
                    setOrder({
                        customer: existingOrder.customer,
                        customerEmail: existingOrder.customerEmail || '',
                        customerPhone: existingOrder.customerPhone || '',
                        customerAddress: existingOrder.customerAddress || '',
                        addressStreet: existingOrder.addressStreet || existingOrder.customerAddress || '',
                        addressCity: existingOrder.addressCity || '',
                        addressState: existingOrder.addressState || '',
                        addressZip: existingOrder.addressZip || '',
                        date: existingOrder.date,
                        deliveryDate: existingOrder.deliveryDate || '',
                        total: existingOrder.total,
                        status: existingOrder.status,
                        payment: existingOrder.payment,
                        items: existingOrder.items,
                        productId: existingOrder.productId || '',
                        productName: existingOrder.productName || ''
                    });
                } else {
                    alert("Order not found");
                    navigate('/orders');
                }
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!order.customer || !order.productId || !order.items || !order.addressStreet || !order.addressCity || !order.addressState || !order.addressZip) {
            alert("Please fill in required fields (Customer, Product, Quantity, and Full Address)");
            return;
        }

        try {
            setSaving(true);

            // 1. Fetch fresh product data for stock validation
            const freshProduct = await productService.getById(order.productId);
            if (!freshProduct) {
                throw new Error("Selected product no longer exists.");
            }

            // 2. Strict Stock Check (Only for new orders to avoid complication with edits)
            if (!isEdit && freshProduct.stock < order.items) {
                throw new Error(`Insufficient stock! Only ${freshProduct.stock} units available.`);
            }

            // Construct full address
            const fullAddress = `${order.addressStreet} - ${order.addressCity} - ${order.addressState} - ${order.addressZip}`;

            const today = new Date().toISOString().split('T')[0];
            let priority = 'Normal';
            if (order.deliveryDate) {
                if (order.deliveryDate < today) priority = 'Critical';
                else if (order.deliveryDate === today) priority = 'Urgent';
            }

            const orderData = {
                ...order,
                customerAddress: fullAddress,
                total: freshProduct.price * order.items, // Use fresh price
                productName: freshProduct.name,
                items: Number(order.items),
                status: order.status as any,
                payment: order.payment as any,
                priority: priority as any,
                deliveryDate: order.deliveryDate
            };

            if (isEdit && id) {
                await orderService.update(id, orderData);
            } else {
                // 1. Add Order
                await orderService.add(orderData);

                // 2. Decrement Stock (using fresh data)
                await productService.update(freshProduct.id!, {
                    stock: freshProduct.stock - order.items
                });

                // 3. Customer logic: Sync with 'customers' collection
                let existingCustomer = null;

                // Try to find by Email first
                if (order.customerEmail) {
                    existingCustomer = await customerService.findByEmail(order.customerEmail);
                }

                // If not found by email, try Phone
                if (!existingCustomer && order.customerPhone) {
                    existingCustomer = await customerService.findByPhone(order.customerPhone);
                }

                if (!existingCustomer) {
                    // Create new customer
                    await customerService.add({
                        name: order.customer,
                        email: order.customerEmail || undefined,
                        phone: order.customerPhone || undefined,
                        address: fullAddress,
                        street: order.addressStreet,
                        city: order.addressCity,
                        state: order.addressState,
                        zip: order.addressZip,
                        totalOrders: 1,
                        lastOrder: order.date,
                        rating: 5, // Default new customer rating
                        status: 'Active',
                        createdAt: new Date().toISOString()
                    });
                } else {
                    // Update existing customer
                    await customerService.update(existingCustomer.id!, {
                        totalOrders: (existingCustomer.totalOrders || 0) + 1,
                        lastOrder: order.date,
                        // Update address info with latest
                        address: fullAddress,
                        street: order.addressStreet,
                        city: order.addressCity,
                        state: order.addressState,
                        zip: order.addressZip
                    });
                }
            }

            navigate('/orders');
        } catch (error: any) {
            console.error("Failed to save order", error);
            alert(`Error saving order: ${error.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading order details...</div>
            </div>
        );
    }

    const selectedProduct = products.find(p => p.id === order.productId);

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
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
                    title={isEdit ? "Edit Order" : "Place New Order"}
                    subtitle={isEdit ? `Updating order for ${order.customer}` : "Create a new sales transaction."}
                />
            </div>

            <form onSubmit={handleSave} className="glass card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>

                    {/* Customer Information */}
                    <div style={{ gridColumn: 'span 7' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <User size={18} /> Customer Information
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={order.customer}
                                    onChange={(e) => setOrder({ ...order, customer: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                    placeholder="Enter customer name"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="email"
                                        value={order.customerEmail}
                                        onChange={(e) => setOrder({ ...order, customerEmail: e.target.value })}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="tel"
                                        value={order.customerPhone}
                                        onChange={(e) => setOrder({ ...order, customerPhone: e.target.value })}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                        placeholder="+1 234..."
                                    />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Shipping Address *</label>

                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {/* Street Address */}
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                                        <input
                                            required
                                            value={order.addressStreet}
                                            onChange={(e) => setOrder({ ...order, addressStreet: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                            placeholder="Street House No, Building..."
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <input
                                            required
                                            value={order.addressCity}
                                            onChange={(e) => setOrder({ ...order, addressCity: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                            placeholder="District / City *"
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <input
                                                required
                                                value={order.addressState}
                                                onChange={(e) => setOrder({ ...order, addressState: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                                placeholder="State *"
                                            />
                                            <input
                                                required
                                                value={order.addressZip}
                                                onChange={(e) => setOrder({ ...order, addressZip: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                                placeholder="Pin Code *"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div style={{ gridColumn: 'span 5', borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                            <ShoppingBag size={18} /> Order Items
                        </h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Product *</label>
                                <select
                                    required
                                    value={order.productId}
                                    onChange={(e) => setOrder({ ...order, productId: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                >
                                    <option value="">-- Select Product --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id} disabled={p.stock <= 0 && !isEdit}>
                                            {p.name} (${p.price})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={order.items}
                                        onChange={(e) => setOrder({ ...order, items: parseInt(e.target.value) || 1 })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: !isEdit && selectedProduct && selectedProduct.stock < order.items ? '1px solid #ef4444' : '1px solid var(--border)',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    />
                                    {!isEdit && selectedProduct && selectedProduct.stock < order.items && (
                                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertCircle size={12} />
                                            <span>Insufficient stock! Only {selectedProduct.stock} available.</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Order Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            value={order.date}
                                            onChange={(e) => setOrder({ ...order, date: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Target Delivery Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            min={(() => {
                                                const orderBase = new Date(order.date || new Date());
                                                orderBase.setDate(orderBase.getDate() + 5);
                                                const minOrderDate = orderBase.toISOString().split('T')[0];

                                                const today = new Date().toISOString().split('T')[0];

                                                return minOrderDate > today ? minOrderDate : today;
                                            })()}
                                            value={order.deliveryDate}
                                            onChange={(e) => setOrder({ ...order, deliveryDate: e.target.value })}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                        />
                                    </div>
                                    {/* Priority Indicator */}
                                    {order.deliveryDate && (
                                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
                                            {(() => {
                                                const today = new Date().toISOString().split('T')[0];
                                                let priority = 'Normal';
                                                let color = '#10b981';
                                                let message = 'Standard delivery schedule';

                                                if (order.deliveryDate < today) {
                                                    priority = 'Critical';
                                                    color = '#ef4444';
                                                    message = 'Delivery date is in the past!';
                                                } else if (order.deliveryDate === today) {
                                                    priority = 'Urgent';
                                                    color = '#f59e0b';
                                                    message = 'Due for delivery today';
                                                }

                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                        <span style={{ fontWeight: 600, color: color, padding: '4px 10px', borderRadius: '8px', background: `rgba(${color === '#10b981' ? '16, 185, 129' : (color === '#ef4444' ? '239, 68, 68' : '245, 158, 11')}, 0.1)`, border: `1px solid rgba(${color === '#10b981' ? '16, 185, 129' : (color === '#ef4444' ? '239, 68, 68' : '245, 158, 11')}, 0.2)` }}>
                                                            {priority} Priority
                                                        </span>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                                            {message}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Payment Status</label>
                                    <select
                                        value={order.payment}
                                        onChange={(e) => setOrder({ ...order, payment: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                    >
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Order Status</label>
                                    <select
                                        value={order.status}
                                        onChange={(e) => setOrder({ ...order, status: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Order Summary Box */}
                            <div style={{ marginTop: '20px', padding: '24px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                    <span>Unit Price:</span>
                                    <span>${selectedProduct?.price.toFixed(2) || '0.00'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                    <span>Quantity:</span>
                                    <span>x {order.items}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '18px' }}>
                                    <span>Total Amount:</span>
                                    <span style={{ color: 'var(--primary)' }}>
                                        ${((selectedProduct?.price || 0) * order.items).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/orders')}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-submit"
                    >
                        {saving ? 'Processing...' : <><Save size={18} /> {isEdit ? 'Update Order' : 'Complete Order'}</>}
                    </button>
                </div>
            </form>
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

export default OrderForm;
