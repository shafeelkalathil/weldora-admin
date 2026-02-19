import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft, Edit, Phone, Mail, Building, Calendar, DollarSign, Clock,
    Plus, Check, X, MessageSquare, Video, MapPin, FileText, Trash2
} from 'lucide-react';
import Header from '../components/Header';
import { enquiryService, Enquiry, FollowUp } from '../services/enquiryService';
import { showToast } from '../components/Toast';

const EnquiryDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [followUpForm, setFollowUpForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '',
        note: '',
        type: 'Call' as FollowUp['type'],
        outcome: '',
        nextAction: '',
    });

    useEffect(() => {
        if (id) {
            fetchEnquiry(id);
        }
    }, [id]);

    const fetchEnquiry = async (enquiryId: string) => {
        try {
            setLoading(true);
            const enquiries = await enquiryService.getAll();
            const found = enquiries.find(e => e.id === enquiryId);
            if (found) {
                setEnquiry(found);
            } else {
                showToast('Enquiry not found', 'error');
                navigate('/enquiries');
            }
        } catch (error) {
            console.error('Failed to fetch enquiry', error);
            showToast('Failed to load enquiry', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFollowUp = async () => {
        if (!enquiry || !followUpForm.note) {
            showToast('Please add a note for the follow-up', 'error');
            return;
        }

        try {
            await enquiryService.addFollowUp(enquiry.id, followUpForm);
            showToast('Follow-up added successfully', 'success');
            setShowFollowUpForm(false);
            setFollowUpForm({
                date: new Date().toISOString().split('T')[0],
                time: '',
                note: '',
                type: 'Call',
                outcome: '',
                nextAction: '',
            });
            if (id) fetchEnquiry(id);
        } catch (error) {
            console.error('Failed to add follow-up', error);
            showToast('Failed to add follow-up', 'error');
        }
    };

    const handleStatusChange = async (newStatus: Enquiry['status']) => {
        if (!enquiry) return;

        try {
            await enquiryService.update(enquiry.id, { status: newStatus });
            showToast('Status updated successfully', 'success');
            if (id) fetchEnquiry(id);
        } catch (error) {
            console.error('Failed to update status', error);
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        if (!enquiry) return;

        if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
            return;
        }

        try {
            await enquiryService.delete(enquiry.id);
            showToast('Enquiry deleted successfully', 'success');
            navigate('/enquiries');
        } catch (error) {
            console.error('Failed to delete enquiry', error);
            showToast('Failed to delete enquiry', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading enquiry details...</div>
            </div>
        );
    }

    if (!enquiry) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return '#3b82f6';
            case 'In Progress': return '#f59e0b';
            case 'Follow-up Scheduled': return '#8b5cf6';
            case 'Converted': return '#10b981';
            case 'Lost': return '#ef4444';
            case 'On Hold': return '#6b7280';
            default: return 'var(--text-muted)';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return '#ef4444';
            case 'High': return '#f59e0b';
            case 'Medium': return '#3b82f6';
            case 'Low': return '#6b7280';
            default: return 'var(--text-muted)';
        }
    };

    const getFollowUpIcon = (type: FollowUp['type']) => {
        switch (type) {
            case 'Call': return <Phone size={16} />;
            case 'Email': return <Mail size={16} />;
            case 'Meeting': return <Calendar size={16} />;
            case 'WhatsApp': return <MessageSquare size={16} />;
            case 'Demo': return <Video size={16} />;
            case 'Site Visit': return <MapPin size={16} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/enquiries')}
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
                        <ChevronLeft size={20} /> Back to Enquiries
                    </button>
                    <Header
                        title={enquiry.customerName}
                        subtitle={`Enquiry #${enquiry.id.substring(0, 8)}`}
                        showSearch={false}
                        showNotifications={false}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Trash2 size={18} />
                        Delete
                    </button>
                    <button
                        onClick={() => navigate(`/enquiries/edit/${enquiry.id}`)}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <Edit size={18} />
                        Edit Enquiry
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Customer Info Card */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 600 }}>Customer Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Customer Name</div>
                                <div style={{ fontSize: '16px', fontWeight: 600 }}>{enquiry.customerName}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Phone</div>
                                <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Phone size={16} color="var(--primary)" />
                                    {enquiry.phone}
                                </div>
                            </div>
                            {enquiry.email && (
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Email</div>
                                    <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={16} color="var(--accent)" />
                                        {enquiry.email}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '20px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Enquiry Description</div>
                            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{enquiry.description || 'No description provided'}</div>
                        </div>

                        {enquiry.productInterest && (
                            <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '20px' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Product Interest</div>
                                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)' }}>{enquiry.productInterest}</div>
                            </div>
                        )}
                    </div>

                    {/* Follow-ups Section */}
                    <div className="glass card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Follow-up History</h3>
                            <button
                                onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    background: showFollowUpForm ? 'rgba(239, 68, 68, 0.1)' : '#3b82f6',
                                    color: showFollowUpForm ? '#ef4444' : 'white',
                                    border: showFollowUpForm ? '1px solid #ef4444' : 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: showFollowUpForm ? 'none' : '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                                }}
                            >
                                {showFollowUpForm ? <X size={16} /> : <Plus size={16} />}
                                {showFollowUpForm ? 'Cancel' : 'Add Follow-up'}
                            </button>
                        </div>

                        {/* Follow-up Form */}
                        {showFollowUpForm && (
                            <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--primary)', marginBottom: '24px' }}>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Date</label>
                                            <input
                                                type="date"
                                                value={followUpForm.date}
                                                onChange={(e) => setFollowUpForm({ ...followUpForm, date: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Time</label>
                                            <input
                                                type="time"
                                                value={followUpForm.time}
                                                onChange={(e) => setFollowUpForm({ ...followUpForm, time: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'white',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Type</label>
                                            <select
                                                value={followUpForm.type}
                                                onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value as FollowUp['type'] })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="Call">Call</option>
                                                <option value="Email">Email</option>
                                                <option value="Meeting">Meeting</option>
                                                <option value="WhatsApp">WhatsApp</option>
                                                <option value="Demo">Demo</option>
                                                <option value="Site Visit">Site Visit</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Note / Summary</label>
                                        <textarea
                                            value={followUpForm.note}
                                            onChange={(e) => setFollowUpForm({ ...followUpForm, note: e.target.value })}
                                            rows={3}
                                            placeholder="Describe what was discussed or agreed upon..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Outcome</label>
                                        <input
                                            type="text"
                                            value={followUpForm.outcome}
                                            onChange={(e) => setFollowUpForm({ ...followUpForm, outcome: e.target.value })}
                                            placeholder="e.g., Interested, Need more info, Will decide by..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Next Action</label>
                                        <input
                                            type="text"
                                            value={followUpForm.nextAction}
                                            onChange={(e) => setFollowUpForm({ ...followUpForm, nextAction: e.target.value })}
                                            placeholder="e.g., Send quotation, Schedule demo, Call next week"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleAddFollowUp}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                                        }}
                                    >
                                        <Check size={18} />
                                        Save Follow-up
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Follow-up List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {enquiry.followUps && enquiry.followUps.length > 0 ? (
                                [...enquiry.followUps].reverse().map((followUp) => (
                                    <div
                                        key={followUp.id}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white'
                                                }}>
                                                    {getFollowUpIcon(followUp.type)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{followUp.type}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        {followUp.date} {followUp.time && `at ${followUp.time}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                                            {followUp.note}
                                        </div>

                                        {(followUp.outcome || followUp.nextAction) && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                                                {followUp.outcome && (
                                                    <div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Outcome</div>
                                                        <div style={{ fontSize: '13px' }}>{followUp.outcome}</div>
                                                    </div>
                                                )}
                                                {followUp.nextAction && (
                                                    <div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Next Action</div>
                                                        <div style={{ fontSize: '13px', color: 'var(--accent)' }}>{followUp.nextAction}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                    <div>No follow-ups recorded yet</div>
                                    <div style={{ fontSize: '12px', marginTop: '8px' }}>Click "Add Follow-up" to track your interactions</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Status Card */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>Enquiry Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(['New', 'In Progress', 'Follow-up Scheduled', 'Converted', 'Lost', 'On Hold'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: enquiry.status === status ? getStatusColor(status) : 'rgba(255,255,255,0.03)',
                                        color: enquiry.status === status ? 'white' : 'var(--text-main)',
                                        border: `1px solid ${enquiry.status === status ? getStatusColor(status) : 'var(--border)'}`,
                                        cursor: 'pointer',
                                        fontWeight: enquiry.status === status ? 600 : 400,
                                        fontSize: '14px',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Priority</div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    background: `${getPriorityColor(enquiry.priority)}15`,
                                    color: getPriorityColor(enquiry.priority),
                                    fontWeight: 600,
                                    fontSize: '14px'
                                }}>
                                    {enquiry.priority}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Source</div>
                                <div style={{ fontSize: '14px' }}>{enquiry.source}</div>
                            </div>

                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Enquiry Date</div>
                                <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={14} color="var(--accent)" />
                                    {enquiry.enquiryDate}
                                </div>
                            </div>

                            {enquiry.nextFollowUpDate && (
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Next Follow-up</div>
                                    <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 600 }}>
                                        <Clock size={14} />
                                        {enquiry.nextFollowUpDate}
                                    </div>
                                </div>
                            )}

                            {enquiry.assignedTo && (
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Assigned To</div>
                                    <div style={{ fontSize: '14px' }}>{enquiry.assignedTo}</div>
                                </div>
                            )}

                            {enquiry.estimatedValue && (
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>Estimated Value</div>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <DollarSign size={18} />
                                        {enquiry.estimatedValue.toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="glass card">
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            <div>Created: {new Date(enquiry.createdAt).toLocaleString()}</div>
                            <div>Updated: {new Date(enquiry.updatedAt).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnquiryDetails;
