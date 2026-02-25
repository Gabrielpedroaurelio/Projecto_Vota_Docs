const API_URL = 'http://localhost:5000/api';

export const adminService = {
    /**
     * Get global dashboard statistics and recent activity
     */
    async getDashboardStats() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/results/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error loading dashboard stats');
        return response.json();
    },

    /**
     * Get engagement metrics and trends
     */
    async getEngagementMetrics() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/results/engagement`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error loading engagement metrics');
        return response.json();
    },

    /**
     * Get all users with pagination
     */
    async getUsers(search = '', status = 'all') {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users?search=${search}&status=${status}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Erro ao carregar utilizadores');
        }
        return data; // returns the User[] array directly
    },

    /**
     * Get user statistics
     */
    async getUserStats() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error loading user stats');
        return response.json();
    },

    /**
     * Get poll statistics
     */
    async getPollStats() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/polls/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error loading poll stats');
        return response.json();
    },
    /**
     * Update user details (status, type, etc)
     */
    async updateUser(id: number, data: unknown) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error updating user');
        return response.json();
    },

    /**
     * Delete user
     */
    async deleteUser(id: number) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error deleting user');
        return response.json();
    },

    /**
     * Create a new user manually
     */
    async createUser(data: unknown) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Erro ao criar utilizador');
        }
        return result;
    }
};
