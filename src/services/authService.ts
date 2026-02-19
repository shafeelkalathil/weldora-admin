import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface User {
    id: string;
    username: string;
    password: string; // In production, this should be hashed
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Staff';
    phone?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const COLLECTION_NAME = 'users';

// Helper function to remove undefined values
const removeUndefined = (obj: any): any => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
};

export const authService = {
    async login(username: string, password: string): Promise<User | null> {
        try {
            const usersRef = collection(db, COLLECTION_NAME);
            const q = query(usersRef, where('username', '==', username), where('password', '==', password));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const { id, ...userData } = snapshot.docs[0].data() as User;
                return { id: snapshot.docs[0].id, ...userData };
            }
            return null;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    },

    async createDefaultAdmin(): Promise<void> {
        try {
            const usersRef = collection(db, COLLECTION_NAME);
            const q = query(usersRef, where('role', '==', 'Admin'));
            const snapshot = await getDocs(q);

            // Only create if no admin exists
            if (snapshot.empty) {
                const defaultAdmin: Omit<User, 'id'> = {
                    username: 'admin',
                    password: 'admin123', // In production, hash this
                    name: 'System Administrator',
                    email: 'admin@weldora.com',
                    role: 'Admin',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await addDoc(usersRef, defaultAdmin);
                console.log('Default admin account created');
            }
        } catch (error) {
            console.error('Error creating default admin:', error);
        }
    },


    async getAll(): Promise<User[]> {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    },

    async getById(id: string): Promise<User | null> {
        const users = await this.getAll();
        return users.find(u => u.id === id) || null;
    },

    async add(userData: Omit<User, 'id'>): Promise<string> {
        const cleanedData = removeUndefined(userData);
        const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
        return docRef.id;
    },

    async update(id: string, userData: Partial<User>): Promise<void> {
        const cleanedData = removeUndefined({
            ...userData,
            updatedAt: new Date().toISOString(),
        });
        await updateDoc(doc(db, COLLECTION_NAME, id), cleanedData);
    },


    // Get current user from localStorage
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Save current user to localStorage
    setCurrentUser(user: User): void {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Logout
    logout(): void {
        localStorage.removeItem('currentUser');
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    },
};
