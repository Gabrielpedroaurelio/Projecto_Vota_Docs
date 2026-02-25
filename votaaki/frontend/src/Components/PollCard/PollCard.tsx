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

export default function PollCard({ poll, onVote }: PollCardProps) {
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
                    <span>{isClosed ? 'Closed' : 'Active'}</span>
                </div>
                <div className={styles.voteCountBadge}>
                    <HiOutlineUsers />
                    <span>{poll.total_votes || 0}</span>
                </div>
            </div>
            
            <div className={styles.cardContent}>
                <h3 className={styles.title}>{poll.title}</h3>
                <p className={styles.description}>
                    {poll.description || 'No detailed description for this poll.'}
                </p>
                
                <div className={styles.metaContainer}>
                    <div className={styles.metaItem}>
                        <HiOutlineCalendarDays />
                        <span>{poll.end_date ? `Expires on ${formatDate(poll.end_date)}` : 'No expiration date'}</span>
                    </div>
                </div>
            </div>
            
            <div className={styles.cardFooter}>
                {!isClosed ? (
                    <button 
                        className={styles.primaryButton}
                        onClick={() => onVote?.(String(poll.id_poll))}
                    >
                        <HiOutlineBolt /> Vote Now
                    </button>
                ) : (
                    <button 
                        className={styles.secondaryButton}
                        onClick={() => window.location.href = `/vote/${String(poll.id_poll)}`}
                    >
                        <HiOutlineChartBar /> View Results
                    </button>
                )}
                
                {poll.user_voted && (
                    <div className={styles.votedStatus}>
                        <HiOutlineCheckCircle />
                        <span>Vote confirmed</span>
                    </div>
                )}
            </div>
        </div>
    );
}
