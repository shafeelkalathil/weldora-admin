import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: any;
    trend: 'up' | 'down';
    trendValue: string;
    color: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: StatCardProps) => (
    <div className="glass card animate-fade-in">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: `${color}20`,
                color: color
            }}>
                <Icon size={24} />
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: trend === 'up' ? '#10b981' : '#ef4444'
            }}>
                {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span style={{ marginLeft: '4px', fontWeight: 600 }}>{trendValue}</span>
            </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: 700 }}>{value}</div>
    </div>
);

export default StatCard;
