import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavMenu from "../../../Components/NavMenu/NavMenu";
import PollCard from "../../../Components/PollCard/PollCard";
import SearchBarAdmin from "../../../Components/SearchBarAdmin/SearchBarAdmin";
import Loading from "../../../Components/Loading/Loading";
import { usePolls } from "../../../Hooks/usePolls";
import { useAuth } from "../../../Hooks/useAuth";
import styles from './Main.module.css';

export default function Main() {
    const { polls, loading, error } = usePolls();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.user_type === 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    if (loading) {
        return (
            <>
                <NavMenu />
                <Loading />
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavMenu />
                <div className={styles.errorMessage}>
                    {error}
                </div>
            </>
        );
    }

    return (
        <>
            <NavMenu />
            <SearchBarAdmin />
            
            <main className={styles.mainContainer}>
                <h2 className={styles.title}>Available Polls</h2>
                
                <section className={styles.pollsGrid}>
                    {polls.length > 0 ? (
                        polls.map(poll => (
                            <PollCard 
                                key={poll.id_poll} 
                                poll={poll} 
                                onVote={(id) => window.location.href = `/vote/${id}`}
                            />
                        ))
                    ) : (
                        <p className={styles.emptyMessage}>
                            No polls found at the moment.
                        </p>
                    )}
                </section>
            </main>
        </>
    );
}
