import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, TrendingUp, Package, AlertTriangle, Clock, DollarSign, Boxes, PhoneCall, Calendar } from 'lucide-react';
import StatCard from '../components/StatCard';
import Header from '../components/Header';
import { staffService } from '../services/staffService';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { materialService } from '../services/materialService';
import { enquiryService } from '../services/enquiryService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStaff: 0,
        activeOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        lowStockItems: 0,
        criticalOrders: 0,
        totalEnquiries: 0,
        newEnquiries: 0,
        followUpsDue: 0,
        convertedEnquiries: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStockMaterials, setLowStockMaterials] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [staff, orders, products, customers, materials, enquiries] = await Promise.all([
                staffService.getAll(),
                orderService.getAll(),
                productService.getAll(),
                customerService.getAll(),
                materialService.getAll(),
                enquiryService.getAll()
            ]);

            // Calculate stats
            const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
            const totalRevenue = orders
                .filter(o => o.payment === 'Paid')
                .reduce((sum, o) => sum + (o.total || 0), 0);

            const today = new Date().toISOString().split('T')[0];
            const criticalOrders = orders.filter(o =>
                o.deliveryDate && o.deliveryDate <= today &&
                o.status !== 'Completed' && o.status !== 'Cancelled'
            ).length;

            // Calculate Monthly Sales Data for Chart
            const monthlySales = orders
                .filter(o => o.status !== 'Cancelled')
                .reduce((acc: any, order) => {
                    const date = new Date(order.date);
                    const monthYear = date.toLocaleString('default', { month: 'short' }); // e.g., "Jan"

                    if (!acc[monthYear]) {
                        acc[monthYear] = 0;
                    }
                    acc[monthYear] += order.total || 0;
                    return acc;
                }, {});

            // Convert to array format for Recharts and sort by month index
            const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const chartData = Object.keys(monthlySales).map(month => ({
                name: month,
                sales: monthlySales[month]
            })).sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));

            setSalesData(chartData);

            // Low stock materials (less than 25% remaining)
            const lowStock = materials.filter(m => {
                const inStock = m.quantity - (m.usedQuantity || 0);
                const stockPercentage = (inStock / m.quantity) * 100;
                return stockPercentage < 25;
            });

            // Enquiry stats
            const newEnquiries = enquiries.filter(e => e.status === 'New').length;
            const convertedEnquiries = enquiries.filter(e => e.status === 'Converted').length;

            // Follow-ups due today or past
            const followUpsDue = enquiries.filter(e => {
                if (!e.nextFollowUpDate) return false;
                return e.nextFollowUpDate <= today && e.status !== 'Converted' && e.status !== 'Lost';
            }).length;

            setStats({
                totalStaff: staff.length,
                activeOrders: activeOrders,
                totalRevenue: totalRevenue,
                totalCustomers: customers.length,
                lowStockItems: lowStock.length,
                criticalOrders: criticalOrders,
                totalEnquiries: enquiries.length,
                newEnquiries: newEnquiries,
                followUpsDue: followUpsDue,
                convertedEnquiries: convertedEnquiries
            });

            // Get 5 most recent orders
            const sortedOrders = [...orders].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            ).slice(0, 5);
            setRecentOrders(sortedOrders);

            setLowStockMaterials(lowStock.slice(0, 5));

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            'Pending': '#f59e0b',
            'Processing': '#3b82f6',
            'Shipped': '#8b5cf6',
            'Completed': '#10b981',
            'Cancelled': '#ef4444'
        };
        return colors[status] || '#6366f1';
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <Header />

            {/* Critical Alerts */}
            {(stats.criticalOrders > 0 || stats.lowStockItems > 0 || stats.followUpsDue > 0) && (
                <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {stats.criticalOrders > 0 && (
                        <div className="animate-pulse" style={{
                            flex: 1,
                            minWidth: '280px',
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer'
                        }}
                            onClick={() => navigate('/orders')}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={24} color="white" />
                            </div>
                            <div>
                                <h4 style={{ color: '#ef4444', fontSize: '16px', marginBottom: '4px' }}>{stats.criticalOrders} Critical Orders</h4>
                                <p style={{ color: '#fca5a5', fontSize: '13px' }}>Orders past delivery date require immediate attention</p>
                            </div>
                        </div>
                    )}
                    {stats.followUpsDue > 0 && (
                        <div className="animate-pulse" style={{
                            flex: 1,
                            minWidth: '280px',
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid #8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer'
                        }}
                            onClick={() => navigate('/enquiries')}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={24} color="white" />
                            </div>
                            <div>
                                <h4 style={{ color: '#8b5cf6', fontSize: '16px', marginBottom: '4px' }}>{stats.followUpsDue} Follow-ups Due</h4>
                                <p style={{ color: '#c4b5fd', fontSize: '13px' }}>Customer enquiries need follow-up today</p>
                            </div>
                        </div>
                    )}
                    {stats.lowStockItems > 0 && (
                        <div style={{
                            flex: 1,
                            minWidth: '280px',
                            padding: '20px',
                            borderRadius: '16px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid #f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer'
                        }}
                            onClick={() => navigate('/materials')}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Boxes size={24} color="white" />
                            </div>
                            <div>
                                <h4 style={{ color: '#f59e0b', fontSize: '16px', marginBottom: '4px' }}>{stats.lowStockItems} Low Stock Items</h4>
                                <p style={{ color: '#fbbf24', fontSize: '13px' }}>Materials running low, reorder soon</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid-dashboard" style={{ marginBottom: '40px' }}>
                <StatCard
                    title="Total Staff"
                    value={stats.totalStaff.toString()}
                    icon={Users}
                    trend="up"
                    trendValue="Active"
                    color="#6366f1"
                />
                <StatCard
                    title="Active Orders"
                    value={stats.activeOrders.toString()}
                    icon={ShoppingCart}
                    trend={stats.activeOrders > 10 ? "up" : "down"}
                    trendValue={`${stats.activeOrders} in progress`}
                    color="#ec4899"
                />
                {/* <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="up"
                    trendValue="Paid Orders"
                    color="#10b981"
                /> */}
                {/* <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers.toString()}
                    icon={Package}
                    trend="up"
                    trendValue="Registered"
                    color="#f59e0b"
                /> */}
                <StatCard
                    title="New Leads"
                    value={stats.newEnquiries.toString()}
                    icon={PhoneCall}
                    trend="up"
                    trendValue={`${stats.totalEnquiries} total enquiries`}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Conversion Rate"
                    value={stats.totalEnquiries > 0 ? `${Math.round((stats.convertedEnquiries / stats.totalEnquiries) * 100)}%` : "0%"}
                    icon={TrendingUp}
                    trend={stats.convertedEnquiries > 0 ? "up" : "down"}
                    trendValue={`${stats.convertedEnquiries} converted`}
                    color="#3b82f6"
                />
            </div>

            {/* Sales Chart */}
            <div className="glass card" style={{ marginBottom: '24px', padding: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Sales Valuation</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Monthly revenue overview</p>
                    </div>
                    <div style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981', fontWeight: 600 }}>
                        Total: ${stats.totalRevenue.toLocaleString()}
                    </div>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="var(--text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Sales']}
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Orders */}
                <div className="glass card">
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <h3>Recent Orders</h3>
                        <button
                            onClick={() => navigate('/orders')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--primary)',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            View All
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentOrders.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No orders yet
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => navigate(`/orders/view/${order.id}`)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: `${getStatusColor(order.status)}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <ShoppingCart size={20} color={getStatusColor(order.status)} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{order.customer}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {order.productName} • {order.items} items
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#10b981' }}>${order.total}</div>
                                        <div style={{
                                            fontSize: '11px',
                                            marginTop: '4px',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: `${getStatusColor(order.status)}20`,
                                            color: getStatusColor(order.status),
                                            fontWeight: 600
                                        }}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="glass card">
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px' }}>Stock Alerts</h3>
                        <AlertTriangle size={18} color="#f59e0b" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {lowStockMaterials.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#10b981', fontSize: '13px' }}>
                                ✓ All materials well stocked
                            </div>
                        ) : (
                            lowStockMaterials.map((material) => {
                                const inStock = material.quantity - (material.usedQuantity || 0);
                                const stockPercentage = (inStock / material.quantity) * 100;
                                return (
                                    <div
                                        key={material.id}
                                        onClick={() => navigate(`/materials/edit/${material.id}`)}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            background: 'rgba(245, 158, 11, 0.05)',
                                            border: '1px solid rgba(245, 158, 11, 0.2)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{material.item}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {inStock} {material.unit} left
                                            </div>
                                            <div style={{ fontSize: '11px', color: inStock === 0 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                                                {inStock === 0 ? 'OUT' : `${Math.round(stockPercentage)}%`}
                                            </div>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${Math.min(stockPercentage, 100)}%`,
                                                height: '100%',
                                                background: inStock === 0 ? '#ef4444' : '#f59e0b',
                                                transition: 'width 0.3s'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {lowStockMaterials.length > 0 && (
                        <button
                            onClick={() => navigate('/materials')}
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500
                            }}
                        >
                            Manage Stock
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
