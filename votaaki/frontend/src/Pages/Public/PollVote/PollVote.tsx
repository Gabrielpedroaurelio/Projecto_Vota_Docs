import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineBolt, HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi2';
import NavMenu from '../../../Components/NavMenu/NavMenu';
import Loading from '../../../Components/Loading/Loading';
import { usePollVote } from '../../../Hooks/usePollVote';
import styles from './PollVote.module.css';

export default function PollVote() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { poll, loading, error, voting, success, castVote } = usePollVote(id || '');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Initialize selected option if user already voted or just voted
    useEffect(() => {
        if (poll?.voted_option_id) {
            setSelectedOption(poll.voted_option_id);
        }
    }, [poll]);

    if (loading) return <><NavMenu /><Loading texto="Carregando enquete" /></>;

    if (error && !poll) {
        return (
            <>
                <NavMenu />
                <div className={styles.voteContainer}>
                    <div className={styles.errorBox}>{error}</div>
                    <button onClick={() => navigate('/')} className={styles.voteButton}>
                        <span><HiOutlineArrowLeft /> Voltar</span>
                    </button>
                </div>
            </>
        );
    }

    const hasVoted = poll?.user_voted || success;

    return (
        <>
            <NavMenu />
            <div className={styles.voteContainer}>
                <header className={styles.pollHeader}>
                    <h1 className={styles.title}>{poll?.title}</h1>
                    <p className={styles.description}>{poll?.description}</p>
                </header>

                {error && <div className={styles.errorBox}>{error}</div>}

                {hasVoted && (
                    <div className={styles.successBox} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <HiOutlineCheckCircle />
                        <span>Obrigado por participar. Seu voto já foi registrado.</span>
                    </div>
                )}

                <div className={styles.optionsGrid} style={{ pointerEvents: hasVoted ? 'none' : 'auto', opacity: hasVoted ? 0.8 : 1 }}>
                    {poll?.options?.map((option) => (
                        <div
                            key={option.id_option}
                            className={`${styles.optionCard} ${selectedOption === option.id_option ? styles.optionCardSelected : ''}`}
                            onClick={() => !hasVoted && setSelectedOption(option.id_option)}
                        >
                            <div className={styles.radioCircle}>
                                <div className={styles.radioInner} />
                            </div>
                            <div className={styles.optionText}>
                                <span className={styles.optionDesignacao}>{option.designation}</span>
                                {option.description && <span className={styles.optionDesc}>{option.description}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.actions} style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={styles.voteButton}
                        disabled={selectedOption === null || voting || hasVoted}
                        onClick={() => selectedOption && castVote(selectedOption)}
                    >
                        {voting ? <span>Processando...</span> : (
                            <span>
                                <HiOutlineBolt /> {hasVoted ? 'Voto Registrado' : 'Confirmar Voto'}
                            </span>
                        )}
                    </button>

                    {hasVoted && (
                        <button onClick={() => navigate('/')} className={styles.voteButton} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                            <span>Explorar outras enquetes</span>
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
