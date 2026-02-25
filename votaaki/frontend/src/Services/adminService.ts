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
    async getUsers(page = 1, limit = 10, search = '', status = 'all') {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users?page=${page}&limit=${limit}&search=${search}&status=${status}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error loading users');
        return response.json();
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
    }
};
