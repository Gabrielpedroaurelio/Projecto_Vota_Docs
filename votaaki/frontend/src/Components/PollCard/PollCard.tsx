import { useNavigate } from 'react-router-dom';
import { 
    HiOutlineClock, 
    HiOutlineUsers, 
    HiOutlineBolt, 
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineCalendarDays,
    HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import { useAuth } from '../../Hooks/useAuth';
import styles from './PollCard.module.css';

import type { PollCardProps } from '../../@types/types';

export default function PollCard({ poll, onVote }: PollCardProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isActive = poll.status === 'active';
    const isExpired = poll.end_date && new Date(poll.end_date) < new Date();
    const isClosed = !isActive || isExpired;

    return (
        <div className={`${styles.card} ${isClosed ? styles.cardInactive : ''}`}>
            <div className={styles.cardHeader}>
                <div className={`${styles.badge} ${isClosed ? styles.badgeInactive : styles.badgeActive}`}>
                    {isClosed ? <HiOutlineClock /> : <HiOutlineBolt className={styles.pulse} />}
                    <span>{isClosed ? 'Encerrada' : 'Activa'}</span>
                </div>
                <div className={styles.voteCountBadge} title="Total de votos">
                    <HiOutlineUsers />
                    <span>{poll.total_votes || 0} votos</span>
                </div>
            </div>
            
            <div className={styles.cardContent}>
                <h3 className={styles.title}>{poll.title}</h3>
                <p className={styles.description}>
                    {poll.description || 'Sem descrição detalhada para esta enquete.'}
                </p>
                
                <div className={styles.metaContainer}>
                    <div className={styles.metaItem}>
                        <HiOutlineCalendarDays />
                        <span>{poll.end_date ? `Expira em ${formatDate(poll.end_date)}` : 'Sem data de expiração'}</span>
                    </div>
                </div>
            </div>
            
            <div className={styles.cardFooter}>
                {!isClosed ? (
                    user ? (
                        <button 
                            className={styles.primaryButton}
                            onClick={() => onVote?.(String(poll.id_poll))}
                        >
                            <HiOutlineBolt /> Votar Agora
                        </button>
                    ) : (
                        <button 
                            className={styles.loginButton}
                            onClick={() => navigate('/auth')}
                        >
                            <HiOutlineArrowRightOnRectangle /> Entrar para Votar
                        </button>
                    )
                ) : (
                    <button 
                        className={styles.secondaryButton}
                        onClick={() => navigate(`/vote/${String(poll.id_poll)}`)}
                    >
                        <HiOutlineChartBar /> Ver Resultados
                    </button>
                )}
                
                {poll.user_voted && (
                    <div className={styles.votedStatus}>
                        <HiOutlineCheckCircle />
                        <span>Voto confirmado</span>
                    </div>
                )}
            </div>
        </div>
    );
}
