import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineCheckCircle, HiOutlineBolt, HiOutlineArrowLeft } from 'react-icons/hi2';
import NavMenu from '../../../Components/NavMenu/NavMenu';
import Loading from '../../../Components/Loading/Loading';
import { usePollVote } from '../../../Hooks/usePollVote';
import styles from './PollVote.module.css';

export default function PollVote() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { poll, loading, error, voting, success, castVote } = usePollVote(id || '');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    if (loading) return <><NavMenu /><Loading texto="Loading poll..." /></>;

    if (error && !poll) {
        return (
            <>
                <NavMenu />
                <div className={styles.voteContainer}>
                    <div className={styles.errorBox}>{error}</div>
                    <button onClick={() => navigate('/')} className={styles.voteButton}>
                        <HiOutlineArrowLeft /> Back
                    </button>
                </div>
            </>
        );
    }

    if (success || poll?.user_voted) {
        return (
            <>
                <NavMenu />
                <div className={styles.voteContainer}>
                    <div className={styles.successMessage}>
                        <HiOutlineCheckCircle className={styles.successIcon} />
                        <h2 className={styles.title}>Vote Registered!</h2>
                        <p className={styles.description}>
                            Thank you for participating. Your vote has been successfully recorded.
                        </p>
                        <div className={styles.actions} style={{ marginTop: '2rem' }}>
                            <button onClick={() => navigate('/')} className={styles.voteButton}>
                                Explore other polls
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavMenu />
            <div className={styles.voteContainer}>
                <header className={styles.pollHeader}>
                    <h1 className={styles.title}>{poll?.title}</h1>
                    <p className={styles.description}>{poll?.description}</p>
                </header>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.optionsGrid}>
                    {poll?.options?.map((option) => (
                        <div 
                            key={option.id_option}
                            className={`${styles.optionCard} ${selectedOption === option.id_option ? styles.optionCardSelected : ''}`}
                            onClick={() => setSelectedOption(option.id_option)}
                        >
                            <div className={styles.radioCircle}>
                                <div className={styles.radioInner} />
                            </div>
                            <div className={styles.optionText}>
                                <span className={styles.optionDesignation}>{option.designation}</span>
                                {option.description && <span className={styles.optionDesc}>{option.description}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <button 
                        className={styles.voteButton}
                        disabled={selectedOption === null || voting}
                        onClick={() => selectedOption && castVote(selectedOption)}
                    >
                        {voting ? 'Processing...' : <><HiOutlineBolt /> Confirm Vote</>}
                    </button>
                </div>
            </div>
        </>
    );
}
