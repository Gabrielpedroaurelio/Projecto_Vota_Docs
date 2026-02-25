import { useState, useEffect, useCallback } from 'react';
import type { Poll } from '../@types/types';
import { pollService } from '../Services/pollService';
import { voteService } from '../Services/voteService';

export function usePollVote(pollId: string) {
    const [poll, setPoll] = useState<Poll | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [voting, setVoting] = useState(false);
    const [success, setSuccess] = useState(false);

    const loadPoll = useCallback(async () => {
        try {
            setLoading(true);
            const data = await pollService.getPollById(Number(pollId));
            setPoll(data);
            setError(null);
        } catch {
            setError('Failed to load poll details.');
        } finally {
            setLoading(false);
        }
    }, [pollId]);

    useEffect(() => {
        if (pollId) loadPoll();
    }, [pollId, loadPoll]);

    const castVote = async (optionId: number) => {
        if (!poll) return;
        
        try {
            setVoting(true);
            await voteService.castVote(poll.id_poll, optionId);
            setSuccess(true);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error registering vote';
            setError(message);
        } finally {
            setVoting(false);
        }
    };

    return { poll, loading, error, voting, success, castVote };
}
