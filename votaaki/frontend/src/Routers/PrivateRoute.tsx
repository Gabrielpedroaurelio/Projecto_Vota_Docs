import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';
import Loading from '../Components/Loading/Loading';

interface PrivateRouteProps {
    requiredRole?: 'admin' | 'user';
}

export default function PrivateRoute({ requiredRole }: PrivateRouteProps) {
    const { user, loading } = useAuth();

    if (loading) return <Loading texto="Verifying identity..." />;

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (requiredRole && user.user_type !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
