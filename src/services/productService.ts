import { db } from '../firebase';
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

// Define the collection reference
const productsCollection = collection(db, 'products');

export interface Product {
    id?: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    sku: string;
    status: string;
    description?: string;
    material?: string;
    weight?: string;
    dimensions?: string;
    storageLocation?: string;
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export const productService = {
    // Get all products
    getAll: async () => {
        try {
            const snapshot = await getDocs(productsCollection);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        } catch (error) {
            console.error("Error fetching products:", error);
            throw error;
        }
    },

    // Get a single product by ID
    getById: async (id: string) => {
        try {
            const productDoc = doc(db, 'products', id);
            const snapshot = await getDoc(productDoc);
            if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() } as Product;
            }
            return null;
        } catch (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
    },

    // Add a new product
    add: async (product: Omit<Product, 'id'>) => {
        try {
            const now = new Date().toISOString();
            const productWithTimestamps = {
                ...product,
                createdAt: now,
                updatedAt: now
            };
            const docRef = await addDoc(productsCollection, productWithTimestamps);
            return { id: docRef.id, ...productWithTimestamps };
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    },

    // Update a product
    update: async (id: string, product: Partial<Product>) => {
        try {
            // Ensure updatedAt is updated, but createdAt is protected (not included in update unless specifically intended, 
            // but usually we want to preserve the original. Here we force updatedAt to now).
            // We exclude createdAt from the update payload to ensure it is not overwritten if accidentally passed,
            // or simply trust that updateDoc only updates fields present.
            // But to be safe and strictly follow "keep created date time", we essentially rely on not sending it,
            // or we could explicitly remove it if we wanted to be defensive.
            // For now, simple approach: spread product, overwrite updatedAt.
            const { createdAt, ...updateData } = product; // Remove createdAt from input if present to protect it
            const updates = {
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            const productDoc = doc(db, 'products', id);
            await updateDoc(productDoc, updates);
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    },

    // Delete a product
    delete: async (id: string) => {
        try {
            const productDoc = doc(db, 'products', id);
            await deleteDoc(productDoc);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    }
};
