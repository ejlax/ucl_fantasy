/**
 * Tournament bracket component with two-leg tie support
 * Displays UCL knockout stage with aggregate scoring
 */

import { useMemo, useState } from 'react';
import type { Match } from '@/types/database';
import { groupMatchesIntoTies, type Tie, getLegScoreText } from '@/utils/tieUtils';
import { SimplifiedDynamicCard } from '@/components/design/matchup/SimplifiedDynamicCard';
import { formatRoundName } from '@/utils/formatting';
import { formatDate } from '@/utils/dateUtils';
import { MatchDetailsModal } from './MatchDetailsModal';

interface TournamentBracketProps {
  matches: Match[];
}

/**
 * Main tournament bracket component
 * Groups matches into two-leg ties and displays them by round
 */
export function TournamentBracket({ matches }: TournamentBracketProps) {
  const [selectedTie, setSelectedTie] = useState<Tie | null>(null);

  // Group matches into ties with aggregate scoring
  const tiesByRound = useMemo(() => {
    const ties = groupMatchesIntoTies(matches);

    // Group by round
    const grouped: Record<string, Tie[]> = {};
    ties.forEach((tie) => {
      if (!grouped[tie.round]) {
        grouped[tie.round] = [];
      }
      grouped[tie.round].push(tie);
    });

    // Sort each round by date
    Object.keys(grouped).forEach((round) => {
      grouped[round].sort(
        (a, b) => new Date(a.firstLegDate).getTime() - new Date(b.firstLegDate).getTime()
      );
    });

    // Return in round order
    const roundOrder = ['PLAYOFF', 'R16', 'QF', 'SF', 'FINAL'];
    return roundOrder
      .filter((round) => grouped[round])
      .map((round) => ({
        round,
        title: formatRoundName(round),
        ties: grouped[round],
      }));
  }, [matches]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="space-y-8">
        {tiesByRound.map(({ round, title, ties }) => (
          <div key={round} className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            {/* Round Header */}
            <div className="mb-6 text-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">
                {title}
              </h2>
              {ties[0] && (
                <p className="text-xs text-slate-400 font-medium">
                  {formatDate(new Date(ties[0].firstLegDate), 'MMM d, yyyy')}
                  {ties[0].secondLegDate && (
                    <> & {formatDate(new Date(ties[0].secondLegDate), 'MMM d, yyyy')}</>
                  )}
                </p>
              )}
              <div className="mt-4 h-0.5 w-full bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            </div>

            {round === 'FINAL' ? (
              // Final is centered and larger
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  {ties.map((tie) => {
                    const leg1Score = getLegScoreText(tie.leg1Match);
                    const leg2Score = tie.leg2Match ? getLegScoreText(tie.leg2Match) : '0-0';
                    const leg1Date = formatDate(new Date(tie.firstLegDate), 'MMM d');
                    const leg2Date = tie.secondLegDate ? formatDate(new Date(tie.secondLegDate), 'MMM d') : '';

                    return (
                      <div key={tie.id} onClick={() => setSelectedTie(tie)}>
                        <SimplifiedDynamicCard
                          homeTeam={{
                            name: tie.team1,
                            score: tie.team1AggregateScore,
                            isWinner: tie.winner === tie.team1,
                          }}
                          awayTeam={{
                            name: tie.team2,
                            score: tie.team2AggregateScore,
                            isWinner: tie.winner === tie.team2,
                          }}
                          leg1Date={leg1Date}
                          leg2Date={leg2Date}
                          leg1Score={leg1Score}
                          leg2Score={leg2Score}
                          status={tie.isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Other rounds in responsive grid
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {ties.map((tie) => {
                  const leg1Score = getLegScoreText(tie.leg1Match);
                  const leg2Score = tie.leg2Match ? getLegScoreText(tie.leg2Match) : '0-0';
                  const leg1Date = formatDate(new Date(tie.firstLegDate), 'MMM d');
                  const leg2Date = tie.secondLegDate ? formatDate(new Date(tie.secondLegDate), 'MMM d') : '';

                  return (
                    <div key={tie.id} onClick={() => setSelectedTie(tie)}>
                      <SimplifiedDynamicCard
                        homeTeam={{
                          name: tie.team1,
                          score: tie.team1AggregateScore,
                          isWinner: tie.winner === tie.team1,
                        }}
                        awayTeam={{
                          name: tie.team2,
                          score: tie.team2AggregateScore,
                          isWinner: tie.winner === tie.team2,
                        }}
                        leg1Date={leg1Date}
                        leg2Date={leg2Date}
                        leg1Score={leg1Score}
                        leg2Score={leg2Score}
                        status={tie.isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Match Details Modal */}
      {selectedTie && selectedTie.leg1Match && (
        <MatchDetailsModal
          match={selectedTie.leg1Match}
          secondLegMatch={selectedTie.leg2Match}
          isOpen={!!selectedTie}
          onClose={() => setSelectedTie(null)}
        />
      )}
    </div>
  );
}
