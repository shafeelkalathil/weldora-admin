import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Manager' | 'Staff' | 'Admin';

interface UserContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    // Default to Manager for now so user starts with full access
    const [role, setRole] = useState<UserRole>('Manager');

    return (
        <UserContext.Provider value={{ role, setRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserRole = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserRole must be used within a UserProvider');
    }
    return context;
};
