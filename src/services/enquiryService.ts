import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export type EnquiryStatus = 'New' | 'In Progress' | 'Follow-up Scheduled' | 'Converted' | 'Lost' | 'On Hold';
export type EnquiryPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type EnquirySource = 'Website' | 'Phone Call' | 'Email' | 'Walk-in' | 'Social Media' | 'Referral' | 'Trade Show' | 'Other';

export interface FollowUp {
    id: string;
    date: string;
    time?: string;
    note: string;
    type: 'Call' | 'Email' | 'Meeting' | 'WhatsApp' | 'Demo' | 'Site Visit' | 'Other';
    completedBy?: string;
    outcome?: string;
    nextAction?: string;
}

export interface Enquiry {
    id: string;
    customerName: string;
    email?: string;
    phone: string;
    company?: string;
    enquiryDate: string;
    status: EnquiryStatus;
    priority: EnquiryPriority;
    source: EnquirySource;
    productInterest?: string;
    estimatedValue?: number;
    description: string;
    followUps: FollowUp[];
    nextFollowUpDate?: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = 'enquiries';

// Helper function to remove undefined values from objects
const removeUndefined = (obj: any): any => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
};

export const enquiryService = {
    async getAll(): Promise<Enquiry[]> {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enquiry));
    },

    async add(enquiry: Omit<Enquiry, 'id'>): Promise<string> {
        const cleanedData = removeUndefined({
            ...enquiry,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
        return docRef.id;
    },

    async update(id: string, enquiry: Partial<Enquiry>): Promise<void> {
        const cleanedData = removeUndefined({
            ...enquiry,
            updatedAt: new Date().toISOString(),
        });
        await updateDoc(doc(db, COLLECTION_NAME, id), cleanedData);
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    async addFollowUp(enquiryId: string, followUp: Omit<FollowUp, 'id'>): Promise<void> {
        const enquiries = await this.getAll();
        const enquiry = enquiries.find(e => e.id === enquiryId);
        if (!enquiry) throw new Error('Enquiry not found');

        const newFollowUp = {
            ...followUp,
            id: Date.now().toString(),
        };

        await this.update(enquiryId, {
            followUps: [...(enquiry.followUps || []), newFollowUp],
        });
    },
};
