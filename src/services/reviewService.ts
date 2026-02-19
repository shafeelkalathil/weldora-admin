import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const reviewsCollection = collection(db, 'reviews');

export interface Review {
    id?: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    productId?: string;
    productName?: string;
    status?: string;
}

export const reviewService = {
    getAll: async () => {
        try {
            const snapshot = await getDocs(reviewsCollection);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        } catch (error) {
            console.error("Error fetching reviews:", error);
            throw error;
        }
    },

    add: async (review: Omit<Review, 'id'>) => {
        try {
            const docRef = await addDoc(reviewsCollection, review);
            return { id: docRef.id, ...review };
        } catch (error) {
            console.error("Error adding review:", error);
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            const reviewDoc = doc(db, 'reviews', id);
            await deleteDoc(reviewDoc);
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    }
};
