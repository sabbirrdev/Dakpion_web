import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/sign-in?redirect=${redirectUrl}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || user?.appUserType || 'USER';
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/inbox" replace />;
    }
  }

  return children ? <>{children}</> : null;
}
