import { 
    HiOutlineClock, 
    HiOutlineUsers, 
    HiOutlineBolt, 
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineCalendarDays
} from 'react-icons/hi2';
import styles from './PollCard.module.css';

import type { PollCardProps } from '../../@types/types';

export default function PollCard({ enquete, onVote }: PollCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isEnqueteAtiva = enquete.status === 'ativa';
    const dataEncerramento = enquete.data_fim && new Date(enquete.data_fim) < new Date();
    const encerrada = !isEnqueteAtiva || dataEncerramento;

    return (
        <div className={`${styles.card} ${encerrada ? styles.cardInactive : ''}`}>
            <div className={styles.cardHeader}>
                <div className={`${styles.badge} ${encerrada ? styles.badgeInactive : styles.badgeActive}`}>
                    {encerrada ? <HiOutlineClock /> : <HiOutlineBolt className={styles.pulse} />}
                    <span>{encerrada ? 'Encerrada' : 'Ativa'}</span>
                </div>
                <div className={styles.voteCountBadge}>
                    <HiOutlineUsers />
                    <span>{enquete.total_votos || 0}</span>
                </div>
            </div>
            
            <div className={styles.cardContent}>
                <h3 className={styles.title}>{enquete.titulo}</h3>
                <p className={styles.description}>
                    {enquete.descricao || 'Sem descrição detalhada para esta votação.'}
                </p>
                
                <div className={styles.metaContainer}>
                    <div className={styles.metaItem}>
                        <HiOutlineCalendarDays />
                        <span>{enquete.data_fim ? `Expira em ${formatDate(enquete.data_fim)}` : 'Sem data de expiração'}</span>
                    </div>
                </div>
            </div>
            
            <div className={styles.cardFooter}>
                {!encerrada ? (
                    <button 
                        className={styles.primaryButton}
                        onClick={() => onVote?.(String(enquete.id_enquete))}
                    >
                        <HiOutlineBolt /> Votar Agora
                    </button>
                ) : (
                    <button 
                        className={styles.secondaryButton}
                        onClick={() => window.location.href = `/vote/${String(enquete.id_enquete)}`}
                    >
                        <HiOutlineChartBar /> Ver Resultados
                    </button>
                )}
                
                {enquete.usuario_ja_votou && (
                    <div className={styles.votedStatus}>
                        <HiOutlineCheckCircle />
                        <span>Voto confirmado</span>
                    </div>
                )}
            </div>
        </div>
    );
}
