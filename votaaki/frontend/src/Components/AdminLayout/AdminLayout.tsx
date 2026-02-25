import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
    return (
        <div className={styles.layout}>
            <AdminSidebar />
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}
