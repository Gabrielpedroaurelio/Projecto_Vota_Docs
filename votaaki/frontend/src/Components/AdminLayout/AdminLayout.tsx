import { Outlet } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import NavMenu from '../NavMenu/NavMenu';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
    const { user } = useAuth();
    const isAdmin = user?.user_type === 'admin';

    return (
        <div className={isAdmin ? styles.layout : styles.publicLayout}>
            {isAdmin ? <AdminSidebar /> : <NavMenu />}
            <main className={isAdmin ? styles.content : styles.publicContent}>
                <Outlet />
            </main>
        </div>
    );
}
