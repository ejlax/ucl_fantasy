import { Link } from 'react-router-dom';
import { Trophy, Users, Target, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-secondary-900 text-3xl font-bold">Welcome back, {displayName}!</h1>
        <p className="text-secondary-600 mt-2">
          Ready to make your predictions for the Champions League knockout stages?
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* My Leagues */}
        <Link
          to="/leagues"
          className="card group hover:border-primary-300 transition-all hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary-100 group-hover:bg-primary-200 rounded-lg p-3 transition-colors">
              <Users className="text-primary-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-secondary-900 font-semibold">My Leagues</h3>
              <p className="text-secondary-600 mt-1 text-sm">View and manage your leagues</p>
            </div>
          </div>
        </Link>

        {/* Bracket */}
        <Link
          to="/bracket"
          className="card group hover:border-primary-300 transition-all hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary-100 group-hover:bg-primary-200 rounded-lg p-3 transition-colors">
              <Trophy className="text-primary-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-secondary-900 font-semibold">Bracket</h3>
              <p className="text-secondary-600 mt-1 text-sm">View tournament bracket</p>
            </div>
          </div>
        </Link>

        {/* Predictions */}
        <Link
          to="/predictions"
          className="card group hover:border-primary-300 transition-all hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary-100 group-hover:bg-primary-200 rounded-lg p-3 transition-colors">
              <Target className="text-primary-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-secondary-900 font-semibold">Predictions</h3>
              <p className="text-secondary-600 mt-1 text-sm">Make your predictions</p>
            </div>
          </div>
        </Link>

        {/* Standings */}
        <Link
          to="/standings"
          className="card group hover:border-primary-300 transition-all hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="bg-primary-100 group-hover:bg-primary-200 rounded-lg p-3 transition-colors">
              <Award className="text-primary-600 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-secondary-900 font-semibold">Standings</h3>
              <p className="text-secondary-600 mt-1 text-sm">Check the leaderboard</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Getting Started Section */}
      <div className="mt-12">
        <h2 className="text-secondary-900 text-2xl font-bold">Getting Started</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="text-secondary-900 text-lg font-semibold">Create a League</h3>
            <p className="text-secondary-600 mt-2">
              Start your own fantasy league and invite friends to compete.
            </p>
            <Link to="/leagues" className="btn btn-primary mt-4">
              Go to Leagues
            </Link>
          </div>

          <div className="card">
            <h3 className="text-secondary-900 text-lg font-semibold">Join a League</h3>
            <p className="text-secondary-600 mt-2">
              Have an invite code? Join an existing league and start competing.
            </p>
            <Link to="/leagues" className="btn btn-outline mt-4">
              Go to Leagues
            </Link>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-primary-50 mt-12 rounded-lg p-6">
        <h3 className="text-primary-900 text-lg font-semibold">How UCL Fantasy Works</h3>
        <ul className="text-primary-800 mt-4 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>Predict the scores for Champions League knockout matches</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>Earn points for correct predictions (exact score or correct result)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>Compete with friends in private leagues</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-1">•</span>
            <span>Climb the leaderboard and become the champion!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
