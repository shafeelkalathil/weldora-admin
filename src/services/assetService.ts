import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const assetCollection = collection(db, 'assets');

export interface Asset {
    id?: string;
    name: string;
    type: 'Machinery' | 'Tools' | 'IT Equipment' | 'Other';
    serialWrapper: string;
    purchaseDate: string;
    manufacturer: string;
    modelYear: string;
    status: 'Operational' | 'Maintenance' | 'Retired';
    value: number;
    maintenanceDue: string;
    insuranceProvider: string;
    insurancePolicyExp: string;
    images?: string[];
}

export const assetService = {
    // Get all assets
    getAll: async () => {
        try {
            const snapshot = await getDocs(assetCollection);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        } catch (error) {
            console.error("Error fetching assets:", error);
            throw error;
        }
    },

    // Add a new asset
    add: async (asset: Omit<Asset, 'id'>) => {
        try {
            const docRef = await addDoc(assetCollection, asset);
            return { id: docRef.id, ...asset };
        } catch (error) {
            console.error("Error adding asset:", error);
            throw error;
        }
    },

    // Update an asset
    update: async (id: string, asset: Partial<Asset>) => {
        try {
            const assetDoc = doc(db, 'assets', id);
            await updateDoc(assetDoc, asset);
        } catch (error) {
            console.error("Error updating asset:", error);
            throw error;
        }
    },

    // Delete an asset
    delete: async (id: string) => {
        try {
            const assetDoc = doc(db, 'assets', id);
            await deleteDoc(assetDoc);
        } catch (error) {
            console.error("Error deleting asset:", error);
            throw error;
        }
    }
};
