import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const ordersCollection = collection(db, 'orders');

export interface Order {
    id?: string;
    customer: string; // Customer Name
    customerEmail?: string; // To link/search in customers
    customerPhone?: string;
    customerAddress?: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressZip?: string;
    date: string;
    deliveryDate?: string;
    total: number;
    status: 'Completed' | 'Processing' | 'Pending' | 'Cancelled' | 'Shipped';
    payment: 'Paid' | 'Unpaid' | 'Refunded';
    priority?: 'Normal' | 'Urgent' | 'Critical';
    items: number; // Quantity
    productId?: string;
    productName?: string;
}

export const orderService = {
    getAll: async () => {
        try {
            const snapshot = await getDocs(ordersCollection);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    },

    add: async (order: Omit<Order, 'id'>) => {
        try {
            const docRef = await addDoc(ordersCollection, order);
            return { id: docRef.id, ...order };
        } catch (error) {
            console.error("Error adding order:", error);
            throw error;
        }
    },

    update: async (id: string, order: Partial<Order>) => {
        try {
            const orderDoc = doc(db, 'orders', id);
            await updateDoc(orderDoc, order);
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            const orderDoc = doc(db, 'orders', id);
            await deleteDoc(orderDoc);
        } catch (error) {
            console.error("Error deleting order:", error);
            throw error;
        }
    }
};
