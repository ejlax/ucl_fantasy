/**
 * Modal component to display detailed match information
 * Shows both legs of a tie with scores, dates, and stats
 */

import { X, Calendar, MapPin, Trophy } from 'lucide-react';
import type { Match } from '@/types/database';
import { formatRoundName } from '@/utils/formatting';
import { formatDate } from '@/utils/dateUtils';

interface MatchDetailsModalProps {
  match: Match;
  secondLegMatch?: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchDetailsModal({
  match,
  secondLegMatch,
  isOpen,
  onClose,
}: MatchDetailsModalProps) {
  if (!isOpen) return null;

  const isCompleted = match.status === 'COMPLETED';
  const isFinal = match.round === 'FINAL';

  // Calculate aggregate scores if both legs exist
  const hasAggregate = secondLegMatch && !isFinal;
  let homeAggregate = 0;
  let awayAggregate = 0;
  let winner = null;

  if (hasAggregate && isCompleted && secondLegMatch.status === 'COMPLETED') {
    homeAggregate = (match.home_score || 0) + (secondLegMatch.away_score || 0);
    awayAggregate = (match.away_score || 0) + (secondLegMatch.home_score || 0);

    if (homeAggregate > awayAggregate) {
      winner = match.home_team;
    } else if (awayAggregate > homeAggregate) {
      winner = match.away_team;
    }
  }

  const renderMatchCard = (m: Match, legNumber: number) => {
    const isHome = m.id === match.id;

    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {isFinal ? 'Match' : `Leg ${legNumber}`}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} />
            <span>{formatDate(m.match_date, 'EEE, MMM d')}</span>
            <span>{formatDate(m.match_date, 'h:mm a')}</span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Home Team */}
          <div className="flex items-center justify-between rounded bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              <span className="font-medium text-gray-900">{m.home_team}</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {m.status === 'COMPLETED' ? m.home_score : '-'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between rounded bg-white px-3 py-2">
            <span className="ml-6 font-medium text-gray-900">{m.away_team}</span>
            <span className="text-lg font-bold text-gray-900">
              {m.status === 'COMPLETED' ? m.away_score : '-'}
            </span>
          </div>
        </div>

        {m.venue && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} />
            <span>{m.venue}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="pointer-events-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formatRoundName(match.round)}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {match.home_team} vs {match.away_team}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Aggregate Score (if applicable) */}
            {hasAggregate && isCompleted && secondLegMatch.status === 'COMPLETED' && (
              <div className="bg-primary-50 border-primary-200 rounded-lg border-2 p-4">
                <div className="mb-3 text-center">
                  <span className="text-primary-700 text-sm font-semibold tracking-wide uppercase">
                    Aggregate Score
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`text-lg font-bold ${winner === match.home_team ? 'text-primary-600' : 'text-gray-700'}`}
                    >
                      {match.home_team}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white px-6 py-2">
                    <span
                      className={`text-2xl font-bold ${winner === match.home_team ? 'text-primary-600' : 'text-gray-700'}`}
                    >
                      {homeAggregate}
                    </span>
                    <span className="mx-2 text-gray-400">-</span>
                    <span
                      className={`text-2xl font-bold ${winner === match.away_team ? 'text-primary-600' : 'text-gray-700'}`}
                    >
                      {awayAggregate}
                    </span>
                  </div>
                  <div className="flex-1 text-right">
                    <p
                      className={`text-lg font-bold ${winner === match.away_team ? 'text-primary-600' : 'text-gray-700'}`}
                    >
                      {match.away_team}
                    </p>
                  </div>
                </div>
                {winner && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-center">
                    <Trophy size={16} className="text-primary-600" />
                    <span className="text-primary-700 text-sm font-semibold">
                      {winner} advances
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Match Details */}
            <div className="space-y-4">
              {renderMatchCard(match, 1)}
              {secondLegMatch && !isFinal && renderMatchCard(secondLegMatch, 2)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
