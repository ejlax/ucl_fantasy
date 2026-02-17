/**
 * Live Leaderboard Component
 * Shows real-time fantasy league standings with live score updates
 */

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Radio } from 'lucide-react';
import { useLeagueStandings } from '@/hooks/useStandings';
import { useLiveMatchUpdates } from '@/hooks/useRealtimeMatches';
import { useESPNLiveMatches } from '@/hooks/useESPNMatches';

interface LiveLeaderboardProps {
  leagueId: string;
  showLiveIndicator?: boolean;
}

export function LiveLeaderboard({ leagueId, showLiveIndicator = true }: LiveLeaderboardProps) {
  const { data: standings, isLoading } = useLeagueStandings(leagueId);
  const { data: liveMatches } = useESPNLiveMatches();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Enable real-time updates
  useLiveMatchUpdates(leagueId);

  // Track when standings update
  useEffect(() => {
    if (standings) {
      setLastUpdate(new Date());
    }
  }, [standings]);

  const hasLiveMatches = liveMatches && liveMatches.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No standings available yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Indicator */}
      {showLiveIndicator && hasLiveMatches && (
        <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-600 animate-pulse" />
            <div>
              <p className="font-semibold text-red-900">Live Updates Active</p>
              <p className="text-sm text-red-700">
                Standings update automatically as matches progress
              </p>
            </div>
          </div>
          <div className="text-xs text-red-600">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Live Leaderboard
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {standings.map((entry, index) => {
            const isTop3 = index < 3;
            const rankChange = entry.rank_change || 0;

            return (
              <div
                key={entry.user_id}
                className={`px-6 py-4 flex items-center gap-4 transition-all ${
                  isTop3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <div
                    className={`text-2xl font-bold ${
                      index === 0
                        ? 'text-yellow-600'
                        : index === 1
                        ? 'text-gray-500'
                        : index === 2
                        ? 'text-orange-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {entry.user_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {entry.correct_predictions} correct predictions
                  </p>
                </div>

                {/* Rank Change Indicator */}
                {rankChange !== 0 && (
                  <div className="flex-shrink-0">
                    {rankChange > 0 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">+{rankChange}</span>
                      </div>
                    ) : rankChange < 0 ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-semibold">{rankChange}</span>
                      </div>
                    ) : (
                      <Minus className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                )}

                {/* Points */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {entry.total_points}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

