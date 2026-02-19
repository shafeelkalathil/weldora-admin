import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Plus, Trash2, Edit } from 'lucide-react';
import Header from '../components/Header';
import { orderService, Order } from '../services/orderService';
import { showToast, showConfirm } from '../components/Toast';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const ordersData = await orderService.getAll();
            setOrders(ordersData);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            showToast("Failed to load orders", "error");
        } finally {
            setLoading(false);
        }
    };

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

    const handleDelete = (id: string) => {
        showConfirm("Are you sure you want to delete this order? This action is permanent.", async () => {
            try {
                await orderService.delete(id);
                showToast("Order deleted successfully", "success");
                fetchData();
            } catch (error) {
                console.error("Error deleting order", error);
                showToast("Failed to delete order", "error");
            }
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <Header
                title="Orders"
                subtitle="Track and manage customer orders."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="glass card">
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                        <div style={{ flex: 0 }}>
                            {/* Search moved to Header */}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    padding: '10px 40px 10px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    height: '100%'
                                }}
                            >
                                <option value="All">All Status</option>
                                <option value="Completed">Completed</option>
                                <option value="Processing">Processing</option>
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <Filter size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/orders/add')}
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
                        <Plus size={18} /> Add Order
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Order ID</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Priority</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Product / Qty</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Total</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Payment</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id || Math.random()}
                                        className={`clickable-row ${order.priority === 'Critical' || order.priority === 'Urgent' ? 'blink-row' : ''}`}
                                        onClick={() => navigate(`/orders/view/${order.id}`)}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <td style={{ padding: '16px', fontWeight: 600, fontFamily: 'monospace' }}>{(order.id || '').substring(0, 8)}...</td>
                                        <td style={{ padding: '16px' }}>
                                            <div>{order.customer}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{order.date}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    background: order.priority === 'Critical'
                                                        ? 'rgba(239, 68, 68, 0.2)'
                                                        : (order.priority === 'Urgent' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                                                    color: order.priority === 'Critical'
                                                        ? '#ef4444'
                                                        : (order.priority === 'Urgent' ? '#f59e0b' : '#10b981'),
                                                    border: `1px solid ${order.priority === 'Critical' ? '#ef4444' : (order.priority === 'Urgent' ? '#f59e0b' : '#10b981')}`
                                                }}
                                            >
                                                {order.priority || 'Normal'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                                            <div style={{ color: 'white' }}>{order.productName || 'Custom Item'}</div>
                                            <div style={{ fontSize: '12px' }}>Qty: {order.items}</div>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                color: order.payment === 'Paid' ? '#10b981' : (order.payment === 'Refunded' ? 'var(--text-muted)' : '#f59e0b'),
                                                fontWeight: 500,
                                                fontSize: '13px'
                                            }}>
                                                {order.payment}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                background: getStatusBg(order.status),
                                                color: getStatusColor(order.status)
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/orders/view/${order.id}`); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    title="View Details"
                                                >
                                                    <Eye size={18} color="var(--primary)" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/orders/edit/${order.id}`); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    title="Edit"
                                                >
                                                    <Edit size={18} color="var(--text-muted)" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); order.id && handleDelete(order.id); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
                                                    title="Delete"
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
            <style>{`
                @keyframes blink-row {
                    0% { background-color: rgba(255, 255, 255, 0.02); }
                    50% { background-color: rgba(255, 255, 255, 0.15); }
                    100% { background-color: rgba(255, 255, 255, 0.02); }
                }
                .blink-row {
                    animation: blink-row 1.5s infinite ease-in-out;
                    border-left: 3px solid #ef4444; /* Add a red indicator */
                }
            `}</style>
        </div>
    );
};

export default Orders;
