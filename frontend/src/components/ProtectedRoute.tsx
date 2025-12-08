import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication
 * If user is not logged in, redirects to login page
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, show the page
  return <>{children}</>;
}
