/**
 * Traditional bracket tree view with connecting lines
 * Shows tournament progression from Playoff to Final
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import type { Match } from '@/types/database';
import { groupMatchesIntoTies, type Tie } from '@/utils/tieUtils';
import { formatRoundName } from '@/utils/formatting';
import { Trophy, Shield, Radio } from 'lucide-react';
import { MatchDetailsModal } from './MatchDetailsModal';
import { getTeamLogo } from '@/utils/teamLogos';
import { useESPNLiveMatches } from '@/hooks/useESPNMatches';
import { useLiveMatchUpdates } from '@/hooks/useRealtimeMatches';

interface BracketTreeViewProps {
  matches: Match[];
}

export function BracketTreeView({ matches }: BracketTreeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiePositions, setTiePositions] = useState<Map<string, DOMRect>>(new Map());
  const [selectedTie, setSelectedTie] = useState<Tie | null>(null);
  const { data: espnLiveMatches } = useESPNLiveMatches();

  // Enable real-time updates
  useLiveMatchUpdates();

  // Group matches into ties
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

    return grouped;
  }, [matches]);

  // Calculate positions for SVG lines
  useEffect(() => {
    if (!containerRef.current) return;

    const positions = new Map<string, DOMRect>();
    const tieElements = containerRef.current.querySelectorAll('[data-tie-id]');

    tieElements.forEach((element) => {
      const tieId = element.getAttribute('data-tie-id');
      if (tieId) {
        positions.set(tieId, element.getBoundingClientRect());
      }
    });

    setTiePositions(positions);
  }, [tiesByRound]);

  const renderTieCard = (tie: Tie, isCompact: boolean = false) => {
    const team1IsWinner = tie.winner === tie.team1;
    const team2IsWinner = tie.winner === tie.team2;
    const isFinal = tie.round === 'FINAL';
    const team1Logo = getTeamLogo(tie.team1);
    const team2Logo = getTeamLogo(tie.team2);

    // Check if tie is live
    const checkMatch = (match: Match | null) => {
      if (!match || !espnLiveMatches) return null;
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
    const isLive = !!liveMatch;
    const liveClock = liveMatch?.status.displayClock;

    // Calculate live aggregate scores
    let team1LiveScore = tie.team1AggregateScore;
    let team2LiveScore = tie.team2AggregateScore;

    if (liveMatch) {
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

    return (
      <div
        key={tie.id}
        data-tie-id={tie.id}
        onClick={() => setSelectedTie(tie)}
        className={`rounded-xl bg-white cursor-pointer overflow-hidden transition-all hover:shadow-lg ${isLive
          ? 'border-2 border-green-500/60 shadow-green-100'
          : 'border-2 border-gray-300'
          } hover:border-gray-400 ${isCompact ? 'text-sm' : 'text-base'}`}
        style={{ minWidth: isCompact ? '180px' : '220px' }}
      >
        {/* Match header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-center">
          {isLive ? (
            <div className="flex items-center justify-center gap-1.5">
              <Radio size={14} className="text-green-600 animate-pulse" />
              <span className="text-sm font-medium text-green-600">
                LIVE {liveClock && `• ${liveClock}`}
              </span>
            </div>
          ) : isFinal ? (
            <div className="flex items-center justify-center gap-1.5">
              <Trophy size={14} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Final</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-600">Aggregate</span>
          )}
        </div>

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between border-b border-gray-100 px-4 py-3 ${team1IsWinner ? 'bg-blue-50/30' : 'bg-white'
            }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 p-0.5 flex-shrink-0">
              {team1Logo ? (
                <img src={team1Logo} alt={tie.team1} className="w-full h-full object-contain" />
              ) : (
                <Shield className="w-3 h-3 text-slate-300" />
              )}
            </div>
            <span
              className={`truncate ${team1IsWinner ? 'font-bold text-gray-900' : 'font-normal text-gray-700'}`}
            >
              {tie.team1}
            </span>
          </div>
          <span className={`ml-3 text-lg font-bold tabular-nums ${team1IsWinner ? 'text-blue-600' : isLive ? 'text-green-600' : 'text-gray-400'}`}>
            {isLive || tie.isCompleted ? team1LiveScore : '-'}
          </span>
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between px-4 py-3 ${team2IsWinner ? 'bg-blue-50/30' : 'bg-white'
            }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 p-0.5 flex-shrink-0">
              {team2Logo ? (
                <img src={team2Logo} alt={tie.team2} className="w-full h-full object-contain" />
              ) : (
                <Shield className="w-3 h-3 text-slate-300" />
              )}
            </div>
            <span
              className={`truncate ${team2IsWinner ? 'font-bold text-gray-900' : 'font-normal text-gray-700'}`}
            >
              {tie.team2}
            </span>
          </div>
          <span className={`ml-3 text-lg font-bold tabular-nums ${team2IsWinner ? 'text-blue-600' : isLive ? 'text-green-600' : 'text-gray-400'}`}>
            {isLive || tie.isCompleted ? team2LiveScore : '-'}
          </span>
        </div>
      </div>
    );
  };

  // Render SVG connecting lines
  const renderConnectors = () => {
    if (tiePositions.size === 0 || !containerRef.current) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const lines: JSX.Element[] = [];

    // Helper to draw line from one tie to another
    const drawLine = (fromTieId: string, toTieId: string, key: string) => {
      const fromRect = tiePositions.get(fromTieId);
      const toRect = tiePositions.get(toTieId);

      if (!fromRect || !toRect) return;

      // Calculate relative positions
      const x1 = fromRect.right - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      // Create curved path
      const midX = (x1 + x2) / 2;
      const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

      lines.push(
        <path
          key={key}
          d={path}
          stroke="#cbd5e1"
          strokeWidth="2"
          fill="none"
          className="transition-all"
        />
      );
    };

    // Draw connections based on bracket logic
    // For now, we'll draw simple connections between rounds
    // In a real implementation, you'd track which team advances

    return (
      <svg
        className="pointer-events-none absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      >
        {lines}
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-white p-8 shadow-sm border border-gray-100">
      <div ref={containerRef} className="relative flex min-w-max gap-12">
        {renderConnectors()}
        {/* Playoff Round */}
        {tiesByRound['PLAYOFF'] && (
          <div className="flex min-w-[220px] flex-col gap-6">
            <h3 className="text-center text-xs font-black tracking-widest text-gray-500 uppercase">
              {formatRoundName('PLAYOFF')}
            </h3>
            <div className="flex flex-col gap-4">
              {tiesByRound['PLAYOFF'].map((tie) => renderTieCard(tie, true))}
            </div>
          </div>
        )}

        {/* Round of 16 */}
        {tiesByRound['R16'] && (
          <div className="flex min-w-[220px] flex-col gap-6">
            <h3 className="text-center text-xs font-black tracking-widest text-gray-500 uppercase">
              {formatRoundName('R16')}
            </h3>
            <div className="flex flex-col gap-4">
              {tiesByRound['R16'].map((tie) => renderTieCard(tie, true))}
            </div>
          </div>
        )}

        {/* Quarter Finals */}
        {tiesByRound['QF'] && (
          <div className="flex min-w-[240px] flex-col gap-6">
            <h3 className="text-center text-xs font-black tracking-widest text-gray-500 uppercase">
              {formatRoundName('QF')}
            </h3>
            <div className="flex flex-col gap-5">
              {tiesByRound['QF'].map((tie) => renderTieCard(tie))}
            </div>
          </div>
        )}

        {/* Semi Finals */}
        {tiesByRound['SF'] && (
          <div className="flex min-w-[240px] flex-col gap-6">
            <h3 className="text-center text-xs font-black tracking-widest text-gray-500 uppercase">
              {formatRoundName('SF')}
            </h3>
            <div className="flex flex-col gap-8">
              {tiesByRound['SF'].map((tie) => renderTieCard(tie))}
            </div>
          </div>
        )}

        {/* Final */}
        {tiesByRound['FINAL'] && (
          <div className="flex min-w-[260px] flex-col gap-6">
            <h3 className="text-center text-xs font-black tracking-widest text-gray-500 uppercase">
              {formatRoundName('FINAL')}
            </h3>
            <div className="flex h-full items-center justify-center">
              {tiesByRound['FINAL'].map((tie) => (
                <div key={tie.id} className="w-full max-w-sm">
                  {renderTieCard(tie)}
                </div>
              ))}
            </div>
          </div>
        )}
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
