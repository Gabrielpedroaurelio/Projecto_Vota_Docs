import type { Poll } from "../@types/types";

const API_URL = 'http://localhost:5000/api';

export const pollService = {
    async getAllPolls(): Promise<Poll[]> {
        try {
            const response = await fetch(`${API_URL}/polls`);
            if (!response.ok) {
                throw new Error('Erro ao carregar enquetes');
            }
            return await response.json();
        } catch (error) {
            console.error('pollService.getAllPolls error:', error);
            throw error;
        }
    },

    async getPollById(id: number): Promise<Poll> {
        try {
            const response = await fetch(`${API_URL}/polls/${id}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar detalhes da enquete');
            }
            return await response.json();
        } catch (error) {
            console.error('pollService.getPollById error:', error);
            throw error;
        }
    }
};
