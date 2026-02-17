/**
 * Live Match Scores Component
 * Shows real-time match scores with live updates
 */

import { useEffect, useState } from 'react';
import { Radio, Clock, CheckCircle2, Shield } from 'lucide-react';
import { useRealtimeMatches } from '@/hooks/useRealtimeMatches';
import { useESPNLiveMatches } from '@/hooks/useESPNMatches';
import { useMatches } from '@/hooks/useMatches';
import { getTeamLogo } from '@/utils/teamLogos';
import type { Match } from '@/types/database';

interface LiveMatchScoresProps {
  round?: string;
  showOnlyLive?: boolean;
}

export function LiveMatchScores({ round, showOnlyLive = false }: LiveMatchScoresProps) {
  const { data: dbMatches } = useMatches();
  const { data: espnLiveMatches } = useESPNLiveMatches();

  // Enable real-time updates
  useRealtimeMatches();

  // Filter matches
  const matches = dbMatches?.filter((match) => {
    if (round && match.round !== round) return false;
    if (showOnlyLive && match.is_completed) return false;
    return true;
  }) || [];

  // Removed pulse animation - was too distracting
  // Live matches are already indicated by the red border and LIVE badge

  const hasLiveMatches = espnLiveMatches && espnLiveMatches.length > 0;

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No matches available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Indicator */}
      {hasLiveMatches && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <Radio className="h-4 w-4 text-red-600 animate-pulse" />
          <span className="text-sm font-semibold text-red-900">
            {espnLiveMatches.length} match{espnLiveMatches.length !== 1 ? 'es' : ''} in progress
          </span>
        </div>
      )}

      {/* Match Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          // A match is live if it's in the ESPN live matches list
          const isLive = espnLiveMatches?.some(
            (espnMatch) =>
              espnMatch.homeTeam.name === match.home_team &&
              espnMatch.awayTeam.name === match.away_team &&
              espnMatch.status.inProgress
          ) || false;
          const homeLogo = getTeamLogo(match.home_team);
          const awayLogo = getTeamLogo(match.away_team);

          return (
            <div
              key={match.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all ${isLive
                ? 'border-red-500 shadow-red-100'
                : match.is_completed
                  ? 'border-green-500 shadow-green-100'
                  : 'border-gray-200'
                }`}
            >
              {/* Status Badge */}
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {match.round} - Leg {match.leg}
                </span>
                {isLive && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Radio className="h-3 w-3 animate-pulse" />
                    <span className="text-xs font-bold">LIVE</span>
                  </div>
                )}
                {match.is_completed && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-xs font-bold">FT</span>
                  </div>
                )}
                {!isLive && !match.is_completed && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">Scheduled</span>
                  </div>
                )}
              </div>

              {/* Teams and Scores */}
              <div className="p-4 space-y-3">
                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 p-1 flex-shrink-0">
                      {homeLogo ? (
                        <img src={homeLogo} alt={match.home_team} className="w-full h-full object-contain" />
                      ) : (
                        <Shield className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 truncate">
                      {match.home_team}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold ${isLive ? 'text-red-600' : 'text-gray-900'}`}>
                    {match.home_score ?? '-'}
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 p-1 flex-shrink-0">
                      {awayLogo ? (
                        <img src={awayLogo} alt={match.away_team} className="w-full h-full object-contain" />
                      ) : (
                        <Shield className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 truncate">
                      {match.away_team}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold ${isLive ? 'text-red-600' : 'text-gray-900'}`}>
                    {match.away_score ?? '-'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

