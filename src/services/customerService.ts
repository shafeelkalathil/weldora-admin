import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';

const customerCollection = collection(db, 'customers');

export interface Customer {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    zip?: string;
    totalOrders: number;
    lastOrder: string;
    rating: number; // 0-5
    status: 'Active' | 'Inactive';
    createdAt?: string;
}

// Helper function to remove undefined values
const removeUndefined = (obj: any): any => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
};

export const customerService = {
    getAll: async () => {
        try {
            const snapshot = await getDocs(customerCollection);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw error;
        }
    },

    add: async (customer: Omit<Customer, 'id'>) => {
        try {
            const cleanData = removeUndefined(customer);
            const docRef = await addDoc(customerCollection, cleanData);
            return { id: docRef.id, ...customer };
        } catch (error) {
            console.error("Error adding customer:", error);
            throw error;
        }
    },

    update: async (id: string, customer: Partial<Customer>) => {
        try {
            const cleanData = removeUndefined(customer);
            const customerDoc = doc(db, 'customers', id);
            await updateDoc(customerDoc, cleanData);
        } catch (error) {
            console.error("Error updating customer:", error);
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            const customerDoc = doc(db, 'customers', id);
            await deleteDoc(customerDoc);
        } catch (error) {
            console.error("Error deleting customer:", error);
            throw error;
        }
    },

    findByEmail: async (email: string) => {
        try {
            const q = query(customerCollection, where("email", "==", email));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Customer;
        } catch (error) {
            console.error("Error finding customer by email:", error);
            throw error;
        }
    },

    findByPhone: async (phone: string) => {
        try {
            const q = query(customerCollection, where("phone", "==", phone));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Customer;
        } catch (error) {
            console.error("Error finding customer by phone:", error);
            throw error;
        }
    }
};
