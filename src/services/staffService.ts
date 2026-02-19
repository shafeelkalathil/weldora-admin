import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const staffCollection = collection(db, 'users');

export interface StaffMember {
    id?: string;
    name: string;
    role: string;
    department: string;
    status: string;
    email: string;
    phone: string;
    joiningDate: string;
    salary: number;
    address: string;
    emergencyContact: string;
    bloodGroup: string;
    photoUrl?: string;
}

export const staffService = {
    // Get all staff
    getAll: async () => {
        try {
            const snapshot = await getDocs(staffCollection);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember));
        } catch (error) {
            console.error("Error fetching staff:", error);
            throw error;
        }
    },

    // Add a new staff member
    add: async (staff: Omit<StaffMember, 'id'>) => {
        try {
            const docRef = await addDoc(staffCollection, staff);
            return { id: docRef.id, ...staff };
        } catch (error) {
            console.error("Error adding staff:", error);
            throw error;
        }
    },

    // Update a staff member
    update: async (id: string, staff: Partial<StaffMember>) => {
        try {
            const staffDoc = doc(db, 'users', id);
            await updateDoc(staffDoc, staff);
        } catch (error) {
            console.error("Error updating staff:", error);
            throw error;
        }
    },

    // Delete a staff member
    delete: async (id: string) => {
        try {
            const staffDoc = doc(db, 'users', id);
            await deleteDoc(staffDoc);
        } catch (error) {
            console.error("Error deleting staff:", error);
            throw error;
        }
    }
};
