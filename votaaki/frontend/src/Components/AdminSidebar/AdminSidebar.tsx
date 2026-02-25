import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import { 
    HiOutlineChartPie, 
    HiOutlineUsers, 
    HiOutlineListBullet,
    HiOutlineCheckCircle,
    HiOutlineDocumentChartBar,
    HiOutlineUserCircle,
    HiOutlineArrowLeftOnRectangle,
    HiOutlineClock
} from 'react-icons/hi2';
import styles from './AdminSidebar.module.css';

export default function AdminSidebar() {
    const { logout } = useAuth();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <HiOutlineChartPie /> },
        { path: '/admin/users', label: 'Usuários', icon: <HiOutlineUsers /> },
        { path: '/admin/polls', label: 'Enquetes', icon: <HiOutlineListBullet /> },
        { path: '/admin/options', label: 'Opções', icon: <HiOutlineCheckCircle /> },
        { path: '/admin/reports', label: 'Relatórios', icon: <HiOutlineDocumentChartBar /> },
        { path: '/admin/history', label: 'Histórico', icon: <HiOutlineClock /> },
        { path: '/profile', label: 'Perfil', icon: <HiOutlineUserCircle /> },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <img src="/logo_votaaki.png" alt="VotaAki" />
                <span>Admin Panel</span>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                <button onClick={logout} className={styles.logoutBtn}>
                    <HiOutlineArrowLeftOnRectangle />
                    <span>Terminar Sessão</span>
                </button>
            </div>
        </aside>
    );
}
