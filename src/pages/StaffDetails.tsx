import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Mail, Phone, Briefcase, Building2, Calendar, ShieldCheck, MapPin, DollarSign, Heart, User } from 'lucide-react';
import Header from '../components/Header';
import { staffService, StaffMember } from '../services/staffService';
import { showToast } from '../components/Toast';

const StaffDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [staff, setStaff] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchStaffDetails(id);
        }
    }, [id]);

    const fetchStaffDetails = async (staffId: string) => {
        try {
            setLoading(true);
            const data = await staffService.getAll();
            const member = data.find(s => s.id === staffId);
            if (member) {
                setStaff(member);
            } else {
                showToast("Staff member not found", "error");
                navigate('/staff');
            }
        } catch (error) {
            console.error("Failed to fetch staff details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading staff profile...</div>
            </div>
        );
    }

    if (!staff) return null;

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/staff')}
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
                        <ChevronLeft size={20} /> Back to Staff List
                    </button>
                    <Header
                        title={staff.name}
                        subtitle={`Employee Profile - ${staff.role}`}
                        showSearch={false}
                        showNotifications={false}
                    />
                </div>
                <Link
                    to={`/staff/edit/${staff.id}`}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        color: 'white',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        marginBottom: '8px'
                    }}
                >
                    <Edit size={18} /> Edit Profile
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                {/* Left Column - Profile Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="glass card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: staff.photoUrl ? `url(${staff.photoUrl}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            margin: '0 auto 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            fontWeight: 'bold',
                            color: 'white',
                            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                            overflow: 'hidden'
                        }}>
                            {!staff.photoUrl && staff.name.charAt(0)}
                        </div>
                        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{staff.name}</h2>
                        <p style={{ color: 'var(--primary)', fontWeight: 500, marginBottom: '24px' }}>{staff.role}</p>

                        <div style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            background: staff.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: staff.status === 'Active' ? '#10b981' : '#f59e0b',
                            marginBottom: '32px'
                        }}>
                            {staff.status}
                        </div>

                        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Department</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Building2 size={16} color="var(--primary)" />
                                    <span>{staff.department || 'General'}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Employee ID</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShieldCheck size={16} color="var(--primary)" />
                                    <span style={{ fontFamily: 'monospace' }}>#WLD-{staff.id?.substring(0, 6).toUpperCase()}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Blood Group</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Heart size={16} color="#ef4444" />
                                    <span>{staff.bloodGroup || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Heart size={16} color="#ef4444" /> Emergency Info
                        </h3>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>Contact Person:</label>
                                <span style={{ color: 'white', fontWeight: 500 }}>{staff.emergencyContact || 'Not Set'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Detailed Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 className="detail-section-title"><Mail size={18} color="var(--primary)" /> Contact & Location</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "20px" }}>
                            <div>
                                <label className="detail-label">Email Address</label>
                                <div className="detail-value">{staff.email || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="detail-label">Phone Number</label>
                                <div className="detail-value">{staff.phone || 'N/A'}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="detail-label">Residential Address</label>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <MapPin size={18} color="#ef4444" style={{ marginTop: '2px' }} />
                                    <div className="detail-value">{staff.address || 'Address not provided'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 className="detail-section-title"><Briefcase size={18} color="var(--primary)" /> Employment & Salary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "20px" }}>
                            <div>
                                <label className="detail-label">Joining Date</label>
                                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={16} /> {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="detail-label">Monthly Salary</label>
                                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700 }}>
                                    <DollarSign size={18} /> {staff.salary ? staff.salary.toLocaleString() : '0.00'}
                                </div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="detail-label">Permissions Summary</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: "10px" }}>
                                    {staff.role === 'Manager' ? (
                                        ['Full Access', 'System Settings', 'Financial Reports', 'Staff Management'].map(p => (
                                            <span key={p} className="permission-tag manager">{p}</span>
                                        ))
                                    ) : (
                                        ['Dashboard View', 'Order Processing', 'Customer Support'].map(p => (
                                            <span key={p} className="permission-tag">{p}</span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass card" style={{ padding: '32px' }}>
                        <h3 className="detail-section-title"><User size={18} color="var(--primary)" /> Performance Note</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic', marginTop: "10px" }}>
                            "{staff.name} is a valued member of the {staff.department} team. Consistently meeting goals and showing great dedication to the Weldora vision."
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                .detail-section-title { fontSize: 18px; marginBottom: 20px; display: flex; alignItems: center; gap: 10px; }
                .detail-label { color: var(--text-muted); fontSize: 12px; display: block; marginBottom: 4px; }
                .detail-value { fontSize: 15px; fontWeight: 500; color: white; marginTop: '10px' }
                .permission-tag { padding: 4px 12px; borderRadius: 6px; background: rgba(255,255,255,0.05); fontSize: 12px; border: 1px solid var(--border); color: var(--text-muted); }
                .permission-tag.manager { background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); color: var(--primary); }
            `}</style>
        </div>
    );
};

export default StaffDetails;
