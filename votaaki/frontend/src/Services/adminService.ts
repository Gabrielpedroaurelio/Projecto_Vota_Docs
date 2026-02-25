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
    },

    /**
     * Get all polls
     */
    async getPolls() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/polls`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao carregar enquetes');
        return data;
    },

    /**
     * Create a new poll with options
     */
    async createPoll(data: unknown) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/polls`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao criar enquete');
        return result;
    },

    /**
     * Update existing poll
     */
    async updatePoll(id: number, data: unknown) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/polls/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao atualizar enquete');
        return result;
    },

    /**
     * Delete poll
     */
    async deletePoll(id: number) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/polls/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao excluir enquete');
        return result;
    },

    /**
     * Get all vote options
     */
    async getOptions() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/options`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao carregar opções');
        return data;
    },

    /**
     * Create individual option
     */
    async createOption(data: unknown) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/options`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao criar opção');
        return result;
    },

    /**
     * Update existing option
     */
    async updateOption(id: number, data: unknown) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/options/${id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao atualizar opção');
        return result;
    },

    /**
     * Delete individual option
     */
    async deleteOption(id: number) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/options/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Erro ao excluir opção');
        return result;
    }
};
