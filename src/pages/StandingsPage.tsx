/**
 * Standings Page
 * Displays league leaderboards and rankings for users
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserLeagues } from '@/hooks/useLeagues';
import { useLeagueStandings } from '@/hooks/useStandings';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { Trophy, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StandingsPage() {
  const { user } = useAuth();
  const { data: leagues, isLoading: leaguesLoading } = useUserLeagues(user?.id || '');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');

  const { data: standings, isLoading: standingsLoading, error } = useLeagueStandings(selectedLeagueId);

  // Set default league when leagues load
  if (leagues && leagues.length > 0 && !selectedLeagueId) {
    setSelectedLeagueId(leagues[0].id);
  }

  // Get selected league details
  const selectedLeague = leagues?.find((league) => league.id === selectedLeagueId);

  // Loading state
  if (leaguesLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
            <p className="text-secondary-600">Loading standings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no leagues
  if (!leagues || leagues.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-secondary-900 text-3xl font-bold">Standings</h1>
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-secondary-900 mt-4 text-lg font-semibold">No leagues yet</h3>
          <p className="text-secondary-600 mt-2 mb-6">
            Join or create a league to see standings and compete with friends
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/leagues"
              className="btn btn-primary"
            >
              View Leagues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Standings</h1>
        <p className="mt-2 text-slate-600">
          View league leaderboards and track your ranking
        </p>
      </div>

      {/* League Selector */}
      {leagues.length > 1 && (
        <div className="mb-6">
          <label
            htmlFor="league-select"
            className="text-secondary-700 mb-2 block text-sm font-medium"
          >
            Select League
          </label>
          <select
            id="league-select"
            value={selectedLeagueId}
            onChange={(e) => setSelectedLeagueId(e.target.value)}
            className="focus:border-primary-500 focus:ring-primary-500 block w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* League Info */}
      {selectedLeague && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedLeague.name}</h2>
              {selectedLeague.description && (
                <p className="text-secondary-600 mt-1">{selectedLeague.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-secondary-600">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">
                {selectedLeague.member_count || 0} members
              </span>
            </div>
          </div>

          {/* Bonus Points Info */}
          {selectedLeague.settings && (selectedLeague.settings.enable_tie_winner_bonus || selectedLeague.settings.enable_round_winner_bonus) && (
            <div className="mt-4 rounded-md bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">Bonus Points Enabled</h3>
                  <ul className="mt-1 text-sm text-blue-800 space-y-1">
                    {selectedLeague.settings.enable_tie_winner_bonus && (
                      <li>• Tie Winner Bonus: {selectedLeague.settings.tie_winner_bonus_points || 2} points</li>
                    )}
                    {selectedLeague.settings.enable_round_winner_bonus && (
                      <li>• Round Winner Bonuses: R16 ({selectedLeague.settings.round_winner_bonus_points?.r16 || 5}), QF ({selectedLeague.settings.round_winner_bonus_points?.qf || 10}), SF ({selectedLeague.settings.round_winner_bonus_points?.sf || 15})</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standings Table */}
      {standingsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
            <p className="text-secondary-600">Loading standings...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-800 mb-4">Failed to load standings</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm overflow-hidden">
          <StandingsTable standings={standings || []} currentUserId={user?.id} />
        </div>
      )}
    </div>
  );
}
