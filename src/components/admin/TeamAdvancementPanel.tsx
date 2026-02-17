/**
 * Team Advancement Panel
 * Admin interface for advancing teams to the next round
 */

import { useState } from 'react';
import { useIsRoundComplete, useRoundWinners, useTBDMatches, useAdvanceTeam } from '@/hooks/useTeamAdvancement';
import { CheckCircle2, XCircle, ArrowRight, Trophy, AlertCircle } from 'lucide-react';

const ROUNDS = [
  { value: 'PLAYOFF', label: 'Knockout Phase Play-offs', next: 'R16' },
  { value: 'R16', label: 'Round of 16', next: 'QF' },
  { value: 'QF', label: 'Quarter Finals', next: 'SF' },
  { value: 'SF', label: 'Semi Finals', next: 'FINAL' },
];

export function TeamAdvancementPanel() {
  const [selectedRound, setSelectedRound] = useState('PLAYOFF');
  const [selectedNextRound, setSelectedNextRound] = useState('R16');

  const { data: isComplete, isLoading: checkingComplete } = useIsRoundComplete(selectedRound);
  const { data: winners, isLoading: loadingWinners } = useRoundWinners(selectedRound);
  const { data: tbdMatches, isLoading: loadingTBD } = useTBDMatches(selectedNextRound);
  const advanceTeam = useAdvanceTeam();

  const handleRoundChange = (round: string) => {
    setSelectedRound(round);
    const roundData = ROUNDS.find((r) => r.value === round);
    if (roundData) {
      setSelectedNextRound(roundData.next);
    }
  };

  const handleAdvanceTeam = async (matchId: string, team: string, position: 'home' | 'away') => {
    try {
      await advanceTeam.mutateAsync({ matchId, team, position });
    } catch (error) {
      console.error('Failed to advance team:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Team Advancement</h2>
          <p className="text-sm text-slate-400">Advance winning teams to the next round</p>
        </div>
      </div>

      {/* Round Selector */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <label className="mb-2 block text-sm font-medium text-slate-300">Select Completed Round</label>
        <select
          value={selectedRound}
          onChange={(e) => handleRoundChange(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
        >
          {ROUNDS.map((round) => (
            <option key={round.value} value={round.value}>
              {round.label}
            </option>
          ))}
        </select>
      </div>

      {/* Round Status */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Round Status</h3>
        
        {checkingComplete ? (
          <p className="text-slate-400">Checking round status...</p>
        ) : (
          <div className="flex items-center gap-3">
            {isComplete ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <span className="text-green-400 font-medium">Round Complete - Ready to advance teams</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Round Incomplete - Some matches still pending</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Winners List */}
      {isComplete && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Winners Advancing to {ROUNDS.find((r) => r.value === selectedRound)?.next}
          </h3>
          
          {loadingWinners ? (
            <p className="text-slate-400">Loading winners...</p>
          ) : winners && winners.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {winners.map((team, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-center"
                >
                  <p className="font-semibold text-white">{team}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No winners yet</p>
          )}
        </div>
      )}

      {/* TBD Matches in Next Round */}
      {isComplete && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Matches to Update in {ROUNDS.find((r) => r.value === selectedRound)?.next}
          </h3>
          
          {loadingTBD ? (
            <p className="text-slate-400">Loading matches...</p>
          ) : tbdMatches && tbdMatches.length > 0 ? (
            <div className="space-y-3">
              {tbdMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-lg border border-slate-600 bg-slate-700/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-slate-400">
                        {new Date(match.match_date).toLocaleDateString()}
                      </p>
                      <p className="font-medium text-white">
                        {match.home_team} vs {match.away_team}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <p>All matches have been updated!</p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">How to advance teams:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-300">
              <li>Wait for all matches in a round to complete</li>
              <li>Winners will be automatically determined by aggregate score</li>
              <li>Use the admin panel to manually update TBD matches with winning teams</li>
              <li>Or use the ESPN Teams API to fetch and update team information</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

