import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { User, LoginCredentials, RegisterCredentials } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const saved = localStorage.getItem('library-users');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('library-current-user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

    useEffect(() => {
        localStorage.setItem('library-users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('library-current-user', JSON.stringify(user));
    }, [user]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(!!user);
    }, [user]);

    const login = async ({ email, password }: LoginCredentials) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            setUser(foundUser);
            setIsAuthenticated(true);
        } else {
            throw new Error('Invalid email or password');
        }
    };

    const register = async ({ name, email, password }: RegisterCredentials) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (users.some(u => u.email === email)) {
            throw new Error('Email already registered');
        }

        const newUser: User = {
            id: uuidv4(),
            name,
            email,
            password, // In a real app, never store passwords in plain text!
            createdAt: new Date().toISOString()
        };

        setUsers([...users, newUser]);
        setUser(newUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
