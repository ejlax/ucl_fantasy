import { Trophy } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="from-primary-50 to-primary-100 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Trophy className="text-primary-600 h-24 w-24" />
        </div>

        <h1 className="mb-4 text-5xl font-bold text-gray-900">UCL Fantasy</h1>

        <p className="mb-8 text-xl text-gray-600">
          Compete with friends in UEFA Champions League fantasy brackets
        </p>

        <div className="flex justify-center gap-4">
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
          <Link to="/signup" className="btn btn-outline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
