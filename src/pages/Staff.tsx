import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Mail, Phone, Edit, Trash2, Eye } from 'lucide-react';
import Header from '../components/Header';
import { staffService, StaffMember } from '../services/staffService';
import { showToast, showConfirm } from '../components/Toast';

const Staff = () => {
    const navigate = useNavigate();
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await staffService.getAll();
            setStaffList(data);
        } catch (error) {
            console.error("Failed to fetch staff", error);
            showToast("Failed to fetch staff list", "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (staff: StaffMember) => {
        navigate(`/staff/edit/${staff.id}`);
    };

    const handleDelete = (id: string) => {
        showConfirm("Are you sure you want to delete this staff member? This action cannot be undone.", async () => {
            try {
                await staffService.delete(id);
                showToast("Staff member deleted successfully", "success");
                fetchStaff();
            } catch (error) {
                console.error("Error deleting staff", error);
                showToast("Failed to delete staff member", "error");
            }
        });
    };

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            <Header
                title="Staff Management"
                subtitle="Manage your team members and their permissions."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="glass card">
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
                        {/* Global search moved to Header */}
                    </div>
                    <button
                        onClick={() => navigate('/staff/add')}
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
                        <Plus size={18} /> Add New Staff
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Role</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Department</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Contact</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading staff data...</td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No staff members found. Add one to get started!</td>
                                </tr>
                            ) : (
                                filteredStaff.map((staff) => (
                                    <tr
                                        key={staff.id}
                                        className="clickable-row"
                                        onClick={() => navigate(`/staff/view/${staff.id}`)}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', overflow: 'hidden' }}>
                                                    {staff.photoUrl ? (
                                                        <img src={staff.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        staff.name.charAt(0)
                                                    )}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{staff.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{staff.role}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{staff.department}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>

                                                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }} title={staff.phone}>

                                                    {staff.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                background: staff.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                color: staff.status === 'Active' ? '#10b981' : '#f59e0b'
                                            }}>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {/* <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/staff/view/${staff.id}`); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </button> */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(staff); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(staff.id!); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
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
        </div>
    );
};

export default Staff;
