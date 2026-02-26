import { Link, useNavigate } from 'react-router-dom';
import { 
    HiOutlineHome, 
    HiOutlineUserCircle, 
    HiOutlineArrowRightOnRectangle,
    HiOutlineSquaresPlus,
    HiOutlineUsers
} from 'react-icons/hi2';
import { useAuth } from '../../Hooks/useAuth';
import styles from './NavMenu.module.css';

export default function NavMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className={styles.header}>
            <div className={styles.logo} onClick={() => navigate('/')}>
                <img src="/logo_votaaki.png" alt="VotaAki" />
                <span className={styles.logoText}>VotaAki</span>
            </div>
            
            <nav className={styles.navbar}>
                <Link to="/" className={styles.navLink}>
                    <HiOutlineHome /> <span>Início</span>
                </Link>

                {user?.user_type === 'admin' && (
                    <>
                        <Link to="/admin/dashboard" className={styles.navLink}>
                            <HiOutlineSquaresPlus /> <span>Dashboard</span>
                        </Link>
                        <Link to="/admin/users" className={styles.navLink}>
                            <HiOutlineUsers /> <span>Usuários</span>
                        </Link>
                    </>
                )}

                {user && (
                    <Link to="/profile" className={styles.navLink}>
                        <HiOutlineUserCircle /> <span>Perfil</span>
                    </Link>
                )}

                <div className={styles.authSection}>
                    {user ? (
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            <HiOutlineArrowRightOnRectangle /> <span>Sair</span>
                        </button>
                    ) : (
                        <Link to="/auth" className={styles.loginBtn}>Entrar</Link>
                    )}
                </div>
            </nav>
        </header>
    );
}