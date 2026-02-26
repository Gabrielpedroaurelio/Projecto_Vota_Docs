const API_URL = 'http://localhost:5000/api';

export const voteService = {
    async castVote(id_poll: number, id_option: number): Promise<void> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_poll, id_option })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error registering vote');
        }
    }
};
