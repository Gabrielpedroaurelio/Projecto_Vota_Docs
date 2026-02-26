import type { UserLogin, UserRegister, UserData } from '../@types/types';

const API_URL = 'http://localhost:5000/api/auth';

export interface AuthResponse {
    token: string;
    user: UserData;
}

export const authService = {
    async login(data: UserLogin): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: data.password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error logging in');
        }

        return response.json();
    },

    async register(data: UserRegister): Promise<{ message: string; userId: number }> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: data.name, email: data.email, password: data.password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error creating account');
        }

        return response.json();
    }
};
