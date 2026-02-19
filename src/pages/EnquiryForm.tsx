import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import Header from '../components/Header';
import { enquiryService, Enquiry, EnquiryStatus, EnquiryPriority, EnquirySource } from '../services/enquiryService';
import { staffService, StaffMember } from '../services/staffService';
import { showToast } from '../components/Toast';

const EnquiryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        enquiryDate: new Date().toISOString().split('T')[0],
        status: 'New' as EnquiryStatus,
        priority: 'Medium' as EnquiryPriority,
        source: 'Phone Call' as EnquirySource,
        productInterest: '',
        estimatedValue: '',
        description: '',
        assignedTo: '',
        nextFollowUpDate: '',
    });

    useEffect(() => {
        fetchStaff();
        if (isEdit && id) {
            fetchEnquiry(id);
        }
    }, [id, isEdit]);

    const fetchStaff = async () => {
        try {
            const staffData = await staffService.getAll();
            setStaff(staffData.filter(s => s.status === 'Active'));
        } catch (error) {
            console.error('Failed to fetch staff', error);
        }
    };

    const fetchEnquiry = async (enquiryId: string) => {
        try {
            const enquiries = await enquiryService.getAll();
            const enquiry = enquiries.find(e => e.id === enquiryId);
            if (enquiry) {
                setFormData({
                    customerName: enquiry.customerName,
                    email: enquiry.email || '',
                    phone: enquiry.phone,
                    enquiryDate: enquiry.enquiryDate,
                    status: enquiry.status,
                    priority: enquiry.priority,
                    source: enquiry.source,
                    productInterest: enquiry.productInterest || '',
                    estimatedValue: enquiry.estimatedValue?.toString() || '',
                    description: enquiry.description,
                    assignedTo: enquiry.assignedTo || '',
                    nextFollowUpDate: enquiry.nextFollowUpDate || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch enquiry', error);
            showToast('Failed to load enquiry', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerName || !formData.phone) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setLoading(true);

            const enquiryData = {
                customerName: formData.customerName,
                email: formData.email || undefined,
                phone: formData.phone,
                enquiryDate: formData.enquiryDate,
                status: formData.status,
                priority: formData.priority,
                source: formData.source,
                productInterest: formData.productInterest || undefined,
                estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
                description: formData.description,
                followUps: [],
                nextFollowUpDate: formData.nextFollowUpDate || undefined,
                assignedTo: formData.assignedTo || undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (isEdit && id) {
                await enquiryService.update(id, enquiryData);
                showToast('Enquiry updated successfully', 'success');
            } else {
                await enquiryService.add(enquiryData);
                showToast('Enquiry created successfully', 'success');
            }

            navigate('/enquiries');
        } catch (error) {
            console.error('Failed to save enquiry', error);
            showToast('Failed to save enquiry', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="animate-fade-in content-spacing">
            <div style={{ marginBottom: '24px' }}>
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
                    title={isEdit ? 'Edit Enquiry' : 'New Enquiry'}
                    subtitle={isEdit ? 'Update enquiry details' : 'Add a new customer enquiry'}
                    showSearch={false}
                    showNotifications={false}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Main Form */}
                    <div className="glass card">
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>Customer Information</h3>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label htmlFor="customerName" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                    Customer Name <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Phone <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '8px' }}>
                                <h4 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Enquiry Details</h4>

                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <div>
                                        <label htmlFor="productInterest" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                            Product Interest
                                        </label>
                                        <input
                                            type="text"
                                            id="productInterest"
                                            name="productInterest"
                                            value={formData.productInterest}
                                            onChange={handleChange}
                                            placeholder="e.g., Welding Machine, Steel Rods"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                            Description / Requirements
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Describe the customer's requirements..."
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="estimatedValue" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                            Estimated Deal Value ($)
                                        </label>
                                        <input
                                            type="number"
                                            id="estimatedValue"
                                            name="estimatedValue"
                                            value={formData.estimatedValue}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass card">
                            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600 }}>Enquiry Settings</h3>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <label htmlFor="enquiryDate" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Enquiry Date
                                    </label>
                                    <input
                                        type="date"
                                        id="enquiryDate"
                                        name="enquiryDate"
                                        value={formData.enquiryDate}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="status" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="New">New</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Lost">Lost</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="priority" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Priority
                                    </label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="source" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Source
                                    </label>
                                    <select
                                        id="source"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="Website">Website</option>
                                        <option value="Phone Call">Phone Call</option>
                                        <option value="Email">Email</option>
                                        <option value="Walk-in">Walk-in</option>
                                        <option value="Social Media">Social Media</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Trade Show">Trade Show</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="assignedTo" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Assigned To
                                    </label>
                                    <select
                                        id="assignedTo"
                                        name="assignedTo"
                                        value={formData.assignedTo}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="">Select Staff Member</option>
                                        {staff.map((member) => (
                                            <option key={member.id} value={member.name}>
                                                {member.name} - {member.role}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="nextFollowUpDate" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                                        Next Follow-up Date
                                    </label>
                                    <input
                                        type="date"
                                        id="nextFollowUpDate"
                                        name="nextFollowUpDate"
                                        value={formData.nextFollowUpDate}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '14px 24px',
                                borderRadius: '12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : isEdit ? 'Update Enquiry' : 'Create Enquiry'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EnquiryForm;
