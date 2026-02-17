import { StandingsEntry } from '@/types/database';
import { Trophy, Medal, Award } from 'lucide-react';

interface StandingsTableProps {
  standings: StandingsEntry[];
  currentUserId?: string;
}

/**
 * Standings table component for displaying league leaderboard
 */
export function StandingsTable({ standings, currentUserId }: StandingsTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-secondary-100 text-secondary-800 border-secondary-300';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-secondary-300 border-b-2">
            <th className="text-secondary-900 px-4 py-3 text-left text-sm font-semibold">Rank</th>
            <th className="text-secondary-900 px-4 py-3 text-left text-sm font-semibold">Player</th>
            <th className="text-secondary-900 px-4 py-3 text-center text-sm font-semibold">
              Points
            </th>
            <th className="text-secondary-900 px-4 py-3 text-center text-sm font-semibold">
              Exact
            </th>
            <th className="text-secondary-900 px-4 py-3 text-center text-sm font-semibold">
              Correct
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId;
            const icon = getRankIcon(entry.rank);

            return (
              <tr
                key={entry.user_id}
                className={`border-secondary-200 border-b transition-colors ${isCurrentUser ? 'bg-primary-50' : 'hover:bg-secondary-50'} `}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {icon || (
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${getRankBadgeColor(entry.rank)} `}
                      >
                        {entry.rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${isCurrentUser ? 'text-primary-700' : 'text-secondary-900'}`}
                    >
                      {entry.user.display_name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-primary-600 text-xs font-medium">(You)</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary-900 text-lg font-bold">{entry.total_points}</span>
                </td>
                <td className="text-secondary-600 px-4 py-3 text-center">
                  {entry.exact_score_predictions}
                </td>
                <td className="text-secondary-600 px-4 py-3 text-center">
                  {entry.correct_predictions}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {standings.length === 0 && (
        <div className="text-secondary-500 py-12 text-center">No standings data available yet</div>
      )}
    </div>
  );
}
