import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Services/authService';
import type { UserLogin, UserRegister, UserData } from '../@types/types';

export function useAuth() {
    const [user, setUser] = useState<UserData | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = async (data: UserLogin) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(data);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
            navigate(response.user.user_type === 'admin' ? '/dashboard' : '/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Invalid credentials';
            setError(message);
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
            const message = err instanceof Error ? err.message : 'Error registering';
            setError(message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/auth');
    };

    return { user, login, register, logout, loading, error, setError };
}
