import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// ============================================
// CHART OF ACCOUNTS (Account Categories)
// ============================================

export interface AccountCategory {
    id?: string;
    code: string; // e.g., "INC-001", "EXP-001"
    name: string; // e.g., "Sales Revenue", "Salary Expense"
    type: 'Income' | 'Expense' | 'Asset' | 'Liability';
    subType?: string; // e.g., "Operating Income", "Administrative Expense"
    section?: 'Expansion' | 'Sales' | 'Both';
    description?: string;
    isActive: boolean;
    createdAt: string;
}

// ============================================
// TRANSACTIONS (Using Chart of Accounts)
// ============================================

export interface AccountTransaction {
    id?: string;
    date: string;
    transactionNumber: string; // Auto-generated: TXN-001, TXN-002

    // Which account category
    accountId: string; // Reference to AccountCategory
    accountName: string; // Stored for quick display
    accountType: 'Income' | 'Expense' | 'Asset' | 'Liability';

    description: string;
    amount: number;

    // Payment method (Source/Destination Account)
    paymentMethod: string; // e.g. 'Cash', 'Bank Account', 'UPI', 'Credit Card'

    // Transaction parties
    partyName?: string; // Who paid (for income) or who received (for expense)
    partyType?: 'Customer' | 'Supplier' | 'Staff' | 'Owner' | 'Other';

    // Account Section
    section?: 'Expansion' | 'Sales';

    // References
    referenceId?: string; // Link to order, material, staff, etc.
    referenceType?: 'Order' | 'Material' | 'Staff' | 'Asset' | 'Other' | 'Product';

    // Explicit linked entities
    orderId?: string;
    productId?: string;

    status: 'Completed' | 'Pending' | 'Cancelled';

    notes?: string;
    attachments?: string[]; // URLs to receipts, invoices

    createdBy?: string;
    createdAt: string;
    updatedAt?: string;
}

// ============================================
// SERVICES
// ============================================

const ACCOUNTS_COLLECTION = 'chart_of_accounts';
const TRANSACTIONS_COLLECTION = 'account_transactions';

// Remove undefined values before saving
const removeUndefined = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '')
    );
};

// Chart of Accounts Service
export const chartOfAccountsService = {
    getAll: async (): Promise<AccountCategory[]> => {
        try {
            const q = query(collection(db, ACCOUNTS_COLLECTION), orderBy('code', 'asc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountCategory));
        } catch (error) {
            console.error("Error fetching accounts:", error);
            return [];
        }
    },

    getByType: async (type: string): Promise<AccountCategory[]> => {
        try {
            const all = await chartOfAccountsService.getAll();
            return all.filter(acc => acc.type === type && acc.isActive);
        } catch (error) {
            console.error("Error fetching accounts by type:", error);
            return [];
        }
    },

    add: async (account: Omit<AccountCategory, 'id'>): Promise<string> => {
        try {
            const cleanData = removeUndefined(account);
            const docRef = await addDoc(collection(db, ACCOUNTS_COLLECTION), cleanData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding account:", error);
            throw error;
        }
    },

    update: async (id: string, updates: Partial<AccountCategory>): Promise<void> => {
        try {
            const cleanData = removeUndefined(updates);
            await updateDoc(doc(db, ACCOUNTS_COLLECTION, id), cleanData);
        } catch (error) {
            console.error("Error updating account:", error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, ACCOUNTS_COLLECTION, id));
        } catch (error) {
            console.error("Error deleting account:", error);
            throw error;
        }
    },

    // Generate next account code
    generateCode: async (type: 'Income' | 'Expense' | 'Asset' | 'Liability'): Promise<string> => {
        const accounts = await chartOfAccountsService.getAll();
        const prefix = {
            'Income': 'INC',
            'Expense': 'EXP',
            'Asset': 'AST',
            'Liability': 'LIB'
        }[type];

        const typeAccounts = accounts.filter(a => a.code.startsWith(prefix));

        if (typeAccounts.length === 0) return `${prefix}-001`;

        const maxNum = typeAccounts.reduce((max, acc) => {
            const numPart = parseInt(acc.code.split('-')[1] || '0');
            return numPart > max ? numPart : max;
        }, 0);

        return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
    }
};

// Transactions Service
export const accountService = {
    getAll: async (): Promise<AccountTransaction[]> => {
        try {
            const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountTransaction));
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    },

    add: async (transaction: Omit<AccountTransaction, 'id'>): Promise<string> => {
        try {
            const cleanData = removeUndefined(transaction);
            const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), cleanData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding transaction:", error);
            throw error;
        }
    },

    update: async (id: string, updates: Partial<AccountTransaction>): Promise<void> => {
        try {
            const cleanData = removeUndefined(updates);
            await updateDoc(doc(db, TRANSACTIONS_COLLECTION, id), cleanData);
        } catch (error) {
            console.error("Error updating transaction:", error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
        } catch (error) {
            console.error("Error deleting transaction:", error);
            throw error;
        }
    },

    // Generate next transaction number
    generateTransactionNumber: async (): Promise<string> => {
        const transactions = await accountService.getAll();
        const nextNum = transactions.length + 1;
        return `TXN-${String(nextNum).padStart(4, '0')}`;
    },

    // Financial Summary
    getSummary: (transactions: AccountTransaction[]) => {
        const completed = transactions.filter(t => t.status === 'Completed');

        const totalIncome = completed
            .filter(t => t.accountType === 'Income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = completed
            .filter(t => t.accountType === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netProfit = totalIncome - totalExpense;

        // Cash balance by dynamic payment method
        const cashByMethod: { [key: string]: number } = {};
        const usedMethods = Array.from(new Set(completed.map(t => t.paymentMethod)));

        usedMethods.forEach(method => {
            const income = completed
                .filter(t => t.paymentMethod === method && t.accountType === 'Income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = completed
                .filter(t => t.paymentMethod === method && t.accountType === 'Expense')
                .reduce((sum, t) => sum + t.amount, 0);

            // Assets purchased via this method also reduce balance
            const assets = completed
                .filter(t => t.paymentMethod === method && t.accountType === 'Asset')
                .reduce((sum, t) => sum + t.amount, 0);

            cashByMethod[method] = income - (expense + assets);
        });

        return {
            totalIncome,
            totalExpense,
            netProfit,
            cashByMethod,
            totalCash: Object.values(cashByMethod).reduce((sum, val) => sum + val, 0)
        };
    },

    // Cash Flow Summary (for Accounts page compatibility)
    getCashFlowSummary: (transactions: AccountTransaction[]) => {
        const completed = transactions.filter(t => t.status === 'Completed');

        const getBalance = (matcher: (m: string) => boolean) => {
            const income = completed
                .filter(t => matcher(t.paymentMethod) && t.accountType === 'Income')
                .reduce((sum, t) => sum + t.amount, 0);
            const expense = completed
                .filter(t => matcher(t.paymentMethod) && (t.accountType === 'Expense' || t.accountType === 'Asset'))
                .reduce((sum, t) => sum + t.amount, 0);
            return income - expense;
        };

        return {
            bankBalance: getBalance(m => m.toLowerCase().includes('bank') || m === 'Cheque'),
            upiBalance: getBalance(m => m.toLowerCase().includes('upi') || m.toLowerCase().includes('digital') || m.includes('Pay')),
            cashInHand: getBalance(m => m.toLowerCase().includes('cash'))
        };
    }
};


