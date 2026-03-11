import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineBolt, HiOutlineArrowLeft } from 'react-icons/hi2';
import NavMenu from '../../../Components/NavMenu/NavMenu';
import Loading from '../../../Components/Loading/Loading';
import { usePollVote } from '../../../Hooks/usePollVote';
import styles from './PollVote.module.css';

export default function PollVote() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { poll, loading, error, voting, success, castVote } = usePollVote(id || '');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Sync selected option when poll data loads or user votes
    useEffect(() => {
        if (poll?.voted_option_id) {
            setSelectedOption(poll.voted_option_id);
        }
    }, [poll?.voted_option_id]);

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

    const now = new Date();
    const startDate = poll?.start_date ? new Date(poll.start_date) : null;
    const endDate = poll?.end_date ? new Date(poll.end_date) : null;

    const isStarted = !startDate || now >= startDate;
    const isEnded = endDate && now > endDate;
    const isActive = isStarted && !isEnded;

    const hasVoted = poll?.user_voted || success;
    const shouldShowResults = hasVoted || isEnded;
    const canVote = isActive && !hasVoted;

    return (
        <>
            <NavMenu />
            <div className={styles.voteContainer}>
                <header className={styles.pollHeader}>
                    <h1 className={styles.title}>{poll?.title}</h1>
                    <p className={styles.description}>{poll?.description}</p>
                    
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        {!isStarted && (
                            <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#a16207', fontWeight: 600, fontSize: '0.9rem' }}>
                                Começa em: {startDate?.toLocaleString()}
                            </span>
                        )}
                        {isEnded && (
                            <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>
                                Enquete Encerrada
                            </span>
                        )}
                        {isActive && (
                            <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
                                Enquete Ativa
                            </span>
                        )}
                    </div>
                </header>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.actions}>
                    {canVote ? (
                        <button
                            className={styles.voteButton}
                            disabled={selectedOption === null || voting}
                            onClick={() => selectedOption && castVote(selectedOption)}
                        >
                            {voting ? <span>Processando...</span> : (
                                <span>
                                    <HiOutlineBolt /> Confirmar Voto
                                </span>
                            )}
                        </button>
                    ) : (
                        <button onClick={() => navigate('/')} className={styles.voteButton} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                            <span>{isEnded ? 'Ver outras enquetes' : 'Explorar outras enquetes'}</span>
                        </button>
                    )}
                </div>

                <div className={styles.optionsGrid}>
                    {poll?.options?.map((option) => {
                        const totalVotes = poll.total_votes || 0;
                        const optionVotes = option.total_votes || 0;
                        const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                        const isVotedOption = selectedOption === option.id_option;

                        return (
                            <div
                                key={option.id_option}
                                className={`
                                    ${styles.optionCard} 
                                    ${!shouldShowResults && selectedOption === option.id_option ? styles.optionCardSelected : ''}
                                    ${shouldShowResults ? styles.optionCardResults : ''}
                                    ${shouldShowResults && isVotedOption ? styles.optionCardVoted : ''}
                                `}
                                onClick={() => canVote && setSelectedOption(option.id_option)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                                    {!shouldShowResults && (
                                        <div className={styles.radioCircle}>
                                            <div className={styles.radioInner} />
                                        </div>
                                    )}
                                    <div className={styles.optionText}>
                                        <div className={styles.resultsHeader}>
                                            <span className={styles.optionDesignacao}>
                                                {option.designation}
                                                {hasVoted && isVotedOption && (
                                                    <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--primary-color)', background: 'var(--bg-selected)', padding: '2px 8px', borderRadius: '10px' }}>
                                                        Teu voto
                                                    </span>
                                                )}
                                            </span>
                                            {shouldShowResults && <span className={styles.percentage}>{percentage}%</span>}
                                        </div>
                                        {option.description && <span className={styles.optionDesc}>{option.description}</span>}
                                    </div>
                                </div>

                                {shouldShowResults && (
                                    <>
                                        <div className={styles.progressContainer}>
                                            <div 
                                                className={styles.progressBar} 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className={styles.voteCount} style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                            {optionVotes} {optionVotes === 1 ? 'voto' : 'votos'}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
