import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface MaterialPurchase {
    id?: string;
    item: string;
    supplier: string;
    quantity: number;
    unit: string; // e.g., kg, pcs, sheets
    totalCost: number;
    date: string;
    paymentType: 'Credit' | 'Debit';
    usedQuantity?: number; // How much has been consumed in production
    notes?: string;
}

const COLLECTION_NAME = 'material_purchases';

export const materialService = {
    getAll: async (): Promise<MaterialPurchase[]> => {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaterialPurchase));
        } catch (error) {
            console.error("Error fetching materials:", error);
            return [];
        }
    },

    add: async (purchase: MaterialPurchase): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), purchase);
            return docRef.id;
        } catch (error) {
            console.error("Error adding material purchase:", error);
            throw error;
        }
    },

    update: async (id: string, updates: Partial<MaterialPurchase>): Promise<void> => {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating material purchase:", error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting material purchase:", error);
            throw error;
        }
    }
};
