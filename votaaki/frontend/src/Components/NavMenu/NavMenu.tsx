import { Link } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import styles from './NavMenu.module.css';

export default function NavMenu() {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.logo} onClick={() => window.location.href = '/'}>
                <img src="/logo_votaaki.png" alt="VotaAki" width={150} style={{ cursor: 'pointer' }} />
            </div>
            <nav className={styles.navbarmenu}>
                <Link to="/">Home</Link>
                {user?.user_type === 'admin' && (
                    <>
                        <Link to="/dashboard" className={styles.adminLink}>Dashboard</Link>
                        <Link to="/users" className={styles.adminLink}>Usuários</Link>
                    </>
                )}
                {user ? (
                    <button onClick={logout} className={styles.logoutBtn}>Logout</button>
                ) : (
                    <Link to="/auth" className={styles.loginBtn}>Entrar</Link>
                )}
            </nav>
        </header>
    );
}