const API_URL = 'http://localhost:5000/api';

export const voteService = {
    async castVote(id_enquete: number, id_opcao_voto: number): Promise<void> {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_enquete, id_opcao_voto })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao registrar voto');
        }
    }
};
