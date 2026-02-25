import { useState, useEffect } from 'react';
import type { Poll } from '../@types/types';
import { pollService } from '../Services/pollService';

export function usePolls() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPolls = async () => {
        try {
            setLoading(true);
            const data = await pollService.getAllPolls();
            setPolls(data);
            setError(null);
        } catch {
            setError('Falha ao carregar as enquetes. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPolls();
    }, []);

    return { polls, loading, error, refresh: loadPolls };
}
