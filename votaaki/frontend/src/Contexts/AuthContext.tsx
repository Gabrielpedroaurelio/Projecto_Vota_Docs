import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../Services/authService';
import type { UserLogin, UserRegister, User } from '../@types/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (data: UserLogin) => Promise<void>;
    register: (data: UserRegister) => Promise<boolean>;
    logout: () => void;
    setError: (error: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>((() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    })());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Persist user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user]);

    const login = async (data: UserLogin) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(data);
            localStorage.setItem('token', response.token);
            setUser(response.user);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Credenciais inválidas';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: UserRegister) => {
        try {
            setLoading(true);
            setError(null);
            await authService.register(data);
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao registrar';
            setError(message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
};
