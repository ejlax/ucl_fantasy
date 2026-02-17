/**
 * Predictions Page
 * Allows users to make and manage predictions for matches in their leagues
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserLeagues } from '@/hooks/useLeagues';
import { useMatchesGroupedByRound } from '@/hooks/useMatches';
import { useUserPredictions, useSavePrediction } from '@/hooks/usePredictions';
import { DynamicPredictionCard } from '@/components/predictions/DynamicPredictionCard';
import { LiveMatchBanner } from '@/components/matches';
import { useLiveMatchUpdates } from '@/hooks/useRealtimeMatches';
import { Trophy, Calendar } from 'lucide-react';
import { formatRoundName } from '@/utils/formatting';
import type { Match } from '@/types/database';

export function PredictionsPage() {
  const { user } = useAuth();
  const { data: leagues, isLoading: leaguesLoading } = useUserLeagues(user?.id || '');
  const { data: matchesGrouped, isLoading: matchesLoading } = useMatchesGroupedByRound();
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');

  const { data: predictions, isLoading: predictionsLoading } = useUserPredictions(
    selectedLeagueId,
    user?.id || ''
  );
  const savePrediction = useSavePrediction();

  // Enable real-time updates for live matches
  useLiveMatchUpdates(selectedLeagueId);

  // Set default league when leagues load
  if (leagues && leagues.length > 0 && !selectedLeagueId) {
    setSelectedLeagueId(leagues[0].id);
  }

  const handleSavePrediction = async (matchId: string, homeScore: number, awayScore: number) => {
    if (!user?.id || !selectedLeagueId) return;

    await savePrediction.mutateAsync({
      leagueId: selectedLeagueId,
      userId: user.id,
      matchId,
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
    });
  };

  const getPredictionForMatch = (matchId: string) => {
    return predictions?.find((p) => p.match_id === matchId);
  };

  if (leaguesLoading || matchesLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary-200 border-t-primary-600 mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4"></div>
            <p className="text-secondary-600">Loading predictions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-secondary-900 text-3xl font-bold">My Predictions</h1>
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-secondary-900 mt-4 text-lg font-semibold">No leagues yet</h3>
          <p className="text-secondary-600 mt-2">
            Join or create a league to start making predictions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">My Predictions</h1>
          <p className="mt-2 text-slate-600">
            Predict match scores to earn points in your leagues
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

        {/* Live Match Banner */}
        <LiveMatchBanner />

        {/* Matches by Round */}
        {matchesGrouped && Object.keys(matchesGrouped).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(matchesGrouped).map(([round, matches]) => {
              // Group matches by leg
              const leg1Matches = matches.filter((m) => m.leg === 1);
              const leg2Matches = matches.filter((m) => m.leg === 2);
              const hasTwoLegs = leg1Matches.length > 0 && leg2Matches.length > 0;

              return (
                <div key={round} className="space-y-6">
                  {/* Round Header */}
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                    <Calendar className="text-primary-600 h-5 w-5" />
                    <h2 className="text-secondary-900 text-xl font-bold">{formatRoundName(round)}</h2>
                    <span className="text-secondary-500 text-sm">
                      ({matches.length} {matches.length === 1 ? 'match' : 'matches'})
                    </span>
                  </div>

                  {/* Leg 1 Section */}
                  {leg1Matches.length > 0 && (
                    <div className="space-y-3">
                      {hasTwoLegs && (
                        <h3 className="text-secondary-700 text-sm font-semibold tracking-wide uppercase">
                          First Leg
                        </h3>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                        {leg1Matches.map((match) => {
                          const prediction = getPredictionForMatch(match.id);

                          return (
                            <DynamicPredictionCard
                              key={match.id}
                              match={match}
                              existingPrediction={prediction}
                              onSubmit={(home, away) => handleSavePrediction(match.id, home, away)}
                              isSubmitting={savePrediction.isPending}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Leg 2 Section */}
                  {leg2Matches.length > 0 && (
                    <div className="space-y-3">
                      {hasTwoLegs && (
                        <h3 className="text-secondary-700 text-sm font-semibold tracking-wide uppercase">
                          Second Leg
                        </h3>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                        {leg2Matches.map((match) => {
                          const prediction = getPredictionForMatch(match.id);

                          return (
                            <DynamicPredictionCard
                              key={match.id}
                              match={match}
                              existingPrediction={prediction}
                              onSubmit={(home, away) => handleSavePrediction(match.id, home, away)}
                              isSubmitting={savePrediction.isPending}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-secondary-900 mt-4 text-lg font-semibold">No matches available</h3>
            <p className="text-secondary-600 mt-2">
              Matches will appear here when the tournament schedule is released
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
