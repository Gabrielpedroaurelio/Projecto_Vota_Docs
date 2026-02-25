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

    if (loading) return <><NavMenu /><Loading texto="Carregando enquete" /></>;

    if (error && !poll) {
        return (
            <>
                <NavMenu />
                <div className={styles.voteContainer}>
                    <div className={styles.errorBox}>{error}</div>
                    <button onClick={() => navigate('/')} className={styles.voteButton}>
                        <HiOutlineArrowLeft /> Voltar
                    </button>
                </div>
            </>
        );
    }

    if (success || poll?.usuario_ja_votou) {
        return (
            <>
                <NavMenu />
                <div className={styles.voteContainer}>
                    <div className={styles.successMessage}>
                        <HiOutlineCheckCircle className={styles.successIcon} />
                        <h2 className={styles.title}>Voto Registrado!</h2>
                        <p className={styles.description}>
                            Obrigado por participar. Seus dados foram contabilizados com sucesso.
                        </p>
                        <div className={styles.actions} style={{ marginTop: '2rem' }}>
                            <button onClick={() => navigate('/')} className={styles.voteButton}>
                                Ver outras enquetes
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
                    <h1 className={styles.title}>{poll?.titulo}</h1>
                    <p className={styles.description}>{poll?.descricao}</p>
                </header>

                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.optionsGrid}>
                    {poll?.opcoes?.map((opcao) => (
                        <div 
                            key={opcao.id_opcao_voto}
                            className={`${styles.optionCard} ${selectedOption === opcao.id_opcao_voto ? styles.optionCardSelected : ''}`}
                            onClick={() => setSelectedOption(opcao.id_opcao_voto)}
                        >
                            <div className={styles.radioCircle}>
                                <div className={styles.radioInner} />
                            </div>
                            <div className={styles.optionText}>
                                <span className={styles.optionDesignacao}>{opcao.designacao}</span>
                                {opcao.descricao && <span className={styles.optionDesc}>{opcao.descricao}</span>}
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
                        {voting ? 'Processando...' : <><HiOutlineBolt /> Confirmar Voto</>}
                    </button>
                </div>
            </div>
        </>
    );
}
