import NavMenu from "../../../Components/NavMenu/NavMenu";
import PollCard from "../../../Components/PollCard/PollCard";
import SearchBarAdmin from "../../../Components/SearchBarAdmin/SearchBarAdmin";
import Loading from "../../../Components/Loading/Loading";
import { usePolls } from "../../../Hooks/usePolls";
import styles from './Main.module.css';

export default function Main() {
    const { polls, loading, error } = usePolls();

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
                <h2 className={styles.title}>Enquetes Disponíveis</h2>
                
                <section className={styles.pollsGrid}>
                    {polls.length > 0 ? (
                        polls.map(poll => (
                            <PollCard 
                                key={poll.id_enquete} 
                                enquete={poll} 
                                onVote={(id) => window.location.href = `/vote/${id}`}
                            />
                        ))
                    ) : (
                        <p className={styles.emptyMessage}>
                            Nenhuma enquete encontrada no momento.
                        </p>
                    )}
                </section>
            </main>
        </>
    );
}
