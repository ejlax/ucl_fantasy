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
import { useESPNLiveMatches } from '@/hooks/useESPNMatches';
import { useLiveMatchUpdates } from '@/hooks/useRealtimeMatches';

interface TournamentBracketProps {
  matches: Match[];
}

/**
 * Main tournament bracket component
 * Groups matches into two-leg ties and displays them by round
 */
export function TournamentBracket({ matches }: TournamentBracketProps) {
  const [selectedTie, setSelectedTie] = useState<Tie | null>(null);
  const { data: espnLiveMatches } = useESPNLiveMatches();

  // Enable real-time updates
  useLiveMatchUpdates();

  // Helper function to check if a tie has a live match and calculate live aggregate scores
  const getTieLiveStatus = (tie: Tie) => {
    if (!espnLiveMatches || tie.isCompleted) {
      return {
        isLive: false,
        clock: undefined,
        team1LiveScore: tie.team1AggregateScore,
        team2LiveScore: tie.team2AggregateScore
      };
    }

    // Check if either leg is live
    const checkMatch = (match: Match | null) => {
      if (!match) return null;
      return espnLiveMatches.find((em) => {
        const homeMatch = em.homeTeam.displayName === match.home_team ||
          em.homeTeam.name === match.home_team ||
          em.homeTeam.displayName.includes(match.home_team) ||
          match.home_team.includes(em.homeTeam.displayName);
        const awayMatch = em.awayTeam.displayName === match.away_team ||
          em.awayTeam.name === match.away_team ||
          em.awayTeam.displayName.includes(match.away_team) ||
          match.away_team.includes(em.awayTeam.displayName);
        return homeMatch && awayMatch;
      });
    };

    const leg1Live = checkMatch(tie.leg1Match);
    const leg2Live = checkMatch(tie.leg2Match);
    const liveMatch = leg1Live || leg2Live;

    // Calculate live aggregate scores
    let team1LiveScore = tie.team1AggregateScore;
    let team2LiveScore = tie.team2AggregateScore;

    if (liveMatch) {
      // Determine which team is which in the live match
      const leg1Match = tie.leg1Match;
      const leg2Match = tie.leg2Match;

      if (leg1Live && leg1Match) {
        // Leg 1 is live - use live scores for leg 1, database scores for leg 2
        const isTeam1Home = leg1Match.home_team === tie.team1;
        const leg1Team1Score = Number(isTeam1Home ? leg1Live.homeTeam.score : leg1Live.awayTeam.score) || 0;
        const leg1Team2Score = Number(isTeam1Home ? leg1Live.awayTeam.score : leg1Live.homeTeam.score) || 0;

        const leg2Team1Score = leg2Match ? (Number(leg2Match.home_team === tie.team1 ? leg2Match.home_score : leg2Match.away_score) || 0) : 0;
        const leg2Team2Score = leg2Match ? (Number(leg2Match.home_team === tie.team2 ? leg2Match.home_score : leg2Match.away_score) || 0) : 0;

        team1LiveScore = leg1Team1Score + leg2Team1Score;
        team2LiveScore = leg1Team2Score + leg2Team2Score;
      } else if (leg2Live && leg2Match) {
        // Leg 2 is live - use database scores for leg 1, live scores for leg 2
        const isTeam1Home = leg2Match.home_team === tie.team1;
        const leg2Team1Score = Number(isTeam1Home ? leg2Live.homeTeam.score : leg2Live.awayTeam.score) || 0;
        const leg2Team2Score = Number(isTeam1Home ? leg2Live.awayTeam.score : leg2Live.homeTeam.score) || 0;

        const leg1Team1Score = leg1Match ? (Number(leg1Match.home_team === tie.team1 ? leg1Match.home_score : leg1Match.away_score) || 0) : 0;
        const leg1Team2Score = leg1Match ? (Number(leg1Match.home_team === tie.team2 ? leg1Match.home_score : leg1Match.away_score) || 0) : 0;

        team1LiveScore = leg1Team1Score + leg2Team1Score;
        team2LiveScore = leg1Team2Score + leg2Team2Score;
      }
    }

    return {
      isLive: !!liveMatch,
      clock: liveMatch?.status.displayClock,
      team1LiveScore,
      team2LiveScore
    };
  };

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
                    const { isLive, clock, team1LiveScore, team2LiveScore } = getTieLiveStatus(tie);

                    return (
                      <div key={tie.id} onClick={() => setSelectedTie(tie)}>
                        <SimplifiedDynamicCard
                          homeTeam={{
                            name: tie.team1,
                            score: team1LiveScore,
                            isWinner: tie.winner === tie.team1,
                          }}
                          awayTeam={{
                            name: tie.team2,
                            score: team2LiveScore,
                            isWinner: tie.winner === tie.team2,
                          }}
                          leg1Date={leg1Date}
                          leg2Date={leg2Date}
                          leg1Score={leg1Score}
                          leg2Score={leg2Score}
                          status={tie.isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                          isLive={isLive}
                          liveClock={clock}
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
                  const { isLive, clock, team1LiveScore, team2LiveScore } = getTieLiveStatus(tie);

                  return (
                    <div key={tie.id} onClick={() => setSelectedTie(tie)}>
                      <SimplifiedDynamicCard
                        homeTeam={{
                          name: tie.team1,
                          score: team1LiveScore,
                          isWinner: tie.winner === tie.team1,
                        }}
                        awayTeam={{
                          name: tie.team2,
                          score: team2LiveScore,
                          isWinner: tie.winner === tie.team2,
                        }}
                        leg1Date={leg1Date}
                        leg2Date={leg2Date}
                        leg1Score={leg1Score}
                        leg2Score={leg2Score}
                        status={tie.isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                        isLive={isLive}
                        liveClock={clock}
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
