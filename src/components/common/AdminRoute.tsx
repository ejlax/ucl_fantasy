import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

/**
 * AdminRoute Component
 * Protects routes that should only be accessible to admins
 * Redirects non-admins to the dashboard
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Show loading state while checking auth and admin status
  if (loading || isAdminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not an admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

