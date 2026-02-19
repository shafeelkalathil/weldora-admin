import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export interface Company {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    rating: number;
    review?: string;
    logoUrl?: string;
    photos: string[];
    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = 'companies';

// Helper function to remove undefined values
const removeUndefined = (obj: any): any => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
};

export const companyService = {
    async getAll(): Promise<Company[]> {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
    },

    async add(company: Omit<Company, 'id'>): Promise<string> {
        const cleanedData = removeUndefined({
            ...company,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
        return docRef.id;
    },

    async update(id: string, company: Partial<Company>): Promise<void> {
        const cleanedData = removeUndefined({
            ...company,
            updatedAt: new Date().toISOString(),
        });
        await updateDoc(doc(db, COLLECTION_NAME, id), cleanedData);
    },

    async delete(id: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    },
};
