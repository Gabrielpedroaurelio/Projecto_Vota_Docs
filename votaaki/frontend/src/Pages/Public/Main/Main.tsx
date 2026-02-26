import { useState, useMemo } from "react";
import NavMenu from "../../../Components/NavMenu/NavMenu";
import PollCard from "../../../Components/PollCard/PollCard";
import SearchBarAdmin from "../../../Components/SearchBarAdmin/SearchBarAdmin";
import Loading from "../../../Components/Loading/Loading";
import { usePolls } from "../../../Hooks/usePolls";
import styles from './Main.module.css';

export default function Main() {
    const { polls, loading } = usePolls();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPolls = useMemo(() => {
        if (!polls) return [];
        return polls.filter(poll => 
            poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [polls, searchTerm]);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <NavMenu />
                <div className={styles.centerSection}>
                    <Loading />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <NavMenu />
            
            <header className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Decisões Colectivas, <br /><span>Resultados Transparentes</span></h1>
                    <p className={styles.heroSubtitle}>
                        Participe nas votações activas ou explore os resultados das enquetes encerradas na plataforma VotaAki.
                    </p>
                </div>
            </header>

            <SearchBarAdmin onSearch={setSearchTerm} />
            
            <main className={styles.mainContainer}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        {searchTerm ? `Resultados para "${searchTerm}"` : 'Enquetes em Destaque'}
                    </h2>
                    <span className={styles.countBadge}>{filteredPolls.length} enquetes</span>
                </div>
                
                <section className={styles.pollsGrid}>
                    {filteredPolls.length > 0 ? (
                        filteredPolls.map(poll => (
                            <PollCard 
                                key={poll.id_poll} 
                                poll={poll} 
                                onVote={(id) => window.location.href = `/vote/${id}`}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyContainer}>
                            <p className={styles.emptyMessage}>
                                {searchTerm 
                                    ? "Nenhuma enquete corresponde à sua busca." 
                                    : "Não foram encontradas enquetes no momento."}
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
