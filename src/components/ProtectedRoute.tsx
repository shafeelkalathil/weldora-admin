import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
    const currentUser = authService.getCurrentUser();

    // Not authenticated - redirect to login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Check role permissions if specified
    if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
        // Redirect to dashboard if user doesn't have required role
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
