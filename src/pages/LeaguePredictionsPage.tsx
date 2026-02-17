/**
 * League Predictions Page
 * Shows all member predictions for matches that have started or completed
 * Hides predictions for scheduled matches to maintain suspense
 */

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Radio, CheckCircle2, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLeagueWithMembers } from '@/hooks/useLeagues';
import { useMatches } from '@/hooks/useMatches';
import { useLeaguePredictions } from '@/hooks/usePredictions';
import { useESPNLiveMatches } from '@/hooks/useESPNMatches';
import { getTeamLogo } from '@/utils/teamLogos';
import { formatDate } from '@/utils/dateUtils';
import type { Match, Prediction } from '@/types/database';

export function LeaguePredictionsPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const { data: league, isLoading: leagueLoading } = useLeagueWithMembers(leagueId || '');
  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: predictions, isLoading: predictionsLoading } = useLeaguePredictions(leagueId || '');
  const { data: espnLiveMatches } = useESPNLiveMatches();

  const isLoading = leagueLoading || matchesLoading || predictionsLoading;

  if (isLoading) {
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

  if (!league || !matches || !predictions) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">Unable to load predictions.</p>
          <Link to="/leagues" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            ← Back to Leagues
          </Link>
        </div>
      </div>
    );
  }

  // Filter matches that have started (match_date is in the past)
  const now = new Date();
  const startedMatches = matches.filter((match) => {
    const matchDate = new Date(match.match_date);
    return matchDate <= now;
  });

  // Sort by date (most recent first)
  const sortedMatches = [...startedMatches].sort((a, b) => {
    return new Date(b.match_date).getTime() - new Date(a.match_date).getTime();
  });

  // Group predictions by match
  const predictionsByMatch = predictions.reduce((acc, pred) => {
    if (!acc[pred.match_id]) {
      acc[pred.match_id] = [];
    }
    acc[pred.match_id].push(pred);
    return acc;
  }, {} as Record<string, Prediction[]>);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/leagues/${leagueId}`}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to League
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-secondary-900 text-3xl font-bold">{league.name}</h1>
            <p className="text-secondary-600 mt-1">Member Predictions</p>
          </div>
          <Trophy className="text-primary-600 h-12 w-12" />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Predictions are only visible after matches have started. Scheduled matches are hidden to maintain suspense! 🤫
        </p>
      </div>

      {/* Matches */}
      {sortedMatches.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-secondary-600 text-lg">No matches have started yet</p>
          <p className="text-secondary-500 text-sm mt-2">
            Predictions will be visible once matches begin
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedMatches.map((match) => {
            const matchPredictions = predictionsByMatch[match.id] || [];
            const isLive = espnLiveMatches?.some(
              (espnMatch) =>
                espnMatch.homeTeam.name === match.home_team &&
                espnMatch.awayTeam.name === match.away_team &&
                espnMatch.status.inProgress
            ) || false;

            return (
              <MatchPredictionsCard
                key={match.id}
                match={match}
                predictions={matchPredictions}
                members={league.members}
                isLive={isLive}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MatchPredictionsCardProps {
  match: Match;
  predictions: Prediction[];
  members: Array<{ user_id: string; user: { display_name: string } }>;
  isLive: boolean;
}

function MatchPredictionsCard({ match, predictions, members, isLive }: MatchPredictionsCardProps) {
  const homeLogo = getTeamLogo(match.home_team);
  const awayLogo = getTeamLogo(match.away_team);

  // Create a map of user predictions
  const predictionMap = predictions.reduce((acc, pred) => {
    acc[pred.user_id] = pred;
    return acc;
  }, {} as Record<string, Prediction>);

  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-sm transition-all ${isLive
        ? 'border-red-500 shadow-red-100'
        : match.is_completed
          ? 'border-green-500 shadow-green-100'
          : 'border-gray-200'
        }`}
    >
      {/* Match Header */}
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
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
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatDate(match.match_date)}</p>
          </div>
        </div>

        {/* Teams and Score */}
        <div className="mt-4 space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 p-1">
                {homeLogo ? (
                  <img src={homeLogo} alt={match.home_team} className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <span className="font-semibold text-gray-900">{match.home_team}</span>
            </div>
            <div className={`text-2xl font-bold ${isLive ? 'text-red-600' : 'text-gray-900'}`}>
              {match.home_score ?? '-'}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 p-1">
                {awayLogo ? (
                  <img src={awayLogo} alt={match.away_team} className="w-full h-full object-contain" />
                ) : (
                  <Shield className="w-4 h-4 text-gray-300" />
                )}
              </div>
              <span className="font-semibold text-gray-900">{match.away_team}</span>
            </div>
            <div className={`text-2xl font-bold ${isLive ? 'text-red-600' : 'text-gray-900'}`}>
              {match.away_score ?? '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Member Predictions</h3>
        {predictions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No predictions made for this match</p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const prediction = predictionMap[member.user_id];
              if (!prediction) return null;

              const isExact =
                match.is_completed &&
                prediction.predicted_home_score === match.home_score &&
                prediction.predicted_away_score === match.away_score;

              const isCorrectResult =
                match.is_completed &&
                !isExact &&
                ((prediction.predicted_home_score > prediction.predicted_away_score &&
                  (match.home_score ?? 0) > (match.away_score ?? 0)) ||
                  (prediction.predicted_home_score < prediction.predicted_away_score &&
                    (match.home_score ?? 0) < (match.away_score ?? 0)) ||
                  (prediction.predicted_home_score === prediction.predicted_away_score &&
                    match.home_score === match.away_score));

              return (
                <div
                  key={member.user_id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${isExact
                    ? 'border-green-300 bg-green-50'
                    : isCorrectResult
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                    }`}
                >
                  <span className="font-medium text-gray-900">{member.user.display_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-gray-900">
                      {prediction.predicted_home_score} - {prediction.predicted_away_score}
                    </span>
                    {match.is_completed && (
                      <span
                        className={`text-xs font-semibold ${isExact
                          ? 'text-green-700'
                          : isCorrectResult
                            ? 'text-blue-700'
                            : 'text-gray-500'
                          }`}
                      >
                        {isExact
                          ? '🎯 +3 pts (Exact!)'
                          : isCorrectResult
                            ? '✓ +1 pt (Result)'
                            : '✗ 0 pts'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

