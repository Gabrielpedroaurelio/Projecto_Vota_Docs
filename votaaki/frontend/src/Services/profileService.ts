const API_URL = 'http://localhost:5000/api/users/me/profile';

export const profileService = {
    /**
     * Get current user profile
     */
    async getProfile() {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao carregar perfil');
        return response.json();
    },

    /**
     * Update current user profile
     * @param formData - FormData containing name, email, currentPassword, newPassword, and image
     */
    async updateProfile(formData: FormData) {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData // Fetch handles multipart/form-data with border automatically
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar perfil');
        }
        return data;
    }
};
