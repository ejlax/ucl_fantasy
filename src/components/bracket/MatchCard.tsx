import { Match } from '@/types/database';
import { formatMatchDate, getRelativeTime, isDatePast } from '@/utils/dateUtils';
import { Badge } from '@/components/common';
import { Calendar, Clock } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
  showPrediction?: boolean;
  userPrediction?: {
    predicted_home_score: number;
    predicted_away_score: number;
    points_earned?: number | null;
  };
}

/**
 * Match card component for displaying match information
 */
export function MatchCard({ match, onClick, showPrediction, userPrediction }: MatchCardProps) {
  const isCompleted = match.is_completed;
  const isPast = isDatePast(match.match_date);
  const relativeTime = getRelativeTime(match.match_date);

  return (
    <div
      className={`rounded-lg border-2 bg-white p-4 transition-all ${isCompleted ? 'border-secondary-300' : 'border-primary-300'} ${onClick ? 'hover:border-primary-500 cursor-pointer hover:shadow-md' : ''} `}
      onClick={onClick}
    >
      {/* Match Date/Time */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-secondary-600 flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{formatMatchDate(match.match_date)}</span>
        </div>
        {isCompleted ? (
          <Badge variant="success" size="sm">
            Full Time
          </Badge>
        ) : isPast ? (
          <Badge variant="warning" size="sm">
            In Progress
          </Badge>
        ) : (
          <div className="text-secondary-600 flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>{relativeTime}</span>
          </div>
        )}
      </div>

      {/* Teams and Score */}
      <div className="space-y-2">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <span className="text-secondary-900 font-semibold">{match.home_team}</span>
          {isCompleted || match.home_score !== null ? (
            <span className="text-secondary-900 w-8 text-center text-2xl font-bold">
              {match.home_score}
            </span>
          ) : (
            <span className="text-secondary-400 w-8 text-center text-2xl font-bold">-</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <span className="text-secondary-900 font-semibold">{match.away_team}</span>
          {isCompleted || match.away_score !== null ? (
            <span className="text-secondary-900 w-8 text-center text-2xl font-bold">
              {match.away_score}
            </span>
          ) : (
            <span className="text-secondary-400 w-8 text-center text-2xl font-bold">-</span>
          )}
        </div>
      </div>

      {/* User Prediction */}
      {showPrediction && userPrediction && (
        <div className="border-secondary-200 mt-3 border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-600">Your prediction:</span>
            <div className="flex items-center gap-2">
              <span className="text-secondary-900 font-medium">
                {userPrediction.predicted_home_score} - {userPrediction.predicted_away_score}
              </span>
              {userPrediction.points_earned !== null &&
                userPrediction.points_earned !== undefined && (
                  <Badge
                    variant={userPrediction.points_earned > 0 ? 'success' : 'default'}
                    size="sm"
                  >
                    {userPrediction.points_earned} pts
                  </Badge>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
