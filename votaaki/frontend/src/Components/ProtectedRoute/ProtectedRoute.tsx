import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import Loading from '../Loading/Loading';

interface ProtectedRouteProps {
    adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'var(--color-bg-main)'
            }}>
                <Loading />
            </div>
        );
    }

    if (!user) {
        // Not logged in, redirect to auth
        return <Navigate to="/auth" replace />;
    }

    if (adminOnly && user.user_type !== 'admin') {
        // Logged in but not admin, and it's an admin-only route
        return <Navigate to="/" replace />;
    }

    // Authorized, render the child routes or components
    return <Outlet />;
}
